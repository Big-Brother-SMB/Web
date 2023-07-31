token='Upgqz3Sk0IKzB9iO'

#pip install "python-socketio[client]"
#pip install pynput
#pip install playsound 
from concurrent.futures import thread
from playsound import playsound
from pynput.keyboard import Key, Listener
import threading,os
from tkinter import *
from tkinter import messagebox
from datetime import date,datetime
import socketio
import time

msg=[]
sio = socketio.Client(engineio_logger=False, logger=False, ssl_verify=False)

@sio.on('*')
def catch_all(event, data):
    global msg
    msg.append((event,data))

@sio.on('*',namespace="/admin")
def catch_all_admin(event, data):
    global msg
    msg.append((event,data))

def socketReq(event,data,admin):
    try:
      if admin:
        sio.emit(event,data,namespace='/admin')
      else:
        sio.emit(event,data)
      global msg
      x=None
      while x==None:
        time.sleep(0.1)
        for i in range(len(msg)):
          if event==msg[i][0]:
            x=msg[i][1]
            del msg[i]
      return x
    except ValueError:
      return []

sio.connect("https://foyerlycee.stemariebeaucamps.fr/", auth={"token":token},namespaces=["/","/admin"])
print("start")
id_data =socketReq('id_data', None,False)
print("\n\n\n\n\n\n\n\n\n\n")
print(id_data)
if id_data=="err" or id_data["admin"]!=1:
  print("\n\n\n\n\n\n\n\n\n\n")
  print("Erreur: token non admin")
  print("Il faut modifier le token sur la première ligne du fichier pyscan.py")
  print("\n\n\n")
  raise Exception("Erreur: token non admin")






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
    case num if parseTime(10,55) <= num <  parseTime(11,52):
      heure = 11
      textH.set("semaine n°" + str(week) + " " + days[day] + " à " + str(heure) + "h")
    case num if parseTime(11,52) <= num <  parseTime(13,7):
      heure = 12
      textH.set("semaine n°" + str(week) + " " + days[day] + " à " + str(heure) + "h")
    case _:
      heure = "perm"
      textH.set("semaine n°" + str(week) + " " + days[day] + " (Permanence)")

  threading.Timer(60, refreshTime).start()

def refreshPassages():
  listCreneau11 = socketReq('listDemandes', {"w":week,"j":day,"h":0},False)
  NBinscrit11=0
  NBscan11=0
  for child in listCreneau11:
    if child["DorI"]==1:
      NBinscrit11+=1
      if child["scan"]==1:
        NBscan11+=1
  listCreneau12 = socketReq('listDemandes', {"w":week,"j":day,"h":1},False)
  NBinscrit12=0
  NBscan12=0
  for child in listCreneau12:
    if child["DorI"]==1:
      NBinscrit12+=1
      if child["scan"]==1:
        NBscan12+=1
  passage11.set("Élèves inscrit à 11h : " + str(NBscan11) + " / " + str(NBinscrit11))
  passage12.set("Élèves inscrit à 12h : " + str(NBscan12) + " / " + str(NBinscrit12))

  passage.set("Élèves inscrits aujourd'hui : " + str(NBscan11+NBscan12) + " / " + str(NBinscrit11+NBinscrit12))


days = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]
month = ["janvier","fevrier","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]

number = ""
user="None"
44444
def alert(titre,text):
  global fenetre
  fenetre.focus_force()
  if son_bool.get():
    t1 = threading.Thread(target=playsound, args=('alert.mp3',))
    t1.start()
  t2 = threading.Thread(target=messagebox.showerror, args=(titre,text))
  t2.start()


def show(key):
  global number
  global user
  user="None"
  print(key)
  try:
    if str(key) == "Key.backspace" :
      if(len(number) <= 1):
        number = ""
      else:
        number = number[:-1]
      text.set(number)
    else:
      nb = int(str(key).replace("'","").replace("'","").replace("<","").replace(">",""))
      if(len(number) >= 5):
        number = ""
      if(nb >= 96):
        nb = nb - 96
      number = number + str(nb)
      text.set(number)

      if len(number)==5:
        canvas.itemconfig(image_container,image=imgLoading)
        data = socketReq('getListPass', None,True)
        for userE in data:
          if userE["code_barre"]==number:
            user = userE
        buttonInscrire.pack_forget()
        buttonCookie.pack_forget()
        if user != "None":
          print(user)
          name.set(user["first_name"] + " " + user["last_name"])
          classe = user["classe"]
          info.set("classe : " + classe)
          if heure!="perm":
            #midi
            listCreneau = socketReq('listDemandes', {"w":week,"j":day,"h":heure-11},False)
            test = False
            for child in listCreneau:
              if child["DorI"]==1 and child['uuid']==user['uuid']:
                test = True
            if(test):
              canvas.itemconfig(image_container,image=imgOk)
              socketReq('scan', [week,day,heure-11,user['uuid'],True],True)
              refreshPassages()
            else:
              canvas.itemconfig(image_container,image=imgCroix)
              alert("Non inscrit", user["first_name"] + " " + user["last_name"])
              buttonInscrire.pack()
          else:
            #perm
            if user["ban"]!=None:
              canvas.itemconfig(image_container,image=imgCroix)
              fin = datetime.strptime(user["ban"]["fin"], '%Y-%m-%dT%H:%M:%S.%f%z').strftime("%d/%m/%Y")
              alert("Banni", user["first_name"] + " " + user["last_name"] + "\n" + user["ban"]["justificatif"] + "\nPrend fin le " + fin)
            else:
              canvas.itemconfig(image_container,image=imgOk)
          if socketReq('getUserHasCookie', user['uuid'],True):
            buttonCookie.pack()
        else:
          canvas.itemconfig(image_container,image=imgUnknown)
          name.set("")
          info.set("")
      else:
        canvas.itemconfig(image_container,image=imgUnknown)
        name.set("")
        info.set("")
  except ValueError:
    pass

def add():
  canvas.itemconfig(image_container,image=imgLoading)
  buttonInscrire.pack_forget()
  if heure!="perm":
    socketReq('setDorI', [week,day,heure-11,user['uuid'],True],True)
    socketReq('scan', [week,day,heure-11,user['uuid'],True],True)
    canvas.itemconfig(image_container,image=imgOk)
    refreshPassages()

def cookie():
  canvas.itemconfig(image_container,image=imgLoading)
  buttonCookie.pack_forget()
  if socketReq('useCookie', user['uuid'],True):
    canvas.itemconfig(image_container,image=imgCookie)
  else:
    canvas.itemconfig(image_container,image=imgCroix)
  refreshPassages()

def export():
  f = open("Liste de passage du " + days[day] +" de la semaine n°" + str(week) + ".txt", "w")
  users = socketReq('getListPass', None,True)
  dico={}
  for e in users:
    dico[e["uuid"]] = e["first_name"] + " " + e["last_name"]
  list11 = socketReq('listDemandes', {"w":week,"j":day,"h":0},False)
  inscrits11 = []
  passages11 = []
  for child in list11:
    if child["DorI"]==1:
      inscrits11.append(dico[child["uuid"]])
      if child["scan"]==1:
        passages11.append(dico[child["uuid"]])
  list12 = socketReq('listDemandes', {"w":week,"j":day,"h":1},False)
  inscrits12 = []
  passages12 = []
  for child in list12:
    if child["DorI"]==1:
      inscrits12.append(dico[child["uuid"]])
      if child["scan"]==1:
        passages12.append(dico[child["uuid"]])
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
    f.write(user + "\n")
    if(inscrits11.index(user) != -1):
      inscrits11.remove(user)

  f.write("\n----------Pas passes----------\n\n")
  for user in inscrits11:
    f.write(user + "\n")




  f.write("\n-----------12h------------\n\n")
  f.write("inscrits : " + str(len(inscrits12)) + "\n")
  pourcent = ""
  if(len(inscrits12) != 0):
    pourcent = " (" + str(int(len(passages12) / len(inscrits12) * 100)) + "%)"
  f.write("passes : " + str(len(passages12)) + pourcent + "\n")

  f.write("\n----------Passes----------\n\n")
  for user in passages12:
    f.write(user + "\n")
    if(inscrits12.index(user) != -1):
      inscrits12.remove(user)

  f.write("\n----------Pas passes----------\n\n")
  for user in inscrits12:
    f.write(user + "\n")
  
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
fenetre.iconphoto(True, PhotoImage(file='logo.png'))
def on_closing():
  print("exit")
  os._exit(1)

fenetre.protocol("WM_DELETE_WINDOW", on_closing)

imgOk= PhotoImage(file="ok.png")
imgCroix= PhotoImage(file="croix.png")
imgUnknown= PhotoImage(file="unknown.png")
imgLoading= PhotoImage(file="loading.png")
imgCookie= PhotoImage(file="cookie.png")

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

buttonCookie = Button(fenetre, text='Utiliser cookie', command=cookie, font=("Arial", 15))

passage = StringVar()
labelPassage = Label(fenetre, textvariable=passage, font=("Arial", 20))
labelPassage.pack()

passage11 = StringVar()
labelPassage11 = Label(fenetre, textvariable=passage11, font=("Arial", 20))
labelPassage11.pack()

passage12 = StringVar()
labelPassage12 = Label(fenetre, textvariable=passage12, font=("Arial", 20))
labelPassage12.pack()

son_bool = BooleanVar()
son_bool.set(True)

menubar = Menu(fenetre)
filemenu = Menu(menubar, tearoff=0)
filemenu.add_command(label="Export list", command=export)
filemenu.add_checkbutton(label="Son", onvalue=1, offvalue=0, variable=son_bool)
menubar.add_cascade(label="File", menu=filemenu)

fenetre.config(menu=menubar)

APP = App(fenetre,text,name)

refreshTime()
refreshPassages()
fenetre.mainloop()
