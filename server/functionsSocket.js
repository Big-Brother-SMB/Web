const funcDB = require('./functionsDB.js')
const User = require('./User.js')

let db;

module.exports = class funcSocket{
    static setDB(newdb){
      db=newdb;
    }

    static id_data(socket,user){
        socket.on('id_data', async req => {
            try{
                let id_data = await user.all
                if(id_data==null){
                    id_data="err"
                }
                socket.emit('id_data',id_data)
            }catch(e){console.error(e)}
        });
    }

    static score(socket,user){
        socket.on('score', async req => {
            try{
                let score = await user.score
                if(score==null) score=-500
                socket.emit('score',score)
            }catch(e){console.error(e)}
        });    
    }

    static historiquePoints(socket,user){
        socket.on('historiquePoints', async req => {
            try{
                socket.emit('historiquePoints',await user.listPoint)
            }catch(e){console.error(e)}
        });    
    }

    static getMenuThisWeek(socket,user){
        socket.on('getMenuThisWeek', async req => {
            try{
                socket.emit('getMenuThisWeek',await funcDB.getMidiMenu(req))
            }catch(e){console.error(e)}
        }); 
    }

    static getDataThisCreneau(socket,user){
        socket.on('getDataThisCreneau', async req => {
            try{
                let info = await funcDB.getMidiInfo(req.w,req.j*2+req.h)
                socket.emit('getDataThisCreneau',info)
            }catch(e){console.error(e)}
        });
    }

    static getTuto(socket,user){
        socket.on('setTuto', req => {
            try{
                socket.emit('setTuto',user.tuto)
            }catch(e){console.error(e)}
        });
    }

    static setTuto(socket,user){
        socket.on('setTuto', req => {
            try{
                user.tuto = req
                socket.emit('setTuto','ok')
            }catch(e){console.error(e)}
        });
    }

    static getAmis(socket,user){
        socket.on('getAmis', async req => {
            try{
                socket.emit('getAmis',await user.amis)
            }catch(e){console.error(e)}
        });
    }

    static setAmis(socket,user){
        socket.on('setAmis', async req => {
            try{
                user.amis=req
                socket.emit('setAmis','ok')
            }catch(e){console.error(e)}
        });
    }

    static listUsersName(socket,user){
        socket.on('listUsersName', async req => {
            try{
                socket.emit('listUsersName',await User.listUsersName())
            }catch(e){console.error(e)}
        });
    }

    static getBanderole(socket,user){
        socket.on('getBanderole', async req => {
            try{
                socket.emit('getBanderole',await funcDB.getVar('banderole'))
            }catch(e){console.error(e)}
        });
    }
  
    static getMyDemande(socket,user){
        socket.on('getMyDemande', async req => {
            try{
                socket.emit('getMyDemande',await user.getMidiDemande(req.w,req.j*2+req.h))
            }catch(e){console.error(e)}
        });
    }

    static setMyDemande(socket,user){
        socket.on('setMyDemande', async req => {
            try{
                if((await user.getMidiDemande(req.w,req.j*2+req.h)).DorI!=true){
                    await user.setMidiDemande(req.w,req.j*2+req.h,req.amis,false,false,req.sandwich)
                    socket.emit('setMyDemande',"ok")
                }
            }catch(e){console.error(e)}
        });
    }

    static delMyDemande(socket,user){
        socket.on('delMyDemande', async req => {
            try{
                if((await user.getMidiDemande(req.w,req.j*2+req.h)).DorI!=true){
                    await user.delMidiDemande(req.w,req.j*2+req.h)
                    socket.emit('delMyDemande',"ok")
                }
            }catch(e){console.error(e)}
        });
    }

    static setAmiDemande(socket,user){
        socket.on('setAmiDemande', async req => {
            try{
                let listAmisBrut = await user.amis
                let hasPermission=false
                listAmisBrut.forEach(child=>{
                    if(req.uuidAmi==child.uuid && child.HeGiveMeProc==1){
                        hasPermission=true
                    }
                })
                let ami = await User(req.uuidAmi)
                if((hasPermission && await ami.getMidiDemande(req.w,req.j*2+req.h)).DorI!=true){
                    await ami.setMidiDemande(req.w,req.j*2+req.h,req.amis,false,false,null)
                    socket.emit('setAmiDemande',"ok")
                }
            }catch(e){console.error(e)}
        });
    }

    static delAmiDemande(socket,user){
        socket.on('delAmiDemande', async req => {
            try{
                let listAmisBrut = await user.amis
                let hasPermission=false
                listAmisBrut.forEach(child=>{
                    if(req.uuidAmi==child.uuid && child.HeGiveMeProc==1){
                        hasPermission=true
                    }
                })
                let ami = await User(req.uuidAmi)
                if((await ami.getMidiDemande(req.w,req.j*2+req.h)).DorI!=true){
                    await ami.delMidiDemande(req.w,req.j*2+req.h)
                    socket.emit('delAmiDemande',"ok")
                }
            }catch(e){console.error(e)}
        });
    }

    static listDemandes(socket,user){
        socket.on('listDemandes', async req => {
            try{
                socket.emit('listDemandes',await funcDB.listMidiDemandes(req.w,req.j*2+req.h))
            }catch(e){console.error(e)}
        });
    }

    static listDemandesPerm(socket,user){
        socket.on('listDemandesPerm', async req => {
            try{
                socket.emit('listDemandesPerm',await funcDB.listPermDemandes(req.w,req.j,req.h))
            }catch(e){console.error(e)}
        });
    }

    static getOuvertPerm(socket,user){
        socket.on("getOuvertPerm", async req => {
            try{
                socket.emit("getOuvertPerm",await funcDB.getPermOuvert(req.w,req.j,req.h))
            }catch(e){console.error(e)}
        });
    }
  
    static getMyDemandePerm(socket,user){
        socket.on("getMyDemandePerm", async req => {
            try{
                socket.emit("getMyDemandePerm",await user.getPermDemande(req.w,req.j,req.h))
            }catch(e){console.error(e)}
        });
    }

    static setMyDemandePerm(socket,user){
        socket.on("setMyDemandePerm", async req => {
            try{
                if((await user.getPermDemande(req.w,req.j,req.h)).DorI!=true){
                    await socket.emit("setMyDemandePerm",await user.setPermDemande(req.w,req.j,req.h,req.group,req.nb))
                    socket.emit('setMyDemandePerm',"ok")
                }
            }catch(e){console.error(e)}
        });
    }

    static delMyDemandePerm(socket,user){
        socket.on("delMyDemandePerm", async req => {
            try{
                if((await user.getPermDemande(req.w,req.j,req.h)).DorI!=true){
                    await user.delPermDemande(req.w,req.j,req.h)
                    socket.emit('delMyDemandePerm',"ok")
                }
            }catch(e){console.error(e)}
        });
    }




































    static m1(socket,user){
        socket.on("my msgs", async req => {
            try{
                socket.emit("my msgs",await user.getAllMessages())
            }catch(e){console.error(e)}
        });
    }

    static m2(socket,user){
        socket.on("msg lu", async req => {
            try{
                user.messageLu(req)
                socket.emit("msg lu",'ok')
            }catch(e){console.error(e)}
        });
    }

    static m3(socket,user){
        socket.on("add msg", async req => {
            try{
                funcDB.addMessage(user.uuid,"admin",false,req.texte,req.title,hashHour())
                socket.emit("add msg",'ok')
            }catch(e){console.error(e)}
        });
    }

    static m4(socket,user){
        socket.on("rep sondage", async req => {
            try{
                user.sondage_reponse(req.id,req.rep)
                socket.emit("rep sondage",'ok')
            }catch(e){console.error(e)}
        });
    }
}