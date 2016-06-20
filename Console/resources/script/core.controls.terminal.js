
(function () {
    if (!$J) throw "Missing $J. Has core.js being loaded ??";
    var defStyles={
        display: $J.UI.styleNewClass("font: 12px 'Consolas','Courier new';background-color: #000;color:#4cAA00;"),                                         // Style for DISPLAY
        command: $J.UI.styleNewClass("font:inherit;background-color:#000;color: inherit;color:#4cff00;border: 1px solid transparent;width:100%"),          // Style for COMMAND
        prompt: $J.UI.styleNewClass("color:#4cff00; font: inherit")
    }
    $J.UI.styleNewClass("outline: none;", "."+defStyles.command+ ":focus");                                                                                              // On focus for COMMAND

    function initOptions(o) {
        if (!o) o = {};
        if (!o.styles) o.styles = {};
        if (!o.styles.display) o.styles.display = defStyles.display;
        if (!o.styles.command) o.styles.command = defStyles.command;
        if (!o.styles.prompt) o.styles.prompt = defStyles.prompt;
        return o;
    }
    var C = $J.UI.domNew;                                                                                           // Simple shortcut

    var tabValue = "     ";

    function clean(a) {
        var i = 0;
        var s = "";
        while (i < a.length && a.charAt(i) === ' ') {
            s = s + "&nbsp;";
            i++;
        }
        return s + a.substring(i);
    }
    function handleTab(e) {
        if (e.keyCode != 9) return;
        e.preventDefault();
        var i = this.selectionStart;
        var s = this.value;
        this.value = s.substring(0, i) + tabValue + s.substring(this.selectionEnd);
        this.selectionStart = i + tabValue.length;
        this.selectionEnd = i + tabValue.length;
        return false;
    }

    function vInt(a, k) {if (!a) { return k ? k : 0; } else return parseInt(a, 10);}

    // Create terminal
    $J.terminal = function (parent,o) {
        o = initOptions(o);                                                                                         // Set default options for terminal creation
        var app_listeners = $J.listenerNew();                                                                       // EVENT listeners for this terminal
        var filters = [];                                                                                           // Filters for this terminal

        var tControl = { kind: "Terminal", version: "0.8" };                                                        // This is the terminal Control
        var div = $J.UI.domBoxV(C(parent, "DIV", o.id, o.styles.display));                                          // A vertical-scrollable DIV that fills all available space
        var display = $J.UI.domBox(C(div, null, null, o.styles.display), { left: 25, top: 2, right: 4 });           // Create DISPLAY area
        var row = $J.UI.domBox(C(div, null, null, o.styles.prompt), { left: 2, right: 4 });                         // Create PROMPT
        row.textContent = ">>";
        var line = $J.UI.domBox(C(row), { top: 0, left: 23, right: 25 });                                           // Line where the COMMAND will be placed
        var edit = C(line, "EDIT_TEXT", null, o.styles.command);                                                    // Create COMMAND
        edit.onkeydown = handleTab;                                                                                 // Handle TAB key

        tControl.getStyle = function (styleName) { return o.styles[styleName];}                                     // Return this TERMINAL styles       
        tControl.setStyle = function (styleName, value) {                                                           // Set this TERMINAL styles
            var s = o.styles[styleName];
            o.styles[styleName] = value;
            if (styleName == "command") edit.className = value;
            if (styleName == "prompt") row.className = value;
            return s;
        }

        var moveBottom = function () {
            row.style.top = (vInt(window.getComputedStyle(display).height) + 2) + "px";
            row.scrollIntoView({ block: "end" });
        }

        tControl.lines = function () {
            var o = [],k=0,a = display.firstChild;
            while (a) {
                if (a.tagName === "SPAN") o[k]=a.textContent;
                if (a.tagName === "BR") k = k + 1;
                a = a.nextSibling;
            }
            o.clearTerminal = function () {
                while (display.firstChild) display.removeChild(display.firstChild);
                moveBottom();
                return this;
            }
            return o;
        }

        tControl.print = function (s) {                                                                             // This is the PRINT method
            var r = o.styles.display;
            display.innerHTML = display.innerHTML + "<span class='" + r + "'>" + clean(s) + "</span><br/>";
            moveBottom();
        }

        tControl.onCommand = function (handler, data) {                                                                 // This function allows the host application to receive onComman events
            app_listeners.add('onCommand',handler, data);
        }

        tControl.doCommand = function (value, echo) {
            if (echo) this.print(value);
            this.value = value;
            app_listeners.raise('onCommand', this, this.value);
        }

        tControl.filtersAdd = function (s) {                                                                            // Exported for adding a filter
            if (!s.name) return $J.error("Terminal filters need [name] property");
            if (typeof (s.handler) !== "function") return $J.error("Terminal filters need a [handler] property of type function");;
            var o = { };
            for (var k in s) o[k] = s[k];
            if (o.enabled === undefined) o.enabled = true;
            filters.push(o);
        }

        tControl.filtersAdd({
            name: "[print] & [onCommand event] filter",
            handler: function () {                                                                                 // This is the default FILTER that PRINTS & RAISE event
                tControl.print(tControl.value);
                app_listeners.raise('onCommand', tControl, this.value);
                return true;
            }
        })

        edit.onkeypress = function (event) {                                                                        // OnKeyPress
            if ((event.keyCode || event.charCode) != 13) return true;                                               // If not CR then return
            event.preventDefault();                                                                                 // Prevent default
            tControl.value= edit.value;                                                                                     // Get command
            edit.value = "";                                                                                        // Reset INPUT box
            var l = filters.length - 1;                                                                             // Number of filters
            while (l >= 0) {                                                                                        // Loop all filters until value is reset
                if (filters[l].enabled && !filters[l].handler.call(tControl, filters[l])) return false;             // Call filter
                l = l - 1;
            }
            return false;                                                                                           // Prevent default
        }

        $J.UI.onResize(div, function () {
            console.log("Move to bottom");
            moveBottom();
        });

        // FF does not fire onClick when selecting text, but Chrome DOES
        var d = {
            onUp: function () {
                edit.focus();
            }
        }
        $J.UI.onMouseAction(display, d);
        $J.UI.onMouseAction(div, d);


        edit.focus();
        return tControl;
    }

})();
