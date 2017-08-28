let Coloc = function(callback) {
    let remote = require('electron').remote;
    this.fs = require('fs');
    this.ROOT = remote.getGlobal('APP_DIR');
    this.USERDATA = remote.getGlobal('DATA_DIR');
    console.log(this.ROOT);
    this.database_dir = this.USERDATA + "/db/";
    this.config_dir = this.USERDATA + "/cfg/";
    this.LANG_DIR = this.ROOT + "/lang";
    this.DB_NAME = this.database_dir + "default.db";
    this.CFG = this.config_dir + "default.cfg";
    this.lang = "English";
    this.colorRows = false;
    this.langArray = new Array();
    this.users = new Array();
    this.types = new Array();
    this.database = new Array();
    this.list = { th : $("#ListTableH"), tb : $("#ListTableB") };
    this.modal = $("#modal");
    this.credits;
    this.creditsPanel = $("#creditsPanel");
    $("#loading-bar").text("Init");
    $("#loading-bar").animate({ "width" : "50%" }, 50);

    this.initDir();
    this.readData();
    this.buildStyles();
    this.refresh();
    this.bindWindow();

    $("#loading-bar").animate({ "width" : "100%" }, 50, () => { callback(); });

};

// Builders

Coloc.prototype.buildPdf = function(callback = null)
{

    let obj = this;

    let columns = [];
    let rows = [];

    let Globalcolumns = [ obj._("_Flatmates"), obj._("_Total") ];
    let Globalrows = obj.users.map((e) => { return [ e, obj.credits[e] ]; });
    console.log(Globalrows);

    columns.push("#");
    columns.push(obj._("_Date"));
    columns.push(obj._("_Type"));
    for(let i = 0; i < obj.users.length; i++) {
        columns.push(obj.users[i] + " Part");
        columns.push(obj.users[i] + " Payed");
    }
    columns.push(obj._("_Total"));
    columns.push(obj._("_Comments"));

    for(let i = 0; i < obj.database.length; i++) {

        let tr = [];
        let d = obj.database[i];
        tr.push(i);
        tr.push(d.date);
        tr.push(d.type);
        $(obj.users).each(function() {

            if(!d.users[this] || (d.users[this] && !d.users[this].participate)) {
                tr.push("N/A");
                tr.push("N/A");
            } else {

                if(d.users[this].part || d.users[this].realPayed) {
                    tr.push(d.users[this].part);
                    tr.push(d.users[this].realPayed);

                } else {
                    tr.push("-/-");
                    tr.push("-/-");
                }
            }
        });
        tr.push(d.total);
        tr.push(d.coms);
        rows.push(tr);
    }

    var doc = new jsPDF({ orientation : 'l', unit : 'pt', format : 'a4' });
    doc.text("ColoCalc - " + obj._("_Summary"), 40, 30);
    doc.text(new Date().toDateString(), 40, 50);
    doc.autoTable(Globalcolumns, Globalrows, {
        styles : {
                   cellPadding : 8, // a number, array or object (see margin below)
                   fontSize : 16,
                   halign : 'left',
                   overflow : 'linebreak', // visible, hidden, ellipsize or linebreak // left, center, right
                 },
        showHeader : 'firstPage',
        theme : 'grid',
        tableWidth : "auto",
        startY : 120,
        margin : 120

    });
    doc.addPage();
    doc.text("ColoCalc - " + obj._("_Details"), 40, 30);
    doc.text(new Date().toDateString(), 40, 50);
    let i = 1;
    doc.autoTable(columns, rows, {
        styles : {
                   cellPadding : 4, // a number, array or object (see margin below)
                   fontSize : 7,
                   halign : 'left',
                   overflow : 'linebreak', // visible, hidden, ellipsize or linebreak // left, center, right
                 },
        showHeader : 'firstPage',
        theme : 'grid',
        tableWidth : "auto",
        startY : 60,
        margin : 20,
        addPageContent : function(data) {
            doc.setFontSize(7);
            doc.text("Page :" + i, 780, 585);
            i = i + 1;
        }

    });

    doc.save('table.pdf');
};

Coloc.prototype.buildStyles = function() {
    let obj = this;
    obj.Styles = Array();
    for(let i = 0; i < obj.types.length; i++) {
        obj.Styles[obj.types[i]] = "St-" + (i % 7);
    }

};

