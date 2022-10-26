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
const uuid = require('uuid');
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

//var
function getVar(key){
  return new Promise(async function(resolve, reject) {
    try{
      let uuidG = uuid.v4()
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


//user et  plus
function createUser(email){
  return new Promise(async function(resolve, reject) {
    let uuidG = uuid.v4()
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
          db.run("INSERT INTO users(email,uuid,first_name,last_name,admin) VALUES(?,?,?,?,?)", [email,uuidG,first_name,last_name,0])
        }else{
          uuidG=data.uuid
        }
        resolve(uuidG)
      }catch(e){console.error(e);resolve(null)}
    })
    setTimeout(reject,1000)
  })
}
function getUser(uuid){
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
//%amis+group--------
function setUser(uuid,first_name,last_name,email,code_barre,classe,tuto,admin){
  db.get("SELECT * FROM users where uuid=?",[uuid], (err, data) => {
    if(data!=undefined){
      db.run("UPDATE users SET first_name=?,last_name=?,email=?,code_barre=?,classe=?,tuto=?,admin=? where uuid=?",[first_name,last_name,email,code_barre,classe,tuto,admin,uuid])
    }
  })
}
function listUsers(){
  return new Promise(function(resolve, reject) {
    db.all("SELECT * FROM users", (err, data) => {
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


//token
function createToken(uuid){
  return new Promise(async function(resolve, reject) {
    let tokenAuth = rand.generateKey();
    let date=dateTime.format(new Date(), 'YYYY/MM/DD');
    await db.run("INSERT INTO token(token,uuid,date) VALUES(?,?,?)", [tokenAuth,uuid,date])
    resolve(tokenAuth)
  })
}
function getToken(token){
  return new Promise(function(resolve, reject) {
    db.get("SELECT uuid FROM token where token=?",[token], (err, data) => {
      try {
        if(data!=undefined){
          resolve(data.uuid)
        }else{
          resolve(null)
        }
      }catch(e){console.error(e);resolve(null)}
    })
    setTimeout(reject,1000)
  })
}


//perm
function getPermOuvert(semaine,day,creneau){
  return new Promise(function(resolve, reject) {
    db.get("SELECT * FROM perm_info where semaine=?,day=?,creneau=?",[semaine,day,creneau], (err, data) => {
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
  db.get("SELECT * FROM 'perm_info' where semaine=?,day=?,creneau=?",[semaine,day,creneau], (err, data) => {
    if(data==undefined){
      db.run("INSERT INTO perm_info(ouvert,semaine,day,creneau) VALUES (?,?,?,?)",[ouvert,semaine,day,creneau])
    } else{
      db.run("UPDATE perm_info SET ouvert=? where semaine=?,day=?,creneau=?",[ouvert,semaine,day,creneau])
    }
  })
}
function listPermDemandes(semaine,day,creneau){
  //% 
}
function setPermDemande(semaine,day,creneau,uuid,group,nb,IorD){
  //%
}


//midi
function getMidiMenu(semaine){
  return new Promise(function(resolve, reject) {
    db.get("SELECT * FROM midi_menu where semaine=?",[semaine], (err, data) => {
      try {
        if(data!=undefined){
          resolve(data.menu)
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
    db.get("SELECT * FROM midi_info where semaine=?, creneau=?",[semaine,creneau], (err, data) => {
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
function setMidiInfo(semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio,list_prio){
  db.get("SELECT * FROM midi_info where semaine=?, creneau=?",[semaine,creneau], (err, data) => {
    if(data==undefined){
      db.run("INSERT INTO midi_info(semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio) VALUES (?,?,?,?,?,?,?,?)",[semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,unique_prio])
    } else{
      db.run("UPDATE midi_menu SET cout=?,gratuit_prio=?,ouvert=?,perMin=?,places=?,unique_prio=? where semaine=?, creneau=?",[cout,gratuit_prio,ouvert,perMin,places,unique_prio,semaine,creneau])
    }
  })
}
function listMidiDemandes(semaine,creneau){
//%
}
function setMidiDemande(semaine,creneau,uuid,amis,IorD,scan){
//%
}


//point
function addGlobalPoint(date,name,value){
  db.run("INSERT INTO point_global(date,name,value) VALUES (?,?,?)",[date,name,value])
}
function addPersonalPoint(uuid,date,name,value){
  db.run("INSERT INTO point_perso(uuid,date,name,value) VALUES (?,?,?,?)",[uuid,date,name,value])
}
function getListPoint(uuid){
  //%
}
function getScore(uuid){
  //%
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
      db.run("INSERT INTO group_list(group) VALUES (?)",[e])
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
          db.run('CREATE TABLE user_groups(uuid uuid,group text)')
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
          db.run('CREATE TABLE group_list(group text)')
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
          console.log(data.email)
          emailT=data.email.split("@")
          if(emailT[1]=="stemariebeaucamps.fr"){
            let tokenAuth = await createToken(createUser(data.email))
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
    let uuid = await getToken(socket.handshake.auth.token)
    console.log(uuid)

    socket.on('id_data', async msg => {
      let data = await getUser(uuid)
      if(data!=undefined){
        socket.emit('id_data',data)
      }else{
        socket.emit('id_data',"err")
      }
    });

    socket.on('my_score', msg => {
      //% refaire
      socket.emit('my_score',0)
    });

    socket.on('info_menu_semaine', msg => {

    });

    socket.on('info_horaire', msg => {

    });
  });
}
main().catch(console.error);