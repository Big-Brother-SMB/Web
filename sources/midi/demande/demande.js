const day = ["Lundi", "Mardi", "Jeudi", "Vendredi"]

class Ami {
    static common;

    constructor(uuid, first_name, last_name, procuration, pris, inMyFriendList, DorI) {
        this.uuid = uuid
        this.first_name = first_name
        this.last_name = last_name
        this.procuration = procuration
        this.pris = pris
        this.inMyFriendList = inMyFriendList
        this.DorI = DorI
        this.score = -100
    }

    static searchAmiUUID(list, uuid) {
        for (let i in list) {
            if (list[i].uuid == uuid) {
                return list[i]
            }
        }
        return null;
    }

    static allPris(list) {
        list.forEach(e => {
            e.pris = 1
        })
    }

    static allNonPris(list) {
        list.forEach(e => {
            e.pris = 0
        })
    }

    static listPrisNonAmi(list, list_pris) {
        list.forEach(ami => {
            list_pris.forEach(uuid => {
                if (ami.uuid == uuid) {
                    ami.pris = 1
                }
            })
        })

        list_pris.forEach(uuid => {
            if (Ami.searchAmiUUID(list, uuid) == null) {
                list.push(new Ami(uuid, "", "", null, 1, 0, null))
            }
        })
    }

    bouton(update) {
        let moi = this

        let button = document.createElement("button")
        button.classList.add("ami")
        button.innerHTML = Ami.common.name(this.first_name, this.last_name) + " (" + this.score + "pts)"

        if (this.DorI == 0) {
            button.innerHTML += "<br>(a fait une demande)"
        } else if (this.DorI == 1) {
            button.innerHTML += "<vert> (est inscrit)</vert>"
        } else {
            button.innerHTML += "<br><rouge>(doit faire une demande)</rouge>"
        }
        if (this.inMyFriendList == 0) {
            button.classList.add('partiel')
        }


        button.addEventListener("click", function () {
            if (moi.pris) {
                moi.pris = 0
            } else {
                moi.pris = 1
            }

            update()
        })

        let divListeAmis = document.getElementById("listeAmis")
        let divAmisAjoute = document.getElementById("listeMange")

        if (this.pris) {
            divAmisAjoute.appendChild(button);
        } else {
            divListeAmis.appendChild(button);
        }
    }
}

