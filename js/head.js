function load(callback,i = 0 ) {
    var remote = require('electron').remote;
    var url = remote.getGlobal('config')[i];

    if(url == null) {callback();return true;}
    var ext = url.substr(url.lastIndexOf('.') + 1)
    var elem;

    if (ext == "js") {
        elem = document.createElement("script");
        elem.type = "text/javascript";
        elem.src = url;
    } else {
        elem = document.createElement("link");
        elem.rel = "stylesheet";
        elem.type = "text/css";
        elem.href = url;
    }
    elem.onload = function () {
      load(callback,i+1);
    };
    document.getElementsByTagName('head')[0].appendChild(elem);

}
