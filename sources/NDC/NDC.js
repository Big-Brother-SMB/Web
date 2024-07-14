
async function fetchText(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text()
    } catch (error) {}
}

export async function init(common){
    const selecteur = document.getElementById("jeuSelect")
    const liste_jeux = [
        {name:"Treasure Miners",id:"p1"},
        {name:"BobAventure",id:"p2"},
        {name:"Corrupted Forest",id:"p3"},
        {name:"Chasse au Trésor Aquatique",id:"p4"},
        {name:"Find the Chest",id:"p5"},
        {name:"Diving Tycoon",id:"p6"},
        {name:"Platform-Code",id:"p7"},
        {name:"Survie Coins",id:"p8"},
        {name:"Trésors Cachés",id:"t1"},
        {name:"JO",id:"t2"},
        {name:"The Deep Cavern",id:"t3"},
        {name:"Abysse Quest",id:"t4"},
        {name:"Dungeon and Treasure",id:"t5"},
        {name:"Squelettes",id:"t6"},
        {name:"Dungeon and Treasure+",id:"t5.2"},
        {name:"Super Zombie",id:"zombie"}
    ]

    for(let e of liste_jeux){
        let opt = document.createElement("option")
        opt.value=e.id
        opt.innerHTML=e.name
        selecteur.appendChild(opt)
    }

    selecteur.addEventListener("change", async function(a) {
        document.getElementById("desc_img").setAttribute("src","/NDC/jeux/" + selecteur.value + "/image.png")
        document.getElementById("desc_p").innerHTML= (await fetchText("/NDC/jeux/" + selecteur.value + "/description.txt")).replaceAll("\n","<br>")
        document.getElementById("jeu").href="/NDC/launcher.html?jeu=" + selecteur.value
        document.getElementById("download").href="/NDC/jeux/" + selecteur.value + "/jeu.pyxapp"
    });
}