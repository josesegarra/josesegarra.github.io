(
 function () {
     if (!window.$sej) {
         alert("Missing [windows.$sej]");
         return;
     }
     $D = window.$sej.utils.DOM;
     $U = window.$sej.utils;
     $L = window.$sej.utils.log;
     $CD = $D.createDiv;

            
     function addDisplay(sch){
         var display = $D.position($CD(sch.host), 0, 0, 0, 0);                                                            // Create a panel vertical height
         var d = { $body: display, index: sch.displays.length, name: "Display #" + sch.displays.length };
         sch.displays.push(d);
         showDisplay(sch,sch.displays.length-1,false);
         return display;
     }

     function TransitionNone(from, to) {
         if (from) from.style.display = "none";
         to.style.display = "block";
     }

     function TransitionFade(from, to) {
         if (!from) return TransitionNone(from, to);            // Fallback if used first
         to.style.opacity = 0.05;
         to.style.display = "block";
         $U.timer(100, 5,
            function (d, step) {
                d.from.style.opacity = 1 - d.v;
                d.to.style.opacity = d.v;
                d.v = d.v + 0.01;
            },
            function (d) {
                d.from.style.display = "none";
                d.from.style.opacity = 1;
                d.to.style.opacity = 1;
            }, { from: from, to: to, v: 0.05 });
     }

     function showDisplay(sch, k, animate) {
         var display = sch.displays[k];
         if (sch.current == display) return;
         if (!display) {
             $L("{MyPanel}.show", "Bad display Index: " + k);
             return;
         }
         $D.loop(sch.displays, function (t) {
                if (t != display && t!=sch.current) t.$body.style.display = "none";
         });

         var f = (sch.current ? sch.current.$body : null);
         sch.current = display;
         if (!animate) TransitionNone(f, display.$body);
         else if (sch.mode == "FADE") TransitionFade(f, display.$body);
    }


     function createPanel(where) {
         var sch = { displays: [], mode: "FADE", current: null, posx: 0, steps: 20 };
         var panel = $D.table(where, 1, 1)[0][0];                                                                        // Let's create a 1 cell TABLE, so we get 100% width & 100 % height 
         panel.style.overflow = "hidden";                                                                               // This is the viewport !!!
         sch.host = $D.table(panel, 1, 1)[0][0];                                                                        // Let's create a 1 cell TABLE, so we get 100% width & 100 % height inside the viewport
         sch.host.style.position = "relative";                                                                          // This is the scrolling panel
         sch.host.style.minHeight = "100%";

         sch.addDisplay = function () {
             return addDisplay(this);
         }

         sch.show = function (k, animate) {
             return showDisplay(this, k, animate);
         }
         return sch;
     }

     var panelFactory = { create: createPanel, config: null };
     window.$sej.register("panel", panelFactory);


})();

