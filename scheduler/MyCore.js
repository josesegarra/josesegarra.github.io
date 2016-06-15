(
    // Everything is defined in a function, nothing gets added to the namespace
    function () {
        if (window.$sej) return;
        

        var $EX = { utils: { DOM: {}, dateTime: {} }, themes: {}, controls: {}  };                                                                //  This is is the library object
        var scrollBarWidth = 15;                                                                            // Initially some likely value. It will be calculated on libInit
        var version="v.08 2015-may-21"
        var utils=$EX.utils;
        var dom = utils.DOM, time = utils.dateTime;                                               // Just plain Shortcuts to make this code smaller
        function toInt(x) {                                                                             // Helper function        
            if (!x) return 0;
            return parseInt(x, 10);
        }

        //  ------------------ Handle scroll bar width
        document.addEventListener("readystatechange",                                                   // Must be done after DOM is ready
                function () {
                    if (document.readyState != "interactive") return;                                                       // If not ready exit
                    var scrollDiv = document.createElement("div");                                          // Create a DIV
                    scrollDiv.style.width = "100px"; scrollDiv.style.height = "100px";                       // Fix DIV size
                    scrollDiv.style.overflow = "scroll"; scrollDiv.style.position = "absolute";             // Force a scroll bar
                    scrollDiv.style.top = "-9999px";                                                        // So be it
                    document.body.appendChild(scrollDiv);                                                   // Append to DOM (so it gets rendered)
                    scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;                         // Calculate Scrollbar width
                    document.body.removeChild(scrollDiv);                                                   // Remove from DOM
                    utils.log("{ready}", "using {" + scrollBarWidth + "} as scroll bar width: ");       // Plain log
                }
            );

        // Create DOM utils
        (function(){
            dom.scrollWidth = function (parent) {                                                           // Returns scrollbar width 
                return scrollBarWidth;
            }

            dom.size = function (element, width, height) {                                                           // Returns scrollbar width 
                if (width) element.style.width = width;
                if (height) element.style.height = height;
                return element;
            }
        
            // Stacks absolute positioned children of a horizontally. If a width is given then assign it
            dom.stackH = function (a, width) {
                var l = 0;
                dom.loop(a, function (t) {
                    dom.position(t, l, 0, null, 0);
                    l = l + dom.getWidthOuter(t);
                    if (width) dom.setWidthOuter(t, width);
                });
            }
        
            dom.table = function (where, nCols, nRows, noExpand) {
                var rows = [];
                var table = dom.createDiv(where, "table");
                table.style.borderCollapse = "collapse";
                table.style.borderCollapse = "separate";
                table.style.borderSpacing = "0px";
                if (!noExpand) table = dom.size(table, "100%", "100%");
                while (nRows > 0) {
                    var row = dom.createDiv(table, "table-row");
                    var cells = [];
                    while (nCols > 0) {
                        cells.push(dom.createDiv(row, "table-cell"));
                        nCols--;
                    }
                    rows.push(cells);
                    nRows--;
                }
                return rows;
            }
        
            dom.positionLW = function(c,l,w,T){
                c.style.left = l + "px";
                c.style.width = w+ "px";
            }

            dom.position = function (c, l, t, r, b) {
                c.style.position = "absolute";
                if (l != null) c.style.left = l + "px";
                if (t != null) c.style.top = t + "px";
                if (r != null) c.style.right = r + "px";
                if (b != null) c.style.bottom = b + "px";
                return c;
            }

            dom.createDiv = function (parent, display) {                                                             // Helper to create a DIV element
                var r0 = document.createElement('DIV');
                parent.appendChild(r0);
                if (display) r0.style.display = display;
                return r0;
            }

            dom.createText = function (parent, text) {                                                       // Helper to create a text SPAN
                var r0 = document.createElement('SPAN');
                parent.appendChild(r0);
                r0.innerHTML = text;
                return r0;
            }

            dom.getNonClientWidth = function (el) {                               // Get non client heights
                var style = getComputedStyle(el);                                                           // This is the computed style
                var m = toInt(style.paddingLeft) + toInt(style.paddingRight) +                        // Get padding height     
                        toInt(style.borderLeftWidth) + toInt(style.borderRightWidth) +                          // Get border height
                        toInt(style.marginLeft) + toInt(style.marginRight);                        // Get margin height
                return m;
            }

            dom.setWidthOuter = function (el, newH) {                                   // Set width of an element. The flags mark if the new height includes them
                newH = newH - dom.getNonClientWidth(el);
                if (newH < 0) newH = 0;
                el.style.minWidth = newH + "px";
                el.style.maxWidth = newH + "px";
                return newH;
            }

            dom.setWidthInner = function (el, newH) {                                   // Set width of an element. The flags mark if the new height includes them
                el.style.minWidth = newH + "px";
                el.style.maxWidth = newH + "px";
                return newH;
            }

            dom.getHeightInner = function (el) {
                var m = el.clientHeight;                                                                     // This is the element height including padding (but not border & padding)
                if (getComputedStyle) {
                    var style = getComputedStyle(el);                                                        // This is the computed style
                    m = m - toInt(style.paddingTop) - toInt(style.paddingBottom);                           // If padding is not included remove it
                }
                return m;
            }


            dom.getWidthInner = function (el) {
                var m = el.clientWidth;                                                                     // This is the element height including padding (but not border & padding)
                if (getComputedStyle) {
                    var style = getComputedStyle(el);                                                        // This is the computed style
                    m = m - toInt(style.paddingLeft) - toInt(style.paddingRight);                           // If padding is not included remove it
                }
                return m;
            }

            dom.getWidthOuter = function (elm) {
                var m = elm.offsetWidth;
                if (getComputedStyle) {
                    var style = getComputedStyle(elm);
                    m = m + toInt(style.marginLeft) + toInt(style.marginRight);
                }
                return m;
            }

            dom.getHeightOuter = function (elm) {
                var m = elm.offsetHeight;
                if (getComputedStyle) {
                    var style = getComputedStyle(elm);
                    m = m + toInt(style.marginTop) + toInt(style.marginBottom);
                }
                return m;
            }

            dom.setSameWidth = function (p0, p1) {
                var t0 = dom.getWidthOuter(p0);
                var t1 = dom.getWidthOuter(p1);
                if (t0 == t1) return t0;
                if (t0 > t1) {
                    dom.setWidthOuter(p1, t0);
                    return t0;
                }
                dom.setWidthOuter(p0, t1);
                return t1;
            }

            dom.setSameHeight = function (p0, p1) {
                var t0 = dom.getHeightOuter(p0);
                var t1 = dom.getHeightOuter(p1);
                if (t0 == t1) return t0;
                if (t0 > t1) {
                    dom.setHeightOuter(p1, t0);
                    return t0;
                }
        
                dom.setHeightOuter(p0, t1);
                return t1;
            }

            dom.loop = function (node, f, data) {
                if (!node) return;
                if (!f) return;
                if (Object.prototype.toString.call(node) === '[object Array]') {
                    for (var i = 0; i < node.length; i++) f(node[i], data, i);
                    return;
                }
                if (node.firstChild) {
                    node = node.firstChild;
                    var k = 0;
                    while (node && k < 1000) {
                        f(node, data, k);
                        k++;
                        node = node.nextSibling;
                    }
                    return;
                }
            }

            dom.getNonClientHeight = function (el) {                               // Get non client heights
                var style = getComputedStyle(el);                                                           // This is the computed style
                var m = toInt(style.paddingTop) + toInt(style.paddingBottom) +                        // Get padding height     
                        toInt(style.borderTopWidth) + toInt(style.borderBottomWidth) +                         // Get border height
                        toInt(style.marginBottom) + toInt(style.marginBottom);                        // Get margin height
                return m;
            }

            dom.setHeightOuter = function (el, newH) {                                                          // Set hieght of an element
                newH = newH - dom.getNonClientHeight(el);
                if (newH < 0) newH = 0;
                el.style.minHeight = newH + "px";
                el.style.maxHeight = newH + "px";
                return newH;
            }

            dom.setHeightInner = function (el, newH) {                                   // Set width of an element. The flags mark if the new height includes them
                el.style.minHeight= newH + "px";
                el.style.maxHeight= newH + "px";
                return newH;
            }

            dom.setSizeOuter = function (el, newW, newH) {                                                          // Set hieght of an element
                dom.setWidthOuter(el, newW);
                dom.setHeightOuter(el, newH);

                return el;
            }
            // Internally adds a resize event handler. The only universally supported resize event is on the windows Object, so this is what we monitor !!
            dom.onResize=function (element, data, func) {
                var w = element.clientWidth, h = element.clientHeight;                                                                          // Get current width-height of element C
                var resizeTimer;
                var fDelay = function () {                                                                                          // Recalculating every position might take time.
                    clearTimeout(resizeTimer);                                                                                      // So instead of recalculatin on every resize step
                    resizeTimer = setTimeout(function () {                                                                          // I am using a timer. The timer gets cleared on every resize step
                        var w1 = element.clientWidth, h1 = element.clientHeight;                                                                // After 0,250 seconds of last resize step the timer fires !!!
                        if (h1 != h || w1 != w) {                                                                                   // If no change has been in dimensions of component C nothing happens
                            h = h1;
                            w = w1;
                            func(data, element,w, h);
                        }
                    }, 50);
                }
                window.addEventListener("resize", fDelay);                                                                        // Add fhandler as an event listerner to window.resize
            }


            dom.addResizeHandler = function (c, d, f) {
                var w = c.clientWidth, h = c.clientHeight;                                                                          // Get current width-height of element C
                var resizeTimer;
                var fDelay = function () {                                                                                          // Recalculating every position might take time.
                    clearTimeout(resizeTimer);                                                                                      // So instead of recalculatin on every resize step
                    resizeTimer = setTimeout(function () {                                                                          // I am using a timer. The timer gets cleared on every resize step
                        var w1 = c.clientWidth, h1 = c.clientHeight;                                                                // After 0,250 seconds of last resize step the timer fires !!!
                        if (h1 != h || w1 != w) {                                                                                   // If no change has been in dimensions of component C nothing happens
                            h = h1;
                            w = w1;
                            f(d, w, h);
                        }
                    }, 50);
                }
                window.addEventListener("resize", fDelay);                                                                          // Add fhandler as an event listerner to window.resize
            }

        })();

        // Create Date/Time utils
        (function(){
            time.dateToString = function (date1) {
                var day1 = date1.getDate();
                var mon1 = (1 + date1.getMonth());
                var year1 = date1.getFullYear();
                return year1 + (mon1 < 10 ? "0" + mon1 : mon1).toString() + (day1 < 10 ? "0" + day1 : day1);
            }

            time.timeToString = function (time, use24) {
                var h = time.getHours();
                var m = time.getMinutes();
                var t = (h < 10 ? "0" + h : h).toString() + (m < 10 ? "0" + m : m);
                if (use24 && t == "0000") t = "2400";
                return t;
            }

            time.addDays = function (fromDate, days) {
                var d1 = new Date(fromDate);
                d1.setDate(d1.getDate() + days);
                return d1;
            }

            time.addMilliSeconds = function (fromDate, ms) {
                var d1 = new Date(fromDate);
                d1.setTime(fromDate.getTime() + ms);
                return d1;
            }

            time.copyTime = function (d, ms) {
                var d1 = new Date(d);
                d1.setHours(ms.getHours());
                d1.setMinutes(ms.getMinutes());
                d1.setSeconds(ms.getSeconds());
                return d1;
            }

            time.todayAt = function (h, m) {
                var d = new Date();
                d.setHours(h, m, 0, 0);
                return d;
            }

            time.dateAt = function (date, h, m) {
                var d = new Date(date);
                d.setHours(h, m, 0, 0);
                return d;
            }

            function ExpandSlot(w, i, ml) {                                                                                         // This is a helper function in arrangeEvents  
                var tw = w[i], i0 = i;                                                                                              // This is current event wrapper, also keep start index
                tw.e.slotc = ml;                                                                                                // And slot count
                if (tw.e.slot == ml - 1) {                                                                                          // If current event wrapper is using latest slot it can't be expanded
                    tw.e.slotw = 1;                                                                                                 // So slot SIZE is 1
                    return;
                }
                var c = 999999999;                                                                                                  // Current (unassigned) number of slots to the right
                while (w[i].e != tw.e || w[i].isStart) {                                                                            // Loop all the wrappers (from current) until end of current event        
                    var j = tw.e.slot + 1;                                                                                          // We start checking one step to the right of current event
                    while (j < ml && w[i].status[j] == null) j++;                                                                   // Check how many empty slots to the right
                    var k = j - tw.e.slot - 1;                                                                                      // This is the number of free slots to the right
                    if (k < c) c = k;                                                                                               // If this number is less than current
                    i++;
                }
                tw.e.slotw = 1 + c;                                                                                                 // This is SLOT size    
            }


            time.arrangeEvents=function (events) {                                                                                  // Arranges a list of events. It receives a list of event wrappers --> event[i].item is the item !!!
                if (events.length == 0) return;                                                                                     // If there is no list then return
                events.sort(function (a, b) { if (a.item.start > b.item.start) return +1; else return -1; });                       // Let's sort the data by starting time
                
                var w = [];                                                                                                         // Here we will store all the key points (event start/event end)
                for (var i = 0; i < events.length; i++) {                                                                           // Loop all the events
                    w.push({ isStart: true, e: events[i], t: events[i].item.start });                                               // Push STAR key point
                    w.push({ isStart: false, e: events[i], t: events[i].item.end });                                                // Push END key point
                }
                w.sort(function (a, b) { if (a.t > b.t) return +1; else return -1; });                                              // Sort all key points by time
                var slots = utils.set();                                                                                            // Here we will keep used slots (each slot is a display column/row) usage
                for (var i = 0; i < w.length; i++) {                                                                                // Loop all key points (in order)
                    if (w[i].isStart) w[i].e.slot = slots.add(w[i].e); else slots.remove(w[i].e);                                   // If Key Point is START add event to slots else remove it
                    w[i].status = slots.slice();                                                                                    // Keep a copy of slots array
                }
                for (var i = 0; i < w.length; i++) if (w[i].isStart) ExpandSlot(w, i, slots.length);                                // Loop all key points (in order) and expand to right starting KeyPoints
            }

        })();

        // ------------- Generic utils
        (function () {

            utils.findInTicksList= function (value, wrapper,items,field1,field2) {
                wrapper.early = false; wrapper.late = false;                                                                        // Out of schedule flags
                if (value < items[0][field1]) {                                                                                     // If before schedule 
                    wrapper.early = true;                                                                                           // Set flag
                    return items[0];                                                                                                // Return first TICK    
                }
                if (value > items[items.length - 1][field2]) {                                                                      // If after schedule
                    wrapper.late = true;                                                                                            // Set flag
                    return items[items.length - 1];                                                                                 // Return latest tick    
                }
                for (var i = 0; i < items.length; i++)                                                                              // Loop all the ticks
                    if (items[i][field1]<= value && value < items[i][field2]) return items[i];                                      // Return whichever matches    
                alert("Internal error. Contact support !!!");                                                                       // Should never happen
            }
          
            utils.log = function (from, message) {
                if (!from) from = " ";
                from = from + Array(50).join(" ");
                from = from.substring(0, 50);
                console.log(from + message);
            }

            utils.createId = function () {
                var d = new Date();
                return "_" + d.getFullYear() + d.getMonth() + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds() + d.getSeconds();
            }

            utils.o2s = function (data) {
                var r = "";
                for (var s in data) r = r + "|" + s + ": " + data[s] + " \n";
                return r;
            }

            utils.p2array = function (data, sorted) {
                var r = [];
                for (var s in data) r.push(s);
                if (sorted) r.sort();                                              // Sort all key points
                return r;
            }

            utils.clone = function tclone(obj) {
                if (obj === null || typeof (obj) !== 'object')
                    return obj;

                var temp = obj.constructor(); // changed

                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        temp[key] = tclone(obj[key]);
                    }
                }
                return temp;
            }

            utils.set = function () {
                var h = [];
                h.add = function (k) {
                    var i = 0;                                                      // Starting from 0
                    while (i < this.length) {                                       // Loop all the items    
                        if (this[i] == null) { this[i] = k; return i; }             // If an item is null, use it to store the data and return the item index
                        i++;                                                        // else move to next item
                    }
                    this.push(k);
                    return this.length - 1;
                };

                h.remove = function (k) {
                    var i = 0;
                    while (i < this.length) {
                        if (this[i] == k) { this[i] = null; return; }
                        i++;
                    }
                }

                h.count = function () {
                    return this.length;
                }
                return h;
            }

            utils.setToStr = function (h) {
                var i = 0;
                var r = "";
                while (i < h.length) {
                    if (h[i] == null) r = r + "_"; else r = r + "#";
                    i++;
                }
                return r;
            }

            utils.timer= function (steps, interval, onAction, onDone,data) {
                if (!onAction) return;
                var interval = setInterval(
                    function () {
                        if (steps>0) onAction(data,steps);
                        else {
                            clearInterval(interval);
                            if (onDone) onDone(data);
                        }
                        steps=steps-1;
                    }, interval);
            }


        })();


        $EX.register = function (name, factory) {
            $EX.controls[name] = factory;
        }

        $EX.create = function (name, where,config) {
            var t = $EX.controls[name];
            if (!t) {
                alert("Name not registered: [" + name + "]");
                return;
            }
            return t.create(where,config);
        }

        $EX.config= function (name) {
            var t = $EX.controls[name];
            if (!t) {
                alert("Name not registered: [" + name + "]");
                return;
            }
            return $EX.utils.clone(t.config);
        }

        $EX.version = function () {
            return version;
        }
        window.$sej = $EX;
    })();
