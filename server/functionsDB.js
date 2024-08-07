const { jobs } = require('googleapis/build/src/apis/jobs');
const uuidG = require('uuid');
let db

module.exports = class funcDB{
  static setDB(newdb){
    db=newdb;
  }

  static async reset_db(){
    let t0 = ["2A","2B","2C","2D","2E","2F","2G","2H","2I","2J","2K","2L"]
    let t1 = ["1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K","1L"]
    let t2 = ["TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK","TL"]
    let t3 = ["professeurs-personnel"]
    let tab = []
    t0.forEach(e=>{
      tab.push({classe:e,niveau:0})
    })
    t1.forEach(e=>{
      tab.push({classe:e,niveau:1})
    })
    t2.forEach(e=>{
      tab.push({classe:e,niveau:2})
    })
    t3.forEach(e=>{
      tab.push({classe:e,niveau:3})
    })
    this.setClasse(tab)
    this.setGroup(["VIP","La pieuvre","BDL","Lycéens humanitaires"])


    db.run('delete from users where admin=0')
    db.run('DELETE FROM admin_permission WHERE NOT (uuid IN (SELECT uuid FROM users))');



    db.run('delete from var')
    db.run('delete from emprunt')

    db.run('delete from achievement')
    db.run('delete from amis')
    db.run('delete from user_groups')
    db.run('delete from token')
    db.run('delete from users_notification_subscription')

    db.run('delete from perm_info')
    db.run('delete from perm_list')

    db.run('delete from midi_info')
    db.run('delete from midi_menu')
    db.run('delete from midi_list')
    db.run('delete from midi_prio')
    db.run('delete from midi_amis')

    db.run('delete from sondage_menu')

    db.run('delete from point_global')
    db.run('delete from point_perso')

    db.run('delete from ticket_cookie')
    db.run('delete from subscription_cookie')
    db.run('delete from ban')

    db.run('delete from post')
    db.run('delete from post_lu')
    
    db.run('delete from lieu_info')
    db.run('delete from lieu_list')
  }

  //var
  static getVar(key){
    return new Promise(function(resolve, reject) {
        try{
            db.get("SELECT value FROM 'var' where key=?",[key], (err, data) => {
            if(data!=undefined){
                resolve(data.value)
            }else{
                resolve(null)
            }
            })
        }catch(e){console.error("fDB");;console.log('a1');;resolve(null)}
        setTimeout(reject,5000)
    })
  }
  static setVar(key,value){
    db.get("SELECT * FROM var where key=?",[key], (err, data) => {
        if(data==undefined){
            db.run("INSERT INTO var(key,value) VALUES (?,?)",[key,value])
        } else{
            db.run("UPDATE var SET value=? WHERE key=?",[value,key])
        }
    })
  }


  //perm
  static getPermOuvert(semaine,day,creneau){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM perm_info where semaine=? and day=? and creneau=?",[semaine,day,creneau], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data.ouvert)
          }else{
            resolve(null)
          }
        }catch(e){console.error("fDB");;console.log('a2');;resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }
  static setPermOuvert(semaine,day,creneau,ouvert){
    db.get("SELECT * FROM 'perm_info' where semaine=? and day=? and creneau=?",[semaine,day,creneau], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO perm_info(ouvert,semaine,day,creneau) VALUES (?,?,?,?)",[ouvert,semaine,day,creneau])
      } else{
        db.run("UPDATE perm_info SET ouvert=? where semaine=? and day=? and creneau=?",[ouvert,semaine,day,creneau])
      }
    })
  }
  static listPermDemandes(semaine,day,creneau){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM perm_list WHERE semaine=? and day=? and creneau=?",[semaine,day,creneau], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error("fDB");;console.log('a3');;resolve([])}
      })
      setTimeout(reject,5000)
    })
  }
  static setPermInscrit(semaine,day,creneau,groups){
    db.run("delete from perm_list where semaine=? and day=? and creneau=? and DorI=true",[semaine,day,creneau])
    groups.forEach(g=>{
      db.run("INSERT INTO perm_list(semaine,day,creneau,group2,DorI) VALUES (?,?,?,?,true)",[semaine,day,creneau,g])
    })
  }
  
  
  //midi
  static getMidiMenu(semaine){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM midi_menu where semaine=?",[semaine], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve({})
          }
        }catch(e){console.error("fDB");;console.log('a4');;resolve({})}
      })
      setTimeout(reject,5000)
    })
  }
  static setMidiMenu(semaine,menu,self){
    db.get("SELECT * FROM midi_menu where semaine=?",[semaine], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO midi_menu(menu,self,semaine) VALUES (?,?,?)",[menu,self,semaine])
      } else{
        db.run("UPDATE midi_menu SET menu=?, self=? where semaine=?",[menu,self,semaine])
      }
    })
  }
  static getMidiInfo(semaine,creneau){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM midi_info where semaine=? and creneau=?",[semaine,creneau], (err, data) => {
        try {
          if(data!=undefined){
            db.all("SELECT * FROM midi_prio where semaine=? and creneau=?",[semaine,creneau], (err, data2) => {
              let list=[]
              data2.forEach(e=>{
                list.push(e.group2)
              })
              data.prio=list
              resolve(data)
            })
          }else{
            resolve(undefined)
          }
        }catch(e){console.error("fDB");;console.log('a5');;resolve({prio:[]})}
      })
      setTimeout(reject,5000)
    })
  }
  static setMidiInfo(semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,prio_mode,nbSandwich,nbSandwich_vege,mode_sandwich,bonus_avance,algo_auto,msg,list_prio){
    db.get("SELECT * FROM midi_info where semaine=? and creneau=?",[semaine,creneau], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO midi_info(semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,prio_mode,nbSandwich,nbSandwich_vege,mode_sandwich,bonus_avance,algo_auto,msg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,prio_mode,nbSandwich,nbSandwich_vege,mode_sandwich,bonus_avance,algo_auto,msg])
      } else{
        db.run("UPDATE midi_info SET cout=?,gratuit_prio=?,ouvert=?,perMin=?,places=?,prio_mode=?,nbSandwich=?,nbSandwich_vege=?,mode_sandwich=?,bonus_avance=?,algo_auto=?,msg=? where semaine=? and creneau=?",[cout,gratuit_prio,ouvert,perMin,places,prio_mode,nbSandwich,nbSandwich_vege,mode_sandwich,bonus_avance,algo_auto,msg,semaine,creneau])
      }
    })
    db.serialize(()=>{
      db.run("delete from midi_prio WHERE semaine=? and creneau=?",[semaine,creneau])
      list_prio.forEach(e=>{
        db.run("INSERT INTO midi_prio(semaine,creneau,group2) VALUES (?,?,?)",[semaine,creneau,e])
      })
    })
  }
  static listMidiDemandes(semaine,creneau){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM midi_list WHERE semaine=? and creneau=?",[semaine,creneau], (err, data) => {
        try {
          if(data!=undefined){
            for(let i=0;i<data.length;i++){
              db.all("SELECT * FROM midi_amis WHERE semaine=? and creneau=? and uuid=?",[semaine,creneau,data[i].uuid], (err, data2) => {
                let list=[]
                data2.forEach(e=>{
                  list.push(e.amis)
                })
                data[i]["amis"]=list
              })
            }
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error("fDB");;console.log('a6');;resolve([])}
      })
      setTimeout(reject,5000)
    })
  }
  
  
  //point
  static addGlobalPoint(date,name,value){
    db.run("INSERT INTO point_global(date,name,value) VALUES (?,?,?)",[date,name,value])
  }
  static delGlobalPoint(date){
    db.run("delete from point_global where date=?",[date])
  }
  static listGlobalPoint(){
    return new Promise(function(resolve, reject) {
      let list=[]
      db.all("SELECT * FROM point_global", (err, data) => {
        try{
            if(data!=undefined){
                data.forEach(e=>{
                  list.push(e)
                })
            }
            resolve(list)
        }catch(e){console.error("fDB");;console.log('a7');;resolve([])}
      })
      setTimeout(reject,5000)
    })
  }
  
  
  //group / classe
  static getGroup(){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM group_list", (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error("fDB");;console.log('a8');;resolve([])}
      })
      setTimeout(reject,5000)
    })
  }
  static setGroup(list){
    db.serialize(()=>{
      db.run("delete from group_list")
      list.forEach(e=>{
        db.run("INSERT INTO group_list(group2) VALUES (?)",[e])
      })
    })
  }
  static getClasse(){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM classe_list", (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error("fDB");;console.log('a9');;resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }
  static setClasse(list){
    db.serialize(()=>{
      db.run("delete from classe_list")
      list.forEach(e=>{
        db.run("INSERT INTO classe_list(classe,niveau) VALUES (?,?)",[e.classe,e.niveau])
      })
    })
  }



  //------------------------------emprunt--------------------------------

  static addPret(obj,uuid,debut){
    db.run("INSERT INTO emprunt(objet,uuid,debut) VALUES (?,?,?)",[obj,uuid,debut])
  }

  static finPret(obj,uuid,debut,fin){
    db.run("UPDATE emprunt SET fin=? where objet=? and uuid=? and debut=?",[fin,obj,uuid,debut])
  }

  static commentairePret(obj,uuid,debut,commentaire){
    db.run("UPDATE emprunt SET commentaire=? where objet=? and uuid=? and debut=?",[commentaire,obj,uuid,debut])
  }

  static getPretsActuel(){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM emprunt WHERE fin IS NULL", (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error("fDB");;console.log('a-1');resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }

  static getAllPrets(){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM emprunt", (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error("fDB");;console.log('a-2');resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }


  /*--------------------------------------cookie / ban------------------------------------------*/

  static addSubscriptionCookie(uuid,debut,fin,justificatif,period,cumulatif,nbAdd,quantity,maj){
    let id=uuidG.v4()
    db.run("INSERT INTO subscription_cookie(id,uuid,debut,fin,justificatif,period,cumulatif,nbAdd,quantity,maj) VALUES (?,?,?,?,?,?,?,?,?,?)",[id,uuid,debut,fin,justificatif,period,cumulatif,nbAdd,quantity,maj])
  }

  static modifSubscriptionCookie(id,uuid,debut,fin,justificatif,period,cumulatif,nbAdd,quantity,maj){
    db.run("UPDATE subscription_cookie SET uuid=?,debut=?,fin=?,justificatif=?,period=?,cumulatif=?,nbAdd=?,quantity=?,maj=? where id=?",[uuid,debut,fin,justificatif,period,cumulatif,nbAdd,quantity,maj,id])
  }

  static delSubscriptionCookie(id){
    db.run("DELETE FROM subscription_cookie WHERE id=?",[id])
  }

  static getSubscriptionCookie(){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM subscription_cookie", (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error("fDB");;console.log('a-3');resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }


  static addTicketCookie(uuid,date,justificatif){
    let id=uuidG.v4()
    db.run("INSERT INTO ticket_cookie(id,uuid,date,justificatif) VALUES (?,?,?,?)",[id,uuid,date,justificatif])
  }

  static modifTicketCookie(id,uuid,date,justificatif){
    db.run("UPDATE ticket_cookie SET uuid=?,date=?,justificatif=? where id=?",[uuid,date,justificatif,id])
  }

  static delTicketCookie(id){
    db.run("DELETE FROM ticket_cookie WHERE id=?",[id])
  }

  static getTicketCookie(){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM ticket_cookie", (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error("fDB");;console.log('a-3');resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }

  static addBan(uuid,debut,fin,justificatif){
    let id=uuidG.v4()
    db.run("INSERT INTO ban(id,uuid,debut,fin,justificatif) VALUES (?,?,?,?,?)",[id,uuid,debut,fin,justificatif])
  }

  static modifBan(id,uuid,debut,fin,justificatif){
    db.run("UPDATE ban SET uuid=?,debut=?,fin=?,justificatif=? where id=?",[uuid,debut,fin,justificatif,id])
  }

  static delBan(id){
    db.run("DELETE FROM ban WHERE id=?",[id])
  }

  static getBan(){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM ban", (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error("fDB");;console.log('a-3');resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }

  //sondage menu
  static getAllResultsMenu(semaine,menu){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM sondage_menu where semaine=? and menu=?",[semaine,menu], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error("fDB");;console.log('a-4');resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }

  static getSondageMenu(uuid,semaine,menu){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM sondage_menu where uuid=? and semaine=? and menu=?",[uuid,semaine,menu], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data.note)
          }else{
            resolve(-1)
          }
        }catch(e){console.error("fDB");;console.log('a-5');resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }

  static setSondageMenu(uuid,semaine,menu,note){
    db.get("SELECT * FROM sondage_menu where uuid=? and semaine=? and menu=?",[uuid,semaine,menu], (err, data) => {
      if(note==-1){
        db.run("DELETE FROM sondage_menu WHERE uuid=? and semaine=? and menu=?",[uuid,semaine,menu])
      }else if(data==undefined){
        db.run("INSERT INTO sondage_menu(uuid,semaine,menu,note) VALUES (?,?,?,?)",[uuid,semaine,menu,note])
      } else{
        db.run("UPDATE sondage_menu SET note=? where uuid=? and semaine=? and menu=?",[note,uuid,semaine,menu])
      }
    })
  }

  //post

  static setPost(id,from,group,title,text,date){
    db.get("SELECT * FROM post where id=?",[id], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO post(id,from2,group2,title,text,date) VALUES (?,?,?,?,?,?)",[id,from,group,title,text,date])
      } else{
        db.run("UPDATE post SET from2=?,group2=?,title=?,text=?,date=? WHERE id=?",[from,group,title,text,date,id])
      }
    })
  }

  static getPostWithAllLu(id){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM post WHERE id=?",[id],async (err, data) => {
        try {
          if(data!=undefined){
            let r = await new Promise(async function(resolve2, reject2) {
              db.all("SELECT * FROM post_lu WHERE id=?",[id], async (err, data2) => {
                resolve2(data2)
              })
            })
            if(r!=undefined){
              data.lu=[]
              r.forEach(e=>{
                data.lu.push(e.user)
              })
            }else{
              data.lu=[]
            }
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error("fDB");;console.log('7-a11');;resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }

  static getPost(user){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM post",async (err, data) => {
        try {
          if(data!=undefined){
            for(let i=0;i<data.length;i++){
              let r = await new Promise(async function(resolve2, reject2) {
                db.all("SELECT * FROM post_lu WHERE id=?",[data[i].id], async (err, data2) => {
                  resolve2(data2)
                })
              })
              data[i].lu=false
              if(r!=undefined){
                r.forEach(e=>{
                  if(e.user==user){
                    data[i].lu=true
                  }
                })
              }
            }
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error("fDB");;console.log('8-a11');resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }

  static postLu(id,user){
    db.get("SELECT * FROM post_lu where id=? and user=?",[id,user], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO post_lu(id,user) VALUES (?,?)",[id,user])
      }
    })
  }

  static delPost(id){
    db.run("delete from post WHERE id=?",[id])
    db.run("delete from post_lu WHERE id=?",[id])
  }





  /*//CDI
  static getCDIGroups(semaine,day,creneau){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM CDI_list WHERE semaine=? and day=? and creneau=?",[semaine,day,creneau], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error("fDB");;console.log('a3');;resolve([])}
      })
      setTimeout(reject,5000)
    })
  }
  static setCDIGroups(semaine,day,creneau,groups){
    db.run("delete from CDI_list where semaine=? and day=? and creneau=?",[semaine,day,creneau])
    groups.forEach(g=>{
      db.run("INSERT INTO CDI_list(semaine,day,creneau,group2) VALUES (?,?,?,?)",[semaine,day,creneau,g])
    })
  }*/

  //Lieu
  static getLieuInfo(lieu,semaine,day,creneau){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM lieu_info where lieu=? and semaine=? and day=? and creneau=?",[lieu,semaine,day,creneau], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve({lieu:lieu,semaine:semaine,day:day,creneau:creneau,ouvert:0,msg:"",title:"",texte:"",places:null})
          }
        }catch(e){console.error("fDB");;console.log('a2');;resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }

  static setLieuInfo(lieu,semaine,day,creneau,ouvert,msg,title,texte,places){
    db.get("SELECT * FROM 'lieu_info' where lieu=? and semaine=? and day=? and creneau=?",[lieu,semaine,day,creneau], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO lieu_info(ouvert,msg,title,texte,places,lieu,semaine,day,creneau) VALUES (?,?,?,?,?,?,?,?,?)",[ouvert,msg,title,texte,places,lieu,semaine,day,creneau])
      } else{
        db.run("UPDATE lieu_info SET ouvert=?, msg=?, title=?, texte=?, places=? where lieu=? and semaine=? and day=? and creneau=?",[ouvert,msg,title,texte,places,lieu,semaine,day,creneau])
      }
    })
  }

  static getLieuList(lieu,semaine,day,creneau){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM lieu_list where lieu=? and semaine=? and day=? and creneau=?",[lieu,semaine,day,creneau], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error("fDB");;console.log('a2');;resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }

  static getAllLieuList(semaine,day,creneau){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM lieu_list where semaine=? and day=? and creneau=?",[semaine,day,creneau], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error("fDB");;console.log('a-3');resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }














































































  //PDF

  static getPDF(){
    let uuid=this.uuid
    return new Promise(function(resolve, reject) {
      let msg = {mp:[],news:[],sondage:[]}
      db.all("SELECT * FROM messages WHERE from2=? or to2=?",[uuid,uuid], (err, data) => {
        try{
          if(data!=undefined){
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error("fDB");;console.log('d27');;resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }

  //% messages / news / sondages

  static addSondage(from,text,title,date,mode,choix){
    let id=uuidG.v4()
    db.run("INSERT INTO sondages(id,from2,text,title,date,mode,choix) VALUES (?,?,?,?,?,?,?)",[id,from,text,title,date,mode,choix])
    return id
  }
  static setSondage(id,from,text,title,date,mode,choix){
    db.run("UPDATE sondages SET from2=?,text=?,title=?,date=?,mode=?,choix=? WHERE id=?",[from,text,title,date,mode,choix,id])
  }
  static getSondage(id){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM sondages WHERE id=?",[id],async (err, data) => {
        try {
          if(data!=undefined){
            let r = await new Promise(async function(resolve2, reject2) {
              db.all("SELECT * FROM sondages_reponse WHERE id=?",[id], async (err, data2) => {
                resolve2(data2)
              })
            })
            if(r!=undefined){
              data.rep=r
            }else{
              data.rep=[]
            }
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error("fDB");;console.log('a10');;resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }
  static delSondage(id){
    db.run("delete from sondages WHERE id=?",[id])
    db.run("delete from sondages_reponse WHERE id=?",[id])
  }









  static addNews(from,text,title,date){
    let id=uuidG.v4()
    db.run("INSERT INTO news(id,from2,text,title,date) VALUES (?,?,?,?,?)",[id,from,text,title,date])
    return id
  }
  static setNews(id,from,text,title,date){
    db.run("UPDATE news SET from2=?,text=?,title=?,date=? WHERE id=?",[from,text,title,date,id])
  }
  static getNews(id){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM news WHERE id=?",[id],async (err, data) => {
        try {
          if(data!=undefined){
            let r = await new Promise(async function(resolve2, reject2) {
              db.all("SELECT * FROM news_lu WHERE id=?",[id], async (err, data2) => {
                resolve2(data2)
              })
            })
            if(r!=undefined){
              data.lu=r
            }else{
              data.lu=[]
            }
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error("fDB");;console.log('a11');;resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }
  static delNews(id){
    db.run("delete from news WHERE id=?",[id])
    db.run("delete from news_lu WHERE id=?",[id])
  }

  static addMessage(from,to,lu,text,title,date){
    let id=uuidG.v4()
    db.run("INSERT INTO messages(id,from2,to2,lu,text,title,date) VALUES (?,?,?,?,?,?,?)",[id,from,to,lu,text,title,date])
    return id
  }
  static setMessage(id,from,to,lu,text,title,date){
    db.run("UPDATE messages SET from2=?,to2=?,lu=?,text=?,title=?,date=? WHERE id=?",[from,to,lu,text,title,date,id])
  }
  static getMessage(id){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM messages WHERE id=?",[id], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error("fDB");;console.log('a12');;resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }
  static delMessage(id){
    db.run("delete from messages WHERE id=?",[id])
  }
  static getAllMessages(){
    return new Promise(function(resolve, reject) {
      let msg = {mp:[],news:[],sondage:[]}
      db.all("SELECT * FROM messages", (err, data) => {
          try{
              if(data!=undefined){
                  msg.mp=data
              }
              db.all("SELECT * FROM news", async (err, data) => {
                try{
                    if(data!=undefined){
                      for (let i in data){
                        let r = await new Promise(async function(resolve2, reject2) {
                          db.all("SELECT * FROM news_lu WHERE id=?",[data[i].id], async (err, data2) => {
                            resolve2(data2)
                          })
                        })
                        if(r!=undefined){
                          data[i].lu=r
                        }
                        msg.news.push(data[i])
                      }
                    }
                    db.all("SELECT * FROM sondages", async (err, data) => {
                      try{
                          if(data!=undefined){
                              for (let i in data){
                                let r = await new Promise(async function(resolve2, reject2) {
                                  db.all("SELECT * FROM sondages_reponse WHERE id=?",[data[i].id], async (err, data2) => {
                                    resolve2(data2)
                                  })
                                })
                                if(r!=undefined){
                                  data[i].rep=r
                                }
                                msg.sondage.push(data[i])
                              }
                          }
                          resolve(msg)
                      }catch(e){console.error("fDB");;console.log('a13');;resolve(null)}
                    })
                }catch(e){console.error("fDB");;console.log('a14');;resolve(null)}
              })
          }catch(e){console.error("fDB");;console.log('a15');;resolve(null)}
      })
      setTimeout(reject,5000)
    })
  }
}