function load(callback, i = 0)
{
    var remote = require('electron').remote;
    var url = remote.getGlobal('config')[i];

    if(url == null) {
        if(window.module)
            module = window.module;
        document.getElementById("loading-bar").innerHTML = "";
        callback();
        return true;
    }
    if(i == 0) {
        if(typeof module === 'object') {
            window.module = module;
            module = undefined;
        }
    }
    var ext = url.substr(url.lastIndexOf('.') + 1);
    var elem;

    if(ext == "js") {
        elem = document.createElement("script");
        elem.type = "text/javascript";
        elem.src = url;
    } else {
        elem = document.createElement("link");
        elem.rel = "stylesheet";
        elem.type = "text/css";
        elem.href = url;
    }

    elem.onreadystatechange = function() {
        if(this.readyState == 'complete') {
            load(callback, i + 1);
        }
    };

    elem.onload = function() { load(callback, i + 1); };
    document.getElementsByTagName('head')[0].appendChild(elem);
    document.getElementById("loading-bar").style.width = (i * 5 + "%");
    document.getElementById("loading-bar").innerHTML = url.substr(url.lastIndexOf('/') + 1);
}
