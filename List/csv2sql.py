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
            cur.execute('INSERT INTO users(email,uuid,first_name,last_name,classe,code_barre,admin,tuto,picture) VALUES("' + rowB[11] + '","' + uuid_ + '","' + rowB[2] + '","' + rowB[1] + '","' + rowB[0] + '","' + rowB[10] + '",0,0,"")')
            for i in range(3,10):
                if rowB[i]!='':
                    if not rowB[i] in list_prio:
                        list_prio.append(rowB[i])
                    cur.execute('INSERT INTO user_groups(uuid,group2) VALUES("' + uuid_ + '","' + rowB[i] + '")')
        else:
            uuid_ = x[0]
            cur.execute('UPDATE users SET first_name="' + rowB[2] + '",last_name="' + rowB[1] + '",classe="' + rowB[0] + '",code_barre="' + rowB[10] + '" WHERE uuid="' + uuid_ + '"')
            cur.execute('DELETE FROM user_groups WHERE uuid="' + uuid_ + '"')
            for i in range(3,10):
                if rowB[i]!='':
                    if not rowB[i] in list_prio:
                        list_prio.append(rowB[i])
                    cur.execute('INSERT INTO user_groups(uuid,group2) VALUES("' + uuid_ + '","' + rowB[i] + '")')

cur.execute('DELETE FROM group_list')
for prio in list_prio:
    cur.execute('INSERT INTO group_list(group2) VALUES("' + prio + '")')

con.commit()