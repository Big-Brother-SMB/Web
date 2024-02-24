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

    document.getElementById("score").addEventListener("click",()=>{
        common.loadpage("/accueil/score")
    })

    let cookies = await common.socketAsync("getCookies",null)

    const section = document.getElementById('cookies')

    //troll
    if(common.readCookie("troll")!=null){
            let div = document.createElement("div")
            div.className="divPostAccueil abo"
            div.style.backgroundColor = "#AAAA00"


            let time = document.createElement("p")
            time.className="titre"
            time.style.color="#0000FF"
            div.appendChild(time)

            const loop = ()=>{
                if(window.location.pathname=="/accueil"){
                    let sec = Math.floor((common.readIntCookie("troll")-Date.now())/1000)
                    let min = Math.floor(sec/60)
                    sec-=min*60
                    let hour = Math.floor(min/60)
                    min-=hour*60
                    time.innerHTML = 'Se finit dans: ' + hour +
                    ":" + (String(min).length == 1?"0":"") + min +
                    ":" + (String(sec).length == 1?"0":"") + sec
                    setTimeout(loop,500)
                }
            }
            loop()

            let rick = document.createElement("button")
            rick.className="btn"
            rick.innerHTML="supprimer troll"
            rick.setAttribute("id","rick_roll")

            div.appendChild(rick)

            rick.addEventListener("click",async ()=>{
                document.getElementById("background-video-src").setAttribute("src","/troll/rick.mp4")
                document.getElementById("background-video").load();
                new Promise((res)=>setTimeout(res,200))
                document.getElementById("background-video").play()
            })

            section.appendChild(div)
    }

    let dateToday = new Date()
    if(common.id_data.birthday == dateToday.getDate() && common.id_data.birthmonth == dateToday.getMonth()+1){
        let div = document.createElement("div")
        div.className="divPostAccueil anniv"

        let titre = document.createElement("p")
        titre.className="titre"
        titre.innerHTML='Happy Birth'
        div.appendChild(titre)


        let justificatif= document.createElement("p")
        justificatif.className="justificatif"
        justificatif.innerHTML="Pour votre anniversaire, vous avez le droit à un cookie gratuit!\n\nEt vous possédé pour aujourd'hui le statut de VIP pour le repas.\nCela signifie que vous et 4 de vos amis serez prioritaire, quelle que soit vos points(même négatif).\n*si la demande possède plus de 4 amis: seule les 4 amis avec le moins de point auront le droit au statut VIP"
        div.appendChild(justificatif)


        section.appendChild(div)
    }

    {   
        let div = document.createElement("div")
        div.className="divPostAccueil ban"

        let titre = document.createElement("p")
        titre.className="titre"
        titre.innerHTML='Mes groupes:'
        div.appendChild(titre)


        let justificatif= document.createElement("p")
        justificatif.className="justificatif"
        for(const group of common.groups){
            justificatif.innerHTML+= group + '   /   '
        }
        div.appendChild(justificatif)


        section.appendChild(div)
    }

    for(const ban of cookies.ban){
        if(new Date(ban.fin).getTime()>Date.now()){
            let div = document.createElement("div")
            div.className="divPostAccueil ban"

            let titre = document.createElement("p")
            titre.className="titre"
            titre.innerHTML='Banni du Foyer:'
            div.appendChild(titre)

            let date = document.createElement("p")
            date.className="date"
            date.innerHTML='De la semaine '+ new Date(ban.debut).getWeek() +' à '+new Date(ban.fin).getWeek()
            div.appendChild(date)

            let justificatif= document.createElement("p")
            justificatif.className="justificatif"
            justificatif.innerHTML='Justificatif:<br>'+ban.justificatif
            div.appendChild(justificatif)

            section.appendChild(div)
        }
    }

    for(const abo of cookies.abo){
        if(abo.quantity!=0 || new Date(abo.fin).getTime()>Date.now()){
            let div = document.createElement("div")
            div.className="divPostAccueil abo"

            let titre = document.createElement("p")
            titre.className="titre"
            titre.innerHTML='Abonnement cookies:'
            div.appendChild(titre)

            let date = document.createElement("p")
            date.className="date"
            date.innerHTML='De la semaine '+ new Date(abo.debut).getWeek() +' à '+new Date(abo.fin).getWeek()
            div.appendChild(date)

            let quantity = document.createElement("p")
            quantity.className="quantity"
            quantity.innerHTML='Quantité: '+abo.quantity
            div.appendChild(quantity)

            let justificatif= document.createElement("p")
            justificatif.className="justificatif"
            justificatif.innerHTML='Justificatif:<br>'+abo.justificatif
            div.appendChild(justificatif)

            let period = document.createElement("p")
            period.className="period"
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
            div.className="divPostAccueil ticket"

            let titre = document.createElement("p")
            titre.className="titre"
            titre.innerHTML='Bon pour un Cookie'
            div.appendChild(titre)

            let justificatif= document.createElement("p")
            justificatif.className="justificatif"
            justificatif.innerHTML='Justificatif:<br>'+ticket.justificatif
            div.appendChild(justificatif)

            section.appendChild(div)
        }
    }
}