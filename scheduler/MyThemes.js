(function () {
    if (!window.$sej) {
        alert("Missing [windows.$sej]");
        return;
    }
    // ---------------------------- Themes for SCHEDULER VIEW ------------------------------ /
    (function (c){
        c["scheduler.title"] = function (view, data, element) {
            element.style.borderTop = "1px solid #AAA";
            element.style.borderBottom = "1px solid #AAA";
            element.style.borderRight = "1px solid #AAA";
            element.style.borderLeft = "1px solid #AAA";
            element.style.marginRight = "1px";
        }
        c["scheduler.header"] = function (view, data, element) {
            element.style.borderTop = "1px solid #AAA";
            element.style.borderRight = "1px solid #AAA";
        }

        c["scheduler.header.item"] = function (view, data, element) {
            element.style.backgroundColor = "#EEE";
            element.style.borderBottom = "1px solid #AAA";
        }
        c["scheduler.header.day"] = function (view, data, element) {
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.textAlign = "center";
            element.style.padding = "8px";
            element.innerHTML = window.$sej.utils.dateTime.dateToString(data);
            element.style.borderLeft = "1px solid #AAA";
        }
        c["scheduler.header.times"] = function (view, data, element) {
            element.style.borderTop = "1px solid #AAA";
        }

        c["scheduler.header.tick"] = function (view, data, element) {
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.textAlign = "center";

            element.innerHTML = window.$sej.utils.dateTime.timeToString(data.start).substring(0, 2);                                                                               // Each ticket has a TIME0 = starting time
            element.style.padding = "4px";
            element.style.borderLeft = "1px solid #AAA";
        }

        c["scheduler.event"] = function (view, data, element) {
            element.style.border = "1px solid #333";
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.paddingLeft = "3px";
            element.style.fontSize = "9px";
            element.style.cursor = "pointer";
			element.style.minHeight = "30px";
            element.style.maxHeight = "30px";
            element.style.overflow = "hidden";
            if (data.item.color) element.style.backgroundColor = data.item.color; else element.style.backgroundColor = "lightyellow";
            element.className = "CSSshadow ";
            element.innerHTML = data.item.title+" in "+data.item.room + " by "+data.item.tech +"<br>" + data.time1 + "-" + data.time2;

            var r0= null;
            if (data.lateEnd) {
                r0 = document.createElement('DIV');
                r0.style.right = "0px";
            }
            if (data.earlyStart) {
                element.style.paddingLeft = "13px";
                r0 = document.createElement('DIV');
                r0.style.left = "0px";
            }

            if (r0) {
                element.appendChild(r0);
                r0.style.position = "absolute";
                r0.style.top = "0px";
                r0.style.bottom = "0px";
                r0.style.minWidth = "10px";
                r0.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
            }
            //element.style.maxHeight = "35px";
            //element.style.minHeight = "35px";

        }
        c["scheduler.category"] = function (view, data, element) {
            element.style.borderBottom = "1px solid #AAA";
            element.style.borderLeft = "1px solid #AAA";
            element.style.borderRight = "1px solid #AAA";
            element.style.marginRight = "1px";
        }
        c["scheduler.category.title"] = function (view, data, element) {
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.paddingLeft = "6px";
            element.style.paddingRight = "12px";
            element.style.paddingBottom = "6px";
            if (data.index % 2 != 0) element.style.backgroundColor = "#FAFAFA";
            element.innerHTML = data.value + " (" + data.items.length + " events)";
            element.style.borderBottom = "1px solid #AAA";
            element.style.minWidth = "90px";
        }

        c["scheduler.body"] = function (view, data, element) {
            element.style.borderRight = "1px solid #AAA";
            element.style.borderBottom = "1px solid #AAA";
        }
        c["scheduler.body.category"] = function (view, data, element) {
            if (data.index % 2 != 0) element.style.backgroundColor = "#FAFAFA";
            element.style.borderBottom = "1px solid #AAA";
        }

        c["scheduler.body.cell"] = function (view, data, element) {
            element.style.borderLeft = "1px solid " + (data.index == 0 ? "#AAA" : "#EEE");
        
        }

        window.$sej.utils.log("{themes}", "Registered themes for SCHEDULER.*");

    })(window.$sej.themes);


    // ---------------------------- Themes for DAY VIEW  ------------------------------ /
    (function (c) {
        c["days.header"] = function (view, data, element) {
            element.style.borderBottom = "1px solid #CFCFCF";                                                     // Set a bottom border
        }

        c["days.body"] = function (view, data, element) {
            element.style.borderBottom = "1px solid #CFCFCF";                                                     // Set a bottom border
        }

        
        c["day.body"] = function (view, data, element) {
            element.style.marginLeft="30px";
        }

        c["days.tickerTitle"] = function (view, data, element) {
        }


        c["days.dayTitle"] = function (view, data, element) {
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.textAlign = "center";
            var l = data.date.toString().split(" ")
            element.innerHTML = l[0] + ", " + l[1] + " " + l[2];
        }

        c["days.cell"] = function (view, data, element) {
            if (data.index == 0) return;
            if (data.index % 2 == 0) element.style.borderTop = "1px solid #DFDFDF";                                                     // Set a bottom border
            else element.style.borderTop = "1px dashed #EFEFEF";
        }

        c["days.tick"] = function (view, data, element) {
            element.style.borderRight = "1px solid #CFCFCF";

            if (data.index % 2 != 0) return;
            if (data.index > 0) element.style.borderTop = "1px solid #DFDFDF";                                                     // Set a bottom border
            var m = data.start.getMinutes();
            if (m < 10) m = "0" + m; else m = m.toString();
            var h = data.start.getHours();
            if (h < 10) h = "0" + h; else h = h.toString();

            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.textAlign = "right";
            element.style.verticalAlign = "top";
            element.innerHTML = h + ":" + m + "&nbsp;&nbsp;&nbsp;";
        }

        c["days.event"] = function (view, data, element) {
            element.className = "CSSshadow ";
            element.style.border = "1px solid #333";
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.fontSize = "9px";
            element.style.overflow = "hidden";
            var h = data.start.getHours();
            var m = data.start.getMinutes();
            var t0 = (h < 10 ? "0" + h : h).toString() + (m < 10 ? "0" + m : m);

            var h = data.end.getHours();
            var m = data.end.getMinutes();
            var t1 = (h < 10 ? "0" + h : h).toString() + (m < 10 ? "0" + m : m);

            if (data.color) element.style.backgroundColor = data.color; else element.style.backgroundColor = "lightyellow";
            
            element.innerHTML = t0+"-"+t1+"<br>"+data.title + "<br>";
            //console.log(data);
        }
    })(window.$sej.themes);

    // Global theme function
    window.$sej.theme=function (view, data, what, element) {                                                                // In view, using data, apply theme what to element
        var f = view.config.themes[what];                                                                                   // Get theme function from view config    
        var f0 = window.$sej.themes[what];                                                                                  // Get theme function from global 
        if (f) {                                                                                                            // If got a current function    
            if (f0 == f) f0 = null;                                                                                         // If f==f0 then they are the same, we do not need f0
            var k = f(view, data, element, f0);                                                                             // Call f
            if (k) return k; else return element;                                                                           // return result of f or element    
        }
        if (f0) {
            var k = f0(view, data, element);                                                                                // Call f0
            if (k) return k; else return element;                                                                           // return result of f0 or element    
        }
        return element;                                                                                                     // Return element
    }
})();