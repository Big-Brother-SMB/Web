let db
let db_amis
let db_perm
let db_midi
let db_news
let db_sondages

export function setDB(db2,db_amis2,db_perm2,db_midi2,db_news2,db_sondages2){
    db = db2
    db_amis = db_amis2
    db_perm = db_perm2
    db_news = db_midi2
    db_news = db_news2
    db_sondages = db_sondages2
}

export class User{
    constructor(uuid){
        this.uuid
    }
    static search(code_barre){
        return //%uuid
    }
      //user et  plus
    static createUser(email){
        return new Promise(function(resolve, reject) {
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
                    resolve(new User(uuidG))
                }catch(e){console.error(e);resolve(null)}
            })
            setTimeout(reject,1000)
        })
    }

    createToken(){
        return new Promise(function(resolve, reject) {
          let tokenAuth = rand.generateKey();
          let date=dateTime.format(new Date(), 'YYYY/MM/DD');
          db.run("INSERT INTO token(token,uuid,date) VALUES(?,?,?)", [tokenAuth,this.uuid,date])
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
        return new Promise(function(resolve, reject) {
            db.get("SELECT * FROM users where uuid=?",[this.uuid], (err, data) => {
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
        db.get("SELECT * FROM users where uuid=?",[this.uuid], (err, data) => {
            if(data!=undefined){
                db.run("UPDATE users SET ?=? where uuid=?",[key,value,this.uuid])
            }
        })
    }

    get all(){
        return new Promise(function(resolve, reject) {
            db.get("SELECT * FROM users where uuid=?",[this.uuid], (err, data) => {
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
        return new Promise(function(resolve, reject) {
            db_amis.all("SELECT amis FROM ?",[this.uuid], (err, data) => {
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
        db_amis.get("SELECT amis FROM ?",[this.uuid], (err, data) => {
            db_amis.serialize(()=>{
                if(data!=undefined){
                    db_amis.run("delete from ?",[this.uuid])
                }else{
                    db_amis.run('CREATE TABLE ?(amis uuid)',[this.uuid])
                }
                for(let e in list){
                    db_amis.run("INSERT INTO ?(amis) VALUES (?)",[this.uuid,e])
                }
            })
        })
    }

    get groups(){
        return new Promise(function(resolve, reject) {
            db.all("SELECT group2 FROM user_groups where uuid=?",[this.uuid], (err, data) => {
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
        db.serialize(()=>{
            db.run("delete from user_groups where uuid=?",[this.uuid])
            for(let e in list){
                db.run("INSERT INTO user_groups(uuid,group2) VALUES (?,?)",[this.uuid,e])
            }
        })
    }
}


//var
export function getVar(key){
    return new Promise(function(resolve, reject) {
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
export function setVar(key,value){
    db.get("SELECT * FROM var where key=?",[key], (err, data) => {
        if(data==undefined){
            db.run("INSERT INTO var(key,value) VALUES (?,?)",[key,value])
        } else{
            db.run("UPDATE var SET value=? WHERE key=?",[value,key])
        }
    })
}
  
  


  
  
