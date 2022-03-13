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
                let eventScore = parseFloat(snapshot2.val())
                if (eventScore <2) {
                    event.innerHTML = name + eventScore + " point"
                }else{
                    event.innerHTML = name + eventScore + " points"
                }
                
                total += eventScore
                total = Math.round(total*100)/100
                if (total <2) {
                    document.getElementById("score").innerHTML = total + "pt"
                }else{
                    document.getElementById("score").innerHTML = total + "pts"
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