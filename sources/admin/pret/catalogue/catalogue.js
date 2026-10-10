export async function init(common) {
    if (common.admin_permission["foyer_perm"] !== 2) common.loadpage("/options")

    document.getElementById("btn_retour").classList.remove("cache")
    document.getElementById("btn_retour").setAttribute("url", "/admin/pret")

    let tbody = document.getElementById("tbody_catalogue")
    let selectCat = document.getElementById("select_cat")
    let inputNom = document.getElementById("add_nom")
    let btnAjouter = document.getElementById("btn_ajouter")

    let listeCatalog = []

    async function actualiserTableau() {
        listeCatalog = await common.socketAdminAsync("getObjetsCatalog", null) || []

        // Tri alphabétique des noms
        listeCatalog.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }))

        tbody.innerHTML = ''

        listeCatalog.forEach(item => {
            let tr = document.createElement("tr")

            tr.innerHTML = `
                <td><strong>${item.code}</strong></td>
                <td>${item.nom}</td>
                <td class="actions-cell">
                    <button class="btn btn-edit">Renommer</button>
                    <button class="btn btn-del">Supprimer</button>
                </td>
            `

            // Bouton Renommer
            tr.querySelector(".btn-edit").addEventListener("click", async () => {
                let nouveauNom = prompt(`Renommer l'objet (${item.code}) :`, item.nom)
                if (nouveauNom !== null && nouveauNom.trim() !== "") {
                    await common.socketAdminAsync("saveObjetCatalog", { code: item.code, nom: nouveauNom.trim() })
                    actualiserTableau()
                }
            })

            // Bouton Supprimer
            tr.querySelector(".btn-del").addEventListener("click", async () => {
                if (confirm(`Voulez-vous vraiment supprimer "${item.nom}" (${item.code}) ?`)) {
                    await common.socketAdminAsync("removeObjetCatalog", { code: item.code })
                    actualiserTableau()
                }
            })

            tbody.appendChild(tr)
        })
    }

    function genererProchainCode(prefixe) {
        let codesExistants = listeCatalog
            .map(item => item.code)
            .filter(code => code.startsWith(prefixe))

        let maxId = 0
        codesExistants.forEach(code => {
            let idNum = parseInt(code.substring(2), 10)
            if (!isNaN(idNum) && idNum > maxId) {
                maxId = idNum
            }
        })

        let prochainId = maxId + 1
        let suffixe = String(prochainId).padStart(3, '0')
        return prefixe + suffixe
    }

    btnAjouter.addEventListener("click", async () => {
        let nom = inputNom.value.trim()
        let prefixe = selectCat.value

        if (nom === "") {
            alert("Veuillez saisir un nom d'objet.")
            return
        }

        let codeAuto = genererProchainCode(prefixe)

        await common.socketAdminAsync("saveObjetCatalog", { code: codeAuto, nom: nom })
        inputNom.value = ""
        actualiserTableau()
    })

    actualiserTableau()
}