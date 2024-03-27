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

    if(common.themeMode==4){
            let div = document.createElement("div")
            div.className="divPostAccueil abo"
            div.style.backgroundColor = "#AAAA00"


            let texte = document.createElement("p")
            texte.className="titre"
            texte.style.color="#0000FF"
            div.appendChild(texte)

            texte.innerHTML = "Un petit cadeau"

            let rick = document.createElement("button")
            rick.className="btn"
            rick.innerHTML="--->clic<---"
            rick.setAttribute("id","rick_roll")
            rick.style.marginBottom="20px"

            div.appendChild(rick)

            rick.addEventListener("click",async ()=>{
                document.getElementById("background-video-src").muted = false
                document.getElementById("background-video-src").setAttribute("src","/css_spe/troll/rick.mp4")
                await document.getElementById("background-video").load();
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
        titre.innerHTML='Happy Birthday'
        div.appendChild(titre)


        let justificatif= document.createElement("p")
        justificatif.className="justificatif"
        justificatif.innerHTML="Pour votre anniversaire, vous avez le droit à un cookie gratuit !"
        +"<br>En plus, vous avez, pour la journée, le statut VIP pour le repas."
        +"<br>Cela signifie que vous et 4 de vos amis seront prioritaires, quelles que soient vos quantités de points (même en points négatifs)"
        +"<br>*Si la demande possède plus de 4 amis, seuls les 4 amis avec le moins de points auront le statut VIP"
        div.appendChild(justificatif)


        section.appendChild(div)
    }

    {   
        let div = document.createElement("div")
        div.className="divPostAccueil group"

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