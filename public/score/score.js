let divScore = document.getElementById("divScore")
let score = document.getElementById("score")


database.ref("users/" + user + "/score").once('value').then(function(snapshot) {
    let total = 0
    snapshot.forEach(function(child) {
        let event = document.createElement("button")
        event.classList.add("event")
        
        divScore.appendChild(event);
        
        database.ref("users/" + user + "/score/" + child.key + "/name").once('value').then(function(snapshot) {
            let name = snapshot.val()
            if(name == null){
                name = ""
            }else{
                name += " : "
            }
            database.ref("users/" + user + "/score/" + child.key + "/value").once('value').then(function(snapshot2) {
                let sc = snapshot2.val()
                if (sc <2) {
                    event.innerHTML = name + sc + " point"
                }else{
                    event.innerHTML = name + sc + " points"
                }
                
                total += sc
                total = Math.round(total*100)/100
                if (total <2) {
                    document.getElementById("score").innerHTML = total + " point"
                }else{
                    document.getElementById("score").innerHTML = total + " points"
                }
            }) 
        }) 
    })
    charged()
});


let charge = 1
function charged(){
    if(charge < 1){
        charge++
        return
    }
    console.log("charged")
    document.getElementById("article").style.display = "block"
    document.getElementById("chargement").style.display = "none"
}