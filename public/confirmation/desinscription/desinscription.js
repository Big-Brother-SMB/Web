

const menu = "../../menu/menu.html"

function reload(){
    window.location.reload(true)
}

let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));
console.log(path(j,h))

database.ref(path(j,h) + "/ouvert").once('value').then(function(snapshot) {
    if(snapshot.val() == 3 || snapshot.val() == 5){
        window.location.href = menu;
    }else if(snapshot.val() == 7){
        robi();
    }else{
        document.getElementById("amis").style = "display:none"
        document.getElementById("pAmis").style = "display:none"
        suite();
    }
});

function robi(){
    console.log("robi")
    let divAmis = document.getElementById("amis")
    database.ref(path(j,h) + "/demandes/" + user + "/amis").once("value", function(snapshot) {
        divAmis.innerHTML = ""
        snapshot.forEach(function(child) {
            let ami = document.createElement("button")
            ami.classList.add("amis")
            ami.innerHTML = child.key + " (supprimer)"
            ami.addEventListener("click", function() {
                console.log("remove")
                database.ref(path(j,h) + "/demandes/" + user + "/amis/" + child.key).remove();
                reload()
            })
            divAmis.appendChild(ami);
        })
        suite();
    })
}



function suite(){
    document.getElementById("info").innerHTML = "Vous êtes inscrit à cet horaire"
    document.getElementById("oui").addEventListener("click", function() {
        database.ref(path(j,h) + "/demandes/" + user).remove();
        window.location.href = menu;
    });
    document.getElementById("non").addEventListener("click", function() {
        window.location.href = menu;
    });
}



