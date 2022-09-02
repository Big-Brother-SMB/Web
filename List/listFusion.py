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

with open("Liste_2.csv") as file:
    data_reader = csv.reader(file)
    for line in data_reader:
        row=[]
        rowB=line[0].split(";")
        row.append(rowB[1])
        row.append(rowB[2])
        row.append(rowB[3])
        row.append(rowB[10])
        row.append(rowB[4])
        row.append(rowB[5])
        row.append("")
        row.append("")
        row.append("")
        row.append(rowB[6])
        row.append(rowB[7])
        row.append(rowB[8])
        row.append(rowB[9])
        rows.append(row)
with open("Liste_1.csv") as file:
    data_reader = csv.reader(file)
    for line in data_reader:
        row=[]
        rowB=line[0].split(";")
        row.append(rowB[1])
        row.append(rowB[2])
        row.append(rowB[3])
        row.append(rowB[11])
        row.append(rowB[4])
        row.append(rowB[5])
        row.append(rowB[6])
        row.append(rowB[7])
        row.append(rowB[8])
        row.append(rowB[9])
        row.append(rowB[10])
        rows.append(row)
with open("Liste_T.csv") as file:
    data_reader = csv.reader(file)
    for line in data_reader:
        row=[]
        rowB=line[0].split(";")
        row.append(rowB[1])
        row.append(rowB[2])
        row.append(rowB[3])
        row.append(rowB[11])
        row.append(rowB[4])
        row.append(rowB[5])
        row.append(rowB[6])
        row.append(rowB[7])
        row.append("")
        row.append(rowB[8])
        row.append(rowB[9])
        row.append(rowB[10])
        rows.append(row)


with open("list.csv","w") as file:
	dataW = csv.writer(file)
	for i in rows:
		dataW.writerow(i)