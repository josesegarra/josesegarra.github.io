

(function () {
    var $J = {  modules: {} };


    // BEGIN Warning+info
    $J.warning = function (message) {
        console.log("Warning: " + message);
    }
    $J.info = function (message) {
        console.log("Info: " + message);
    }
    $J.error= function (message) {
        console.log("Error: " + message);
        throw message;
    }
    $J.replace=function (instr,what,forw){
        var l = instr.split(what);
        var s = l[0];
        for (var i = 1; i < l.length; i++) s = s + forw + l[i];
        return s;
    }
    // END Warning+info

    

    // Suport for eventList
    function eventListeners() {
        this.name = "eventSink";

        this.listeners = {};

        this.add = function (eventName, listenFunction, listenData) {
            if (typeof (listenFunction) !== "function") return $J.error("Only functions can be added as listeners");
            if (!eventName) return $J.error("Missing name of event to Listen");
            var listenersForEvent = this.listeners[eventName];
            if (!listenersForEvent) listenersForEvent = this.listeners[eventName] = [];
            listenersForEvent.push({ handler: listenFunction, data: listenData });
        }

        this.raise = function (eventName, eventThis, eventParams) {
            var listenersForEvent = this.listeners[eventName];
            if (!listenersForEvent) return;
            for (var index in listenersForEvent) {
                var item = listenersForEvent[index];
                item.handler.call(eventThis, { value: eventParams, data: item.data });
            }
        }
    }
    $J.listenerNew = function () {
        return new eventListeners();
    }


    // Object application
    var app_listeners = new eventListeners();
    var app_onInit = setInterval(function () {
        if (document.readyState !== "complete") return;
        clearInterval(app_onInit);
        app_listeners.raise("onInit", $J.application, null);
    }, 100);

    $J.application = {
        onInit: function (handler, data) {
            app_listeners.add("onInit", handler, data);
        }
    }




    window.$J = $J;

})();


