const {readFile} = require('fs')
const fs = require('fs')
const {promisify} = require('util')
const url = require('url');
const path = require('path');
const User = require('./User.js')
const archiver = require('archiver');
const readFileAsync = promisify(readFile)


const READ_OPTIONS = {encoding:'UTF-8'}
const sources_url = path.join(__dirname,"..","sources");


module.exports = async(req_url) => {
  let pathName = url.parse(req_url).path.split('?')[0];
  
  if(pathName === '/'){
    pathName = '/index.html';
  }
  let modeAuto = true
  if(pathName.split('/')[1]=="auto0"){
    pathName=pathName.substring(6,pathName.length)
    modeAuto = false
  }
  let extName = path.extname(pathName);
  let baseName = path.basename(pathName,extName);
  let dirName = path.dirname(pathName);
  let subFolder = baseName
  let fichier
  let err404=false

  if((baseName=='common' || baseName=='dark')&& modeAuto){
    subFolder = "share"
  }
  try{
    let user = await User.searchToken(url.parse(req_url).path.split('?')[1])
    if(pathName=="/database.db" && await user.admin > 0){
      fichier = await readFileAsync(path.join(sources_url,"..","..","main.db"))
    }else if(pathName=="/pyscan.zip" && await user.admin > 0){
      await zipDirectory(path.join(sources_url,"..","PyScan"),path.join(sources_url,"..","PyScan.zip"))
      fichier = await readFileAsync(path.join(sources_url,"..","PyScan.zip"))
    }else if(extName =='.html' || extName == '.css' || extName == '.js'){
      if(modeAuto){
        fichier = await readFileAsync(path.join(sources_url,dirName,subFolder,baseName+extName),READ_OPTIONS)
      }else{
        fichier = await readFileAsync(path.join(sources_url,pathName),READ_OPTIONS)
      }
    }else if(extName == ''){
      let typeSideBar=dirName.split("/")[1]
      if(typeSideBar!="admin" && typeSideBar!="asso"){
        typeSideBar="user"
      }
      const [modele,tete,titre,main,sidebar] = await Promise.all([
        readFileAsync(path.join(sources_url,'share','model.html'),READ_OPTIONS),
        readFileAsync(path.join(sources_url,dirName,subFolder,baseName+'.tete.html'),READ_OPTIONS),
        readFileAsync(path.join(sources_url,dirName,subFolder,baseName+'.titre.html'),READ_OPTIONS),
        readFileAsync(path.join(sources_url,dirName,subFolder,baseName+'.main.html'),READ_OPTIONS),
        readFileAsync(path.join(sources_url,'share',typeSideBar+'_sidebar.html'),READ_OPTIONS)
      ])
      fichier = modele.toString()
        .replace('{{CSS}}',pathName+'.css')
        .replace('{{EN-TETE}}',tete.toString())
        .replace('{{TITRE}}',titre.toString())
        .replace('{{MAIN}}',main.toString())
        .replace('{{SIDEBAR}}',sidebar.toString())
    }else{//autre extName
      fichier = await readFileAsync(path.join(sources_url,pathName))
    }
  }catch(e){
    console.error(e);console.log('c1');
    fichier = await readFileAsync(path.join(sources_url,"share","404.html"),READ_OPTIONS)
    err404=true
  }

  if(extName==''){
    extName='.html'
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