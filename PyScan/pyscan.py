from concurrent.futures import thread
from playsound import playsound
from pynput.keyboard import Key, Listener, Controller
import threading
import os
from tkinter import *
from tkinter import messagebox
from tkinter import ttk
from tkinter import filedialog
from tkinter.messagebox import askyesno
from datetime import datetime,timedelta
import socketio
import time
from math import *
from zipfile import ZipFile
import requests
import traceback
from PIL import Image, ImageTk
import vlc
import csv

import mediaplayer

def dispatch(app_name:str):
    try:
      try:
          from win32com import client
          app = client.gencache.EnsureDispatch(app_name)
      except AttributeError:
          # Corner case dependencies.
          import os
          import re
          import sys
          import shutil
          # Remove cache and try again.
          MODULE_LIST = [m.__name__ for m in sys.modules.values()]
          for module in MODULE_LIST:
              if re.match(r'win32com\.gen_py\..+', module):
                  del sys.modules[module]
          shutil.rmtree(os.path.join(os.environ.get('LOCALAPPDATA'), 'Temp', 'gen_py'))
          from win32com import client
          app = client.gencache.EnsureDispatch(app_name)
      return app
    except AttributeError as err:
      print(err)

#vérification répertoire
if os.path.basename(os.getcwd()) != "PyScan" and os.path.basename(os.getcwd()) != "pyscan":
  print(">>> erreur de répertoitre")
  print(">>> \"" + os.path.basename(os.getcwd()) +"\" n'est pas \"PyScan\"")
  time.sleep(3)
  os._exit(1)



#système de récupération de save.txt
token = ''
version = ''
son_bool_save = ''
mode_var_save = ''
lieu_var_save = ''
if os.path.exists("save.txt"):
  file = open("save.txt")
  token = file.readline().replace("\n","")
  version = file.readline().replace("\n","")
  son_bool_save = file.readline().replace("\n","")
  mode_var_save = file.readline().replace("\n","")
  lieu_var_save = file.readline().replace("\n","")
  file.close()
else:
  file = open("save.txt", 'w')
  file.close()



#système socket io
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

@sio.on('*',namespace="/music")
def catch_music(event, data):
  try:
    global media
    mediaplayer.set_sio(sio)
    cacher = data.get("cacher")
    if event=="download":
      mediaplayer.openMediaPlayer(fenetre,data.get("url"),data.get("type"),cacher)
    elif event=="play":
      mediaplayer.play()
    elif event=="pause":
      mediaplayer.pause()
    elif event=="stop":
      mediaplayer.stop()
    elif event=="volume":
      mediaplayer.volume(data["volume"])
    elif event=="progress":
      mediaplayer.progress(data["progress"])
    elif event=="close":
      mediaplayer.close_media()
    elif event=="pause itunes":
      def stop_itunes():
        iTunes = dispatch("iTunes.Application")
        iTunes.Pause()

      threading.Thread(target=stop_itunes).start()
    elif event=="play itunes":
      def play_itunes():
        iTunes = dispatch("iTunes.Application")
        iTunes.Play()

      threading.Thread(target=play_itunes).start()
    if cacher!=None:
      mediaplayer.cacher(cacher)    
      media.stop()
  except Exception as err:
    print(err)


#fonction pour faire une req de donnée
def socketReq(event,data,admin):
  #print(">>> req: (" + str(event) + ") " + str(data))
  try:
    if admin:
      sio.emit(event,data,namespace='/admin')
    else:
      sio.emit(event,data)
    global msg
    x=None
    timeOut = 50
    while x==None:
      time.sleep(0.1)
      for i in range(len(msg)):
        if i<len(msg) and event==msg[i][0]:
          x=msg[i]
          del msg[i]
      timeOut-=1
      if timeOut<=0:
        x=[event,socketReq(event,data,admin)]
    return x[1]
  except Exception:
    traceback.print_exc()
    return []

#initialisation du socket
sio.connect("http://localhost:3000/", auth={"token":token},namespaces=["/","/admin","/music"])
#sio.connect("https://foyerlycee.stemariebeaucamps.fr/", auth={"token":token},namespaces=["/","/admin","/music"])
print("\n\n\n")
id_data =socketReq('id_data', None,False)
if id_data!="err":
  print(">>> id_data: " + id_data['email'])
if id_data=="err" or id_data["admin"]<1:
  print(">>> Erreur: token non admin")
  print(">>> Il faut modifier le token sur la première ligne du fichier save.txt")
  time.sleep(3)
  os._exit(1)



