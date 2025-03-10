const uuidG = require('uuid');
const rand = require("generate-key");
const webpush = require('web-push');
const fs = require('fs');
const path = require('node:path');
const funcDB = require('./functionsDB.js');
const { subscribe } = require('diagnostics_channel');
const https = require('https');
const request = require('request');

const jsonObj = JSON.parse(fs.readFileSync(path.join(__dirname,"..","..","code.json")));
const py_token = jsonObj.admin
const address = jsonObj.address
const VAPID_PRIVATE_KEY = jsonObj.vapidPrivateKey
const VAPID_PUBLIC_KEY = jsonObj.vapidPublicKey

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
              }catch(e){console.error("U");;console.log('d1');;resolve(null)}
          })
          setTimeout(reject,10000)
        } catch (e) {console.error("U");;console.log('d2');}
      })
  }
  
  //user et  plus
  static createUser(email,picture){
      return new Promise(function(resolve, reject) {
        try{
          let uuid = uuidG.v4()
          if(email == "super.admin@admin.super"){
            uuid = "admin-uuid-777"
          }
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
                      db.run("INSERT INTO users(email,uuid,first_name,last_name,admin,picture,verify) VALUES(?,?,?,?,0,?,0)", [email,uuid,first_name,last_name,picture])
                  }else{
                      uuid=data.uuid
                      console.log(email,data.classe, uuid)
                      db.run("UPDATE users SET picture=? where email=?", [picture,email])
                  }
                  resolve(new User(uuid))
              }catch(e){console.error("U");;console.log('d3');;resolve(null)}
          })
          setTimeout(reject,10000)
        } catch (e) {console.error("U");;console.log('d4');}
      })
  }

  createToken(){
      let uuid=this.uuid
      return new Promise(function(resolve, reject) {
        try{
          let tokenAuth = rand.generateKey(24);
          let date = new Date()
          db.run("INSERT INTO token(token,uuid,creation,last_use) VALUES(?,?,?,?)", [tokenAuth,uuid,date,date])
          resolve(tokenAuth)
        } catch (e) {console.error("U");;console.log('d5');}
      })
  }
  
  suppAllToken(){
      db.run("delete from token WHERE uuid=?",[this.uuid])
  }

  static searchToken(token){
    return new Promise(function(resolve, reject) {
      try{
      db.get("SELECT uuid FROM token where token=?",[token], async(err, data) => {
        try {
          if(data!=undefined){
            db.run("UPDATE token SET last_use=? where token=?",[new Date(),token])
            resolve(new User(data.uuid))
          }else if(py_token==token){
            let user = await User.createUser("super.admin@admin.super","https://foyerlycee.stemariebeaucamps.fr/assets/nav_bar/admin.png")

            if(!(await user.admin)){
              user.admin=1
            }
            user.admin_permission = undefined
            resolve(user)
          }else{
            resolve(new User(null))
          }
        }catch(e){console.error("U");;console.log('d6');;resolve(null)}
      })
      setTimeout(reject,10000)
      } catch (e) {console.error("U");;console.log('d7');}
    })
  }

  async subscribeNotification(subscribe){
    let uuid = this.uuid
    let subscription_id = uuidG.v4()
    let date = new Date()
    db.get("SELECT * FROM users_notification_subscription where uuid=? and endpoint=? and p256dh=? and auth=?",[uuid,subscribe.endpoint,subscribe.keys.p256dh,subscribe.keys.auth], async(err, data) => {
      try {
        if(data==undefined){
          db.run("INSERT INTO users_notification_subscription(subscription_id,uuid,endpoint,p256dh,auth,creation,last_use) VALUES(?,?,?,?,?,?,?)", [subscription_id,uuid,subscribe.endpoint,subscribe.keys.p256dh,subscribe.keys.auth,date,date])
        }
      }catch(e){console.error("U");;console.log('d6');;resolve(null)}
    })
    return
  }
  async existNotificationSubscription(){
    let uuid = this.uuid
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM users_notification_subscription where uuid=?",[uuid], async(err, data) => {
        try {
          if(data!=undefined){
            resolve(true)
          }else{
            resolve(false)
          }
        }catch(e){console.error("U");;console.log('d6');resolve(null)}
      })
      setTimeout(reject,10000)
    })
  }

  static async download_profile_picture(){
    try {
      let users_list = await User.listUserComplete();
      const dirPath = path.join(__dirname, "..", "sources", "profile_picture");
  
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
  
      for (const user of users_list) {
        const imageURL = user.picture && user.picture !== "" ? user.picture : "https://lh3.googleusercontent.com/a/default-user=s96-c";
        const fileName = user.uuid + ".jpg";
        const filePath = path.join(dirPath, fileName);
  
        var agent = new https.Agent({
          port: '443',
          path: '/',
          rejectUnauthorized: false
        });
  
        var options = {
          url: imageURL,
          agent: agent
        };
  
        try {
          // Check if file exists and remove it asynchronously
          if (fs.existsSync(filePath)) {
            await fs.promises.rm(filePath);
          }
  
          await new Promise((resolve, reject) => {
            request(options)
              .pipe(fs.createWriteStream(filePath))
              .on('finish', resolve)
              .on('error', reject);
          });
  
          console.log(`Image saved for user ${user.uuid}`);
        } catch (error) {
          console.error(`Error processing user ${user.uuid}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching user list:', error);
    }
  }

  async sendNotif(title,body,icon,url){
    let uuid = this.uuid
    db.all("SELECT * FROM users_notification_subscription where uuid=?",[uuid], async(err, data) => {
      try {
        data.forEach(subscription=>{
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh
            }
          };

          const payload = {
            title: title,
            body: body,
            badge: "/assets/logo.png",
            icon: icon,
            user_id: uuid,
            data: {
              url:address + url
            }
          };
          
          const options = {
            vapidDetails: {
                subject: 'mailto:example_email@example.com',
                publicKey: VAPID_PUBLIC_KEY,
                privateKey:VAPID_PRIVATE_KEY
            },
            TTL: 60,
          };
          webpush.sendNotification(pushSubscription, JSON.stringify(payload), options).then((_) => {
            console.log('SENT NOTIF!!!');
          }).catch((_) => {
            db.run("delete from users_notification_subscription WHERE subscription_id=?",[subscription.subscription_id])
            console.log('ERROR NOTIF!!!');
            console.error(_)
          });
        })
      }catch(e){console.error("U");;console.log('d6');;resolve(null)}
    })
  }

  static async sendNotifAll(title,body,icon,url){
    db.all("SELECT * FROM users_notification_subscription", async(err, data) => {
      try {
        data.forEach(subscription=>{
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh
            }
          };
          const payload = {
            title: title,
            body: body,
            badge: "/assets/logo.png",
            icon: icon,
            user_id: subscription.uuid,
            data: {
              url:address + url
            }
          };
          
          const options = {
            vapidDetails: {
                subject: 'mailto:example_email@example.com',
                publicKey: VAPID_PUBLIC_KEY,
                privateKey:VAPID_PRIVATE_KEY
            },
            TTL: 60,
          };
          webpush.sendNotification(pushSubscription, JSON.stringify(payload), options).then((_) => {
            console.log('SENT NOTIF!!!');
          }).catch((_) => {
            db.run("delete from users_notification_subscription WHERE subscription_id=?",[subscription.subscription_id])
            console.log('ERROR NOTIF!!!');
            console.error(_)
          });
        })
      }catch(e){console.error("U");;console.log('d6');;resolve(null)}
    })
  }

  static listUserName(){
      return new Promise(function(resolve, reject) {
        try{
          db.all("SELECT uuid,first_name,last_name FROM users ORDER BY first_name ASC, last_name ASC, uuid ASC", (err, data) => {
              try{
                  if(data!=undefined){
                      resolve(data)
                  }else{
                      resolve([])
                  }
              }catch(e){console.error("U");;console.log('d8');;resolve([])}
          })
          setTimeout(reject,10000)
        } catch (e) {console.error("U");;console.log('d9');}
      })
  }

  static listUser(){
    return new Promise(function(resolve, reject) {
      try{
        db.all("SELECT * FROM users ORDER BY first_name ASC, last_name ASC, uuid ASC", (err, data) => {
            try{
                if(data!=undefined){
                    resolve(data)
                }else{
                    resolve([])
                }
            }catch(e){console.error("U");;console.log('d8');;resolve([])}
        })
        setTimeout(reject,10000)
      } catch (e) {console.error("U");;console.log('d9');}
    })
  }

  
  static listUserComplete(){
    return new Promise(function(resolve, reject) {
        db.all("SELECT users.[uuid] AS real_uuid,* FROM users LEFT JOIN admin_permission ON users.uuid = admin_permission.uuid LEFT JOIN user_groups ON users.uuid = user_groups.uuid ORDER BY first_name ASC, last_name ASC, uuid ASC;", async (err, data) => {
          try{
              if(data!=undefined){
                let utilisateur = {}
                let list = []
                for(let i in data){
                  if(utilisateur.real_uuid != data[i].real_uuid || i==0){
                    if(i!=0) list.push(utilisateur)
                    utilisateur = { ...data[i]}
                    delete utilisateur.group2
                    utilisateur.groups = []
                    utilisateur.uuid = utilisateur.real_uuid
                    //admin_permission
                    utilisateur.admin_permission = {uuid:utilisateur.real_uuid , groupe_permission:utilisateur.groupe_permission, pass:utilisateur.pass, foyer_repas:utilisateur.foyer_repas, foyer_perm:utilisateur.foyer_perm, banderole:utilisateur.banderole, user_editor:utilisateur.user_editor, messagerie:utilisateur.messagerie, cookie:utilisateur.cookie, admin_only:utilisateur.admin_only, localisation:utilisateur.localisation, CDI:utilisateur.CDI, "Aumônerie":utilisateur["Aumônerie"], DOC:utilisateur.DOC, "Audio":utilisateur["Audio"], Tutorat:utilisateur.Tutorat, "City_stade":utilisateur["City_stade"], "Bien_être":utilisateur["Bien_être"]}
                    delete utilisateur.groupe_permission
                    delete utilisateur.pass
                    delete utilisateur.foyer_repas
                    delete utilisateur.foyer_perm
                    delete utilisateur.banderole
                    delete utilisateur.user_editor
                    delete utilisateur.messagerie
                    delete utilisateur.cookie
                    delete utilisateur.admin_only
                    delete utilisateur.localisation
                    delete utilisateur.CDI
                    delete utilisateur["Aumônerie"]
                    delete utilisateur.DOC
                    delete utilisateur["Audio"]
                    delete utilisateur.Tutorat
                    delete utilisateur["City_stade"]
                    delete utilisateur["Bien_être"]

                    utilisateur.ban = null
                  }
                  if(data[i].group2!=null){
                    utilisateur.groups.push(data[i].group2)
                  }
                }
                list.push(utilisateur)
                for(let i in list){
                  delete list[i].real_uuid
                }
                db.all("SELECT * FROM users LEFT JOIN ban ON users.uuid = ban.uuid ORDER BY first_name ASC, last_name ASC, uuid ASC;", async (err, data) => {
                  try{
                      if(data!=undefined){
                        let iUser = 0
                        for(let i in data){
                          if(list[iUser].uuid != data[i].uuid){
                            iUser++
                          }
                          if(new Date(data[i].fin).getTime()>Date.now() && new Date(data[i].debut).getTime()<Date.now()){
                            list[iUser].ban = {id:data[i].id,uuid:data[i].uuid,debut:data[i].debut,fin:data[i].fin,justificatif:data[i].justificatif}
                          }
                        }
                      }
                      resolve(list)
                  }catch(e){
                    console.error(e);
                    console.log('d12');
                    resolve([]);
                  }
                })
              }else{
                resolve([])
              }
          }catch(e){
            console.error(e);
            console.log('d12');
            resolve([]);
          }
        })
        setTimeout(reject,20000)
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
              }catch(e){console.error("U");;console.log('d13');;resolve(null)}
          })
          setTimeout(reject,10000)
      })
  }
  #setInfo(key,value){
    let uuid=this.uuid
    db.get("SELECT * FROM users where uuid=?",[uuid], (err, data) => {
        if(data!=undefined){
            db.run("UPDATE users SET "+ key +"=? where uuid=?",[value,uuid])
        }
    })
  }

  get all(){
      let uuid = this.uuid
      let groups = this.groups
      let admin_permission = this.admin_permission
      let achievement = this.achievement
      return new Promise(function(resolve, reject) {
          db.get("SELECT * FROM users where uuid=?",[uuid], async (err, data) => {
              try{
                  if(data!=undefined){
                      data.groups = await groups
                      data.admin_permission = await admin_permission
                      data.achievement = await achievement
                      resolve(data)
                  }else{
                      resolve(null)
                  }
              }catch(e){console.error("U");;console.log('d14');resolve(null)}
          })
          setTimeout(reject,10000)
      })
  }

  set all(args){
    if(args.mode_addCSV){
      db.run("UPDATE users SET first_name=?, last_name=?, code_barre=?, classe=?, birthday=?, birthmonth=?, verify=? WHERE uuid=?",[args.first_name,args.last_name,args.code_barre,args.classe,args.birthday,args.birthmonth,args.verify,this.uuid])
    }else{
      db.run("UPDATE users SET first_name=?, last_name=?, code_barre=?, classe=?, admin=?, birthday=?, birthmonth=?, verify=? WHERE uuid=?",[args.first_name,args.last_name,args.code_barre,args.classe,args.admin,args.birthday,args.birthmonth,args.verify,this.uuid])
      this.admin_permission = args.admin_permission
    }
    this.groups = args.listGroups
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

  get birthday()   {
    return this.#getInfo("birthday")
  }
  set birthday(value)   {
      this.#setInfo("birthday",value)
  }

  get birthmonth()   {
    return this.#getInfo("birthmonth")
  }
  set birthmonth(value)   {
      this.#setInfo("birthmonth",value)
  }

  get achievement(){
    let uuid=this.uuid
    return new Promise(function(resolve, reject) {
        db.get("SELECT * FROM achievement where uuid=?",[uuid], (err, data) => {
            try{
              if(data!=undefined){
                resolve(data)
              }else{
                resolve({})
              }
            }catch(e){console.error("U");;console.log('d13');;resolve(null)}
        })
        setTimeout(reject,10000)
    })
  }
  set achievement(value){
    let uuid=this.uuid
    db.get("SELECT * FROM achievement where uuid=?",[uuid], (err, data) => {
        if(data!=undefined){
            db.run("UPDATE achievement SET "+ value[0] +"=? where uuid=?",[value[1],uuid])
        } else{
            db.run("INSERT INTO achievement(uuid," + value[0] + ") VALUES (?,?)",[uuid,value[1]])
        }
    })
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
                                if(data2.procuration==1){
                                  resolve({uuid:e.ami,IgiveProc:e.procuration,HeGiveMeProc:1})
                                }else{
                                  resolve({uuid:e.ami,IgiveProc:e.procuration,HeGiveMeProc:0})
                                }
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
              }catch(e){console.error("U");;console.log('d15');;resolve([])}
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
              }catch(e){console.error("U");;console.log('d16');;resolve([])}
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

  get admin_permission(){
    let uuid=this.uuid
    return new Promise(async function(resolve, reject) {
        db.get("SELECT * FROM admin_permission where uuid=?",[uuid], (err, data) => {
            try{
              data = User.obj_groupe_permission(data,uuid)
              resolve(data)
            }catch(e){console.error("U");;console.log('d16');;resolve([])}
        })
        setTimeout(reject,10000)
    })
  }

  static obj_groupe_permission(obj,uuid){
    if(obj==undefined || obj.groupe_permission==1){
      //DEV
      return {uuid:uuid,groupe_permission:1,pass:1,foyer_repas:2,foyer_perm:2,banderole:1,user_editor:1,messagerie:1,cookie:2,admin_only:0,localisation:2,CDI:2,Aumônerie:2,DOC:2,Audio:2,Tutorat:2,City_stade:2,"Bien_être":2}
    }else if(obj.groupe_permission==2){
      //Foyer
      return {uuid:uuid,groupe_permission:2,pass:1,foyer_repas:2,foyer_perm:2,banderole:1,user_editor:1,messagerie:0,cookie:2,admin_only:1,localisation:0,CDI:0,Aumônerie:0,DOC:0,Audio:0,Tutorat:0,City_stade:0,"Bien_être":0}
    }else if(obj.groupe_permission==3){
      //Perm
      return {uuid:uuid,groupe_permission:3,pass:1,foyer_repas:0,foyer_perm:1,banderole:0,user_editor:0,messagerie:0,cookie:1,admin_only:1,localisation:2,CDI:2,Aumônerie:1,DOC:1,Audio:2,Tutorat:2,City_stade:2,"Bien_être":2}
    }else if(obj.groupe_permission==4){
      //Responsable
      return {uuid:uuid,groupe_permission:4,pass:0,foyer_repas:0,foyer_perm:1,banderole:1,user_editor:1,messagerie:0,cookie:1,admin_only:1,localisation:2,CDI:2,Aumônerie:2,DOC:2,Audio:2,Tutorat:2,City_stade:2,"Bien_être":2}
    }
    return obj
  }

  set admin_permission(obj){
    let uuid = this.uuid
    let user = this
    obj = User.obj_groupe_permission(obj,uuid)
    db.get("SELECT * FROM admin_permission where uuid=?",[uuid], async (err, data) => {
      try {
        if(await user.admin == 0 || await user.admin == null) return
        if(data!=undefined){
          db.run("UPDATE admin_permission SET groupe_permission=?,pass=?,foyer_repas=?,foyer_perm=?,banderole=?,user_editor=?,messagerie=?,cookie=?,admin_only=?,localisation=?,CDI=?,Aumônerie=?,DOC=?,Audio=?,Tutorat=?,City_stade=?, Bien_être=? WHERE uuid=?"
          ,[obj.groupe_permission,obj.pass,obj.foyer_repas,obj.foyer_perm,obj.banderole,obj.user_editor,obj.messagerie,obj.cookie,obj.admin_only,obj.localisation,obj.CDI,obj.Aumônerie,obj.DOC,obj.Audio,obj.Tutorat,obj.City_stade,obj.Bien_être,uuid])
        }else{
          db.run("INSERT INTO admin_permission(uuid,groupe_permission,pass,foyer_repas,foyer_perm,banderole,user_editor,messagerie,cookie,admin_only,localisation,CDI,Aumônerie,DOC,Audio,Tutorat,City_stade,Bien_être) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
          ,[uuid,obj.groupe_permission,obj.pass,obj.foyer_repas,obj.foyer_perm,obj.banderole,obj.user_editor,obj.messagerie,obj.cookie,obj.admin_only,obj.localisation,obj.CDI,obj.Aumônerie,obj.DOC,obj.Audio,obj.Tutorat,obj.City_stade,obj.Bien_être])
        }
      }catch(e){console.error("U");;console.log('d17');}
    })
  }
//
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
        }catch(e){console.error("U");;console.log('d17');;resolve({})}
      })
      setTimeout(reject,10000)
    })
  }
  setMidiDemande(semaine,creneau,amis,DorI,scan,sandwich){
    let uuid = this.uuid
    db.get("SELECT * FROM midi_list where semaine=? and creneau=? and uuid=?",[semaine,creneau,uuid], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO midi_list(semaine,creneau,uuid,scan,DorI,sandwich,date) VALUES (?,?,?,?,?,?,?)",[semaine,creneau,uuid,scan,DorI,sandwich,new Date()])
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
        }catch(e){console.error("U");;console.log('d18');;resolve({})}
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
                                let info=await funcDB.getMidiInfo(data[i].semaine,data[i].creneau)
                                if(info==undefined){
                                  resolve2(undefined)
                                  return
                                }
                                if(info.gratuit_prio){
                                  let groups = await moi.groups
                                  let classe = await moi.classe
                                  if(info.prio.indexOf(classe)!=-1){
                                    info.cout=0
                                  }
                                  groups.forEach(e=>{
                                    if(info.prio.indexOf(e)!=-1){
                                      info.cout=0
                                    }
                                  })
                                }
                                if(!data[i].scan && info.ouvert==4){
                                  info.penalite=true
                                  info.cout+=1
                                }
                                resolve2(info)
                              })
                              if(r!=undefined)
                                lists.midi.push(r)
                            }
                          }
                          resolve(lists)
                      }catch(e){console.error("U");;console.log('d19');;resolve([])}
                    })
                }catch(e){console.error("U");;console.log('d20');;resolve([])}
              })
          }catch(e){console.error("U");;console.log('d21');;resolve([])}
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
                                  let info=await funcDB.getMidiInfo(data[i].semaine,data[i].creneau)
                                  if(info==undefined){
                                    resolve2(undefined)
                                    return
                                  }
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
                                  }
                                  if(!data[i].scan && info.ouvert==4){
                                    info.cout+=1
                                  }
                                  resolve2(info)
                                })
                                if(r!=undefined){
                                  score-=r.cout
                                }
                              }
                          }
                          resolve(score)
                      }catch(e){console.error("U");;console.log('d22');;resolve(null)}
                    })
                }catch(e){console.error("U");;console.log('d23');;resolve(null)}
              })
          }catch(e){console.error("U");;console.log('d24');;resolve(null)}
      })
      setTimeout(reject,10000)
    })
  }

  get cookies(){
    let uuid=this.uuid
    return new Promise(function(resolve, reject) {
      let cookies = {ticket:[],abo:[],ban:[]}
      db.all("SELECT * FROM ticket_cookie WHERE uuid=? and date IS NULL",[uuid], (err, data) => {
          try{
              if(data!=undefined){
                  data.forEach(e=>{
                      cookies.ticket.push(e)
                  })
              }
              db.all("SELECT * FROM subscription_cookie WHERE uuid=? ORDER BY cumulatif DESC",[uuid], (err, data) => {
                try{
                    if(data!=undefined){
                      data.forEach(e=>{
                        cookies.abo.push(e)
                      })
                    }
                    db.all("SELECT * FROM ban WHERE uuid=?",[uuid], (err, data) => {
                      try{
                          if(data!=undefined){
                            data.forEach(e=>{
                              cookies.ban.push(e)
                            })
                          }
                          resolve(cookies)
                      }catch(e){console.error("U");;console.log('d23-1');;resolve(null)}
                    })
                }catch(e){console.error("U");;console.log('d23');;resolve(null)}
              })
          }catch(e){console.error("U");;console.log('d24');;resolve(null)}
      })
      setTimeout(reject,10000)
    })
  }

  get ban(){
    let uuid=this.uuid
    return new Promise(function(resolve, reject) {
      db.all("SELECT * FROM ban WHERE uuid=?",[uuid], (err, data) => {
          if(data!=undefined){
            for(const ban of data){
              if(new Date(ban.fin).getTime()>Date.now() && new Date(ban.debut).getTime()<Date.now()){
                resolve(ban)
                return
              }
            }
          }
          resolve(null)
      })
      setTimeout(reject,10000)
    })
  }

  async useCookie(){
    let cookies = await this.cookies
    if(await this.hasCookieBirthDay()){
      await funcDB.addTicketCookie(this.uuid,new Date(),"anniversaire")
      return true
    }
    for(let i in cookies.abo){
      if(cookies.abo[i].quantity>0){
        await funcDB.addTicketCookie(cookies.abo[i].uuid,new Date(),"Abonnement("+ cookies.abo[i].id +"):"+cookies.abo[i].justificatif)
        await funcDB.modifSubscriptionCookie(cookies.abo[i].id,cookies.abo[i].uuid,cookies.abo[i].debut,cookies.abo[i].fin,cookies.abo[i].justificatif,cookies.abo[i].period,cookies.abo[i].cumulatif,cookies.abo[i].nbAdd,cookies.abo[i].quantity-1,cookies.abo[i].maj)
        return true
      }
    }
    if(cookies.ticket.length!=0){
      await funcDB.modifTicketCookie(cookies.ticket[0].id,cookies.ticket[0].uuid,new Date(),cookies.ticket[0].justificatif)
      return true
    }
    return false
  }

  async hasCookie(){
    let cookies = await this.cookies
    if(await this.hasCookieBirthDay()){
      return true
    }
    for(let i in cookies.abo){
      if(cookies.abo[i].quantity>0){
        return true
      }
    }
    if(cookies.ticket.length!=0){
      return true
    }
    return false
  }

  async hasCookieBirthDay(){
    const uuid = this.uuid
    let birthday = await this.birthday
    let birthmonth = await this.birthmonth
    let dateToday = new Date()
    if(birthday==dateToday.getDate() && birthmonth==dateToday.getMonth()+1){
      return await new Promise(function(resolve, reject) {
        db.all("SELECT * FROM ticket_cookie WHERE uuid=?",[uuid], (err, data) => {
          try{
            let test = true
            if(data!=undefined){
                data.forEach(e=>{
                  if(e.justificatif=="anniversaire"){
                    test=false
                  }
                })
            }
            resolve(test)
          }catch(e){console.error(e)}
        })
      })
    }else{
      return false
    }
  }

  //lieu
  getLieu(semaine,day,creneau){
    let uuid=this.uuid
    return new Promise(function(resolve, reject) {
      db.get("SELECT * FROM lieu_list where uuid=? and semaine=? and day=? and creneau=?",[uuid,semaine,day,creneau], (err, data) => {
        try {
          if(data!=undefined){
            resolve(data)
          }else{
            resolve(null)
          }
        }catch(e){console.error("U");;console.log('a-3');resolve(null)}
      })
      setTimeout(reject,10000)
    })
  }

  setLieu(lieu,semaine,day,creneau,scan){
    let uuid=this.uuid
    db.get("SELECT * FROM 'lieu_list' where uuid=? and semaine=? and day=? and creneau=?",[uuid,semaine,day,creneau], (err, data) => {
      if(data==undefined){
        db.run("INSERT INTO lieu_list(uuid,lieu,semaine,day,creneau,scan) VALUES (?,?,?,?,?,?)",[uuid,lieu,semaine,day,creneau,scan])
      } else{
        db.run("UPDATE lieu_list SET lieu=?, scan=? where uuid=? and semaine=? and day=? and creneau=?",[lieu,scan,uuid,semaine,day,creneau])
      }
    })
  }

  delLieu(semaine,day,creneau){
    db.run("DELETE FROM lieu_list WHERE uuid=? and semaine=? and day=? and creneau=?",[this.uuid,semaine,day,creneau])
  }

  removeUser(){
    db.run("DELETE FROM achievement WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM admin_permission WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM amis WHERE uuid=? or ami=?",[this.uuid,this.uuid])
    db.run("DELETE FROM ban WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM emprunt WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM lieu_list WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM midi_amis WHERE uuid=? or amis=?",[this.uuid,this.uuid])
    db.run("DELETE FROM midi_list WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM perm_list WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM point_perso WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM post_lu WHERE user=?",[this.uuid])
    db.run("DELETE FROM sondage_menu WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM token WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM user_groups WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM users WHERE uuid=?",[this.uuid])
    db.run("DELETE FROM users_notification_subscription WHERE uuid=?",[this.uuid])
    // post / cookie(ticket/abo)
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
                      }catch(e){console.error("U");;console.log('d25');;resolve(null)}
                    })
                }catch(e){console.error("U");;console.log('d26');;resolve(null)}
              })
          }catch(e){console.error("U");;console.log('d27');;resolve(null)}
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

  /*addPDF(id,title,group){
    db.run("INSERT INTO pdf(id,from2,group2,title,date) VALUES (?,?,?,?,?)",[id,this.uuid,group,title,new Date()])
  }

  modifPDF(id,title){
    db.run("UPDATE pdf SET title=? where id=?",[title,id])
  }

  suppPDF(id){
    db.run("DELETE FROM pdf WHERE id=?",[id])
  }*/
}