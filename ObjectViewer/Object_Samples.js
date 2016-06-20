
// This function returns some sample sets
function GenerateObjectSample(i) {

    var world = "";
    world = world + "var Homer          = {name: 'Homer Simpson'           ,age : 40 };\n";
    world = world + "var Marge          = {name: 'Marge Bouvier Simpson'   ,age : 38 };\n";
    world = world + "var Maggie         = {name: 'Maggie Simpson'          ,age :  1 };\n";
    world = world + "var Lisa           = {name: 'Lisa Simpson'            ,age :  7 };\n";
    world = world + "var Bart           = {name: 'Bart Simpson'            ,age :  9 };\n";
    world = world + "var Milhouse       = {name: 'Milhouse Van Houten'     ,age :  9 };\n";
    world = world + "var Nelson         = {name: 'Nelson Muntz'            ,age : 10 };\n";
    world = world + "var MrBurns        = {name: 'Montgomery Burns'        ,age : 85 };\n";
    world = world + "var Apu            = {name: 'Apu Nahasapeemapetilon'  ,age : 28 };\n";
    world = world + "var Lenny          = {name: 'Lenny Leonard'           ,age : 39 };\n";
    world = world + "var Moe            = {name: 'Moe Szyslak'             ,age : 45 };\n";
    world = world + "var Smithers       = {name: 'Waylon Smithers'         ,age : 32 };\n";
    

    world = world + "Bart.alias         = ['The Bartok','Jojo']; \n";
    world = world + "Bart.friends       = [Milhouse,Nelson,]; \n";
    world = world + "Homer.spouse       = Marge; \n";
    world = world + "Marge.spouse       = Homer; \n";
    world = world + "Bart.sister        = Lisa; \n";
    world = world + "Bart.sister        = Maggie; \n";

    world = world + "Maggie.sister      = Lisa; \n";
    world = world + "Lisa.sister        = Maggie; \n";

    world = world + "Maggie.brother     = Bart; \n";
    world = world + "Lisa.brother       = Bart; \n";

    world = world + "Milhouse.friends   = [Bart,Nelson]; \n";
    world = world + "Nelson.friends     = [Bart,Milhouse]; \n";
    world = world + "Homer.children     = [Maggie,Lisa,Bart]; \n";
    world = world + "Marge.children     = [Maggie,Lisa,Bart]; \n";

    world = world + "Homer.friends      = [Apu, Lenny, Moe ]; \n";
    world = world + "Homer.work         = [Lenny, MrBurns,Smithers ]; \n";


    world = world + "\n";





    // ---------------- You should not change core prototypes unless you know what you are doing !!
    var f = Object.prototype.toString;
    Object.prototype.toString = function () {
        if (this.name) return this.name; // created by ["+this.constructor.toString().substring(0,15)+(this.constructor.toString().length>15? "...]":"]");
        return f();
    }


    // ---------------------------------------------------
    if (i == 0) return { name: "Homer & Marge", code: world+"  return [Homer,Marge]" };
    if (i == 1) return { name: "Simpsons Family", code: world + "return [Homer,Marge,Bart,Lisa, Maggie]" };
    if (i == 2) return { name: "Homer's world", code: world + "return [Homer,Apu,Lenny,Moe,MrBurns,Smithers]" };
    if (i == 3) return { name: "Bart's friends", code: world + "return [Bart, Milhouse, Nelson]" };
    if (i == 4) return { name: "All", code: world + "return [Homer,Marge,Bart,Lisa, Maggie , Milhouse, Nelson,Apu,Lenny,Moe,MrBurns,Smithers ]" };
    return null;
}

