const funcDB = require('./functionsDB.js')
const User = require('./User.js')
const UserSelect = require('./UserSelect.js')
let io = null


module.exports = class funcSocket{
    static init(io_externe){
        io = io_externe
    }

    static setMyAdminMode(socket,user){
        socket.on('setMyAdminMode',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let obj = await user.admin_permission
                obj["admin_only"] = req
                obj["groupe_permission"] = 0
                user.admin_permission = obj
                socket.emit('setMyAdminMode',"ok")
            }catch(e){console.error("fsA1");}
        })
    }

    static addGlobalPoint(socket,user){
        socket.on('addGlobalPoint',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.addGlobalPoint(msg[0],msg[1],msg[2])
                socket.emit('addGlobalPoint',"ok")
            }catch(e){console.error("fsA2");}
        })
    }

    static addPersonalPoint(socket,user){
        socket.on('addPersonalPoint',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(msg[0])
                user.addPersonalPoint(msg[1],msg[2],msg[3])
                socket.emit('addPersonalPoint',"ok")
            }catch(e){console.error("fsA3");}
        })
    }

    static getGlobalPoint(socket,user){
        socket.on('getGlobalPoint',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('getGlobalPoint',await funcDB.listGlobalPoint())
            }catch(e){console.error("fsA4");}
        })
    }

    static setBanderole(socket,user){
        socket.on('setBanderole',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.setVar("banderole",req)
                socket.emit('setBanderole',"ok")
            }catch(e){console.error("fsA5");}
        })
    }

    static setMenu(socket,user){
        socket.on('setMenu',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.setMidiMenu(req.semaine,req.menu,req.self)
                socket.emit('setMenu',"ok")
            }catch(e){console.error("fsA6");}
        })
    }

    static setMidiInfo(socket,user){
        socket.on('setMidiInfo',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.setMidiInfo(req.w,req.j*2+req.h,req.cout,req.gratuit_prio,req.ouvert,req.perMin,req.places,req.prio_mode,req.nbSandwich,req.nbSandwich_vege,req.mode_sandwich,req.bonus_avance,req.algo_auto,req.msg,req.list_prio)
                socket.emit('setMidiInfo',"ok")
            }catch(e){console.error("fsA7");}
        })
    }

    static getGroupAndClasse(socket,user){
        socket.on('getGroupAndClasse',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('getGroupAndClasse',[await funcDB.getGroup(),await funcDB.getClasse()])
            }catch(e){console.error("fsA8");}
        })
    }

    static getListUserComplete(socket,user){
        socket.on('getListUserComplete',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('getListUserComplete',await User.listUserComplete())
            }catch(e){
                console.error("fsA9");
            }
        })
    }

    static getListUser(socket,user){
        socket.on('getListUser',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('getListUser',await User.listUser())
            }catch(e){
                console.error("fsA10");
            }
        })
    }

    static scan(socket,user){
        socket.on('scan',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(msg[3])
                let info = await user.getMidiDemande(msg[0],msg[1]*2+msg[2])
                await user.setMidiDemande(msg[0],msg[1]*2+msg[2],info.amis,info.DorI,msg[4])
                socket.emit('scan','ok')
            }catch(e){console.error("fsA11");}
        })
    }

    static setDorI(socket,user){
        socket.on('setDorI',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            
            try{
                //log
                let d = new Date()
                let timecode =
                    d.getFullYear() + "-" + (String(d.getMonth()+1).length == 1?"0":"") + (d.getMonth()+1) + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate() + " " +
                    (String(d.getHours()).length == 1?"0":"") + d.getHours() + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes() + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
                console.log(timecode,"  ","\t",await user.first_name + " " + await user.last_name,msg)


                let user2 = new User(msg[3])
                let info = await user2.getMidiDemande(msg[0],msg[1]*2+msg[2])
                await user2.setMidiDemande(msg[0],msg[1]*2+msg[2],info.amis,msg[4],info.scan)
                socket.emit('setDorI','ok')
            }catch(e){console.error("fsA12");}
        })
    }

    static delDorI(socket,user){
        socket.on('delDorI',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(msg[3])
                await user.delMidiDemande(msg[0],msg[1]*2+msg[2])
                socket.emit('delDorI','ok')
            }catch(e){console.error("fsA13");}
        })
    }

    static setPermOuvert(socket,user){
        socket.on('setPermOuvert',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.setPermOuvert(msg[0],msg[1],msg[2],msg[3])
                socket.emit('setPermOuvert','ok')
            }catch(e){console.error("fsA14");}
        })
    }

    static delPermDemande(socket,user){
        socket.on('delPermDemande',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await (new User(msg[3])).delPermDemande(msg[0],msg[1],msg[2])
                socket.emit('delPermDemande','ok')
            }catch(e){console.error("fsA15");}
        })
    }

    static setPermInscrit(socket,user){
        socket.on('setPermInscrit',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.setPermInscrit(msg[0],msg[1],msg[2],msg[3])
                socket.emit('setPermInscrit','ok')
            }catch(e){console.error("fsA16");}
        })
    }

    static startAlgo(socket,user){
        socket.on('startAlgo',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let rep = await UserSelect.algoDeSelection(req.w,req.j*2+req.h,req.ISM)
                socket.emit('startAlgo',rep)
            }catch(e){console.error("fsA17");}
        })
    }

    static setUser(socket,user){
        socket.on('setUser',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(req.uuid)
                user.all = req
                socket.emit('setUser','ok')
            }catch(e){console.error("fsA18");}
        })
    }

    static removeUser(socket,user){
        socket.on('removeUser',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(req)
                user.removeUser()
                socket.emit('removeUser','ok')
            }catch(e){console.error("fsA50");}
        })
    }

    static getScoreList(socket,user){
        socket.on('getScoreList',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(req)
                socket.emit('getScoreList',await user.listPoint)
            }catch(e){console.error("fsA19");}
        })
    }

    static delPersonalPoint(socket,user){
        socket.on('delPersonalPoint',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(msg[0])
                user.delPersonalPoint(msg[1])
                socket.emit('delPersonalPoint','ok')
            }catch(e){console.error("fsA20");}
        })
    }

    static delGlobalPoint(socket,user){
        socket.on('delGlobalPoint',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.delGlobalPoint(req)
                socket.emit('delGlobalPoint','ok')
            }catch(e){console.error("fsA21");}
        })
    }

    static copyKey(socket,user){
        socket.on('copyKey',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('copyKey',await (new User(req)).createToken())
            }catch(e){console.error("fsA22");}
        })
    }
    
    static addPret(socket,user){
        socket.on("addPret", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.addPret(req.obj,req.uuid,req.debut)
                socket.emit("addPret",'ok')
            }catch(e){console.error("fsA23");}
        });
    }

    static finPret(socket,user){
        socket.on("finPret", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.finPret(req.obj,req.uuid,req.debut,req.fin)
                socket.emit("finPret",'ok')
            }catch(e){console.error("fsA24");}
        });
    }

    static commentairePret(socket,user){
        socket.on("commentairePret", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.commentairePret(req.obj,req.uuid,req.debut,req.com)
                socket.emit("commentairePret",'ok')
            }catch(e){console.error("fsA25");}
        });
    }

    static getPretsActuel(socket,user){
        socket.on("getPretsActuel", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getPretsActuel",await funcDB.getPretsActuel())
            }catch(e){console.error("fsA26");}
        });
    }

    static getAllPrets(socket,user){
        socket.on("getAllPrets", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getAllPrets",await funcDB.getAllPrets())
            }catch(e){console.error("fsA27");}
        });
    }

    //-----------------cookie ban-------------------------------------

    static newCookieSubscription(socket,user){
        socket.on("newCookieSubscription", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.addSubscriptionCookie(req.uuid,req.debut,req.fin,req.justificatif,req.period,req.cumulatif,req.nbAdd,0,null)
                socket.emit("newCookieSubscription","ok")
            }catch(e){console.error("fsA28");}
        });
    }

    static modifCookieSubscription(socket,user){
        socket.on("modifCookieSubscription", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.modifSubscriptionCookie(req.id,req.uuid,req.debut,req.fin,req.justificatif,req.period,req.cumulatif,req.nbAdd,req.quantity,req.maj)
                socket.emit("modifCookieSubscription","ok")
            }catch(e){console.error("fsA29");}
        });
    }

    static delCookieSubscription(socket,user){
        socket.on("delCookieSubscription", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.delSubscriptionCookie(req)
                socket.emit("delCookieSubscription","ok")
            }catch(e){console.error("fsA30");}
        });
    }

    static getCookieSubscription(socket,user){
        socket.on("getCookieSubscription", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getCookieSubscription",await funcDB.getSubscriptionCookie())
            }catch(e){console.error("fsA31");}
        });
    }

    static newCookieTicket(socket,user){
        socket.on("newCookieTicket", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.addTicketCookie(req.uuid,req.date,req.justificatif)
                socket.emit("newCookieTicket","ok")
            }catch(e){console.error("fsA32");}
        });
    }

    static modifCookieTicket(socket,user){
        socket.on("modifCookieTicket", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.modifTicketCookie(req.id,req.uuid,req.date,req.justificatif)
                socket.emit("modifCookieTicket","ok")
            }catch(e){console.error("fsA33");}
        });
    }

    static delCookieTicket(socket,user){
        socket.on("delCookieTicket", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.delTicketCookie(req)
                socket.emit("delCookieTicket","ok")
            }catch(e){console.error("fsA34");}
        });
    }

    static getCookieTicket(socket,user){
        socket.on("getCookieTicket", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getCookieTicket",await funcDB.getTicketCookie())
            }catch(e){console.error("fsA35");}
        });
    }

    static newBan(socket,user){
        socket.on("newBan", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.addBan(req.uuid,req.debut,req.fin,req.justificatif)
                socket.emit("newBan","ok")
            }catch(e){console.error("fsA36");}
        });
    }

    static modifBan(socket,user){
        socket.on("modifBan", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.modifBan(req.id,req.uuid,req.debut,req.fin,req.justificatif)
                socket.emit("modifBan","ok")
            }catch(e){console.error("fsA37");}
        });
    }

    static delBan(socket,user){
        socket.on("delBan", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.delBan(req)
                socket.emit("delBan","ok")
            }catch(e){console.error("fsA38");}
        });
    }

    static getBan(socket,user){
        socket.on("getBan", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getBan",await funcDB.getBan())
            }catch(e){console.error("fsA39");}
        });
    }

    static getUserIsBan(socket,user){
        socket.on("getUserIsBan", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getUserIsBan",await (new User(req)).ban)
            }catch(e){console.error("fsA40");}
        });
    }

    static getUserHasCookie(socket,user){
        socket.on("getUserHasCookie", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getUserHasCookie",await (new User(req)).hasCookie())
            }catch(e){console.error("fsA41");}
        });
    }

    static useCookie(socket,user){
        socket.on("useCookie", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("useCookie",await (new User(req)).useCookie())
            }catch(e){console.error("fsA42");}
        });
    }

    static pyScanVersion(socket,user){
        socket.on("pyScanVersion", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("pyScanVersion","v34")
            }catch(e){console.error("fsA43");}
        });
    }

    static sendMusic(socket,user){
        socket.on("sendMusic", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                io.of("/music").emit("play",req);
                socket.emit("sendMusic","ok")
            }catch(e){console.error("fsA51");}
        });
    }

    static getAllResultsMenu(socket,user){
        socket.on('getAllResultsMenu', async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('getAllResultsMenu',await funcDB.getAllResultsMenu(req.w,req.j))
            }catch(e){console.error("fsA44");}
        });
    }

    //Lieu
    static setLieuInfo(socket,user){
        socket.on('setLieuInfo',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.setLieuInfo(req.lieu,req.w,req.j,req.h,req.ouvert,req.msg,req.title,req.texte,req.places)
                socket.emit('setLieuInfo','ok')
            }catch(e){console.error("fsA45");}
        })
    }

    static setUserLieu(socket,user){
        socket.on("setUserLieu", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await (new User(req.uuid)).setLieu(req.lieu,req.w,req.j,req.h,req.scan)
                socket.emit("setUserLieu","ok")
            }catch(e){console.error("fsA46");}
        });
    }

    static getUserLieu(socket,user){
        socket.on("getUserLieu", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getUserLieu",await (new User(req.uuid)).getLieu(req.w,req.j,req.h))
            }catch(e){console.error("fsA47");}
        });
    }

    static delUserLieu(socket,user){
        socket.on("delUserLieu", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await (new User(req.uuid)).delLieu(req.w,req.j,req.h)
                socket.emit("delUserLieu",'ok')
            }catch(e){console.error("fsA48");}
        });
    }

    static setAchievement(socket,user){
        socket.on("setAchievement", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                (new User(req.uuid)).achievement = [req.event,req.value]
                if(req.value==1) io.of("/interruption").emit("achievement",{event:req.event,uuid:req.uuid});
                socket.emit("setAchievement","ok")
            }catch(e){console.error("fsA49");}
        });
    }

        /*
    socket.on("req lu", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
            (new User("admin")).messageLu(req)
            socket.emit("req lu",'ok')
        }catch(e){console.error("fsA");}
    });

    socket.on("add req", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
            funcDB.addMessage("admin",req.destinataire,false,req.texte,req.title,hashHour())
            socket.emit("add req",'ok')
        }catch(e){console.error("fsA");}
    });

    socket.on("add news", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
            funcDB.addNews("admin",req.texte,req.title,hashHour())
            socket.emit("add news",'ok')
        }catch(e){console.error("fsA");}
    });

    socket.on("add sondage", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
            funcDB.addSondage("admin",req.texte,req.title,hashHour(),req.mode,req.choix)
            socket.emit("add sondage",'ok')
        }catch(e){console.error("fsA");}
    })

    socket.on("admin reqs", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
            socket.emit("admin reqs",await funcDB.getAllMessages())
        }catch(e){console.error("fsA");}
    });
    });*/
}