#système mise à jour et sauvegarde des paramètre
def maj(version):
  print('>>> Nouvelle version trouvée')

  url = 'https://foyerlycee.stemariebeaucamps.fr/PyScan.zip?' + token

  print('>>> téléchargement...')
  r = requests.get(url, allow_redirects=True,verify=False)
  open('maj.zip', 'wb').write(r.content)
  print('>>> téléchargement terminé') 

  with ZipFile("maj.zip", 'r') as zip:
    print('\n>>> Nouvelle version(' + version + '):') 
    zip.printdir() 
    print('\n>>> extraction...')
    zip.extractall() 
    print('>>> extraction terminé')
    zip.close()
    os.remove("maj.zip")

def save_data():
  file = open("save.txt", 'w')
  file.write(token)
  file.write("\n")
  file.write(version)
  file.write("\n")
  file.write(son_bool_save)
  file.write("\n")
  file.write(mode_var_save)
  file.write("\n")
  file.write(lieu_var_save)
  file.close()

#vérifie si c'est la dernière version
version_serveur = socketReq("pyScanVersion", None, True)
if version_serveur!=version and version!="dev":
  version=version_serveur #changer numéro de version
  maj(version) #faire la mise à jour
  save_data() # enregistre les données de connection et de version
  print('>>> Lancer le programme:/nupdate.bat')
  time.sleep(3)
  os._exit(1) # arret le programme


#télécharger profile_picture
def downloadProfilesPictures():
  #url = 'https://foyerlycee.stemariebeaucamps.fr/profile_picture/all'
  url = "http://localhost:3000/profile_picture/all"
  r = requests.get(url, allow_redirects=True,verify=False)
  open('profile_picture.zip', 'wb').write(r.content)
  if not os.path.exists("./profile_picture"):
    os.mkdir("./profile_picture")
  print('>>> téléchargement terminé') 

  with ZipFile("profile_picture.zip", 'r') as zip:
    print('\n>>> Téléchargement images de profiles:') 
    zip.printdir()
    print('\n>>> extraction...')
    zip.extractall(path="./profile_picture")
    print('>>> extraction terminé')
    zip.close()
    os.remove("profile_picture.zip")

downloadProfilesPictures()


#calcule de la date
week = None
day = None
dayMidi = None
def setDate(today):
  global week
  global day
  global dayMidi

  firstSept = datetime(year=today.year,month=9,day=4)
  firstSept = firstSept - timedelta(days=firstSept.weekday())
  if datetime.now() + timedelta(days=7) < firstSept:
    firstSept = datetime(year=today.year-1,month=9,day=4)
    firstSept = firstSept - timedelta(days=firstSept.weekday())

  week = floor(((today - firstSept).days)/7)+1

  day = today.weekday()
  if day>4:
    day=4

  dayMidi = day
  if dayMidi>2:
    dayMidi-=1
  elif dayMidi == 2:
    dayMidi=5
setDate(datetime.today())





#fonction actualiser
listLocalisation= []
listFoyerDemande= []
foyerOuvert = 0
listDemande11 = []
listDemande12 = []
listUsers = []
def refresh(loop):
  global listLocalisation
  global listFoyerDemande
  global foyerOuvert
  global listDemande11
  global listDemande12
  global listUsers
  global week
  global dayMidi

  print(">>> Refresh")
  if loop:
    threading.Timer(90, refresh,args=(True,)).start()

  
  refreshTime()
  creneauPerm = timeSlot[1]
  if creneauPerm>4: #corrige le décalage d'une heure 
    creneauPerm=timeSlot[1]-1
  if timeSlot[1]!=-1:
    listLocalisation = socketReq('getAllLieuList',{"w":week,"j":day,"h":timeSlot[1]},False) #récupére la liste de présence des lieu(DOC,Tutorat,...)
    listFoyerDemande = socketReq('listDemandesPerm',{"w":week,"j":day,"h":creneauPerm},False) #récupére la liste des groupe de perm
    foyerOuvert = socketReq('getOuvertPerm',{"w":week,"j":day,"h":creneauPerm},False) #récupére le statue du créneau foyer en perm (ouvert, fermé ...)
  if foyerOuvert==None:
    foyerOuvert=0
  listDemande11 = socketReq('listDemandes', {"w":week,"j":dayMidi,"h":0},False) #récupére la liste des personnes inscrit et demandeur pour manger à 11h
  listDemande12 = socketReq('listDemandes', {"w":week,"j":dayMidi,"h":1},False) #récupére la liste des personnes inscrit et demandeur pour manger à 12h
  listUsers = socketReq('getListUserComplete', None,True) #récupére la liste de tout les utilisateurs
  refreshPassages()


