

let divAmis = document.getElementById("amis")
database.ref("users/" + user + "/amis").once("value", function(snapshot) {
    divAmis.innerHTML = ""
    snapshot.forEach(function(child) {
        let ami = document.createElement("button")
        ami.classList.add("amis")

        database.ref("names/" + child.key).once("value", function(snapshot) {
            ami.innerHTML = snapshot.val()
        })
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
    database.ref("names").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            if(child.key != user && amis.indexOf(child.key) == -1){
                users.push(child.key)
                usersNames.push(snapshot.child(child.key).val())
            }
        })
        document.getElementById("addAmi").addEventListener("input", function(){
          if (document.getElementById("addAmi").value.length>3){
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
            database.ref("users/" + user + "/amis/" + users[usersNames.indexOf(ami)]).set(0);
        }
        reload()
    })
}
