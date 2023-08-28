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
        uuid_ = str(uuid.uuid4())
        print('INSERT INTO users(email,uuid,first_name,last_name,classe,code_barre,admin) VALUES("' + rowB[11] + '","' + uuid_ + '","' + rowB[2].capitalize() + '","' + rowB[1].capitalize() + '","' + rowB[0] + '","' + rowB[10] + '",0)')
        cur.execute('INSERT INTO users(email,uuid,first_name,last_name,classe,code_barre,admin) VALUES("' + rowB[11] + '","' + uuid_ + '","' + rowB[2].capitalize() + '","' + rowB[1].capitalize() + '","' + rowB[0] + '","' + rowB[10] + '",0)')
        for i in range(3,10):
            if rowB[i]!='':
                if not rowB[i] in list_prio:
                    list_prio.append(rowB[i])
                cur.execute('INSERT INTO user_groups(uuid,group2) VALUES("' + uuid_ + '","' + rowB[i] + '")')

for prio in list_prio:
    cur.execute('INSERT INTO group_list(group2) VALUES("' + prio + '")')

con.commit()