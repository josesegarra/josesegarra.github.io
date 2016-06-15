
(
function () {

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function addDays(fromDate, days) {
        var d1 = new Date(fromDate);
        d1.setDate(d1.getDate() + days);
        return d1;
    }

    function setTime(d, hour, minutes) {
        var d1 = new Date(d);
        d1.setHours(hour);
        d1.setMinutes(minutes);
        return d1;
    }

    function addMinutes(from, minutes) {
        return new Date(from.getTime() + minutes * 60000);
    }


    function generateSamples() {
        var data = [];
        var tec=["John Lennon","Ringo Starr","Paul McCartney","George Harrison"]

        data.push({ start: setTime(new Date(), 02, 00), end: setTime(new Date(), 06, 00), title: "XXX", room: "Room1", color: "lightpink", tech: "Roger Daltrey" });
        data.push({ start: setTime(new Date(), 01, 00), end: setTime(new Date(), 05, 00), title: "XXX", room: "Room1", color: "lightblue"  , tech: "Mick Jagger"});
        data.push({ start: setTime(new Date(), 08, 00), end: setTime(new Date(), 08, 30), title: "XXX", room: "Room1", color: "lightgreen", tech: "Sam Cooke" });

        data.push({ start: setTime(addDays(new Date(), -1), 18, 00), end: setTime(addDays(new Date(), 0), 05, 00), title: "This STARTS BEFORE", room: "Room1", color: "lightblue", tech: "John Lennon" });

        data.push({ start: setTime(new Date(), 18, 00), end: setTime(addDays(new Date(), 1), 05, 00), title: "This LAST TWO DAYS ", room: "Long Room", color: "orange", tech: "Paul Hewson" });
        data.push({ start: setTime(addDays(new Date(), 1), 18, 00), end: setTime(addDays(new Date(), 2), 05, 00), title: "This ENDS LATER", room: "Long Room", color: "orange", tech: "Paul Hewson" });
        data.push({ start: setTime(addDays(new Date(), -1), 18, 00), end: setTime(addDays(new Date(), 0), 05, 00), title: "This STARTS BEFORE", room: "Long Room", color: "orange", tech: "Paul Hewson" });
        data.push({ start: setTime(new Date(), 16, 00), end: setTime(new Date(), 19, 00), title: "XXX", room: "Room1", color: "lightpink", tech: "Roger Daltrey" });
        data.push({ start: setTime(new Date(), 17, 00), end: setTime(new Date(), 20, 00), title: "XXX", room: "Room1", color: "lightblue", tech: "Mick Jagger" });
        data.push({ start: setTime(new Date(), 18, 00), end: setTime(new Date(), 21, 30), title: "XXX", room: "Room1", color: "lightgreen", tech: "Mick Jagger" });
        data.push({ start: setTime(new Date(), 20, 30), end: setTime(new Date(), 22, 30), title: "XXX", room: "Room1", color: "lightyellow", tech: "Mick Jagger" });

        var today = new Date();
        for (var i = 0; i < 180; i++) {
            var day = addDays(today, getRandomInt(0, 7));                                           // A random date between TODAY-7 and TODAY+14 days
            var hour = getRandomInt(0, 20);                                                         // A random hour between 0.. and 20:00
            var minute = getRandomInt(0, 50);                                                       // A random minute bewteen 0 and 50
            var length = getRandomInt(30, 200);                                                     // A random length between 15 and 100 minutes    
            var room = getRandomInt(1, 10);                                                         // A random room
            var start = setTime(day, hour, minute);
            var end = addMinutes(start, length);

            var d = { start: start, end: end, title: "Meeting", room: "Room " + room , tech: tec[getRandomInt(0,3)] };
            data.push(d);
        }
        return data;
    }

    window.$sej.generateSamples = generateSamples;
})();