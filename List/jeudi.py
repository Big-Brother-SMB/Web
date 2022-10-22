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

x=db.reference("names").get()
with open("prio.csv") as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
        name=rowB[1]+" "+rowB[0]
        test=True
        for u in x:
            name2=x.get(u)
            if name==name2:
                db.reference("users/"+u+"/priorites/jeudi").set(0)
                test=False
        if test:
          print(name)
