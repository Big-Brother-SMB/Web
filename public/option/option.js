let switchAllAmis = document.getElementById("allAmis")
let switchEmail = document.getElementById("switch email")
let inputCodeBar = document.getElementById("code bar")

switchAllAmis.checked = bollAllAmis
switchAllAmis.addEventListener("change",function(){
    writeCookie("allAmis",this.checked)
    
})

getUserData("send mail",function(value){
    bollEmail = value
    switchEmail.checked = bollEmail
    charged()
})


switchEmail.addEventListener("change",function(){
    writeCookie("bEmail",this.checked)
    database.ref("users/" + user + "/send mail").set(this.checked)
    document.getElementById("chargement").style.display = "block"
    database.ref("users/" + user + "/send mail").once('value',function(snapshot) {
        document.getElementById("chargement").style.display = "none"
    })
})

if(hasCodeBar){
    inputCodeBar.value = codeBar
}

inputCodeBar.addEventListener("input",function(){
    document.getElementById("info code bar").innerHTML = ""
    let val = inputCodeBar.value
    if(String(val).length  == 5){
        document.getElementById("chargement").style.display = "block"
        document.getElementById("article").style.display = "none"
        database.ref("codes barres/" + val).once('value',function(snapshot) {
            if(snapshot.val() == null){
                database.ref("codes barres/" + codeBar).remove()
                writeCookie("code bar", val)
                codeBar = val
                database.ref("code barre/" + codeBar).set(user)
                database.ref("users/" + user + "/codes barres").set(codeBar)
            }else{
                document.getElementById("info code bar").innerHTML = "ce code barre est déjà attribué"
            }
            document.getElementById("chargement").style.display = "none"
            document.getElementById("article").style.display = "block"
        })
    }
    
    
    
})


document.getElementById("deco").addEventListener("click", function() {
    deco()
});


let charge = 1
function charged(){
    if(charge < 1){
        charge++
        return
    }
    console.log("charged")
    document.getElementById("article").style.display = "block"
    document.getElementById("chargement").style.display = "none"
}