module.exports = (db)=>{
    //var
    db.get("SELECT * FROM sqlite_master where type='table' AND name='var'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE var(key text, value text)')
    })

    //emprunt
    db.get("SELECT * FROM sqlite_master where type='table' AND name='emprunt'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE emprunt(objet string,uuid UUID,debut DATE,fin DATE)')
    })

    //users / amis / user-group / token
    db.get("SELECT * FROM sqlite_master where type='table' AND name='users'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE users(uuid UUID, first_name text, last_name text, email text, code_barre CHAR[5], classe text, tuto boolean,admin int2)')
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
        db.run('CREATE TABLE midi_info(semaine int2,creneau int2,cout float4,gratuit_prio boolean,ouvert int2,perMin int2,places int2,prio_mode int2)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_menu'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE midi_menu(semaine int2,menu text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_list'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE midi_list(semaine int2,creneau int2,uuid uuid,scan boolean,DorI boolean,sandwich int2)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_prio'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE midi_prio(semaine int2,creneau int2,group2 text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='midi_amis'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE midi_amis(semaine int2,creneau int2,uuid uuid,amis uuid)')
    })

    //point
    db.get("SELECT * FROM sqlite_master where type='table' AND name='point_global'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE point_global(name text,value float4,date text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='point_perso'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE point_perso(uuid uuid,name value,value float4,date text)')
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

    //messages / news / sondage
    db.get("SELECT * FROM sqlite_master where type='table' AND name='messages'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE messages(id uuid,from2 text,to2 text,lu boolean,texte text,title text,date text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='news'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE news(id uuid,from2 text,texte text,title text,date text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='news_lu'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE news_lu(id uuid,user uuid,lu boolean)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='sondages'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE sondages(id uuid,from2 text,texte text,title text,date text,mode int2,choix text)')
    })
    db.get("SELECT * FROM sqlite_master where type='table' AND name='sondages_reponse'", (err, data) => {
      if(data==undefined)
        db.run('CREATE TABLE sondages_reponse(id uuid,user uuid,reponse text)')
    })
  }