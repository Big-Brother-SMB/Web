import * as common from "../common.js";

let divScore = document.getElementById("divScore")
let score = document.getElementById("score")

var histogramValues = []
var histogramNames = []
var histogramGain = []
let i=0


let data = await common.socketAsync('my_score',null)
let total = 0
for(let child in data) {    let event = document.createElement("button")
    event.classList.add("event")


    let name = data[child].name
    let eventScore = data[child].value


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
                },
                {
                    borderColor: "rgba(70,155,100,1)",
                    lineTension: 0,
                    fill: false,
                    label: 'Gain',
                    data: histogramGain,
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
