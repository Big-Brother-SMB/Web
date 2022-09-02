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

with open("2.csv") as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
        row=[]
        row.append(rowB[1])
        row.append("")
        row.append(rowB[0])
        row.append(rowB[8])

        row.append(rowB[2])
        row.append(rowB[3])

        row.append("")
        row.append("")
        row.append("")

        row.append(rowB[4])
        row.append(rowB[5])
        row.append(rowB[6])
        row.append(rowB[7])
        rows.append(row)
with open("1.csv") as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
        row=[]
        row.append(rowB[1])
        row.append("")
        row.append(rowB[0])
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
        rows.append(row)
with open("T.csv") as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
        row=[]
        row.append(rowB[1])
        row.append("")
        row.append(rowB[0])
        row.append(rowB[9])

        row.append(rowB[2])
        row.append(rowB[3])

        row.append(rowB[4])
        row.append(rowB[5])
        row.append("")

        row.append(rowB[6])
        row.append(rowB[7])
        row.append(rowB[8])
        row.append("")
        rows.append(row)


for i in range(len(rows)):
    if rows[i][0]!="":
        l=rows[i][0].split(" ")
        if len(l)==2:
            rows[i][0]=l[0]
            rows[i][1]=l[1]
        else:
            rows[i][1]="err"
            print("err")
with open("list.csv","w") as file:
	dataW = csv.writer(file)
	for i in rows:
            if i[0]!="":
                dataW.writerow(i)