Coloc.prototype._ = function(index) {

    if(this.langArray[index])
        return this.langArray[index];
    else
        return index;
};

Coloc.prototype.initDir = function() {

    let coloc = this;

    try {
        let s = coloc.fs.accessSync(coloc.USERDATA, coloc.fs.F_OK);
    } catch(e) {

        coloc.fs.mkdir(coloc.USERDATA);
        coloc.fs.mkdir(coloc.database_dir);
        coloc.fs.mkdir(coloc.config_dir);

        coloc.fs.writeFileSync(coloc.DB_NAME, JSON.stringify(new Array()), "UTF-8");
        coloc.fs.writeFileSync(
            coloc.CFG, '{ "USERS" : [], "TYPES" : [] ,"LANG":"English", "COLOR_ROWS": false}', "UTF-8");
    }

    try {
        coloc.fs.accessSync(coloc.database_dir, coloc.fs.F_OK);
    } catch(e) {
        coloc.fs.mkdir(coloc.database_dir);
        coloc.fs.writeFileSync(coloc.DB_NAME);
    }

    try {
        coloc.fs.accessSync(coloc.config_dir, coloc.fs.F_OK);
    } catch(e) {
        coloc.fs.mkdir(coloc.config_dir);
        coloc.fs.writeFileSync(
            coloc.CFG, '{ "USERS" : [], "TYPES" : [] ,"LANG":"English", "COLOR_ROWS": false}', "UTF-8");
    }

    try {
        coloc.fs.accessSync(coloc.DB_NAME, coloc.fs.F_OK);
    } catch(e) {
        coloc.fs.writeFileSync(coloc.DB_NAME, JSON.stringify(new Array()), "UTF-8");
    }

    try {
        coloc.fs.accessSync(coloc.CFG, coloc.fs.F_OK);
    } catch(e) {
        coloc.fs.writeFileSync(
            coloc.CFG, '{ "USERS" : [], "TYPES" : [] ,"LANG":"English", "COLOR_ROWS": false}', "UTF-8");
    }

};

Coloc.prototype.resetDB = function() {

    this.database = new Array();

    this.refresh();

};

Coloc.prototype.resetCredit = function() {
    let inst = this;
    $(inst.database).each(function() {
        let elem = this.users;
        $(inst.users).each(function() { elem[this].realPayed = elem[this].part; });

    });
    this.refresh();

};

Coloc.prototype.buildList = function() {

    let elem = "<tr><th><i class='fa fa-key'></i></th>";
    elem += "<th>" + this._("_Date") + "</th>";
    elem += "<th>" + this._("_Type") + "</th>";
    elem += "<th>" + this._("_Comments") + "</th>";
    elem += "<th>" + this._("_Total") + "</th>";
    elem += "</tr>";
    $(this.list.th).html(elem);

};

Coloc.prototype.buildDepotForm = function() {

    let modal = this.modal;
    let elem;
    $(this.modal).find("#close").show();
    $(this.modal).find("#save").show();
    $(modal).find("#title").text(this._("_Deposit"));
    $(modal).find(".modal-body").empty();

    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="date"><i class="fa fa-calendar"></i>  ' + this._("_Date") + '</label>' +
           '</div>' +
           '<div class="col-sm-9">' +
           '<input type="date" id="date" class="form-control" value="' + new Date().toISOString().substring(0, 10) +
           '"> ' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);

    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="total"><i class="fa fa-eur"></i>  ' + this._("_Total") + '</label>' +
           '</div>' +
           '<div class="col-sm-9">' +
           '<input type="number" id="total" placeholder="Exemple 80" class="form-control"> ' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);
    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="coms"><i class="fa fa-commenting-o" aria-hidden="true"></i>  ' + this._("_Comments") +
           '</label>' +
           '</div>' +
           '<div class="col-sm-9">' +
           '<textarea id="coms" class="form-control"> </textarea>' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);

    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="from"><i class="fa fa-ticket"></i>  ' + this._("_I deposit") + '</label>' +
           '</div>' +
           '<div class="col-sm-9">' +
           ' <select class="form-control" id="from">';
    $(this.users).each(function(){ elem += '<option value="' + this + '">' + this });
    elem += '</select>' +
            '</div>' +
            '</div>';

    $(modal).find(".modal-body").append(elem);

    tb = $("<tbody>");
    $(this.users).each(function() {

        elem = '<tr>' +
               '<td><i class="fa fa-user"></i>  ' + this + ' </td>' +
               '<td>' +
               '<input class="form-check-input participate" type="checkbox" id="' + this + '">' +
               '</td>' +
               '</tr>';
        $(tb).append(elem);

    });

    t = $('<table class="small table-condensed table table-hover">');
    th = $("<thead>");
    elem = $("<tr>");
    $(elem).append("<th>" + this._("_Flatmates") + "</th>");
    $(elem).append("<th>" + this._("_Concerned") + "</th>");
    $(th).append(elem);
    $(t).append(th);
    $(t).append(tb);
    $(modal).find(".modal-body").append(t);
    elem = "<input type='hidden' id='id' value='-1'>";
    $(modal).find(".modal-body").append(elem);

};

