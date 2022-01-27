
user = sessionStorage.getItem("user");
classe = sessionStorage.getItem("classe");
console.log("classe : " + classe)
week = actualWeek

writeCookie("user",user)
writeCookie("classe",classe)
writeCookie("week",week)



database.ref("users/" + user + "/score").once("value", function(snapshot) {
    console.log("score : " + snapshot.val())
    if(snapshot.val() == null){
        console.log("score create")
        database.ref("users/" + user + "/score").set(0);
    }
})

database.ref("users/" + user + "/classe").once("value", function(snapshot) {
    console.log("classe : " + snapshot.val())
    if(snapshot.val() == null){
        console.log("classe create")
        database.ref("users/" + user + "/classe").set(classe);
    }
})

setTimeout(function() {
    window.location.href = "menu/menu.html";
},2000);



