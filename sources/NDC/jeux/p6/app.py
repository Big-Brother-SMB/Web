#Theme2
import pyxel
import time 
pyxel.init(256,256,title="Diving tycoon",fps=10)
resource = pyxel.load("theme2.pyxres")
Px=112
Py=112
cox=96
coy=0
t1=0
t2=0
t3=0
t4=0
nbrcoins=0
pieces = []
requin = []
hp = 3
i = 0
   
def collision(x,y):
    if pyxel.pget(x+16,y+16)==13:
        print(x, y)
        return False
    else:
        return True

def tresor(elt, x, y):
    pieces.remove(elt)
    pyxel.blt(x, y, 2, 64, 32, 16, 16, 6)
    time.sleep(1)
    nbrcoins += 10

def check_money(Px, Py, pieces, nbrcoins):
    for elt in pieces:
        x, y = elt[0], elt[1]
        dx, dy = Px-x, Py-y
        if -8 < dx < 8 and -8 < dy < 8:
            luck = pyxel.rndi(1, 1000)
            if luck == 325:
                tresor(elt, x, y)
            else:
                pieces.remove(elt)
                nbrcoins += 1
    return nbrcoins
    
    
def check_requin(Px, Py, requin, hp):
    for elt in requin:
        x, y = elt[0], elt[1]
        dx, dy = Px-x, Py-y
        if -8 < dx < 8 and -8 < dy < 8:
            requin.remove(elt)
            hp -= 1
    return hp

def createrequin(Px, Py):
    global requin
    if pyxel.frame_count % 30 == 0 and len(requin) <= 25:
        requin.append([Px-100, Py + pyxel.rndi(-10, 10)])

def createmoney(Px, Py):
    global pieces
    if pyxel.frame_count % 30 == 0 and len(pieces) <= 10:
        pieces.append([Px + pyxel.rndi(-128, 128), Py + pyxel.rndi(-128, 128)])
def draw():
    pyxel.bltm(-128, -50, 0, 0, 0, 1024, 1024)
    pyxel.blt(Px, Py, 2, cox, coy, 16, 16, 6)
    pyxel.blt(Px-120, Py-106, 2, 112, 16, 16, 16, 6)
    pyxel.text(Px-100,Py-100,str(nbrcoins),0)
    for piece in pieces:
        pyxel.blt(piece[0], piece[1], 2, 112, 16, 16, 16, 6)
    for r in requin:
        if i == 1:
            pyxel.blt(r[0], r[1], 2, 0, 0, 16, 16, 6)
        else:
            pyxel.blt(r[0], r[1], 2, 16, 0, 16, 16, 6)
def camera(x,y):
    pyxel.camera(x-125,y-125)

def update():
    global Px, Py ,cox,coy,t1,t2,t3,t4,pieces, nbrcoins, requin, hp, i
    if pyxel.btnp(pyxel.KEY_Q) or hp==0:
        pyxel.text(Px,Py,"fin du jeu",0)
        pyxel.quit()
    nbrcoins = check_money(Px, Py, pieces, nbrcoins)
    hp = check_requin(Px, Py, requin, hp)
    createmoney(Px, Py)
    createrequin(Px, Py)
    if pyxel.frame_count % 300 <= 150:
        i = 1
    else:
        i = 0
    for r in requin:
        if i ==0:
            r[0] += 3
        elif i == 1:
            r[0] -= 3
    Px, Py,cox,coy,t1,t2,t3,t4=player_movement(Px,Py,cox,coy,t1,t2,t3,t4)
    camera(Px,Py)

def player_movement(x, y,cox,coy,t1,t2,t3,t4):
    if pyxel.btn(pyxel.KEY_RIGHT):
        if (x < 250) and collision(x+4, y):
            x = x + 4
            cox=192
            coy=0
            if t1==1:
                cox=176
                coy=0
                t1=0
            else:   
                t1=1
    if pyxel.btn(pyxel.KEY_LEFT) and collision(x-4, y):
        if (x > 0) :
            x = x - 4
            cox=208
            coy=0
            if t2==1:
                cox=224
                coy=0
                t2=0
            else:
                t2=1
    if pyxel.btn(pyxel.KEY_DOWN) and collision(x, y+4):
        if (y < 250) :
            y = y + 4
            cox=64
            coy=0
            if t3==1:
                cox=80
                coy=0
                t3=0
            else:
                t3=1
    if pyxel.btn(pyxel.KEY_UP) and collision(x, y-4):
        if (y > 0) :
            y = y - 4
            cox=96
            coy=0
            if t4==1:
                cox=112
                coy=0
                t4=0
            else:
                t4=1
    else:
        y=y+0
    return x, y ,cox ,coy,t1,t2,t3,t4
   

pyxel.run(update,draw)