Coloc.prototype.buildAddForm = function() {

    let modal = this.modal;
    let elem;
    $(this.modal).find("#close").show();
    $(this.modal).find("#save").show();
    $(modal).find("#title").text(this._("_Add"));
    $(modal).find(".modal-body").empty();

    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="total"><i class="fa fa-calendar"></i>  ' + this._("_Date") + '</label>' +
           '</div>' +
           '<div class="col-sm-9">' +
           '<input type="date" id="date" class="form-control" value="' + new Date().toISOString().substring(0, 10) +
           '"> ' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);

    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="total"><i class="fa fa-ticket"></i>  ' + this._("_Type") + '</label>' +
           '</div>' +
           '<div class="col-sm-9">' +
           ' <select class="form-control" id="type">';
    $(this.types).each(function(){ elem += '<option value="' + this + '">' + this });
    elem += '</select>' +
            '</div>' +
            '</div>';
    $(modal).find(".modal-body").append(elem);

    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="total"><i class="fa fa-eur"></i>  ' + this._("_Total") + '</label>' +
           '</div>' +
           '<div class="col-sm-9">' +
           '<input type="number" id="total" placeholder="' + this._("_Exemple 80") + '" class="form-control"> ' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);
    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="coms"><i class="fa fa-commenting-o" aria-hidden="true"></i>  ' + this._("_Comments") +
           '</label>' +
           '</div>' +
           '<div class="col-sm-9">' +
           '<textarea id="coms" class="form-control"> </textarea>' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);
    tb = $("<tbody>");
    $(this.users).each(function() {

        elem = '<tr>' +
               '<td><i class="fa fa-user"></i>  ' + this + ' </td>' +
               '<td>' +
               '<input class="form-check-input participate" type="checkbox" id="' + this + '">' +
               '</td>' +
               '<td>' +
               '<input class="form-check-input payed" type="checkbox" id="' + this + '">' +
               '</td>' +
               '<td>' +
               '<input class="form-control realPayed" style="width: 90%;display:inline" value="0" type="number" id="' +
               this + '"> <i class="fa fa-eur"></i>  ' +
               '</td>' +
               '</tr>';
        $(tb).append(elem);

    });

    t = $('<table class="small  table-condensed table table-hover">');
    th = $("<thead>");
    elem = $("<tr>");
    $(elem).append("<th>" + this._("_Flatmates") + "</th>");
    $(elem).append("<th>" + this._("_Concerned") + "</th>");
    $(elem).append("<th>" + this._("_I already payed") + "</th>");
    $(elem).append("<th>" + this._("_This part") + "</th>");
    $(th).append(elem);
    $(t).append(th);
    $(t).append(tb);
    $(modal).find(".modal-body").append(t);

    elem = "<input type='hidden' id='id' value='-1'>";
    $(modal).find(".modal-body").append(elem);

};

