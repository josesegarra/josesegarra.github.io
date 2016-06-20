
(function () {
    var self = "file: core.UI.js version: 20150504";                                                        // This file ID
    if (!$J) throw "Missing $J. Has core.js being loaded ??";                                               // This is a preRequisite
    if ($J.UI) {                                                                                            // Only load once
        $J.warning("$J.UI already exists. Skipping: " + self);
        return;
    }
    $J.UI = {};                                                                                             // Create $J.UI 

    // ################ support for DOM
    var nElement = 10;
    $J.UI.domNew= function (parent, what, id, className) {
        if (parent) {
            if (typeof (parent) === "string") parent = document.getElementById(parent);
            if (!(parent instanceof Element)) return $J.error("Cannot create ELEMENT. Bad parent element");
            if (!parent.appendChild) return $J.error("Cannot create ELEMENT. Parent cannot contain child elements");
        }
        if (!what) what = "DIV";
        nElement++;
        var iDiv;
        if (what == "EDIT_TEXT") {
            iDiv = document.createElement("INPUT");
            iDiv.type = "text";
        } else iDiv = document.createElement(what);
        iDiv.id = id ? id.toString() : "element_" + nElement;
        if (className) iDiv.className = className;
        if (parent) parent.appendChild(iDiv);
        return iDiv;
    }


    $J.UI.domBox = function (element, o) {
        if (!o) o = {};
        element.style.position = "absolute";
        if (o.left !== undefined) element.style.left = o.left + "px";
        if (o.top !== undefined) element.style.top = o.top + "px";
        if (o.right !== undefined) element.style.right = o.right + "px";
        if (o.bottom !== undefined) element.style.bottom = o.bottom + "px";
        return element;
    }

    $J.UI.domBoxV = function (element) {
        var n = $J.UI.domBox(element, { left: 0, top: 0 });
        n.style.position = "relative";
        n.style.width = "100%";
        n.style.height = "100%";
        n.style.overflowY = "auto";
        return n;
    }


    // ################ support for styles
    var l = document.getElementsByTagName('head');                                                          // Get all HEAD tags
    if (l.length == 0) return $J.error("Missing HEAD tag in main page");                                               // There must be at least one
    var headTag = l[0], jStyles = {}, nStyles = 0;                                                          // Init internal vars

    $J.UI.styleNewClass= function (content, name,override) {                                                // Creates a new style
        if (!name) name = "ST_" + (nStyles++) + "_" + new Date().valueOf();                                 // If no name received generate a new one
        if (jStyles[name] && !override) return name;                                                        // If a with this name already exists and not override then return it
        var node = $J.UI.domNew(headTag, "style");                                                          // Create style node        
        node.type = "text/css";                                                                             // If type CSS
        node.innerHTML = "."+name + " { " + content + "}";                                                      // And with this content
        jStyles[name] = node;
        var l=50;
        $J.info("Registered CSS style: " + name + " { " + (content.length > l ? content.substring(0, l) + "..." : content) + " }");
        return name;
    }

    $J.UI.onMouseAction = function (element, data) {
        var pX , pY;
        element.onmousedown = function (e) {
            if (e.button != 0) return;
            pX = e.clientX;pY = e.clientY;
            if (data.onDown) data.onDown.call(element, e);
        }

        element.onmouseup = function (e) {
            if (e.button != 0) return;
            if (Math.abs(e.clientX - pX) < 5 && Math.abs(e.clientY - pY) < 5) {
                if (data.onUp) return data.onUp.call(element, e);
            }
            else {
                if (data.onSelect) return data.onSelect.call(element, e);
            }
            return;
        }
    }


    // ################ Global onresize
    // http://stackoverflow.com/questions/19329530/onresize-for-div-elements
    // https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js

    var rSensor = $J.UI.styleNewClass("visibility:hidden;display:block;position:absolute;top:0px;left:0px;right:0px;bottom:0px;overflow: hidden;");
    var rSensorC = $J.UI.styleNewClass("position: absolute; left: 0; top: 0; transition: 0s;");
    var rSensorD = "<div class='"+rSensor +"'><div class='"+rSensor +"'></div></div><div class='"+rSensor +"'><div class='"+rSensorC +"' style='width: 200%; height: 200%'></div></div>";
    if (!window.requestAnimationFrame) return $J.error("Expected requestAnimationFrame");


    $J.UI.onResize= function (element, handler,data) {
        if (element.style.position !== "relative") $J.error("onresize can only be used in relative elements");

        if (element.__rSensor) return;                                                  // If a resizeSensor already exists then exit
        element.__rSensor = $J.UI.domNew(element, null, null, rSensor);                 // Create hidden DIV
        element.__rSensor.innerHTML = rSensorD;                                           // Create sensors in DIV
        var expand = element.__rSensor.childNodes[0];
        expand.id = "expand_sensor";
        var shrink = element.__rSensor.childNodes[1];
        expand.id = "shrink_sensor";
        var expandChild = expand.childNodes[0];
        var reset = function () {
            expandChild.style.width = 100000 + 'px';
            expandChild.style.height = 100000 + 'px';
            expand.scrollLeft = 100000;
            expand.scrollTop = 100000;
            shrink.scrollLeft = 100000;
            shrink.scrollTop = 100000;
        };
        reset();
        var process = function () {
            handler.call(element, data);
            reset();
        }
        expand.addEventListener('scroll', process, true);
        shrink.addEventListener('scroll', process, true);
        //window.requestAnimationFrame(handler);


    }
    //object.addEventListener("animationstart", myScript);


})();
