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

async function main() {
  db = new sqlite3.Database('main.db', err => {
    if (err)
      throw err
    db.serialize(()=>{
      db.get("SELECT * FROM sqlite_master where type='table' AND name='users'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE users(uuid UUID, first_name text, last_name text, email text, code_barre CHAR[5], classe text, groups text, amis text,tuto bool,admin int)')
      })
      db.get("SELECT * FROM sqlite_master where type='table' AND name='token'", (err, data) => {
        if(data==undefined)
          db.run('CREATE TABLE token(token text,uuid UUID,date DATE)')
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
          console.log(data.email)
          emailT=data.email.split("@")
          if(emailT[1]=="stemariebeaucamps.fr"){
            let uuidG = uuid.v4()
            db.serialize(()=>{
              db.get("SELECT * FROM 'users' where email=?",[data.email], (err, data2) => {
                console.log(data2)
                if(data2==undefined){
                  let tName=emailT[0].split(".")
                  let first_name=tName[0]
                  let last_name=""
                  if(tName.length>=2){
                    last_name=tName[1]
                  }
                  first_name=first_name[0].toUpperCase()+first_name.slice(1)
                  last_name=last_name.toUpperCase();
                  db.run("INSERT INTO users(email,uuid,first_name,last_name,admin) VALUES(?,?,?,?,?)", [data.email,uuidG,first_name,last_name,0])
                }else{
                  uuidG=data2.uuid
                }
                let tokenAuth = rand.generateKey();
                let date=dateTime.format(new Date(), 'YYYY/MM/DD');
                db.run("INSERT INTO token(token,uuid,date) VALUES(?,?,?)", [tokenAuth,uuidG,date])
                res.writeHead(301, { "Location" : address+"index.html?token=" + tokenAuth});
                res.end();
                //fs.readFileSync(__dirname+"/test.html")
              })
            })
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
    origin: "http://localhost:3000/",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }})
  io.on("connection", (socket) => {
    db.get("SELECT uuid FROM token where token=?",[socket.handshake.auth.token], (err, data) => {
      try{
        console.log(data.uuid)
      }catch(e){}
    })

    socket.on('id_data', msg => {
        db.get("SELECT uuid FROM token where token=?",[socket.handshake.auth.token], (err, data) => {
          try{
            db.get("SELECT * FROM users where uuid=?",[data.uuid], (err, data) => {
              try{
                if(data!=undefined && err)return
                console.log(data)
                socket.emit('id_data',data)
              }catch(e){
                console.error(e)
                socket.emit('id_data',"err")
              }
            })
          }catch(e){
            console.error(e)
            socket.emit('id_data',"err")
          }
        })
    });
  });
}
main().catch(console.error);