#fonction actualiser l'heure
modeSelectTimeSlot=0
timeSlot=("Perm",-1,-1)
def refreshTime():
  global timeSlot
  h=("Perm",0)
  now = datetime.now()
  h=("Perm",-1,-1)
  match parseTime(now.hour,now.minute):
    case num if (parseTime(7,50) <= num <  parseTime(8,34) and modeSelectTimeSlot==0) or modeSelectTimeSlot==1:
      h = ("Perm",0,-1)
    case num if (parseTime(8,34) <= num <  parseTime(9,33) and modeSelectTimeSlot==0) or modeSelectTimeSlot==2:
      h = ("Perm",1,-1)
    case num if (parseTime(10,1) <= num <  parseTime(10,45) and modeSelectTimeSlot==0) or modeSelectTimeSlot==3:
      h = ("Perm",2,-1)
    case num if (parseTime(10,45) <= num <  parseTime(11,54) and modeSelectTimeSlot==0) or modeSelectTimeSlot==4:
      if day==2:
        h = ("Perm",3,0)
      else:
        h = ("Midi",3,0)
    case num if (parseTime(11,54) <= num <  parseTime(13,4) and modeSelectTimeSlot==0) or modeSelectTimeSlot==5:
      if day==2:
        h = ("Perm",4,1)
      else:
        h = ("Midi",4,1)
    case num if (parseTime(13,4) <= num <  parseTime(13,58) and modeSelectTimeSlot==0) or modeSelectTimeSlot==6:
      h = ("Perm",5,-1)
    case num if (parseTime(13,58) <= num <  parseTime(14,57) and modeSelectTimeSlot==0) or modeSelectTimeSlot==7:
      h = ("Perm",6,-1)
    case num if (parseTime(15,25) <= num <  parseTime(16,9) and modeSelectTimeSlot==0) or modeSelectTimeSlot==8:
      h = ("Perm",7,-1)
    case num if (parseTime(16,9) <= num <  parseTime(17,18) and modeSelectTimeSlot==0) or modeSelectTimeSlot==9:
      h = ("Perm",8,-1)
  timeSlot=h
  if h[1]==-1:
    textH.set("Semaine n°" + str(week) + " " + days[day] + " Hors Créneau")
  else:
    textH.set("Semaine n°" + str(week) + " " + days[day] + " " + str(h[1]+8) + "h")


#refresh les labels avec les passages
def refreshPassages():
  global listLocalisation
  NBplacesDispo="0"
  lieu = lieu_var_save
  if lieu_var_save=="DOC":
    NBplacesDispo = str(15)
  elif lieu_var_save=="Tutorat":
    NBplacesDispo = str(10)
  elif lieu_var_save=="Aumônerie":
    NBplacesDispo = str(15)
  elif lieu_var_save=="All":
    lieu="Champagnat"

  NBplaces=0
  for e in listLocalisation:
    if e['lieu']==lieu:
      NBplaces+=1
  placePerm.set(lieu + ": " + str(NBplaces) + "/" + NBplacesDispo)
  
  
  global listDemande11
  global listDemande12

  NBinscrit11=0
  NBscan11=0
  for child in listDemande11:
    if child["DorI"]==1:
      NBinscrit11+=1
      if child["scan"]==1:
        NBscan11+=1
  NBinscrit12=0
  NBscan12=0
  for child in listDemande12:
    if child["DorI"]==1:
      NBinscrit12+=1
      if child["scan"]==1:
        NBscan12+=1
  passage11.set("Élèves inscrit à 11h : " + str(NBscan11) + " / " + str(NBinscrit11))
  passage12.set("Élèves inscrit à 12h : " + str(NBscan12) + " / " + str(NBinscrit12))

  passage.set("Élèves inscrits aujourd'hui : " + str(NBscan11+NBscan12) + " / " + str(NBinscrit11+NBinscrit12))




#fonction de scan
days = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"]
month = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]

number = ""
user="None"
def alert(titre,text):
  global fenetre
  if son_bool.get():
    t1 = threading.Thread(target=playsound, args=('alert.mp3',))
    t1.start()
    msgErr.set(titre + ":\n" + text)



def birthday ():
  global fenetre
  playMusic("patrick.mp3")




