

let divAmis = document.getElementById("amis")
database.ref("users/" + user + "/amis").once("value", function(snapshot) {
    divAmis.innerHTML = ""
    snapshot.forEach(function(child) {
        let ami = document.createElement("button")
        ami.classList.add("amis")
        ami.innerHTML = child.key
        ami.addEventListener("click", function() {
            console.log("remove")
            database.ref("users/" + user + "/amis/" + child.key).remove();
            reload()
        })
        divAmis.appendChild(ami);
        amis.push(child.key)
    })
    suite1();
})

function suite1(){
    console.log(amis)
    let users = []
    database.ref("names").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            if(child.key != user && amis.indexOf(child.key) == -1){
                users.push(child.key)
            }
        })
        autocomplete(document.getElementById("addAmi"), users);
    })

    document.getElementById("ajout").addEventListener("click", function() {
        console.log("click")

        let ami = document.getElementById("addAmi").value

        if(users.indexOf(ami) != -1){
            console.log(ami)
            database.ref("users/" + user + "/amis/" + ami).set(0);
        }
        reload()

    })
}
