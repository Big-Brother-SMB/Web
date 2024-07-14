# Pyxel Studio

#Tresure Miners est un jeu de Survie où le but est de trouver le plus de trésors
#utilise zqsd pour te déplacer et a ou e pour taper avec ta pioche et caser les blocs
#les blocs peuvent contenir des trésors ! Mais faits attention aux chauves-souris !

import random
import pyxel
pyxel.init(128, 128, title="Golden Miners")
pyxel.load("res.pyxres")
verif_touche=0
x = 60
y = 60
vies = 3
block_liste=[]
tirs_liste_1 = []
tirs_liste_2=[]
ennemis_liste_1=[]
ennemis_liste_2=[]
coffres_liste=[]
apparition=0
temps=0
temps_1=0
score=0

def temp_1(temps_1):
    if pyxel.btn(pyxel.KEY_E):   
        temps_1=0

def deplacement(x, y):
    if pyxel.btn(pyxel.KEY_D):
        if (x < 120) :
            x = x + 2
            verif_touche=30
    if pyxel.btn(pyxel.KEY_Q):
        if (x > 0) :
            x = x - 2
    if pyxel.btn(pyxel.KEY_S):
        if (y < 120) :
            y = y + 2
    if pyxel.btn(pyxel.KEY_Z):
        if (y > 0) :
            y = y - 2
    return x,y

def ennemis_creation_1(ennemis_liste_1):
    if (pyxel.frame_count % 45 == 0):
        ennemis_liste_1.append([0,random.randint(0,120)])
    return ennemis_liste_1

def ennemis_creation_2(ennemis_liste_2):
    if (pyxel.frame_count % 45 == 0):
        ennemis_liste_2.append([120,random.randint(0,120)])
    return ennemis_liste_2

def ennemis_deplacement_1(ennemis_liste_1):
    for ennemi_1 in ennemis_liste_1:
        ennemi_1[0] += 1
        if  ennemi_1[0]>128:
            ennemis_liste_1.remove(ennemi_1)
    return ennemis_liste_1

def ennemis_deplacement_2(ennemis_liste_2):
    for ennemi_2 in ennemis_liste_2:
        ennemi_2[0] -= 1
    return ennemis_liste_2

    
def block_creation(block_liste):
    if (pyxel.frame_count % 60 == 0):
        block_liste.append([random.randint(1, 119), random.randint(1,119)])
    return block_liste

def mort_1(vies):
    for ennemi_1 in ennemis_liste_1:
        if ennemi_1[0] <= x+8 and ennemi_1[1] <= y+8 and ennemi_1[0]+8 >= x and ennemi_1[1]+8 >= y:
            ennemis_liste_1.remove(ennemi_1)
            vies = vies-1
    return vies

def mort_2(vies):
    for ennemi_2 in ennemis_liste_2:
        if ennemi_2[0] <= x+8 and ennemi_2[1] <= y+8 and ennemi_2[0]+8 >= x and ennemi_2[1]+8 >= y:
            ennemis_liste_2.remove(ennemi_2)
            vies = vies-1
    return vies

def ennemis_suppression_1():
    for ennemi_1 in ennemis_liste_1:
        for tir in tirs_liste_1 or tirs_liste_2:
            if ennemi_1[0] <= tir[0]+1 and ennemi_1[0]+8 >= tir[0] and ennemi_1[1]+8 >= tir[1]:
                ennemis_liste_1.remove(ennemi_1)
                
def ennemis_suppression_2():
    for ennemi_2 in ennemis_liste_2:
        for tir in tirs_liste_1 or tirs_liste_2:
            if ennemi_2[0] <= tir[0]+1 and ennemi_2[0]+8 >= tir[0] and ennemi_2[1]+8 >= tir[1]:
                ennemis_liste_2.remove(ennemi_2)