class MusicThreadObject(threading.Thread):
    def __init__(self, sleep_interval=1):
        super().__init__()
        self._kill = threading.Event()
        self._interval = sleep_interval

    def start(self,source):
        global media_instance
        global media

        # start playing video
        try:
          mediaplayer.close_media()
        except Exception as e:
          print(e)
        media.set_media(media_instance.media_new(source))
        media.play()

        buttonStopMusic.pack()


        is_killed = False
        while str(media.get_state())!="State.Stopped" and str(media.get_state())!="State.Ended":
          time.sleep(0.1)
          is_killed = self._kill.wait(self._interval)
          if is_killed:
            break


        if not is_killed:
          buttonStopMusic.pack_forget()
          itunes = dispatch("iTunes.Application")
          itunes.Play()

    def kill(self):
        self._kill.set()



media_instance = vlc.Instance(['--no-xlib'])
media = media_instance.media_player_new()
musicThread = MusicThreadObject()


def playMusic(source):
  global fenetre
  def play():
    global musicThread
    musicThread.kill()
    musicThread = MusicThreadObject()
    musicThread.start(source=source)

  threading.Thread(target=play).start()

  def itunes():
    iTunes = dispatch("iTunes.Application")
    iTunes.Pause()

  threading.Thread(target=itunes).start()



#laserScan
class setInterval :
    def __init__(self,interval,action) :
        self.interval=interval
        self.action=action
        self.stopEvent=threading.Event()
        thread=threading.Thread(target=self.__setInterval)
        thread.start()

    def __setInterval(self) :
        nextTime=time.time()+self.interval
        while not self.stopEvent.wait(nextTime-time.time()) :
            nextTime+=self.interval
            self.action()

    def cancel(self) :
        self.stopEvent.set()

laserScanNumber = ""
interval = None
def scanKey(key):
  if mode_var_save=="Appel":
    return
  global number
  global user
  global laserScanNumber
  global interval

  if interval!=None:
    interval.cancel()
  def action():
    global laserScanNumber
    laserScanNumber = ""
  
  try:
    if str(key) == "Key.backspace" :
      if(len(number) <= 1):
        number = ""
      else:
        number = number[:-1]
      text.set(number)
      buttonInscrire.pack_forget()
      buttonPass.pack_forget()
      buttonCookie.pack_forget()
      canvas.itemconfig(image_container,image=imgUnknown)
      name.set("")
      info.set("")
      msgErr.set("")
    elif str(key) == "Key.enter" :
      number = ""
      laserScanNumber = ""
    else:
      nb = int(str(key).replace("'","").replace("'","").replace("<","").replace(">",""))
      if(len(number) >= 5):
        number = ""
      if(nb >= 96):
        nb = nb - 96
      laserScanNumber = laserScanNumber + str(nb)
      number = number + str(nb)

      if len(laserScanNumber)==5:
        number = laserScanNumber
      text.set(number)

      if len(number)==5:
        print(">>> Search: " + number)
        try:
          controle()
        except Exception as err:
          print(err)
      else:
        buttonInscrire.pack_forget()
        buttonPass.pack_forget()
        buttonCookie.pack_forget()
        canvas.itemconfig(image_container,image=imgUnknown)
        name.set("")
        info.set("")
        msgErr.set("")
  except ValueError:
    pass

  interval=setInterval(0.2,action)

def parseTime(h,m):
  return h * 60 + m


