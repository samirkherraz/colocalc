let Coloc = function(callback) {

    this.DB_NAME = __dirname + "/data/default.db";
    this.CFG_USERS = __dirname + "/data/default.u.cfg";
    this.CFG_TYPES = __dirname + "/data/default.t.cfg";

    this.users = new Array();
    this.types = new Array();
    this.database = new Array();

    this.list = { th : $("#ListTableH"), tb : $("#ListTableB") };

    this.fs = require('fs');
    this.modal = $("#modal");
    this.credits;
    this.creditsPanel = $("#creditsPanel");

    this.readData();
    this.refresh();
    this.bindWndow();
    callback();

};

// Builders

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
    console.log(this.database);
    this.refresh();

};

Coloc.prototype.buildList = function() {

    elem = "<tr><th><i class='fa fa-key'></i></th>";
    elem += "<th>Date</th>";
    elem += "<th>Type</th>";
    elem += "<th>Commentaires</th>";
    elem += "<th>Total</th>";

    $(this.users).each(function() {
        elem += "<th>" + this + " part</th>";
        elem += "<th>" + this + " payed</th>";

    });
    elem += "</tr>";
    $(this.list.th).html(elem);

};

Coloc.prototype.buildDepotForm = function() {

    let modal = this.modal;
    let elem;
    $(this.modal).find("#close").show();
    $(this.modal).find("#save").show();
    $(modal).find("#title").text("Ajouter");
    $(modal).find(".modal-body").empty();

    elem = '<div class="form-group row">' +
           '<div class="col-sm-5">' +
           '<label for="date"><i class="fa fa-calendar"></i>  Date</label>' +
           '</div>' +
           '<div class="col-sm-7">' +
           '<input type="date" id="date" class="form-control" value="' + new Date().toISOString().substring(0, 10) +
           '"> ' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);

    elem = '<div class="form-group row">' +
           '<div class="col-sm-5">' +
           '<label for="total"><i class="fa fa-eur"></i>  Total</label>' +
           '</div>' +
           '<div class="col-sm-7">' +
           '<input type="number" id="total" placeholder="Exemple 80" class="form-control"> ' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);
    elem = '<div class="form-group row">' +
           '<div class="col-sm-5">' +
           '<label for="coms"><i class="fa fa-text"></i>  Commentaires</label>' +
           '</div>' +
           '<div class="col-sm-7">' +
           '<textarea id="coms" class="form-control"> </textarea>' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);

    elem = '<div class="form-group row">' +
           '<div class="col-sm-5">' +
           '<label for="from"><i class="fa fa-ticket"></i>  Payeur</label>' +
           '</div>' +
           '<div class="col-sm-7">' +
           ' <select class="form-control" id="from">';
    $(this.users).each(function(){ elem += '<option value="' + this + '">' + this });
    elem += '</select>' +
            '</div>' +
            '</div>';

    $(modal).find(".modal-body").append(elem);

    $(this.users).each(function() {
        elem = '<div class="form-group row">' +
               '<label class="col-sm-2"><i class="fa fa-user"></i>  ' + this + ' </label>' +
               '<div class="col-sm-2">' +
               '<label class="form-check-label"> Participe</label>' +
               '<input class="form-check-input participate" type="checkbox" id="' + this + '">' +
               '</div>' +
               '</div>';
        $(modal).find(".modal-body").append(elem)

            elem = "<input type='hidden' id='id' value='-1'>";
        $(modal).find(".modal-body").append(elem);

    });

};

