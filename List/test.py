import firebase_admin
from firebase_admin import credentials
from firebase_admin import db


cred = credentials.Certificate('key.json')

firebase_admin.initialize_app(cred, {
  'databaseURL': "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app/"
})

x=db.reference("users").get()
tour=0
for n in x:
    o=x.get(n).get("score")
    score=0
    for s in o:
      score+=o.get(s).get("value")
    if score<0:
      tour+=1
      print(n)
print(tour)
    