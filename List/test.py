import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from operator import itemgetter

cred = credentials.Certificate('key.json')

firebase_admin.initialize_app(cred, {
  'databaseURL': "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app/"
})

x=db.reference("users").get()
l1=[]
for n in x:
    c=x.get(n).get("priorites")
    l2=[]
    if c != None:
      for p in c:
        l2.append(p)
      l1.append(l2)
for l2 in l1:
  if "AGL9" in l2 and "DGEMC" in l2:
    print("ok")
    