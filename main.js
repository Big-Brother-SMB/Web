/*
npm i @google-cloud/local-auth
npm i date-and-time
npm i express
npm i generate-key
npm i googleapis
npm i npm
npm i path
npm i socket.io
npm i sqlite3
npm i url
npm i uuid
npm i pino
*/

/*const { WebSocketServer } = require('ws');

const server2 = new WebSocketServer({ port: 3001 });

server2.on("connection", (socket) => {
  function loopT(){
    socket.send(JSON.stringify({
      type: "bonjour du client",
      content: [ 3, "4" ],
      info: 'cc'
    }));
    setTimeout(loopT,5000)
  }
  loopT()
});*/

const pino = require('pino');
const transport = {
  targets: [
    {
      level: 'trace',
      target: 'pino/file',
      options: { destination: './main.log' } // On enregistre les logs dans un fichier main.log
    }
  ]
}
 
const logger = pino({
  level: 'trace',
  transport
})

console.log("start")


const http = require('http');
const https = require('https');
const url = require('url');
const uuidG = require('uuid');
const sqlite3 = require('sqlite3')
const { google, chat_v1 } = require('googleapis');
const { Server } = require("socket.io");
const fs = require('fs');
const rand = require("generate-key");
const dateTime = require('date-and-time');
const { firestore } = require('googleapis/build/src/apis/firestore');
const path = require('path');
const { setgroups } = require('process');

const jsonObj = JSON.parse(fs.readFileSync(__dirname+"/code.json"));
let address = jsonObj.address
const oauth2Client = new google.auth.OAuth2(
  jsonObj.client_id,
  jsonObj.code_secret,
  address+"oauth2callback"
);



let mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.eot': 'appliaction/vnd.ms-fontobject',
  '.ttf': 'aplication/font-sfnt'
};


const authorizationUrl = oauth2Client.generateAuthUrl({
  scope: ["https://www.googleapis.com/auth/userinfo.email","openid"],
  include_granted_scopes: true
});

let server

let db

class User{
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
                }catch(e){console.error(e);resolve(null)}
            })
            setTimeout(reject,1000)
          } catch (e) {console.error(e)}
        })
    }
      //user et  plus
    static createUser(email){
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
                        db.run("INSERT INTO users(email,uuid,first_name,last_name,admin) VALUES(?,?,?,?,?)", [email,uuid,first_name,last_name,0])
                    }else{
                        uuid=data.uuid
                    }
                    resolve(new User(uuid))
                }catch(e){console.error(e);resolve(null)}
            })
            setTimeout(reject,1000)
          } catch (e) {console.error(e)}
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
          } catch (e) {console.error(e)}
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
            }catch(e){console.error(e);resolve(null)}
          })
          setTimeout(reject,1000)
          } catch (e) {console.error(e)}
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
                }catch(e){console.error(e);resolve([])}
            })
            setTimeout(reject,1000)
          } catch (e) {console.error(e)}
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
              }catch(e){console.error(e);resolve([])}
          })
          setTimeout(reject,1000)
        } catch (e) {console.error(e)}
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
              }catch(e){console.error(e);resolve([])}
          })
          setTimeout(reject,1000)
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
                }catch(e){console.error(e);resolve(null)}
            })
            setTimeout(reject,1000)
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
                }catch(e){console.error(e);resolve(null)}
            })
            setTimeout(reject,1000)
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
            db.all("SELECT * FROM amis WHERE uuid=?",[uuid], (err, data) => {
                try{
                    if(data!=undefined){
                        let list=[]
                        data.forEach(e=>{
                            list.push(e.ami)
                        })
                        resolve(list)
                    }else{
                        resolve([])
                    }
                }catch(e){console.error(e);resolve([])}
            })
            setTimeout(reject,1000)
        })
    }
    set amis(list){
        let uuid=this.uuid
        db.serialize(()=>{
          db.run("delete from amis WHERE uuid=?",[uuid])
          list.forEach(e=>{
              db.run("INSERT INTO amis(uuid,ami) VALUES (?,?)",[uuid,e])
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
                }catch(e){console.error(e);resolve([])}
            })
            setTimeout(reject,1000)
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
          }catch(e){console.error(e);resolve({})}
        })
        setTimeout(reject,1000)
      })
    }
    setMidiDemande(semaine,creneau,amis,DorI,scan){
      let uuid = this.uuid
      db.get("SELECT * FROM midi_list where semaine=? and creneau=? and uuid=?",[semaine,creneau,uuid], (err, data) => {
        if(data==undefined){
          db.run("INSERT INTO midi_list(semaine,creneau,uuid,scan,DorI) VALUES (?,?,?,?,?)",[semaine,creneau,uuid,scan,DorI])
        } else{
          db.run("UPDATE midi_list SET scan=?,DorI=? where semaine=? and creneau=? and uuid=?",[scan,DorI,semaine,creneau,uuid])
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
          }catch(e){console.error(e);resolve({})}
        })
        setTimeout(reject,1000)
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
        console.log(date)
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
                        }catch(e){console.error(e);resolve([])}
                      })
                  }catch(e){console.error(e);resolve([])}
                })
            }catch(e){console.error(e);resolve([])}
        })
        setTimeout(reject,1000)
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
                        }catch(e){console.error(e);resolve(null)}
                      })
                  }catch(e){console.error(e);resolve(null)}
                })
            }catch(e){console.error(e);resolve(null)}
        })
        setTimeout(reject,1000)
      })
    }
}


