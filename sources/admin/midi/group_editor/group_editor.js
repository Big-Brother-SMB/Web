export async function init(common){

    let select_group = document.getElementById("groups");
    let g_c = await common.socketAdminAsync('getGroupAndClasse', null)
    let groups_list = g_c[0]


    async function RefreshListGroupSlots() {
        let div_creneaux_groups = document.getElementById('creneaux_groups')
        let groups_slots = await common.socketAdminAsync('getGroupsSlots', null)
        let current_groups_slots = groups_slots.filter(slot => slot.date_fin == null);
        div_creneaux_groups.innerHTML = "";

        const jours = ["Lundi", "Mardi", "Jeudi", "Vendredi"];
        const heures = ["11h", "12h"];

        current_groups_slots.forEach((group_slot, index) => {
            let creneau = group_slot["creneau"];
            let jour = Math.floor(creneau / 2);
            let heure = creneau % 2;

            let btn = document.createElement('div');
            btn.className = "ami group-slot-row";
            btn.setAttribute('data-creneau', creneau);
            btn.setAttribute('data-nom', group_slot["group2"]);
            btn.setAttribute('date_debut', group_slot["date_debut"].toString());

            btn.innerHTML = `
            <span class="group-name">${group_slot["group2"]}</span>
            <span class="group-jour">${jours[jour]}</span>
            <span class="group-heure">${heures[heure]}</span>
        `;

            btn.addEventListener("click", async function () {
                let nom = btn.getAttribute('data-nom');
                let creneau_value = parseInt(btn.getAttribute('data-creneau'));
                let date_debut = btn.getAttribute('date_debut');


                // Trouve l'index de l'élément correspondant
                let indexToUpdate = groups_slots.findIndex(function (slot) {
                    return slot["group2"] === nom && slot["creneau"] === creneau_value && slot["date_debut"].toString() === date_debut;
                });

                // Supprime l'élément si trouvé
                if (indexToUpdate !== -1) {
                    groups_slots[indexToUpdate]["date_fin"] = new Date().getTime();
                    await common.socketAdminAsync('setGroupsSlots', groups_slots);
                    await RefreshListGroupSlots();
                } else {
                    console.log("ERREUR: Élément non trouvé!");
                }
            });

            div_creneaux_groups.appendChild(btn);
        })
    }
    await RefreshListGroupSlots()

    // Validate Assign
    groups_list.forEach(group => {
        let opt = document.createElement("option");
        opt.innerHTML = group["group2"]
        select_group.appendChild(opt);
    })

    document.getElementById("validerAssignation").addEventListener("click", async () => {
        let groupe = document.getElementById("groups").value;
        let jour = document.getElementById("jour").value;
        let heure = document.getElementById("heure").value;

        if (!groupe || !jour || !heure) {
            alert("Veuillez sélectionner un groupe, un jour et une heure.");
            return;
        }
        jour = parseInt(jour);
        heure = parseInt(heure);
        const new_slot = {group2: groupe, creneau: jour * 2 + heure, date_debut: new Date().getTime(), date_fin: null};

        let groups_slots = await common.socketAdminAsync('getGroupsSlots', null)
        groups_slots.push(new_slot);
        await common.socketAdminAsync('setGroupsSlots', groups_slots)
        await RefreshListGroupSlots()
    });
}