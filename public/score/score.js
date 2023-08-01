import * as common from "../common.js";

let divScore = document.getElementById("divScore")
let score = document.getElementById("score")

var histogramValues = []
var histogramNames = []
var histogramGain = []
let i=0

let list = []
let data = await common.socketAsync('my_score',null)
console.log(data)
data.midi.forEach((child)=> {
    let event = document.createElement("button")
    event.classList.add("event")

    let obj={}
    obj.name = "Repas du " + common.dayLowerCase[Math.floor(child.creneau / 2)] + " " + common.getDayText(Math.floor(child.creneau / 2),child.semaine) +  " à " + (11 + (child.creneau % 2)) + "h"
    obj.value = -child.cout
    obj.date = common.getDayHash(Math.floor(child.creneau / 2),child.semaine,(11 + (child.creneau % 2)))
    list.push(obj)
})

data.perso.forEach((child)=> {
    let event = document.createElement("button")
    event.classList.add("event")

    let obj={}
    obj.name = child.name
    obj.value = child.value
    obj.date = child.date
    list.push(obj)
})
data.global.forEach((child)=> {
    let event = document.createElement("button")
    event.classList.add("event")

    let obj={}
    obj.name = child.name
    obj.value = child.value
    obj.date = child.date
    list.push(obj)
})

list.sort(function compareFn(a, b) {
    if(a.date>b.date){
        return 1
    }else if(a.date<b.date){
        return -1
    }else{
        return 0
    }
})

console.log(list)

list.forEach((child)=> {
    histogramGain[i] = child.value
    if (histogramValues.length==0){
        histogramValues[i] = child.value
    }else{
        histogramValues[i]=Math.round((histogramValues[i-1]+child.value)*100)/100
    }
    histogramNames[i]=child.name
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
})