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

with open("listPPPP.csv") as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
        row=[]
        row.append("")
        row.append("")
        row.append(rowB[0])#classe
        row.append(rowB[9])

        row.append(rowB[2])
        row.append(rowB[3])

        row.append(rowB[4])
        row.append(rowB[5])
        row.append(rowB[6])

        row.append(rowB[7])
        row.append(rowB[8])
        row.append("")
        row.append("")

        row.append(rowB[10])
        rows.append(row)

for i in range(len(rows)):
    email=rows[i][13]
    print(email)
    if email!="" and email!="Email":
        assert "@stemariebeaucamps.fr" in email,"err"
        emailT=email.split("@")[0].split(".")
        rows[i][0]=emailT[0]
        rows[i][0]=emailT[1]

with open("list2.csv","w") as file:
	dataW = csv.writer(file)
	for i in rows:
            if i[0]!="":
                dataW.writerow(i)
