let divScore = document.getElementById("divScore")
let score = document.getElementById("score")

var histogramValues = []
var histogramNames = []
let i=0
database.ref("users/" + user + "/score").once('value').then(function(snapshot) {
    let total = 0
    snapshot.forEach(function(child) {
        let event = document.createElement("button")
        event.classList.add("event")
        
       /* divScore.appendChild(event);*/
        
        database.ref("users/" + user + "/score/" + child.key + "/name").once('value').then(function(snapshot) {
            let name = snapshot.val()
            if(name == null){
                name = ""
            }else{
                name += " : "
            }
            database.ref("users/" + user + "/score/" + child.key + "/value").once('value').then(function(snapshot2) {
                let eventScore = parseFloat(snapshot2.val())
               /* if (eventScore <2) {
                    event.innerHTML = name + eventScore + " point"
                }else{
                    event.innerHTML = name + eventScore + " points"
                }*/

                // graphique
                if (histogramValues.length==0){
                    histogramValues[i]=eventScore
                    }
                else{
                    histogramValues[i]=Math.round((histogramValues[i-1]+eventScore)*100)/100
                }

                histogramNames[i]=name
                
                i++

                $(function () { 

                    $('#container').highcharts({
                          chart: {
                              type: 'column',
                              backgroundColor: '#fff'
                          },
                          title: {
                              text: 'Points au cours du temps',
                              style: {  
                                color: '#fff'
                              }
                          },
                          xAxis: {
                              tickWidth: 0,
                              labels: {
                                style: {
                                    color: '#333',
                                   }
                                },
                              categories: histogramNames
                          },
                          yAxis: {
                             gridLineWidth: .5,
                                gridLineDashStyle: 'dash',
                                gridLineColor: 'black',
                             title: {
                                  text: '',
                                  style: {
                                    fontFamily: "arial",
                                    color: '#333'
                                   }
                              },
                              labels: {
                                formatter: function() {
                                          return Highcharts.numberFormat(this.value, 1, '.', ',')+' pts';
                                      },
                                style: {
                                    color: '#333',
                                   }
                                }
                              },
                          legend: {
                              enabled: false,
                          },
                          credits: {
                              enabled: false
                          },
                          tooltip: {
                             valuePrefix: ''
                          },
                          plotOptions: {
                                column: {
                                    borderRadius: 0,
                               pointPadding: -0.12,
                                    groupPadding: 0.1
                              } 
                              },
                          series: [{
                              name: 'Points',
                              data: histogramValues
                          }]
                      });
                  });
                //
                
                total += eventScore
                total = Math.round(total*100)/100
                /*if (total <2) {
                    document.getElementById("score").innerHTML = total + " point"
                }else{
                    document.getElementById("score").innerHTML = total + " points"
                }*/
                
            }) 
        }) 
    })
    charged()
});

let charge = 1
function charged(){
    if(charge < 1){
        charge++
        return
    }
    console.log("charged")
    document.getElementById("article").style.display = "block"
    document.getElementById("chargement").style.display = "none"
} 