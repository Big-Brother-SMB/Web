import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from pynput.keyboard import Key, Listener
import threading,os


from tkinter import *

from datetime import date,datetime

#pip install firebase_admin
#pip install pynput



cred = credentials.Certificate('key.json')
firebase_admin.initialize_app(cred, {
  'databaseURL': "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app/"
})

try:
  j=int(input("jour:"))
  m=int(input("mois:"))
  a=int(input("année:"))
  today = date(a, m, j)
except ValueError:
  today = date.today()


week = today.isocalendar().week
day = today.weekday()
if day>4:
  day=0


def parseTime(h,m):
  return h * 60 + m

def hash():
  now = datetime.now()
  return str(now.year) + "-" + ("0" if now.month < 10 else "") + str(now.month) + "-" + ("0" if now.day < 10 else "") + str(now.day) + " " + ("0" if now.hour < 10 else "") + str(now.hour) + ":" + ("0" if now.minute < 10 else "") + str(now.minute) + ":" + ("0" if now.second < 10 else "") + str(now.second)

heure = 0
def refreshTime():
  global heure
  now = datetime.now()
  refreshPassages()


  match parseTime(now.hour,now.minute):
    case num if parseTime(0,0) <= num <  parseTime(11,52):
      heure = 11
    case num if parseTime(11,52) <= num <  parseTime(24,0):
      heure = 12
    case _:
        pass

  threading.Timer(10, refreshTime).start()

def refreshPassages():
  textH.set("semaine n°" + str(week) + " " + days[day] + " à " + str(heure) + "h")
  nbPassages11 = 0
  nbInscrits11 = db.reference("foyer_midi/semaine" + str(week) + "/" + dayNum[day] + "/11h/inscrits").get()
  if nbInscrits11!=None:
    for inscritU in nbInscrits11:
      if nbInscrits11.get(inscritU)!=None:
        if nbInscrits11.get(inscritU).get("scan")!=None:
          nbPassages11+=1
    nbInscrits11 = len(nbInscrits11)
  else:
    nbInscrits11 = 0
  nbPassages12 = 0
  nbInscrits12 = db.reference("foyer_midi/semaine" + str(week) + "/" + dayNum[day] + "/12h/inscrits").get()
  if nbInscrits12!=None:
    for inscritU in nbInscrits12:
      if nbInscrits12.get(inscritU)!=None:
        if nbInscrits12.get(inscritU).get("scan")!=None:
          nbPassages12+=1
    nbInscrits12 = len(nbInscrits12)
  else:
    nbInscrits12 = 0
  passage11.set("Élèves inscrit à 11h : " + str(nbPassages11) + " / " + str(nbInscrits11))
  passage12.set("Élèves inscrit à 12h : " + str(nbPassages12) + " / " + str(nbInscrits12))

  passage.set("Élèves inscrits aujourd'hui : " + str(nbPassages11+nbPassages12) + " / " + str(nbInscrits11+nbInscrits12))


days = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]
month = ["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"]
dayNum = ["1lundi","2mardi","err","3jeudi","4vendredi"]
dayNumMer = ["1lundi","2mardi","3mercredi","4jeudi","5vendredi"]

number = 0
userName  = "None"
def show(key):
  #global name
  global number
  global userName
  userName="None"
  print(key)
  try:
    if(str(key) == "Key.backspace"):
      if(number < 10):
        number = 0
      else:
        number = int(str(number)[:-1])
    elif str(key) == "Key.enter":
      strLen=5-len(str(number))
      for loop in range(strLen):
        number=int(str(number)+"0")
    elif str(key) == "Key.shift":
      pass
    else:
      try:
        nb = int(str(key).replace("'","").replace("'","").replace("<","").replace(">",""))
        if(nb >= 96):
          nb = nb - 96

        if(number >= 10000):
          number = 0

        if(number == 0):
          number = nb
        else:
          number = int(str(number) + str(nb))
      except ValueError:
          number = 0
          pass

    if(number != 0):
      text.set(number)
    else:
      text.set("")

    if(number >=10000):
      canvas.itemconfig(image_container,image=imgLoading)

    d=db.reference("users").get()
    for userN in d:
      if str(d.get(userN).get("code barre"))==str(number):
        userName = userN
    buttonInscrire.pack_forget()
    if(userName != "None"):
      name.set(db.reference("names/" + userName).get())
      classe = str(db.reference("users/" + userName + "/classe").get())
      info.set("classe : " + classe)
      ref = db.reference("foyer_midi/semaine" + str(week) + "/" + dayNum[day] + "/" + str(heure) + "h/inscrits/" + userName)
      if(ref.get() != None):
        canvas.itemconfig(image_container,image=imgOk)
        db.reference("foyer_midi/semaine" + str(week) + "/" + dayNum[day] + "/" + str(heure) + "h/inscrits/" + userName+"/scan").set(hash())
        refreshPassages()
      else:
        canvas.itemconfig(image_container,image=imgCroix)
        buttonInscrire.pack()
    else:
      canvas.itemconfig(image_container,image=imgUnknown)
      name.set("")
      info.set("")

  except ValueError:
    pass

