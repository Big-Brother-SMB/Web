const dayLowerCase = ["lundi", "mardi","jeudi","vendredi"];

export async function init(common){
    document.getElementById("btn_retour").classList.remove("cache")
    document.getElementById("btn_retour").setAttribute("url","/accueil")


    let scoreList = await common.socketAdminAsync('getScoreList',common.uuid)
    let scoreObjs = []
    let score = 0

    scoreList.midi.forEach((child)=> {
        let obj={}
        obj.creneau = child.creneau
        obj.semaine = child.semaine
        obj.name = "Repas du " + dayLowerCase[Math.floor(child.creneau / 2)] + " " + common.getDayText(Math.floor(child.creneau / 2),child.semaine) +  " à " + (11 + (child.creneau % 2)) + "h"
        if(child.penalite) obj.name += " (Pénalité)"
        obj.value = -child.cout
        let jourForDate = Math.floor(child.creneau / 2)
        jourForDate++
        if(jourForDate>2)jourForDate++
        obj.date = common.generedDate(child.semaine,jourForDate,(11 + (child.creneau % 2))).getTime()
        obj.type = 0
        scoreObjs.push(obj)
    })
    
    scoreList.perso.forEach((child)=> {
        let obj={}
        obj.name = child.name
        obj.value = child.value
        obj.date = new Date(child.date).getTime()
        obj.type = 1
        scoreObjs.push(obj)
    })
    scoreList.global.forEach((child)=> {
        let obj={}
        obj.name = child.name
        obj.value = child.value
        obj.date = new Date(child.date).getTime()
        obj.type = 2
        scoreObjs.push(obj)
    })

    scoreObjs.sort(function compareFn(a, b) {
        if(a.date>b.date){
            return 1
        }else if(a.date<b.date){
            return -1
        }else{
            return 0
        }
    })
    
    let baseDate = scoreObjs[0].date
    scoreObjs.forEach(function(obj) {
        score += obj.value
        obj.total = score
        obj.date = (obj.date - baseDate)/10000000
    })

    document.getElementById("score").innerHTML = "Score : " + score
    console.log(scoreObjs)
    
    const cvs = document.getElementById('myLine');
    new Chart(cvs, {
        type: 'line',
        data: {
            labels: scoreObjs.map(row => (row.name)),
            datasets: [{
                label: 'Score',
                data: scoreObjs.map(row => {
                    return {
                        x: row.date,
                        y: row.total
                    }
                    }),
                borderWidth: 1,
                fill: false,
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(255, 0, 0)',
                tension: 0
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

