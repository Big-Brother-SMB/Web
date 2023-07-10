let User = require('./User.js')
let funcDB = require('./functionsDB.js')

let db

module.exports = class UserSelect{
    static setDB(newdb){
        db=newdb;
    }

    static usersList = []
    static enCour = false
  
    constructor(uuid,score,prio,amis){
        this.uuid = uuid
        this.score = score
        this.prio = prio
        this.amis = amis
        this.amisEloigner = []
        //-1=refuser ; 0=defaut ; 1=inscrit
        this.pass = 0
    }
  
    static async algoDeSelection(semaine,creneau){
      if(this.enCour){
        return "En cour"
      }
      this.enCour = true
      //les amis proche => amis dans ma liste de ma demande
      //les amis éloignier => mes amis + les amis de mes amis + les amis des amis de mes amis + ...
  
      //récupère les données
      let info = await getMidiInfo(semaine,creneau)
      let listDemandes = await listMidiDemandes(semaine,creneau)
      this.usersList = []
  
      //remplie la "usersList" avec des "UserSelect" en utilisant les données précédante
      for(let i in listDemandes){
        if(listDemandes[i].DorI==0){
          let user = new User(listDemandes[i].uuid)
          let score = await user.score
          let prio = false
          if(info.prio.indexOf(await user.classe)!=-1){
            prio = true
          }
          (await user.groups).forEach(function(child) {
            if(info.prio.indexOf(child)!=-1){
              prio=true
            }
          })
          let amis = listDemandes[i].amis
          this.usersList.push(await new UserSelect(listDemandes[i].uuid,score,prio,amis))
        }
      }
  
  
      //suprime pour chaque utilisateur les amis qui n'ont pas fait de demandes et l'utilisateur est refusé 
      this.usersList.forEach(u=>{
        for(let a in u.amis){
          if(UserSelect.searchAmi(u.amis[a])==null){
            u.amis.splice(a,1);
            a--
            u.pass=-1
          }
        }
      })
  
      //trie les utilisateurs par ordre décroissant par rapport au score 
      this.usersList.sort(function compareFn(a, b) {
        if(a.score>b.score){
            return -1
        }else if(a.score<b.score){
            return 1
        }else{
            let rand = Math.floor(Math.random() * 2);
            if(rand == 0) rand=-1
            return rand
        }
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
        this.usersList[u].amis.forEach(a=>{
          if(UserSelect.searchAmi(a).prio){
            nbAmisPrio++
          }
          nbAmis++
        })
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
  
      //reponse client
      this.enCour = false
      return "fini, " + (inscrits - dejaInscrits) + " inscriptions<br>il reste " + (places - inscrits) + " places<br>appuyer pour reload"
    }
  
  
    static boucleInscription(inscrits,places){
      //vérifie qu'il reste des places
      bloc1 : {
        while(inscrits<places){
          //teste les utilisateurs avec en commensant par ceux avec le plus gros scores
          bloc2 : {
            for(let i in this.usersList){
              //si l'utilisateur n'est pas déja refusé
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
                
                if(testScore && nbAmisNonInscrit+inscrits<=places){
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
          UserSelect.searchAmi(a).amisComplete(moi)
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