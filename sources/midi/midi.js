export async function init(common){
    let week = common.week
    document.getElementById("semainePrecedente").addEventListener("click", function () {
        week--
        common.writeCookie("week", week)
        refreshDatabase()
    });

    document.getElementById("semaineActuelle").addEventListener("click", function () {
        week = common.actualWeek
        common.writeCookie("week", week)
        refreshDatabase()
    });

    document.getElementById("semaineSuivante").addEventListener("click", function () {
        week++
        common.writeCookie("week", week)
        refreshDatabase()
    });

    const creneaudiv = document.getElementById("creneaudiv");


    let bouton = [];
    let placesTotal = [];
    let nbDemandes = [];
    let demandes = []
    let demande = []
    let places = [];

    let ouvert = []
    let cout = []
    let nbAmis = []
    let nbAmisDemande = []
    let nbAmisInscrit = []

    let nbInscrits = []
    let inscrits = [];
    let inscrit = []

    for (let j = 0; j < 4; j++) {
        bouton[j] = []
        placesTotal[j] = []
        places[j] = []

        nbAmis[j] = []
        nbAmisDemande[j] = []
        nbAmisInscrit[j] = []
        nbDemandes[j] = []
        demandes[j] = []
        demande[j] = [false, false]

        nbInscrits[j] = []
        inscrits[j] = []
        inscrit[j] = [false, false]
        ouvert[j] = [0, 0]
        cout[j] = [1, 1]
        for (let h = 0; h < 2; h++) {
            bouton[j][h] = document.getElementById("" + j + h)
            bouton[j][h].onclick = function () { select(j, h) };
        }
        bouton[j][2] = document.getElementById(j + "2")
    }


    async function refreshDatabase() {
        let info_menu = await common.socketAsync("getMenuThisWeek",week)
        if (week == common.actualWeek) {
            document.getElementById("semaine").innerHTML = "Cette semaine (n°" + week + " du " + common.intervalSemaine(week) + ")"
        } else {
            document.getElementById("semaine").innerHTML = "Semaine n°" + week + " du " + common.intervalSemaine(week)
        }
        let menu
        try{
            menu = info_menu["menu"]
        }catch(e){}
        if (menu == null) {
            menu = "inconnu pour le moment"
        }
        document.getElementById("menuSemaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + menu

        for (let j = 0; j < 4; j++) {
            for (let h = 0; h < 2; h++) {
                let info_horaire = await common.socketAsync("getDataThisCreneau",{w:week,j:j,h:h})
                let my_demande = await common.socketAsync("getMyDemande",{w:week,j:j,h:h})
                let list_demandes = await common.socketAsync("listDemandes",{w:week,j:j,h:h})

                placesTotal[j][h] = info_horaire["places"];
                if(placesTotal[j][h]==null || placesTotal[j][h]==""){
                    placesTotal[j][h]=0
                }

                if (info_horaire.ouvert == null) {
                    ouvert[j][h] = 0
                } else {
                    ouvert[j][h] = info_horaire.ouvert
                }

                if (info_horaire.cout != null) {
                    cout[j][h] = parseFloat(info_horaire.cout)
                }

                //demande en cours

                nbDemandes[j][h] = 0
                demandes[j][h] = []
                demande[j][h] = false;

                nbInscrits[j][h] = 0
                inscrits[j][h] = []
                inscrit[j][h] = false;

                nbAmis[j][h] = 0
                nbAmisDemande[j][h] = 0
                nbAmisInscrit[j][h] = 0

                list_demandes.forEach(e => {
                    if(e.DorI == 0){
                        nbDemandes[j][h]++
                        if (e.uuid == common.uuid) {
                            demande[j][h] = true;
                        } else {
                            demandes[j][h].push(e.uuid)
                        }
                    }else if(e.DorI == 1){
                        nbInscrits[j][h]++
                        if (e.uuid == common.uuid) {
                            inscrit[j][h] = true;
                        } else {
                            inscrits[j][h].push(e.uuid)
                        }
                    }
                });


                if(my_demande.amis!=null){
                    my_demande.amis.forEach(e=>{
                        nbAmis[j][h]++
                        if (demandes[j][h].indexOf(e) != -1) {
                            nbAmisDemande[j][h]++
                        }
                        if (inscrits[j][h].indexOf(e) != -1) {
                            nbAmisInscrit[j][h]++
                        }
                    })
                }
                update(j, h);
            }

        let jcorriger=j
        if(jcorriger>1){
            jcorriger++;
        }
        bouton[j][2].innerHTML = common.getDayText(jcorriger,week)
        }
    }


    function update(j, h) {
        places[j][h] = placesTotal[j][h] - nbInscrits[j][h];
        let coutPourcentage = common.round((cout[j][h] - 1) * 100)
        let textcout = ""
        let text = "horaire non planifié";

        if(coutPourcentage != 0){
            if(coutPourcentage > 0){
                textcout += "<br><rouge>Cout en point : " + "+" + coutPourcentage + "%</rouge>"
            }else{
                textcout = "<br><vert>Cout en point : " + coutPourcentage + "%</vert>"
            }
        }

        switch (ouvert[j][h]) {
            case 0:
                text = "horaire non planifié"
                bouton[j][h].className="case default"
                break;
            case 1:
                text = "ouvert à tous";
                bouton[j][h].className="case green"
                break;
            case 2:
                bouton[j][h].className = "case blue"
                if (places[j][h] <= 0) {
                    bouton[j][h].className = "case red"
                    text = "Plein"+ textcout;
                } else {
                    bouton[j][h].className = "case blue"
                    text = nbDemandes[j][h] + " demandes pour " + places[j][h] + " places" + textcout
                }
                break;
            case 3:
                bouton[j][h].className="case yellow"
                if (places[j][h] <= 0) {
                    text = "Plein"+ textcout;
                } else {
                    text = nbDemandes[j][h] + " demandes pour " + places[j][h] + " places" + textcout
                }
                break;
            case 4:
                text = "Foyer fermé"
                bouton[j][h].className="case red"
                break;
            case 5:
                text = "Fini"
                bouton[j][h].className="case red"
                break;
            case 6:
                text = "Vacances"
                bouton[j][h].className="case default"
                break;
        }
        if(ouvert[j][h]===2 || ouvert[j][h]===3){
            if (inscrit[j][h]) {
                bouton[j][h].className = "case green"
                text = "Vous êtes inscrit"
            } else if (demande[j][h]) {
                bouton[j][h].className = "case demande"
                text = "Demande enregistrée"
            }

            if (nbAmis[j][h] == 1) {
                text += " avec 1 ami"
                if (nbAmisDemande[j][h] == 1) {
                    text += " qui a fait une demande"
                } else if (nbAmisInscrit[j][h] == 1) {
                    text += " qui a été inscrit"
                }else{
                    text += " qui n'a pas fait de demande"
                }
            } else if (nbAmis[j][h] > 1) {
                text += " avec " + nbAmis[j][h] + " amis"
                if(nbAmis[j][h] == nbAmisDemande[j][h]){
                    text += " qui ont tous fait une demande"
                }else if(nbAmis[j][h] == nbAmisInscrit[j][h]){
                    text += " qui ont tous été inscrit"
                }else if(0 == nbAmisDemande[j][h] && 0 == nbAmisInscrit[j][h]){
                    text += " qui n'ont pas fait de demandes"
                }else {
                    if (nbAmisDemande[j][h] == 1) {
                        text += " dont un seul a fait une demande"
                    } else if(nbAmisDemande[j][h]>1){
                        text += " dont " + nbAmisDemande[j][h] + " ont fait une demande"
                    }
                    if(nbAmisDemande[j][h] != 0 && nbAmisInscrit[j][h] != 0){
                        text += " et"
                    }
                    if (nbAmisInscrit[j][h] == 1) {
                        text += " dont un seul a été inscrit"
                    } else if(nbAmisInscrit[j][h]>1){
                        text += " dont " + nbAmisInscrit[j][h] + " ont été inscrits"
                    }
                }
            }
        }
        bouton[j][h].innerHTML = text;
    }

    function select(j, h) {
        const hInv = h==0?1:0
        if(ouvert[j][h] == 2 && !demande[j][hInv] && !inscrit[j][hInv]){
            common.loadpage("/midi/demande?j="+j+"&h="+h+"&w="+week)
        }
    }

    refreshDatabase();
}


