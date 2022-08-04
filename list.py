import csv
import time
import pyrebase
from datetime import datetime
config = {
    "apiKey": "AIzaSyAPJ-33mJESHMcvEtaPX7JwIajUawblSuY",
    "authDomain": "big-brother-ac39c.firebaseapp.com",
    "databaseURL": "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app",
    #"projectId": "big-brother-ac39c",
    "storageBucket": "big-brother-ac39c.appspot.com",
    #"messagingSenderId": "498546882155",
    #"appId": "1:498546882155:web:722a18432bf108e0c1632e",
    #"measurementId": "G-J5N38BGN7R"
}
database = pyrebase.initialize_app(config).database()


with open("liste.csv") as file:
    data_reader = csv.reader(file)
    for line in data_reader:
        print(line[2]+" "+line[1])
        database.child("users/"+line[2]+" "+line[1]+"/code barre").set(line[0])
        database.child("users/"+line[2]+" "+line[1]+"/classe").set(line[3])
print("fin")