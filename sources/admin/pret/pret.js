export async function init(common) {
    if (common.admin_permission["foyer_perm"] !== 2) common.loadpage("/options")

    let objetsDict = {};

    async function chargerObjetsBDD() {
        let liste = await common.socketAdminAsync("getObjetsCatalog", null) || [];
        objetsDict = {};
        liste.forEach(item => {
            objetsDict[item.code] = item.nom;
        });
    }

    await chargerObjetsBDD();

    let inputCodeBar = document.getElementById("code_bar")
    let inputCodeObjet = document.getElementById("code_objet")
    let inputName = document.getElementById("name")
    let inputNameId = null

    // Scanner Laser (clavier)
    let interval;
    let barcodeLaser = '';
    const keydown = function(evt) {
        if (window.location.pathname == "/admin/pret") {
            if (interval) clearInterval(interval);

            if (evt.code == 'Enter') {
                if (barcodeLaser.length == 5) {
                    let isUser = users_code.has(barcodeLaser);

                    if (isUser) {
                        searchUser(barcodeLaser);
                    } else {
                        inputCodeObjet.value = barcodeLaser;
                        traiterScanObjet(barcodeLaser);
                    }
                }
                barcodeLaser = '';
                return;
            }
            if (evt.key != 'Shift') {
                barcodeLaser += evt.key;
            }
            interval = setInterval(() => barcodeLaser = '', 200);
        } else {
            document.removeEventListener('keydown', keydown);
        }
    }
    document.addEventListener('keydown', keydown);

    setTimeout(() => { inputCodeBar.focus() }, 500);

    let utilisateurs = []
    let utilisateursNames = []
    let users_code = new Map();

    let listUsers = common.nameOrder(await common.socketAdminAsync('getListUser', null))

    listUsers.forEach(function(child) {
        utilisateurs.push(child.uuid)
        users_code.set(child.code_barre, child.uuid)
        utilisateursNames.push(common.name(child.first_name, child.last_name))
    })

    common.autocomplete(inputName, utilisateursNames, function(val) {
        val = utilisateurs[utilisateursNames.indexOf(val)]
        inputNameId = val
        listUsers.forEach(function(child) {
            if (child.uuid == val) {
                inputCodeBar.value = child.code_barre
            }
        })
    }, true);

    function searchUser(c) {
        inputCodeBar.value = c
        let name = users_code.get(c)
        if (name) {
            inputName.value = utilisateursNames[utilisateurs.indexOf(name)]
            inputNameId = name
            inputCodeObjet.focus()
        }
    }

    inputCodeBar.addEventListener("input", function() {
        if (String(inputCodeBar.value).length == 5) {
            searchUser(inputCodeBar.value)
        }
    })

    inputCodeObjet.addEventListener("input", function() {
        if (String(inputCodeObjet.value).length == 5) {
            traiterScanObjet(inputCodeObjet.value)
        }
    })

    let listAct = ["Arcade", "Baby Foot 1", "Baby Foot 2", "Billard", "Piano", "Guitare", "Batterie"]

    async function debutPret(nomObjet) {
        if (inputNameId != null) {
            await common.socketAdminAsync("addPret", { obj: nomObjet, debut: new Date(), uuid: inputNameId })
            let label = document.getElementById(nomObjet + "-Name")
            if (label) label.innerHTML = inputName.value

            let img = document.getElementById(nomObjet)
            if (img) img.classList.add("grayscale")

            reinitialiserChamps()
            await actualiserPret()
        } else {
            alert("Veuillez d'abord sélectionner ou scanner un emprunteur.")
        }
    }

    async function finPret(nomObjet) {
        await actualiserPret()
        let pretEnCours = listPret.find(child => child.objet == nomObjet)
        if (pretEnCours) {
            await common.socketAdminAsync("finPret", { obj: nomObjet, debut: pretEnCours.debut, uuid: pretEnCours.uuid, fin: new Date() })

            let img = document.getElementById(nomObjet)
            if (img) img.classList.remove("grayscale")

            let label = document.getElementById(nomObjet + "-Name")
            if (label) label.innerHTML = "Libre"

            reinitialiserChamps()
            await actualiserPret()
        }
    }

    async function traiterScanObjet(codeObjet) {
        let nomObjet = objetsDict[codeObjet] || codeObjet;

        await actualiserPret();
        let estEmprunte = listPret.some(child => child.objet == nomObjet);

        if (estEmprunte) {
            await finPret(nomObjet);
        } else {
            if (inputNameId != null) {
                await debutPret(nomObjet);
            } else {
                alert("Veuillez d'abord sélectionner ou scanner un emprunteur.");
                inputCodeObjet.value = "";
            }
        }
    }

    function reinitialiserChamps() {
        inputName.value = ""
        inputCodeBar.value = ""
        inputCodeObjet.value = ""
        inputNameId = null
        inputCodeBar.focus()
    }

    let listPret = [];
    async function actualiserPret() {
        listPret = await common.socketAdminAsync("getPretsActuel", null) || []

        for (const elem of listAct) {
            let img = document.getElementById(elem)
            if (img) img.classList.remove("grayscale")
            let label = document.getElementById(elem + "-Name")
            if (label) label.innerHTML = "Libre"
        }

        listPret.forEach((e) => {
            let label = document.getElementById(e.objet + "-Name")
            let img = document.getElementById(e.objet)
            let indexUser = utilisateurs.indexOf(e.uuid)

            if (label && indexUser !== -1 && listAct.includes(e.objet)) {
                label.innerHTML = utilisateursNames[indexUser]
            }
            if (img) {
                img.classList.add("grayscale")
            }
        })
    }

    actualiserPret()

    function getObjetsTriesParPrefixe(prefixe) {
        return Object.entries(objetsDict)
            .filter(([code]) => code.startsWith(prefixe))
            .map(([code, nom]) => ({ code, nom }))
            .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
    }

    // POP-UP DÉTAILS
    function ouvrirModalDetails(prefixe, titreCategorie) {
        common.popUp_Active("Détails - " + titreCategorie, 'attente', async (bnt) => {
            bnt.style.display = 'none';

            let popupBody = document.getElementById('popup-body')
            popupBody.innerHTML = ''

            let table = document.createElement('table')
            table.className = 'modal-table'
            table.innerHTML = `
                <thead>
                    <tr>
                        <th class="col-code-details">Code</th>
                        <th class="col-nom-details">Nom de l'objet</th>
                        <th class="col-statut-details">Statut</th>
                    </tr>
                </thead>
                <tbody id="popup-tbody-details"></tbody>
            `
            popupBody.appendChild(table)

            let tbody = table.querySelector('#popup-tbody-details')
            await actualiserPret()

            let objetsTries = getObjetsTriesParPrefixe(prefixe);

            objetsTries.forEach(({ code, nom }) => {
                let tr = document.createElement('tr')
                let pretActif = listPret.find(p => p.objet === nom || p.objet === code)
                let emprunteurNom = pretActif ? utilisateursNames[utilisateurs.indexOf(pretActif.uuid)] : "<span class='status-free'>Libre</span>"

                tr.innerHTML = `
                    <td class="col-code-details">${code}</td>
                    <td class="col-nom-details"><strong>${nom}</strong></td>
                    <td class="col-statut-details">${emprunteurNom}</td>
                `
                tbody.appendChild(tr)
            });
        })
    }

    // POP-UP ACTION
    function ouvrirModalAction(prefixe, titreCategorie) {
        common.popUp_Active("Emprunt manuel - " + titreCategorie, 'attente', async (bnt) => {
            bnt.style.display = 'none';

            let popupBody = document.getElementById('popup-body')
            popupBody.innerHTML = ''

            let table = document.createElement('table')
            table.className = 'modal-table'
            table.innerHTML = `
                <thead>
                    <tr>
                        <th class="col-code-action">Code</th>
                        <th class="col-nom-action">Nom</th>
                        <th class="col-statut-action">Statut</th>
                        <th class="col-btn-action">Action</th>
                    </tr>
                </thead>
                <tbody id="popup-tbody-action"></tbody>
            `
            popupBody.appendChild(table)

            let tbody = table.querySelector('#popup-tbody-action')
            await actualiserPret()

            let objetsTries = getObjetsTriesParPrefixe(prefixe);

            objetsTries.forEach(({ code, nom }) => {
                let tr = document.createElement('tr')
                let pretActif = listPret.find(p => p.objet === nom || p.objet === code)
                let emprunteurNom = pretActif ? utilisateursNames[utilisateurs.indexOf(pretActif.uuid)] : "Libre"

                tr.innerHTML = `
                    <td class="col-code-action">${code}</td>
                    <td class="col-nom-action"><strong>${nom}</strong></td>
                    <td class="col-statut-action">${emprunteurNom}</td>
                    <td class="col-btn-action"></td>
                `
                let tdBtn = tr.children[3]
                let actionBtn = document.createElement('button')
                actionBtn.className = 'btn btn-modal-action'

                if (pretActif) {
                    actionBtn.innerText = "Rendre"
                    actionBtn.classList.add('btn-return')
                    actionBtn.addEventListener('click', async () => {
                        await finPret(pretActif.objet)
                        common.popUp_Stop()
                        ouvrirModalAction(prefixe, titreCategorie)
                    })
                } else {
                    actionBtn.innerText = "Emprunter"
                    actionBtn.classList.add('btn-borrow')
                    actionBtn.addEventListener('click', async () => {
                        if (!inputNameId) {
                            alert("Veuillez d'abord sélectionner un utilisateur dans le champ principal.")
                            return
                        }
                        await debutPret(nom)
                        common.popUp_Stop()
                        ouvrirModalAction(prefixe, titreCategorie)
                    })
                }

                tdBtn.appendChild(actionBtn)
                tbody.appendChild(tr)
            });
        })
    }

    // Clics Détails
    document.getElementById("Jeux de société-Name").addEventListener("click", () => ouvrirModalDetails("00", "Jeux de Société"))
    document.getElementById("td-header-jeux").addEventListener("click", () => ouvrirModalDetails("00", "Jeux de Société"))
    document.getElementById("Manuels-Name").addEventListener("click", () => ouvrirModalDetails("01", "Manuels"))
    document.getElementById("td-header-manuels").addEventListener("click", () => ouvrirModalDetails("01", "Manuels"))

    // Clics Équipements
    for (const elem of listAct) {
        let el = document.getElementById(elem)
        if (el) {
            el.addEventListener("click", async function() {
                await actualiserPret()
                if (el.classList.contains("grayscale")) {
                    await finPret(elem)
                } else {
                    await debutPret(elem)
                }
            })
        }
    }

    document.getElementById("Jeux de société").addEventListener("click", () => ouvrirModalAction("00", "Jeux de Société"))
    document.getElementById("Manuels").addEventListener("click", () => ouvrirModalAction("01", "Manuels"))

    // Redirections
    let btnHistorique = document.getElementById("historique")
    if (btnHistorique) {
        btnHistorique.addEventListener("click", () => {
            common.loadpage("/admin/pret/historique")
        })
    }

    let btnGestion = document.getElementById("btn_gestion_objets")
    if (btnGestion) {
        btnGestion.addEventListener("click", () => {
            common.loadpage("/admin/pret/catalogue")
        })
    }
}