Coloc.prototype.buildConfigForm = function() {

    let modal = this.modal;
    let coloc = this;
    let elem;
    $(modal).find("#title").html(this._("_Configuration"));
    $(modal).find(".modal-body").empty();
    $(this.modal).find("#close").show();
    $(this.modal).find("#save").show();
    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="total"><i class="fa fa-language"></i> ' + this._("_Language") + '</label>' +
           '</div>' +
           '<div class="col-sm-9">' +
           '<select class="form-control" id="lang">';

    let langs =
        this.fs.readdirSync(coloc.LANG_DIR).filter(file => this.fs.lstatSync(this.LANG_DIR + "/" + file).isFile());

    for(let i in langs) {
        let lang = langs[i].replace(".json", "");
        elem += "<option value='" + lang + "' ";
        if(lang === coloc.lang) {
            elem += " selected";
        }
        elem += ">" + lang + "</option>";
    }
    elem += "</select></div></div>";

    $(modal).find(".modal-body").append(elem);

    elem = '<div class="form-group row  ">' +
           '<div class="col-sm-3">' +
           '<label for="colorrows"><i class="fa fa-paint-brush"></i> ' + this._("_Color Rows") + '</label>' +
           '</div>' +
           '<div class="col-sm-9 btn-group" data-toggle="buttons">' +
           '<label class="btn btn-default ';
    if(coloc.colorRows === true) {
        elem += ' active'
    }
    elem += '" id="colorrows">' +
            '<input type="checkbox" autocomplete="off" ';

    if(coloc.colorRows === true) {
        elem += ' checked';
    }
    elem += '>' +
            '<i class="toggle-yes fa fa-check"></i>' +
            '<i class="toggle-no fa fa-times"></i>' +
            '</label>' +
            '</div></div>';
    $(modal).find(".modal-body").append(elem);

    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="total"><i class="fa fa-ticket"></i> ' + this._("_Type") + '</label>' +
           '</div>' +
           '<div class="col-sm-9">';
    $(this.types).each(function(key, value) {
        elem += '<div class="form-group row">';
        elem += '<div class="col-sm-9"><input type="text" value="' + value + '" class="form-control type"></div>';
        elem +=
            '<div class="col-sm-3"><bouton class="btn btn-danger" onclick="$(this).parent().parent().remove()"><i class="fa fa-trash-o"></i></bouton></div>';
        elem += '</div>'
    });
    elem += '<div class="row">';
    elem += '<div class="col-sm-12"><bouton class="btn btn-success" id="addType"><i class="fa fa-plus"></i> ' +
            this._("_Add") + '</bouton></div>';
    elem += '</div></div></div>';

    $(modal).find(".modal-body").append(elem);
    elem = '<div class="form-group row">' +
           '<div class="col-sm-3">' +
           '<label for="total"><i class="fa fa-user"></i> ' + this._("_Flatmates") + '</label>' +
           '</div>' +
           '<div class="col-sm-9 container-fluid">';
    $(this.users).each(function(key, value) {
        elem += '<div class="form-group row">';
        elem += '<div class="col-sm-9"><input type="text" value="' + value + '" class="form-control user"></div>';
        elem +=
            '<div class="col-sm-3"><bouton class="btn btn-danger" onclick="$(this).parent().parent().remove()"><i class="fa fa-trash-o"></i></bouton></div>';
        elem += '</div>'
    });
    elem += '<div class="row">';
    elem += '<div class="col-sm-12"><bouton class="btn btn-success" id="addUser"><i class="fa fa-plus"></i>  ' +
            this._("_Add") + '</bouton></div>';
    elem += '</div></div></div>';

    elem += '<div class="row">';
    elem +=
        '<div class="col-sm-offset-7 col-sm-5"><bouton class="btn btn-danger" id="resetDb"><i class="fa fa-reset"></i>  ' +
        this._("_Reset") + '</bouton></div>';
    elem += '</div>';
    elem += ' </div></div >';
    $(modal).find(".modal-body").append(elem);

};

// Binders

Coloc.prototype.bindWindow = function() {

    let coloc = this;

    $(".fitCss").css({ "overflow" : "auto", "padding" : "0", "display" : "block" });

    $(".table").css({ "margin" : "0" });

    $(window).on("resize", function() {
        let WindowHeight = window.innerHeight;
        let diff = $("nav").outerHeight(true) + $(".panel-heading").outerHeight(true) + 25;
        let Max = WindowHeight - diff;

        $(".fitHeight").css({ "height" : Max })

    });
    $(window).resize();
    $("#modal-close").on("click", () => { coloc.closeModal(); });

};

