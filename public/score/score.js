setColorMode("..")

let divScore = document.getElementById("divScore")
let score = document.getElementById("score")

var histogramValues = []
var histogramNames = []
var histogramGain = []
let i=0
database.ref("users/" + user + "/score").once('value').then(function(snapshot) {
    let total = 0
    snapshot.forEach(function(child) {
        let event = document.createElement("button")
        event.classList.add("event")


        let name = snapshot.child(child.key + "/name").val()
        let eventScore = parseFloat(snapshot.child(child.key + "/value").val())


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
                    datasets: [
                    {
                        borderColor: "rgba(70,155,100,1)",
                        lineTension: 0,
                        fill: false,
                        label: 'Gain',
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
    document.getElementById("article").style.display = "block"
    document.getElementById("chargement").style.display = "none"
});