Coloc.prototype.buildAddForm = function() {

    let modal = this.modal;
    let elem;
    $(this.modal).find("#close").show();
    $(this.modal).find("#save").show();
    $(modal).find("#title").text("Ajouter");
    $(modal).find(".modal-body").empty();

    elem = '<div class="form-group row">' +
           '<div class="col-sm-5">' +
           '<label for="total"><i class="fa fa-calendar"></i>  Date</label>' +
           '</div>' +
           '<div class="col-sm-7">' +
           '<input type="date" id="date" class="form-control" value="' + new Date().toISOString().substring(0, 10) +
           '"> ' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);

    elem = '<div class="form-group row">' +
           '<div class="col-sm-5">' +
           '<label for="total"><i class="fa fa-ticket"></i>  Type</label>' +
           '</div>' +
           '<div class="col-sm-7">' +
           ' <select class="form-control" id="type">';
    $(this.types).each(function(){ elem += '<option value="' + this + '">' + this });
    elem += '<option value="Depot">' + "Depot";
    elem += '</select>' +
            '</div>' +
            '</div>';
    $(modal).find(".modal-body").append(elem);

    elem = '<div class="form-group row">' +
           '<div class="col-sm-5">' +
           '<label for="total"><i class="fa fa-eur"></i>  Total</label>' +
           '</div>' +
           '<div class="col-sm-7">' +
           '<input type="number" id="total" placeholder="Exemple 80" class="form-control"> ' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);
    elem = '<div class="form-group row">' +
           '<div class="col-sm-5">' +
           '<label for="coms"><i class="fa fa-text"></i>  Commentaires</label>' +
           '</div>' +
           '<div class="col-sm-7">' +
           '<textarea id="coms" class="form-control"> </textarea>' +
           '</div>' +
           '</div>';
    $(modal).find(".modal-body").append(elem);

    $(this.users).each(function() {
        elem = '<div class="form-group row">' +
               '<label class="col-sm-2"><i class="fa fa-user"></i>  ' + this + ' </label>' +
               '<div class="col-sm-2">' +
               '<label class="form-check-label"> Participe</label>' +
               '<input class="form-check-input participate" type="checkbox" id="' + this + '">' +
               '</div>' +
               '<div class="col-sm-2">' +
               '<label class="form-check-label"> Payement</label>' +
               '<input class="form-check-input payed" type="checkbox" id="' + this + '">' +
               '</div>' +
               '<div class="col-sm-6" >' +
               '<input class="form-control realPayed" style="width: 95%;display:inline" value="0" type="number" id="' +
               this + '"><i class="fa fa-eur"></i>' +
               '</label>' +
               '</div>' +
               '</div>';
        $(modal).find(".modal-body").append(elem)

            elem = "<input type='hidden' id='id' value='-1'>";
        $(modal).find(".modal-body").append(elem);

    });

};

Coloc.prototype.buildConfigForm = function() {

    let modal = this.modal;
    let elem;
    $(modal).find("#title").html("<i class='fa fa-wrench'></i>  Configuration");
    $(modal).find(".modal-body").empty();
    $(this.modal).find("#close").show();
    $(this.modal).find("#save").show()

        elem = '<div class="form-group row">' +
               '<div class="col-sm-5">' +
               '<label for="total"><i class="fa fa-ticket"></i>  Types</label>' +
               '</div>' +
               '<div class="col-sm-7">';
    $(this.types).each(function(key, value) {
        elem += '<div class="form-group row">';
        elem += '<div class="col-sm-9"><input type="text" value="' + value + '" class="form-control type"></div>';
        elem +=
            '<div class="col-sm-3"><bouton class="btn btn-danger" onclick="$(this).parent().parent().remove()"><i class="fa fa-trash-o"></i></bouton></div>';
        elem += '</div>'
    });
    elem += '<div class="row">';
    elem +=
        '<div class="col-sm-12"><bouton class="btn btn-success" id="addType"><i class="fa fa-plus"></i> Ajouter</bouton></div>';
    elem += '</div></div></div>';

    $(modal).find(".modal-body").append(elem);
    elem = '<div class="form-group row">' +
           '<div class="col-sm-5">' +
           '<label for="total"><i class="fa fa-user"></i> Users</label>' +
           '</div>' +
           '<div class="col-sm-7 container-fluid">';
    $(this.users).each(function(key, value) {
        elem += '<div class="form-group row">';
        elem += '<div class="col-sm-9"><input type="text" value="' + value + '" class="form-control user"></div>';
        elem +=
            '<div class="col-sm-3"><bouton class="btn btn-danger" onclick="$(this).parent().parent().remove()"><i class="fa fa-trash-o"></i></bouton></div>';
        elem += '</div>'
    });
    elem += '<div class="row">';
    elem +=
        '<div class="col-sm-12"><bouton class="btn btn-success" id="addUser"><i class="fa fa-plus"></i> Ajouter</bouton></div>';
    elem += '</div></div></div>';
    $(modal).find(".modal-body").append(elem);
};

// Binders