//var
function getVar(key){
    return new Promise(function(resolve, reject) {
        try{
            db.get("SELECT value FROM 'var' where key=?",[key], (err, data) => {
            if(data!=undefined){
                resolve(data.value)
            }else{
                resolve(null)
            }
            })
        }catch(e){console.error(e);resolve(null)}
        setTimeout(reject,1000)
    })
}
function setVar(key,value){
    db.get("SELECT * FROM var where key=?",[key], (err, data) => {
        if(data==undefined){
            db.run("INSERT INTO var(key,value) VALUES (?,?)",[key,value])
        } else{
            db.run("UPDATE var SET value=? WHERE key=?",[value,key])
        }
    })
}



  //perm
  function getPermOuvert(semaine,day,creneau){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM perm_info where semaine=? and day=? and creneau=?",[semaine,day,creneau], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data.ouvert)
          }else{
            resolve(null)
          }
        }catch(e){console.error(e);resolve(null)}
      })
      setTimeout(reject,1000)
    })
  }
  function setPermOuvert(semaine,day,creneau,ouvert){
    db.get("SELECT * FROM 'perm_info' where semaine=? and day=? and creneau=?",[semaine,day,creneau], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO perm_info(ouvert,semaine,day,creneau) VALUES (?,?,?,?)",[ouvert,semaine,day,creneau])
      } else{
        db.run("UPDATE perm_info SET ouvert=? where semaine=? and day=? and creneau=?",[ouvert,semaine,day,creneau])
      }
    })
  }
  function listPermDemandes(semaine,day,creneau){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM perm_list WHERE semaine=? and day=? and creneau=?",[semaine,day,creneau], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error(e);resolve([])}
      })
      setTimeout(reject,1000)
    })
  }
  function setPermInscrit(semaine,day,creneau,groups){
    db.run("delete from perm_list where semaine=? and day=? and creneau=? and DorI=true",[semaine,day,creneau])
    groups.forEach(g=>{
      db.run("INSERT INTO perm_list(semaine,day,creneau,group2,DorI) VALUES (?,?,?,?,true)",[semaine,day,creneau,g])
    })
  }
  
  
  //midi
  function getMidiMenu(semaine){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM midi_menu where semaine=?",[semaine], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve({})
          }
        }catch(e){console.error(e);resolve({})}
      })
      setTimeout(reject,1000)
    })
  }
  function setMidiMenu(semaine,menu){
    db.get("SELECT * FROM midi_menu where semaine=?",[semaine], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO midi_menu(menu,semaine) VALUES (?,?)",[menu,semaine])
      } else{
        db.run("UPDATE midi_menu SET menu=? where semaine=?",[menu,semaine])
      }
    })
  }
  function getMidiInfo(semaine,creneau){
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
        }catch(e){console.error(e);resolve({prio:[]})}
      })
      setTimeout(reject,1000)
    })
  }
  function setMidiInfo(semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio,list_prio){
    db.get("SELECT * FROM midi_info where semaine=? and creneau=?",[semaine,creneau], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO midi_info(semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio) VALUES (?,?,?,?,?,?,?,?)",[semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio])
      } else{
        db.run("UPDATE midi_info SET cout=?,gratuit_prio=?,ouvert=?,perMin=?,places=?,unique_prio=? where semaine=? and creneau=?",[cout,gratuit_prio,ouvert,perMin,places,unique_prio,semaine,creneau])
      }
    })
    db.serialize(()=>{
      db.run("delete from midi_prio WHERE semaine=? and creneau=?",[semaine,creneau])
      list_prio.forEach(e=>{
        db.run("INSERT INTO midi_prio(semaine,creneau,group2) VALUES (?,?,?)",[semaine,creneau,e])
      })
    })
  }
  function listMidiDemandes(semaine,creneau){
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
        }catch(e){console.error(e);resolve([])}
      })
      setTimeout(reject,1000)
    })
  }
  
  
  //point
  function addGlobalPoint(date,name,value){
    db.run("INSERT INTO point_global(date,name,value) VALUES (?,?,?)",[date,name,value])
  }
  function delGlobalPoint(date){
    db.run("delete from point_global where date=?",[date])
  }
  function listGlobalPoint(){
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
        }catch(e){console.error(e);resolve([])}
      })
      setTimeout(reject,1000)
    })
  }
  
  
  //group / classe
  function getGroup(){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM group_list", (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve([])
          }
        }catch(e){console.error(e);resolve([])}
      })
      setTimeout(reject,1000)
    })
  }
  function setGroup(list){
    db.serialize(()=>{
      db.run("delete from group_list")
      list.forEach(e=>{
        db.run("INSERT INTO group_list(group2) VALUES (?)",[e])
      })
    })
  }
  function getClasse(){
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM classe_list", (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error(e);resolve(null)}
      })
      setTimeout(reject,1000)
    })
  }
  function setClasse(list){
    db.serialize(()=>{
      db.run("delete from classe_list")
      list.forEach(e=>{
        db.run("INSERT INTO classe_list(classe,niveau) VALUES (?,?)",[e[0],e[1]])
      })
    })
  }

  
 
  function addMessage(deAdmin,uuid,lu,text,title,type,date){
  
  }
  function luMessage(date){
  
  }
