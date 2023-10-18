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
    }
  
    static async algoDeSelection(semaine,creneau){
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
        for(let i in listDemandes){
          let user = new User(listDemandes[i].uuid)
          let score = await user.score
          let prio = false
          if(info.prio.indexOf(await user.classe)!=-1){
            prio = true
          }
          let vip=false;
          (await user.groups).forEach(function(child) {
            if(info.prio.indexOf(child)!=-1){
              prio=true
            }
            if(["VIP","Club info"].indexOf(child)!=-1){
              vip=true
            }
          })
          let amis = listDemandes[i].amis
          let pass=0;
          if(listDemandes[i].DorI==1){
            pass=1
          }
          this.usersList.push(await new UserSelect(listDemandes[i].uuid,score,prio,amis,listDemandes[i].date,pass,vip))
        }
    
        //détermine datetoday
        let jourForDate = Math.floor(creneau / 2)
        jourForDate++
        if(jourForDate>2)jourForDate++
        let dateToday = funcDate.generedDate(semaine,jourForDate,0,0,0)

        //donne un bonus d'avance
        //suprime pour chaque utilisateur les amis qui n'ont pas fait de demandes et l'utilisateur est refusé 
        for(let u in this.usersList){
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
            }
            this.usersList[u].amis = this.usersList[u].amis.filter((x, i) => this.usersList[u].amis.indexOf(x) === i);
          }
        }
    
        //trie les utilisateurs par ordre décroissant par rapport au score 
        this.usersList.sort(function compareFn(a, b) {
          if(a.vip != b.vip){
            if(a.vip){
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
    
        //récupère les amis éloignier des utilisateur
        for(let u in this.usersList){
          this.usersList[u].amisComplete(this.usersList[u])
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
    
        //me refuse si l'un de mes amis éloignié est refusé
        for(let i in this.usersList){
          this.usersList[i].amisEloigner.forEach(a=>{
            a=UserSelect.searchAmi(a)
            if(a.pass==-1){
              UserSelect.usersList[i].pass=-1
            }
          })
        }
    
        //récupère places/nombre inscrition
        const places = info.places
        let inscrits = 0
        listDemandes.forEach(i=>{
          if(i.DorI==1){
            inscrits++
          }
        })
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
    
        //inscription SQL
        for(let i in this.usersList){
          if(this.usersList[i].pass==1){
            let user = new User(this.usersList[i].uuid)
            let infoD = await user.getMidiDemande(semaine,creneau)
            await user.setMidiDemande(semaine,creneau,infoD.amis,true,infoD.scan)
          }
        }
        
        //reponse client admin
        this.enCour = false
        console.log("[algo] " + (inscrits - dejaInscrits) + " inscriptions, il reste " + (places - inscrits) + " places","w:"+semaine,"j:"+Math.floor(creneau / 2),"h:"+(11+creneau%2))
        return "fini, " + (inscrits - dejaInscrits) + " inscriptions<br>il reste " + (places - inscrits) + " places<br>appuyer pour reload"
      } catch (error) {
        console.error(error)
        console.log("error algo")
        this.enCour = false
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
                  if(UserSelect.usersList[i].score>UserSelect.searchAmi(a).score && UserSelect.searchAmi(a).pass!=1){
                    testScore=false
                  }
                })
                //test si il y a assez de places pour inscrire l'utilisateur et ses amis éloignier
                let nbAmisNonInscrit = this.usersList[i].amisEloigner.length+1
                this.usersList[i].amisEloigner.forEach(a=>{
                  if(UserSelect.searchAmi(a).pass==1){
                    nbAmisNonInscrit--
                  }
                })
                
                if((testScore || this.usersList[i].vip) && nbAmisNonInscrit+inscrits<=places){
                  //inscrit l'utilisateur et les amis
                  inscrits += nbAmisNonInscrit
                  this.usersList[i].pass=1
                  this.usersList[i].amisEloigner.forEach(a=>{
                    UserSelect.searchAmi(a).pass=1
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
