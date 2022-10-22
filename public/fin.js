/*const firebaseConfig = {
  apiKey: "AIzaSyAPJ-33mJESHMcvEtaPX7JwIajUawblSuY",
  authDomain: "big-brother-ac39c.firebaseapp.com",
  databaseURL: "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "big-brother-ac39c",
  storageBucket: "big-brother-ac39c.appspot.com",
  messagingSenderId: "498546882155",
  appId: "1:498546882155:web:722a18432bf108e0c1632e",
  measurementId: "G-J5N38BGN7R"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database()

Date.prototype.getWeek = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

// Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function() {
  var date = new Date(this.getTime());
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  return date.getFullYear();
}
let date = new Date();
const actualWeek = date.getWeek();

document.cookie = "test=xµx; expires=Mon, 06 Oct 2100 00:00:00 GMT; path=/";
let tablecookie = document.cookie.split('; ');
let cookie = {};
console.log(tablecookie)
for(let i in tablecookie){
    let row = tablecookie[i].split('=')
    if(row.length >1){
        cookie[row[0]] = row[1];
    }
}

function writeCookie(key, value){
    document.cookie = key + "=" + value + "; expires=Mon, 06 Oct 2100 00:00:00 GMT; path=/";
}

function readCookie(key){
    return cookie[key];
}
*/
firebase.auth().onAuthStateChanged(function(userX) {
  if(userX){
    let µ = userX.email.split('.')
    let user2=""
    for(let i=0;i<µ.length;i++){
      if(i+1==µ.length){
        user2=user2+µ[i]
      }else{
        user2=user2+µ[i]+"µ"
      }
      console.log(user2)
      console.log(i)
      console.log(µ.length)
    }
    let email=userX.email

    writeCookie("user",user2)
    writeCookie("email",email)
    writeCookie("week",actualWeek)
    writeCookie("RGPD",true)
    database.ref("users/" + user2 + "/email").set(email);
    
    setTimeout(function() {
      database.ref("names/"+user2).once('value',function(snapshot){
        let userT = userX.email.split("@")[0].split(".");
        userT[0]=userT[0][0].toUpperCase()+userT[0].slice(1)
        userT[1]=userT[1].toUpperCase();
        let userName = userT[0]+" "+userT[1]
        if(snapshot.val()==null){
            database.ref("names/" + user2).set(userName);
        }else{
            userName=snapshot.val()
            writeCookie("name",userName)
        }
        database.ref("modo/users/"+ user2).once('value',function(snapshot2){
          if(snapshot2.val()===1){
            window.location.href = "/admin/menu/menu.html";
          } else {
            console.log(readCookie("user"))
            window.location.href = "/menu/menu.html";
          }
        })
      })
    },1000);
  }else{
    window.location.href = window.location.origin + "/index.html";
  }
})
