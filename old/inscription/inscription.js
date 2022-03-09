const menu = "../../menu/menu.html"

let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));
console.log(path(j,h));

database.ref(path(j,h) + "/ouvert").once('value').then(function(snapshot) {
    if(snapshot.val() == 1 || snapshot.val() == 3){
        suite1(false);
    }else if(snapshot.val() == 7){
        suite1(true);
    }else{
        console.log("ouvert -> " + snapshot.val())
        //window.location.href = menu;
        
    }
});


function suite1(rob){
    database.ref(path(j,h) + "/places").once('value').then(function(snapshot) {
        suite2(snapshot.val(),rob);
    });
}





function suite2(placesDisp,rob){
    console.log("suite1");
    console.log(placesDisp);
    database.ref(path(j,h)).once('child_added').then(function(snapshot) {
        let nbChild = 0
        if(snapshot.numChildren() >= 0){
            nbChild = snapshot.numChildren()
        }
        
        score(nbChild, placesDisp,rob)
        
    });
}



function suite3(places,score){
    console.log("suite2");
    if(places <= 0){
        window.location.href = menu;
    }else{
        database.ref(path(j,h) + "/demandes/" + user + "/carte").set(12345);
        let text = places + " places"
        if(places==1){
            text = "une place"
        }
        document.getElementById("info").innerHTML = "il reste " + text +" <br>Vous êtes temporairement inscrit pendant 10sec"
        document.getElementById("oui").addEventListener("click", function() {
            database.ref(path(j,h) + "/demandes/" + user).remove();
            database.ref(path(j,h) + "/demandes/" + user + "/classe").set(classe);
            database.ref(path(j,h) + "/demandes/" + user + "/score").set(score);
            database.ref(path(j,h) + "/demandes/" + user + "/carte").set(12345);
            window.location.href = menu;
        });
        document.getElementById("non").addEventListener("click", function() {
            database.ref(path(j,h) + "/demandes/" + user).remove();
            window.location.href = menu;
        });
        setTimeout(function() {
            console.log("remove");
            database.ref(path(j,h) + "/demandes/" + user).remove();
            window.location.href = menu;
        },10000);
    }
}

function score(nbChild, placesDisp,rob){
    database.ref("users/" + user + "/score").once('value').then(function(snapshot) {
        let score = snapshot.val()
        if(rob){
            robi(nbChild, placesDisp, score)
        }else{
            document.getElementById("amis").style = "display:none"
            document.getElementById("pAmis").style = "display:none"
            suite3(placesDisp - nbChild,score);
        }
        
    });
}

function robi(pers, places, score){
    let divAmis = document.getElementById("amis")
    divAmis.innerHTML = "recherche d'amis en cours"
    let amis = []
    document.getElementById("info").innerHTML = "Ce crénau est en mode aléatoire.<br>Il y a " + pers + " personnes inscrites pour " + places + " places"
    document.getElementById("oui").addEventListener("click", function() {
        database.ref(path(j,h) + "/demandes/" + user + "/carte").set(12345);
        database.ref(path(j,h) + "/demandes/" + user + "/score").set(score);
        database.ref(path(j,h) + "/demandes/" + user + "/classe").set(classe);
        for(let a in amis){
            database.ref(path(j,h) + "/demandes/" + user + "/amis/" + amis[a]).set(0);
        }
        window.location.href = menu;
    });
    document.getElementById("non").addEventListener("click", function() {
        window.location.href = menu;
    });

    
    database.ref("users/" + user + "/amis").once("value", function(snapshot) {
        divAmis.innerHTML = ""
        snapshot.forEach(function(child) {
            let ami = document.createElement("button")
            ami.classList.add("amis")
            let name = child.key
            ami.innerHTML = name
            ami.addEventListener("click", function() {
                console.log("add")
                ami.innerHTML = name + " (ajouté)"
                amis.push(name)
            })
            divAmis.appendChild(ami);
        })
    })
}