def controle():
  global number
  global user
  global timeSlot
  
  canvas.itemconfig(image_container,image=imgLoading)
  global listUsers
  user="None"
  for userE in listUsers:
    if userE["code_barre"]==number:
      user = userE
  buttonInscrire.pack_forget()
  buttonPass.pack_forget()
  buttonCookie.pack_forget()
  if user != "None":
    boolErreur = False
    name.set(user["first_name"] + " " + user["last_name"])
    try:
      global img_profile
      img_profile = openImageProfile("profile_picture/"+user["uuid"]+".jpg")
      canvasProfile.itemconfig(image_container_profile,image=img_profile)
    except Exception as err:
      print(err)
    classe = user.get("classe")
    info.set("classe : " + str(classe))
    if timeSlot[0]=="Midi" and mode_var_save=="Foyer":
      #midi
      listCreneau = []
      if timeSlot[2] == 0:
        global listDemande11
        listCreneau = listDemande11
      else:
        global listDemande12
        listCreneau = listDemande12
      
      testInscrit = False
      for child in listCreneau:
        if child["DorI"]==1 and child['uuid']==user['uuid']:
          testInscrit = True

          canvas.itemconfig(image_container,image=imgLoading)
          socketReq('scan', [week,dayMidi,timeSlot[2],user['uuid'],True],True)
          child["scan"]=1
          refreshPassages()
          if child["sandwich"]==1:
            canvas.itemconfig(image_container,image=imgSandwich)
          else:
            canvas.itemconfig(image_container,image=imgOk)
      if not testInscrit:
        canvas.itemconfig(image_container,image=imgCroix)
        boolErreur = True
        alert("Non inscrit", user["first_name"] + " " + user["last_name"])
        buttonInscrire.pack()
    else:
      #perm
      global listFoyerDemande
      testAcceptPerm = False
      for e in listFoyerDemande:
        if e['DorI']==1 and (e['group2'] in user['groups'] or e['group2'] == user['classe']):
          testAcceptPerm=True
      
      global foyerOuvert
      if mode_var_save=="Foyer" and user["ban"]!=None:
        canvas.itemconfig(image_container,image=imgCroix)
        fin = datetime.strptime(user["ban"]["fin"], '%Y-%m-%dT%H:%M:%S.%f%z').strftime("%d/%m/%Y")
        alert("Banni", user["first_name"] + " " + user["last_name"] + "\n" + user["ban"]["justificatif"] + "\nPrend fin le " + fin)
        buttonPass.pack()
      elif mode_var_save=="Foyer" and timeSlot[1]!=-1 and (foyerOuvert==1 or foyerOuvert==4) and not testAcceptPerm:
        canvas.itemconfig(image_container,image=imgCroix)
        alert("Non inscrit", user["first_name"] + " " + user["last_name"])
        buttonPass.pack()
      elif timeSlot[1]!=-1:
        canvas.itemconfig(image_container,image=imgLoading)
        lieu="Foyer"
        if mode_var_save=="Perm":
          if lieu_var_save=="All":
            lieu = "Champagnat"
          else:
            lieu = lieu_var_save
        
        socketReq('setUserLieu',{"w":week,"j":day,"h":timeSlot[1],"lieu":lieu,"uuid":user['uuid'],"scan":1},True)
        global listLocalisation
        for i in range(len(listLocalisation)-1,-1,-1):
          if user['uuid'] == listLocalisation[i]['uuid']:
            del listLocalisation[i]
        listLocalisation.append({'uuid': user['uuid'], 'lieu': lieu, 'semaine': week, 'jour': day, 'creneau': timeSlot[1]})
        refreshPassages()
        canvas.itemconfig(image_container,image=imgDico.get(lieu))
      else:
        canvas.itemconfig(image_container,image=imgUnknown)
    if socketReq('getUserHasCookie', user['uuid'], True):
      buttonCookie.pack()
    if user["birthday"] == datetime.today().day and user["birthmonth"] == datetime.today().month:
      if not boolErreur:
        birthday()
        canvas.itemconfig(image_container,image=imgHappyBirth)
      socketReq("setAchievement",{"uuid":user["uuid"],"event":"anniversaire","value":0},True)
  else:
    canvas.itemconfig(image_container,image=imgUnknown)
    name.set("")
    info.set("")
    msgErr.set("")





#export
def export():
  f = open("Liste de passage du " + days[day] +" de la semaine n°" + str(week) + ".txt", "w")
  users = socketReq('getListUserComplete', None,True)
  dico={}
  for e in users:
    dico[e["uuid"]] = e["first_name"] + " " + e["last_name"]
  list11 = socketReq('listDemandes', {"w":week,"j":dayMidi,"h":0},False)
  inscrits11 = []
  passages11 = []
  for child in list11:
    if child["DorI"]==1:
      inscrits11.append(dico[child["uuid"]])
      if child["scan"]==1:
        passages11.append(dico[child["uuid"]])
  list12 = socketReq('listDemandes', {"w":week,"j":dayMidi,"h":1},False)
  inscrits12 = []
  passages12 = []
  for child in list12:
    if child["DorI"]==1:
      inscrits12.append(dico[child["uuid"]])
      if child["scan"]==1:
        passages12.append(dico[child["uuid"]])
  f.write("Liste de passage du " + days[day] +" de la semaine n°" + str(week) +"\n\n")



  f.write("\n-------Anniversaires------\n\n")
  for e in users:
    if e["birthday"] == datetime.today().day and e["birthmonth"] == datetime.today().month:
      f.write(e["first_name"] + " " + e["last_name"] + " " + e["code_barre"] + "\n")
  f.write("\n")




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
  print(">>> Create 'Liste de passage du " + days[day] +" de la semaine n°" + str(week) + ".txt'")




def reset_DB():
  answer = askyesno("Reset DB","Voulez vous réinitialiser la base de donnnée?")
  if answer:
    socketReq('resetDB',None,True)
    print("reset DB")

