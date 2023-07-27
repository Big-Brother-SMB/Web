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
  '.ttf': 'aplication/font-sfnt',
  '.db': ''
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
        } catch (e) {
          console.error(e);console.log('1');;
          res.writeHead(301, { "Location" : address+"index.html?err=Erreur inconnue"});
          res.end();
        }
      }
    } else {
      let [file,extName,err404] = await generatePage(req.url)
      
      try{
        if(extName =='.jpg' || extName == '.png' || extName == '.ico' || extName == '.eot' || extName == '.ttf' || extName == '.svg' || extName == '.gif'){
          res.writeHead(200, {'Content-Type': mimeTypes[extName],'Cache-Control':'public, max-age=86400'});//1296000
          res.write(file, 'binary');
          res.end();
        }else{
          if(!err404){
            res.writeHead(200, {'Content-Type': mimeTypes[extName],'Cache-Control':'public, max-age=60'});//43200
            res.end(file);
          }else {
            res.writeHead(404);
            res.end(file);
          }
        }
      }catch(e){console.error(e);console.log('2');}
    }
  }).listen(3000);

  io = new Server(server)
  io.of("/admin").on("connection", async (socket) => {
    let user = await User.searchToken(socket.handshake.auth.token)
    console.log("uuid admin socket: " + await user.uuid)

    if(await user.admin > 0){
      socket.on('my_admin_mode',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          user.admin = msg
          socket.emit('my_admin_mode',"ok")
        }catch(e){console.error(e);console.log('3');}
      })
      socket.on('add_global_point',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.addGlobalPoint(msg[0],msg[1],msg[2])
          socket.emit('add_global_point',"ok")
        }catch(e){console.error(e);console.log('4');}
      })
      socket.on('add_perso_point',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          let user = new User(msg[0])
          user.addPersonalPoint(msg[1],msg[2],msg[3])
          socket.emit('add_perso_point',"ok")
        }catch(e){console.error(e);console.log('5');}
      })
      socket.on('get_global_point',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          socket.emit('get_global_point',await funcDB.listGlobalPoint())
        }catch(e){console.error(e);console.log('6');}
      })
      socket.on('set_banderole',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.setVar("banderole",msg)
          socket.emit('set_banderole',"ok")
        }catch(e){console.error(e);console.log('7');}
      })
      socket.on('set_menu',async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.setMidiMenu(req.semaine,req.menu,req.self)
          socket.emit('set_menu',"ok")
        }catch(e){console.error(e);console.log('8');}
      })
      socket.on('setMidiInfo',async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.setMidiInfo(req.w,req.j*2+req.h,req.cout,req.gratuit_prio,req.ouvert,req.perMin,req.places,req.prio_mode,req.nbSandwich,req.mode_sandwich,req.bonus_avance,req.algo_auto,req.list_prio)
          socket.emit('setMidiInfo',"ok")
        }catch(e){console.error(e);console.log('9');}
      })
      socket.on('list group/classe',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          socket.emit('list group/classe',[await funcDB.getGroup(),await funcDB.getClasse()])
        }catch(e){console.error(e);console.log('10');}
      })
      socket.on('list pass',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          socket.emit('list pass',await User.listUsersComplete())
        }catch(e){console.error(e);console.log('11');}
      })
      socket.on('scan',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          let user = new User(msg[3])
          let info = await user.getMidiDemande(msg[0],msg[1]*2+msg[2])
          await user.setMidiDemande(msg[0],msg[1]*2+msg[2],info.amis,info.DorI,msg[4])
          socket.emit('scan','ok')
        }catch(e){console.error(e);console.log('12');}
      })
      socket.on('set DorI',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          let user = new User(msg[3])
          let info = await user.getMidiDemande(msg[0],msg[1]*2+msg[2])
          await user.setMidiDemande(msg[0],msg[1]*2+msg[2],info.amis,msg[4],info.scan)
          socket.emit('set DorI','ok')
        }catch(e){console.error(e);console.log('13');}
      })
      socket.on('del DorI',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          let user = new User(msg[3])
          await user.delMidiDemande(msg[0],msg[1]*2+msg[2])
          socket.emit('del DorI','ok')
        }catch(e){console.error(e);console.log('14');}
      })
      socket.on('set perm ouvert',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          await funcDB.setPermOuvert(msg[0],msg[1],msg[2],msg[3])
          socket.emit('set perm ouvert','ok')
        }catch(e){console.error(e);console.log('15');}
      })
      socket.on('del perm demande',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          await (new User(msg[3])).delPermDemande(msg[0],msg[1],msg[2])
          socket.emit('del perm demande','ok')
        }catch(e){console.error(e);console.log('16');}
      })
      socket.on('set perm inscrit',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          await funcDB.setPermInscrit(msg[0],msg[1],msg[2],msg[3])
          socket.emit('set perm inscrit','ok')
        }catch(e){console.error(e);console.log('17');}
      })
      socket.on('algo',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          let rep = await UserSelect.algoDeSelection(msg[0],msg[1]*2+msg[2])
          socket.emit('algo',rep)
        }catch(e){console.error(e);console.log('18');}
      })
      socket.on('set user',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          let user = new User(msg.uuid)
          user.all = msg
          socket.emit('set user','ok')
        }catch(e){console.error(e);console.log('19');}
      })
      socket.on('get score list',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          let user = new User(msg)
          socket.emit('get score list',await user.listPoint)
        }catch(e){console.error(e);console.log('20');}
      })
      socket.on('del_perso_point',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          let user = new User(msg[0])
          user.delPersonalPoint(msg[1])
          socket.emit('del_perso_point','ok')
        }catch(e){console.error(e);console.log('21');}
      })
      socket.on('del_global_point',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.delGlobalPoint(msg)
          socket.emit('del_global_point','ok')
        }catch(e){console.error(e);console.log('22');}
      })
      socket.on('copy key',async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          socket.emit('copy key',await (new User(msg)).createToken())
        }catch(e){console.error(e);console.log('23');}
      })

      socket.on("admin msgs", async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          socket.emit("admin msgs",await funcDB.getAllMessages())
        }catch(e){console.error(e);console.log('24');}
      });

      socket.on("msg lu", async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          (new User("admin")).messageLu(msg)
          socket.emit("msg lu",'ok')
        }catch(e){console.error(e);console.log('25');}
      });

      socket.on("add msg", async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.addMessage("admin",msg.destinataire,false,msg.texte,msg.title,hashHour())
          socket.emit("add msg",'ok')
        }catch(e){console.error(e);console.log('26');}
      });

      socket.on("add news", async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.addNews("admin",msg.texte,msg.title,hashHour())
          socket.emit("add news",'ok')
        }catch(e){console.error(e);console.log('27');}
      });

      socket.on("add sondage", async msg => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.addSondage("admin",msg.texte,msg.title,hashHour(),msg.mode,msg.choix)
          socket.emit("add sondage",'ok')
        }catch(e){console.error(e);console.log('28');}
      });

      socket.on("addPret", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.addPret(req.obj,req.uuid,req.debut)
          socket.emit("addPret",'ok')
        }catch(e){console.error(e);console.log('29');}
      });

      socket.on("finPret", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.finPret(req.obj,req.uuid,req.debut,req.fin)
          socket.emit("finPret",'ok')
        }catch(e){console.error(e);console.log('30');}
      });

      socket.on("commentairePret", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          funcDB.commentairePret(req.obj,req.uuid,req.debut,req.com)
          socket.emit("commentairePret",'ok')
        }catch(e){console.error(e);console.log('31');}
      });

      socket.on("getPretsActuel", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          socket.emit("getPretsActuel",await funcDB.getPretsActuel())
        }catch(e){console.error(e);console.log('32');}
      });

      socket.on("getAllPrets", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
          socket.emit("getAllPrets",await funcDB.getAllPrets())
        }catch(e){console.error(e);console.log('33');}
      });
    }
  })
  io.on("connection", async (socket) => {
    try {
      let user = await User.searchToken(socket.handshake.auth.token)
      console.log("uuid socket: " + await user.uuid)
      funcSocket.id_data(socket,user)


      if(user.uuid!=null){
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
        funcSocket.suppAllToken(socket,user)
      }
    } catch (e) {console.error(e);console.log('34');}
  });

  //db.run('drop table midi_list')
}
main().catch(console.error);