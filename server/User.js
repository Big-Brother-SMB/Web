const uuidG = require('uuid');
const rand = require("generate-key");

let db

module.exports = class User{
    static setDB(newdb){
      db=newdb;
    }

    constructor(uuid){
        this.uuid=uuid
    }

    static search(code_barre){
        return new Promise(function(resolve, reject) {
          try {
            db.get("SELECT * FROM users WHERE code_barre=?",[code_barre], (err, data) => {
                try{
                    if(data!=undefined){
                        resolve(new User(data.uuid))
                    }else{
                        resolve(null)
                    }
                }catch(e){console.error(e);console.log('d1');;resolve(null)}
            })
            setTimeout(reject,10000)
          } catch (e) {console.error(e);console.log('d2');}
        })
    }
      //user et  plus
    static createUser(email,picture){
        return new Promise(function(resolve, reject) {
          try{
            let uuid = uuidG.v4()
            db.get("SELECT * FROM 'users' where email=?",[email], (err, data) => {
                try{
                    if(data==undefined){
                        let emailT=email.split("@")
                        let tName=emailT[0].split(".")
                        let first_name=tName[0]
                        let last_name=""
                        if(tName.length>=2){
                            last_name=tName[1]
                        }
                        first_name=first_name[0].toUpperCase()+first_name.slice(1)
                        last_name=last_name.toUpperCase();
                        db.run("INSERT INTO users(email,uuid,first_name,last_name,admin,picture) VALUES(?,?,?,?,?,?)", [email,uuid,first_name,last_name,0,picture])
                    }else{
                        uuid=data.uuid
                        db.run("UPDATE users SET picture=? where email=?", [picture,email])
                    }
                    resolve(new User(uuid))
                }catch(e){console.error(e);console.log('d3');;resolve(null)}
            })
            setTimeout(reject,10000)
          } catch (e) {console.error(e);console.log('d4');}
        })
    }

    createToken(){
        let uuid=this.uuid
        return new Promise(function(resolve, reject) {
          try{
            let tokenAuth = rand.generateKey();
            let date = hashHour()
            db.run("INSERT INTO token(token,uuid,creation,last_use) VALUES(?,?,?,?)", [tokenAuth,uuid,date,date])
            resolve(tokenAuth)
          } catch (e) {console.error(e);console.log('d5');}
        })
      }
    static searchToken(token){
        return new Promise(function(resolve, reject) {
          try{
          db.get("SELECT uuid FROM token where token=?",[token], (err, data) => {
            try {
              if(data!=undefined){
                db.run("UPDATE token SET last_use=? where token=?",[hashHour(),token])
                resolve(new User(data.uuid))
              }else{
                resolve(new User(null))
              }
            }catch(e){console.error(e);console.log('d6');;resolve(null)}
          })
          setTimeout(reject,10000)
          } catch (e) {console.error(e);console.log('d7');}
        })
      }

    static listUsersName(){
        return new Promise(function(resolve, reject) {
          try{
            db.all("SELECT uuid,first_name,last_name FROM users ORDER BY first_name ASC, last_name ASC", (err, data) => {
                try{
                    if(data!=undefined){
                        resolve(data)
                    }else{
                        resolve([])
                    }
                }catch(e){console.error(e);console.log('d8');;resolve([])}
            })
            setTimeout(reject,10000)
          } catch (e) {console.error(e);console.log('d9');}
        })
    }

    static listUsersUuid(){
      return new Promise(function(resolve, reject) {
        try{
          db.all("SELECT uuid FROM users ORDER BY first_name ASC, last_name ASC", (err, data) => {
              try{
                  if(data!=undefined){
                      let list=[]
                      data.forEach(e=>{
                          list.push(new User(e.uuid))
                      })
                      resolve(list)
                  }else{
                      resolve([])
                  }
              }catch(e){console.error(e);console.log('d10');;resolve([])}
          })
          setTimeout(reject,10000)
        } catch (e) {console.error(e);console.log('d11');}
      })
    }

    static listUsersComplete(){
      return new Promise(function(resolve, reject) {
          db.all("SELECT * FROM users ORDER BY first_name ASC, last_name ASC", async (err, data) => {
              try{
                  if(data!=undefined){
                      for(let i in data){
                        data[i].groups = await (new User(data[i].uuid)).groups
                      }
                      resolve(data)
                  }else{
                      resolve([])
                  }
              }catch(e){console.error(e);console.log('d12');;resolve([])}
          })
          setTimeout(reject,10000)
      })
    }

    #getInfo(key){
        let uuid=this.uuid
        return new Promise(function(resolve, reject) {
            db.get("SELECT * FROM users where uuid=?",[uuid], (err, data) => {
                try{
                  if(data!=undefined){
                    resolve(data[key])
                  }else{
                    resolve(null)
                  }
                }catch(e){console.error(e);console.log('d13');;resolve(null)}
            })
            setTimeout(reject,10000)
        })
    }
    #setInfo(key,value){
      let uuid=this.uuid
        db.get("SELECT * FROM users where uuid=?",[uuid], (err, data) => {
            if(data!=undefined){
                db.run("UPDATE users SET "+ key +" = ? where uuid=?",[value,uuid])
            }
        })
    }

    get all(){
        let uuid = this.uuid
        let groups = this.groups
        return new Promise(function(resolve, reject) {
            db.get("SELECT * FROM users where uuid=?",[uuid], async (err, data) => {
                try{
                    if(data!=undefined){
                        data.groups = await groups
                        resolve(data)
                    }else{
                        resolve(null)
                    }
                }catch(e){console.error(e);console.log('d14');resolve(null)}
            })
            setTimeout(reject,10000)
        })
    }

    set all(args){
      db.run("UPDATE users SET first_name=?, last_name=?, code_barre=?, classe=?,admin=? WHERE uuid=?",[args.first_name,args.last_name,args.code_barre,args.classe,args.admin,this.uuid])
      this.groups=args.listGroups
    }

    get first_name()   {
        return this.#getInfo("first_name")
    }
    set first_name(value)   {
        this.#setInfo("first_name",value)
    }

    get last_name()   {
      return this.#getInfo("last_name")
    }
    set last_name(value)   {
        this.#setInfo("last_name",value)
    }

    get email()   {
      return this.#getInfo("email")
    }
    set email(value)   {
        this.#setInfo("email",value)
    }

    get code_barre()   {
      return this.#getInfo("code_barre")
    }
    set code_barre(value)   {
        this.#setInfo("code_barre",value)
    }

    get classe()   {
      return this.#getInfo("classe")
    }
    set classe(value)   {
        this.#setInfo("classe",value)
    }

    get tuto()   {
      return this.#getInfo("tuto")
    }
    set tuto(value)   {
        this.#setInfo("tuto",value)
    }

    get admin()   {
        return this.#getInfo("admin")
    }
    set admin(value)   {
        this.#setInfo("admin",value)
    }

    get amis(){
        let uuid=this.uuid
        return new Promise(function(resolve, reject) {
            db.all("SELECT * FROM amis WHERE uuid=?",[uuid], async (err, data) => {
                try{
                    if(data!=undefined){
                        let list=[]
                        await data.forEach(async e=>{
                            list.push(new Promise(function(resolve, reject) {
                              db.get("SELECT * FROM amis WHERE uuid=? and ami=?",[e.ami,uuid], (err, data2) => {
                                if(data2!=undefined){
                                  resolve({uuid:e.ami,IgiveProc:e.procuration,HeGiveMeProc:data2.procuration})
                                }else{
                                  resolve({uuid:e.ami,IgiveProc:e.procuration,HeGiveMeProc:null})
                                }
                              })
                            }))
                        })
                        resolve(await Promise.all(list))
                    }else{
                        resolve([])
                    }
                }catch(e){console.error(e);console.log('d15');;resolve([])}
            })
            setTimeout(reject,10000)
        })
    }
    set amis(list){
        let uuid=this.uuid
        db.serialize(()=>{
          db.run("delete from amis WHERE uuid=?",[uuid])
          list.forEach(e=>{
              db.run("INSERT INTO amis(uuid,ami,procuration) VALUES (?,?,?)",[uuid,e.uuid,e.IgiveProc])
          })
        })
    }

    get groups(){
        let uuid=this.uuid
        return new Promise(function(resolve, reject) {
            db.all("SELECT * FROM user_groups where uuid=?",[uuid], (err, data) => {
                try{
                    if(data!=undefined){
                        let list=[]
                        data.forEach(e=>{
                            list.push(e.group2)
                        })
                        resolve(list)
                    }else{
                        resolve([])
                    }
                }catch(e){console.error(e);console.log('d16');;resolve([])}
            })
            setTimeout(reject,10000)
        })
    }
    set groups(list){
        let uuid=this.uuid
        db.serialize(()=>{
            db.run("delete from user_groups where uuid=?",[uuid])
            list.forEach(e=>{
                db.run("INSERT INTO user_groups(uuid,group2) VALUES (?,?)",[uuid,e])
            })
        })
    }
    //demandes
    getMidiDemande(semaine,creneau){
      let uuid = this.uuid
      return new Promise(function(resolve, reject) {
        db.get("SELECT * FROM midi_list WHERE semaine=? and creneau=? and uuid=?",[semaine,creneau,uuid], (err, data) => {
          try {
            if(data!=undefined){
              db.all("SELECT * FROM midi_amis WHERE semaine=? and creneau=? and uuid=?",[semaine,creneau,uuid], (err, data2) => {
                let list=[]
                if(data!=undefined){
                  data2.forEach(e=>{
                    list.push(e.amis)
                  })
                }
                data["amis"]=list
                resolve(data)
              })
            }else{
              resolve({})
            }
          }catch(e){console.error(e);console.log('d17');;resolve({})}
        })
        setTimeout(reject,10000)
      })
    }
    setMidiDemande(semaine,creneau,amis,DorI,scan,sandwich){
      let uuid = this.uuid
      db.get("SELECT * FROM midi_list where semaine=? and creneau=? and uuid=?",[semaine,creneau,uuid], (err, data) => {
        if(data==undefined){
          db.run("INSERT INTO midi_list(semaine,creneau,uuid,scan,DorI,sandwich) VALUES (?,?,?,?,?,?)",[semaine,creneau,uuid,scan,DorI,sandwich])
        } else{
          if(sandwich==null)sandwich=data.sandwich
          db.run("UPDATE midi_list SET scan=?,DorI=?,sandwich=? where semaine=? and creneau=? and uuid=?",[scan,DorI,sandwich,semaine,creneau,uuid])
        }
      })
      db.serialize(()=>{
        db.run("delete from midi_amis WHERE semaine=? and creneau=? and uuid=?",[semaine,creneau,uuid])
        if(typeof amis == 'object'){
          amis.forEach(e=>{
            db.run("INSERT INTO midi_amis(semaine,creneau,uuid,amis) VALUES (?,?,?,?)",[semaine,creneau,uuid,e])
          })
        }
      })
    }
    delMidiDemande(semaine,creneau){
      let uuid = this.uuid
      db.run("delete from midi_list where semaine=? and creneau=? and uuid=?",[semaine,creneau,uuid])
      db.serialize(()=>{
        db.run("delete from midi_amis WHERE semaine=? and creneau=? and uuid=?",[semaine,creneau,uuid])
      })
    }

    //perm
    getPermDemande(semaine,day,creneau){
      let uuid = this.uuid
      return new Promise(function(resolve, reject) {
        db.get("SELECT * FROM perm_list WHERE semaine=? and day=? and creneau=? and uuid=? and DorI=false",[semaine,day,creneau,uuid], (err, data) => {
          try {
            if(data!=undefined){
              resolve(data)
            }else{
              resolve({})
            }
          }catch(e){console.error(e);console.log('d18');;resolve({})}
        })
        setTimeout(reject,10000)
      })
    }
    setPermDemande(semaine,day,creneau,group,nb){
      let uuid = this.uuid
      db.get("SELECT * FROM perm_list where semaine=? and day=? and creneau=? and uuid=? and DorI=false",[semaine,day,creneau,uuid], (err, data) => {
        if(data==undefined){
          db.run("INSERT INTO perm_list(semaine,day,creneau,uuid,group2,nb,DorI) VALUES (?,?,?,?,?,?,false)",[semaine,day,creneau,uuid,group,nb])
        } else{
          db.run("UPDATE perm_list SET group2=?,nb=? where semaine=? and day=? and creneau=? and uuid=? and DorI=false",[group,nb,semaine,day,creneau,uuid])
        }
      })
    }
    delPermDemande(semaine,day,creneau){
      let uuid = this.uuid
      db.run("delete from perm_list where semaine=? and day=? and creneau=? and uuid=? and DorI=false",[semaine,day,creneau,uuid])
    }

    //point
    addPersonalPoint(date,name,value){
        db.run("INSERT INTO point_perso(uuid,date,name,value) VALUES (?,?,?,?)",[this.uuid,date,name,value])
    }
    delPersonalPoint(date){
        db.run("delete from point_perso where uuid=? and date=?",[this.uuid,date])
    }
    get listPoint(){
      let uuid=this.uuid
      let moi = this
      return new Promise(function(resolve, reject) {
        let lists={perso:[],global:[],midi:[]}
        db.all("SELECT * FROM point_perso WHERE uuid=?",[uuid], (err, data) => {
            try{
                if(data!=undefined){
                    data.forEach(e=>{
                        lists.perso.push(e)
                    }) 
                }
                db.all("SELECT * FROM point_global", (err, data) => {
                  try{
                      if(data!=undefined){
                          data.forEach(e=>{
                            lists.global.push(e)
                          })
                      }
                      db.all("SELECT * FROM midi_list WHERE uuid=? and DorI=True",[uuid], async (err, data) => {
                        try{
                            if(data!=undefined){
                              for (let i in data){
                                let r = await new Promise(async function(resolve2, reject2) {
                                  let info=await getMidiInfo(data[i].semaine,data[i].creneau)
                                    if(info.gratuit_prio){
                                      let groups = await moi.groups
                                      let classe = await moi.classe
                                      if(info.prio.indexOf(classe)!=-1){
                                        info.cout
                                      }
                                      groups.forEach(e=>{
                                        if(info.prio.indexOf(e)!=-1){
                                          info.cout=0
                                        }
                                      })
                                      resolve2(info)
                                    }else{
                                      resolve2(info)
                                    }
                                })
                                if(r!=undefined)
                                  lists.midi.push(r)
                              }
                            }
                            resolve(lists)
                        }catch(e){console.error(e);console.log('d19');;resolve([])}
                      })
                  }catch(e){console.error(e);console.log('d20');;resolve([])}
                })
            }catch(e){console.error(e);console.log('d21');;resolve([])}
        })
        setTimeout(reject,10000)
      })
    }
    get score(){
      let uuid=this.uuid
      let moi = this
      return new Promise(function(resolve, reject) {
        let score=0
        db.all("SELECT * FROM point_perso WHERE uuid=?",[uuid], (err, data) => {
            try{
                if(data!=undefined){
                    data.forEach(e=>{
                        score+=e.value
                    })
                }
                db.all("SELECT * FROM point_global", (err, data) => {
                  try{
                      if(data!=undefined){
                          data.forEach(e=>{
                              score+=e.value
                          })
                      }
                      db.all("SELECT * FROM midi_list WHERE uuid=? and DorI=True",[uuid], async (err, data) => {
                        try{
                            if(data!=undefined){
                                for (let i in data){
                                  let r = await new Promise(async function(resolve2, reject2) {
                                    let info=await getMidiInfo(data[i].semaine,data[i].creneau)
                                    if(info.gratuit_prio){
                                      let groups = await moi.groups
                                      let classe = await moi.classe
                                      if(info.prio.indexOf(classe)!=-1){
                                        resolve2(undefined)
                                      }
                                      groups.forEach(e=>{
                                        if(info.prio.indexOf(e)!=-1){
                                          resolve2(undefined)
                                        }
                                      })
                                      resolve2(info)
                                    }else{
                                      resolve2(info)
                                    }
                                  })
                                  if(r!=undefined){
                                    score-=r.cout
                                  }
                                }
                            }
                            resolve(score)
                        }catch(e){console.error(e);console.log('d22');;resolve(null)}
                      })
                  }catch(e){console.error(e);console.log('d23');;resolve(null)}
                })
            }catch(e){console.error(e);console.log('d24');;resolve(null)}
        })
        setTimeout(reject,10000)
      })
    }

    //messagerie
    getAllMessages(){
      let uuid=this.uuid
      return new Promise(function(resolve, reject) {
        let msg = {mp:[],news:[],sondage:[]}
        db.all("SELECT * FROM messages WHERE from2=? or to2=?",[uuid,uuid], (err, data) => {
            try{
                if(data!=undefined){
                    msg.mp=data
                }
                db.all("SELECT * FROM news", async (err, data) => {
                  try{
                      if(data!=undefined){
                        for (let i in data){
                          let r = await new Promise(async function(resolve2, reject2) {
                            db.get("SELECT * FROM news_lu WHERE id=? and user=?",[data[i].id,uuid], async (err, data2) => {
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
                                    db.get("SELECT * FROM sondages_reponse WHERE id=? and user=?",[data[i].id,uuid], async (err, data2) => {
                                      resolve2(data2)
                                    })
                                  })
                                  if(r!=undefined){
                                    data[i].rep=r.reponse
                                  }
                                  msg.sondage.push(data[i])
                                }
                            }
                            resolve(msg)
                        }catch(e){console.error(e);console.log('d25');;resolve(null)}
                      })
                  }catch(e){console.error(e);console.log('d26');;resolve(null)}
                })
            }catch(e){console.error(e);console.log('d27');;resolve(null)}
        })
        setTimeout(reject,10000)
      })
    }

    messageLu(id){
      let uuid =this.uuid
      db.run("UPDATE messages SET lu=true WHERE id=? and to2=?",[id,uuid])
      db.get("SELECT * FROM news_lu WHERE id=? and user=?",[id,uuid], (err, data) => {
        if(data!=undefined){
          db.run("UPDATE news_lu SET lu=true WHERE id=? and user=?",[id,uuid])
        }else{
          db.run("INSERT INTO news_lu(lu,id,user) VALUES (true,?,?)",[id,uuid])
        }
      })
    }

    sondage_reponse(id,rep){
      let uuid = this.uuid
      db.get("SELECT * FROM sondages_reponse WHERE id=? and user=?",[id,uuid], (err, data) => {
        if(data!=undefined){
          db.run("UPDATE sondages_reponse SET reponse=? WHERE id=? and user=?",[rep,id,uuid])
        }else{
          db.run("INSERT INTO sondages_reponse(reponse,id,user) VALUES (?,?,?)",[rep,id,uuid])
        }
      })
    }
}


function hashHour(){
    let d =  new Date()
    return d.getFullYear()
    + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
    + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
    + " " + (String(d.getHours()).length == 1?"0":"") + d.getHours()
    + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes()
    + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
  }