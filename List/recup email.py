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

rows=[]
err=0
with open("list.csv","r") as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
      if rowB[13]=="":
        x=db.reference("users/"+rowB[1]+" "+rowB[0]+"/email").get()
        print(rowB[1]+" "+rowB[0])
        if x!=None:
          rowB[13]=x
        err+=1
      rows.append(rowB)

with open("list.csv","w") as file:
	dataW = csv.writer(file)
	for i in rows:
            if i[0]!="":
                dataW.writerow(i)
print(err)
