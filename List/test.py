import firebase_admin
from firebase_admin import credentials
from firebase_admin import db


cred = credentials.Certificate('key.json')

firebase_admin.initialize_app(cred, {
  'databaseURL': "https://smb-384c5-default-rtdb.europe-west1.firebasedatabase.app"
})

x=db.reference("users").get()
for n in x:
  print(n)
  db.reference("users/" + n + "/score").delete()
    