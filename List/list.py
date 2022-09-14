import csv
import time
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import datetime


cred = credentials.Certificate('key.json')

firebase_admin.initialize_app(cred, {
  'databaseURL': "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app/"
})

x=db.reference("users").get()
for n in x:
  s=x.get(n).get("score")
  if s!=None:
    for so in s:
      sn=s.get(so).get("name")
      if sn=="gain de la semaine 37":
        #print(db.reference("users/"+n+"/score/"+so).get())
        #db.reference("users/"+n+"/score/"+so).delete()