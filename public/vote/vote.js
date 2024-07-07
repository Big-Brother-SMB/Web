let roi = document.getElementById("roi")
let reine = document.getElementById("reine")
let roi_email = ""
let reine_email = ""
database.ref("users/" + user + "/roi").once("value", function(snapshot) {
    console.log(snapshot.val())
    if(snapshot.val()!=undefined){
        roi_email = snapshot.val()
        roi.innerHTML = "Roi: " + FindMyName(roi_email)  
    }
})

database.ref("users/" + user + "/reine").once("value", function(snapshot) {
    console.log(snapshot.val())
    if(snapshot.val()!=undefined){
        reine_email = snapshot.val()
        reine.innerHTML = "Reine: " + FindMyName(reine_email)  
    }
})


function suite1(){
    let users = []
    let usersNames = []
    database.ref("names").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            childName=FindMyName(child.key)
            if(child.key != user){
                usersNames.push(childName)
                users.push(child.key)
            }
        })
        autocomplete(document.getElementById("addAmi"), usersNames,function(){});
    })

    roi.addEventListener("click", function() {
        let name = document.getElementById("addAmi").value

        if(usersNames.indexOf(name) != -1 && users[usersNames.indexOf(name)]!=user){
            console.log(users[usersNames.indexOf(name)])
            database.ref("users/" + user + "/roi").set(users[usersNames.indexOf(name)]);
            setTimeout(() => {
                reload()
            }, 500);
        }
    })

    reine.addEventListener("click", function() {
        let name = document.getElementById("addAmi").value

        if(usersNames.indexOf(name) != -1 && users[usersNames.indexOf(name)]!=user){
            database.ref("users/" + user + "/reine").set(users[usersNames.indexOf(name)]);
            setTimeout(() => {
                reload()
            }, 500);
        }
    })
}
suite1();


document.getElementById("disconnect").addEventListener("click", function () {
    deco()
});