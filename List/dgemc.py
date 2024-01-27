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

cur.execute('DELETE FROM user_groups WHERE group2="T_DGEMC_1"')
cur.execute('DELETE FROM user_groups WHERE group2="T_DGEMC_2"')
cur.execute('DELETE FROM user_groups WHERE group2="T_DROIT2_DGEMC"')
with open('dgemc.csv') as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
        res = cur.execute('SELECT uuid FROM users WHERE last_name="'+rowB[0]+'" AND first_name="'+rowB[1]+'"')
        x = res.fetchone()
        if x is None:
            print(rowB)
        else:
            uuid_ = x[0]
            cur.execute('INSERT INTO user_groups(uuid,group2) VALUES("' + uuid_ + '","' + rowB[2] + '")')
con.commit()