export async function init(common) {
    try {
        Ami.common = common
        document.getElementById("btn_retour").classList.remove("cache")
        document.getElementById("btn_retour").setAttribute("url", "/midi")

        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        let j = 0
        let h = 0
        let w = 0
        if (params.j != null) {
            j = parseInt(params.j)
        }
        if (params.h != null) {
            h = parseInt(params.h)
        }
        if (params.w != null) {
            w = parseInt(params.w)
        }

        const suppMyDemande = async function () {
            common.popUp_Active('Procuration:', '', async (bnt) => {
                bnt.innerHTML = 'Confirmer'
                let from = document.createElement('from')

                let textIntro = document.createElement('p')
                textIntro.innerHTML = "Supprimer la demande de:"
                document.getElementById('popup-body').appendChild(textIntro)

                document.getElementById('popup-body').appendChild(from)
                let passProcuration = true
                listAmis.forEach(ami => {
                    if (ami.procuration == 1 && ami.DorI != 1) {
                        passProcuration = false
                        let box = document.createElement('input')
                        box.setAttribute("type", "checkbox")
                        box.setAttribute("name", "procuration")
                        box.setAttribute("value", ami.uuid)
                        from.appendChild(box)

                        let label = document.createElement('label')
                        label.setAttribute("for", "procuration")
                        label.innerHTML = common.name(ami.first_name, ami.last_name)
                        from.appendChild(label)
                        from.innerHTML += '<br>'
                    }
                })
                if (passProcuration) {
                    await common.socketAsync('delMyDemande', { w: w, j: j, h: h })
                    common.popUp_Stop()
                    common.loadpage("/midi")
                } else {
                    bnt.addEventListener('click', async () => {
                        const checkBoxs = document.querySelectorAll('input[name="procuration"]');
                        for (const checkBox of checkBoxs) {
                            if (checkBox.checked) {
                                await common.socketAsync('delAmiDemande', { uuidAmi: checkBox.value, w: w, j: j, h: h })
                            } else {
                                await common.socketAsync('removeMeFromMyFriendRequest', { uuidAmi: checkBox.value, w: w, j: j, h: h })
                            }
                        }
                        await common.socketAsync('delMyDemande', { w: w, j: j, h: h })
                        common.popUp_Stop()
                        common.loadpage("/midi")
                    }, { once: true })
                }
            })
        }
    function updateFriendSandwichSelector() {
    const container = document.getElementById("amisSandwichSelection");
    container.innerHTML = "<p>Sandwich pour vos amis sélectionnés<p>";
    listAmis.forEach(ami => {
        if (ami.pris == 1) {
            const div = document.createElement("div");
            div.classList.add("friend-sandwich");

            // Affiche le nom de l'ami
            const span = document.createElement("span");
            span.innerHTML = "<b>" + common.name(ami.first_name, ami.last_name) +"</b>" + ": ";
            div.appendChild(span);

            // Crée un checkbox, la valeur est toujours 1
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.setAttribute("data-uuid", ami.uuid);
            checkbox.value = "1";  
            div.appendChild(checkbox);

            container.appendChild(div);
        }
    });
}
        

const setMyDemande = async function () {
            let str = "";
            listAmis.forEach(child => {
                if (child.pris == 1) str += child.uuid + "/";
            });
            common.writeCookie("derniere demande", str);

            // Récupération du choix de sandwich pour l'utilisateur (votre code existant)
            const checkboxes = document.querySelectorAll('input[name="sandwich"]:checked');
            let choiceOfSandwich = 0;
            for (const checkbox of checkboxes) {
                // Par exemple, si vous additionnez la valeur, utilisez "+=" ou une opération souhaitée
                choiceOfSandwich += parseInt(checkbox.value);
            }
            
            // Récupération de la sélection de sandwich pour les amis (checkboxes ajoutés dans updateFriendSandwichSelector)
            let friendSandwichSum = 0;
            const friendCheckboxes = document.querySelectorAll("#amisSandwichSelection input[type='checkbox']");
            friendCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    friendSandwichSum += parseInt(checkbox.value); // chaque case vaut 1
                }
            });
            
            // Ajoute le total des choix amis dans choiceOfSandwich
            choiceOfSandwich += friendSandwichSum; 

            common.popUp_Active('Procuration:', 'attente', async (bnt) => {
                bnt.innerHTML = 'Confirmer';
                let from = document.createElement('from');
                document.getElementById('popup-body').innerHTML = '';

                let textIntro = document.createElement('p');
                textIntro.innerHTML = "Déposer une demande pour:";
                document.getElementById('popup-body').appendChild(textIntro);

                document.getElementById('popup-body').appendChild(from);
                let passProcuration = true;
                listAmis.forEach(ami => {
                    if (ami.procuration == 1 && ami.DorI != 1 && ami.pris == 1) {
                        passProcuration = false;
                        let box = document.createElement('input');
                        box.setAttribute("type", "checkbox");
                        box.setAttribute("name", "procuration");
                        box.setAttribute("value", ami.uuid);
                        if (ami.DorI == null) {
                            box.setAttribute("checked", true);
                        }
                        from.appendChild(box);

                        let label = document.createElement('label');
                        label.setAttribute("for", "procuration");
                        label.innerHTML = common.name(ami.first_name, ami.last_name);
                        from.appendChild(label);
                        from.innerHTML += '<br>';
                    }
                });
                let listAmisPris = [];
                listAmis.forEach(ami => {
                    if (ami.pris == 1) listAmisPris.push(ami.uuid);
                });
                if (passProcuration) {
                    await common.socketAsync('setMyDemande', {
                        w: w,
                        j: j,
                        h: h,
                        amis: listAmisPris,
                        sandwich: choiceOfSandwich
                    });
                    common.popUp_Stop();
                    common.loadpage("/midi");
                } else {
                    bnt.addEventListener('click', async () => {
                        const checkBoxs = document.querySelectorAll('input[name="procuration"]');
                        for (const checkBox of checkBoxs) {
                            if (checkBox.checked) {
                                let listAmisDeLAmi = listAmisPris.concat([]);
                                listAmisDeLAmi.splice(listAmisDeLAmi.indexOf(checkBox.value), 1);
                                listAmisDeLAmi.push(common.uuid);
                                await common.socketAsync('setAmiDemande', {
                                    uuidAmi: checkBox.value,
                                    w: w,
                                    j: j,
                                    h: h,
                                    amis: listAmisDeLAmi
                                });
                            }
                        }
                        await common.socketAsync('setMyDemande', {
                            w: w,
                            j: j,
                            h: h,
                            amis: listAmisPris,
                            sandwich: choiceOfSandwich
                        });
                        common.popUp_Stop();
                        common.loadpage("/midi");
                    }, { once: true });
                }
            });
        }

        const quitDemande = async function () {
            common.loadpage("/midi")
        }


        document.getElementById("toutAjouter").addEventListener("click", function () {
            Ami.allPris(listAmis)
            update()
        })


        document.getElementById("toutRetirer").addEventListener("click", function () {
            Ami.allNonPris(listAmis)
            update()
        })

        let info = await common.socketAsync('getDataThisCreneau', { w: w, j: j, h: h })
        let listDemandes = await common.socketAsync('listDemandes', { w: w, j: j, h: h })
        let my_demande = await common.socketAsync("getMyDemande", { w: w, j: j, h: h })

        let divListeAmis = document.getElementById("listeAmis")
        let divAmisAjoute = document.getElementById("listeMange")

        /*
        listUsers => liste Nom/Prénom/uuid de tout les utilisateur
        listAmisUUID => UUID de tout amis
        listAmis => liste Nom/Prénom/uuid/procuration de tout les amis
        */
        let listUsers = await common.socketAsync('getListUserName', null)
        let listAmisBrut = await common.socketAsync('getAmis', null)

        //créer la liste d'amis global
        let listAmis = []

        listAmisBrut.forEach(child => {
            listAmis.push(new Ami(child.uuid, "", "", child.HeGiveMeProc, 0, 1, null))
        })

        //active la divSandwich
        if (info.mode_sandwich > 0) {
            document.getElementById("sandwich").classList.remove("cache")
        }

        //en fonction de l'étét de la demande on fait des truc
        if (info.ouvert == 2 && Object.keys(await common.socketAsync('getMyDemande', { w: w, j: j, h: Math.abs(h - 1) })).length === 0) {
            if (Object.keys(my_demande).length === 0) {
                //pas encore de demande
                document.getElementById("DIVdepot").classList.remove("cache")
                const AllAmis = common.readBoolCookie("allAmis")
                if (AllAmis) {
                    Ami.allPris(listAmis)
                } else {
                    try {
                        let listAmisPris = common.readCookie("derniere demande").split("/")
                        listAmisPris.pop()

                        Ami.listPrisNonAmi(listAmis, listAmisPris)
                    } catch (Exception) { }
                }
            } else if (my_demande.DorI == 1) {
                //inscrit
                document.getElementById("sandwich").classList.add("cache")
                document.getElementById("DIVinscrit").classList.remove("cache")

                Ami.listPrisNonAmi(listAmis, my_demande.amis)
            } else {
                //modif
                document.getElementById("DIVmodif").classList.remove("cache")

                Ami.listPrisNonAmi(listAmis, my_demande.amis)
                if (my_demande.sandwich != null) {
                    const sandwichOptions = document.querySelectorAll('input[name="sandwich"]');
                    sandwichOptions.forEach(option => {
                        const optVal = parseInt(option.value);
                        // Si le bit correspondant à optVal est présent dans my_demande.sandwich, cocher la case
                        if ((my_demande.sandwich & optVal) === optVal) {
                            option.checked = true;
                        }
                    });
                }
            }
        } else {
            //n'a pas le droit de posser de demande sur le créneau
            quitDemande()
        }

        //on récupère les nom
        listUsers.forEach(user => {
            listAmis.forEach(ami => {
                if (ami.uuid == user.uuid) {

                    ami.first_name = user.first_name
                    ami.last_name = user.last_name
                }
            })
        })

        //on récupère les scores des amis
        let scoreAmis = await common.socketAsync("getScoreAmi", listAmis.map(e => { return e.uuid }))
        scoreAmis.forEach(score => {
            listAmis.forEach(ami => {
                if (score.uuid == ami.uuid) {
                    ami.score = score.score
                }
            })
        })

        common.nameOrder(listAmis)

        //info
        let textScore = ""
        let score = await common.socketAsync("score", null)
        if (score < 2) {
            textScore = score + " pt"
        } else {
            textScore = score + " pts"
        }
        let places = info.places

        let inscrits = 0
        let demandes = 0

        listDemandes.forEach(function (child) {
            let ami = Ami.searchAmiUUID(listAmis, child.uuid)

            if (child.DorI == true) {
                inscrits++
                if (ami != null) {
                    ami.DorI = 1
                }
            } else {
                demandes++
                if (ami != null) {
                    ami.DorI = 0
                }
            }
        });

        let reste = places - inscrits

        document.getElementById("info").innerHTML = "Demande enregistrée<br>pour le " + day[j] + " à " + (h + 11) + "h<br>"
            + reste + " places restantes<br>("
            + inscrits + " acceptées pour " + places + " places)<br>" + demandes
            + " demandes en cours<br>Votre score: " + textScore



        document.getElementById("envoyer").addEventListener("click", setMyDemande);
        document.getElementById("annuler").addEventListener("click", quitDemande);

        document.getElementById("retirer").addEventListener("click", suppMyDemande);
        document.getElementById("modif").addEventListener("click", setMyDemande);
        document.getElementById("PASmodif").addEventListener("click", quitDemande);

        document.getElementById("pass").addEventListener("click", async () => {
            common.loadpage("/pass")
        });

        function update() {
            // Mise à jour de la liste d'amis (boutons, etc.)
            divListeAmis.innerHTML = "";
            divAmisAjoute.innerHTML = "";
            listAmis.forEach(child => {
                child.bouton(update);
            });
            // Actualisation des options sandwich pour les amis sélectionnés
            updateFriendSandwichSelector();

            // (Votre code existant pour avertir si un ami n'a pas fait de demande...)
            let pb = 0;
            listAmis.forEach(child => {
                if (child.DorI == null && child.pris == 1) {
                    pb++;
                }
            });
            let p = document.getElementById("attentionAmis");
            if (pb == 0) {
                p.innerHTML = "";
            } else if (pb == 1) {
                p.innerHTML = "Attention, un ami n'a pas encore fait de demande";
            } else {
                p.innerHTML = "Attention, " + pb + " amis n'ont pas encore fait de demande";
            }
        }

        update()
    } catch (error) {
        console.error(error)
        common.delCookie("derniere demande")
    }
}


