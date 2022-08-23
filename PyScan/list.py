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

with open("liste.csv") as file:
    data_reader = csv.reader(file)
    for line in data_reader:
        print(line[2]+" "+line[1])
        db.reference("users/"+line[2]+" "+line[1]+"/code barre").set(line[0])
        db.reference("users/"+line[2]+" "+line[1]+"/classe").set(line[3])
print("fin")