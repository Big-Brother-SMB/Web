let pName = document.getElementById('name');
let forum = sessionStorage.getItem("forum");

pName.innerHTML = forum


let fil = document.getElementById('fil');
let nbMsg = 0

database.ref("forums/" + forum + "/fil").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        let text = document.createElement("li")
        text.innerHTML = child.key + " -> " + child.val()
        fil.appendChild(text);
        nbMsg++
    });
});

let msg = document.getElementById('msg');
let envoyer = document.getElementById('envoyer');
envoyer.addEventListener('click', function(){
    if(msg.value.length > 1){
        let d = new Date();
        database.ref("forums/" + forum + "/fil/" + nbMsg + "-" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + user).set(msg.value)
        reload()
    }
    
});