//% messages / news / sondages 


function hashHour(){
  let d =  new Date()
  return d.getFullYear()
  + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
  + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
  + " " + (String(d.getHours()).length == 1?"0":"") + d.getHours()
  + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes()
  + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
}



class UserSelect{
  static usersList = []

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
        usersList2.prio = true
      }
    }
    this.usersList = usersList2

    //active l'option prioritaire uniquement
    //refuse les non prio
    if(info.unique_prio){
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

    
    //%prioVar
    let prioVar=true
    if(prioVar){
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
    return "fini, " + (inscrits - dejaInscrits) + " inscriptions<br>il reste " + (places - inscrits) + " places<br>appuyer pour reload"
  }


  static boucleInscription(inscrits,places){
        //vérifie qu'il reste des places
        while(inscrits<places){
          //teste les utilisateurs avec en commensant par ceux avec le plus gros scores
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
              //% il faut enlevé les amis deja inscrit
              if(testScore && this.usersList[i].amisEloigner.length+1+inscrits<=places){
                //inscrit l'utilisateur et les amis
                inscrits += this.usersList[i].amisEloigner.length+1
                this.usersList[i].pass=1
                this.usersList[i].amisEloigner.forEach(a=>{
                  UserSelect.searchAmi(a).pass=1
                })
                //recommence à tester depuis le début de la liste quand des inscriptions ont eu lieu
                break;
              }
            }
          }
          break;
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

async function main() {
  db = new sqlite3.Database('main.db', err => {
    if (err)
      throw err
    db.serialize(()=>{
      //var
      db.get("SELECT * FROM sqlite_master where type='table' AND name='var'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE var(key text, value text)')
      })

      //users / amis / user-group / token
      db.get("SELECT * FROM sqlite_master where type='table' AND name='users'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE users(uuid UUID, first_name text, last_name text, email text, code_barre CHAR[5], classe text, tuto boolean,admin int2)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='amis'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE amis(uuid uuid,ami uuid)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='user_groups'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE user_groups(uuid uuid,group2 text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='token'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE token(token text,uuid UUID,creation text,last_use text)')
      })

      //perm
      db.get("SELECT * FROM sqlite_master where type='table' AND name='perm_info'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE perm_info(semaine int2,day int2,creneau int2,ouvert int2)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='perm_list'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE perm_list(semaine int2,day int2,creneau int2,uuid uuid,group2 text,nb int2,DorI boolean)')
      })

      //midi
      db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_info'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE midi_info(semaine int2,creneau int2,cout float4,gratuit_prio boolean,ouvert int2,perMin int2,places int2,unique_prio boolean)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_menu'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE midi_menu(semaine int2,menu text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_list'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE midi_list(semaine int2,creneau int2,uuid uuid,scan boolean,DorI boolean)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_prio'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE midi_prio(semaine int2,creneau int2,group2 text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_amis'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE midi_amis(semaine int2,creneau int2,uuid uuid,amis uuid)')
      })

      //point
      db.get("SELECT * FROM sqlite_master where type='table' AND name='point_global'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE point_global(name text,value float4,date text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='point_perso'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE point_perso(uuid uuid,name value,value float4,date text)')
      })

      //group / classe
      db.get("SELECT * FROM sqlite_master where type='table' AND name='classe_list'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE classe_list(classe text,niveau int2)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='group_list'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE group_list(group2 text)')
      })

      //messages / news / sondage
      db.get("SELECT * FROM sqlite_master where type='table' AND name='messages'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE messages(id uuid,deAdmin boolean,uuid uuid,lu boolean,texte text,title text,type text,date text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='news'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE news(id uuid,texte text,title text,date text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='news_lu'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE news_lu(id uuid,uuid uuid,lu boolean)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='sondages'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE sondages(texte text,title text,date text,mode int2)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='sondages_reponse'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE sondages_reponse(id uuid,uuid uuid,reponse text)')
      })
    })
  })


  server = http.createServer(async function (req, res) {
    if (req.url == '/') {
      res.writeHead(301, { "Location": authorizationUrl });
      res.end();
    } else if (req.url.startsWith('/oauth2callback')) {
      let q = url.parse(req.url, true).query;
      if (q.error || q.code===undefined) {
        console.log('Error:' + q.error);
      } else {
        try {
          let { tokens } = await oauth2Client.getToken(q.code);
          oauth2Client.setCredentials(tokens);
          var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
          });
          
          let {data} = await oauth2.userinfo.get();
          console.log("email",data.email)
          if(true){//%if(data.email.split("@")[1]=="stemariebeaucamps.fr"){
            let tokenAuth = await (await User.createUser(data.email)).createToken()
            res.writeHead(301, { "Location" : address+"index.html?token=" + tokenAuth});
            res.end();
            //fs.readFileSync(__dirname+"/test.html")          
          } else {
            res.writeHead(301, { "Location" : address+"index.html?err=Il faut une adresse email stemariebeaucamps.fr"});
            res.end();
          }
        } catch (error) {
          console.error(error);
          res.writeHead(301, { "Location" : address+"index.html?err=Erreur inconnue"});
          res.end();
        }
      }
    } else {
      let pathName = url.parse(req.url).path.split('?')[0];
      if(pathName === '/'){
        pathName = '/index.html';
      }
      pathName = pathName.substring(1, pathName.length);
      let extName = path.extname(pathName);
      let staticFiles = `${__dirname}/public/${pathName}`;
      
      try{
        if(extName =='.jpg' || extName == '.png' || extName == '.ico' || extName == '.eot' || extName == '.ttf' || extName == '.svg' || extName == '.gif'){
          let file = fs.readFileSync(staticFiles);
          res.writeHead(200, {'Content-Type': mimeTypes[extName]});
          res.write(file, 'binary');
          res.end();
        }else {
          fs.readFile(staticFiles, 'utf8', function (err, data) {
            try{
              if(!err){
                res.writeHead(200, {'Content-Type': mimeTypes[extName]});
                res.end(data);
              }else {
                res.writeHead(200);
                res.end(fs.readFileSync(`${__dirname}/public/404.html`));
              }
              res.end();
            }catch(e){console.error(e)}
          });
        }
      }catch(e){console.error(e)}
    }

  }).listen(3000);



  io = new Server(server/*,{cors: {
    origin: address,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }}*/)
  io.of("/admin").on("connection", async (socket) => {
    let user = await User.searchToken(socket.handshake.auth.token)
    console.log("uuid admin socket: " + await user.uuid)

    if(await user.admin>0){
      socket.on('my_admin_mode',async msg => {
        try{
          user.admin = msg
          socket.emit('my_admin_mode',"ok")
        }catch(e){console.error(e)}
      })
      socket.on('add_global_point',async msg => {
        try{
          addGlobalPoint(msg[0],msg[1],msg[2])
          socket.emit('add_global_point',"ok")
        }catch(e){console.error(e)}
      })
      socket.on('add_perso_point',async msg => {
        try{
          let user = new User(msg[0])
          user.addPersonalPoint(msg[1],msg[2],msg[3])
          socket.emit('add_perso_point',"ok")
        }catch(e){console.error(e)}
      })
      socket.on('get_global_point',async msg => {
        try{
          socket.emit('get_global_point',await listGlobalPoint())
        }catch(e){console.error(e)}
      })
      socket.on('set_banderole',async msg => {
        try{
          setVar("banderole",msg)
          socket.emit('set_banderole',"ok")
        }catch(e){console.error(e)}
      })
      socket.on('set_menu',async msg => {
        try{
          setMidiMenu(msg[0],msg[1])
          socket.emit('set_menu',"ok")
        }catch(e){console.error(e)}
      })
      socket.on('setMidiInfo',async msg => {
        try{
          //semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio,list_prio
          setMidiInfo(msg[0],msg[1]*2+msg[2],msg[3],msg[4],msg[5],msg[6],msg[7],msg[8],msg[9])
          socket.emit('setMidiInfo',"ok")
        }catch(e){console.error(e)}
      })
      socket.on('list group/classe',async msg => {
        try{
          socket.emit('list group/classe',[await getGroup(),await getClasse()])
        }catch(e){console.error(e)}
      })
      socket.on('list pass',async msg => {
        try{
          socket.emit('list pass',await User.listUsersComplete())
        }catch(e){console.error(e)}
      })
      socket.on('scan',async msg => {
        try{
          let user = new User(msg[3])
          let info = await user.getMidiDemande(msg[0],msg[1]*2+msg[2])
          await user.setMidiDemande(msg[0],msg[1]*2+msg[2],info.amis,info.DorI,msg[4])
          socket.emit('scan','ok')
        }catch(e){console.error(e)}
      })
      socket.on('set DorI',async msg => {
        try{
          let user = new User(msg[3])
          let info = await user.getMidiDemande(msg[0],msg[1]*2+msg[2])
          await user.setMidiDemande(msg[0],msg[1]*2+msg[2],info.amis,msg[4],info.scan)
          socket.emit('set DorI','ok')
        }catch(e){console.error(e)}
      })
      socket.on('del DorI',async msg => {
        try{
          let user = new User(msg[3])
          await user.delMidiDemande(msg[0],msg[1]*2+msg[2])
          socket.emit('del DorI','ok')
        }catch(e){console.error(e)}
      })
      socket.on('set perm ouvert',async msg => {
        try{
          await setPermOuvert(msg[0],msg[1],msg[2],msg[3])
          socket.emit('set perm ouvert','ok')
        }catch(e){console.error(e)}
      })
      socket.on('del perm demande',async msg => {
        try{
          await (new User(msg[3])).delPermDemande(msg[0],msg[1],msg[2])
          socket.emit('del perm demande','ok')
        }catch(e){console.error(e)}
      })
      socket.on('set perm inscrit',async msg => {
        try{
          await setPermInscrit(msg[0],msg[1],msg[2],msg[3])
          socket.emit('set perm inscrit','ok')
        }catch(e){console.error(e)}
      })
      socket.on('algo',async msg => {
        try{
          let rep = await UserSelect.algoDeSelection(msg[0],msg[1]*2+msg[2])
          socket.emit('algo',rep)
        }catch(e){console.error(e)}
      })
      socket.on('set user',async msg => {
        try{
          let user = new User(msg.uuid)
          user.all=msg
          socket.emit('set user','ok')
        }catch(e){console.error(e)}
      })
      socket.on('get score list',async msg => {
        try{
          let user = new User(msg)
          socket.emit('get score list',await user.listPoint)
        }catch(e){console.error(e)}
      })
      socket.on('del_perso_point',async msg => {
        try{
          let user = new User(msg[0])
          user.delPersonalPoint(msg[1])
          socket.emit('del_perso_point','ok')
        }catch(e){console.error(e)}
      })
      socket.on('del_global_point',async msg => {
        try{
          delGlobalPoint(msg)
          socket.emit('del_global_point','ok')
        }catch(e){console.error(e)}
      })
    }
  })
  io.on("connection", async (socket) => {
    try {
      let user = await User.searchToken(socket.handshake.auth.token)
      if(user!=null)console.log("uuid socket: " + await user.uuid)

      socket.on('id_data', async msg => {
        try{
          let data = await user.all
          if(data!=null){
            socket.emit('id_data',data)
          }else{
            socket.emit('id_data',"err")
          }
        }catch(e){console.error(e)}
      });
  
      socket.on('my_score', async msg => {
        try{
          if(msg=="int"){
            let score = await user.score
            if(score==null) score=-500
            socket.emit('my_score',score)
          }else{
            socket.emit('my_score',await user.listPoint)
          }
        }catch(e){console.error(e)}
      });
  
      socket.on('info_menu_semaine', async msg => {
        try{
          socket.emit('info_menu_semaine',await getMidiMenu(msg))
        }catch(e){console.error(e)}
      });
  
      socket.on('info_horaire', async msg => {
        try{
          let info = await getMidiInfo(msg[0],msg[1]*2+msg[2])
          socket.emit('info_horaire',info)
        }catch(e){console.error(e)}
      });
  
  
      socket.on('tuto', msg => {
        try{
          user.tuto = msg
          socket.emit('tuto','ok')
        }catch(e){console.error(e)}
      });
  
      socket.on('amis', async msg => {
        try{
          if(msg=='get'){
            socket.emit('amis',await user.amis)
          }else if (msg.class==[].class){
            user.amis=msg
            socket.emit('amis','ok')
          }
        }catch(e){console.error(e)}
      });
  
      socket.on('list_users', async msg => {
        try{
          socket.emit('list_users',await User.listUsersName())
        }catch(e){console.error(e)}
      });
  
      socket.on('banderole', async msg => {
        try{
          socket.emit('banderole',await getVar('banderole'))
        }catch(e){console.error(e)}
      });
  
      socket.on('my_demande', async msg => {
        try{
          if(msg.length==3){
            socket.emit('my_demande',await user.getMidiDemande(msg[0],msg[1]*2+msg[2]))
          }else if(msg[3]===false){
            console.log(await user.getMidiDemande(msg[0],msg[1]*2+msg[2]))
            if((await user.getMidiDemande(msg[0],msg[1]*2+msg[2])).DorI!=true){
              await user.delMidiDemande(msg[0],msg[1]*2+msg[2])
              socket.emit('my_demande',"ok")
            }
          } else if(msg.length==4){
            if((await user.getMidiDemande(msg[0],msg[1]*2+msg[2])).DorI!=true){
              await user.setMidiDemande(msg[0],msg[1]*2+msg[2],msg[3],false,false)
              socket.emit('my_demande',"ok")
            }
          }
        }catch(e){console.error(e)}
      });
  
      socket.on('list_demandes', async msg => {
        try{
          socket.emit('list_demandes',await listMidiDemandes(msg[0],msg[1]*2+msg[2]))
        }catch(e){console.error(e)}
      });
  
      socket.on('list_demandes_perm', async msg => {
        try{
          socket.emit('list_demandes_perm',await listPermDemandes(msg[0],msg[1],msg[2]))
        }catch(e){console.error(e)}
      });
  
      socket.on("ouvert_perm", async msg => {
        try{
          socket.emit("ouvert_perm",await getPermOuvert(msg[0],msg[1],msg[2]))
        }catch(e){console.error(e)}
      });
  
      socket.on("my_demande_perm", async msg => {
        try{
          if(msg.length==3){
            socket.emit("my_demande_perm",await user.getPermDemande(msg[0],msg[1],msg[2]))
          }else if(msg[3]===false){
            if((await user.getPermDemande(msg[0],msg[1],msg[2])).DorI!=true){
              await user.delPermDemande(msg[0],msg[1],msg[2])
              socket.emit('my_demande_perm',"ok")
            }
          } else if(msg.length==5){
            if((await user.getPermDemande(msg[0],msg[1],msg[2])).DorI!=true){
              await socket.emit("my_demande_perm",await user.setPermDemande(msg[0],msg[1],msg[2],msg[3],msg[4],false))
              socket.emit('my_demande_perm',"ok")
            }
          }
        }catch(e){console.error(e)}
      });
      //user.admin=1
    } catch (e) {console.error(e)}
  });

  //db.run('drop table midi_list')

  /*let t0 =["2A","2B","2C","2D","2E","2F","2G","2H","2I","2J","2K","2L"]
  let t1 =["1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K"]
  let t2 =["TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK"]
  let t3=["PCSI","PC","professeur-personnel"]
  let tab = []
  t0.forEach(e=>{
    tab.push([e,0])
  })
  t1.forEach(e=>{
    tab.push([e,1])
  })
  t2.forEach(e=>{
    tab.push([e,2])
  })
  t3.forEach(e=>{
    tab.push([e,3])
  })
  setClasse(tab)
  setGroup(['a','b','c'])
  
  User.createUser('robin.delatre@stemariebeaucamps.fr')
  User.createUser('A.B@stemariebeaucamps.fr')
  User.createUser('C.D@stemariebeaucamps.fr')
  User.createUser('AC.B@stemariebeaucamps.fr')
  User.createUser('AB.A@stemariebeaucamps.fr')*/
}
main().catch(console.error);