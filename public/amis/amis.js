

let divAmis = document.getElementById("amis")
database.ref("users/" + user + "/amis").once("value", function(snapshot) {
    divAmis.innerHTML = ""
    snapshot.forEach(function(child) {
        let ami = document.createElement("button")
        ami.classList.add("amis")
        ami.innerHTML=FindMyName(child.key)
        ami.addEventListener("click", function() {
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
    let usersNames = []
    database.ref("users").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            childName=FindMyName(child.key)
            if(childName != user && amis.indexOf(childName) == -1){
                usersNames.push(childName)
                users.push(child)
            }
        })
        document.getElementById("addAmi").addEventListener("input", function(){
          if (document.getElementById("addAmi").value.length>2){
            autocomplete(document.getElementById("addAmi"), usersNames,function(){});
          }
          else{
            autocomplete(document.getElementById("addAmi"), [],function(){});
          }
        })
    })

    document.getElementById("ajout").addEventListener("click", function() {
        console.log("click")

        let ami = document.getElementById("addAmi").value

        if(usersNames.indexOf(ami) != -1){
            database.ref("users/" + user + "/amis/" + FindMyEmail(ami)).set(0);
        }
        reload()
    })
}
