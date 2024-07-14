import pyxel, random, math

class Explosion:
    def __init__(self,x,y):
        self.sprite=0
        self.x=x
        self.y=y
    
    def draw(self):
        pyxel.blt(self.x,self.y,0,128+self.sprite*16,32,16,16,5)

    def update(self):
        self.sprite+=1

class Ennemi:
    def __init__(self, type):
        self.type=type
        self.sprite=0

        if self.type == "spider":
            self.y=random.randint(0,112)
            self.x=112
        elif self.type == "fly":
            self.x=random.randint(0, 112)
            self.y=112

    def draw(self):
        if self.type == "spider":
            pyxel.blt(self.x,self.y, 0, 16*self.sprite,120, -16,16,5)
        elif self.type == "fly":
            pyxel.blt(self.x,self.y, 0, self.sprite*16+128,8, -16,16,5)
    
    def update(self):
        if self.type == "spider":
            self.x-=1
            # if not checkWall(getEntityBox(self.x,self.y,16,"gauche"),5):
        elif self.type == "fly":
            self.y-=1

        if pyxel.frame_count%5==0:
            if self.type=="spider":
                self.sprite=(self.sprite+1)%2
            elif self.type=="fly":
                self.sprite=(self.sprite+1)%8

class Tir:
    def __init__(self,x,y,type):
        self.x=x
        self.y=y
        self.type=type
        self.sprite=0

    def update(self):
        if pyxel.frame_count%5==0:
            self.sprite=(self.sprite+1)%3
        
        self.x+=1

        if self.x>120:
            return True

        # if not checkWall(getEntityBox(self.x, self.y, 8,"droit"), 1):
        
        return False
        
    def draw(self):
        x=32+8*self.sprite
        y=8+8*self.type
        pyxel.blt(self.x,self.y,0,x,y,8,8,5)

power={"vie": (48,216),"munitions":(0,216),"flamme":(96,216)}

class Barril:
    def __init__(self):
        self.x,self.y=self.findCoords()
        self.sprite=random.randint(0,1)
        self.destroyed=False
        self.type=["vie","munitions","flamme"][random.randint(0,2)]

    def findCoords(self):
        x=0
        y=0
        x=random.randint(0,112)
        y=random.randint(0,112)
        valid=False
        while valid:
            valid=True
            x=random.randint(0,112)
            y=random.randint(0,112)
            for i in range(16):
                for b in range(16):
                    if pyxel.pget(x+i,y+b)!=1:
                        valid=False
        return(x,y)

    def draw(self):
        if not self.destroyed:
            pyxel.blt(self.x,self.y,0,176+16*self.sprite,112,16,16,5)
        else:
            pyxel.blt(self.x,self.y,0,power[self.type][0],power[self.type][1],16,16,5)

