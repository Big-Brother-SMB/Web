import csv
from email import message
from operator import index, indexOf
from datetime import datetime
import time

import sqlite3
import uuid
con = sqlite3.connect('../../main.db')
cur = con.cursor()

list_prio = []

with open('list.csv') as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
        res = cur.execute('SELECT uuid FROM users WHERE email="'+rowB[11]+'"')
        x = res.fetchone()
        if x is None:
            uuid_ = str(uuid.uuid4())
            cur.execute('INSERT INTO users(email,uuid,first_name,last_name,classe,code_barre,admin,tuto,picture,birthday,birthmonth,verify) VALUES("' + rowB[11] + '","' + uuid_ + '","' + rowB[2] + '","' + rowB[1] + '","' + rowB[0] + '","' + rowB[10] + '",0,0,"",' + rowB[31].split("/")[0] + ',' + rowB[31].split("/")[1] + ',1)')
            for i in range(3,10):
                if rowB[i]!='':
                    if not rowB[i] in list_prio:
                        list_prio.append(rowB[i])
                    cur.execute('INSERT INTO user_groups(uuid,group2) VALUES("' + uuid_ + '","' + rowB[i] + '")')
        else:
            uuid_ = x[0]
            cur.execute('UPDATE users SET first_name="' + rowB[2] + '",last_name="' + rowB[1] + '",classe="' + rowB[0] + '",code_barre="' + rowB[10] + '",birthday=' + rowB[31].split("/")[0] + ',birthmonth=' + rowB[31].split("/")[1] + ',verify=1 WHERE uuid="' + uuid_ + '"')
            cur.execute('DELETE FROM user_groups WHERE uuid="' + uuid_ + '"')
            for i in range(3,10):
                if rowB[i]!='':
                    if not rowB[i] in list_prio:
                        list_prio.append(rowB[i])
                    cur.execute('INSERT INTO user_groups(uuid,group2) VALUES("' + uuid_ + '","' + rowB[i] + '")')

cur.execute('DELETE FROM group_list')

list_prio+=['Club info','Matches Heads']
for prio in list_prio:
    cur.execute('INSERT INTO group_list(group2) VALUES("' + prio + '")')


cur.execute('DELETE FROM classe_list')

t0 =["2A","2B","2C","2D","2E","2F","2G","2H","2I","2J","2K","2L"]
t1 =["1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K"]
t2 =["TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK"]
t3=["PCSI","PC","professeurs-personnel"]

for e in t0:
    cur.execute('INSERT INTO classe_list(classe,niveau) VALUES ("' + e + '",0)')
for e in t1:
    cur.execute('INSERT INTO classe_list(classe,niveau) VALUES ("' + e + '",1)')
for e in t2:
    cur.execute('INSERT INTO classe_list(classe,niveau) VALUES ("' + e + '",2)')
for e in t3:
    cur.execute('INSERT INTO classe_list(classe,niveau) VALUES ("' + e + '",3)')


con.commit()