Coloc.prototype.bindDepotForm = function() {
    let inst = this;
    let u = this.users;
    let modal = this.modal;
    $(modal).find("#from").unbind("change").change(function() {
        let nbUsers = $(modal).find(".participate:checked").length;
        part = $(modal).find("#total").val() / nbUsers;
        part = part.toFixed(2);
        $(modal).find(".participate").removeAttr("disabled");
        $(modal).find(".participate").prop("checked", true);
        $(modal).find(".participate#" + $(modal).find("#from").val()).prop("checked", false);
        $(modal).find(".participate#" + $(modal).find("#from").val()).attr("disabled", true);

    });

    $(modal).find("#close").unbind("click").click(function() {
        inst.refresh();
        inst.closeModal();
    });

    $(modal).find("#delete").unbind("click").click(function() {
        let id = $(modal).find("#id").val();
        inst.database.splice(id, 1);
        inst.refresh();
        inst.closeModal();
    });

    $(modal).find("#save").unbind("click").click(function() {
        let id = $(modal).find("#id").val();
        let from = $(modal).find("#from").val();
        let total = $(modal).find("#total").val();
        let date = $(modal).find("#date").val();
        let coms = $(modal).find("#coms").val();
        let userPart = (total / $(modal).find(".participate:checked").length).toFixed(2);
        let users = {};

        $(u).each(function() {
            let v;
            if(this == from) {
                v = { participate : false, payed : true, realPayed : total, part : 0 };
            } else {
                v = {
                    participate : $(modal).find('#' + this + ".participate").is(":checked"),
                    payed : false,
                    realPayed : 0,
                    part : $(modal).find('#' + this + ".participate").is(":checked") == true ? userPart : 0
                };
            }
            users[this] = v;

        });

        if(id >= 0) {
            inst.replaceRow(id, "Depot", total, date, coms, users);
        } else {
            inst.insertRow("Depot", total, date, coms, users);
        }
        inst.refresh();
        inst.closeModal();

    });
};

Coloc.prototype.bindAddForm = function() {
    let inst = this;
    let u = this.users;
    let modal = this.modal;
    $(modal).find(".payed").unbind("change").change(function() {
        let nbUsers = $(modal).find(".participate:checked").length;
        part = $(modal).find("#total").val() / nbUsers;
        part = part.toFixed(2);
        $(modal).find(".payed").each(function(){ $(modal).find("#" + this.id + ".realPayed").val(0) });
        $(modal).find(".payed:checked").each(function(){ $(modal).find("#" + this.id + ".realPayed").val(part) });

    });

    $(modal).find("#type").unbind("change").change(function() {
        if($(this).val() == "Depot") {
            $(modal).find(".payed").parent().hide();
            $(modal).find(".realPayed").parent().hide();

        } else {
            $(modal).find(".payed").parent().show();
            $(modal).find(".realPayed").parent().show();
        }

    });

    $(modal).find("#total").unbind("change").change(function() {
        let nbUsers = $(modal).find(".participate:checked").length;
        part = $(modal).find("#total").val() / nbUsers;
        part = part.toFixed(2);
        $(modal).find(".participate:checked").each(function(){ $(modal).find("#" + this.id + "_realPayed").val(part) });
    });

    $(modal).find("#close").unbind("click").click(function() {
        inst.refresh();
        inst.closeModal();
    });

    $(modal).find("#delete").unbind("click").click(function() {
        let id = $(modal).find("#id").val();
        inst.database.splice(id, 1);
        inst.refresh();
        inst.closeModal();

    });

    $(modal).find("#save").unbind("click").click(function() {
        let id = $(modal).find("#id").val();
        let type = $(modal).find("#type").val();
        let total = $(modal).find("#total").val();
        let date = $(modal).find("#date").val();
        let coms = $(modal).find("#coms").val();
        let userPart = (total / $(modal).find(".participate:checked").length).toFixed(2);
        let users = {};
        if(type != "Depot") {
            $(u).each(function() {
                let v = {
                    participate : $(modal).find('#' + this + ".participate").is(":checked"),
                    payed : $(modal).find('#' + this + ".payed").is(":checked"),
                    realPayed : $(modal).find('#' + this + ".realPayed").val(),
                    part : $(modal).find('#' + this + ".participate").is(":checked") == true ? userPart : 0
                };
                users[this] = v;
            });
        } else {
            $(u).each(function() {

                let v = {
                    participate : $(modal).find('#' + this + ".participate").is(":checked"),
                    payed : true,
                    realPayed : $(modal).find('#' + this + ".participate").is(":checked") == true ? total : -userPart,
                    part : 0
                };
                users[this] = v;
            });
        }

        if(id >= 0) {
            inst.replaceRow(id, type, total, date, coms, users);
        } else {
            inst.insertRow(type, total, date, coms, users);
        }
        inst.refresh();
        inst.closeModal();

    });
};

