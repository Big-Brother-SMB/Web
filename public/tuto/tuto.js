document.getElementById("OK").addEventListener("click", menuFunction)

function menuFunction() {
    database.ref("users/" + user + "/tuto").set(true)
    window.location.href = "/menu/menu.html";
}

function miseenavant(id,temp)
{
let elem=document.getElementById(id);
elem.style.background="yellow";
setTimeout(function(){elem.style.background="";},temp);
}

var coll = document.getElementsByClassName("collapsible");
var i;

database.ref("users/" + user + "/tuto").once("value", function(snapshot) {
    tuto = snapshot.val()
    if(tuto != true){
      OK.style.display = "content"
      document.getElementById("retour").style.visibility="hidden"
      for (i = 0; i < coll.length; i++) {
          coll[i].classList.toggle("active")
          var content = coll[i].nextElementSibling
          coll[i].innerHTML=coll[i].innerHTML.replace(/▸/g,'')
          content.style.transition ="none"
          content.style.maxHeight = content.scrollHeight + "px"
      }
    }
    else {
      OK.style.display = "none"
      for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
          this.classList.toggle("active")
          var content = this.nextElementSibling
          if (content.style.maxHeight){
            this.innerHTML=this.innerHTML.replace(/▾/g,'▸')
            content.style.maxHeight = null
          } else {
            this.innerHTML=this.innerHTML.replace(/▸/g,'▾')
            content.style.maxHeight = content.scrollHeight + "px"
          }
        })
      }
    }
})
