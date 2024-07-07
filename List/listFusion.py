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


db.reference("users/").set(0)
db.reference("names/").set(0)
with open("users.csv") as file:
    data_reader = csv.reader(file)
    for row in data_reader:
        if row[5][0]=="T" :
            id = row[3].replace(".","µ")
            db.reference("users/" + id + "/test").set(0)
            db.reference("names/" + id).set(row[1]+" "+row[2])
            
