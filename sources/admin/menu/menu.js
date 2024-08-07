export async function init(common){
    if(common.admin_permission["foyer_repas"]==0) common.loadpage("/options")
    
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


    async function refreshDatabase() {
        let text = "Semaine n°" + week + " du " + common.intervalSemaine(week)
        if (week == common.actualWeek) {
            text = "Cette semaine (n°" + week + " du " + common.intervalSemaine(week) + ")"
        }
        document.getElementById("semaine").innerHTML = text

        let info_menu = await common.socketAsync("getMenuThisWeek",week)
        console.log(info_menu)
        let val = info_menu.menu
        if (val == null) {
            val = "inconnu pour le moment"
        }
        document.getElementById("menuSemaine").innerHTML = val

        document.getElementById("menu_self").addEventListener("error", remplace_img);
        document.getElementById("menu_self").setAttribute("src","/Images_menu/page-" + week + ".jpg")

        let listNote = []
        for(let i=0;i<5;i++){
            let list = [0,0,0,0]
            let note_brut = await common.socketAdminAsync('getAllResultsMenu',{w:week,j:i})
            note_brut.forEach((child)=> {
                let note = child.note
                if(note>=0 && note<=3){
                    list[note]++
                }
            })
            listNote.push(list)
        }
        console.log(listNote)
        document.getElementById('graphique').parentElement.innerHTML='<canvas id="graphique"></canvas>'
        const cvs = document.getElementById('graphique');
        new Chart(cvs, {
            type: 'bar',
            data: {
                labels: ["Foyer","Lundi","Mardi","Jeudi","Vendredi"],
                datasets: [{
                    label: '😰',
                    data: listNote.map(row => (row[0])),
                    borderWidth: 1,
                    fill: false,
                    backgroundColor: '#bb0b0b'
                },{
                    label: '🙁',
                    data: listNote.map(row => (row[1])),
                    borderWidth: 1,
                    fill: false,
                    backgroundColor: '#ca898d'
                },{
                    label: '😃',
                    data: listNote.map(row => (row[2])),
                    borderWidth: 1,
                    fill: false,
                    backgroundColor: '#93d900'
                },{
                    label: '😋',
                    data: listNote.map(row => (row[3])),
                    borderWidth: 1,
                    fill: false,
                    backgroundColor: '#00C909'
                }]
            },
            options: {
                scales: {
                    y: {
                    beginAtZero: true
                    }
                }
            }
        });
    }



    refreshDatabase();
    if(common.admin_permission["foyer_repas"]==2){
        document.getElementById("menuSemaine").addEventListener("click",async function(){
            let info_menu = await common.socketAsync("getMenuThisWeek",week)
            let p= info_menu.menu
            if (p==null || p=="" || p=="null"){
                p = "inconnu pour le moment"
            }
            p=window.prompt("Menu de la semaine "+week+":",p);
            if (p==null){
                p=info_menu.menu
            }
            if (p=="" || p=="null"){
                p = "inconnu pour le moment"
            }
            await common.socketAdminAsync("setMenu",{semaine:week,menu:p,self:info_menu.self})
            document.getElementById("menuSemaine").innerHTML = p
        })
    }
}


function remplace_img(){
    if(this!=undefined) this.removeEventListener("error",remplace_img);
    document.getElementById("menu_self").setAttribute("src", "/assets/not_found.png");
}