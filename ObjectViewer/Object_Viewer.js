var Object_Viewer = {};

Object_Viewer.boxWidth = 0.18;                                                                  // Width of a BOX in percentage of canvas width
Object_Viewer.boxColor = "#FFFF80";                                                             // Base boxColor
Object_Viewer.colors = [																		// Relation line colors
        "#0000ff", "#003200", "#008800", "#ff7f50", "#00ced1", 
		"#00ff7f", "#4b0082", "#8b0000", "#cd853f", "#dc143c", 
		"#ffd700", "#ffc0cb","#660066", "#008b8b", "#0066FF"];

function ColorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }

    return rgb;
}

// This function returns an array of visual "representations"
Object_Viewer.prepare=function(data){
    if (!data.length) { alert("Expected array of data"); return null; }                         // If no data, or data is not an array then return with fail

    var _getLines = function (lines, propName, propValue, level) {                              // This is a internal helper function tha adds a property to the lines array
        if (level > 4) { lines.push({ level: level, na: true }); return; }                      // No more than 4 levels depth when displaying arrays

        var p = { level: level, name: propName };                                                      // Push the object
        lines.push(p);

        if (propValue instanceof Array) {                                                       // If we have an array
            level = level + 1;                                                                  // Increase level
            var j=(propValue.length>8?8:propValue.length);                                      // We will only display up to 8 elements in array !!
            for (var i = 0; i < j; i++)                                                         // Get the first J items
                _getLines(lines, propName + "_" + i, propValue[i],level);                       // And display them
            if (j < propValue.length) lines.push({ level: level, name: "/*...*/"});                   // If there are more elements then display a [na] line
            return;                                                                             // Return
        } 
        if (propValue instanceof Object) p.link = propValue; else p.value = propValue;          // Set a LINK or VALUE depending on type of data
    }

    var items = [];                                                                             // This array will hold the "visual" data        
   
    for (var i = 0; i < data.length; i++) {                                                     // Loop all the input objects objects
        var o = data[i];                                                                        // This is the input objects 
        var item = { title: o.toString(), lines: [], source:o };                                // This is its "visual" data for this object
        for (var k in o) _getLines(item.lines, k, o[k], 1);                                     // Calculate "visual" lines for the input object
        item.color = this.colors[i % this.colors.length];                                       // Set color    
        items.push(item);                                                                       // Add the "visual" data to the list of prepared data
    }

    items.sort(function (a, b) { return a.lines.length - b.lines.length;}).reverse();           // Sort & reverse the data (more lines first)

    var p1 = [], p2 = [];
    var j = Math.round(items.length / 2);
    while (items.length > 0) {
        if (items[0]) p1.push(items[0]);
        items.splice(0, 1);
        if (items.length > 0) { if (items[0]) p2.push(items[0]); items.splice(0, 1);}
    }
    return p1.concat(p2);
}

/*
ctx.moveTo(0, 0);
ctx.lineTo(200, 100);
ctx.stroke();
b_context.fillRect(50, 25, 150, 100);
*/

Object_Viewer.draw = function (items, canvas,zoom) {
    
	canvas.width=canvas.clientWidth;                            // This sets a 1:1 factor between visible screen and canvas size
    canvas.height = canvas.clientHeight;

	if (!zoom) {
        zoom = 1;
        this.init(items, canvas);
    }
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFF";
    ctx.clearRect(0,0,canvas.width,canvas.height);
    var j = Math.round(items.length / 2);
    var posy;
    
    ctx.strokeStyle = "#000";
    ctx.zoom = zoom;

    ctx.offsetx = canvas.despX+canvas.width * (1 - zoom) / 2;
    ctx.offsety = canvas.despY+canvas.height * (1 - zoom) / 2;
    ctx.w = ctx.zoom * ctx.canvas.width;
    ctx.h = ctx.zoom * ctx.canvas.height;
   
    
    ctx.leftMargin = ctx.offsetx + ctx.w * 0.09;
    ctx.rightMargin = ctx.offsetx + ctx.w * 0.91;

    ctx.midLMargin = ctx.offsetx + ctx.w * 0.49;
    ctx.midRMargin = ctx.offsetx + ctx.w * 0.51;
    
    posy = 0.05;
    for (var i = 0; i < j ; i++) {
        items[i].left = 1;
        posy = this.drawBox(ctx, items[i], 0.1, posy);
    }
    posy = 0.15;
    for (var i = j  ; i < items.length ; i++) {
        items[i].left = 0;
        posy = this.drawBox(ctx, items[i], 0.9 - this.boxWidth, posy);
    }
    for (var i = 0; i < items.length ; i++) this.drawLines(items,ctx, items[i]);

}

