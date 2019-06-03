

var quoteFormat = (
    function () {

        function replaceAll(target, search, replacement) {
            return target.split(search).join(replacement);
        };


        function format(s) {
            let l = s.split("\n");
            s = "";
            for (let i = 0; i < l.length; i++) s = s + replaceAll(l[i]," ","&nbsp;") + "<br/>";
            return "<div style='line-height:1.5em;margin-left:50px;font-style:italic; color:#44A'>"+s+"</div>";
        }
        return { makeHtml: format };
    })();

