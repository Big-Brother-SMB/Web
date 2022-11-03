import * as common from "../common.js";

let divScore = document.getElementById("divScore")
let score = document.getElementById("score")

var histogramValues = []
var histogramNames = []
var histogramGain = []
let i=0


let data = await common.socketAsync('my_score',null)
let total = 0
data.forEach((child)=> {
    let event = document.createElement("button")
    event.classList.add("event")


    let name
    let eventScore
    let date
    if(child.cout!=undefined){
        name = "Repas du " + common.dayLowerCase[Math.floor(child.creneau / 2)] + " " + common.getDayText(Math.floor(child.creneau / 2),child.semaine) +  " à " + (11 + (child.creneau % 2)) + "h"
        eventScore = child.cout
        date = common.getDayHash(Math.floor(child.creneau / 2),child.semaine,(11 + (child.creneau % 2)))
    }else{
        name = child.name
        eventScore = child.value
        date = child.date
    }
    console.log(date)


    histogramGain[i] = eventScore
    if (histogramValues.length==0){
        histogramValues[i]=eventScore
        }
    else{
        histogramValues[i]=Math.round((histogramValues[i-1]+eventScore)*100)/100
    }
    histogramNames[i]=name
    i++
      const ctx = document.getElementById('myChart')
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: histogramNames,
                datasets: [{
                    borderColor: "rgba(100,155,155,1)",
                    label: 'Total',
                    data: histogramValues,
                    borderWidth: 3
                }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    total += eventScore
    total = Math.round(total*100)/100
})