def add():
  canvas.itemconfig(image_container,image=imgLoading)
  buttonInscrire.pack_forget()
  cout = db.reference("foyer_midi/semaine" + str(week) + "/" + dayNum[day] + "/" + str(heure) + "h/cout").get()
  print(cout)
  if(cout == None):
    cout = -1
  else:
    cout = -int(cout)
  h = hash()
  now = datetime.now()
  db.reference("users/" + userName + "/score/" + h + "/value").set(cout)
  db.reference("users/" + userName + "/score/" + h + "/name").set("Repas du " + days[day] +  " " + str(now.day) + " " + month[now.month - 1] + " à " + str(heure) + "h")
  db.reference("foyer_midi/semaine" + str(week) + "/" + dayNum[day] + "/" + str(heure) + "h/inscrits/" + userName+"/user").set(0)
  db.reference("foyer_midi/semaine" + str(week) + "/" + dayNum[day] + "/" + str(heure) + "h/inscrits/" + userName+"/scan").set(hash())
  canvas.itemconfig(image_container,image=imgOk)
  refreshPassages()

def export():
  now = datetime.now()
  f = open("Liste de passage du " + days[day] +" de la semaine n°" + str(week) + ".txt", "w")
  names = db.reference("names/").get()
  inscritsD11 = db.reference("foyer_midi/semaine" + str(week) + "/" + dayNum[day] + "/11h/inscrits").get()
  passages11 = []
  inscrits11 = []
  inscritsD12 = db.reference("foyer_midi/semaine" + str(week) + "/" + dayNum[day] + "/12h/inscrits").get()
  passages12 = []
  inscrits12 = []
  if(inscritsD11 != None):
    for cle, valeur in inscritsD11.items():
      inscrits11.append(cle)
      if valeur.get("scan")!=None:
        passages11.append(cle)
  if(inscritsD12 != None):
    for cle, valeur in inscritsD12.items():
      inscrits12.append(cle)
      if valeur.get("scan")!=None:
        passages12.append(cle)
  print(passages11)
  print(inscrits11)
  print(passages12)
  print(inscrits12)


  f.write("Liste de passage du " + days[day] +" de la semaine n°" + str(week) +"\n\n")


  f.write("\n-----------11h------------\n\n")
  f.write("inscrits : " + str(len(inscrits11)) + "\n")
  pourcent = ""
  if(len(inscrits11) != 0):
    pourcent = " (" + str(int(len(passages11) / len(inscrits11) * 100)) + "%)"
  f.write("passes : " + str(len(passages11)) + pourcent + "\n")

  f.write("\n----------Passes----------\n\n")
  for user in passages11:
    f.write(names.get(user) + "\n")
    if(inscrits11.index(user) != -1):
      inscrits11.remove(user)

  f.write("\n----------Pas passes----------\n\n")
  for user in inscrits11:
    f.write(names.get(user) + "\n")




  f.write("\n-----------12h------------\n\n")
  f.write("inscrits : " + str(len(inscrits12)) + "\n")
  pourcent = ""
  if(len(inscrits12) != 0):
    pourcent = " (" + str(int(len(passages12) / len(inscrits12) * 100)) + "%)"
  f.write("passes : " + str(len(passages12)) + pourcent + "\n")

  f.write("\n----------Passes----------\n\n")
  for user in passages12:
    f.write(names.get(user) + "\n")
    if(inscrits12.index(user) != -1):
      inscrits12.remove(user)

  f.write("\n----------Pas passes----------\n\n")
  for user in inscrits12:
    f.write(names.get(user) + "\n")
  
  f.close()
  print("OK")



class App(threading.Thread):

    def __init__(self, tk_root, label,name):
        super(App, self).__init__()
        self.fenetre = tk_root
        self.label = label
        self.name = name

        self.start()

    def run(self):
        with Listener(on_press=lambda event: show(event)) as listener:
            listener.join()

fenetre = Tk()
fenetre.geometry("450x700+0+0")
fenetre.title("Scanner")
#fenetre.iconbitmap('logo.ico')
def on_closing():
  print("exit")
  os._exit(1)

fenetre.protocol("WM_DELETE_WINDOW", on_closing)

imgOk= PhotoImage(file="ok.png")
imgCroix= PhotoImage(file="croix.png")
imgUnknown= PhotoImage(file="unknown.png")
imgLoading= PhotoImage(file="loading.png")

def hFunc():
  global heure
  if heure==11:
    heure=12
  else:
    heure=11
  textH.set("semaine n°" + str(week) + " " + days[day] + " à " + str(heure) + "h")
textH = StringVar()
labelH = Button(fenetre, textvariable=textH, command=hFunc, font=("Arial", 15))
labelH.pack()


text = StringVar()
text.set("0")
label = Label(fenetre, textvariable=text, font=("Arial", 50))
label.pack()

name = StringVar()
name.set("None")
labelName = Label(fenetre, textvariable=name, font=("Arial", 15))
labelName.pack()

info = StringVar()
info.set("")
labelInfo = Label(fenetre, textvariable=info, font=("Arial", 15))
labelInfo.pack()


canvas= Canvas(fenetre, width=256, height=256)
canvas.pack()
image_container =canvas.create_image(0,0, anchor="nw",image=imgUnknown)

buttonInscrire = Button(fenetre, text='Inscrire', command=add, font=("Arial", 15))

passage = StringVar()
labelPassage = Label(fenetre, textvariable=passage, font=("Arial", 20))
labelPassage.pack()

passage11 = StringVar()
labelPassage11 = Label(fenetre, textvariable=passage11, font=("Arial", 20))
labelPassage11.pack()

passage12 = StringVar()
labelPassage12 = Label(fenetre, textvariable=passage12, font=("Arial", 20))
labelPassage12.pack()


menubar = Menu(fenetre)
filemenu = Menu(menubar, tearoff=0)
filemenu.add_command(label="Export list", command=export)
menubar.add_cascade(label="File", menu=filemenu)

fenetre.config(menu=menubar)

APP = App(fenetre,text,name)

refreshTime()
refreshPassages()
fenetre.mainloop()