class App:
    def __init__(self):
        pyxel.init(128, 144, title="Nuit du code")
        pyxel.load("3.pyxres")
        
        self.explosions=[]
        self.vie=3
        self.perso_x=0
        self.perso_y=0
        self.ennemis=[]
        self.map=0
        self.gameover=False
        self.munitions=15
        self.upgrade=2
        self.tirs=[]
        self.tir_type=0
        self.barrils=[]
        self.win=False
        self.sprite=0
        self.flammes=0
        for _ in range(4):
            self.barrils.append(Barril())

        pyxel.run(self.update, self.draw)
        
    def deplacement(self):
        if pyxel.btn(pyxel.KEY_RIGHT) and self.perso_x<120:
            if self.map==5 or checkWall(self.getBox("droit"),1):
                self.perso_x += 1

        if pyxel.btn(pyxel.KEY_LEFT) and self.perso_x>0:
            if self.map==5 or checkWall(self.getBox("gauche"),1):
                self.perso_x += -1

        if pyxel.btn(pyxel.KEY_DOWN) and self.perso_y<120:
            if self.map==5 or checkWall(self.getBox("bas"),1):
                self.perso_y+=1

        if pyxel.btn(pyxel.KEY_UP) and self.perso_y>0:
            if self.map==5 or checkWall(self.getBox("haut"),1):
                self.perso_y-=1

    def cree_ennemi(self):
        if pyxel.frame_count%80==0:
            self.ennemis.append(Ennemi("spider"))

        if (pyxel.frame_count+40)%80==0:
            self.ennemis.append(Ennemi("fly"))

        toRemove=[]
        for e in self.ennemis:
            if e.update():
                toRemove.append(e)
        for e in toRemove:
            self.ennemis.remove(e)

    def checkColisions(self):
        toRemove=[]
        for e in self.ennemis:
            d=distance(self.perso_x,self.perso_y,e.x,e.y)
            if d<15:
                toRemove.append(e)
                self.mort()
        if len(self.ennemis)>0:
            for e in toRemove:
                self.ennemis.remove(e)

    def checkColiTirBarrils(self):
        toRemove=[]
        toRemoveB=[]
        for b in self.barrils:
            if not b.destroyed:
                for tir in self.tirs:
                    if distance(b.x,b.y,tir.x,tir.y)<15:
                        toRemove.append(tir)
                        b.destroyed=True
            if b.destroyed:
                if distance(self.perso_x,self.perso_y,b.x,b.y)<20:
                    toRemoveB.append(b)
                    pyxel.play(0,0)
                    if b.type=="vie":
                        self.vie+=1
                    elif b.type=="munitions":
                        self.munitions+=10
                    elif b.type=="flamme":
                        self.flammes+=1

        for tir in toRemove:
            if tir in self.tirs:
                self.tirs.remove(tir)
        for b in toRemoveB:
            if b in self.barrils:
                self.barrils.remove(b)

    def checkColisionsTirs(self):
        toRemove=[]
        toRemoveT=[]
        for e in self.ennemis:
            if e.type=="spider":
                d=15
            if e.type=="fly":
                d=9
            for tir in self.tirs:
                if distance(e.x,e.y,tir.x,tir.y)<d:
                    toRemove.append(e)
                    toRemoveT.append(tir)
        for e in toRemove:
            if e in self.ennemis:
                self.ennemis.remove(e)
        for t in toRemoveT:
            if t in self.tirs:
                self.tirs.remove(t)

    def mort(self):
        self.vie-=1
        self.explosions.append(Explosion(self.perso_x,self.perso_y))
        if self.vie==0:
            self.perso_x=0
            self.perso_y=0
            self.map=0
            self.ennemis=[]
            self.gameover=True
            pyxel.play(0,1)

    def creeTir(self):
        if pyxel.btnp(pyxel.KEY_SPACE) and self.munitions>0:
            self.tirs.append(Tir(self.perso_x+8,self.perso_y+4,self.tir_type))
            self.munitions-=1

    def updateTirs(self):
        toRemove=[]
        for t in self.tirs:
            if t.update():
                toRemove.append(t)
        for t in toRemove:
            self.tirs.remove(t)

    def explosion(self):
        for e in self.explosions:
            e.update()

        toRemove=[]
        for i in self.explosions:
            if i.sprite>8:
                toRemove.append(i)
        for e in toRemove:
            if e in self.explosions:
                self.explosions.remove(e)

    def update(self):
        self.deplacement()
        self.cree_ennemi()
        self.checkColisions()
        self.creeTir()
        self.updateTirs()
        self.checkColisionsTirs()
        self.checkColiTirBarrils()
        self.explosion()

        if pyxel.frame_count%5==0:
            self.sprite=(self.sprite+1)%2

        if self.perso_x==112 and self.map<5:
            self.nextWorld()

        if self.perso_x==0 and self.map>0:
            self.worldBefore()

        if distance(56,56,self.perso_x,self.perso_y)<15 and self.vie>=10 and self.map==5:
            self.win=True
        
    def worldBefore(self):
        self.map-=1
        self.barrils=[]
        self.ennemis=[]
        self.perso_x=111
        for _ in range(4):
            self.barrils.append(Barril())

    def nextWorld(self):
        self.map+=1
        self.barrils=[]
        self.ennemis=[]
        self.perso_x=1
        for _ in range(4):
            self.barrils.append(Barril())

    def gui(self):
        pyxel.blt(5,128,0,0,184+16*self.upgrade,16,16)
        pyxel.text(25,134, str(self.munitions),7)
        
        pyxel.blt(45,128,0,48,200,16,16)
        pyxel.text(65,134, str(self.vie),7)

        pyxel.blt(85,128, 0,144,200,16,16)
        pyxel.text(105,134, str(self.flammes),7)
        
    def draw(self):
        pyxel.cls(1)

        if self.gameover:
            pyxel.text(45,64, 'Perdu...', 7)
            return

        if self.win:
            pyxel.text(45,64, 'VICTOIRE!', 7)
            pyxel.text(45,64, 'Vous avez sauver le monde de ces monstres', 7)
            return

        pyxel.rect(0,128,128,16,0)
        
        for e in self.explosions:
            e.draw()

        pyxel.bltm(0,0, 0, 128*self.map,0, 128,128,5)

        pyxel.blt(self.perso_x,self.perso_y, 0, 16*self.sprite,24, 16,16,5)

        if self.map==5:
            pyxel.text(12,48,"10 flammes sont necessaires",7)
            pyxel.text(45,76,"pour gagner",7)
            pyxel.blt(56,56,0,32,216,16,16,5)

        self.gui()

        for e in self.ennemis:
            e.draw()

        for t in self.tirs:
            t.draw()

        for b in self.barrils:
            b.draw()
        
        
    def getBox(self,cote):
        return getEntityBox(self.perso_x, self.perso_y,16,cote)

def distance(x1,y1,x2,y2):
    return math.sqrt((x2-x1)**2 + (y2-y1)**2)

def getEntityBox(x,y, l, cote):
    tab=[]
    if cote=="gauche":
        for i in range(0,l):
            tab.append((x-1, y+i))
        return tab
    elif cote=="droit":
        for i in range(0,l):
            tab.append((x+l, y+i))
        return tab
    elif cote=="bas":
        for i in range(0,l):
            tab.append((x+i, y+l))
        return tab
    elif cote=="haut":
        for i in range(0,l):
            tab.append((x+i, y-1))
        return tab

def checkWall(wall, col):
    valid=True
    for i in wall:
        if pyxel.pget(i[0], i[1])!=col:
            valid=False
    return valid
        
App()