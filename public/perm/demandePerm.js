let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));

let divDemandes = document.getElementById("demandes")


database.ref(pathPerm(j,h) + "/demandes").once('value').then(function(snapshot) {
    database.ref("names").once('value').then(function(snapshotNames) {
        if(snapshot.val() != null){
            divDemandes.innerHTML = ""
        }
        snapshot.forEach(function(child) {
            let u = child.key
            let name = snapshot.child(u + "/name").val()
            let nb = snapshot.child(u + "/nb").val()
            but = document.createElement("button")
            but.classList.add("amis")
            but.innerHTML = name +  " : " + nb +" (" + snapshotNames.child(u).val() + ")"
    
            if(u == user){
                but.addEventListener("click", function(){
                    but.remove()
                    database.ref(pathPerm(j,h) + "/demandes/" + u).remove()
                })
            }
    
            divDemandes.appendChild(but);
        })
    
    
        document.getElementById("oui").addEventListener("click", function() {
            let val = document.getElementById("input").value
            let nb = document.getElementById("nb").value
            if(val.lenght != 0 && nb != ""){
                let hashCode = hash()
                database.ref(pathPerm(j,h) + "/demandes/" + user + "/name").set(val)
                database.ref(pathPerm(j,h) + "/demandes/" + user + "/nb").set(nb)
                setTimeout(function() {
                window.location.href = "perm.html";
                },1000)
            }
            
        })
    
        charged(true)
    })
});