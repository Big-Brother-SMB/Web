import * as common from "../common.js";

let divScore = document.getElementById("divScore")
let score = document.getElementById("score")

var histogramValues = []
var histogramNames = []
var histogramGain = []
let i=0


let data = await common.socketAsync('my_score',null)
let total = 0
for(let child in data) {
    let event = document.createElement("button")
    event.classList.add("event")


    let name
    let eventScore
    if(data[child].cout!=undefined){
        name = "Repas du semaine "+data[child].semaine+" creneau n°"+data[child].creneau
        eventScore = data[child].cout
    }else{
        name = data[child].name
        eventScore = data[child].value
    }


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
}
