document.getElementById("css").href = "";

let link = document.createElement("link")
link.setAttribute("rel","stylesheet")
link.setAttribute("href","/troll/troll.css")
document.getElementsByTagName("head")[0].appendChild(link)

