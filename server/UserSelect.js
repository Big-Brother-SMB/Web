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
        //les amis proche => amis dans ma liste de ma demande
        //les amis éloignier => mes amis + les amis de mes amis + les amis des amis de mes amis + ...
    
        //récupère les données
        let info = await funcDB.getMidiInfo(semaine,creneau)
        let listDemandes = await funcDB.listMidiDemandes(semaine,creneau)
        if(info==undefined){
          this.enCour=false
          return "err"
        }
        
        this.usersList = []
    
        //remplie la "usersList" avec des "UserSelect" en utilisant les données précédante


        let nameList = await User.listUsersComplete()
        let nameListUUID =  nameList.map(x=>{ return x.uuid})

        //détermine datetoday
        let jourForDate = Math.floor(creneau / 2)
        jourForDate++
        if(jourForDate>2)jourForDate++
        const dateToday = funcDate.generedDate(semaine,jourForDate,0,0,0)
        const birthday = dateToday.getDate()
        const birthmonth = dateToday.getMonth()+1

        for(let i in listDemandes){
          let user = new User(listDemandes[i].uuid)
          let score = await user.score
          let prio = false
          if(info.prio.indexOf(await user.classe)!=-1){
            prio = true
          }


          let vip=false;
          if(await user.birthday == birthday && await user.birthmonth == birthmonth){
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

          
          let amis = listDemandes[i].amis
          let pass=0;
          if(listDemandes[i].DorI==1 && !ISM){
            pass=2
          }
          this.usersList.push(await new UserSelect(listDemandes[i].uuid,score,prio,amis,listDemandes[i].date,pass,vip))
        }
    


        //donne un bonus d'avance
        //suprime pour chaque utilisateur les amis qui n'ont pas fait de demandes et l'utilisateur est refusé 
        for(let u in this.usersList){
          let vipMax = 4
          if(this.usersList[u].score<-1 && !this.usersList[u].vip && !ISM){
            this.usersList[u].pass=-1
          }
          if(this.usersList[u].date.getTime() < dateToday.getTime()){
            this.usersList[u].score+=info.bonus_avance
          }

          for(let a=this.usersList[u].amis.length-1;a>=0;a--){
            if(this.usersList[u].amis[a]==this.usersList[u].uuid){
              let list_amis = this.usersList[u].amis;
              list_amis.splice(a,1);
              this.usersList[u].amis = list_amis
            }else if(UserSelect.searchAmi(this.usersList[u].amis[a])==null){
              let list_amis = this.usersList[u].amis;
              list_amis.splice(a,1);
              this.usersList[u].amis = list_amis
              this.usersList[u].pass=-1
            }else if(this.usersList[u].vip && vipMax>0 && UserSelect.searchAmi(this.usersList[u].amis[a]).vipActif!=1){
              UserSelect.searchAmi(this.usersList[u].amis[a]).vipActif=1
              vipMax--
            }
            this.usersList[u].amis = this.usersList[u].amis.filter((x, i) => this.usersList[u].amis.indexOf(x) === i);
          }
        }
    
        //trie les utilisateurs par ordre décroissant par rapport au score 
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
        


        //outils de mesure de db
        /*let usersListUUID =  this.usersList.map(x=>{ return x.uuid})

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
          console.log(nameList[a].first_name + " " + nameList[a].last_name + " " + nameList[a].score)
        }
        console.log(moy/tour)

        for(let b=0;b<usersListUUID.length;b++){
          for(let a=0;a<nameListUUID.length;a++){
            if(nameListUUID[a]==usersListUUID[b]) console.log(nameList[a].first_name + " " + nameList[a].last_name)
          }
        }*/

        
    
        //récupère les amis éloignier des utilisateur
        //donne la place de chaque utilisateur
        for(let u in this.usersList){
          this.usersList[u].amisComplete(this.usersList[u])
          this.usersList[u].NumPlace=u
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
    
        //active l'option prioritaire uniquement
        //refuse les non prio
        if(info.prio_mode==2){
          for(let u in this.usersList){
            if(!this.usersList[u].prio){
              this.usersList[u].pass=-1
            }
          }
        }

        //active l'option interdit aux prioritaires
        //refuse les prio
        if(info.prio_mode==3){
          for(let u in this.usersList){
            if(this.usersList[u].prio){
              this.usersList[u].pass=-1
            }
          }
        }
    
        //me refuse si l'un de mes amis éloignié est refusé
        //récupère places/nombre inscrition
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
    
        //pour les prio
        if(info.prio_mode==1){
          let usersList2 = []
          for(let u in this.usersList){
            if(this.usersList[u].pass!=-1){
              usersList2.push(true)
            }else{
              usersList2.push(false)
            }
          }
    
          //premier tour prio uniquement 
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
          inscrits=this.boucleInscription(inscrits,places)
    
          //reset les pass -1 car il n'était pas prioritère
          for(let i in this.usersList){
            if(usersList2[i] && this.usersList[i].pass==-1){
              this.usersList[i].pass=0
            }
          }
        }
        
        //liste des inscrires
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
      //vérifie qu'il reste des places
      bloc1 : {
        while(inscrits<places){
          //teste les utilisateurs avec en commensant par ceux avec le plus gros scores
          bloc2 : {
            for(let i in this.usersList){
              //si l'utilisateur n'est pas déjà refusé ou accepté
              if(this.usersList[i].pass==0){
                let testScore=true
                //test si les amis ont tous plus de points que l'utilisateur ou qu'il sont déja inscrit
                this.usersList[i].amisEloigner.forEach(a=>{
                  if(UserSelect.usersList[i].NumPlace<UserSelect.searchAmi(a).NumPlace && UserSelect.searchAmi(a).pass<1){
                    testScore=false
                  }
                })
                //test si il y a assez de places pour inscrire l'utilisateur et ses amis éloignier
                let nbAmisNonInscrit = this.usersList[i].amisEloigner.length+1
                this.usersList[i].amisEloigner.forEach(a=>{
                  if(UserSelect.searchAmi(a).pass>=1){
                    nbAmisNonInscrit--
                  }
                })
                
                if(testScore && nbAmisNonInscrit+inscrits<=places){
                  //inscrit l'utilisateur et les amis
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
            //si la boucle for se termine sans avoir sélétionné personne alors stopper l'algo car on est au maximum possible
            break bloc1;
          }
        }
      }
      return inscrits
    }
  
    amisComplete(moi){
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
      for(let i in this.usersList){
        if(this.usersList[i].uuid==uuid){
          return this.usersList[i]
        }
      }
      return null
    }
}
