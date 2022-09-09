import firebase_admin
from firebase_admin import credentials
from firebase_admin import db


cred = credentials.Certificate('key.json')

firebase_admin.initialize_app(cred, {
  'databaseURL': "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app/"
})

x=db.reference("users").get()
for n in x:
    o=x.get(n)
    test=x.get(n).get("verifier")
    tuto=x.get(n).get("tuto")!=True
    c= "î" in n  or "é" in n or "è" in n or "--" in n or "ë" in n or "ç" in n or "ï" in n or "RAGRAGUI" in n or "-COUSIN" in n
    if test and tuto and c:
        print(n)
        n2=n.replace("î","i")
        n2=n2.replace("é","e")
        n2=n2.replace("è","e")
        n2=n2.replace("--","-")
        n2=n2.replace("ë","e")
        n2=n2.replace("ç","c")
        n2=n2.replace("ï","i")
        n2=n2.replace("RAGRAGUI","Ragragui")
        n2=n2.replace("-COUSIN","--COUSIN")
        #db.reference("users/"+n2).set(o)
        #db.reference("users/"+n).delete()
        #db.reference("names/"+n2).set(0)
        #db.reference("names/"+n).delete()

print("----------------------------------------")
x=db.reference("users").get()
for n in x:
    test=x.get(n).get("verifier")!=True
    if test:
        print(n)