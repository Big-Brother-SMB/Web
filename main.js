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
      options: { destination: __dirname+'/../main.log' } // On enregistre les logs dans un fichier main.log
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
const path = require('node:path');
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
  '.db': '',
  '.zip': ''
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

const funcSocketAdmin = require('./server/functionsSocketAdmin.js')

const UserSelect = require('./server/UserSelect.js')

const init_DB = require('./server/initDB.js')

const generatePage = require('./server/generatePage.js')

const funcDate = require('./server/functionsDate.js')

/*
function convertPath(path){
  if(process.platform=="win32"){
    return path.win32.normalize(path)
  }else{
    return path.posix.normalize(path)
  }
}
*/
process.env.TZ = 'Europe/Amsterdam' 

db = new sqlite3.Database(__dirname+'/../main.db', err => {
  if (err)
    throw err
  db.serialize(init_DB(db))
  User.setDB(db)
  funcDB.setDB(db)
  UserSelect.setDB(db)

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
            res.writeHead(200, {'Content-Type': mimeTypes[extName],'Cache-Control':'public, max-age=1'});//43200
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
      funcSocketAdmin.setMyAdminMode(socket,user)
      funcSocketAdmin.addGlobalPoint(socket,user)
      funcSocketAdmin.addPersonalPoint(socket,user)
      funcSocketAdmin.getGlobalPoint(socket,user)
      funcSocketAdmin.setBanderole(socket,user)
      funcSocketAdmin.setMenu(socket,user)
      funcSocketAdmin.setMidiInfo(socket,user)
      funcSocketAdmin.getGroupAndClasse(socket,user)
      funcSocketAdmin.getListPass(socket,user)
      funcSocketAdmin.scan(socket,user)
      funcSocketAdmin.setDorI(socket,user)
      funcSocketAdmin.delDorI(socket,user)
      funcSocketAdmin.setPermOuvert(socket,user)
      funcSocketAdmin.delPermDemande(socket,user)
      funcSocketAdmin.setPermInscrit(socket,user)
      funcSocketAdmin.startAlgo(socket,user)
      funcSocketAdmin.setUser(socket,user)
      funcSocketAdmin.getScoreList(socket,user)
      funcSocketAdmin.delPersonalPoint(socket,user)
      funcSocketAdmin.delGlobalPoint(socket,user)
      funcSocketAdmin.copyKey(socket,user)
      funcSocketAdmin.addPret(socket,user)
      funcSocketAdmin.finPret(socket,user)
      funcSocketAdmin.commentairePret(socket,user)
      funcSocketAdmin.getPretsActuel(socket,user)
      funcSocketAdmin.getAllPrets(socket,user)

      funcSocketAdmin.newCookieSubscription(socket,user)
      funcSocketAdmin.modifCookieSubscription(socket,user)
      funcSocketAdmin.delCookieSubscription(socket,user)
      funcSocketAdmin.getCookieSubscription(socket,user)
      funcSocketAdmin.newCookieTicket(socket,user)
      funcSocketAdmin.modifCookieTicket(socket,user)
      funcSocketAdmin.delCookieTicket(socket,user)
      funcSocketAdmin.getCookieTicket(socket,user)
      funcSocketAdmin.newBan(socket,user)
      funcSocketAdmin.modifBan(socket,user)
      funcSocketAdmin.delBan(socket,user)
      funcSocketAdmin.getBan(socket,user)

      funcSocketAdmin.getUserIsBan(socket,user)
      funcSocketAdmin.getUserHasCookie(socket,user)
      funcSocketAdmin.useCookie(socket,user)
    }
  })
  io.on("connection", async (socket) => {
    try {
      let user = await User.searchToken(socket.handshake.auth.token)
      console.log("uuid socket: " + await user.uuid)
      funcSocket.id_data(socket,user)
      funcSocket.getBanderole(socket,user)
  
  
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

        funcSocket.getCookies(socket,user)
      }
    } catch (e) {console.error(e);console.log('34');}
  });
  
  async function loop(){
    //Subscription Cookie
    const weekMS = 604800000
    console.log("clock")
    let listCookie = await funcDB.getSubscriptionCookie()
    for(const abo of listCookie){
      if(new Date(abo.debut).getTime()<Date.now()){
        let period = abo.period+1
        if(period == 3) period=4

        let maj
        if(abo.maj==null){
          maj = abo.debut
          await funcDB.modifSubscriptionCookie(abo.id,abo.uuid,abo.debut,abo.fin,abo.justificatif,abo.period,abo.cumulatif,abo.nbAdd,abo.quantity+abo.nbAdd,new Date(abo.debut))
        }else{
          maj = abo.maj
        }
        maj = new Date(maj).getTime() + weekMS*period
        if(maj < Date.now() && maj < new Date(abo.fin).getTime()){
          let nouveauCookie = abo.nbAdd
          if(abo.cumulatif) nouveauCookie+=abo.quantity
          await funcDB.modifSubscriptionCookie(abo.id,abo.uuid,abo.debut,abo.fin,abo.justificatif,abo.period,abo.cumulatif,abo.nbAdd,nouveauCookie,new Date(maj))
        }
      }
    }

    //auto algo
    let now = new Date()
    let w = funcDate.actualWeek
    let j = now.getDay()
    if(j==1 || j==2)
      j--
    else if(j==4 || j==5){
      j-=2
    }else{
      j=null
    }
    if(j!=null){
      let info11 = await funcDB.getMidiInfo(w,j*2)
      let info12 = await funcDB.getMidiInfo(w,j*2+1)
      if(now.getHours()==10 && now.getMinutes()==30 && info11.algo_auto>0){
        await UserSelect.algoDeSelection(w,j*2)
      }
      if(now.getHours()==0 && now.getMinutes()==0 && info11.algo_auto==2){
        await UserSelect.algoDeSelection(w,j*2)
      }
      if(now.getHours()==10 && now.getMinutes()==0 && info12.algo_auto>0){
        await UserSelect.algoDeSelection(w,j*2+1)
      }
      if(now.getHours()==0 && now.getMinutes()==0 && info12.algo_auto==2){
        await UserSelect.algoDeSelection(w,j*2+1)
      }
    }
    setTimeout(loop, 30000);
  }
  loop()
})