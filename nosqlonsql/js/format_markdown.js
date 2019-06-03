(
    function () {

        hljs.configure({
            tabReplace: '    '
            , languages: ["sql", "json"]// … other options aren't changed
        })

        
        function replaceAll(target, search, replacement) {
            return target.split(search).join(replacement);
        };

        var converter = new showdown.Converter({ tables: true, strikethrough: true });


        function toMarkDown(s) {
            return converter.makeHtml(s);
        }

        format.plugin("markdown", toMarkDown);



        /*
        function format(s) {
            let l = s.split("\n");                                                                                        // Split the text into a list of tokens
            for (let i = 0; i < l.length; i++) {
                let s0 = l[i];
                var r = "";
                for (let i0 = 0; i0 < s0.length; i0++) if (s0.charCodeAt(i0) == 9) r = r + " "; else r = r + s0[i0];
                console.log("Line " + r);
                var w = r.split(" ")
                console.log("Split into ");
                for (let i0 = 0; i0 < w.length; i0++) {
                    if (w[i0] == "null") w[i0] = "<span style='color:#BBB'>" + w[i0] + "</span>";
                    if (w[i0]/length>0 && !isNaN(w[i0])) w[i0] = "<span style='color:orange'>" + w[i0] + "</span>";
                }
                r = "";
                for (var x in w) {
                    console.log(w[x] + " " + w[x].length);
                    if (w[x].length == 0) r = r + "&nbsp;"; else r = r + w[x]+"&nbsp;";
                }
                console.log(r);
                if (i == 0) r = "&nbsp;<span style='font-weight:bold'>" + r + "</span>";
                if (i == 1) r = "<span style='color:#AAA'>" + r + "</span>";
                l[i] = r;
            }
            var s = "";
            for (var x in l) s = s + l[x];
            s = s + "\n&nbsp;";
            return s;
        }
        return format;
        */

    })();

