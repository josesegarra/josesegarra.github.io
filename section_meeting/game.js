

var width = 5
var height = 5
var possibleColours = ['b', 'y', 'r', 'g']
var colourMap = {
    b: 'blue',
    y: 'yellow',
    r: 'red',
    g: 'green',
    e: 'gray',  // empty
}
var emptyCell = {colour: 'e', isEmpty: true}
function randomCell(){
    return {
        colour: possibleColours[Math.floor(Math.random() * possibleColours.length)],
        isEmpty: false,
    }
}
// state
var grid = [...Array(height)].map(_=>[...Array(width)].map(randomCell))
var numberOfClicks = 0
// grid->grid functions
function doUntilIdempotent(grid, f){
    var repeat = 0
    while (repeat < 1000){  // arbitrarily large
        var newGrid = f(grid)
        if(JSON.stringify(newGrid) === JSON.stringify(grid)) return grid
        grid = newGrid
        repeat += 1
    }
    throw 'grid never converges'
}
function forCells(grid, f){
    return grid.map((row, i)=>row.map(
        (cell, j)=>Object.assign({}, cell, f(cell, i, j))))
}
function removeCell(grid, emptyI, emptyJ){
    return forCells(grid, (cell, i, j)=>(
        i === emptyI && j === emptyJ? {isEmpty: true} : {}))
}
function adjacentCells(grid, i, j){
    var adjacents = []
    if(i < grid.length - 1)    adjacents.push(grid[i+1][j])
    if(i > 0)                  adjacents.push(grid[i-1][j])
    if(j < grid[0].length - 1) adjacents.push(grid[i][j+1])
    if(j > 0)                  adjacents.push(grid[i][j-1])
    return adjacents
}
function emptyAdjacentCells(grid){
    return forCells(grid, (cell, i, j)=>({
        isEmpty: cell.isEmpty || adjacentCells(grid, i, j).some(
            adjacent=>adjacent.isEmpty && adjacent.colour === cell.colour)
    }))
}
function belowCell(grid, i, j){
    return i === grid.length - 1? {isEmpty: false} : grid[i+1][j]
}
function aboveCell(grid, i, j){
    return i === 0? emptyCell : grid[i-1][j]
}
function shiftIntoEmpty(grid){
    return forCells(grid, (cell, i, j)=>{
        if(cell.isEmpty) return aboveCell(grid, i, j)
        if(belowCell(grid, i, j).isEmpty) return emptyCell
        return cell
    })
}
var chain = (...fs)=>fs.reduce((a,b)=>x=>b(a(x)))
// mutates state
function setGrid(emptyI, emptyJ){
    numberOfClicks += 1
    grid = chain(
        grid=>removeCell(grid, emptyI, emptyJ),
        grid=>doUntilIdempotent(grid, emptyAdjacentCells),
        grid=>doUntilIdempotent(grid, shiftIntoEmpty),
    )(grid)
    render()
}
// UI
var View = ()=>m('',
    m('h1', `clicks: ${numberOfClicks}`),
    grid.every(row=>row.every(cell=>cell.isEmpty))  // game over?
        ? 
			//m('div', `Your score has been recorded: ${numberOfClicks}`,{onclick:reset})
			m('div', {
                id:`message`,
                style: `background-color: white,min-width:300px};`,

				onclick: setTimeout(reset,500)
            })
		
        : grid.map((row, i)=>m('.row', row.map((cell, j)=>
            m('.block', {
                style: `background-color: ${colourMap[cell.colour]};`,
                onclick: cell.isEmpty? _=>_ : _=>setGrid(i, j)
            })))))
render = ()=> m.render(document.getElementById('blocks'), {children: [View()]});


reset=() =>{
	var name=document.getElementById("name").value;
	var code=document.getElementById("code").value;
	var msg=saveResult(code,name,numberOfClicks) ? "Score submitted":"Could not submit score";

	var d=document.getElementById("message");
	d.innerHTML=msg+". Click here to try again";	
	d.onclick=function(){
		numberOfClicks = 0
		grid = [...Array(height)].map(_=>[...Array(width)].map(randomCell));
		render();
	}
}




function saveResult(code,name,score){
		
		var url="http://logs-01.loggly.com/inputs/40bd2958-9754-44d2-a695-a4c598c0"+code+"/tag/http/";



		var request = new XMLHttpRequest();
		request.open("POST", url,false);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		var msg=JSON.stringify({user: name,value:score});
		request.send(msg);
		return (request.status === 200);
}






















