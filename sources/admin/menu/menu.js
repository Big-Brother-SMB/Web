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

        if(info_menu.self!="undefined" && info_menu.self!=undefined){
            document.getElementById("menu self").setAttribute("src",info_menu.self)
            document.getElementById("menu self").addEventListener("error", remplace_img);
        }else{
            remplace_img()
        }

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


    document.getElementById("menu self").addEventListener("click",async function(){
        let info_menu = await common.socketAsync("getMenuThisWeek",week)
        let p = info_menu.self
        p=window.prompt("Menu du self de la semaine "+week+":",p);
        if (p==null){
            p=info_menu.self
        }
        await common.socketAdminAsync("setMenu",{semaine:week,menu:info_menu.menu,self:p})

        if(p!="undefined" && p!=undefined){
            document.getElementById("menu self").setAttribute("src",p)
            document.getElementById("menu self").addEventListener("error", remplace_img);
        }else{
            remplace_img()
        }
    })
}


function remplace_img(){
    if(this!=undefined) this.removeEventListener("error",remplace_img);
    document.getElementById("menu self").setAttribute("src", "https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png");
}