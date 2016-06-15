(function () {
    var viewFactory = { id: "scheduler" };                                                                                       // This is the viewFactory object
    if (!window.$SejScheduler) {
        alert("Object not available {window.$SejScheduler}");
        return;
    }
    var $L = window.$SejScheduler.utils;                                                                                    // Plain shortcuts to factory
    var $D = $L.DOM,$T = $L.dateTime;
    var $CD = $D.createDiv;

    viewFactory.config = {
        number_days: 2,                                                                                                     // Number of days to display
        start: { h: 00, m: 0 },                                                                                             // Start time of ticker panel
        end: { h: 23, m: 59 },                                                                                              // End time of ticker panel
        interval: 60,                                                                                                       // Tick interval in minutes
        min_tick_width: 25,                                                                                                 // Minimum tick height. If all ticks fit in available space then ticks height will expand, otherwise scroll
        themes: {}
    };

    // Init themes
    (function (c) {

        c.themes["scheduler.title"] = function (view, data, element) {
            element.style.borderTop = "1px solid #AAA";
            element.style.borderBottom = "1px solid #AAA";
            element.style.borderRight = "1px solid #AAA";
            element.style.borderLeft = "1px solid #AAA";
            element.style.marginRight = "1px";
        }

        c.themes["scheduler.header"] = function (view, data, element) {
            element.style.borderTop = "1px solid #AAA";
            element.style.borderRight = "1px solid #AAA";
        }

        c.themes["scheduler.event"] = function (view, data, element) {
            element.style.border = "1px solid #333";
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.fontSize = "9px";
            element.style.overflow = "auto";

            element.className = "CSSshadow ";
            element.innerHTML = data.room + "<br>" + $T.timeToString(data.start) + "-" + $T.timeToString(data.end);
        }



        c.themes["scheduler.category"] = function (view, data, element) {
            element.style.borderRight = "1px solid #AAA";
            element.style.borderBottom= "1px solid #AAA";
            element.style.borderLeft= "1px solid #AAA";
            element.style.marginRight = "1px";
        }

        c.themes["scheduler.category.title"] = function (view, data, element) {
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.paddingLeft = "6px";
            element.style.paddingRight = "12px";
            element.style.paddingBottom = "6px";
            if (data.index % 2 != 0) element.style.backgroundColor = "#FAFAFA";
            element.innerHTML = data.value +" ("+data.items.length+")";
            element.style.borderBottom= "1px solid #AAA";
            element.style.minWidth = "90px";
        }


        c.themes["scheduler.header.item"] = function (view, data, element) {
            element.style.backgroundColor = "#EEE";
            element.style.borderBottom = "1px solid #AAA";
        }

        c.themes["scheduler.header.day"] = function (view, data, element) {
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.textAlign = "center";
            element.style.padding= "8px";
            element.innerHTML = $T.dateToString(data);
            element.style.borderLeft = "1px solid #AAA";
        }

        c.themes["scheduler.header.times"] = function (view, data, element) {
            element.style.borderTop = "1px solid #AAA";
        }


        c.themes["scheduler.header.tick"] = function (view, data, element) {
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.textAlign = "center";

            element.innerHTML = $T.timeToString(data.start).substring(0, 2);                                                                               // Each ticket has a TIME0 = starting time
            element.style.padding = "4px";
            element.style.borderLeft = "1px solid #AAA";
        }

        c.themes["scheduler.body"] = function (view, data, element) {
            element.style.borderRight = "1px solid #AAA";
            element.style.borderBottom= "1px solid #AAA";
        }

        c.themes["scheduler.body.category"] = function (view, data, element) {
            if (data.index % 2 != 0) element.style.backgroundColor = "#FAFAFA";
            element.style.borderBottom = "1px solid #AAA";
        }

        c.themes["scheduler.body.cell"] = function (view, data, element) {
            element.style.borderLeft = "1px solid " + (data.index == 0 ? "#AAA" : "#EEE");
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.textAlign = "center";

        }

    })(viewFactory.config);

    function theme(view,data, what, element) {                                                                              // In view, using data, apply theme what to element
        var f = view.config.themes[what];                                                                                   // Get theme function from view config
        var f0 = viewFactory.config.themes[what];                                                                           // Get theme function from default config
        if (f) {                                                                                                            // If got a current function
            if (f0 == f) f0 = null;                                                                                         // If f==f0 then disable f0
            var k = f(view, data, element,f0);                                                                              // Call f
            if (k) return k; else return element;                                                                           // return result of f or element
        }
        if (f0) {
            var k = f0(view, data, element);                                                                                // Call f0
            if (k) return k; else return element;                                                                           // return result of f0 or element
        }
        return element;                                                                                                     // Return element
    }


    function getTimeInfo(config, date) {
        var time_start = $T.dateAt(date, config.start.h, config.start.m);                                                   // This is starting time
        var time_end = $T.dateAt(date, config.end.h, config.end.m);                                                         // This is ending time
        var steps = Math.abs(time_end.getTime() - time_start.getTime()) / 60000;                                            // This is the number of minutes between start & end
        steps = Math.round(steps / config.interval);                                                                        // This is the number of intervals between start & end
        var ns = config.interval * 60000;                                                                                   // Tick interval from minutes to milliseconds
        return { start: time_start, steps: steps, offsetMs: ns };
    }


    function InitDay(v, item, date) {
        var day = theme(v, date, "scheduler.header.day", $CD(item));                                                        // For each Header Item create a DIV for the date
        var times = theme(v, date, "scheduler.header.times", $CD(item));                                                    // And a DIV for the times
        times.style.whiteSpace = "nowrap";                                                                                  // Which will expand horizontally
        var tinfo = getTimeInfo(v.config, date);                                                                            // Get time info for this day
        var i1 = tinfo.start;                                                                                               // Starting time
        for (var i = 0; i < tinfo.steps; i++) {                                                                             // Loop all the steps
            var tick = { index: i, start: i1, end: $T.addMilliSeconds(i1, tinfo.offsetMs) };                                // For each step, add it to the array of steps
            tick.$body = theme(v, tick, "scheduler.header.tick", $CD(times));                                               // Create a DIV for the ticket
            tick.$body.style.display= "inline-block";                                                                       // Time display is inline
            v.ticker.push(tick);                                                                                            // For each step, add it to the array of steps
            i1 = tick.end;                                                                                                  // currentTime = currentTime + TickInterval
        }
    }


    function InitHeader(v) {

        v.$title = $D.size($D.position(theme(v, v, "scheduler.title", $CD(v.owner)),0,0),100);                              // This is the title
        v.$header = $D.position(theme(v, v, "scheduler.header", $CD(v.owner)),100,0,0,null);                                // This is the header
        v.$header.style.overflowX = "hidden";
        v.$header.style.whiteSpace = "nowrap";                                                                                 // Which will expand horizontally

        var d = v.date, j = v.config.number_days;                                                                            // Loop all visible dates
        while (j > 0) {
            var item = theme(v, d, "scheduler.header.item", $CD(v.$header));                                                    // For each day create a Header Item
            item.style.display = "inline-block";
            item.style.position = "relative";
            InitDay(v, item, d);
            d = $T.addDays(d, 1);
            j--;
        }
    }


    function setCategories(f) {
        this.categories = {};
        for (var i = 0; i < this.scheduler.data.length; i++) {
            var c = (f ? f(this.scheduler.data[i]) : "default");
            c = c || "default";
            if (!this.categories[c]) this.categories[c] = [];
            this.categories[c].push(this.scheduler.data[i]);
        }
        InitDisplay(this);
    }


    function InitEvents(view, cd, where) {
        for (var i = 0; i < cd.items.length; i++) {
            var w = theme(view,cd.items[i],"scheduler.event",$CD(where));
            $D.position(w,i*100);
            view.events.push({ $body: w, item: cd.items[i] });
        }
    }



    function InitDisplay(v) {
        v.$categories.innerHTML = "";                                                                                       // Remove categories display
        v.events = [];
        var c = $L.p2array(v.categories, true);                                                                             // Get all categories sorted by name
        for (var i = 0; i < c.length; i++) {                                                                                // Loop all categories
            var cd = { index: i, value: c[i] , items: v.categories[c[i]] };                                                 // This is a category object
            var t = theme(v, cd, "scheduler.category.title", $CD(v.$categories));                                           // Create a category title
            t.style.position = "relative";
            var d = theme(v, cd, "scheduler.body.category", $CD(v.$body));                                                  // Create a category view

            d.style.whiteSpace = "nowrap";
            for (var j = 0; j < v.ticker.length; j++) {
                var cell = theme(v, v.ticker[j], "scheduler.body.cell", $CD(d));                                            // Create a DIV for the ticket
                cell.style.display = "inline-block";                                                                        // The cell displays online
            }
            InitEvents(v,cd, d);
        }
        ResizeView(v);
    }

    function ResizeView(v) {
        var topHeight = $D.setSameHeight(v.$title, v.$header);
        var leftWidth = $D.setSameWidth(v.$title, v.$categories);
        $D.position(v.$body, leftWidth, topHeight);
        $D.position(v.$header, leftWidth);

        var used = leftWidth + $D.getNonClientWidth(v.$header);
        n = v.$header.firstChild;
        while (n) {
            used = used + $D.getNonClientWidth(n) + $D.getNonClientWidth(n.firstChild.nextSibling);
            n = n.nextSibling;
        }
        aw = $D.getWidthInner(v.owner) - used;                                                                          // Available width for ticks
        var tw = (aw / v.ticker.length);                                                                                // This is calculated tick width
        if (tw < v.config.min_tick_width) {                                                                             // If this width is less than tick width
            tw = v.config.min_tick_width;                                                                               // Set as minimum
        }
        $D.loop(v.ticker, function (k) { $D.setWidthOuter(k.$body, tw); });                                             // Set width for ticks !!!
        v.ticker.tickWidth = tw;                                                                                        // Keep current WIDTH
        $D.loop(v.$categories, function (node, data, k) {                                                               // Lets loop all the categories
            var bv = data.$body.childNodes[k];                                                                          // Get the view for a category
            var t0 = $D.setSameHeight(node, bv);                                                                        // Make categoryTitle & categoryView same height
            var h = $D.getHeightInner(bv);                                                                              // This is available categoryView height
            for (var j = 0; j < v.ticker.length; j++) {
                var cell = bv.childNodes[j];
                $D.setHeightOuter(cell, h);
                $D.setWidthOuter(cell, tw);
            }
            $D.setWidthInner(bv, v.ticker.length*tw);                                                                                  // Fix categoryView width
        }, v);
        // Now lets resize the events horizontally
        for (var i = 0; i < v.events.length; i++) {
            var $w = v.events[i].$body;
            var x1 = GetXPosition(v, v.events[i].item.start);
            var x2 = GetXPosition(v, v.events[i].item.end);
            if (x1 && x2) {
                $w.style.left = x1 + "px";
                $w.style.width = ((x2 - x1)<15 ? 15 : x2-x1) + "px";
            } else $w.style.display = "none";
        }
    }


    function GetXPosition(v, time) {
        var tick = v.ticker.getTickAt(time);
        if (!tick) return null;
        var x1 = tick.$body.offsetLeft + tick.$body.parentNode.offsetLeft + tick.$body.parentNode.parentNode.offsetLeft;
        var dm = time - tick.start;                                                                                       // TimeSpan between received time and tick start
        dm = Math.round(((dm % 86400000) % 3600000) / 60000);                                                             // Convert time span to minutes
        var dp = Math.round(dm * v.ticker.tickWidth / v.config.interval);
        return x1 + dp;
    }

    function PositionXEvent(v, event) {

        if (!x1 || !x2) {
            return;
        }

        var y = $w.parentNode.offsetTop;
        $w.style.top = y + "px";

    }

    function bodyScroll(v, e) {
        var n = v.$header.firstChild;
        var l = - v.$body.scrollLeft;
        while (n) {
            n.style.left = l + "px";
            n = n.nextSibling;
        }

        var n = v.$categories.firstChild;
        var l = -v.$body.scrollTop;
        while (n) {
            n.style.top = l + "px";
            n = n.nextSibling;
        }
    }

    viewFactory.create = function (sch, host,config) {                                                                      // This function creates a DAY view
        if (!config) config = this.config;                                                                                  // If no config received use default config
        var view = { scheduler: sch, owner: host, config: config, categories:{} , events:[]};                                           // This is the view object which holds everything related to the view

        view.date = new Date();                                                                                             // This is the starting date
        view.ticker = [];
        view.ticker.getTickAt = function (time) {
            //console.log("Getting tick for time " + time);
            for (var i = 0; i < this.length; i++) {
                //console.log("    "+i + " start: " + this[i].start);
                if (this[i].start <= time && time < this[i].end) return this[i];
            }
            return null;
        }


        view.setCategories = setCategories;
        view.resize = function () { ResizeView(this); };

        InitHeader(view);
        view.$categories = theme(view, view, "scheduler.category", $CD(host));
        view.$categories.style.overflow = "hidden";
        $D.position(view.$categories, 0, $D.getHeightOuter(view.$header), null, 0);
        view.$categories.style.minWidth = "50px";

        view.$body = theme(view, view, "scheduler.body", $CD(host));
        $D.position(view.$body, 50, $D.getHeightOuter(view.$header), 0, 0);
        view.$body.style.overflow = "auto";
        view.$body.addEventListener("scroll", function (e, t) { bodyScroll(view, e, t); });


        ResizeView(view);                                                                                                   // resize everything so it gets measured

        return view;
    }
    window.$SejScheduler.registerView(viewFactory);                                                                         // Register this view
})();