def import_csv():
  file_path = filedialog.askopenfilename(
    filetypes=[("CSV(Nom,Prénom,code,classe,email,birthday,birthmonth,Groupes...)", "*.csv")]
  )
  if file_path:
    canvas.itemconfig(image_container,image=imgLoading)
    def lecture():
      (list_all_groups,list_all_classes) = socketReq('getGroupAndClasse',None,True)
      list_all_groups = [list_all_groups[i]["group2"] for i in range(len(list_all_groups))]
      time.sleep(4)
      with open(file_path) as file:
          reader = csv.reader(file)
          for row in reader:
              if "@stemariebeaucamps.fr" in row[4]:
                print(row)
                liste = []
                for i in range(7,len(row)):
                  if row[i]!='':
                    liste.append(row[i])
                name.set(row[0]+" "+row[1])
                list_all_groups = list(set(list_all_groups+liste))
                socketReq('setUser',{
                  "first_name":row[0],
                  "last_name":row[1],
                  "code_barre":row[2],
                  "classe":row[3],
                  "email":row[4],
                  "birthday":row[5],
                  "birthmonth":row[6],
                  "listGroups":liste,
                  "verify":True,
                  "mode_addCSV":1
                },True)
      socketReq('setGroupAndClasse',{"groups":list_all_groups,"classes":list_all_classes},True)
      canvas.itemconfig(image_container,image=imgOk)
      name.set("Terminé")
    threading.Thread(target=lecture).start()

#gestion des éléments graphiques(fenetre,label,bouton,image)
class App(threading.Thread):
    def __init__(self, tk_root, label,name):
        super(App, self).__init__()
        self.fenetre = tk_root
        self.label = label
        self.name = name

        self.start()

    def run(self):
        with Listener(on_press=lambda event: scanKey(event)) as listener:
            listener.join()


def openImage(path):
  width = 256
  height = 256
  img = Image.open(path)
  img = img.resize((width,height))
  photoImg =  ImageTk.PhotoImage(img)
  return photoImg

#init fenetre
fenetre = Tk()
fenetre.resizable(False, False)
fenetre.geometry("450x750+0+0")
fenetre.title("PyScan")
imgLogo = openImage('image/logo.png')
fenetre.iconphoto(True, imgLogo)
def on_closing():
  print(">>> Exit")
  os._exit(1)

fenetre.protocol("WM_DELETE_WINDOW", on_closing)




imgOk = openImage("image/ok.png")
imgCroix = openImage("image/croix.png")
imgUnknown = openImage("image/unknown.png")
imgLoading = openImage("image/loading.png")
imgSandwich = openImage("image/sandwich.png")
imgCookie = openImage("image/cookie.png")
imgHappyBirth = openImage("image/birthday.png")
imgDico = {
  "Audio":openImage("image/lieu/audio.png"),
  "Aumônerie":openImage("image/lieu/aumonerie.png"),
  "Bien-être":openImage("image/lieu/bien_etre.png"),
  "CDI":openImage("image/lieu/CDI.png"),
  "Champagnat":openImage("image/lieu/champagnat.png"),
  "City stade":openImage("image/lieu/city_stade.png"),
  "DOC":openImage("image/lieu/doc.png"),
  "Tutorat":openImage("image/lieu/tutorat.png"),
  "Foyer":openImage("image/logo.png")
}

textH = StringVar()
labelH = Label(fenetre, textvariable=textH, font=("Arial", 15))
labelH.pack()

listCreneau=["Créneau Automatique","8h","9h","10h","11h","12h","13h","14h","15h","16h","Hors Créneau"]
creneauCombo = ttk.Combobox(fenetre, values=listCreneau, state="readonly")
def actionComboboxSelectedCreneau(event):
  global modeSelectTimeSlot
  modeSelectTimeSlot=listCreneau.index(creneauCombo.get())
  refresh(False)
creneauCombo.bind("<<ComboboxSelected>>", actionComboboxSelectedCreneau)
creneauCombo.current(0)
creneauCombo.pack()


text = StringVar()
text.set("")
label = Label(fenetre, textvariable=text, font=("Arial", 50))
label.pack()

name = StringVar()
name.set("")
labelName = Label(fenetre, textvariable=name, font=("Arial", 15))
labelName.pack()

info = StringVar()
info.set("")
labelInfo = Label(fenetre, textvariable=info, font=("Arial", 15))
labelInfo.pack()


canvas= Canvas(fenetre, width=256, height=256)
canvas.pack()
image_container = canvas.create_image(0,0, anchor="nw",image=imgUnknown)

