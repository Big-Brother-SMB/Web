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

const jsonString = fs.readFileSync(__dirname+"/code.json")
const jsonObj = JSON.parse(jsonString);
const oauth2Client = new google.auth.OAuth2(
  jsonObj.client_id,
  jsonObj.code_secret,
  "http://localhost:3000/oauth2callback"
);


const authorizationUrl = oauth2Client.generateAuthUrl({
  scope: ["https://www.googleapis.com/auth/userinfo.email","openid"],
  include_granted_scopes: true
});

let server
let db 

async function main() {
  io = new Server(3001,{cors: {
    origin: "http://localhost",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }})
  io.on("connection", (socket) => {
    db.get("SELECT uuid FROM token where token=?",[socket.handshake.auth.token], (err, data) => {
      console.log(data)
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
                console.log(e)
                socket.emit('id_data',"err")
              }
            })
          }catch(e){
            console.log(e)
            socket.emit('id_data',"err")
          }
        })
    });
  });
  
  
  
  db = new sqlite3.Database('main.db', err => {
    if (err)
      throw err
    console.log("ok")
    db.serialize(()=>{
      db.all("SELECT * FROM token", (err, data) => {
        console.log(data)
      })
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
          console.log(emailT[1])
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
                res.writeHead(301, { "Location" : "http://localhost/index.html?" + tokenAuth});
                res.end();
                //fs.readFileSync(__dirname+"/test.html")
              })
            })
          } else {
            res.writeHead(200);
            res.end('Il faut un email stemariebeaucamps.fr');
          }
        } catch (error) {
          console.error(error);
          res.writeHead(200);
          res.end('Erreur !!!');
        }
      }
    } else {
      res.writeHead(200);
      res.end('...');
    }
  }).listen(3000);
}
main().catch(console.error);