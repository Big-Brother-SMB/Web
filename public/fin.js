const firebaseConfig = {
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

function replaceX(email,d,f){
  let emailT = email.split(d);
  let str = ""
  for(let i = 0 ; i<emailT.length ; i++){
      if(str!=""){
          str+=f
      }
      str+=emailT[i]
  }
  console.log(str)
  return str
}

let tablecookie = document.cookie.split('; ');
let cookie = {};
for(let i in tablecookie){
    let row = tablecookie[i].split('=')
    if(row.length >1){
        cookie[row[0]] = row[1];
    }
}

function writeCookie(key, value){
    document.cookie = key + "=" + value + "; expires=Mon, 06 Oct 2100 00:00:00 GMT; path=/";
}

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


firebase.auth().onAuthStateChanged(function(userX) {
  if(userX){
    user = replaceX(userX.email,'.','µ')

    email=userX.email

    writeCookie("user",user)
    writeCookie("email",email)
    writeCookie("week",actualWeek)
    writeCookie("RGPD",true)

    let userT = userX.email.split("@")[0].split(".");
    userT[0]=userT[0][0].toUpperCase()+userT[0].slice(1)
    userT[1]=userT[1].toUpperCase();
    userName = userT[0]+" "+userT[1]
    writeCookie("name",userName)
    window.location.href = window.location.origin + "/vote/vote.html";
  }
})