Coloc.prototype.bindConfigForm = function() {
    let inst = this;
    let u = this.users;
    let modal = this.modal;
    $(modal).find("#addType").unbind("click").click(function() {
        elem = '<div class="form-group row">';
        elem += '<div class="col-sm-9"><input type="text" value="" class="form-control type"></div>';
        elem +=
            '<div class="col-sm-3"><bouton class="btn btn-danger" onclick="$(this).parent().parent().remove()"><i class="fa fa-trash-o"></i></bouton></div>';
        elem += '</div>';
        $(this).parent().parent().parent().prepend(elem);
    });

    $(modal).find("#addUser").unbind("click").click(function() {
        elem = '<div class="form-group row">';
        elem += '<div class="col-sm-9"><input type="text" value="" class="form-control user"></div>';
        elem +=
            '<div class="col-sm-3"><bouton class="btn btn-danger" onclick="$(this).parent().parent().remove()"><i class="fa fa-trash-o"></i></bouton></div>';
        elem += '</div>';
        $(this).parent().parent().parent().prepend(elem);
    });
    $(modal).find("#resetDb").unbind("click").click(function() {
        inst.resetDB();
        inst.closeModal();
    });
    $(modal).find("#save").unbind("click").click(function() {
        inst.users = Array();
        $(modal).find(".user").each(function() { inst.users.push($(this).val()); });
        inst.types = Array();
        $(modal).find(".type").each(function() { inst.types.push($(this).val()); });

        inst.lang = $(modal).find("#lang").val();
        inst.colorRows = $(modal).find("#colorrows").hasClass("active");
        inst.refresh();
        inst.closeModal();

    });

    $(modal).find("#close").unbind("click").click(function() {
        inst.refresh();
        inst.closeModal();
    });

};

Coloc.prototype.bindList = function() {
    let obj = this;
    $(this.list.tb).find("tr").unbind("dblclick").on("dblclick", function() {
        id = $(this).find(".id").html();
        obj.ShowInfo(id);

    });

};

// Accessor
Coloc.prototype.ConfigPanel = function() {
    this.buildConfigForm();
    this.bindConfigForm();
    this.showModal();
};

Coloc.prototype.EditPanel = function(id) {

    let data = this.database[id];
    if(data.type == "Depot") {
        this.buildDepotForm();
        this.bindDepotForm();
        this.loadDepotEditData(id);

    } else {
        this.buildAddForm();
        this.bindAddForm();
        this.loadAddEditData(id);
    }

    this.showModal();
};

Coloc.prototype.AddPanel = function() {
    this.buildAddForm();
    this.bindAddForm();
    this.showModal();
};

Coloc.prototype.DepotPanel = function() {
    this.buildDepotForm();
    this.bindDepotForm();
    this.showModal();

};

Coloc.prototype.refresh = function() {

    this.database.sort(this.sortbydate);
    this.saveData();
    this.readData();
    this.closeModal();
    this.recalculate();
    this.loadCredits();
    this.loadList();
    this.bindList();
    this.calcuateMounthTotal();
    $('#HistoryLabel').text(this._("_History"));
    $('#TotalLabel').text(this._("_Total"));
    $('#edit').text(this._("_Edit"));
    $('#close').text(this._("_Close"));
    $('#delete').text(this._("_Delete"));
    $('#save').text(this._("_Save"));
    $('#BTNAdd').text(this._("_Add"));
    $('#BTNDeposit').text(this._("_Deposit"));
    $('#BTNConfig').text(this._("_Configuration"));
    $('#BTNPdf').text(this._("_Export PDF"));
    $('#TotalMounthLabel').text(this._("_Total of mounth"));

};

// Private Fn

Coloc.prototype.sortbydate = function(da, db) {

    let a = Date.parse(da.date);
    let b = Date.parse(db.date);
    return a > b ? -1 : a < b ? 1 : 0;
};

Coloc.prototype.loadAddEditData = function(id) {
    let data = this.database[id];
    let inst = this;
    $(this.modal).find("#total").val(data.total);
    $(this.modal).find("#type").val(data.type);
    $(this.modal).find("#date").val(data.date);
    $(this.modal).find("#coms").val(data.coms);
    $(this.modal).find("#id").val(id);
    $(this.modal).find("#delete").show();
    $(this.users).each(function() {
        if(data.users[this] && data.users[this].participate) {
            $(inst.modal).find(".participate#" + this).prop('checked', data.users[this].participate);
            $(inst.modal).find(".payed#" + this).prop('checked', data.users[this].payed);
            $(inst.modal).find(".realPayed#" + this).show().val(data.users[this].realPayed);
        }
    });

};

