
var format = (
    function () {

        let parser = {
        };
        let plugins = {};

        parser.plugin = function (s, f) {
            s = s.trim();
            if (!s) return;
            plugins[s] = f;
        }


        function defNode(plugin, text){
            var def = document.createElement("DIV");
            def.innerHTML = plugin + "<br/>" + text;
            return def;
        }

        parser.process = function (where,s) {
            var l = s.split("\n");
            var blocks = [];
            var block = {};
            for (var i = 0; i < l.length; i++) {
                let s = l[i].trim();
                if (s.charAt(0) == "[" && s.charAt(s.length - 1) == "]") {
                    if (s.charAt(1) != "/") block = { name: s.substring(1, s.length - 1), start: i };
                    else {
                        var t = s.substring(2, s.length - 1);
                        if (t == block.name) {
                            block.end = i;
                            blocks.push(block);
                            block = {};
                        }
                    }
                 }
            }
            for (var i = 0; i < blocks.length; i++) {
                let m = "";
                for (var j = blocks[i].start + 1; j < blocks[i].end; j++) m = m + l[j] + "\n";
                var f = plugins[blocks[i].name] ? plugins[blocks[i].name] : defNode;
                var r = f(m);
                if (typeof (r) == "string") {
                    var div = document.createElement("DIV");
                    div.innerHTML = r;
                    where.appendChild(div);
                } else if (r instanceof HTMLElement) where.appendChild(r);
                else {
                    alert(r);
                    document.log(r);
                }
            }
        }
        return parser;
    })();
