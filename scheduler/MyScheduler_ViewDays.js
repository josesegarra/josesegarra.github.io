(function () {
    var viewFactory = { id: "days" };                                                                                       // This is the viewFactory object
    if (!window.$SejScheduler) {
        alert("Object not available {window.$SejScheduler}");
        return;
    }
    var $L = window.$SejScheduler.utils;                                                                                    // Plain shortcuts to factory
    var $D = $L.DOM,$T = $L.dateTime;
    var $CD = $D.createDiv;

    viewFactory.config = {
        number_days: 6,                                                                                                     // Number of days to display
        start: { h: 06, m: 0 },                                                                                             // Start time of ticker panel
        end: { h: 22, m: 59 },                                                                                              // End time of ticker panel
        interval: 30,                                                                                                       // Tick interval in minutes
        min_tick_height: 20,                                                                                                // Minimum tick height. If all ticks fit in available space then ticks height will expand, otherwise scroll
        themes: {}
    };

    // Init themes
    (function (c) {

        c.themes["days.header"] = function (view, data, element) {
            element.style.borderBottom = "1px solid #CFCFCF";                                                     // Set a bottom border
        }

        c.themes["days.body"] = function (view, data, element) {
            element.style.borderBottom = "1px solid #CFCFCF";                                                     // Set a bottom border
        }


        c.themes["day.body"] = function (view, data, element) {
            element.style.marginLeft="30px";
        }

        c.themes["days.tickerTitle"] = function (view, data, element) {
        }


        c.themes["days.dayTitle"] = function (view, data, element) {
            element.style.fontFamily = "Segoe UI,Arial,sans-serif";
            element.style.textAlign = "center";
            var l = data.date.toString().split(" ")
            element.innerHTML = l[0] + ", " + l[1] + " " + l[2];
        }

        c.themes["days.cell"] = function (view, data, element) {
            if (data.index == 0) return;
            if (data.index % 2 == 0) element.style.borderTop = "1px solid #DFDFDF";                                                     // Set a bottom border
            else element.style.borderTop = "1px dashed #EFEFEF";
        }

        c.themes["days.tick"] = function (view, data, element) {
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

        c.themes["days.event"] = function (view, data, element) {
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

            element.innerHTML = t0+"-"+t1+"<br>"+data.title + "<br>";
            //console.log(data);
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

    function InitHeader(v) {
        (v.ticker.$header = theme(v, day, "days.tickerTitle", $CD(v.$header))).style.display = "inline-block";              // This is the ticker header
        var d = v.date;                                                                                                     // This is the start date
        for (var i = 0; i < v.config.number_days; i++) {                                                                    // Loop all the available days
            var day = { date: d, view: v, index: i };                                                                       // This is day view definition
            (day.$header = theme(v, day, "days.dayTitle", $CD(v.$header))).style.display = "inline-block";                  // Create a day header
            v.days.push(day);                                                                                               // Push the dayview definition
            d = $T.addDays(d, 1);                                                                                           // Inc number of day
        }
    }

    function InitTicker(v) {
        (v.ticker.$body = $CD(v.$body)).style.float= "left";                     // Create the ticker area
        v.time_start = $T.todayAt(v.config.start.h, v.config.start.m);                                                      // This is starting time
        v.time_end   = $T.todayAt(v.config.end.h, v.config.end.m);                                                          // This is ending time
        var steps = Math.abs(v.time_end.getTime() - v.time_start.getTime()) / 60000;                                        // This is the number of minutes between start & end
        steps = Math.round(steps / v.config.interval);                                                                      // This is the number of intervals between start & end
        v.ticker.items= [];                                                                                                 // Display: Steps to display
        var i1 = v.time_start;                                                                                              // Starting time
        var ns = v.config.interval * 60000;                                                                                 // Tick interval from minutes to milliseconds
        for (var i = 0; i < steps; i++) {                                                                                   // Loop all the steps
            var tick = { index: i, start: i1, end: $T.addMilliSeconds(i1, ns) };                                            // For each step, add it to the array of steps
            tick.time0 = $T.timeToString(i1);                                                                               // Each ticket has a TIME0 = starting time
            tick.time1 = $T.timeToString(tick.end,true);                                                                    // And TIME1 = ending time
            tick.$body = theme(v,tick,"days.tick", $CD(v.ticker.$body));                                                    // Create a DIV for the ticket
            v.ticker.items.push(tick);                                                                                      // For each step, add it to the array of steps
            i1 = tick.end;                                                                                                  // currentTime = currentTime + TickInterval
        }
        v.ticker.getTickAt = function (time,event) {
            var t = $T.timeToString(time);                                                                                  // Using the string comparation to ignore the date component
            event.early = false; event.late = false;                                                                        // Out of schedule flags
            if (t < this.items[0].time0) {                                                                                  // If before schedule
                event.early = true;                                                                                         // Set flag
                return this.items[0];                                                                                       // Return first TICK
            }
            if (t> this.items[this.items.length-1].time1) {                                                                 // If after schedule
                event.late= true;                                                                                           // Set flag
                return this.items[this.items.length - 1];                                                                   // Return latest tick
            }
            for (var i = 0; i < this.items.length; i++)                                                                     // Loop all the ticks
                if (this.items[i].time0 <= t && t < this.items[i].time1) return this.items[i];                              // Return whichever matches
            alert("Internal error. Contact support !!!");                                                                   // Should never happen
        }

        $L.log("{days.ticker}", "ticker panel created");
    }


    function InitBody(v) {
        InitTicker(v);                                                                                                      // Body has a ticker
        for (var i = 0; i < v.days.length; i++) {                                                                           // Loop all the available days
            var day = v.days[i];                                                                                            // Get the day
            day.$body = theme(v, day,"day.body",$CD(v.$body));                                                              // Create a body for each day
            day.$body.style.float = "left";                                                                                 // Alignto left
            $D.loop(v.ticker.items, function (t) {                                                                          // Loop all the ticker children
                var k = { index: t.index, time0: t.time0, time1: t.time1, day: day };
                var c = theme(v, k, "days.cell", $CD(day.$body));                                                           // And create a day cell for each of them
                c.style.overflow = "auto";
            });
        }
        $L.log("{days.body}", "body panel created");
    }

    // Called on resize
    function ResizeView(v) {
        var sc=0;
        v.$body.style.overflowX = "visible";                                                                                // Just in case
        v.$body.style.overflowY = "hidden";                                                                                 //
        var h0 = $D.getHeightInner(v.$body);                                                                                // This is BODY height
        var h = h0 - $D.getNonClientHeight(v.ticker.$body);                                                                 // Remove non client ticker body size
        var th = h / v.ticker.items.length;                                                                                 // Each ticker should be this height
        if (th <= v.config.min_tick_height) {                                                                               // If this height is less than minimum size
            th = v.config.min_tick_height;                                                                                  // Force minimun height
            sc=$D.scrollWidth();                                                                                            // And we now that we need a scrollbar
        }
        for (var i = 0; i < v.ticker.items.length; i++) {                                                                   // Loop all the ticks
            $D.setHeightOuter(v.ticker.items[i].$body, th);                                                                 // and set their outer height
        }
        for (var i = 0; i < v.days.length; i++) {                                                                           // Loop all the available days
            v.days[i].cellH = th;                                                                                           // Keep in each day object the cellHeight
            $D.loop(v.days[i].$body, $D.setHeightOuter, th);                                                                // Set height for every cell in body
        }
        var tw = $D.getWidthOuter(v.ticker.$body);                                                                          // This the width of the ticker
        $D.setWidthOuter(v.ticker.$header,tw);                                                                              // Set ticker header width, to same value as ticker body
        var w0 = Math.floor((($D.getWidthInner(v.$header) - sc) - tw) / v.days.length);                                     // For each DAY HEADERODY
        var w = (($D.getWidthInner(v.$body) - sc) - tw);
        var w1 = Math.floor(w/ v.days.length);                                                                              // For each DAY BODY
        for (var i = 0; i < v.days.length; i++) {                                                                           // Loop all the available days
            $D.setWidthOuter(v.days[i].$header, w0);                                                                        // Set day header outer width
            $D.setWidthOuter(v.days[i].$body, w1);                                                                          // Set day body outer width
        }
        $D.stackH(v.$body);                                                                                                 // Stack body horizontally
        if (sc>0) v.$body.style.overflowY = "auto";                                                                         // Use scroll if needed

        $D.loop(v.days, function (d) {                                                                                      // Loop all days
            $D.loop(d.events, PositionEvent,d);                                                                             // Loop all events in this day and position them
        });
    }

    function CreateEvent(w, k) {
        if (!w) return;                                                                                                     // Do not create Event wrappers for NON viisble events
        var wrapper = { event: k, view: w.view };                                                                           // This is the event wrapper
        wrapper.tickStart = w.view.ticker.getTickAt(k.start , wrapper);                                                     // Get tick for event start time
        wrapper.earlyStart = wrapper.early;
        wrapper.lateStart = wrapper.late;
        wrapper.tickEnd = w.view.ticker.getTickAt(k.end, wrapper);                                                          // Get tick for event end time
        wrapper.earlyEnd= wrapper.early;
        wrapper.lateEnd = wrapper.late;
        if (wrapper.earlyStart && wrapper.earlyEnd) return;                                                                 // Starts & finishes before available schedule
        if (wrapper.lateStart && wrapper.lateEnd) return;                                                                   // Starts & finishes before available schedule
        if (!wrapper.tickStart && !wrapper.tickEnd) return;                                                                 // Partial events are not rendered
        wrapper.$body= $D.position(theme(w.view, k, "days.event", $CD(w.$body)),2, 30 * w.events.length, 2, null);          // Create the event DIV & position it
        w.events.push(wrapper);                                                                                             // Push
    }

    function getYforTime(day,time, tick) {                                                                                  // Receives a time and a tick reference, and returns Y position for that time
        var dm = time - $T.copyTime(time, tick.start);                                                                      // Time span since received EVENT and Tick.Start
        dm = Math.round(((dm % 86400000) % 3600000) / 60000);                                                               // Convert time span to minutes
        var ht = tick.$body.offsetTop;                                                                                      // TICK.PositionY
        return ht + Math.round(dm * day.cellH/ day.view.config.interval);                                                   // Convert minutes to pixels and add to TICK.PositionY and return it

    }

    function PositionEvent(w,day) {
        var y0 = (w.earlyStart ? w.tickStart.$body.offsetTop : getYforTime(day, w.event.start, w.tickStart));               // Get position Y of start time
        var y1 = (w.lateEnd ? w.tickEnd.$body.offsetTop + day.cellH : getYforTime(day, w.event.end, w.tickEnd));    // Get position Y of ending time
        w.$body.style.top = y0 + "px";                                                                                  // Set offset Y of EVENT div
        $D.setHeightOuter(w.$body, (y1-y0) - 2);
        var bw = $D.getWidthInner(day.$body) / w.slotc;                                                                  // Get SLOT size
        $D.setWidthOuter(w.$body, w.slotw * bw - 2);                                                                    // Event width = slotW*slot_size
        w.$body.style.left = (w.slot * bw) + "px";                                                                   // Event left = slot*slot_size
    }


    function ExpandSlot(w, i, ml) {
        var tw=w[i],i0=i;                                                                                                   // This is current event wrapper, also keep strat index
        if (tw.e.slot == ml - 1) {                                                                                            // If current event wrapper is using right most slot it can't be expanded
            tw.e.slotw= 1;
            tw.e.slotc = ml;
            return;
        }
        var c = 999999999;                                                                                                  // Current (unassigned) number of slots to the riht
        while (w[i].e != tw.e || w[i].isStart) {                                                                            // Loop all the wrappers (from current) until end of current event
            var j = tw.e.slot + 1;                                                                                          // We start checking one step to the right of current event
            while (j < ml && w[i].status[j] == null) j++;                                                                   // Check how many empty slots to the right
            var k = j - tw.e.slot - 1;                                                                                      // This is the number of free slots to the right
            if (k < c) c = k;                                                                                               // If this number is less than current
            i++;
        }
        tw.e.slotw = 1 + c;
        tw.e.slotc = ml;
    }

    function FixOverlap(events) {
        if (events.length == 0) return;
        var w = [];                                                                                                         // Here we will store all the key points (event start/event end)
        for (var i = 0; i < events.length; i++) {                                                                           // Loop all the events
            w.push({ isStart: true, e: events[i], t: events[i].event.start });                                                // Push STAR key point
            w.push({ isStart: false, e: events[i], t: events[i].event.end });                                                  // Push END key point
        }
        w.sort(function (a, b) { if (a.t > b.t) return +1; else return -1; });                                              // Sort all key points
        var slots=$L.set();                                                                                                 // Here we will keep slot (each slot is a display column) usage
        for (var i = 0; i < w.length; i++) {                                                                                // Loop all key points (in order)
            if (w[i].isStart) w[i].e.slot=slots.add(w[i].e); else slots.remove(w[i].e);                                      // If Key Point is START add event to slots else remove it
            w[i].status=slots.slice();                                                                                      // Keep a copy of slots array
        }
        for (var i = 0; i < w.length; i++) {                                                                                // Loop all key points (in order)
            if (w[i].isStart) ExpandSlot(w, i, slots.length);                                                               // Expand to right starting KeyPoints
        }
    }

    function CreateEvents(view) {
        var d = view.scheduler.data;                                                                                        // Let's get the data
        if (!d) return;                                                                                                     // If no data available the exit
        var w = {};                                                                                                         // Lets use an object has hash to group events by date
        $D.loop(view.days, function (k) {                                                                                   // Loop all the days we have
            w[$T.dateToString(k.date)] = k;                                                                                 // Get the date as a string, and use it has IN_SET=true
            k.events = [];                                                                                                  // Also create the events array
        });
        for (var i = 0; i < d.length; i++) {
            CreateEvent(w[$T.dateToString(d[i].start)], d[i]);                                // Loop all events and create and event wrapper
        }
        $D.loop(view.days, function (k) { FixOverlap(k.events); });                                                         // Loop all the days we have, and fix overlaps
    }

    viewFactory.create = function (sch, host,config) {                                                                      // This function creates a DAY view
        if (!config) config = this.config;                                                                                  // If no config received use default config
        var view = { scheduler: sch, owner: host, config: config, ticker: {},days:[] };                                     // This is the view object which holds everything related to the view
        view.date = new Date();                                                                                             // This is the starting date

        view.$header = theme(view, view, "days.header", $CD(host));                                                         // Create a HEADER
        view.$header.style.overflow = "hidden";
        InitHeader(view);                                                                                                   // Init the header

        view.$body = theme(view, view, "days.body", $D.position($CD(host), 0, $D.getHeightOuter(view.$header), 0, 0));      // I don�t like the getHeight but its the only way to make it work in IE<11
        InitBody(view);                                                                                                     // Init Body
        CreateEvents(view);                                                                                                 // Create EVENTS
        view.resize = function () { ResizeView(this); };
        ResizeView(view);                                                                                                   // resize everything so it gets measured
        return view;
    }
    window.$SejScheduler.registerView(viewFactory);                                                                         // Register this view
})();