Coloc.prototype.loadDepotEditData = function(id) {
    let data = this.database[id];
    let inst = this;
    let who;
    $(this.modal).find("#total").val(data.total);
    $(this.modal).find("#date").val(data.date);
    $(this.modal).find("#coms").val(data.coms);
    $(this.modal).find("#id").val(id);
    $(this.modal).find("#delete").show();

    $(this.users).each(function() {
        if(data.users[this]) {
            $(inst.modal).find("#" + this).prop('checked', data.users[this].participate);
            if(data.users[this].payed) {
                who = this;
            }
        }

    });

    $(this.modal).find("#from").find('[value="' + who + '"]').attr("selected", true);

};

Coloc.prototype.recalculate = function() {
    let inst = this;
    let d = this.database;
    let u = this.users;
    let c = Array();

    $(this.users).each(function() {
        let uLambda = this;
        let part = 0;
        let realPayed = 0;
        $(d).each(function() {
            if(this.users[uLambda]) {
                part += Number(this.users[uLambda].part);
                realPayed += Number(this.users[uLambda].realPayed);
            }
        });

        c[uLambda] = (realPayed - part).toFixed(2);

    });
    this.credits = c;

};

Coloc.prototype.closeModal = function(callback) {

    $(this.modal).modal("hide");
    $(this.modal).unbind('hidden.bs.modal').on('hidden.bs.modal', () => {
        $(this.modal).find("#title").empty();
        $(this.modal).find(".modal-body").empty();
        $(this.modal).find(".modal-footer").children().hide();
        try {
            callback();
        } catch(e) {
        }
    });

};

Coloc.prototype.showModal = function(callback) {
    $(this.modal).modal("show");
    $(this.modal).unbind('shown.bs.modal').on('shown.bs.modal', () => {
        $(window).resize();
        try {
            callback();
        } catch(e) {
        }
    });
};

Coloc.prototype.loadCredits = function() {
    let inst = this;
    $(this.creditsPanel).empty();
    $(this.users).each(function() {

        let elem = '<tr>' +
                   '<td><i class="fa fa-user"></i> ' + this + '</td>';

        if(inst.credits[this] >= 0) {
            elem += '<td class="text-success">+' + inst.credits[this];
        } else {
            elem += '<td class="text-danger">' + inst.credits[this]
        }

        elem += ' </td>' +
                '</tr>';
        $(inst.creditsPanel).append(elem);
    });

};

Coloc.prototype.readData = function() {
    let contenu;

    try {
        contenu = this.fs.readFileSync(this.DB_NAME, "UTF-8");
        this.database = JSON.parse(contenu);
    } catch(e) {
        this.database = new Array();
    }

    try {
        contenu = this.fs.readFileSync(this.CFG, "UTF-8");
        let json = JSON.parse(contenu);
        this.users = json.USERS;
        this.types = json.TYPES;
        this.lang = json.LANG;
        this.colorRows = json.COLOR_ROWS;
    } catch(e) {
        this.users = new Array();
        this.types = new Array();
        this.lang = "English";
        this.colorRows = false;
    }

    try {
        contenu = this.fs.readFileSync(this.LANG_DIR + "/" + this.lang + ".json", "UTF-8");
        this.langArray = JSON.parse(contenu);
    } catch(e) {
        this.langArray = new Array();
    }

};

Coloc.prototype.saveData = function() {
    this.fs.writeFileSync(this.DB_NAME, JSON.stringify(this.database), "UTF-8");
    this.fs.writeFileSync(this.CFG,
                          '{ "USERS" : ' + JSON.stringify(this.users) + ', "TYPES" : ' + JSON.stringify(this.types) +
                              ' , "LANG": "' + this.lang + '","COLOR_ROWS" : ' + this.colorRows + '}',
                          "UTF-8");
};

Coloc.prototype.insertRow = function(_type, _total, _date, _coms, _users) {
    let elem = { total : _total, type : _type, date : _date, coms : _coms, users : _users };
    this.database.push(elem);
};

Coloc.prototype.replaceRow = function(_id, _type, _total, _date, _coms, _users) {
    let elem = { total : _total, type : _type, date : _date, coms : _coms, users : _users };
    this.database[id] = elem;
};

