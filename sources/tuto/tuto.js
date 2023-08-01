export async function init(common){
    let a = document.getElementById("main").getElementsByTagName("a");
    for (let i = 0; i < a.length; i++) {
        const index = i;
        if(a[index].attributes.url!=undefined){
            a[i].addEventListener("click", ()=>{
                common.loadpage(a[index].attributes.url.value)
            })
        }else if(a[index].attributes.cible!=undefined){
            a[i].addEventListener("click", ()=>{
                let elem = document.getElementById(a[index].attributes.cible.value);
                elem.style.background="yellow";
                setTimeout(function(){elem.style.background="";},1000);
            })
        }
    }

    var coll = document.getElementsByClassName("collapsible");

    for (let i = 0; i < coll.length; i++) {
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