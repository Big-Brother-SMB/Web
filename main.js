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

logger.info("start")


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
                }catch(e){logger.error(e);resolve(null)}
            })
            setTimeout(reject,1000)
          } catch (e) {logger.error(e)}
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
                }catch(e){logger.error(e);resolve(null)}
            })
            setTimeout(reject,1000)
          } catch (e) {logger.error(e)}
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
          } catch (e) {logger.error(e)}
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
            }catch(e){logger.error(e);resolve(null)}
          })
          setTimeout(reject,1000)
          } catch (e) {logger.error(e)}
        })
      }

    static listUsersName(){
        return new Promise(function(resolve, reject) {
          try{
            db.all("SELECT uuid,first_name,last_name FROM users", (err, data) => {
                try{
                    if(data!=undefined){
                        resolve(data)
                    }else{
                        resolve([])
                    }
                }catch(e){logger.error(e);resolve([])}
            })
            setTimeout(reject,1000)
          } catch (e) {logger.error(e)}
        })
    }

    static listUsersUuid(){
      return new Promise(function(resolve, reject) {
        try{
          db.all("SELECT uuid FROM users", (err, data) => {
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
              }catch(e){logger.error(e);resolve([])}
          })
          setTimeout(reject,1000)
        } catch (e) {logger.error(e)}
      })
    }

    static listUsersComplete(){
      return new Promise(function(resolve, reject) {
          db.all("SELECT * FROM users", (err, data) => {
              try{
                  if(data!=undefined){
                      resolve(data)
                  }else{
                      resolve([])
                  }
              }catch(e){logger.error(e);resolve([])}
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
                }catch(e){logger.error(e);resolve(null)}
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
                }catch(e){logger.error(e);resolve(null)}
            })
            setTimeout(reject,1000)
        })
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
                }catch(e){logger.error(e);resolve([])}
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
                }catch(e){logger.error(e);resolve([])}
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
          }catch(e){logger.error(e);resolve({})}
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
        amis.forEach(e=>{
          db.run("INSERT INTO midi_amis(semaine,creneau,uuid,amis) VALUES (?,?,?,?)",[semaine,creneau,uuid,e])
        })
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
        db.get("SELECT * FROM perm_list WHERE semaine=? and day=? and creneau=? and uuid=?",[semaine,day,creneau,uuid], (err, data) => {
          try {
            if(data!=undefined){
              resolve(data)
            }else{
              resolve({})
            }
          }catch(e){logger.error(e);resolve({})}
        })
        setTimeout(reject,1000)
      })
    }
    setPermDemande(semaine,day,creneau,group,nb,DorI){
      let uuid = this.uuid
      db.get("SELECT * FROM perm_list where semaine=? and day=? and creneau=? and uuid=?",[semaine,day,creneau,uuid], (err, data) => {
        if(data==undefined){
          db.run("INSERT INTO perm_list(semaine,day,creneau,uuid,group2,nb,DorI) VALUES (?,?,?,?,?,?,?)",[semaine,day,creneau,uuid,group,nb,DorI])
        } else{
          db.run("UPDATE perm_list SET group2=?,nb=?,DorI=? where semaine=? and day=? and creneau=? and uuid=?",[group,nb,DorI,semaine,day,creneau,uuid])
        }
      })
    }
    delPermDemande(semaine,day,creneau){
      let uuid = this.uuid
      db.run("delete from perm_list where semaine=? and day=? and creneau=? and uuid=?",[semaine,day,creneau,uuid])
    }

    //point
    addPersonalPoint(date,name,value){
        db.run("INSERT INTO point_perso(uuid,date,name,value) VALUES (?,?,?,?)",[this.uuid,date,name,value])
    }
    get listPoint(){
      let uuid=this.uuid
      return new Promise(function(resolve, reject) {
        let list=[]
        db.all("SELECT * FROM point_perso WHERE uuid=?",[uuid], (err, data) => {
            try{
                if(data!=undefined){
                    data.forEach(e=>{
                        list.push(e)
                    }) 
                }
                db.all("SELECT * FROM point_global", (err, data) => {
                  try{
                      if(data!=undefined){
                          data.forEach(e=>{
                            list.push(e)
                          })
                      }
                      db.all("SELECT * FROM midi_list WHERE uuid=? and DorI=True",[uuid], async (err, data) => {
                        try{
                            if(data!=undefined){
                              for (let i in data){
                                let r = await new Promise(function(resolve2, reject2) {
                                  db.get("SELECT * FROM midi_info WHERE semaine=? and creneau=? and (ouvert=2 or ouvert=3 or ouvert=5)",[data[i].semaine,data[i].creneau], (err, data2) => {
                                    resolve2(data2)
                                  })
                                })
                                if(r!=undefined)
                                  list.push(r)
                              }
                            }
                            resolve(list)
                        }catch(e){logger.error(e);resolve([])}
                      })
                  }catch(e){logger.error(e);resolve([])}
                })
            }catch(e){logger.error(e);resolve([])}
        })
        setTimeout(reject,1000)
      })
    }
    get score(){
      let uuid=this.uuid
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
                                  let r = await new Promise(function(resolve2, reject2) {
                                    db.get("SELECT * FROM midi_info WHERE semaine=? and creneau=? and (ouvert=2 or ouvert=3 or ouvert=5)",[data[i].semaine,data[i].creneau], (err, data2) => {
                                      resolve2(data2)
                                    })
                                  })
                                  if(r!=undefined){
                                    score-=r.cout
                                  }
                                }
                            }
                            resolve(score)
                        }catch(e){logger.error(e);resolve(null)}
                      })
                  }catch(e){logger.error(e);resolve(null)}
                })
            }catch(e){logger.error(e);resolve(null)}
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
        }catch(e){logger.error(e);resolve(null)}
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
        }catch(e){logger.error(e);resolve(null)}
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
        }catch(e){logger.error(e);resolve([])}
      })
      setTimeout(reject,1000)
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
        }catch(e){logger.error(e);resolve({})}
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
            resolve({})
          }
        }catch(e){logger.error(e);resolve({})}
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
        }catch(e){logger.error(e);resolve([])}
      })
      setTimeout(reject,1000)
    })
  }
  
  
  //point
  function addGlobalPoint(date,name,value){
    db.run("INSERT INTO point_global(date,name,value) VALUES (?,?,?)",[date,name,value])
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
        }catch(e){logger.error(e);resolve([])}
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
        }catch(e){logger.error(e);resolve([])}
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
        }catch(e){logger.error(e);resolve(null)}
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

  constructor(uuid,score,prios,amis){
      this.uuid=uuid
      this.score = score
      this.prios = prios
      this.amis = amis
      this.amisC = []
      
      //-1=refuser ; 0=prio passer ; 1=score ; 2=inscrit
      this.pass = 0
  }

  static async createUserList(semaine,creneau){
    let info = await getMidiInfo(semaine,creneau)
    let listDemandes = await listMidiDemandes(semaine,creneau)
    this.usersList = []
    for(let i in listDemandes){
      if(DorI==0){
        //% prio
        let user = new User(listDemandes[i].uuid)
        let score = await user.score
        if(score == null) score = -500
        let prios = await user.groups
        let amis = listDemandes[i].amis
        for(let a in amis){
          if(this.searchAmi(amis[a])==null){
            amis.splice(a,1);
            a--
          }
        }
        this.usersList.push(await new UserSelect(listDemandes[i].uuid,score,prios,amis))
      }
    }
    this.usersList.sort(function compareFn(a, b) {
      if(a.score>b.score){
          return 1
      }else if(a.score<b.score){
          return -1
      }else{
          let rand = Math.floor(Math.random() * 2);
          if(rand == 0) rand=-1
          return rand
      }
    })

    for(let i in this.usersList){
      this.usersList[i].amisComplete(this.usersList[i])
    }

    

    //% -1 prio
    for(let i in this.usersList){
      if(this.usersList[i].pass==1){
        this.usersList[i].amisC.forEach(a=>{
          a=this.searchAmi(a)
          if(a.pass==-1){
            this.usersList[i].pass=-1
          }
        })
      }
    }


    let inscrits = 0
    let places = info.places
    while(inscrits<info.places){
      let test=true
      for(let i in this.usersList){
        if(this.usersList[i].pass==0){
          test=false
        }
      }
      if(test) break;


      if(places<=0){
          places=1
      }
      for(let i in this.usersList){
        if(places>0 && this.usersList[i].pass==0){
          places--
          this.usersList[i].pass=1
        }
      }


      for(let i in usersList){
        if(usersList[i].pass==1){
          let test= true
          this.usersList[i].amisC.forEach(a=>{
            a=this.searchAmi(a)
            if(a.pass==0 || a.pass==-1){
              test=false
            }
          })
          if(test && this.usersList[i].amisC.length+inscrits<=info.places){
            this.usersList[i].pass=2
            inscrits+=this.usersList[i].amisC.length+1
            this.usersList[i].amisC.forEach(a=>{
              a=this.searchAmi(a)
              a.pass=2
            })
          }
        }
      }
    }
    //%
    return this.usersList
  }

  amisComplete(moi){
    let obj = this
    obj.amis.forEach(a=>{
      if(a!=moi.uuid && !moi.amisC.includes(a)){
        moi.amisC.push(a)
        searchAmi(a).amisComplete(moi)
      }
    })
  }

  static searchAmi(uuid){
    for(let i in usersList){
      if(usersList[i].uuid==uuid){
        return usersList[i]
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
        logger.info('Error:' + q.error);
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
          logger.error(error);
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
            }catch(e){logger.error(e)}
          });
        }
      }catch(e){logger.error(e)}
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
    logger.info("uuid admin socket: " + await user.uuid)

    if(await user.admin>0){
      socket.on('my_admin_mode',async msg => {
        try{
          user.admin = msg
          socket.emit('my_admin_mode',"ok")
        }catch(e){logger.error(e)}
      })
      socket.on('add_global_point',async msg => {
        try{
          addGlobalPoint(msg[0],msg[1],msg[2])
          socket.emit('add_global_point',"ok")
        }catch(e){logger.error(e)}
      })
      socket.on('get_global_point',async msg => {
        try{
          console.log('ok1')
          socket.emit('get_global_point',await listGlobalPoint())
          console.log('ok2')
        }catch(e){logger.error(e)}
      })
      socket.on('set_banderole',async msg => {
        try{
          setVar("banderole",msg)
          socket.emit('set_banderole',"ok")
        }catch(e){logger.error(e)}
      })
      socket.on('set_menu',async msg => {
        try{
          setMidiMenu(msg[0],msg[1])
          socket.emit('set_menu',"ok")
        }catch(e){logger.error(e)}
      })
      socket.on('setMidiInfo',async msg => {
        try{
          console.log(msg)
          //semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio,list_prio
          setMidiInfo(msg[0],msg[1]*2+msg[2],msg[3],msg[4],msg[5],msg[6],msg[7],msg[8],msg[9])
          socket.emit('setMidiInfo',"ok")
        }catch(e){logger.error(e)}
      })
      socket.on('list group/classe',async msg => {
        try{
          socket.emit('list group/classe',[await getGroup(),await getClasse()])
        }catch(e){logger.error(e)}
      })
    }
  })
  io.on("connection", async (socket) => {
    try {
      let user = await User.searchToken(socket.handshake.auth.token)
      if(user!=null)logger.info("uuid socket: " + await user.uuid)
  
      socket.on('test', async msg => {
        socket.emit('test',"msg:cc")
      });

      socket.on('id_data', async msg => {
        try{
          let data = await user.all
          if(data!=null){
            socket.emit('id_data',data)
          }else{
            socket.emit('id_data',"err")
          }
        }catch(e){logger.error(e)}
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
        }catch(e){logger.error(e)}
      });
  
      socket.on('info_menu_semaine', async msg => {
        try{
          socket.emit('info_menu_semaine',await getMidiMenu(msg))
        }catch(e){logger.error(e)}
      });
  
      socket.on('info_horaire', async msg => {
        try{
          let info=await getMidiInfo(msg[0],msg[1]*2+msg[2])
          socket.emit('info_horaire',info)
        }catch(e){logger.error(e)}
      });
  
  
      socket.on('tuto', msg => {
        try{
          user.tuto = msg
          socket.emit('tuto','ok')
        }catch(e){logger.error(e)}
      });
  
      socket.on('amis', async msg => {
        try{
          if(msg=='get'){
            socket.emit('amis',await user.amis)
          }else if (msg.class==[].class){
            user.amis=msg
            socket.emit('amis','ok')
          }
        }catch(e){logger.error(e)}
      });
  
      socket.on('list_users', async msg => {
        try{
          socket.emit('list_users',await User.listUsersName())
        }catch(e){logger.error(e)}
      });
  
      socket.on('banderole', async msg => {
        try{
          socket.emit('banderole',await getVar('banderole'))
        }catch(e){logger.error(e)}
      });
  
      socket.on('my_demande', async msg => {
        try{
          if(msg.length==3){
            socket.emit('my_demande',await user.getMidiDemande(msg[0],msg[1]*2+msg[2]))
          }else if(msg[3]===false){
            if(user.getMidiDemande(msg[0],msg[1]*2+msg[2]).DorI!=true){
              await user.delMidiDemande(msg[0],msg[1]*2+msg[2])
              socket.emit('my_demande',"ok")
            }
          } else if(msg.length==4){
            if(user.getMidiDemande(msg[0],msg[1]*2+msg[2]).DorI!=true){
              await user.setMidiDemande(msg[0],msg[1]*2+msg[2],msg[3],false,false)
              socket.emit('my_demande',"ok")
            }
          }
        }catch(e){logger.error(e)}
      });
  
      socket.on('list_demandes', async msg => {
        try{
          socket.emit('list_demandes',await listMidiDemandes(msg[0],msg[1]*2+msg[2]))
        }catch(e){logger.error(e)}
      });
  
      socket.on('list_demandes_perm', async msg => {
        try{
          socket.emit('list_demandes_perm',await listPermDemandes(msg[0],msg[1],msg[2]))
        }catch(e){logger.error(e)}
      });
  
      socket.on("ouvert_perm", async msg => {
        try{
          socket.emit("ouvert_perm",await getPermOuvert(msg[0],msg[1],msg[2]))
        }catch(e){logger.error(e)}
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
        }catch(e){logger.error(e)}
      });
      //user.setMidiDemande(44,2,[],true,false)
      //user.setPermDemande(44,2,1,"A",32,true)
      //user.admin=1
    } catch (e) {logger.error(e)}
  });
  
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
  setGroup(['a','b','c'])*/

  /*addGlobalPoint("2021-01-01 20:00:00","Un point",1)
  setVar('banderole',"coucou")
  setMidiInfo(44,2,1,false,2,75,175,true,["2F","A"])
  setMidiMenu(44,"poison")
  

  User.createUser('robin.delatre@stemariebeaucamps.fr')
  User.createUser('A.B@stemariebeaucamps.fr')
  User.createUser('C.D@stemariebeaucamps.fr')*/
  UserSelect.createUserList()
}
main().catch(console.error);