Coloc.prototype.bindWndow = function() {

    $(".panel-body").css({ "overflow" : "auto", "padding" : "0" });

    $(".table").css({ "margin" : "0" });

    $(window).on("resize", function() {
        let view = window.innerHeight;
        let dcH = $("nav").outerHeight(true) + $("#body").outerHeight(true);
        let diff = dcH - view;

        $(".panel-body").each(function(){

            $(this).css({ "max-height" : $(this).outerHeight(true) - diff })
        });

    });
    $(window).resize();

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

    $(modal).find("#close").unbind("click").click(function() { inst.refresh(); });

    $(modal).find("#delete").unbind("click").click(function() {
        let id = $(modal).find("#id").val();
        inst.database.splice(id, 1);
        inst.refresh();
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

    $(modal).find("#close").unbind("click").click(function() { inst.refresh(); });

    $(modal).find("#delete").unbind("click").click(function() {
        let id = $(modal).find("#id").val();
        inst.database.splice(id, 1);
        inst.refresh();
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

    $(modal).find("#save").unbind("click").click(function() {
        inst.users = Array();
        $(modal).find(".user").each(function() { inst.users.push($(this).val()); });
        inst.types = Array();
        $(modal).find(".type").each(function() { inst.types.push($(this).val()); });
        inst.refresh();

    });

    $(modal).find("#close").unbind("click").click(function() { inst.refresh(); });

};

Coloc.prototype.bindList = function() {
    let obj = this;
    $(this.list.tb).find("tr").unbind("dblclick").on("dblclick", function() {
        id = $(this).find(".id").html();
        obj.EditPanel(id);

    });

};

// Accessor
Coloc.prototype.ConfigPanel = function() {
    this.buildConfigForm();
    this.bindConfigForm();
    $(window).resize();

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

    $(this.modal).modal();
    $(window).resize();

};

Coloc.prototype.AddPanel = function() {
    this.buildAddForm();
    this.bindAddForm();
    $(window).resize();

};

Coloc.prototype.DepotPanel = function() {
    this.buildDepotForm();
    this.bindDepotForm();
    $(window).resize();

};

Coloc.prototype.refresh = function() {
    this.saveData();
    this.database.sort(this.sortbydate);
    this.clearModal();
    this.recalculate();
    this.loadList();
    this.bindList();
    this.loadCredits();
};

// Private Fn

Coloc.prototype.sortbydate = function(a, b) {
    let t = (Date.parse(a.date) < Date.parse(b.date));
    return (t)
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
    $(this.modal).find("#total").val(data.total);
    $(this.modal).find("#date").val(data.date);
    $(this.modal).find("#coms").val(data.coms);
    $(this.modal).find("#id").val(id);
    $(this.modal).find("#delete").show();
    $(this.users).each(function() {
        if(data.users[this]) {
            $(inst.modal).find("#" + this).prop('checked', data.users[this].participate);
            if(data.users[this].payed) {
                $(this.modal).find("#from").val(this);
            }
        }

    });

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

Coloc.prototype.clearModal = function() {

    $(this.modal).find("#title").empty();
    $(this.modal).find(".modal-body").empty();
    $(this.modal).find(".modal-footer").children().hide();

};

Coloc.prototype.loadCredits = function() {
    let inst = this;
    $(this.creditsPanel).empty();
    $(this.users).each(function() {

        elem = '<tr>' +
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

    if(contenu = this.fs.readFileSync(this.DB_NAME, "UTF-8"))
        this.database = JSON.parse(contenu);
    if(contenu = this.fs.readFileSync(this.CFG_USERS, "UTF-8"))
        this.users = JSON.parse(contenu);
    if(contenu = this.fs.readFileSync(this.CFG_TYPES, "UTF-8"))
        this.types = JSON.parse(contenu);

};

Coloc.prototype.saveData = function() {
    this.fs.writeFileSync(this.DB_NAME, JSON.stringify(this.database), "UTF-8");
    this.fs.writeFileSync(this.CFG_USERS, JSON.stringify(this.users), "UTF-8");
    this.fs.writeFileSync(this.CFG_TYPES, JSON.stringify(this.types), "UTF-8");
};

Coloc.prototype.insertRow = function(_type, _total, _date, _coms, _users) {
    let elem = { total : _total, type : _type, date : _date, coms : _coms, users : _users };
    this.database.push(elem);
};

Coloc.prototype.replaceRow = function(_id, _type, _total, _date, _coms, _users) {
    let elem = { total : _total, type : _type, date : _date, coms : _coms, users : _users };
    this.database[id] = elem;
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

        if(d.total) {
            $(row).append("<td>" + d.total + "</td>");
        } else {
            $(row).append("<td>-/-</td>");
        }

        payed = 0;
        $(obj.users).each(function() {
            if(d.users[this] && (d.users[this].payed || d.users[this].participate)) {
                payed += Number(d.users[this].realPayed);
                $(row).append("<td>" + d.users[this].part + "</td>");
                td = $("<td>" + d.users[this].realPayed + "</td>");
                $(row).append(td);

            } else {
                $(row).append("<td>-/-</td>");
                $(row).append("<td>-/-</td>");
            }
        });

        $(obj.list.tb).append(row);
    });

};