var dataFormat= (
        function () {


            function ce(cstyle, pele, tname) {
                var d = document.createElement(tname || "DIV");             // Create the given element or a DIV
                if (pele) pele.appendChild(d);
                for (let p in cstyle) d.style[p] = cstyle[p];
                return d;
            }

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


            function blockAdd(block, c, nk) {
                if (c) block.value = block.value + c;
                if (nk) block.kind = nk;
                return block;
            }

            function toFormatString(block) {
                if (block.kind == "CR") return "****\n";
                if (block.kind == "tab") return "<span style='color:#AAA'>.......</span>";
                if (block.kind == "text") return "<span style='color:blue'>" + block.value + "</span>";
                return "<span style='color:red;  text-decoration: underline;'>" + block.kind + ":" + block.value + "</span>";
            }

            function makeStr(char, times) {
                return times ? new Array(times + 1).join(char) : new Array(times + 1).join(" ");
            }

            function PrintCell(value, width,align,line) {
                let c = "";
                if (!value) value = "";
                if (value.toLowerCase() == "null") c = "color:#E524DE";
                if (!isNaN(value)) c = "color:blue";
                if (line == 0) c = "font-weight: bold;border-bottom: 1px solid #AAA";
                if (line == 1) value = " ";
                let s = makeStr(" ", width);
                value = (align == "L" ? "" : s) + value + (align == "R" ? "" : s);
                if (align == "L") value = value.substring(0, width);
                if (align == "R") value = value.substring(value.length - width);
                return "<span style='display:inline-block;border-right: 1px solid #EEE;padding-bottom: 3px;padding-left: 10px;padding-right: 6px;"+c+"'>"+value+"</span>";
            }

            function GetAlign(rows, x) {
                let y = 2;                                                                      // Skip 2 first rows
                while (y < rows.length) {
                    let value = rows[y][x];
                    if (!value || value == "null" || (!isNaN(value))) y++; else return "L";           // If is "null" or IsANumber keep, else return "L"
                }
                return "R";
            }
            
            function PrintLine(fdata, falign, widths,nline) {
                let c = 0;
                let r = "";
                while (c < 1000 && widths[c]) {
                    r = r + PrintCell(fdata(c), widths[c], falign(c),nline);
                    c++;
                }
                return r+"\n";
            }

            function Print(table) {
                let r = "", aligns = ['L'], x = 1;
                while (x < table.widths.length && table.widths[x] > 0) {
                    aligns[x] = GetAlign(table.rows, x); 
                    x++;
                }
                table.widths[0] = table.widths[0] + 2;
                let lines = PrintLine((c) => table.rows[0][c], (c) => aligns[c], table.widths,0);
                //lines = lines + PrintLine((c) => makeStr("-", table.widths[c]), (c) => aligns[c], table.widths,1);
                for (let y = 2; y < table.rows.length; y++) lines = lines + PrintLine((c) => table.rows[y][c], (c) => aligns[c], table.widths,y);   
                while (lines.charCodeAt(lines.length - 1) < 32) lines = lines.substring(0, lines.length - 1);                                       // Remove any endping CR that we might have        
                return lines;
            }


            function toDom(content) {
                let gutter = "40px";
                let t = ce({ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "stretch", border: "1px solid #888", });
                let b0 = ce({ width: gutter, maxWidth: gutter, minWidth: gutter, flexGrow: "0", overflow: "hidden", background: "#EEE", paddingLeft: "10px" }, t);
                let b1 = ce({ flexGrow: "1", overflowX: "auto", paddingLeft: "10px" }, t);
                b1.className = "coolscroll";
                let c0 = ce({ display: "block", color: "#888", margin: "5px", fontSize: "13px", fontWeight: "400", lineHeight: "1.2em" }, b0, "PRE");
                let c1 = ce({ display: "block", margin: "5px", fontSize: "13px", fontWeight: "400", lineHeight: "1.2em" }, b1, "PRE");

                let r = "<span style='display:inline-block;padding-bottom: 3px;'>&nbsp;</span>\n";
                for (let i = 1; i < content.split("\n").length; i++) r = r + "<span style='display:inline-block;padding-bottom: 3px;'>"+(i) + "</span>\n";                              // Create the line numbers
                r = r+"<span style='display:inline-block;padding-bottom: 3px;'>&nbsp;</span>";
                c0.innerHTML = r;
                c1.innerHTML = content;
                return t;
            }

            //          console.log("%c PUSHED ", 'color: #bada55');
            function toHtml(s) {
                while (s.charCodeAt(0) < 32) s = s.substring(1);                                                    // Remove any starting CR that we might have        
                while (s.charCodeAt(s.length - 1) < 32) s = s.substring(0, s.length - 1);                           // Remove any endping CR that we might have        

                let lines = s.split("\n");                                                                          // This is lines
                let table = { widths: [], rows: []};
                for (let i = 0; i < 1000; i++) table.widths[i] = 0;                                                 // Set first 1000 widths to 0
               
                for (let y = 0; y < lines.length; y++) {                                                            // Loop all input chars
                    let columns = lines[y].split("|");
                    let currow = [];
                    for (let x = 0; x < columns.length; x++) {                                                      // Loop all input chars
                        let s = columns[x].trim();                                                                  // Content of x,y
                        if (s.length > table.widths[x]) table.widths[x] = s.length;
                        currow[x] = s;
                    }
                    table.rows[y] = currow;                                                                     // Set the row
                }
                return toDom(Print(table));
            }


            format.plugin("data", toHtml);


    })();

