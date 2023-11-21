const funcDB = require('./functionsDB.js')
const User = require('./User.js')
const UserSelect = require('./UserSelect.js')


module.exports = class funcSocket{
    static setMyAdminMode(socket,user){
        socket.on('setMyAdminMode',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                user.admin = req
                socket.emit('setMyAdminMode',"ok")
            }catch(e){console.error(e);console.log('3');}
        })
    }

    static addGlobalPoint(socket,user){
        socket.on('addGlobalPoint',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.addGlobalPoint(msg[0],msg[1],msg[2])
                socket.emit('addGlobalPoint',"ok")
            }catch(e){console.error(e);console.log('4');}
        })
    }

    static addPersonalPoint(socket,user){
        socket.on('addPersonalPoint',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(msg[0])
                user.addPersonalPoint(msg[1],msg[2],msg[3])
                socket.emit('addPersonalPoint',"ok")
            }catch(e){console.error(e);console.log('5');}
        })
    }

    static getGlobalPoint(socket,user){
        socket.on('getGlobalPoint',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('getGlobalPoint',await funcDB.listGlobalPoint())
            }catch(e){console.error(e);console.log('6');}
        })
    }

    static setBanderole(socket,user){
        socket.on('setBanderole',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.setVar("banderole",req)
                socket.emit('setBanderole',"ok")
            }catch(e){console.error(e);console.log('7');}
        })
    }

    static setMenu(socket,user){
        socket.on('setMenu',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.setMidiMenu(req.semaine,req.menu,req.self)
                socket.emit('setMenu',"ok")
            }catch(e){console.error(e);console.log('8');}
        })
    }

    static setMidiInfo(socket,user){
        socket.on('setMidiInfo',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.setMidiInfo(req.w,req.j*2+req.h,req.cout,req.gratuit_prio,req.ouvert,req.perMin,req.places,req.prio_mode,req.nbSandwich,req.nbSandwich_vege,req.mode_sandwich,req.bonus_avance,req.algo_auto,req.msg,req.list_prio)
                socket.emit('setMidiInfo',"ok")
            }catch(e){console.error(e);console.log('9');}
        })
    }

    static getGroupAndClasse(socket,user){
        socket.on('getGroupAndClasse',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('getGroupAndClasse',[await funcDB.getGroup(),await funcDB.getClasse()])
            }catch(e){console.error(e);console.log('10');}
        })
    }

    static getListPass(socket,user){
        socket.on('getListPass',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('getListPass',await User.listUsersComplete())
            }catch(e){console.error(e);console.log('11');}
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
            }catch(e){console.error(e);console.log('12');}
        })
    }

    static setDorI(socket,user){
        socket.on('setDorI',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(msg[3])
                let info = await user.getMidiDemande(msg[0],msg[1]*2+msg[2])
                await user.setMidiDemande(msg[0],msg[1]*2+msg[2],info.amis,msg[4],info.scan)
                socket.emit('setDorI','ok')
            }catch(e){console.error(e);console.log('13');}
        })
    }

    static delDorI(socket,user){
        socket.on('delDorI',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(msg[3])
                await user.delMidiDemande(msg[0],msg[1]*2+msg[2])
                socket.emit('delDorI','ok')
            }catch(e){console.error(e);console.log('14');}
        })
    }

    static setPermOuvert(socket,user){
        socket.on('setPermOuvert',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.setPermOuvert(msg[0],msg[1],msg[2],msg[3])
                socket.emit('setPermOuvert','ok')
            }catch(e){console.error(e);console.log('15');}
        })
    }

    static delPermDemande(socket,user){
        socket.on('delPermDemande',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await (new User(msg[3])).delPermDemande(msg[0],msg[1],msg[2])
                socket.emit('delPermDemande','ok')
            }catch(e){console.error(e);console.log('16');}
        })
    }

    static setPermInscrit(socket,user){
        socket.on('setPermInscrit',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.setPermInscrit(msg[0],msg[1],msg[2],msg[3])
                socket.emit('setPermInscrit','ok')
            }catch(e){console.error(e);console.log('17');}
        })
    }

    static startAlgo(socket,user){
        socket.on('startAlgo',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let rep = await UserSelect.algoDeSelection(msg[0],msg[1]*2+msg[2])
                socket.emit('startAlgo',rep)
            }catch(e){console.error(e);console.log('18');}
        })
    }

    static setUser(socket,user){
        socket.on('setUser',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(req.uuid)
                user.all = req
                socket.emit('setUser','ok')
            }catch(e){console.error(e);console.log('19');}
        })
    }

    static getScoreList(socket,user){
        socket.on('getScoreList',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(req)
                socket.emit('getScoreList',await user.listPoint)
            }catch(e){console.error(e);console.log('20');}
        })
    }

    static delPersonalPoint(socket,user){
        socket.on('delPersonalPoint',async msg => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                let user = new User(msg[0])
                user.delPersonalPoint(msg[1])
                socket.emit('delPersonalPoint','ok')
            }catch(e){console.error(e);console.log('21');}
        })
    }

    static delGlobalPoint(socket,user){
        socket.on('delGlobalPoint',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.delGlobalPoint(req)
                socket.emit('delGlobalPoint','ok')
            }catch(e){console.error(e);console.log('22');}
        })
    }

    static copyKey(socket,user){
        socket.on('copyKey',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('copyKey',await (new User(req)).createToken())
            }catch(e){console.error(e);console.log('23');}
        })
    }
    
    static addPret(socket,user){
        socket.on("addPret", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.addPret(req.obj,req.uuid,req.debut)
                socket.emit("addPret",'ok')
            }catch(e){console.error(e);console.log('29');}
        });
    }

    static finPret(socket,user){
        socket.on("finPret", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.finPret(req.obj,req.uuid,req.debut,req.fin)
                socket.emit("finPret",'ok')
            }catch(e){console.error(e);console.log('30');}
        });
    }

    static commentairePret(socket,user){
        socket.on("commentairePret", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                funcDB.commentairePret(req.obj,req.uuid,req.debut,req.com)
                socket.emit("commentairePret",'ok')
            }catch(e){console.error(e);console.log('31');}
        });
    }

    static getPretsActuel(socket,user){
        socket.on("getPretsActuel", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getPretsActuel",await funcDB.getPretsActuel())
            }catch(e){console.error(e);console.log('32');}
        });
    }

    static getAllPrets(socket,user){
        socket.on("getAllPrets", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getAllPrets",await funcDB.getAllPrets())
            }catch(e){console.error(e);console.log('33');}
        });
    }

    //-----------------cookie ban-------------------------------------

    static newCookieSubscription(socket,user){
        socket.on("newCookieSubscription", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.addSubscriptionCookie(req.uuid,req.debut,req.fin,req.justificatif,req.period,req.cumulatif,req.nbAdd,0,null)
                socket.emit("newCookieSubscription","ok")
            }catch(e){console.error(e);console.log('34');}
        });
    }

    static modifCookieSubscription(socket,user){
        socket.on("modifCookieSubscription", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.modifSubscriptionCookie(req.id,req.uuid,req.debut,req.fin,req.justificatif,req.period,req.cumulatif,req.nbAdd,req.quantity,req.maj)
                socket.emit("modifCookieSubscription","ok")
            }catch(e){console.error(e);console.log('35');}
        });
    }

    static delCookieSubscription(socket,user){
        socket.on("delCookieSubscription", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.delSubscriptionCookie(req)
                socket.emit("delCookieSubscription","ok")
            }catch(e){console.error(e);console.log('36');}
        });
    }

    static getCookieSubscription(socket,user){
        socket.on("getCookieSubscription", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getCookieSubscription",await funcDB.getSubscriptionCookie())
            }catch(e){console.error(e);console.log('37');}
        });
    }

    static newCookieTicket(socket,user){
        socket.on("newCookieTicket", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.addTicketCookie(req.uuid,req.date,req.justificatif)
                socket.emit("newCookieTicket","ok")
            }catch(e){console.error(e);console.log('38');}
        });
    }

    static modifCookieTicket(socket,user){
        socket.on("modifCookieTicket", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.modifTicketCookie(req.id,req.uuid,req.date,req.justificatif)
                socket.emit("modifCookieTicket","ok")
            }catch(e){console.error(e);console.log('39');}
        });
    }

    static delCookieTicket(socket,user){
        socket.on("delCookieTicket", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.delTicketCookie(req)
                socket.emit("delCookieTicket","ok")
            }catch(e){console.error(e);console.log('40');}
        });
    }

    static getCookieTicket(socket,user){
        socket.on("getCookieTicket", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getCookieTicket",await funcDB.getTicketCookie())
            }catch(e){console.error(e);console.log('41');}
        });
    }

    static newBan(socket,user){
        socket.on("newBan", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.addBan(req.uuid,req.debut,req.fin,req.justificatif)
                socket.emit("newBan","ok")
            }catch(e){console.error(e);console.log('42');}
        });
    }

    static modifBan(socket,user){
        socket.on("modifBan", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.modifBan(req.id,req.uuid,req.debut,req.fin,req.justificatif)
                socket.emit("modifBan","ok")
            }catch(e){console.error(e);console.log('43');}
        });
    }

    static delBan(socket,user){
        socket.on("delBan", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.delBan(req)
                socket.emit("delBan","ok")
            }catch(e){console.error(e);console.log('44');}
        });
    }

    static getBan(socket,user){
        socket.on("getBan", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getBan",await funcDB.getBan())
            }catch(e){console.error(e);console.log('45');}
        });
    }

    static getUserIsBan(socket,user){
        socket.on("getUserIsBan", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getUserIsBan",await (new User(req)).ban)
            }catch(e){console.error(e);console.log('46');}
        });
    }

    static getUserHasCookie(socket,user){
        socket.on("getUserHasCookie", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getUserHasCookie",await (new User(req)).hasCookie())
            }catch(e){console.error(e);console.log('47');}
        });
    }

    static useCookie(socket,user){
        socket.on("useCookie", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("useCookie",await (new User(req)).useCookie())
            }catch(e){console.error(e);console.log('48');}
        });
    }

    static pyScanVersion(socket,user){
        socket.on("pyScanVersion", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("pyScanVersion","v19")
            }catch(e){console.error(e);console.log('48');}
        });
    }

    static getAllResultsMenu(socket,user){
        socket.on('getAllResultsMenu', async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit('getAllResultsMenu',await funcDB.getAllResultsMenu(req.w,req.j))
            }catch(e){console.error(e);console.log('b24');}
        });
    }


   /* //CDI
    static setCDIGroups(socket,user){
        socket.on('setCDIGroups',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.setCDIGroups(req.w,req.j,req.h,req.groups)
                socket.emit('setCDIGroups','ok')
            }catch(e){console.error(e);console.log('17');}
        })
    }*/

    //Lieu
    static setLieuInfo(socket,user){
        socket.on('setLieuInfo',async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await funcDB.setLieuInfo(req.lieu,req.w,req.j,req.h,req.ouvert,req.msg,req.title,req.texte,req.places)
                socket.emit('setLieuInfo','ok')
            }catch(e){console.error(e);console.log('15');}
        })
    }

    static setUserLieu(socket,user){
        socket.on("setUserLieu", async req => {
            try{
                await (new User(req.uuid)).setLieu(req.lieu,req.w,req.j,req.h,req.scan)
                socket.emit("setUserLieu","ok")
            }catch(e){console.error(e);console.log('b19');}
        });
    }

    static getUserLieu(socket,user){
        socket.on("getUserLieu", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                socket.emit("getUserLieu",await (new User(req.uuid)).getLieu(req.w,req.j,req.h))
            }catch(e){console.error(e);console.log('49');}
        });
    }

    static delUserLieu(socket,user){
        socket.on("delUserLieu", async req => {
            if(await user.admin == 0 || await user.admin == null) return
            try{
                await (new User(req.uuid)).delLieu(req.w,req.j,req.h)
                socket.emit("delUserLieu",'ok')
            }catch(e){console.error(e);console.log('50');}
        });
    }



        /*
    socket.on("req lu", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
            (new User("admin")).messageLu(req)
            socket.emit("req lu",'ok')
        }catch(e){console.error(e);console.log('25');}
    });

    socket.on("add req", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
            funcDB.addMessage("admin",req.destinataire,false,req.texte,req.title,hashHour())
            socket.emit("add req",'ok')
        }catch(e){console.error(e);console.log('26');}
    });

    socket.on("add news", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
            funcDB.addNews("admin",req.texte,req.title,hashHour())
            socket.emit("add news",'ok')
        }catch(e){console.error(e);console.log('27');}
    });

    socket.on("add sondage", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
            funcDB.addSondage("admin",req.texte,req.title,hashHour(),req.mode,req.choix)
            socket.emit("add sondage",'ok')
        }catch(e){console.error(e);console.log('28');}
    })

    socket.on("admin reqs", async req => {
        if(await user.admin == 0 || await user.admin == null) return
        try{
            socket.emit("admin reqs",await funcDB.getAllMessages())
        }catch(e){console.error(e);console.log('24');}
    });
    });*/
}