def openImageProfile(path):
  width = 96
  height = 96
  img = Image.open(path)
  img = img.resize((width,height))
  photoImg =  ImageTk.PhotoImage(img)
  return photoImg
canvasProfile= Canvas(fenetre, width=96, height=96)
canvasProfile.pack()
canvasProfile.place(x=350, y=270, width=96, height=96)
img_profile = openImageProfile("image/unknown.png")
image_container_profile = canvasProfile.create_image(0,0, anchor="nw",image=img_profile)


def func_inscrire():
  global listUsers
  global user
  global timeSlot
  canvas.itemconfig(image_container,image=imgLoading)
  buttonInscrire.pack_forget()

  if timeSlot[0]=="Midi":
    socketReq('setDorI', [week,dayMidi,timeSlot[2],user['uuid'],True],True)
    socketReq('scan', [week,dayMidi,timeSlot[2],user['uuid'],True],True)
    refresh(False)
    canvas.itemconfig(image_container,image=imgOk)
  else:
    canvas.itemconfig(image_container,image=imgCroix)


buttonInscrire = Button(fenetre, text='Inscrire', command=func_inscrire, font=("Arial", 15))


def func_pass():
  global user
  global week
  global day
  global timeSlot

  canvas.itemconfig(image_container,image=imgLoading)
  buttonPass.pack_forget()

  if timeSlot[1]!=-1:
    canvas.itemconfig(image_container,image=imgLoading)
    lieu="Foyer"
    if mode_var_save=="Perm":
      if lieu_var_save=="All":
        lieu = "Champagnat"
      else:
        lieu = lieu_var_save
    socketReq('setUserLieu',{"w":week,"j":day,"h":timeSlot[1],"lieu":lieu,"uuid":user['uuid'],"scan":1},True)
    refreshPassages()
    canvas.itemconfig(image_container,image=imgDico.get(lieu))
  else:
    canvas.itemconfig(image_container,image=imgUnknown)


buttonPass = Button(fenetre, text='Laisser passer', command=func_pass, font=("Arial", 15))


def cookie():
  canvas.itemconfig(image_container,image=imgLoading)
  buttonCookie.pack_forget()
  if socketReq('useCookie', user['uuid'],True):
    canvas.itemconfig(image_container,image=imgCookie)
  else:
    canvas.itemconfig(image_container,image=imgCroix)

buttonCookie = Button(fenetre, text='Utiliser cookie', command=cookie, font=("Arial", 15))


placePerm = StringVar()
labelPlacePerm = Label(fenetre, textvariable=placePerm, font=("Arial", 20))

passage = StringVar()
labelPassage = Label(fenetre, textvariable=passage, font=("Arial", 20))

passage11 = StringVar()
labelPassage11 = Label(fenetre, textvariable=passage11, font=("Arial", 20))

passage12 = StringVar()
labelPassage12 = Label(fenetre, textvariable=passage12, font=("Arial", 20))

msgErr = StringVar()
msgErr.set("")
labelmsgErr = Label(fenetre, textvariable=msgErr, font=("Arial", 10))
labelmsgErr.pack()

topmost_bool = BooleanVar()

son_bool = BooleanVar()
if son_bool_save=="False":
  son_bool.set(False)
else:
  son_bool.set(True)

mode_var = StringVar()
mode_var.set(mode_var_save)

listLieux=["Champagnat","CDI","DOC","Aumônerie","Tutorat","City stade","Bien-être","Audio","Foyer","All"]
listeCombo = ttk.Combobox(fenetre, values=listLieux, state="readonly")
if lieu_var_save in listLieux:
  listeCombo.current(listLieux.index(lieu_var_save))
else:
  listeCombo.current(0)
  lieu_var_save = listeCombo.get()


def appel():
  global timeSlot
  canvas.itemconfig(image_container,image=imgLoading)
  buttonAppel.pack_forget()

  name.set("")
  info.set("")
  msgErr.set("")
  if timeSlot[1]!=-1:
    text.set("...")

    def lireCode():
      time.sleep(3)
      liste_d_appel = socketReq('getAllLieuList',{"w":week,"j":day,"h":timeSlot[1]},False)
      keyboard = Controller()
      for user in listUsers:
        for enregistrement in liste_d_appel:
          if user["uuid"]==enregistrement["uuid"]:
            if user["code_barre"] != None and (enregistrement["lieu"]==lieu_var_save or "All"==lieu_var_save):
              def lireCode2(user):
                text.set(user["code_barre"])
                name.set(user["first_name"] + " " + user["last_name"])
                info.set("classe : " + user["classe"])
                print(">>>",user["code_barre"],user["last_name"],user["first_name"],)
                for l in user["code_barre"]:
                  keyboard.press(Key.shift)
                  keyboard.release(Key.shift)
                  keyboard.press(l)
                  keyboard.release(l)
                keyboard.press(Key.enter)
                keyboard.release(Key.enter)
              threading.Thread(target=lireCode2,args=(user,)).start()
              time.sleep(0.1)
      canvas.itemconfig(image_container,image=imgOk)
      text.set("Terminée")
      name.set("")
      info.set("")
      msgErr.set("")
      buttonAppel.pack()
    threading.Thread(target=lireCode).start()
  else:
    canvas.itemconfig(image_container,image=imgCroix)
    buttonAppel.pack()
    text.set("Hors Créneau")


