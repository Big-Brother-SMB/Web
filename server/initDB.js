module.exports = (db)=>{
    //pragma
    db.run("PRAGMA synchronous = OFF")
    //db.run("PRAGMA journal_mode  = WAL")

    //var
    db.get("SELECT * FROM sqlite_master where type='table' AND name='var'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE var(key text, value text)')
    })

    //emprunt
    db.get("SELECT * FROM sqlite_master where type='table' AND name='emprunt'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE emprunt(objet text,uuid UUID,debut DATE,fin DATE,commentaire text)')
    })

    //users / amis / user-group / token
    db.get("SELECT * FROM sqlite_master where type='table' AND name='users'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE users(uuid UUID, first_name text, last_name text, email text, code_barre CHAR[5], classe text, tuto boolean,admin boolean,picture text,birthday int2,birthmonth int2,verify boolean)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='achievement'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE achievement(uuid UUID,gold bool,anniversaire bool,troll bool,zelda bool,carnaval bool)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='admin_permission'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE admin_permission(uuid UUID, groupe_permission int2, pass int2, foyer_repas int2, foyer_perm int2, banderole int2, user_editor int2, messagerie int2, cookie int2, admin_only int2, localisation int2, CDI int2, Aumônerie int2, DOC int2, Audio int2, Tutorat int2, City_stade int2, Bien_être int2)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='amis'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE amis(uuid uuid,ami uuid,procuration boolean)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='user_groups'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE user_groups(uuid uuid,group2 text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='token'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE token(token text,uuid UUID,creation text,last_use text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='users_notification_subscription'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE users_notification_subscription(subscription_id UUID, uuid UUID, endpoint text, p256dh text, auth text, creation text, last_use text)')
    })

    //perm
    db.get("SELECT * FROM sqlite_master where type='table' AND name='perm_info'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE perm_info(semaine int2,day int2,creneau int2,ouvert int2)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='perm_list'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE perm_list(semaine int2,day int2,creneau int2,uuid uuid,group2 text,nb int2,DorI boolean)')
    })

    //midi
    db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_info'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE midi_info(semaine int2,creneau int2,cout float4,gratuit_prio boolean,ouvert int2,perMin int2,places int2,prio_mode int2,nbSandwich int2,nbSandwich_vege int2,mode_sandwich int2,bonus_avance float4,algo_auto int2,msg text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_menu'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE midi_menu(semaine int2,menu text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_list'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE midi_list(semaine int2,creneau int2,uuid uuid,scan boolean,DorI boolean,sandwich int2,date Date)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_prio'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE midi_prio(semaine int2,creneau int2,group2 text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_amis'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE midi_amis(semaine int2,creneau int2,uuid uuid,amis uuid)')
    })

    //sondage menu
    db.get("SELECT * FROM sqlite_master where type='table' AND name='sondage_menu'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE sondage_menu(uuid uuid,semaine int2,menu int2,note int2)')
    })

    //point
    db.get("SELECT * FROM sqlite_master where type='table' AND name='point_global'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE point_global(name text,value float4,date Date)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='point_perso'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE point_perso(uuid uuid,name value,value float4,date Date)')
    })

    //group / classe
    db.get("SELECT * FROM sqlite_master where type='table' AND name='classe_list'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE classe_list(classe text,niveau int2)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='group_list'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE group_list(group2 text)')
    })

    //cookies et ban
    db.get("SELECT * FROM sqlite_master where type='table' AND name='ticket_cookie'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE ticket_cookie(id uuid,uuid uuid,date Date,justificatif text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='subscription_cookie'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE subscription_cookie(id uuid,uuid uuid,debut Date,fin Date,justificatif text,period int2,cumulatif boolean,nbAdd int2,quantity int2,maj Date)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='ban'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE ban(id uuid,uuid uuid,debut Date,fin Date,justificatif text)')
    })

    //post 
    db.get("SELECT * FROM sqlite_master where type='table' AND name='post'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE post(id uuid,from2 uuid,group2 text,title text,text text,date Date)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='post_lu'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE post_lu(id uuid,user uuid)')
    })

    //LIEU
    db.get("SELECT * FROM sqlite_master where type='table' AND name='lieu_info'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE lieu_info(lieu text,semaine int2,day int2,creneau int2,ouvert int2,msg text,title text,texte text,places int2)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='lieu_list'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE lieu_list(uuid uuid,lieu text,semaine int2,day int2,creneau int2,scan boolean)')
    })
    /*db.get("SELECT * FROM sqlite_master where type='table' AND name='CDI_list'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE CDI_list(semaine int2,day int2,creneau int2,group2 text)')
    })*/

    // pdf
    /*db.get("SELECT * FROM sqlite_master where type='table' AND name='pdf'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE pdf(id uuid,from2 uuid,group2 text,title text,date Date)')
    })*/


    //messages / news / sondage
    /*db.get("SELECT * FROM sqlite_master where type='table' AND name='messages'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE messages(id uuid,from2 text,to2 text,lu boolean,text text,title text,date text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='news'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE news(id uuid,from2 text,text text,title text,date Date)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='news_lu'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE news_lu(id uuid,user uuid,lu boolean)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='sondages'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE sondages(id uuid,from2 text,text text,title text,date Date,mode int2,choix text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='sondages_reponse'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE sondages_reponse(id uuid,user uuid,reponse text)')
    })*/
  }