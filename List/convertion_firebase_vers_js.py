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


with open("list.csv") as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
        cur.execute("INSERT INTO users(email,uuid,first_name,last_name,classe,code_barre,admin) VALUES('" + rowB[13] + "','" + str(uuid.uuid4()) + "','" + rowB[1] + "','" + rowB[0] + "','" + rowB[2] + "','" + rowB[3] + "',0)")
        
con.commit()
#uuid UUID, first_name text, last_name text, email text, code_barre CHAR[5], classe text, tuto boolean,admin int2
#res = cur.execute("SELECT name FROM sqlite_master")
#res.fetchone()
#INSERT INTO users(email,uuid,first_name,last_name,admin) VALUES(" + rowB[13] + "," + str(uuid.uuid4()) + "," + rowB[1] + "," + rowB[0] + ",0)