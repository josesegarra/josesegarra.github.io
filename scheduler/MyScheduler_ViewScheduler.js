(function () {
    if (!window.$sej) {
        alert("Missing [windows.$sej]");
        return;
    }
    var $TH = window.$sej.theme,$L = window.$sej.utils                                                                       // Some shortcuts to CORE methods
    var $D = $L.DOM,$T = $L.dateTime;
    var $CD = $D.createDiv;

    var viewFactory = { id: "scheduler" };                                                                                  // This is the viewFactory object
    viewFactory.config = {
        number_days: 2,                                                                                                     // Number of days to display
        start: { h: 00, m: 0 },                                                                                             // Start time of ticker panel 
        end: { h: 23, m: 59 },                                                                                              // End time of ticker panel
        interval: 60,                                                                                                       // Tick interval in minutes
        min_tick_width: 50,                                                                                                 // Minimum tick height. If all ticks fit in available space then ticks height will expand, otherwise scroll
        overlap_OffSetY: 10,                                                                                                // Vertical displacement for an overlapping event
        themes: {}
    };

    function getTimeInfo(config, date) {
        var time_start = $T.dateAt(date, config.start.h, config.start.m);                                                   // This is starting time
        var time_end = $T.dateAt(date, config.end.h, config.end.m);                                                         // This is ending time
        var steps = Math.abs(time_end.getTime() - time_start.getTime()) / 60000;                                            // This is the number of minutes between start & end
        steps = Math.round(steps / config.interval);                                                                        // This is the number of intervals between start & end
        var ns = config.interval * 60000;                                                                                   // Tick interval from minutes to milliseconds
        return { start: time_start, steps: steps, offsetMs: ns };
    }

    function addCategory(name) {
        if (!this.categories[name]) this.categories[name] = [];
        InitDisplay(this);
        ResizeView(this);                                                                                                   // And finally resize everything
    }

    function addData(data, f) {                                                                                             // sets the data        
        var c;
        for (var i = 0; i < data.length; i++) {                                                                             // Loop all the data
            if (!f) c = "default";                                                                                          // Get the category this data belongs to.
            else if (typeof f == "string") c = f;
            else if (typeof f == "function") c = f(data[i]);
            if (!this.categories[c]) this.categories[c] = [];
            this.categories[c].push({ item: data[i] });                                                                     // Push a DATA wrapper (which will hold the $DIV)
        }
        for (var s in this.categories) $T.arrangeEvents(this.categories[s]);                                                // Loop all categories, preprocessing for display
        InitDisplay(this);
        ResizeView(this);                                                                                                   // And finally resize everything
    }


    function InitDisplay(v) {
        v.$categories.innerHTML = "";                                                                                       // Remove categories display
        var c = $L.p2array(v.categories, true);                                                                             // Get all categories sorted by name
        for (var i = 0; i < c.length; i++) {                                                                                // Loop all categories
            var cd = { index: i, value: c[i] , items: v.categories[c[i]] };                                                 // This is a category object        
            var t = $TH(v, cd, "scheduler.category.title", $CD(v.$categories));                                             // Create a category title
            t.style.position = "relative";                                                                                  // Make it relative, so it can be scrolled
            var d = $TH(v, cd, "scheduler.body.category", $CD(v.$body));                                                    // Create a category view
            for (var j = 0; j < v.tickers.length; j++) $TH(v, v.tickers[j], "scheduler.body.cell", $CD(d,"inline-block"));  // Create a DIV for the ticket
            $D.loop(cd.items,                                                                                               // Loop all the items(which are events in the category)
                function (k, data, index) {                                                                                 // For each ITEM
                    k.tick1 = $L.findInTicksList(k.item.start,k,data.view.tickers,"start","end");                           // Get the START tick for this event
                    k.earlyStart = k.early;
                    k.lateStart = k.late;
                    k.tick2 = $L.findInTicksList(k.item.end, k, data.view.tickers, "start", "end");                         // Get the END tick for this event
                    k.earlyEnd = k.early;
                    k.lateEnd= k.late;

                    k.time1 = $T.timeToString(k.item.start);
                    k.time2 = $T.timeToString(k.item.end);
                    k.$body = $D.position($TH(data.view, k, "scheduler.event", $CD(data.where)), i * 100);                      // Create a DIV for the data wrapper
                    k.$body.onclick = function () {
                        console.log("CLICKED ON");
                        console.log(k);

                    }
                }, { view: v, where: d });                                                                                  // Data used by the call back
        }
    }

    function ResizeView(v) {
        var topHeight = $D.setSameHeight(v.$title, v.$header);                                                              // Make sure that TITLE & HEADER have the same height
        var leftWidth = $D.setSameWidth(v.$title, v.$categories);                                                           // Make sure that TITLE & CATEGORY have the same width
        $D.position(v.$body, leftWidth, topHeight);                                                                         // Position BODY 
        $D.position(v.$header, leftWidth);                                                                                  // Position HEADER        

        var aw = $D.getWidthInner(v.owner) - leftWidth - $D.getNonClientWidth(v.$header);                                   // This is all the X space not available for TICK marks
        n = v.$header.firstChild;                                                                                           // Let's go the first DAY items
        while (n) {                                                                                                         // For each DAY item,
            aw= aw - $D.getNonClientWidth(n) - $D.getNonClientWidth(n.firstChild.nextSibling);                              // Add to non available the NON client part of DAY item and HEADER.TIMES item
            n = n.nextSibling;  
        }
        var tw = (aw / v.tickers.length);                                                                                   // This is calculated tick width
        if (tw < v.config.min_tick_width) tw = v.config.min_tick_width;                                                     // The tick width cannot be less that the minimum
        $D.loop(v.tickers, function (k) { $D.setWidthOuter(k.$body, tw); });                                                // Set width for ticks !!!
        v.tickers.tickWidth = tw;                                                                                           // Store the WIDTH we are using, we will using for X positioning the EVENTS
        
        var c = $L.p2array(v.categories, true);                                                                             // Get all categories sorted by name
        var hy = 0;
        for (var i = 0; i < c.length; i++) {                                                                                 // Loop all categories
            var bc=v.$categories.childNodes[i]
            var l = v.categories[c[i]];                                                                                     // Get the category
            var h = 0;                                                                                                      // Used heights !!!
            for (var j = 0; j < l.length; j++) {                                                                            // Loop all elements in the category
                var l0 = l[j];
                if ((l0.earlyStart && l0.earlyEnd) || (l0.lateStart && l0.lateEnd))                                         // If the item is out of range
                    l[j].$body.style.display = "none";                                                                      // then hide it
                else {
                    var x1 = GetXPosition(v, l0.tick1, l0.item.start, (l0.earlyStart ? 1:0));                               // Get posx of event start (this uses the TICKS X position)
                    var x2 = GetXPosition(v, l0.tick2, l0.item.end, (l0.lateEnd ? 2:0)) - x1;                               // Get posx of event start (this uses the TICKS X position)
                    $D.positionLW(l0.$body, x1, (x2 < 15 ? 15 : x2));                                                       // Set X positions !!
                    h = GetYPosition(v, h, l0, hy);                                                                         // Set Y position and update list of heights
                }
            }
            if (h == 0) h=$D.getHeightOuter(bc);                                                                            // If no height was calculated, use current
            var bv = v.$body.childNodes[i];                                                                                 // Get the view for the finished category
            $D.setWidthInner(bv, v.tickers.length * tw);                                                                    // Set total categoryView width
            $D.setHeightInner(bv, h);                                                                                       // Set height for categoryView
            $D.setSameHeight(bv, bc);                                                                                       // Set category title same height as category view
            for (var j = 0; j < v.tickers.length; j++) $D.setSizeOuter(bv.childNodes[j], tw,h);                             // The first v.tickers.length children of BV are the CELLs background display
            hy = hy + $D.getHeightOuter(bv);
        }
            
    }

    function GetYPosition(v,h,w,ofy) {
        var posy = w.slot*v.config.overlap_OffSetY;                                                                         // This is where the slot should be placed                                                           
        w.$body.style.top = (ofy+posy) + "px";                                                                              // Position the body   
        posy=posy+$D.getHeightOuter(w.$body);                                                                               // Get BOTTOMY pos   
        return (posy > h ? posy:h);                                                                                         // Return greatest of posy:h
    }

    function GetXPosition(v, tick,time,exc) {
        if (!tick) return null;
        var x1 = tick.$body.offsetLeft + tick.$body.parentNode.offsetLeft + tick.$body.parentNode.parentNode.offsetLeft;
        if (exc == 1) return x1;                                                                                            // If this is early START do not bother getting an offset
        if (exc == 2) return x1 + v.tickers.tickWidth;                                                                      // If this is early END do not bother getting an offset

        var dm = time - tick.start;                                                                                         // TimeSpan between received time and tick start  
        dm = Math.round(((dm % 86400000) % 3600000) / 60000);                                                               // Convert time span to minutes
        var dp = Math.round(dm * v.tickers.tickWidth / v.config.interval);
        return x1 + dp;
    }

    function bodyScroll(v, e) {                                                                                             // Whenever there is a body scroll
        var n = v.$header.firstChild;                                                                                       // Get the first HEADER item
        var l = - v.$body.scrollLeft;                                                                                       // Get how much the scroll has moved in X        
        while (n) { n.style.left = l + "px";n = n.nextSibling;}                                                             // Change left position of HEADER items    
        var n = v.$categories.firstChild;                                                                                   // Get the first CATEGORY item
        var l = -v.$body.scrollTop;                                                                                         // Get how much the scroll has moved in Y
        while (n) { n.style.top = l + "px";n = n.nextSibling;}                                                              // Change the top position of CATEGoRY items 
    }


    function InitHeader(v) {
        v.$header.innerHTML = "";                                                                                           // Clear whatever is in the HEADER
        var d = v.date, j = v.config.number_days;                                                                           // Loop all visible dates
        while (j > 0) {                                                                                                     // Where still in visible fate
            var item = $TH(v, d, "scheduler.header.item", $CD(v.$header,"inline-block"));                                   // For each day create an inline Header Item
            item.style.position = "relative";                                                                               // And relative positioning
            InitDay(v, item, d);                                                                                            // Init DAY panel
            d = $T.addDays(d, 1);                                                                                           // And move forward
            j--;
        }
    }

    function InitDay(v, item, date) {
        var day = $TH(v, date, "scheduler.header.day", $CD(item));                                                          // For each Header Item create a DIV for the date
        var times = $TH(v, date, "scheduler.header.times", $CD(item));                                                      // And a DIV for the times
        times.style.whiteSpace = "nowrap";                                                                                  // Which will expand horizontally
        var tinfo = getTimeInfo(v.config, date);                                                                            // Get time info for this day
        var i1 = tinfo.start;                                                                                               // Starting time
        for (var i = 0; i < tinfo.steps; i++) {                                                                             // Loop all the steps    
            var tick = { index: i, start: i1, end: $T.addMilliSeconds(i1, tinfo.offsetMs) };                                // For each step, add it to the array of steps
            tick.$body = $TH(v, tick, "scheduler.header.tick", $CD(times));                                                 // Create a DIV for the ticket
            tick.$body.style.display = "inline-block";                                                                      // Time display is inline        
            v.tickers.push(tick);                                                                                            // For each step, add it to the array of steps
            i1 = tick.end;                                                                                                  // currentTime = currentTime + TickInterval
        }
    }


    viewFactory.create = function (host, config) {                                                                          // This function creates a the SCHEDULER view
        if (!config) config = this.config;                                                                                  // If no config received use SELF config
        var view = { owner: host, config: config, categories:{} , events:[]};                                               // This is the view object which holds everything related to the view

        view.date = new Date();                                                                                             // This is the starting date                              
        view.tickers = [];                                                                                                  // This is the list tickers
        view.addCategory = addCategory;                                                                                     // Function to ADD a category
        view.addData = addData;                                                                                             // Function to ADD a data set & a category
        view.resize = function () { ResizeView(this); };                                                                    // Resize function
        view.$title = $D.size($D.position($TH(view, view, "scheduler.title", $CD(host)), 0, 0), 100);                       // This is the title
        view.$header = $D.position($TH(view, view, "scheduler.header", $CD(host)), 100, 0, 0, null);                        // This is the header
        view.$header.style.overflowX = "hidden";                                                                            // Hide header overflow
        view.$header.style.whiteSpace = "nowrap";                                                                           // Which will expand horizontally
        InitHeader(view);                                                                                                   // Init header

        view.$categories = $TH(view, view, "scheduler.category", $CD(host));                                                // Set the CATEGORIES display
        view.$categories.style.overflow = "hidden";                                                                         // With overflow = hidden
        $D.position(view.$categories, 0, $D.getHeightOuter(view.$header), null, 0);                                         // Set its position    
        view.$categories.style.minWidth = "50px";                                                                           // And BandWidth
        view.$body = $TH(view, view, "scheduler.body", $CD(host));                                                          // This is BODY
        $D.position(view.$body, 50, $D.getHeightOuter(view.$header), 0, 0);                                                 // And this is position    
        view.$body.style.overflow = "auto";                                                                                 // Body overflow is auto
        view.$body.addEventListener("scroll", function (e, t) { bodyScroll(view, e, t); });                                 // On BODY scroll
        ResizeView(view);                                                                                                   // resize everything so it gets measured
        $D.addResizeHandler(host, view, ResizeView);
        view.update = function () {
            ResizeView(this);
        }
        return view;                                                                                                        // Return view
    }
    window.$sej.register("scheduler", viewFactory);
})();
