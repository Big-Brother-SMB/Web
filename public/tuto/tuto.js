function miseenavant(id,temp)
{
let elem=document.getElementById(id);
elem.style.background="yellow";
setTimeout(function(){elem.style.background="";},temp);
}
