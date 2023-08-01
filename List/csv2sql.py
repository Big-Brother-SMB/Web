import csv
from email import message
from operator import index, indexOf
from datetime import datetime
import time

import sqlite3
import uuid
con = sqlite3.connect("../../main.db")
cur = con.cursor()


with open("list.csv") as file:
    data_reader = csv.reader(file)
    for rowB in data_reader:
        cur.execute("INSERT INTO users(email,uuid,first_name,last_name,classe,code_barre,admin) VALUES('" + rowB[4] + "','" + str(uuid.uuid4()) + "','" + rowB[1].capitalize() + "','" + rowB[2].capitalize() + "','" + rowB[0] + "','" + rowB[3] + "',0)")

con.commit()