Object_Viewer.drawBox = function (ctx, item, posx, posy) {
   
    //ctx.fillStyle = "#EEE";
    //ctx.fillRect(ctx.ofsetx + w * posx, ctx.ofsety + h * posy, w * this.boxWidth, ctx.zoom * 20);
    //ctx.strokeRect(ctx.ofsetx + w * posx, ctx.ofsety + h * posy, w * this.boxWidth, ctx.zoom * 20);
    item.midX = null;
    ctx.strokeStyle = "#888";
    ctx.font = (14*ctx.zoom)+"px Arial";
    ctx.lineWidth = 0.5*ctx.zoom;
    item.posx= ctx.offsetx + ctx.w * posx;
    item.posy= ctx.offsety + ctx.h * posy;
    var hw = ctx.w*this.boxWidth / 2;

    ctx.fillStyle = "#333";
    ctx.fillText(item.title, item.posx + ctx.zoom * 4, item.posy);
    for (var i = 0; i < item.lines.length; i++) {
        var p = item.lines[i];

        p.x = item.posx; 
        p.y = item.posy + ctx.zoom * 16 * (i + 1);
        var margin = ctx.zoom * 16 * p.level;

        ctx.fillStyle = ColorLuminance(this.boxColor, 0.25*p.level);
        ctx.fillRect(p.x, p.y - (14 * ctx.zoom) + ctx.zoom * 2, 2 * hw, (14 * ctx.zoom) + ctx.zoom * 2);

        ctx.fillStyle = "#333";
        ctx.fillText(p.name, p.x + margin, p.y, hw - margin);
        ctx.fillStyle = "#888";
        if (p.value) ctx.fillText(p.value, p.x + hw, p.y, hw);

        ctx.beginPath();
        ctx.moveTo(p.x, p.y - (14 * ctx.zoom) + 2);
        ctx.lineTo(p.x+2*hw, p.y - (14 * ctx.zoom) + 2);
        ctx.stroke();
    }
    ctx.strokeStyle = "#000";
    ctx.strokeRect(item.posx, item.posy - (14 * ctx.zoom) + ctx.zoom * 2, 2 * hw, ctx.zoom * 16 * (1+item.lines.length));
    var ry = (14 * (5+item.lines.length)) / ctx.canvas.height;
    return posy + ry;
}

Object_Viewer.init = function (data,canvas) {
    canvas.style.userSelect = "none";                                                   // Disable text selection
    canvas.style.webkitUserSelect = "none";
    canvas.style.MozUserSelect = "none";
    canvas.setAttribute("unselectable", "on");

    canvas.zeroX= 0;
    canvas.zeroY = 0;

    canvas.despX = 0;
    canvas.despY = 0;

    var scaleFactor = 1;                                                              // This is scale factor
    var zoom = function (clicks) {
        if (clicks > 0) scaleFactor = 1.2 * scaleFactor;
        if (clicks < 0) scaleFactor = 0.8 * scaleFactor;

        Object_Viewer.draw(data, canvas, scaleFactor);
    }

    var handleScroll = function (evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) zoom(delta);
        return evt.preventDefault() && false;
    };
    canvas.addEventListener('DOMMouseScroll', handleScroll, false);
    canvas.addEventListener('mousewheel', handleScroll, false);


    var lastX, lastY, dragging=false;

    canvas.addEventListener('mousedown', function (evt) {
        lastX = (evt.offsetX || (evt.pageX - canvas.offsetLeft));
        lastY =  (evt.offsetY || (evt.pageY - canvas.offsetTop));
        canvas.zeroX = canvas.despX;
        canvas.zeroY = canvas.despY;

        Object_Viewer.draw(data, canvas, scaleFactor);
        dragging = true;
    }, false);

    canvas.addEventListener('mousemove', function (evt) {
        if (!dragging) return;
        var lX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        var lY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        canvas.despX = canvas.zeroX + lX - lastX;
        canvas.despY = canvas.zeroY + lY - lastY;
        Object_Viewer.draw(data, canvas, scaleFactor);
    }, false);

    canvas.addEventListener('mouseup', function (evt) {
        dragging = false;
    }, false);
}



Object_Viewer.drawLines = function (items,ctx, item) {
    for (var i = 0; i < item.lines.length; i++) {
        var dest = null;
        var j=0;
        while (j < items.length && !dest) if (items[j].source == item.lines[i].link) dest = items[j]; else j++;
        if (dest != null) {
            this.linkItems(ctx, item, item.lines[i], dest);
        }
    }
}


Object_Viewer.linkItems = function (ctx, fromItem, inProp, toItem) {

    var startX,endX,midX;

    if (fromItem.posx == toItem.posx){
        startX = fromItem.posx;
        midX = ctx.leftMargin;
        if (fromItem.left) {
            ctx.leftMargin = ctx.leftMargin - ctx.w * 0.005;
        }
        else {
            midX = ctx.rightMargin;
            startX = startX + ctx.w * this.boxWidth
            ctx.rightMargin = ctx.rightMargin + ctx.w * 0.005;
        }
        endX = startX;
    }

    else {
        startX = fromItem.posx + (!fromItem.left ? 0 : ctx.w * this.boxWidth);
        endX = toItem.posx + (!toItem.left ? 0 : ctx.w * this.boxWidth);
        midX = toItem.midX;
        if (!midX) {
            if (fromItem.left) {
                midX = ctx.midLMargin;
                ctx.midLMargin = ctx.midLMargin - ctx.w * 0.010;
            } else {
                midX = ctx.midRMargin;
                ctx.midRMargin = ctx.midRMargin + ctx.w * 0.010;
            }
            toItem.midX = midX;
        }
    }
    ctx.beginPath();
    ctx.lineWidth=1.2;
    ctx.strokeStyle = toItem.color; //ColorLuminance(toItem.color, 0.1);
    ctx.moveTo(startX, inProp.y);
    ctx.lineTo(midX, inProp.y);
    ctx.lineTo(midX, toItem.posy);
    ctx.lineTo(endX, toItem.posy);
    ctx.stroke();
}
