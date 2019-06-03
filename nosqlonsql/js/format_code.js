
var codeFormat= (
    function () {


        function ce(cstyle, pele,tname) {
            var d = document.createElement(tname || "DIV");             // Create the given element or a DIV
            if (pele) pele.appendChild(d);
            for (let p in cstyle) d.style[p]=cstyle[p];
            return d;
        }


        let keywords= {
             nosql: "#0218d2"       , go: "#0218d2"         , create: "#4078f2"         , insert: "#4078f2"         , update: "#4078f2"         , select: "#4078f2"
            , into: "#4078f2"       , drop: "#4078f2"       , declare: "#4078f2"        , view: "#4078f2"           , in: "#4078f2"             , where: "#4078f2"
            , from: "#4078f2"       , set: "#4078f2"        , override: "#70A8f2"       , keep: "#70A8f2"           , new: "#70A8f2"            , object: "#70A8f2"
            , string: "#70A8f2"     , int: "#70A8f2"        , real: "#70A8f2"           , if: "#70A8f2"
            , as: "#70A8f2"         , exists: "#70A8f2"     , null: "blue"
            // SQL builIn Functions
            , sysdatetime: "#9932CC", sysdatetimeoffset: "#9932CC"  , sysutcdatetime: "#9932CC"     , current_timestamp: "#9932CC"  , getdate: "#9932CC"
            , getutcdate: "#9932CC" , datename: "#9932CC"           , datepart: "#9932CC"           , day: "#9932CC"                , month: "#9932CC"
            , year: "#9932CC"       , datefromparts: "#9932CC"      , datetime2fromparts: "#9932CC" , datetimefromparts: "#9932CC"  , datetimeoffsetfromparts: "#9932CC"
            , datediff: "#9932CC"   , datediff_big: "#9932CC"       , dateadd: "#9932CC"            , eomonth: "#9932CC"            , smalldatetimefromparts: "#9932CC"
            , isdate: "#9932CC"     , cast: "#9932CC"               , convert: "#9932CC"            , parse: "#9932CC"              , timefromparts: "#9932CC"
            , try_cast: "#9932CC"   , try_convert: "#9932CC"        , try_parse: "#9932CC"          , switchoffset: "#9932CC"       , todatetimeoffset: "#9932CC"
            , isjson: "#9932CC"     , json_value: "#9932CC"         , json_query: "#9932CC"         , json_modify: "#9932CC"        , choose: "#9932CC"
            , iif: "#9932CC"        , abs: "#9932CC"                , degrees: "#9932CC"            , rand: "#9932CC"               , acos: "#9932CC"
            , exp: "#9932CC"        , round: "#9932CC"              , asin: "#9932CC"               , floor: "#9932CC"              , sign: "#9932CC"
            , atan: "#9932CC"       , log: "#9932CC"                , sin: "#9932CC"                , atn2: "#9932CC"               , log10: "#9932CC"
            , sqrt: "#9932CC"       , ceiling: "#9932CC"            , pi: "#9932CC"                 , square: "#9932CC"             , cos: "#9932CC"
            , power: "#9932CC"      , tan: "#9932CC"                , cot: "#9932CC"                , radians: "#9932CC"            , string_split: "#9932CC"
            , char: "#9932CC"       , charindex: "#9932CC"          , concat: "#9932CC"             , concat_ws: "#9932CC"          , difference: "#9932CC"
            , format: "#9932CC"     , left: "#9932CC"               , len: "#9932CC"                , lower: "#9932CC"              , ltrim: "#9932CC"
            , nchar: "#9932CC"      , patindex: "#9932CC"           , quotename: "#9932CC"          , replace: "#9932CC"            , replicate: "#9932CC"
            , reverse: "#9932CC"    , right: "#9932CC"              , rtrim: "#9932CC"              , soundex: "#9932CC"            , space: "#9932CC"
            , str: "#9932CC"        , string_agg: "#9932CC"         , stuff: "#9932CC"              , substring: "#9932CC"          , translate: "#9932CC"
            , trim: "#9932CC"       , unicode: "#9932CC"            , upper: "#9932CC"              , ascii: "#9932CC"              , string_escape: "#9932CC"
            , inner: "#9932CC"      , join: "#9932CC"               , on: "#9932CC"                 , order: "#9932CC"              , by: "#9932CC"
        };


        function replaceAll(target, search, replacement) {
            return target.split(search).join(replacement);
        };

        function toAscii(target) {
            if (!target) return "undefined";
            let r = "";
            for (let i = 0; i < target.length; i++) {
                if (target[i] >= " ") r = r + target[i]; else r = r + "[" + target.charCodeAt(i) + "]";
            }
            return r;
        };


        function toFormatString(block) {
            if (block.kind == "CR") return "\n";
            if (block.kind == "number") return "<span style='color:blue'>" + block.value + "</span>";
            if (block.kind == "string") return "<span style='color:green'>'" + block.value + "'</span>";
            if (block.kind == "symbol") return "<span style='color:#8B008B'>" + block.value + "</span>";
            if (block.kind == "prefix") return "<span style='color:#D2691E'>" + block.value + "</span>";
            if (block.kind == "comment") return "<span style='color:#AAA'>" + block.value + "</span>";
            if (block.kind == "sql") return "<span style='color:#E524DE'>" + block.value + "</span>";
            if (block.kind == "space") return block.value;
            if (block.kind== "ident") {
                let color = keywords[block.value.toLowerCase()];
                return (color) ? "<span style='color:" + color + "'>" + block.value  + "</span>": block.value ;
            }
            return "<span style='color:red;  text-decoration: underline;'>" + block.kind + ":" + block.value + "</span>";

        }


        function blockAdd(block, c,nk) {
            if (c) block.value = block.value + c;
            if (nk) block.kind = nk;
            return block;
        }

        function tokenize(block, tChar, nChar) {
            let tcChar = tChar.charCodeAt(0);

            if (tChar == "-" && nChar == "-" && block.kind != "string") { if (block.kind == "comment") return blockAdd(block, tChar); else return { kind: "comment", value: "-" }; }
            if (block.kind == "comment" && tChar>=" ") return blockAdd(block, tChar);

            if (tChar == "'") {
                if (block.kind == "escaped") return blockAdd(block, "'", "string");
                if (block.kind != "string") return { kind: "string", value: "" };
                if (nChar == "'") return blockAdd(block, "", "escaped");
                return {};
            }
            if (block.kind == "string") return blockAdd(block, tChar);
            if ("$^%#".indexOf(tChar) > -1) return { kind: "prefix", value: tChar }; 

            if (tChar=="@" ) return { kind: "sql", value: tChar }; 
            if ("{:[]}(),*+;/-?=".indexOf(tChar) > -1) { if (block.kind == "symbol") return blockAdd(block, tChar); else return { kind: "symbol", value: tChar }; }
            if (tChar == ".") { if (block.kind == "ident" || block.kind == "number" || block.kind=="symbol") return blockAdd(block, tChar); else return { kind: "symbol", value: tChar };}
            if (tChar == "_" || (tChar >= "A" && tChar <= "Z") || (tChar >= "a" && tChar <= "z")) {
                if (block.kind == "ident" || block.kind == "prefix" || block.kind == "sql") return blockAdd(block, tChar);
                return { kind: "ident", value: tChar };
            }

            if ((tChar >= "0" && tChar <= "9")) {
                if (block.kind == "ident" || block.kind == "prefix" || block.kind == "sql") return blockAdd(block, tChar);
                if (block.kind == "symbol" && block.value == "-") return blockAdd(block, tChar,"number");
                return { kind: "number", value: tChar };
            }
            if (tcChar == 9) { if (block.kind == "space") return blockAdd(block, "    "); else return { kind: "space", value: "    " };}
            if (tChar == " ") { if (block.kind == "space") return blockAdd(block, " "); else return { kind: "space", value: " " };}
            if (tcChar == 13) return { kind: "cr0", value: "#13" };
            if (tcChar == 10 && block.kind == "cr0") return blockAdd(block, "#10", "CR");
            return { kind: "error", value: tChar, charCode: tcChar };
        }


        function toDom(blocks) {
            let gutter = "40px";
            //font - size: 14px;font - weight: 400;line - height: 1.5em;

            let t = ce({ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "stretch", border: "1px solid #888",  });
            let b0 = ce({ width: gutter, maxWidth: gutter, minWidth: gutter,  flexGrow: "0", overflow: "hidden", background: "#EEE",paddingLeft:"10px" }, t);
            let b1 = ce({ flexGrow: "1", overflowX:"auto",paddingLeft:"10px" }, t);
            b1.className = "coolscroll";
            let c0 = ce({ display: "block", color: "#888", margin: "5px",fontSize:"13px",fontWeight:"400",lineHeight:"1.2em" }, b0, "PRE");
            let c1 = ce({ display: "block", margin: "5px", fontSize: "13px", fontWeight: "400", lineHeight: "1.2em" }, b1, "PRE");


            var s = "", r = "";
            for (let i = 0; i < blocks.length; i++) s = s + toFormatString(blocks[i]);                      // Get code formated with colors and everything
            while (s.charCodeAt(0)<32) s = s.substring(1);                                                  // Remove any starting CR that we might have        
            while (s.charCodeAt(s.length - 1) < 32) s = s.substring(0, s.length - 1);                       // Remove any endping CR that we might have        
            for (let i = 1; i <=s.split("\n").length; i++) r = r + (i) + "\n";                              // Create the line numbers
            c0.innerHTML = r;
            c1.innerHTML = s;
            return t;
        }

        //          console.log("%c PUSHED ", 'color: #bada55');
        function toHtml(s) {
            let tokens = [], token= {}, items = s.split('');                                               // Create out blocks structure, current block and split input in chars
            for (let i = 0; i < items.length; i++) {                                                        // Loop all input chars
                let ntoken = tokenize(token, items[i], items[i + 1]);                                      // A char might generate a new block (or use previous)
                if (ntoken != token) {                                                                      // If a new block is created
                    if (ntoken.kind) tokens.push(ntoken);                                                   // Push the prrevious (as long as it is not empty)
                    token = ntoken;                                                                         // And make the new block current
                }
            }

            return toDom(tokens);
        }


        format.plugin("code", toHtml);

    })();



