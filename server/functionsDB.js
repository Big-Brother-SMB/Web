let db

module.exports = class funcDB{
  static setDB(newdb){
    db=newdb;
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
        }catch(e){console.error(e);console.log('a1');;resolve(null)}
        setTimeout(reject,10000)
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
        }catch(e){console.error(e);console.log('a2');;resolve(null)}
      })
      setTimeout(reject,10000)
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
        }catch(e){console.error(e);console.log('a3');;resolve([])}
      })
      setTimeout(reject,10000)
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
        }catch(e){console.error(e);console.log('a4');;resolve({})}
      })
      setTimeout(reject,10000)
    })
  }
  static setMidiMenu(semaine,menu){
    db.get("SELECT * FROM midi_menu where semaine=?",[semaine], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO midi_menu(menu,semaine) VALUES (?,?)",[menu,semaine])
      } else{
        db.run("UPDATE midi_menu SET menu=? where semaine=?",[menu,semaine])
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
            resolve({prio:[]})
          }
        }catch(e){console.error(e);console.log('a5');;resolve({prio:[]})}
      })
      setTimeout(reject,10000)
    })
  }
  static setMidiInfo(semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio){
    db.get("SELECT * FROM midi_info where semaine=? and creneau=?",[semaine,creneau], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO midi_info(semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,prio_mode) VALUES (?,?,?,?,?,?,?,?)",[semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,prio_mode])
      } else{
        db.run("UPDATE midi_info SET cout=?,gratuit_prio=?,ouvert=?,perMin=?,places=?,prio_mode=? where semaine=? and creneau=?",[cout,gratuit_prio,ouvert,perMin,places,prio_mode,semaine,creneau])
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
        }catch(e){console.error(e);console.log('a6');;resolve([])}
      })
      setTimeout(reject,10000)
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
    let uuid=this.uuid
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
        }catch(e){console.error(e);console.log('a7');;resolve([])}
      })
      setTimeout(reject,10000)
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
        }catch(e){console.error(e);console.log('a8');;resolve([])}
      })
      setTimeout(reject,10000)
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
        }catch(e){console.error(e);console.log('a9');;resolve(null)}
      })
      setTimeout(reject,10000)
    })
  }
  static setClasse(list){
    db.serialize(()=>{
      db.run("delete from classe_list")
      list.forEach(e=>{
        db.run("INSERT INTO classe_list(classe,niveau) VALUES (?,?)",[e[0],e[1]])
      })
    })
  }

  
  //% messages / news / sondages

  static addSondage(from,texte,title,date,mode,choix){
    let id=uuidG.v4()
    db.run("INSERT INTO sondages(id,from2,texte,title,date,mode,choix) VALUES (?,?,?,?,?,?,?)",[id,from,texte,title,date,mode,choix])
    return id
  }
  static setSondage(id,from,texte,title,date,mode,choix){
    db.run("UPDATE sondages SET from2=?,texte=?,title=?,date=?,mode=?,choix=? WHERE id=?",[from,texte,title,date,mode,choix,id])
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
        }catch(e){console.error(e);console.log('a10');;resolve(null)}
      })
      setTimeout(reject,10000)
    })
  }
  static delSondage(id){
    db.run("delete from sondages WHERE id=?",[id])
    db.run("delete from sondages_reponse WHERE id=?",[id])
  }









  static addNews(from,texte,title,date){
    let id=uuidG.v4()
    db.run("INSERT INTO news(id,from2,texte,title,date) VALUES (?,?,?,?,?)",[id,from,texte,title,date])
    return id
  }
  static setNews(id,from,texte,title,date){
    db.run("UPDATE news SET from2=?,texte=?,title=?,date=? WHERE id=?",[from,texte,title,date,id])
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
        }catch(e){console.error(e);console.log('a11');;resolve(null)}
      })
      setTimeout(reject,10000)
    })
  }
  static delNews(id){
    db.run("delete from news WHERE id=?",[id])
    db.run("delete from news_lu WHERE id=?",[id])
  }

  static addMessage(from,to,lu,texte,title,date){
    let id=uuidG.v4()
    db.run("INSERT INTO messages(id,from2,to2,lu,texte,title,date) VALUES (?,?,?,?,?,?,?)",[id,from,to,lu,texte,title,date])
    return id
  }
  static setMessage(id,from,to,lu,texte,title,date){
    db.run("UPDATE messages SET from2=?,to2=?,lu=?,texte=?,title=?,date=? WHERE id=?",[from,to,lu,texte,title,date,id])
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
        }catch(e){console.error(e);console.log('a12');;resolve(null)}
      })
      setTimeout(reject,10000)
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
                      }catch(e){console.error(e);console.log('a13');;resolve(null)}
                    })
                }catch(e){console.error(e);console.log('a14');;resolve(null)}
              })
          }catch(e){console.error(e);console.log('a15');;resolve(null)}
      })
      setTimeout(reject,10000)
    })
  }
}