let switchAllAmis = document.getElementById("allAmis")
let switchEmail = document.getElementById("switch email")
//let inputCodeBar = document.getElementById("code bar")

switchAllAmis.checked = bollAllAmis
switchAllAmis.addEventListener("change", function () {
    writeCookie("allAmis", this.checked)

})

getUserData("send mail", function (value) {
    bollEmail = value
    switchEmail.checked = bollEmail
    charged()
})


switchEmail.addEventListener("change", function () {
    writeCookie("bEmail", this.checked)
    database.ref("users/" + user + "/send mail").set(this.checked)
    document.getElementById("chargement").style.display = "block"
    database.ref("users/" + user + "/send mail").once('value', function (snapshot) {
        document.getElementById("chargement").style.display = "none"
    })
})
/*database.ref("users/" + user + "/code barre").once('value', function (snapshot) {
    const val = snapshot.val()
    inputCodeBar.value = val
    writeCookie("code bar", val)
    charged()
})

inputCodeBar.addEventListener("input", function () {
    document.getElementById("info code bar").innerHTML = ""
    let val = inputCodeBar.value
    if (String(val).length == 5) {
        document.getElementById("chargement").style.display = "block"
        document.getElementById("article").style.display = "none"
        database.ref("codes barres/" + val).once('value', function (snapshot) {
            if (snapshot.val() == null || snapshot.val() == user) {
                database.ref("codes barres/" + codeBar).remove()
                writeCookie("code bar", val)
                codeBar = val
                database.ref("codes barres/" + codeBar).set(user)
                database.ref("users/" + user + "/code barre").set(codeBar)
            } else {
                document.getElementById("info code bar").innerHTML = "ce code barre est déjà attribué"
            }
            document.getElementById("chargement").style.display = "none"
            document.getElementById("article").style.display = "block"
        })
    }



})*/

var ele = document.getElementsByName("color");


console.log("colorMode : " + colorMode)
setColorMode("..")


for(i = 0; i < ele.length; i++) {
    const index = i
    ele[index].addEventListener("change", function () {
        writeCookie("color mode", index)
        colorMode = index
        setColorMode("..")
    })
    if(index == colorMode){
        ele[index].checked = true

    }

}


let selectBack = document.getElementById("color back");
selectBack.value = backgroundColor
selectBack.addEventListener("input", function () {
    writeCookie("color background", this.value)
    backgroundColor = this.value
    setColorMode("..")
    //document.getElementById("article").style.backgroundColor = this.value;
})

let selectText = document.getElementById("color text");
selectText.value = textColor
selectText.addEventListener("input", function () {
    writeCookie("color text", this.value)
    textColor = this.value
    setColorMode("..")
})



document.getElementById("disconnect").addEventListener("click", function () {
    deco()
});


let charge = 1
function charged() {
    if (charge < 2) {
        charge++
        return
    }
    console.log("charged")
    document.getElementById("article").style.display = "block"
    document.getElementById("chargement").style.display = "none"
}

database.ref("modo/users").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        if (child.key===user){
            document.getElementById("admin").style.visibility="visible";
        }
    })
})
