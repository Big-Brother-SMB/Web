import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

//---------------------------cookie---------------------------
let tablecookie = document.cookie.split('; ');
let cookie = {};
for (let i in tablecookie) {
  let row = tablecookie[i].split('=')
  if (row.length == 2) {
    cookie[row[0]] = row[1];
   }
}
console.log("cookie", cookie)

function writeCookie(key, value){
  document.cookie = key + "=" + value + "; expires=Mon, 06 Oct 2100 00:00:00 GMT; path=/";
  cookie[key]=value
}

function readCookie(key){
  return cookie[key];
}

let listKey = []
try{
  listKey=readCookie("listKey").split('/')
  listKey.pop()
}catch(Exception){}

function saveListKey(){
  let str=""
  listKey.forEach(element => {
    str+=element+"/"
  });
  writeCookie("listKey",str)
}

//---------------------------récupération du token/key---------------------------
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
if(params.token!=null){
  writeCookie("key",params.token)
  listKey.push(params.token)
  saveListKey()
}

if(params.err!=null){
  document.getElementById("infos").innerHTML += params.err + "<br>"
}



//---------------------------socket---------------------------
let list_id_data=[]

try{
  listKey = listKey.filter((x, i) => listKey.indexOf(x) === i)
  for(const element of listKey){
    let socket = io({
      auth: {
        token: element
      }
    });
    list_id_data.push(new Promise(async function(resolve, reject) {
      socket.emit("id_data","");
      socket.once("id_data",result => {
        socket.disconnected
        resolve(result)
      });
      setTimeout(reject,5000)
    }))
  };
  list_id_data = await Promise.all(list_id_data)


  for(let i=0;i<list_id_data.length;i++){
    if(list_id_data[i]!='err')
      list_id_data[i].key=listKey[i]
  }


  let listUuid=[]
  list_id_data.forEach(e=>{
    if(e!='err'){
      listUuid.push(e.uuid)
    }else{
      listUuid.push(null)
    }
  })


  for(let i=listUuid.length-1;i>=0;i--){
    if(listUuid.indexOf(listUuid[i])!=i || listUuid[i]==null){
      listUuid.splice(i,1)
      list_id_data.splice(i,1)
      listKey.splice(i,1)
    }
  }
  saveListKey()

  console.log(listKey,list_id_data)
}catch(Exception){
  console.log(Exception)
  //window.location.reload()
}

//---------------------------RGPD---------------------------
if (readCookie("RGPD") == 'true') {
  document.getElementById("checkbox").checked = true
}

document.getElementById("checkbox").addEventListener("change",function(){
  writeCookie("RGPD",document.getElementById("checkbox").checked)
})

//---------------------------bouton connection---------------------------
list_id_data.forEach(id_data=>{
  if (id_data!='err') {
    let div = document.createElement('div')
    div.classList.add('account')

    let img = document.createElement('img')
    img.classList.add("account_img")
    if(id_data.picture==null){
      img.setAttribute("src","https://lh3.googleusercontent.com/a/default-user=s96-c")//"/Images/account.png")
    }else{
      img.setAttribute("src",id_data.picture)
    }
    div.appendChild(img)

    let text = document.createElement('p')
    text.classList.add('account_text')
    text.innerHTML = id_data.first_name+" "+id_data.last_name
    div.appendChild(text)

    let supp = document.createElement('img')
    supp.classList.add('account_img')
    supp.classList.add('account_supp')
    supp.setAttribute("src","/Images/croix.png")
    supp.innerHTML = id_data.first_name+" "+id_data.last_name
    supp.addEventListener('click',()=>{
      const index = list_id_data.indexOf(id_data)
      list_id_data.splice(index,1)
      listKey.splice(index,1)
      saveListKey()
      document.getElementById("list_accounts").removeChild(div)
    })
    div.appendChild(supp)

    div.addEventListener("click",function(event){
      if(!event.target.classList.contains("account_supp")){
        if(document.getElementById("checkbox").checked == true){
          connect(id_data)
        } else {
          document.getElementById("infos").innerHTML = "Vous devez accepter la politique de confidentialité des données et les Cookies<br>"
        }
      }
    })
    document.getElementById("list_accounts").appendChild(div)
  }
})

document.getElementById("change").addEventListener("click",function(){
  window.location.href = window.location.origin+"/connexion/apigoogle";
})


//---------------------------connection---------------------------

async function connect(id_data){
  if(id_data!='err'){
    writeCookie("key",id_data.key)
    if(id_data.admin==2){
      window.location.href = "/admin/menu";
    } else {
      window.location.href = "/accueil";
    }
  }
}