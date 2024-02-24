const { containeranalysis_v1beta1 } = require('googleapis')
const User = require('./User.js')
const funcDB = require('./functionsDB.js')
const funcDate = require('./functionsDate.js')

let db

module.exports = class UserSelect{
    static setDB(newdb){
        db=newdb;
    }

    static usersList = []
    static enCour = false
  
    constructor(uuid,score,prio,amis,date,pass,vip){
        this.uuid = uuid
        this.score = score
        this.prio = prio
        //amis => amis dans ma liste de ma demande
        //amisEloigner => mes amis + les amis de mes amis + les amis des amis de mes amis + ...
        this.amis = amis
        this.amisEloigner = []
        this.date=new Date(date)

        //-1=refuser ; 0=defaut ; 1=inscrit
        this.pass = pass
        this.vip = vip
        this.vipActif = vip
        this.NumPlace = 0
    }
  
    static async algoDeSelection(semaine,creneau,ISM){
      try {
        if(this.enCour){
          return "En cour"
        }
        this.enCour = true
    
        //récupère les données(places, liste des group prioritaire... et liste des demande)
        let info = await funcDB.getMidiInfo(semaine,creneau)
        let listDemandes = await funcDB.listMidiDemandes(semaine,creneau)
        if(info==undefined){
          this.enCour=false
          return "err"
        }
        
        this.usersList = []
    
        //remplie la "usersList" avec des objets "UserSelect" en utilisant les données précédante
        //détermine datetoday, la date du jour
        let jourForDate = Math.floor(creneau / 2)
        jourForDate++
        if(jourForDate>2)jourForDate++
        const dateToday = funcDate.generedDate(semaine,jourForDate,0,0,0)

        for(let i in listDemandes){
          let user = new User(listDemandes[i].uuid)
          let score = await user.score
          let prio = false
          if(info.prio.indexOf(await user.classe)!=-1){
            prio = true
          }

          //met en vip les anniversaires et les vips
          //met prioritère les utilisateur étant dans un groupes prioritaire
          let vip=false;
          const birthday = dateToday.getDate()
          const birthmonth = dateToday.getMonth()+1
          if(await user.birthday == birthday && await user.birthmonth == birthmonth && !ISM){
            vip=true
          }
          (await user.groups).forEach(function(child) {
            if(info.prio.indexOf(child)!=-1){
              prio=true
            }
            if(["VIP"].indexOf(child)!=-1 && !ISM){
              vip=true
            }
          })

          //récupére la liste d'amis
          let amis = listDemandes[i].amis

          //récupére le statut (demandeur ou inscrit)
          let pass=0;
          if(listDemandes[i].DorI==1 && !ISM){
            pass=2
          }

          //ajoute l'utilisateur dans la liste "usersList"
          this.usersList.push(await new UserSelect(listDemandes[i].uuid,score,prio,amis,listDemandes[i].date,pass,vip))
        }
    

        //donne un bonus de point pour avoir déposer la demande à avance
        for(let u in this.usersList){
          if(this.usersList[u].date.getTime() < dateToday.getTime()){
            this.usersList[u].score+=info.bonus_avance
          }
        }


        //suprime pour chaque utilisateur les amis qui n'ont pas fait de demandes(pour éviter les bugs), si c'est le cas l'utilisateur est refusé car sa demande est invalide
        for(let u in this.usersList){
          for(let a=this.usersList[u].amis.length-1;a>=0;a--){
            if(this.usersList[u].amis[a]==this.usersList[u].uuid){
              //supprime de la liste d'ami l'utilisateur lui-même (protection pour evité les bug)
              let list_amis = this.usersList[u].amis;
              list_amis.splice(a,1);
              this.usersList[u].amis = list_amis
            }else if(UserSelect.searchAmi(this.usersList[u].amis[a])==null){
              //supprime un ami qui n'a pas déposer de demande
              let list_amis = this.usersList[u].amis;
              list_amis.splice(a,1);
              this.usersList[u].amis = list_amis
              this.usersList[u].pass=-1
            }
          }
        }

        //trie les utilisateurs par score croissant, pour donner le statut de vipActif au amis qui on le moins points
        for(let u in this.usersList){
          this.usersList[u].amis.sort(function compareFn(aUUID, bUUID) {
            let a = UserSelect.searchAmi(aUUID)
            let b = UserSelect.searchAmi(bUUID)
            if(a.score < b.score){
                return -1
            }else if(a.score > b.score){
                return 1
            }
            return 0
          })
        }
        
        for(let u in this.usersList){
          // donne le statut vipActif 4 amis maximum + l'utilisateur vip qui est déjà vipActif
          let vipMax = 4
          for(let a=0;a<this.usersList[u].amis.length;a++){
            if(this.usersList[u].pass!=-1 && this.usersList[u].vip && vipMax>0 && UserSelect.searchAmi(this.usersList[u].amis[a]).vipActif!=1){
              //donne le statut vipActif
              UserSelect.searchAmi(this.usersList[u].amis[a]).vipActif=true
              vipMax--
            }
          }
        }

        for(let u in this.usersList){
          //refuse les demandes si l'utilisateur à 0 points ou moins, sauf si il est vipActif
          if(this.usersList[u].score<=0 && !this.usersList[u].vipActif){
            this.usersList[u].pass=-1
          }
        }
    
        //trie les utilisateurs par rapport au vip puis au score puis à la date de la demande
        this.usersList.sort(function compareFn(a, b) {
          if(a.vipActif != b.vipActif){
            if(a.vipActif){
              return -1
            }else{
              return 1
            }
          }
          if(a.score < b.score){
              return 1
          }else if(a.score > b.score){
              return -1
          }else{
            //si le score est identique départager sur la date de la demande 
            if(a.date.getTime() < b.date.getTime()){
              return -1
            }else if(a.date.getTime() > b.date.getTime()){
              return 1
            }
          }
          return 0
        })

        for(let u in this.usersList){
          this.usersList[u].amisComplete(this.usersList[u]) //récupère les amis éloignier des utilisateur
          this.usersList[u].NumPlace=parseInt(u) //donne la place de chaque utilisateur dans la liste
        }

    
        //rend prioritère les gens qui ont un pourcentage minimum de 'perMin' amis proche prioritère
        let usersList2 = []
        this.usersList.forEach(e=>{
          usersList2.push(e)
        })
        for(let u in this.usersList){
          let nbAmisPrio=0
          let nbAmis=0
          for(let a in this.usersList[u].amis){
            if(UserSelect.searchAmi(this.usersList[u].amis[a]).prio){
              nbAmisPrio++
            }
            nbAmis++
          }
          let pourcentageAmisPrio = Math.ceil((nbAmisPrio/nbAmis)*100)
          if(pourcentageAmisPrio>=info.perMin){
            usersList2[u].prio = true
          }
        }
        this.usersList = usersList2
    
        //si l'option prioritaire uniquement est active
        //refuse les non prio
        if(info.prio_mode==2){
          for(let u in this.usersList){
            if(!this.usersList[u].prio){
              this.usersList[u].pass=-1
            }
          }
        }

        //si l'option interdit aux prioritaires est active
        //refuse les prio
        if(info.prio_mode==3){
          for(let u in this.usersList){
            if(this.usersList[u].prio){
              this.usersList[u].pass=-1
            }
          }
        }
    
        //refuse l'utilisateur si l'un des amis éloignié est refusé
        //et récupère le nombre de places et le nombre d'inscrition
        const places = info.places
        let inscrits = 0
        for(let i in this.usersList){
          this.usersList[i].amisEloigner.forEach(a=>{
            a=UserSelect.searchAmi(a)
            if(a.pass==-1){
              UserSelect.usersList[i].pass=-1
            }
          })

          if(this.usersList[i].pass>=1){
            inscrits++
          }
        }
        const dejaInscrits = inscrits
    
        //si l'option prendre en compte les prioritaires est active
        //l'algo fait un prmier tour avec seulement les prio
        if(info.prio_mode==1){
          //recupére la liste des refusé en temps normal
          let usersList2 = []
          for(let u in this.usersList){
            if(this.usersList[u].pass!=-1){
              usersList2.push(true)
            }else{
              usersList2.push(false)
            }
          }
    
          //premier tour prio uniquement, on refuse les non prio
          for(let u in this.usersList){
            if(!this.usersList[u].prio){
              this.usersList[u].pass=-1
            }
          }
          for(let i in this.usersList){
            this.usersList[i].amisEloigner.forEach(a=>{
              a=UserSelect.searchAmi(a)
              if(a.pass==-1){
                UserSelect.usersList[i].pass=-1
              }
            })
          }
          //on lance l'algo
          inscrits=this.boucleInscription(inscrits,places)
    
          //reset les pass -1 car il n'était pas prioritère
          for(let i in this.usersList){
            if(usersList2[i] && this.usersList[i].pass==-1){
              this.usersList[i].pass=0
            }
          }
        }
        
        //on lance l'algo et on récupére la liste des inscrires
        inscrits=this.boucleInscription(inscrits,places)
    
        
        if(ISM){
          //calcule ISM
          let indicePointsMin = 1000
          let nombreUtilisateursInvalide = 0
          for(let i in this.usersList){
            if(this.usersList[i].pass>=1){
              if(this.usersList[i].score < indicePointsMin){
                indicePointsMin = this.usersList[i].score
              }
            }
            if(this.usersList[i].pass==-1){
              nombreUtilisateursInvalide++
            }
          }
          //reponse client admin
          this.enCour = false
          console.log("[algo/ISM] " + inscrits + " inscriptions, il reste " + (places - inscrits) + " places","ISM:" + indicePointsMin,"w:"+semaine,"j:"+Math.floor(creneau / 2),"h:"+(11+creneau%2))
          return "ISM: " + indicePointsMin + "pts<br>" + inscrits + "/" +places + " inscrits<br>" + nombreUtilisateursInvalide + " demandes invalides<br>Appuyer pour relancer."
        }else{
          //inscription SQL
          for(let i in this.usersList){
            if(this.usersList[i].pass==1){
              let user = new User(this.usersList[i].uuid)
              let infoD = await user.getMidiDemande(semaine,creneau)
              user.sendNotif("Accepter au foyer","Vous êtes accepté au foyer.",'/assets/pass/ok.png',"pass")
              await user.setMidiDemande(semaine,creneau,infoD.amis,true,infoD.scan)
            }
          }
          //reponse client admin
          this.enCour = false
          console.log("[algo] " + (inscrits - dejaInscrits) + " inscriptions, il reste " + (places - inscrits) + " places","w:"+semaine,"j:"+Math.floor(creneau / 2),"h:"+(11+creneau%2))
          return "Fini, " + (inscrits - dejaInscrits) + " inscriptions<br>il reste " + (places - inscrits) + " places<br>Appuyer pour relancer."
        }
      } catch (error) {
        console.error(error)
        console.log("error algo")
        this.enCour = false
        return "error algo"
      }
    }
  
  
    static boucleInscription(inscrits,places){
      bloc1 : {
        //vérifie qu'il reste des places
        while(inscrits<places){
          //teste les utilisateurs dans l'ordre de la liste
          bloc2 : {
            for(let i in this.usersList){
              //on va testé l'utilisateur s'il n'est pas refusé ou n'est pas accepté
              if(this.usersList[i].pass==0){
                let amisAccepte=true
                //test si les amis ont tous une meilleur places dans la liste que l'utilisateur ou si les amis sont déja inscrit
                //cela permet d'inscrire tout le monde en même temps et de ne pas couper le groupe
                this.usersList[i].amisEloigner.forEach(a=>{
                  if(UserSelect.usersList[i].NumPlace<UserSelect.searchAmi(a).NumPlace && UserSelect.searchAmi(a).pass<1){
                    amisAccepte=false
                  }
                })
                //test si il y a assez de places pour inscrire l'utilisateur et ses amis éloignier
                let nbAmisNonInscrit = this.usersList[i].amisEloigner.length+1 // on récupére le nombre d'amis +1 pour l'utilisateur
                this.usersList[i].amisEloigner.forEach(a=>{
                  //si un ami est inscrit alors le ne prendra pas une nouvelle place, donc on le supprime du compte
                  if(UserSelect.searchAmi(a).pass>=1){
                    nbAmisNonInscrit--
                  }
                })
                
                //si les 2 conditions sont respecté, on inscrit le groupe
                if(amisAccepte && nbAmisNonInscrit+inscrits<=places){
                  //inscrit l'utilisateur et ses amis
                  inscrits += nbAmisNonInscrit
                  this.usersList[i].pass=1
                  this.usersList[i].amisEloigner.forEach(a=>{
                    let ami = UserSelect.searchAmi(a)
                    if(ami.pass<1){
                      ami.pass=1
                    }
                  })
                  //recommence à tester depuis le début de la liste quand des inscriptions ont eu lieu
                  break bloc2;
                }
              }
            }
            //si la boucle for se termine sans avoir sélétionné personne alors stopper l'algo car on est au maximum de remplisage possible
            break bloc1;
          }
        }
      }
      return inscrits
    }
  
    amisComplete(moi){
      //fonction récursive qui récupére les amis éloigné
      let obj = this
      obj.amis.forEach(a=>{
        if(a!=moi.uuid && !moi.amisEloigner.includes(a)){
          moi.amisEloigner.push(a)
          let ami = UserSelect.searchAmi(a)
          if(ami!=null) ami.amisComplete(moi)
        }
      })
    }
  
    static searchAmi(uuid){
      //récupére un "UserSelect" dans la liste à partir d'un uuid
      for(let i in this.usersList){
        if(this.usersList[i].uuid==uuid){
          return this.usersList[i]
        }
      }
      return null
    }

    static async test(){
      //fonction de test pour vérifier l'algo
      let nameList = await User.listUserComplete()
      let nameListUUID =  nameList.map(x=>{ return x.uuid})

      let usersListUUID =  this.usersList.map(x=>{ return x.uuid})
      for(let a=0;a<nameListUUID.length;a++){
        nameList[a].score = await ( await new User(nameList[a].uuid)).score
      }

      nameList.sort(function compareFn(a, b) {
        if(a.score < b.score){
            return 1
        }else if(a.score > b.score){
            return -1
        }else{
          return 0
        }
      })
      let moy = 0
      let tour = 0
      for(let a=0;a<nameListUUID.length;a++){
        tour++
        moy+=nameList[a].score
        //console.log(nameList[a].first_name + " " + nameList[a].last_name + " " + nameList[a].score) //listes des éléves du lycée trier par score
      }
      console.log(moy/tour) //moyen des point de tous les éléves du lycée
      

      //donne la liste des éléves de l'algo avec leurs places, etc...
      nameListUUID =  nameList.map(x=>{ return x.uuid})
      for(let b=0;b<usersListUUID.length;b++){
        for(let a=0;a<nameListUUID.length;a++){
          if(nameListUUID[a]==usersListUUID[b] && this.usersList[b].vipActif){ // && this.usersList[b].pass==0
            console.log(this.usersList[b].pass + " " + nameList[a].uuid + " " + nameList[a].first_name + " " + nameList[a].last_name + "\t" + nameList[a].score + "\t" + this.usersList[b].vipActif)
            let scoreMinimum=300
            this.usersList[b].amisEloigner.forEach(a=>{
              if(UserSelect.searchAmi(a).score < scoreMinimum){
                scoreMinimum = UserSelect.searchAmi(a).score 
              }
            })
            if(scoreMinimum>nameList[a].score){
              //console.log(this.usersList[b].pass + " " + nameList[a].uuid + " " + nameList[a].first_name + " " + nameList[a].last_name + "\t" + nameList[a].score)
              //console.log(scoreMinimum)
            }
          } 
        }
      }
    }
}
