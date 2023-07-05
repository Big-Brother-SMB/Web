const {readFile} = require('fs')
const {promisify} = require('util')
const url = require('url');
const path = require('path');
const readFileAsync = promisify(readFile)


const READ_OPTIONS = {encoding:'UTF-8'}
const sources_url = `${__dirname}/../sources`;


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

  if(baseName=='common'){
    subFolder = "share"
  }
  try{
    if(extName == '.jpg' || extName == '.png' || extName == '.ico' || extName == '.eot' || extName == '.ttf' || extName == '.svg' || extName == '.gif'){
      fichier = await readFileAsync(sources_url+pathName)
    }else if(extName =='.html' || extName == '.css' || extName == '.js'){
      if(modeAuto){
        fichier = await readFileAsync(sources_url+dirName+'/'+subFolder+'/'+baseName+extName,READ_OPTIONS)
      }else{
        fichier = await readFileAsync(sources_url+pathName,READ_OPTIONS)
      }
    }else if(extName == ''){
      const [modele,tete,titre,main,script] = await Promise.all([
        readFileAsync(sources_url+'/share/model.html'),
        readFileAsync(sources_url+dirName+'/'+subFolder+'/'+baseName+'.tete.html',READ_OPTIONS),
        readFileAsync(sources_url+dirName+'/'+subFolder+'/'+baseName+'.titre.html',READ_OPTIONS),
        readFileAsync(sources_url+dirName+'/'+subFolder+'/'+baseName+'.main.html',READ_OPTIONS),
        readFileAsync(sources_url+dirName+'/'+subFolder+'/'+baseName+'.script.html',READ_OPTIONS)
      ])
      fichier = modele.toString()
        .replace('{{CSS}}',pathName+'.css')
        .replace('{{EN-TETE}}',tete.toString())
        .replace('{{TITRE}}',titre.toString())
        .replace('{{MAIN}}',main.toString())
        .replace('{{SCRIPT}}',script.toString())
    }
  }catch(e){
    console.error(e)
    fichier = await readFileAsync(sources_url+'/share/404.html',READ_OPTIONS)
    err404=true
  }

  if(extName==''){
    extName='.html'
  }
  return [fichier,extName,err404]
}