def block_suppression():
    for entite in block_liste:
        for tir in tirs_liste_1 or tirs_liste_2:
            if entite[0] <= tir[0]+1 and entite[0]+8 >= tir[0] and entite[1]+8 >= tir[1]:
                block_liste.remove(entite)
                apparition=random.randint(0,5)
                if apparition==1:
                    coffres_liste.append([entite[0],entite[1]])

def tirs_creation_1(x, y, tirs_liste):
    if pyxel.btnr(pyxel.KEY_E):
        global temps_1
        temps_1=0
        apparition=1
        tirs_liste_1.append([x+4, y-4])
    return tirs_liste_1

def tirs_1(tirs_liste_1):
    for tir in tirs_liste_1:
        if  temps_1>=0.3:
            tirs_liste_1.remove(tir)
    return tirs_liste_1

def tirs_2(tirs_liste_2):
    for tir in tirs_liste_2:
        if  temps_1>=0.3:
            tirs_liste_2.remove(tir)
    return tirs_liste_2

def tirs_creation_2(x, y, tirs_liste_2):
    if pyxel.btnr(pyxel.KEY_A):
        global temps_1
        temps_1=0
        tirs_liste_2.append([x+4, y-4])
    return tirs_liste_2

def coffres_suppression():
    global score
    for coffres in coffres_liste:
            if coffres[0] <= x+8 and coffres[1] <= y+8 and coffres[0]+8 >= x and coffres[1]+8 >= y:
                score=score+50
                coffres_liste.remove(coffres)

def update():
    global x,y,verif_touche,block_liste,block_supression,vies,tirs_liste_1,tirs_liste_2
    global temps,temps_1,ennemis_liste_1,ennemis_liste_2,coffres_liste,coffres,score
    if verif_touche==0:
        x,y = deplacement(x,y)
    elif verif_touche>0:
        verif_touche=30-1
    block_suppression()
    ennemis_liste_1 = ennemis_creation_1(ennemis_liste_1)
    ennemis_liste_1 = ennemis_deplacement_1(ennemis_liste_1)
    ennemis_liste_2 = ennemis_creation_2(ennemis_liste_2)
    ennemis_liste_2 = ennemis_deplacement_2(ennemis_liste_2)
    ennemis_suppression_1()
    ennemis_suppression_2()
    coffres_suppression()
    vies=mort_1(vies)
    vies=mort_2(vies)
    block_liste = block_creation(block_liste)
    tirs_liste_1 = tirs_creation_1(x+14,y+8, tirs_liste_1)
    tirs_liste_2 = tirs_creation_2(x-12,y+8, tirs_liste_2)
    tirs_liste_1 = tirs_1(tirs_liste_1)
    tirs_liste_2 = tirs_2(tirs_liste_2)
    score=score
    temps=(temps+1)//30
    round(temps)
    temps_1=temps_1+1/30
    
def draw():
    pyxel.cls(0)
    if vies>0:
        pyxel.bltm(0, 0, 0, 0, 0, 128, 128)
        pyxel.blt(x,y,0,0,0,15,15,0)
        for entite in block_liste:
            pyxel.blt(entite[0], entite[1],0,0,32,15,15)
        pyxel.text(2,2,'vies: '+str(vies),6)
        pyxel.text(85,2,'score: '+str(score),6)
        for ennemi_1 in ennemis_liste_1:
            pyxel.blt(ennemi_1[0], ennemi_1[1], 0, 32, 48, 15, 15, 0)
        for ennemi_2 in ennemis_liste_2:
            pyxel.blt(ennemi_2[0], ennemi_2[1], 0, 16, 48, 15, 15, 0)
        for tir in tirs_liste_1:
            pyxel.blt(tir[0], tir[1], 0, 16, 0, 15, 15, 0)
        for tir in tirs_liste_2:
            pyxel.blt(tir[0], tir[1], 0, 0, 48, 15, 15, 0)
        for coffres in coffres_liste:
            pyxel.blt(coffres[0], coffres[1], 0, 32, 0, 15, 15, 0)
    else:
        pyxel.text(50,64, 'GAME OVER', 7)
pyxel.run(update, draw)