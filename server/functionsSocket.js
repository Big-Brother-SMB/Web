const funcDB = require('./functionsDB.js')
const User = require('./User.js')
const funcDate = require('./functionsDate.js')


const listHoraires = [[7,50],[8,49],[10,1],[11,0],[12,20],[13,14],[14,13],[15,25],[16,24],[17,18]]
const listGroups = ["Club info","Matches Heads","La pieuvre","BDL","Lycéens humanitaires"]
const srcs = {"Club info":"Club_Info","Matches Heads":"Matches_Heads","La pieuvre":"La_pieuvre","BDL":"BDL","Lycéens humanitaires":"humanitaire"}

module.exports = class funcSocket{
    static log(socket,user){
        socket.on('log', async req => {
            try{
                socket.emit('log',null)
                let d = new Date()
                let timecode =
                    d.getFullYear() + "-" + (String(d.getMonth()+1).length == 1?"0":"") + (d.getMonth()+1) + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate() + " " +
                    (String(d.getHours()).length == 1?"0":"") + d.getHours() + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes() + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
                console.log(timecode,"  ",req,"\t",await user.first_name + " " + await user.last_name)
            }catch(e){console.error(e);}
        });
    }

    static id_data(socket,user){
        socket.on('id_data', async req => {
            try{
                let id_data = await user.all
                if(id_data==null){
                    id_data="err"
                }
                socket.emit('id_data',id_data)
            }catch(e){console.error(e);console.log('b1');}
        });
    }

    static score(socket,user){
        socket.on('score', async req => {
            try{
                let score = await user.score
                if(score==null) score=-500
                socket.emit('score',score)
            }catch(e){console.error(e);console.log('b2');}
        });    
    }

    static historiqueScore(socket,user){
        socket.on('historiqueScore', async req => {
            try{
                socket.emit('historiqueScore',await user.listPoint)
            }catch(e){console.error(e);console.log('b3');}
        });    
    }

    static getMenuThisWeek(socket,user){
        socket.on('getMenuThisWeek', async req => {
            try{
                socket.emit('getMenuThisWeek',await funcDB.getMidiMenu(req))
            }catch(e){console.error(e);console.log('b4');}
        }); 
    }

    static getDataThisCreneau(socket,user){
        socket.on('getDataThisCreneau', async req => {
            try{
                let info = await funcDB.getMidiInfo(req.w,req.j*2+req.h)
                socket.emit('getDataThisCreneau',info)
            }catch(e){console.error(e);console.log('b5');}
        });
    }

    static getTuto(socket,user){
        socket.on('getTuto', req => {
            try{
                socket.emit('getTuto',user.tuto)
            }catch(e){console.error(e);console.log('b6');}
        });
    }

    static setTuto(socket,user){
        socket.on('setTuto', req => {
            try{
                user.tuto = req
                socket.emit('setTuto','ok')
            }catch(e){console.error(e);console.log('b7');}
        });
    }

    static getAmis(socket,user){
        socket.on('getAmis', async req => {
            try{
                socket.emit('getAmis',await user.amis)
            }catch(e){console.error(e);console.log('b8');}
        });
    }

    static setAmis(socket,user){
        socket.on('setAmis', async req => {
            try{
                user.amis=req
                socket.emit('setAmis','ok')
            }catch(e){console.error(e);console.log('b9');}
        });
    }

    static listUsersName(socket,user){
        socket.on('listUsersName', async req => {
            try{
                socket.emit('listUsersName',await User.listUsersName())
            }catch(e){console.error(e);console.log('b10');}
        });
    }

    static getBanderole(socket,user){
        socket.on('getBanderole', async req => {
            try{
                socket.emit('getBanderole',await funcDB.getVar('banderole'))
            }catch(e){console.error(e);console.log('b11');}
        });
    }
  
    static getMyDemande(socket,user){
        socket.on('getMyDemande', async req => {
            try{
                socket.emit('getMyDemande',await user.getMidiDemande(req.w,req.j*2+req.h))
            }catch(e){console.error(e);console.log('b12');}
        });
    }

    static setMyDemande(socket,user){
        socket.on('setMyDemande', async req => {
            try{
                let demande = await user.getMidiDemande(req.w,req.j*2+req.h)
                let info = await funcDB.getMidiInfo(req.w,req.j*2+req.h)
                if(demande.DorI!=true && info.ouvert==2){
                    await user.setMidiDemande(req.w,req.j*2+req.h,req.amis,false,false,req.sandwich)
                    socket.emit('setMyDemande',"ok")
                }
            }catch(e){console.error(e);console.log('b13');}
        });
    }

    static delMyDemande(socket,user){
        socket.on('delMyDemande', async req => {
            try{
                let demande = await user.getMidiDemande(req.w,req.j*2+req.h)
                let info = await funcDB.getMidiInfo(req.w,req.j*2+req.h)
                if(demande.DorI!=true && info.ouvert==2){
                    await user.delMidiDemande(req.w,req.j*2+req.h)
                    socket.emit('delMyDemande',"ok")
                }
            }catch(e){console.error(e);console.log('b14');}
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
                let ami = await new User(req.uuidAmi)
                if(hasPermission && (await ami.getMidiDemande(req.w,req.j*2+req.h)).DorI!=true){
                    ami.sendNotif("Dépôt d'une demande",
                        "Votre demande a été déposé par " + await user.first_name + " " + await user.last_name,
                        '/assets/nav_bar/midi.png',
                        'midi')
                    await ami.setMidiDemande(req.w,req.j*2+req.h,req.amis,false,false,null)
                    socket.emit('setAmiDemande',"ok")
                }
            }catch(e){console.error(e);console.log('b15');}
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
                let ami = await new User(req.uuidAmi)
                if(hasPermission && (await ami.getMidiDemande(req.w,req.j*2+req.h)).DorI!=true){
                    ami.sendNotif("Suppression d'une demande",
                        "Votre demande a été supprimé par " + await user.first_name + " " + await user.last_name,
                        '/assets/nav_bar/midi.png',
                        'midi')
                    await ami.delMidiDemande(req.w,req.j*2+req.h)
                    socket.emit('delAmiDemande',"ok")
                }
            }catch(e){console.error(e);console.log('b16');}
        });
    }

    static listDemandes(socket,user){
        socket.on('listDemandes', async req => {
            try{
                socket.emit('listDemandes',await funcDB.listMidiDemandes(req.w,req.j*2+req.h))
            }catch(e){console.error(e);console.log('b17');}
        });
    }

    static listDemandesPerm(socket,user){
        socket.on('listDemandesPerm', async req => {
            try{
                socket.emit('listDemandesPerm',await funcDB.listPermDemandes(req.w,req.j,req.h))
            }catch(e){console.error(e);console.log('b18');}
        });
    }

    static getOuvertPerm(socket,user){
        socket.on("getOuvertPerm", async req => {
            try{
                socket.emit("getOuvertPerm",await funcDB.getPermOuvert(req.w,req.j,req.h))
            }catch(e){console.error(e);console.log('b19');}
        });
    }
  
    static getMyDemandePerm(socket,user){
        socket.on("getMyDemandePerm", async req => {
            try{
                socket.emit("getMyDemandePerm",await user.getPermDemande(req.w,req.j,req.h))
            }catch(e){console.error(e);console.log('b20');}
        });
    }

    static setMyDemandePerm(socket,user){
        socket.on("setMyDemandePerm", async req => {
            try{
                let demande = await user.getPermDemande(req.w,req.j,req.h)
                let ouvert = await funcDB.getPermOuvert(req.w,req.j,req.h)
                if(demande.DorI!=true && ouvert==1){
                    await user.setPermDemande(req.w,req.j,req.h,req.group,req.nb)
                    socket.emit('setMyDemandePerm',"ok")
                }
            }catch(e){console.error(e);console.log('b21');}
        });
    }

    static delMyDemandePerm(socket,user){
        socket.on("delMyDemandePerm", async req => {
            try{
                let demande = await user.getPermDemande(req.w,req.j,req.h)
                let ouvert = await funcDB.getPermOuvert(req.w,req.j,req.h)
                if(demande.DorI!=true && ouvert==1){
                    await user.delPermDemande(req.w,req.j,req.h)
                    socket.emit('delMyDemandePerm',"ok")
                }
            }catch(e){console.error(e);console.log('b22');}
        });
    }

    static suppAllToken(socket,user){
        socket.on("suppAllToken", async req => {
            try{
                user.suppAllToken()
                socket.emit('suppAllToken',"ok")
            }catch(e){console.error(e);console.log('b22');}
        });
    }

    static getCookies(socket,user){
        socket.on('getCookies', async req => {
            try{
                socket.emit('getCookies',await user.cookies)
            }catch(e){console.error(e);console.log('b23');}
        });
    }

    static getSondageMenu(socket,user){
        socket.on('getSondageMenu', async req => {
            try{
                socket.emit('getSondageMenu',await funcDB.getSondageMenu(user.uuid,req.w,req.j))
            }catch(e){console.error(e);console.log('b24');}
        });
    }

    static setSondageMenu(socket,user){
        socket.on('setSondageMenu', async req => {
            try{
                await funcDB.setSondageMenu(user.uuid,req.w,req.j,req.note)
                socket.emit('setSondageMenu',"ok")
            }catch(e){console.error(e);console.log('b25');}
        });
    }

    static setPost(socket,user){
        socket.on('setPost', async req => {
            let test = false
            let user_groups = await user.groups
            let src = srcs[req.group]
            listGroups.forEach(async g=>{
                if(user_groups.indexOf(g)!=-1 && req.group==g){
                    test = true
                }
            })
            if((await user.admin == 0 || await user.admin == null) && !test) return
            try{
                User.sendNotifAll(req.title,req.text,"/asso/"+src+"/Images/logo.jpg","asso/"+src)
                await funcDB.setPost(req.id,user.uuid,req.group,req.title,req.text,req.date)
                socket.emit('setPost',"ok")
            }catch(e){console.error(e);console.log('b26');}
        });
    }

    static getPostWithAllLu(socket,user){
        socket.on('getPostWithAllLu', async req => {
            let test = false
            let user_groups = await user.groups
            listGroups.forEach(async g=>{
                if(user_groups.indexOf(g)!=-1){
                    test = true
                }
            })
            if((await user.admin == 0 || await user.admin == null) && !test) return
            try{
                socket.emit('getPostWithAllLu',await funcDB.getPostWithAllLu(req.id))
            }catch(e){console.error(e);console.log('b27');}
        });
    }

    static getPost(socket,user){
        socket.on('getPost', async req => {
            try{
                socket.emit('getPost',await funcDB.getPost(user.uuid))
            }catch(e){console.error(e);console.log('b27');}
        });
    }

    static postLu(socket,user){
        socket.on('postLu', async req => {
            try{
                await funcDB.postLu(req.id,user.uuid)
                socket.emit('postLu',"ok")
            }catch(e){console.error(e);console.log('b26');}
        });
    }

    static delPost(socket,user){
        socket.on('delPost', async req => {
            let test = false
            let user_groups = await user.groups
            listGroups.forEach(async g=>{
                if(user_groups.indexOf(g)!=-1){
                    test = true
                }
            })
            if((await user.admin == 0 || await user.admin == null) && !test) return
            try{
                await funcDB.delPost(req.id)
                socket.emit('delPost',"ok")
            }catch(e){console.error(e);console.log('b26');}
        });
    }

    static allHoraireMidi(socket,user){
        socket.on('allHoraireMidi', async req => {
            try{
                let info_horaire = [[undefined,undefined],[undefined,undefined],[undefined,undefined],[undefined,undefined]]
                let my_demande = [[undefined,undefined],[undefined,undefined],[undefined,undefined],[undefined,undefined]]
                let list_demandes = [[undefined,undefined],[undefined,undefined],[undefined,undefined],[undefined,undefined]]
                for (let j = 0; j < 4; j++) {
                    for (let h = 0; h < 2; h++) {
                        let info = await funcDB.getMidiInfo(req.w,j*2+h)
                        if(info==undefined) info={prio:[]}
                        info_horaire[j][h] = info
                        my_demande[j][h] = await user.getMidiDemande(req.w,j*2+h)
                        list_demandes[j][h] = await funcDB.listMidiDemandes(req.w,j*2+h)
                    }
                }
                socket.emit('allHoraireMidi',{info_horaire:info_horaire,my_demande:my_demande,list_demandes:list_demandes})
            }catch(e){console.error(e);console.log('b27');}
        });
    }

    static allHorairePerm(socket,user){
        socket.on('allHorairePerm', async req => {
            try{
                let listDemandes = []
                let ouvert = []
                for (let j = 0; j < 5; j++) {
                    listDemandes.push([])
                    ouvert.push([])
                    for (let h = 0; h < 8; h++) {
                        listDemandes[j].push(await funcDB.listPermDemandes(req.w,j,h))
                        let ouv = await funcDB.getPermOuvert(req.w,j,h)
                        if (ouv == null){
                            ouv = 0
                        }
                        ouvert[j].push(ouv)
                    }
                }
                socket.emit('allHorairePerm',{listDemandes:listDemandes,ouvert:ouvert})
            }catch(e){console.error(e);console.log('b27');}
        });
    }

    //notification
    static subscribeNotification(socket,user){
        socket.on('subscribeNotification', async req => {
            try{
                user.subscribeNotification(req)
                socket.emit('subscribeNotification',"ok")
            }catch(e){console.error(e);console.log('b27');}
        });
    }
    
    static existNotificationSubscription(socket,user){
        socket.on('existNotificationSubscription', async req => {
            try{
                socket.emit('existNotificationSubscription',await user.existNotificationSubscription())
            }catch(e){console.error(e);console.log('b27');}
        });
    }

    /*//CDI
    static getCDIGroups(socket,user){
        socket.on('getCDIGroups', async req => {
            try{
                socket.emit('getCDIGroups',await funcDB.getCDIGroups(req.w,req.j,req.h))
            }catch(e){console.error(e);console.log('b18');}
        });
    }

    static allHoraireCDI(socket,user){
        socket.on('allHoraireCDI', async req => {
            try{
                let listGroups = []
                for (let j = 0; j < 5; j++) {
                    listGroups.push([])
                    for (let h = 0; h < 9; h++) {
                        listGroups[j].push(await funcDB.getCDIGroups(req.w,j,h))
                    }
                }
                socket.emit('allHoraireCDI',listGroups)
            }catch(e){console.error(e);console.log('b27');}
        });
    }*/

    //Lieu
    //dépôt inscription
    static getMyLieu(socket,user){
        socket.on("getMyLieu", async req => {
            try{
                socket.emit("getMyLieu",await user.getLieu(req.w,req.j,req.h))
            }catch(e){console.error(e);console.log('b19');}
        });
    }

    static setMyLieu(socket,user){
        socket.on("setMyLieu", async req => {
            try{
                let info = await funcDB.getLieuInfo(req.lieu,req.w,req.j,req.h)
                let verifyPlaces = (info.places - (await funcDB.getLieuList(req.lieu,req.w,req.j,req.h)).length > 0)
                verifyPlaces = verifyPlaces && (req.lieu!="DOC" || (await user.classe)[0]=="T")
                let myLieu = await user.getLieu(req.w,req.j,req.h)
                if((myLieu==null || myLieu.scan!=1) && verifyPlaces && funcDate.generedDate(req.w,req.j+1,7,30).getTime() < Date.now()
                && funcDate.generedDate(req.w,req.j+1,listHoraires[req.h+1][0],listHoraires[req.h+1][1]).getTime() > Date.now()){
                    await user.setLieu(req.lieu,req.w,req.j,req.h,0)
                }
                socket.emit("setMyLieu","ok")
            }catch(e){console.error(e);console.log('b19');}
        });
    }

    static delMyLieu(socket,user){
        socket.on("delMyLieu", async req => {
            try{
                let myLieu = await user.getLieu(req.w,req.j,req.h)
                if((myLieu==null || myLieu.scan!=1) && funcDate.generedDate(req.w,req.j+1,7,30).getTime() < Date.now()
                && funcDate.generedDate(req.w,req.j+1,listHoraires[req.h][0],listHoraires[req.h][1]).getTime() > Date.now()){
                    await user.delLieu(req.w,req.j,req.h)
                }
                socket.emit("delMyLieu","ok")
            }catch(e){console.error(e);console.log('b19');}
        });
    }

    static setAmiLieu(socket,user){
        socket.on("setAmiLieu", async req => {
            try{
                let listAmisBrut = await user.amis
                let hasPermission=false
                listAmisBrut.forEach(child=>{
                    if(req.uuidAmi==child.uuid && child.HeGiveMeProc==1){
                        hasPermission=true
                    }
                })
                let info = await funcDB.getLieuInfo(req.lieu,req.w,req.j,req.h)
                let ami = await new User(req.uuidAmi)
                let amiLieu = await ami.getLieu(req.w,req.j,req.h)
                let verifyPlaces = (info.places - (await funcDB.getLieuList(req.lieu,req.w,req.j,req.h)).length > 0)
                verifyPlaces = verifyPlaces && (req.lieu!="DOC" || (await ami.classe)[0]=="T")
                if(hasPermission && (amiLieu==null || amiLieu.scan!=1) && verifyPlaces && funcDate.generedDate(req.w,req.j+1,7,30).getTime() < Date.now()
                && funcDate.generedDate(req.w,req.j+1,listHoraires[req.h+1][0],listHoraires[req.h+1][1]).getTime() > Date.now()){
                    await ami.setLieu(req.lieu,req.w,req.j,req.h,0)
                }
                socket.emit('setAmiLieu',"ok")
            }catch(e){console.error(e);console.log('b19');}
        });
    }

    static delAmiLieu(socket,user){
        socket.on("delAmiLieu", async req => {
            try{
                let listAmisBrut = await user.amis
                let hasPermission=false
                listAmisBrut.forEach(child=>{
                    if(req.uuidAmi==child.uuid && child.HeGiveMeProc==1){
                        hasPermission=true
                    }
                })
                let ami = await new User(req.uuidAmi)
                let amiLieu = await ami.getLieu(req.w,req.j,req.h)
                if(hasPermission && (amiLieu==null || amiLieu.scan!=1) && funcDate.generedDate(req.w,req.j+1,7,30).getTime() < Date.now()
                && funcDate.generedDate(req.w,req.j+1,listHoraires[req.h][0],listHoraires[req.h][1]).getTime() > Date.now()){
                    await ami.delLieu(req.w,req.j,req.h)
                }
                socket.emit("delAmiLieu","ok")
            }catch(e){console.error(e);console.log('b19');}
        });
    }


    //obtenir list d'inscription + info
    static getLieuList(socket,user){
        socket.on("getLieuList", async req => {
            try{
                socket.emit("getLieuList",await funcDB.getLieuList(req.lieu,req.w,req.j,req.h))
            }catch(e){console.error(e);console.log('b19');}
        });
    }

    static getAllLieuList(socket,user){
        socket.on("getAllLieuList", async req => {
            try{
                socket.emit("getAllLieuList",await funcDB.getAllLieuList(req.w,req.j,req.h))
            }catch(e){console.error(e);console.log('49');}
        });
    }

    static getLieuInfo(socket,user){
        socket.on("getLieuInfo", async req => {
            try{
                socket.emit("getLieuInfo",await funcDB.getLieuInfo(req.lieu,req.w,req.j,req.h))
            }catch(e){console.error(e);console.log('b19');}
        });
    }

    static allHoraireLieu(socket,user){
        socket.on('allHoraireLieu', async req => {
            try{
                let LieuInfo = []
                let inscriptions = []
                for (let j = 0; j < 5; j++) {
                    LieuInfo.push([])
                    inscriptions.push([])
                    for (let h = 0; h < 9; h++) {
                        let ouv = await funcDB.getLieuInfo(req.lieu,req.w,j,h)
                        LieuInfo[j].push(ouv)
                        let inscription = await funcDB.getLieuList(req.lieu,req.w,j,h)
                        inscriptions[j].push(inscription)
                    }
                }
                socket.emit('allHoraireLieu',{inscriptions:inscriptions,info:LieuInfo})
            }catch(e){console.error(e);console.log('b27');}
        });
    }

















    static m1(socket,user){
        socket.on("my msgs", async req => {
            try{
                socket.emit("my msgs",await user.getAllMessages())
            }catch(e){console.error(e);console.log('b23');}
        });
    }

    static m2(socket,user){
        socket.on("msg lu", async req => {
            try{
                user.messageLu(req)
                socket.emit("msg lu",'ok')
            }catch(e){console.error(e);console.log('b24');}
        });
    }

    static m3(socket,user){
        socket.on("add msg", async req => {
            try{
                funcDB.addMessage(user.uuid,"admin",false,req.texte,req.title,hashHour())
                socket.emit("add msg",'ok')
            }catch(e){console.error(e);console.log('b25');}
        });
    }

    static m4(socket,user){
        socket.on("rep sondage", async req => {
            try{
                user.sondage_reponse(req.id,req.rep)
                socket.emit("rep sondage",'ok')
            }catch(e){console.error(e);console.log('b26');}
        });
    }
}