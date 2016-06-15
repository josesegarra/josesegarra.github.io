(function () {
    var viewFactory = { id: "list" };                                                                                       // This is the viewFactory object
    if (!window.$SejScheduler) {
        alert("Object not available {window.$SejScheduler}");
        return;
    }
    var $L = window.$SejScheduler.utils;                                                                                    // Plain shortcuts to factory
    var $D = $L.DOM,$T = $L.dateTime;
    var $CD = $D.createDiv;

    viewFactory.config = {
        number_days: 1,                                                                                                     // Number of days to display
        start: { h: 00, m: 0 },                                                                                             // Start time of ticker panel 
        end: { h: 23, m: 59 },                                                                                              // End time of ticker panel
        interval: 60,                                                                                                       // Tick interval in minutes
        min_tick_width: 25,                                                                                                 // Minimum tick height. If all ticks fit in available space then ticks height will expand, otherwise scroll
        themes: {}
    };

    // Init themes
    (function (c) {

        c.themes["scheduler.title"] = function (view, data, element) {
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

    function InitData(v) {
        v.$body.innerHTML = "PATATA";
    }

    viewFactory.create = function (sch, host,config) {                                                                      // This function creates a DAY view
        if (!config) config = this.config;                                                                                  // If no config received use default config
        var view = { scheduler: sch, owner: host, config: config, events:[]};                                               // This is the view object which holds everything related to the view

        view.date = new Date();                                                                                             // This is the starting date                              
        view.resize = function () { };

        view.$body = theme(view, view, "scheduler.body", $CD(host));
        $D.position(view.$body, 0, 0, 0, 0);
        view.$body.style.overflow = "auto";
        
        InitData(view);
        
        return view;
    }
    window.$SejScheduler.registerView(viewFactory);                                                                         // Register this view
})();
