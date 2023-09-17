export async function init(common){
    document.getElementById("user").innerHTML = common.name(common.first_name,common.last_name)

    document.getElementById("classe").innerHTML = common.classe

    let textScore = ""
    let score = await common.socketAsync("score",null)
    if (score <2) {
        textScore = score + " pt"
    }else{
        textScore = score + " pts"
    }
    document.getElementById("score").innerHTML = textScore

    let cookies = await common.socketAsync("getCookies",null)
    console.log(cookies)

    const section = document.getElementById('cookies')

    //troll
    if(common.readCookie("troll")!=null){
            let div = document.createElement("div")
            div.className="cookie abo"
            div.style.backgroundColor = "green"

            let titre = document.createElement("p")
            titre.className="cookie abo titre"
            titre.innerHTML='Troll'
            div.appendChild(titre)

            let time = document.createElement("p")
            time.className="cookie abo quantity"
            div.appendChild(time)

            const loop = ()=>{
                if(window.location.pathname=="/accueil"){
                    let sec = Math.floor((common.readIntCookie("troll")-Date.now())/1000)
                    let min = Math.floor(sec/60)
                    sec-=min*60
                    let hour = Math.floor(min/60)
                    min-=hour*60
                    time.innerHTML = hour +
                    ":" + (String(min).length == 1?"0":"") + min +
                    ":" + (String(sec).length == 1?"0":"") + sec
                    setTimeout(loop,500)
                }
            }
            loop()

            section.appendChild(div)
    }

    for(const abo of cookies.abo){
        if(abo.quantity!=0 || new Date(abo.fin).getTime()>Date.now()){
            let div = document.createElement("div")
            div.className="cookie abo"

            let titre = document.createElement("p")
            titre.className="cookie abo titre"
            titre.innerHTML='Abonnement cookies:'
            div.appendChild(titre)

            let date = document.createElement("p")
            date.className="cookie abo date"
            date.innerHTML='De la semaine '+ new Date(abo.debut).getWeek() +' à '+new Date(abo.fin).getWeek()
            div.appendChild(date)

            let quantity = document.createElement("p")
            quantity.className="cookie abo quantity"
            quantity.innerHTML='Quantité: '+abo.quantity
            div.appendChild(quantity)

            let justificatif= document.createElement("p")
            justificatif.className="cookie abo justificatif"
            justificatif.innerHTML='Justificatif:<br>'+abo.justificatif
            div.appendChild(justificatif)

            let period = document.createElement("p")
            period.className="cookie abo period"
            period.innerHTML+="*period: "
            switch(abo.period){
                case 0:
                    period.innerHTML+="1w"
                    break;
                case 1:
                    period.innerHTML+="2w"
                    break;
                case 2:
                    period.innerHTML+="4w"
                    break;
            }
            period.innerHTML+=" / +" + abo.nbAdd
            if(abo.cumulatif){
                period.innerHTML+=" / cumulatif"
            }
            div.appendChild(period)

            section.appendChild(div)
        }
    }

    for(const ticket of cookies.ticket){
        if(ticket.date==null){
            let div = document.createElement("div")
            div.className="cookie ticket"

            let titre = document.createElement("p")
            titre.className="cookie ticket titre"
            titre.innerHTML='Bon pour un cookie'
            div.appendChild(titre)

            let justificatif= document.createElement("p")
            justificatif.className="cookie abo justificatif"
            justificatif.innerHTML='Justificatif:<br>'+ticket.justificatif
            div.appendChild(justificatif)

            section.appendChild(div)
        }
    }
}