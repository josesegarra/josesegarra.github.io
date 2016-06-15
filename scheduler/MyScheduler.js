// This the Scheduler Factury Object
var $SejScheduler= (



    // Everything is defined in a function, nothing gets added to the namespace
    function () {
        if (!console) console={log:function(s){;}};


        var $EX = { utils: { DOM: {}, dateTime: {} } , views: {} , schedulers:[]  };                        //  This is is the library object
        var scrollBarWidth = 15;                                                                            // Initially some likely value. It will be calculated on libInit

        // Define $EX utils methods. This is enclosed in a function to use VS collapse view
        (function () {
            var dom = $EX.utils.DOM, time = $EX.utils.dateTime;                                               // Just plain Shortcuts to make this code smaller
            function toInt(x) {                                                                             // Helper function
              if (!x) return 0;
              return parseInt(x,10);
            }

            //  ------------------ Handle scroll bar width
            document.addEventListener("readystatechange",                                                   // Must be done after DOM is ready
                function () {
                    if (document.readyState != "interactive") return;                                                       // If not ready exit
                    var scrollDiv = document.createElement("div");                                          // Create a DIV
                    scrollDiv.style.width = "100px";scrollDiv.style.height = "100px";                       // Fix DIV size
                    scrollDiv.style.overflow = "scroll"; scrollDiv.style.position = "absolute";             // Force a scroll bar
                    scrollDiv.style.top = "-9999px";                                                        // So be it
                    document.body.appendChild(scrollDiv);                                                   // Append to DOM (so it gets rendered)
                    scrollBarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;                         // Calculate Scrollbar width
                    document.body.removeChild(scrollDiv);                                                   // Remove from DOM
                    $EX.utils.log("{ready}", "using {" + scrollBarWidth + "} as scroll bar width: ");       // Plain log
                }
            );

            dom.scrollWidth = function (parent) {                                                           // Returns scrollbar width
                return scrollBarWidth;
            }

            dom.size= function (element,width,height) {                                                           // Returns scrollbar width
                if (width) {
                    element.style.width = width;
                }
                if (height) {
                    element.style.height = height;
                 }
                return element;
            }

            dom.stackH = function (a,expand) {
                var l = 0;
                var k1 = a.scrollHeight;

                dom.loop(a, function (t) {
                    var k0 = (expand ? k1 - dom.getHeightOuter(t):0);
                    dom.position(t, l, 0, null, -k0);
                    l = l + dom.getWidthOuter(t);
                });
            }

            dom.table = function (where, nCols, nRows,noExpand) {
                var rows= [];
                var table = dom.createDiv(where, "table");
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


            dom.position = function (c, l, t, r, b) {
                c.style.position = "absolute";
                if (l != null) c.style.left = l + "px";
                if (t != null) c.style.top = t + "px";
                if (r != null) c.style.right = r + "px";
                if (b != null) c.style.bottom = b + "px";
                return c;
            }

            dom.createDiv = function (parent,display) {                                                             // Helper to create a DIV element
                var r0 = document.createElement('DIV');
                parent.appendChild(r0);
                if (display) r0.style.display = display;
                return r0;
            }


            dom.createText = function (parent,text) {                                                       // Helper to create a text SPAN
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

            dom.getHeightOuter=function (elm) {
                var m = elm.offsetHeight;
                if (getComputedStyle) {
                    var style = getComputedStyle(elm);
                    m=m+toInt(style.marginTop)+toInt(style.marginBottom);
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
                if (!f) return;
                if (Object.prototype.toString.call(node) === '[object Array]') {
                    for (var i = 0; i < node.length; i++) f(node[i], data, i);
                    return;
                }
                if (node.firstChild) {
                    node = node.firstChild;
                    var k = 0;
                    while (node && k < 1000) {
                        f(node,data,k);
                        k++;
                        node = node.nextSibling;
                    }
                    return;
                }
            }

            dom.getNonClientHeight = function (el) {                               // Get non client heights
                var style = getComputedStyle(el);                                                           // This is the computed style
                var m = toInt(style.paddingTop) + toInt(style.paddingBottom) +                        // Get padding height
                        toInt(style.borderTopWidth) + toInt(style.borderBottomWidth)+                         // Get border height
                        toInt(style.marginBottom) + toInt(style.marginBottom);                        // Get margin height
                return m;
            }

            dom.setHeightOuter = function (el, newH) {                                                          // Set hieght of an element
                newH = newH - dom.getNonClientHeight(el);
                if (newH < 0) newH = 0;
                el.style.minHeight= newH + "px";
                el.style.maxHeight = newH + "px";
                return newH;
            }


            // ------------- Date/Time utils
            time.dateToString = function (date1) {
                var day1 = date1.getDate();
                var mon1 = (1+date1.getMonth());
                var year1 = date1.getFullYear();
                return year1 + (mon1 < 10 ? "0" + mon1 : mon1).toString() + (day1 < 10 ? "0" + day1 : day1);
            }

            time.timeToString = function (time,use24) {
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

            time.dateAt = function (date,h, m) {
                var d = new Date(date);
                d.setHours(h, m, 0, 0);
                return d;
            }

            // ------------- Generic utils
            $EX.utils.log = function (from, message) {
                if (!from) from = " ";
                from = from + Array(50).join(" ");
                from = from.substring(0, 50);
                console.log(from + message);
            }

            $EX.utils.createId = function () {
                var d = new Date();
                return "_" + d.getFullYear() + d.getMonth() + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds() + d.getSeconds();
            }

            $EX.utils.o2s = function (data) {
                var r = "";
                for (var s in data) r = r + "|" + s + ": " + data[s] + " \n";
                return r;
            }

            $EX.utils.p2array = function (data,sorted) {
                var r = [];
                for (var s in data) r.push(s);
                if (sorted) r.sort();                                              // Sort all key points
                return r;
            }

            $EX.utils.clone = function tclone(obj) {
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

            // ------------------ Implements a set
            $EX.utils.set = function () {
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

                h.remove=function(k) {
                    var i = 0;
                    while (i < this.length) {
                        if (this[i] == k) { this[i] = null; return; }
                        i++;
                    }
                }
                return h;
            }

            $EX.utils.setToStr = function (h) {
                var i = 0;
                var r = "";
                while (i < h.length) {
                    if (h[i] == null) r = r + "_"; else r = r + "#";
                    i++;
                }
                return r;
            }


        })();


        // Helper to add Event support to a scheduler
        function addEventSupport(sch) {
            sch.listeners = {};                                                                             // The scheduler has a listeners object
            sch.addListener = function (name, f) {                                                          // addListener. adds a function [f] to be executed when event [name] is raised
                var fname = (f.name ? f.name : "__anonymous__");
                var e = this.listeners[name];
                if (!e) this.listeners[name] = e = [];
                e.push(f);
                $EX.log(this.id + ".addListener", "listener {" + fname + "} for event '" + name + "'");
            }
            sch.raiseEvent = function (name, data) {                                                        // Raises event [name] wihd data [data]
                $EX.log(this.id + ".raiseEvent", "Event '" + name + "'");
                var e = this.listeners[name]; if (!e) return;
                for (var i = 0; i < e.length; i++) e[i](this, data);
            }
        }


        // Internally adds a resize event handler. The only universally supported resize event is on the windows Object, so this is what we monitor !!
        function addResizeHandler(c, d, f) {
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
            window.addEventListener("resize", fDelay);                                                                        // Add fhandler as an event listerner to window.resize
        }



        // This method registers a view
        $EX.registerView= function (thisView) {
            if (!thisView || !thisView.id) { alert("Missing [id] property when in View definition"); return; };
            var s = thisView.id.toString();
            if (!s) { alert("Missing [id] property when in View definition"); return; };
            this.views[s] = thisView;
            $EX.utils.log("{registerView}", "registered view '" + s + "'");
        }

        // This method returns a view
        $EX.getView = function (viewName) {
            return this.views[viewName];
        }

        function Resized(data, w, h) {
            if (!w) w = $EX.utils.DOM.getWidthInner(data.host);
            if (!h) h=$EX.utils.DOM.getHeightInner(data.host);
            data.SizeW = w;                                                                                                 // This is the H space we have
            data.SizeH = h;                                                                                                 // This is the V space we have

            for (var i = 0; i < data.views.length; i++) {                                                                   // Loop all the views
                data.views[i].posx = data.scrollX + i * w;
            }

            for (var i = 0; i < data.views.length; i++) {                                                                   // Loop all the views
                var v = data.views[i];                                                                                      // Get each view
                v.posx = data.scrollX + i * w;
                v.host.style.left = v.posx+ "px";
                v.host.style.minWidth = w + "px";
                v.host.style.maxWidth = w + "px";
                if (v.instance.resize) v.instance.resize();
            }
            if (data.currentView) {
                console.log("ZEROING!!");
                data.host.style.left = -data.currentView.posx + "px";
            }
            console.log("Resize " + w + "," + h);
        }



        // This method creates a scheduler component in a host element
        $EX.create = function (host) {
            var sch = { scrollX: 0 , views:[] };                                                                                   // This is the created component
            sch.id = "scheduler" + $EX.utils.createId();
            addEventSupport(sch);
            sch.addData = function (d) {
                this.data = d;
            }

            var bodyCell = $EX.utils.DOM.table(host, 1, 1)[0][0];                                                           // Let's create a DIV which is relative positioned and fills all HOST
            bodyCell.style.height = "100%";                                                                                 // This DIV fills all available space in host
            var div = $EX.utils.DOM.size($EX.utils.DOM.createDiv(bodyCell), "100%", "100%");                                // Add filing 100%
            div.style.position = "relative";                                                                                // Make it RELATIVE so that further ABSOLUTE positioning have this as ROOT
            div.style.overflow = "hidden";                                                                             // This will overflow !!!
            sch.host = $EX.utils.DOM.position($EX.utils.DOM.createDiv(div), 0, 0, 0, 0);                                    // Create an ABSOLUTE filling everything
            sch.host.style.overflow = "hidden";                                                                             // This will overflow !!!

            addResizeHandler(sch.host, sch, Resized);                                                                       // Whenever this DIV changes Resized will be called


            sch.show = function (k) {
                var v = this.views[k];
                if (!v) return;                                                                                             // View not found
                if (v == this.currentView) return;
                var nsteps = 50;
                var ms = 5;
                var ms2 = 2*ms;
                console.log("TIME " + ms);
                var o = { div: this.host, nsteps: nsteps, offx: (this.scrollX - v.posx) / nsteps, sch: this, temp: this.scrollX, finalx: v.posx, dest: v , paso:1};
                if (this.scrollX !=0) o.offx = -o.offx; // Moving right instead of left
                o.last = new Date();
                var interval = setInterval(
                    function () {
                        o.nsteps = o.nsteps - o.paso;
                        o.temp = o.temp + o.offx;
                        o.div.style.left = o.temp + "px";
                        // Time it took to process the last step. If is more than twice ms then increase PASO
                        var d = new Date();
                        var k = d - o.last;
                        //if (k > ms2) o.paso = o.paso + 1;
                        o.last = d;
                        if (o.nsteps <= 0) {
                            clearInterval(interval);
                            o.div.style.left = -o.finalx + "px";
                            o.sch.scrollX = -o.finalx;
                            o.sch.currentView = o.dest;
                        }
                    }, ms);
                return;
            };

            sch.createView = function (viewName, config, name) {
                var viewDef = $EX.views[viewName];
                if (!viewDef) {
                    alert("Unregistered view {" + viewName + "}");
                    return;
                }
                var l=this.views.length*800;
                var div = $EX.utils.DOM.position($EX.utils.DOM.createDiv(this.host), l, 0, null, 0);
                div.style.maxWidth= "800px";
                div.style.minWidth = "800px";

                var viewInstance = viewDef.create(this, div, config);
                if (!viewInstance) {
                    alert("Could not create view {" + viewName+"}");
                    return;
                }
                $EX.utils.log(this.id+".createView", "created view of type '"+viewName+"'");

                var viewWrapper = { instance: viewInstance, host: div, name: name, kind: viewName };
                this.views.push(viewWrapper);
                Resized(sch);

                return viewInstance;
            }
            return sch;
        }
       return $EX;
})();
