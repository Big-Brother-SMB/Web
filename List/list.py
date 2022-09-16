import csv
from email import message
from operator import index, indexOf
import time
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import datetime
import time


cred = credentials.Certificate('key.json')

firebase_admin.initialize_app(cred, {
  'databaseURL': "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app/"
})

x=db.reference("users").get()
ndb=db.reference("names/").get()
name=[]
id=[]
for u in x:
  name.append(ndb.get(u))
  print(ndb.get(u)+"    "+u)
  id.append(u)

print("stop")
time.sleep(3)
print("top")

f=db.reference("foyer_midi/").get()
for s in f:
  s2 = f.get(s)
  for d in s2:
    d2 = s2.get(d)
    for h in d2:
      if type(d2)!=type(" "):
        h2 = d2.get(h)
        if type(h2)!=type(" "):
          if s!="semaine38":
            db.reference("foyer_midi/"+s+"/"+d+"/"+h+"/demandes/").delete()
          ins = h2.get("inscrits")
          if ins!=None:
            for i in ins:
              db.reference("foyer_midi/"+s+"/"+d+"/"+h+"/inscrits/"+i+"/amis").delete()
              if i in name:
                db.reference("foyer_midi/"+s+"/"+d+"/"+h+"/inscrits/"+i).delete()
                db.reference("foyer_midi/"+s+"/"+d+"/"+h+"/inscrits/"+id[name.index(i)]+"/user").set(0)
              else:
                if not "µ" in i:
                  print("foyer_midi/"+s+"/"+d+"/"+h+"/inscrits/"+i)
print("fin")