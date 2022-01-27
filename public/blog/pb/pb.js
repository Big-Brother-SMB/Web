const menu = "../../menu/menu.html"

document.getElementById("envoyer").addEventListener("click", function() {
    let message = document.getElementById("text Area").value
    if(message.length <= 200 && message.length >= 20){
        console.log(message)
        database.ref("probleme/" + user).set(message)
        document.getElementById("info").style.color = "black"
        document.getElementById("info").innerHTML = "envoi de votre message encours, veuillez patientez"
        setTimeout(function() {
            window.location.href = menu;
        },1000);
        
    }else{
        document.getElementById("info").style.color = "red"
        document.getElementById("info").innerHTML = "Taille de message non réglementaire"
    }
    
});


document.getElementById("text Area").onkeydown =  function(){
    let lettres = document.getElementById("text Area").value.length
    document.getElementById("info").innerHTML = lettres + " lettres sur 200 authorisées (20 minimum)"
    if(lettres > 200 || lettres < 20){
        document.getElementById("info").style.color = "red"
    }else{
        document.getElementById("info").style.color = "black"
    }
};