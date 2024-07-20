const fs = require('fs')
const {promisify} = require('util')
const url = require('url');
const path = require('path');
const User = require('./User.js')
const archiver = require('archiver');
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)


const READ_OPTIONS = {encoding:'UTF-8'}
const sources_url = path.join(__dirname,"..","sources");

const jsonObj = JSON.parse(fs.readFileSync(path.join(__dirname,"..","..","code.json")));
const py_token = jsonObj.admin

module.exports = async(req_url) => {
  let pathName = url.parse(req_url).path.split('?')[0];
  
  if(pathName === '/'){
    pathName = '/index.html';
  }
  let extName = path.extname(pathName);
  let fichier
  let err404=false

  try{
    let user = await User.searchToken(url.parse(req_url).path.split('?')[1])
    if(pathName=="/database.db" && await user.admin > 0){
      fichier = await readFileAsync(path.join(sources_url,"..","..","main.db"))
    }else if(pathName=="/PyScan.zip" && await user.admin > 0){
      await writeFileAsync(path.join(sources_url,"..","PyScan","save.txt"),py_token+"\n");
      await zipDirectory(path.join(sources_url,"..","PyScan"),path.join(sources_url,"..","PyScan.zip"))
      fichier = await readFileAsync(path.join(sources_url,"..","PyScan.zip"))
    }else if(pathName=="/profile_picture/all"){
      await zipDirectory(path.join(sources_url,"..","sources","profile_picture"),path.join(sources_url,"..","profile_picture.zip"))
      fichier = await readFileAsync(path.join(sources_url,"..","profile_picture.zip"))
    }else if(extName == ''){
      let baseName = path.basename(pathName,extName);
      let dirName = path.dirname(pathName);

      let typeSideBar=dirName.split("/")[1]
      if(typeSideBar!="admin" && typeSideBar!="asso"){
        typeSideBar="user"
      }
      const [modele,tete,titre,main,sidebar] = await Promise.all([
        readFileAsync(path.join(sources_url,'share','model.html'),READ_OPTIONS),
        readFileAsync(path.join(sources_url,dirName,baseName,baseName+'.tete.html'),READ_OPTIONS),
        readFileAsync(path.join(sources_url,dirName,baseName,baseName+'.titre.html'),READ_OPTIONS),
        readFileAsync(path.join(sources_url,dirName,baseName,baseName+'.main.html'),READ_OPTIONS),
        readFileAsync(path.join(sources_url,'share',typeSideBar+'_sidebar.html'),READ_OPTIONS)
      ])
      if(dirName!="/") dirName+="/"
      fichier = modele.toString()
        .replace('{{CSS}}',dirName+baseName+"/"+baseName+'.css')
        .replace('{{EN-TETE}}',tete.toString())
        .replace('{{TITRE}}',titre.toString())
        .replace('{{MAIN}}',main.toString())
        .replace('{{SIDEBAR}}',sidebar.toString())
    }else if(extName =='.html' || extName == '.css' || extName == '.js'){
      fichier = await readFileAsync(path.join(sources_url,pathName),READ_OPTIONS)
    }else{//autre extName
      fichier = await readFileAsync(path.join(sources_url,pathName))
    }
  }catch(e){
    //console.error("gP");
    console.log('No found page: ' + pathName);
    fichier = await readFileAsync(path.join(sources_url,"share","404.html"),READ_OPTIONS)
    err404=true
  }

  if(extName==''){
    extName='.html'
  }

  if(pathName.includes("/profile_picture/") && err404){
    err404=false
    fichier = await readFileAsync(path.join(sources_url,"assets","default-user.png"))
  }
  return [fichier,extName,err404]
}




function zipDirectory(sourceDir, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', err => reject(err))
      .pipe(stream)
    ;

    stream.on('close', () => resolve());
    archive.finalize();
  });
}