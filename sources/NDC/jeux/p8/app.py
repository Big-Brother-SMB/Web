import pyxel
import time
pyxel.init(256, 256, title="Nuit du Code")

pyxel.load("2.pyxres")
x=100
y=100
score=0
liste_coin = []
liste_ennemisx = []
liste_ennemisy = []
d=0
w=0
dead=False
z=0
def update():
    global x, y
    global liste_coin
    global liste_ennemisy
    global liste_ennemisx
    global d
    global w
    global z
    global dead
    global score
    x, y, d, w=player_movement(x,y, d, w)
    liste_coin = coin_generator(liste_coin)
    liste_coin, score = coin_collector(liste_coin,score)
    liste_ennemisx = apparition_ennemisx(liste_ennemisx)
    liste_ennemisy = apparition_ennemisy(liste_ennemisy)
    mouvements_ennemisx(liste_ennemisx)
    mouvements_ennemisy(liste_ennemisy)
    z=animation_coin(z)
   
    
    
   
    
    
def draw():
    pyxel.cls(13)
    
    global dead,score
    if dead==True :
        pyxel.text(128,128,"GAME OVER",7)
        pyxel.text(128,120,"Your score is :"+str(score),7)

    
    if w == 1 :
        if d == 0 :
            pyxel.blt(x,y,0, 2,8,12, 16,5)
        elif d == 1 :    
            pyxel.blt(x,y,0, 18,8,12, 16,5)
        elif d == 2 :
            pyxel.blt(x,y,0, 34,8,12, 16,5)
        elif d == 3 :
            pyxel.blt(x,y,0, 50,8,12, 16,5)
    elif w == 0 :
        if d == 0 :
            pyxel.blt(x,y,0, 66,8,12, 16,5)
        elif d == 1 :
            pyxel.blt(x,y,0, 82,8,12, 16,5)
        elif d == 2 :
            pyxel.blt(x,y,0, 98,8,12, 16,5)
        elif d == 3 :
            pyxel.blt(x,y,0, 114,8,12, 16,5)

    for el in liste_coin :
        if z == 0 :
            pyxel.blt(el[0],el[1],0,49,201,6,6,5)
        elif z == 1 :
            pyxel.blt(el[0],el[1],0,58,201,4,6,5)
        elif z == 2:
            pyxel.blt(el[0],el[1],0,67,201,2,6,5)
        elif z == 3 :
            pyxel.blt(el[0],el[1],0,74,201,4,6,5)
        


    
    pyxel.text(5,5,"Score:"+str(score),7)
    for ele in liste_ennemisx :
        pyxel.blt(ele[0],ele[1],0, 2,57,11, 15,5)
    for ele in liste_ennemisy :
        pyxel.blt(ele[0],ele[1],0,2,57,11,15,5)



def animation_coin(z) :
    if pyxel.frame_count % 7 == 0 :
        z = (z + 1) % 4
    return z
    


def coin_generator (liste_coin) :
    if pyxel.frame_count % 30 == 0 :
        liste_coin.append((pyxel.rndi(0,256),pyxel.rndi(0,256)))
    return liste_coin

def coin_collector(liste_coin,score):
    for coin in liste_coin:
        if x<=coin[0]<=x+12 and y<=coin[1]<=y+16:
            liste_coin.remove(coin)
            score=score+1
    return liste_coin,score


def player_movement(x, y, d, w):

    if pyxel.btn(pyxel.KEY_RIGHT):
        if (x < 250) :
            x = x + 1.5
        d=(d+1)%4
        w=1
    if pyxel.btn(pyxel.KEY_LEFT):
        if (x > 0) :
            x = x - 1.5
        d=(d+1)%4
        w=0
    if pyxel.btn(pyxel.KEY_DOWN):
        if (y < 250) :
            y = y + 1.5
        d=(d+1)%4
        w=1
    if pyxel.btn(pyxel.KEY_UP):
        if (y > 0) :
            y = y - 1.5
        d=(d+1)%4
        w=0
    return x, y, d, w

def apparition_ennemisx (liste_ennemisx) :
    if pyxel.frame_count % 15 == 0 and len(liste_ennemisx)<30 :
        liste_ennemisx.append([pyxel.rndi(0,256),0])
    return liste_ennemisx

def apparition_ennemisy (liste_ennemisy) :
    if pyxel.frame_count % 15 == 0 and len(liste_ennemisy)<30 :
        liste_ennemisy.append([0,pyxel.rndi(0,256)])
    return liste_ennemisy

def mouvements_ennemisx(liste_ennemisx) :
    for ele in liste_ennemisx :
         ele[1] = ele[1] +1+1*(score/10)
         if ele[1] > 255 :
             liste_ennemisx.remove(ele)
    return liste_ennemisx

def mouvements_ennemisy(liste_ennemisy) :
    for ele in liste_ennemisy :
         ele[0] = ele[0] +1+1*(score/10)
         if ele[0]>255 :
             liste_ennemisy.remove(ele)
    return liste_ennemisy
        
def ennemies_collider(liste_ennemisx,liste_ennemisy):
    global dead
    for things in liste_ennemisx and liste_ennemisy:
        if (elex[0] >= x+16 and elex[1] <= y+12 and elex[0]+15 >= x and elex[1]+11 <= y)or(eley[0] >= x+16 and eley[1] <= y+12 and eley[0]+15 >= x and eley[1]+11 <= y):
            pyxel.rect(0,0,256,256,0)
            dead=True


pyxel.run(update, draw)