import csv
from email import message
from operator import index, indexOf
import time
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from datetime import datetime
import time

import sqlite3
import uuid
con = sqlite3.connect("../main.db")
cur = con.cursor()

cred = credentials.Certificate('key.json')

firebase_admin.initialize_app(cred, {
  'databaseURL': "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app/"
})


"""
with open("list.csv") as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
        cur.execute("INSERT INTO users(email,uuid,first_name,last_name,classe,code_barre,admin) VALUES('" + rowB[13] + "','" + str(uuid.uuid4()) + "','" + rowB[1] + "','" + rowB[0] + "','" + rowB[2] + "','" + rowB[3] + "',0)")
"""
racine=db.reference("/").get()
list_user=[]
for u in racine.get("users"):
    user={}
    user['idUser']=u
    t = u.split('@')[0].split('µ')
    user['prenom']=t[0]
    user['nom']=""
    if 1<len(t):
        user['nom'] = t[1]
    
    u=racine.get("users").get(u)
    amis=u.get("amis")
    user['amis']=[]
    if amis!=None:
        for a in amis:
            user['amis'].append(a)
    user['classe']=u.get("classe")
    user['code barre']=u.get("code barre")
    user['email']=u.get("email")
    prios=u.get("priorites")
    user['priorites']=[]
    if prios!=None:
        for prio in prios:
            user['priorites'].append(prio)
    list_user.append(user)

with open('list.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    for u in list_user:
        writer.writerow([str(u['classe']),str(u['prenom']),str(u['nom']),str(u['code barre']),str(u['email'])])


#print(rFoyer)
#pret/users====histPoint/priorites
"""
for u in list_user:
    if u['prenom']!='None':
        print(u)
        cur.execute("INSERT INTO users(email,uuid,first_name,last_name,classe,code_barre,admin) VALUES('" + str(u['email']) + "','" + str(u['id']) + "','" + str(u['prenom']) + "','" + str(u['nom']) + "','" + str(u['classe']) + "','" + str(u['code barre']) + "',0)")
con.commit()"""
#uuid UUID, first_name text, last_name text, email text, code_barre CHAR[5], classe text, tuto boolean,admin int2
#res = cur.execute("SELECT name FROM sqlite_master")
#res.fetchone()
#INSERT INTO users(email,uuid,first_name,last_name,admin) VALUES(" + rowB[13] + "," + str(uuid.uuid4()) + "," + rowB[1] + "," + rowB[0] + ",0)