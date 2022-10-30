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
*/

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
let db_amis
let db_perm
let db_midi
let db_news
let db_sondages

class User{
    constructor(uuid){
        this.uuid=uuid
    }
    static search(code_barre){
        return new Promise(function(resolve, reject) {
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
        })
    }
      //user et  plus
    static createUser(email){
        return new Promise(function(resolve, reject) {
            let uuid = uuidG.v4()
            db.get("SELECT * FROM 'users' where email=?",[email], (err, data) => {
                try{
                    if(data==undefined){
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
        })
    }

    createToken(){
        let uuid=this.uuid
        return new Promise(function(resolve, reject) {
          let tokenAuth = rand.generateKey();
          let date=dateTime.format(new Date(), 'YYYY/MM/DD');
          db.run("INSERT INTO token(token,uuid,date) VALUES(?,?,?)", [tokenAuth,uuid,date])
          resolve(tokenAuth)
        })
      }
    static searchToken(token){
        return new Promise(function(resolve, reject) {
          db.get("SELECT uuid FROM token where token=?",[token], (err, data) => {
            try {
              if(data!=undefined){
                resolve(new User(data.uuid))
              }else{
                resolve(null)
              }
            }catch(e){console.error(e);resolve(null)}
          })
          setTimeout(reject,1000)
        })
      }

    static listUsers(){
        return new Promise(function(resolve, reject) {
            db.all("SELECT uuid FROM users", (err, data) => {
                try{
                    if(data!=undefined){
                        let list=[]
                        for(let e in data){
                            list.push(new User(e.uuid))
                        }
                        resolve(list)
                    }else{
                        resolve(null)
                    }
                }catch(e){console.error(e);resolve(null)}
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
                db.run("UPDATE users SET ?=? where uuid=?",[key,value,uuid])
            }
        })
    }

    get all(){
        let uuid = this.uuid
        return new Promise(function(resolve, reject) {
            db.get("SELECT * FROM users where uuid=?",[uuid], (err, data) => {
                try{
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

    get first_name()   {
        this.#getInfo("first_name")
    }
    set first_name(value)   {
        this.#setInfo("first_name",value)
    }

    get last_name()   {
        this.#getInfo("last_name")
    }
    set last_name(value)   {
        this.#setInfo("last_name",value)
    }

    get email()   {
        this.#getInfo("email")
    }
    set email(value)   {
        this.#setInfo("email",value)
    }

    get code_barre()   {
        this.#getInfo("code_barre")
    }
    set code_barre(value)   {
        this.#setInfo("code_barre",value)
    }

    get classe()   {
        this.#getInfo("classe")
    }
    set classe(value)   {
        this.#setInfo("classe",value)
    }

    get tuto()   {
        this.#getInfo("tuto")
    }
    set tuto(value)   {
        this.#setInfo("tuto",value)
    }

    get admin()   {
        this.#getInfo("admin")
    }
    set admin(value)   {
        this.#setInfo("admin",value)
    }

    get amis(){
        let uuid=this.uuid
        return new Promise(function(resolve, reject) {
            db_amis.all("SELECT amis FROM ?",[uuid], (err, data) => {
                try{
                    if(data!=undefined){
                        let list=[]
                        for(let e in data){
                            list.push(e.amis)
                        }
                        resolve(list)
                    }else{
                        resolve(null)
                    }
                }catch(e){console.error(e);resolve(null)}
            })
            setTimeout(reject,1000)
        })
    }
    set amis(list){
        let uuid=this.uuid
        db_amis.get("SELECT amis FROM ?",[uuid], (err, data) => {
            db_amis.serialize(()=>{
                if(data!=undefined){
                    db_amis.run("delete from ?",[uuid])
                }else{
                    db_amis.run('CREATE TABLE ?(amis uuid)',[uuid])
                }
                for(let e in list){
                    db_amis.run("INSERT INTO ?(amis) VALUES (?)",[uuid,e])
                }
            })
        })
    }

    get groups(){
        let uuid=this.uuid
        return new Promise(function(resolve, reject) {
            db.all("SELECT group2 FROM user_groups where uuid=?",[uuid], (err, data) => {
                try{
                    if(data!=undefined){
                        let list=[]
                        for(let e in data){
                            list.push(e.group2)
                        }
                        resolve(list)
                    }else{
                        resolve(null)
                    }
                }catch(e){console.error(e);resolve(null)}
            })
            setTimeout(reject,1000)
        })
    }
    set groups(list){
        let uuid=this.uuid
        db.serialize(()=>{
            db.run("delete from user_groups where uuid=?",[uuid])
            for(let e in list){
                db.run("INSERT INTO user_groups(uuid,group2) VALUES (?,?)",[uuid,e])
            }
        })
    }

    //point
    addPersonalPoint(date,name,value){
        db.run("INSERT INTO point_perso(uuid,date,name,value) VALUES (?,?,?,?)",[this.uuid,date,name,value])
    }
    get listPoint(){
      let uuid=this.uuid
      return new Promise(function(resolve, reject) {
          db.all("SELECT * FROM point_perso WHERE uuid=?",[uuid], (err, data) => {
              try{
                  if(data!=undefined){
                      let list=[]
                      for(let e in data){
                          list.push(e.amis)
                      }
                      resolve(list)
                  }else{
                      resolve(null)
                  }
              }catch(e){console.error(e);resolve(null)}
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
                    for(let e in data){
                        score+=e.value
                    } 
                }
                db.all("SELECT * FROM point_global", (err, data) => {
                  try{
                      if(data!=undefined){
                          for(let e in data){
                              score+=e.value
                          } 
                      }
                      db_midi.all("SELECT * FROM sqlite_master where type='table'", (err, data) => {
                        try{
                            if(data!=undefined){
                                for(let e in data){
                                  if(e.name.count("/") == 1){
                                    db_midi.all("SELECT * FROM ? WHERE uuid=?",[e.name,uuid], (err, data) => {
                                      if(data!=undefined){

                                      }
                                    })
                                  }
                                } 
                            }
                            resolve(list)
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
    //% 
  }
  function setPermDemande(semaine,day,creneau,uuid,group,nb,DorI){
    //%
  }
  
  
  //midi
  function getMidiMenu(semaine){
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM midi_menu where semaine=?",[semaine], (err, data) => {
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
          console.log('cc',semaine,creneau)
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
  function setMidiInfo(semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio,list_prio){
    db.get("SELECT * FROM midi_info where semaine=? and creneau=?",[semaine,creneau], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO midi_info(semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio) VALUES (?,?,?,?,?,?,?,?)",[semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio])
      } else{
        db.run("UPDATE midi_menu SET cout=?,gratuit_prio=?,ouvert=?,perMin=?,places=?,unique_prio=? where semaine=? and creneau=?",[cout,gratuit_prio,ouvert,perMin,places,unique_prio,semaine,creneau])
      }
    })
    db_midi.get("SELECT * FROM sqlite_master where type='table' AND name=?",[semaine+"/"+creneau+"/prio"], (err, data) => {
      if(data==undefined)
      db_midi.run('CREATE TABLE ?(amis uuid)',[semaine+"/"+creneau+"/prio"])
      db_midi.serialize(()=>{
        db_midi.run("delete from ?",[semaine+"/"+creneau+"/prio"])
        for(let e in list_prio){
          db_midi.run("INSERT INTO ?(prio) VALUES (?)",[semaine+"/"+creneau+"/prio",e])
        }
      })
    })
  }
  function listMidiDemandes(semaine,creneau){
    return new Promise(function(resolve, reject) {
      db_midi.all("SELECT * FROM ?",[semaine+"/"+creneau], (err, data) => {
        try {
          if(data!=undefined){
            for(let i=0;i<data.length;i++){
              db_midi.all("SELECT * FROM ?",[semaine+"/"+creneau+"/"+data[i].uuid], (err, data2) => {
                let list=[]
                for(let e in data2){
                  list.push(e.amis)
                }
                data[i].push(list)
              })
            }
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error(e);resolve(null)}
      })
      setTimeout(reject,1000)
    })
  }
  function setMidiDemande(semaine,creneau,uuid,amis,DorI,scan){
    db_midi.get("SELECT * FROM sqlite_master where type='table' AND name=?",[semaine+"/"+creneau], (err, data) => {
      if(data==undefined)
        db_midi.run('CREATE TABLE ?(uuid uuid,scan boolean,DorI boolean)',[semaine+"/"+creneau])
      db_midi.get("SELECT * FROM ? where uuid=?",[semaine+"/"+creneau,uuid], (err, data) => {
        if(data==undefined){
          db_midi.run("INSERT INTO ?(uuid uuid,scan boolean,DorI boolean) VALUES (?,?,?)",[semaine+"/"+creneau,uuid,scan,DorI])
        } else{
          db_midi.run("UPDATE ? SET scan=?,DorI=? where uuid=?",[semaine+"/"+creneau,scan,DorI,uuid])
        }
      })
    })
    db_midi.get("SELECT * FROM sqlite_master where type='table' AND name=?",[semaine+"/"+creneau+"/"+uuid], (err, data) => {
      if(data==undefined)
        db_midi.run('CREATE TABLE ?(amis uuid)',[semaine+"/"+creneau+"/"+uuid])
      db_midi.serialize(()=>{
        db_midi.run("delete from ?",[semaine+"/"+creneau+"/"+uuid])
        for(let e in amis){
          db_midi.run("INSERT INTO ?(amis) VALUES (?)",[semaine+"/"+creneau+"/"+uuid,e])
        }
      })
    })
  }
  
  
  //point
  function addGlobalPoint(date,name,value){
    db.run("INSERT INTO point_global(date,name,value) VALUES (?,?,?)",[date,name,value])
  }
  
  
  //group / classe
  function getGroup(){
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
  function setGroup(list){
    db.serialize(()=>{
      db.run("delete from group_list")
      for(let e in list){
        db.run("INSERT INTO group_list(group2) VALUES (?)",[e])
      }
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
      for(let e in list){
        db.run("INSERT INTO classe_list(classe) VALUES (?)",[e])
      }
    })
  }
  
  /*//%messages
  function addMessage(deAdmin,uuid,lu,text,title,type,date){
  
  }
  function luMessage(date){
  
  }
  // news / sondages*/





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

      //users / user-group / token
      db.get("SELECT * FROM sqlite_master where type='table' AND name='users'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE users(uuid UUID, first_name text, last_name text, email text, code_barre CHAR[5], classe text, tuto bool,admin int2)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='user_groups'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE user_groups(uuid uuid,group2 text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='token'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE token(token text,uuid UUID,date DATE)')
      })

      //perm
      db.get("SELECT * FROM sqlite_master where type='table' AND name='perm_info'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE perm_info(semaine int2,day int2,creneau int2,ouvert int2)')
      })

      //midi
      db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_info'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE midi_info(semaine int2,creneau int2,cout float4,gratuit_prio bool,ouvert int2,perMin int2,places int2,unique_prio bool)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_menu'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE midi_menu(semaine int2,menu text)')
      })

      //point
      db.get("SELECT * FROM sqlite_master where type='table' AND name='point_global'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE point_global(name text,value int2,date text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='point_perso'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE point_perso(uuid uuid,name value,value int2,date text)')
      })

      //group classe
      db.get("SELECT * FROM sqlite_master where type='table' AND name='classe_list'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE classe_list(classe text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='group_list'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE group_list(group2 text)')
      })

      //messages / news / sondage
      db.get("SELECT * FROM sqlite_master where type='table' AND name='messages'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE messages(deAdmin bool,uuid uuid,lu bool,texte text,title text,type text,date text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='news'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE news(texte text,title text,date text)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='sondages'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE sondages(texte text,title text,date text,mode int2)')
      })
    })
  })


  db_amis = new sqlite3.Database('amis.db', err => {
    if (err)
      throw err
  })


  db_perm = new sqlite3.Database('perm.db', err => {
    if (err)
      throw err
  })


  db_midi = new sqlite3.Database('midi.db', err => {
    if (err)
      throw err
  })


  db_news = new sqlite3.Database('news.db', err => {
    if (err)
      throw err
  })


  db_sondages = new sqlite3.Database('sondages.db', err => {
    if (err)
      throw err
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
          emailT=data.email.split("@")
          if(emailT[1]=="stemariebeaucamps.fr"){
            let tokenAuth = await (await createUser(data.email)).createToken()
            res.writeHead(301, { "Location" : address+"index.html?token=" + tokenAuth});
            res.end();
            //fs.readFileSync(__dirname+"/test.html")          
          } else {
            res.writeHead(301, { "Location" : address+"index.html?err=Il faut une adresse email stemariebeaucamps.fr"});
            res.end();
          }
        } catch (error) {
          console.error(error);
          res.writeHead(301, { "Location" : address+"index.html?err=inconnue"});
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
        if(extName =='.jpg' || extName == '.png' || extName == '.ico' || extName == '.eot' || extName == '.ttf' || extName == '.svg'){
          let file = fs.readFileSync(staticFiles);
          res.writeHead(200, {'Content-Type': mimeTypes[extName]});
          res.write(file, 'binary');
          res.end();
        }else {
          fs.readFile(staticFiles, 'utf8', function (err, data) {
            if(!err){
              res.writeHead(200, {'Content-Type': mimeTypes[extName]});
              res.end(data);
            }else {
              res.writeHead(200);
              res.end(fs.readFileSync(`${__dirname}/public/404.html`));
            }
            res.end();
          });
        }
      }catch(e){}
    }

  }).listen(3000);



  io = new Server(server,{cors: {
    origin: address,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }})
  io.on("connection", async (socket) => {
    let user = await User.searchToken(socket.handshake.auth.token)
    console.log("uuid socket:",await user.uuid)

    socket.on('id_data', async msg => {
      try{
        let data = await user.all
        console.log("socket data:",data)
        if(data!=undefined){
          socket.emit('id_data',data)
        }else{
          socket.emit('id_data',"err")
        }
      }catch(e){}
    });

    socket.on('my_score', async msg => {
      try{
        if(msg=="int"){
          socket.emit('my_score',await user.score)
        }else{
          socket.emit('my_score',null)
        }
      }catch(e){}
    });

    socket.on('info_menu_semaine', async msg => {
      try{
        socket.emit('info_menu_semaine',await getMidiMenu(msg))
      }catch(e){}
    });

    socket.on('info_horaire', async msg => {
      try{
        let info=await getMidiInfo(msg[0],msg[1]*2+msg[2])
        console.log(msg[0],msg[1]*2+msg[2])
        if(info==null){
          info={}
        }
        socket.emit('info_horaire',info)
      }catch(e){}
    });
  });
  //setMidiInfo(43,2,1,false,3,75,175,true,null)
  setMidiMenu(43,"eiijzeiuzuei")
}
main().catch(console.error);