Coloc.prototype.ShowInfo = function(id) {
    this.BuildInfo(id);
    this.BindInfo(id);
    this.showModal();
};

Coloc.prototype.BuildInfo = function(id) {
    let d = this.database[id];
    let modal = this.modal;
    let elem;
    let row;
    $(this.modal).find("#close").show();
    $(this.modal).find("#edit").show();

    $(modal).find("#title").text(this._("_Details"));
    $(modal).find(".modal-body").empty();

    panel = "<div class='panel panel-default'></div>";

    elem = $(panel);
    $(elem).append("<div class='panel-heading'><i aria-hidden='true' class='fa calendar'></i> " + this._("_Date") +
                   "</div>");
    $(elem).append("<div class='panel-body'>" + d.date + "</div>");
    $(modal).find(".modal-body").append(elem);
    elem = $(panel);
    $(elem).append("<div class='panel-heading'><i class='fa fa-ticket'></i> " + this._("_Type") + "</div>");
    $(elem).append("<div class='panel-body'>" + d.type + "</div>");
    $(modal).find(".modal-body").append(elem);

    elem = $(panel);
    $(elem)
        .append("<div class='panel-heading'><i aria-hidden='true' class='fa fa-commenting-o' aria-hidden='true'></i> " +
                this._("_Comments") + "</div>");
    $(elem).append("<div class='panel-body'>" + d.coms + "</div>");
    $(modal).find(".modal-body").append(elem);

    elem = $('<table class="table table-bordered table-inverse "></table>');
    th = $("<thead>");
    row = $("<tr>");
    $(row).append("<th>" + this._("_Flatmates") + "</th>");
    $(row).append("<th>" + this._("_Share") + "</th>");
    $(row).append("<th>" + this._("_I already payed") + "</th>");
    $(th).append(row);
    tb = $("<tbody>");
    $(this.users).each(function() {

        if(!d.users[this] || (d.users[this] && !d.users[this].participate)) {
        } else {

            row = $("<tr>");
            $(row).append("<td>" + this + "</td>");

            if(d.users[this].part || d.users[this].realPayed) {
                $(row).append("<td>" + d.users[this].part + "</td>");
                $(row).append("<td>" + d.users[this].realPayed + "</td>");

            } else {
                $(row).append("<td>-/-</td>");
                $(row).append("<td>-/-</td>");
            }
            $(tb).append(row);
        }
    });
    $(elem).append(th);
    $(elem).append(tb);
    $(modal).find(".modal-body").append(elem);
};

Coloc.prototype.BindInfo = function(id) {
    let coloc = this;
    $(this.modal).find("#edit").unbind().bind("click", () => {

        coloc.closeModal(() => { coloc.EditPanel(id); });

    });
    $(this.modal).find("#close").unbind().bind("click", () => { coloc.closeModal(); });
};
Coloc.prototype.loadList = function() {
    let obj = this;

    $(obj.list.tb).empty();
    this.buildList();
    $(this.database).each(function(index, value) {
        let d = value;
        let row = $("<tr>");
        $(row).append("<th class='id' scope='row'>" + index + "</th>");
        $(row).append("<td>" + d.date + "</td>");
        $(row).append("<td>" + d.type + "</td>");
        $(row).append("<td>" + d.coms + "</td>");

        if(obj.colorRows === true) {
            $(row).addClass(obj.Styles[d.type]);
        }
        if(d.total) {
            $(row).append("<td>" + d.total + "</td>");
        } else {
            $(row).append("<td>-/-</td>");
        }

        $(obj.list.tb).append(row);
    });

};

Coloc.prototype.calcuateMounthTotal = function() {

    let mouth = this.database.filter((e) => {
        let dateObj = new Date(e.date);
        let curDate = new Date();
        let e_mounth = dateObj.getUTCMonth() + 1; // months from 1-12
        let e_year = dateObj.getUTCFullYear();
        let c_mounth = curDate.getUTCMonth() + 1; // months from 1-12
        let c_year = curDate.getUTCFullYear();

        return (c_mounth == e_mounth && c_year == e_year);
    });

    let somme = 0;

    for(let e in mouth) {
        somme += Number(mouth[e].total);
    }
    $("#MounthTotal").html(somme + ' <i class="fa fa-eur"></i>');

};