buttonAppel = Button(fenetre, text="Faire l'appel", command=appel, font=("Arial", 15))

def stopMusic():
    media.stop()
    buttonStopMusic.pack_forget()

buttonStopMusic = Button(fenetre, text="Stop Musique", command=stopMusic, font=("Arial", 15))

def refreshOptions():
  refreshPassages()
  canvas.itemconfig(image_container,image=imgUnknown)
  buttonInscrire.pack_forget()
  buttonPass.pack_forget()
  buttonCookie.pack_forget()
  global son_bool_save
  global mode_var_save
  global lieu_var_save
  if mode_var.get()=="0" or mode_var.get()=="":
    mode_var.set("Foyer")
  fenetre.attributes("-topmost", topmost_bool.get())
  son_bool_save = str(son_bool.get())
  mode_var_save = str(mode_var.get())
  if mode_var.get()=="Foyer":
    labelPassage.pack()
    labelPassage11.pack()
    labelPassage12.pack()
  else:
    labelPassage.pack_forget()
    labelPassage11.pack_forget()
    labelPassage12.pack_forget()

  if mode_var.get()=="Perm" or mode_var.get()=="Appel":
    listeCombo.pack()
    labelPlacePerm.pack()
  else:
    listeCombo.pack_forget()
    labelPlacePerm.pack_forget()
  
  if mode_var.get()=="Appel":
    buttonAppel.pack()
  else:
    buttonAppel.pack_forget()
  save_data()
refreshOptions()


def windowDate():
  newWindow = Toplevel(fenetre)
  newWindow.title("Date")
  newWindow.geometry("200x200")
  textArea = Text(newWindow, height=4, width=50)
  textArea.pack()
  
  def confirme():
    dateTab = textArea.get(1.0, "end-1c").split('/')
    setDate(datetime(year=int(dateTab[2]), month=int(dateTab[1]), day=int(dateTab[0])))
    canvas.itemconfig(image_container,image=imgLoading)
    newWindow.destroy()
    refresh(False)
    canvas.itemconfig(image_container,image=imgUnknown)
  btn = Button(newWindow, text='Confirmer', command=confirme, font=("Arial", 15))
  btn.pack()
  
menubar = Menu(fenetre)

filemenu = Menu(menubar, tearoff=0)
filemenu.add_command(label="Export list", command=export)
filemenu.add_command(label="Import csv", command=import_csv)
filemenu.add_command(label="Réinitialiser", command=reset_DB)
filemenu.add_command(label="Date", command=windowDate)
filemenu.add_command(label="Refresh", command=lambda: refresh(False))
menubar.add_cascade(label="File", menu=filemenu)

modemenu = Menu(menubar, tearoff=0)
modemenu.add_checkbutton(label="Foyer", onvalue="Foyer", variable=mode_var, command=refreshOptions)
modemenu.add_checkbutton(label="Perm Scan", onvalue="Perm", variable=mode_var, command=refreshOptions)
modemenu.add_checkbutton(label="Appel", onvalue="Appel", variable=mode_var, command=refreshOptions)
menubar.add_cascade(label="Mode", menu=modemenu)

options = Menu(menubar, tearoff=0)
options.add_checkbutton(label="Son", onvalue=1, offvalue=0, variable=son_bool, command=refreshOptions)
options.add_checkbutton(label="Topmost", onvalue=1, offvalue=0, variable=topmost_bool, command=refreshOptions)
menubar.add_cascade(label="Options", menu=options)

def actionComboboxSelected(event):
  global lieu_var_save
  lieu_var_save = listeCombo.get()
  refreshOptions()
listeCombo.bind("<<ComboboxSelected>>", actionComboboxSelected)

fenetre.config(menu=menubar)

APP = App(fenetre,text,name)

refresh(True)
fenetre.mainloop()

print(id_data)