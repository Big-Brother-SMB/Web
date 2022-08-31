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
i=0
with open("list.csv") as file:
  data_reader = csv.reader(file)
  for line in data_reader:
    i+=1
    #db.reference("users/"+line[1]+" "+line[0]+"/classe").set(line[2])
    db.reference("users/"+line[1]+" "+line[0]+"/code barre").set(line[3])
    #for loop in range(4,len(line)):
      #db.reference("users/"+line[1]+" "+line[0]+"/priorites/"+line[4]).set(0)
      #pass
print("fin "+str(i))