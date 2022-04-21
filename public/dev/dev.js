setColorMode("..")

database.ref("version").once("value", function (snapshot) {
    let msg = snapshot.val()
    if (msg != null) {
        document.getElementById("version").innerHTML ="Version "+msg
    }


})
