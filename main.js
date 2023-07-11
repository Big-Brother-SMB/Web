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
const { generateKey } = require('crypto');
const { table } = require('console');
const { promisify } = require('util');

const jsonObj = JSON.parse(fs.readFileSync(__dirname+"/../code.json"));
let address = jsonObj.address
const oauth2Client = new google.auth.OAuth2(
  jsonObj.client_id,
  jsonObj.code_secret,
  address+"connexion/oauth2callback"
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

let User = require('./server/User.js')

let funcDB = require('./server/functionsDB.js')

const funcSocket = require('./server/functionsSocket.js')

const UserSelect = require('./server/UserSelect.js')

const init_DB = require('./server/initDB.js')

const generatePage = require('./server/generatePage.js')

async function main() {
  db = new sqlite3.Database(__dirname+'/../main.db', err => {
    if (err)
      throw err
    db.serialize(init_DB(db))
    User.setDB(db)
    funcDB.setDB(db)
    funcSocket.setDB(db)
    UserSelect.setDB(db)
  })

  server = http.createServer(async function (req, res) {
    if (req.url == '/connexion/apigoogle') {
      res.writeHead(301, { "Location": authorizationUrl });
      res.end();
    } else if (req.url.startsWith('/connexion/oauth2callback')) {
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
            let tokenAuth = await (await User.createUser(data.email,data.picture)).createToken()
            res.writeHead(301, { "Location" : address+"index.html?token=" + tokenAuth});
            res.end();        
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
      let [file,extName,err404] = await generatePage(req.url)
      
      try{
        if(extName =='.jpg' || extName == '.png' || extName == '.ico' || extName == '.eot' || extName == '.ttf' || extName == '.svg' || extName == '.gif'){
          res.writeHead(200, {'Content-Type': mimeTypes[extName],'Cache-Control':'public, max-age=3600'});
          res.write(file, 'binary');
          res.end();
        }else{
          if(!err404){
            res.writeHead(200, {'Content-Type': mimeTypes[extName],'Cache-Control':'public, max-age=1'});
            res.end(file);
          }else {
            res.writeHead(404);
            res.end(file);
          }
        }
      }catch(e){console.error(e)}
    }
  }).listen(3000);

  io = new Server(server)
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
          funcDB.addGlobalPoint(msg[0],msg[1],msg[2])
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
          socket.emit('get_global_point',await funcDB.listGlobalPoint())
        }catch(e){console.error(e)}
      })
      socket.on('set_banderole',async msg => {
        try{
          funcDB.setVar("banderole",msg)
          socket.emit('set_banderole',"ok")
        }catch(e){console.error(e)}
      })
      socket.on('set_menu',async msg => {
        try{
          funcDB.setMidiMenu(msg[0],msg[1])
          socket.emit('set_menu',"ok")
        }catch(e){console.error(e)}
      })
      socket.on('setMidiInfo',async msg => {
        try{
          //semaine,creneau,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio
          funcDB.setMidiInfo(msg[0],msg[1]*2+msg[2],msg[3],msg[4],msg[5],msg[6],msg[7],msg[8],msg[9])
          socket.emit('setMidiInfo',"ok")
        }catch(e){console.error(e)}
      })
      socket.on('list group/classe',async msg => {
        try{
          socket.emit('list group/classe',[await funcDB.getGroup(),await funcDB.getClasse()])
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
          await funcDB.setPermOuvert(msg[0],msg[1],msg[2],msg[3])
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
          await funcDB.setPermInscrit(msg[0],msg[1],msg[2],msg[3])
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
          user.all = msg
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
          funcDB.delGlobalPoint(msg)
          socket.emit('del_global_point','ok')
        }catch(e){console.error(e)}
      })
      socket.on('copy key',async msg => {
        try{
          socket.emit('copy key',await (new User(msg)).createToken())
        }catch(e){console.error(e)}
      })

      socket.on("admin msgs", async msg => {
        try{
          socket.emit("admin msgs",await funcDB.getAllMessages())
        }catch(e){console.error(e)}
      });

      socket.on("msg lu", async msg => {
        try{
          (new User("admin")).messageLu(msg)
          socket.emit("msg lu",'ok')
        }catch(e){console.error(e)}
      });

      socket.on("add msg", async msg => {
        try{
          funcDB.addMessage("admin",msg.destinataire,false,msg.texte,msg.title,hashHour())
          socket.emit("add msg",'ok')
        }catch(e){console.error(e)}
      });

      socket.on("add news", async msg => {
        try{
          funcDB.addNews("admin",msg.texte,msg.title,hashHour())
          socket.emit("add news",'ok')
        }catch(e){console.error(e)}
      });

      socket.on("add sondage", async msg => {
        try{
          funcDB.addSondage("admin",msg.texte,msg.title,hashHour(),msg.mode,msg.choix)
          socket.emit("add sondage",'ok')
        }catch(e){console.error(e)}
      });
    }
  })
  io.on("connection", async (socket) => {
    try {
      let user = await User.searchToken(socket.handshake.auth.token)
      if(user!=null)console.log("uuid socket: " + await user.uuid)
      //user.admin=1

      funcSocket.id_data(socket,user)
      funcSocket.score(socket,user)
      funcSocket.historiquePoints(socket,user)
      funcSocket.getMenuThisWeek(socket,user)
      funcSocket.getDataThisCreneau(socket,user)
      funcSocket.getTuto(socket,user)
      funcSocket.setTuto(socket,user)
      funcSocket.getAmis(socket,user)
      funcSocket.setAmis(socket,user)
      funcSocket.listUsersName(socket,user)
      funcSocket.getBanderole(socket,user)
      funcSocket.getMyDemande(socket,user)
      funcSocket.setMyDemande(socket,user)
      funcSocket.delMyDemande(socket,user)
      funcSocket.setAmiDemande(socket,user)
      funcSocket.delAmiDemande(socket,user)
      funcSocket.listDemandes(socket,user)
      funcSocket.listDemandesPerm(socket,user)
      funcSocket.getOuvertPerm(socket,user)
      funcSocket.getMyDemandePerm(socket,user)
      funcSocket.setMyDemandePerm(socket,user)
      funcSocket.delMyDemandePerm(socket,user)
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
  /*
  User.createUser('robin.delatre@stemariebeaucamps.fr')
  User.createUser('A.B@stemariebeaucamps.fr')
  User.createUser('C.D@stemariebeaucamps.fr')
  User.createUser('AC.B@stemariebeaucamps.fr')
  User.createUser('AB.A@stemariebeaucamps.fr')*/
}
main().catch(console.error);