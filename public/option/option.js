let switchAllAmis = document.getElementById("allAmis")



console.log(bollAllAmis)
switchAllAmis.checked = bollAllAmis
switchAllAmis.addEventListener("change",function(){
    console.log(this.checked)
    writeCookie("allAmis",this.checked)
})

document.getElementById("deco").addEventListener("click", function() {
    deco()
});