(function () {
    if (!$J) throw "Missing $J. Has core.js being loaded ??";
    if (!$J.modules) return $J.error("$J has no module support");
    var extId = "20160503_1604";
    var extDescription= "Terminal extensions: help & multiline";
    if ($J.modules[extId]) {
        $J.warning("Module was already registered in $J: " + extId);
        return;
    }
    var T = $J.terminal;
    if (!T) return $J.error("Missing $J.terminal. Has terminal.js being loaded ??");

    $J.info("Registering module [" + extId + "]:" + extDescription);
    $J.modules[extId] = extDescription;

    function ml(r1) {
        var s="",l=r1.split("|");
        for (var i = 0; i < l.length - 1; i++) s = s + "<span style='display:inline-block ; min-width:80px;'>" + l[i] + "</span>";
        return s + l[l.length - 1];
    }

    function printHelp(r){
        r.print("Help & multiline extensions. Enter in a single line:");
        r.print("");
        r.print(ml("|*h|To print this help"));
        r.print(ml("|*[|To begin a multiline command"));
        r.print(ml("|*]|To complete a multiline command"));
        r.print(ml("|*c|To clear the terminal"));
        return r;
    }

    $J.terminal = function (o) {
        var r = T(o);                                                               // Create the terminal as usual
        r.filtersAdd({ name: extDescription, handler: thisFilter, data: {} });      // Add the filter
        printHelp(r);
        return r;
    }


    var mDisplay = $J.UI.styleNewClass("color:#0094ff;font-style:italic");
    var mPrompt = $J.UI.styleNewClass("color:#0094ff;");
    var mCommand = $J.UI.styleNewClass("color:#0094ff;");

        
    function thisFilter(filter) {

        if (!filter.data.multiline){
            if (this.value === "*h") return !printHelp(this);
            if (this.value === "*c") return !(this.lines().clearTerminal());
            if (this.value === "*[") {
                filter.data.stylePrompt = this.getStyle("prompt");
                filter.data.styleCommand = this.getStyle("command");
                filter.data.styleDisplay = this.getStyle("display");
                this.setStyle("prompt",filter.data.stylePrompt + " " + mPrompt);
                this.setStyle("display", filter.data.styledisplay+ " " + mDisplay);
                this.setStyle("command", filter.data.styleCommand + " " + mCommand);
                filter.data.multiline = true;
                filter.data.lines = [];
                return false;
            }
            return true;
        }
        if (this.value === "*]") {
            this.setStyle("prompt", filter.data.stylePrompt);
            this.setStyle("display", filter.data.styledisplay);
            this.setStyle("command", filter.data.styleCommand);
            filter.data.multiline = false;
            this.doCommand(filter.data.lines.join(" "));
            return false;
        }
        filter.data.lines.push(this.value.trim());
        this.print(this.value);
        return false;
    }
    
    
})();


function printHelp(a) {
    a.print("Enter");
    a.print("&nbsp;&nbsp;&nbsp;&nbsp;[&nbsp;&nbsp;in a single line to begin a multiline command");
    a.print("&nbsp;&nbsp;&nbsp;&nbsp;]&nbsp;&nbsp;in a single line to finish a multiline command");
}

function multiLine(a, v) {
    if (v == "[") a.setMode("multiline", true);
    if (v == "]") a.setMode("multiline", false);

}
