import pyxel


def abs(nb):
    return pyxel.sgn(nb)*nb

class use_item:
    def __init__(self,type,x,y,vectorX,vectorY):
        self.type=type
        self.x=x
        self.y=y
        self.vitesse=5
        angle = pyxel.atan2(vectorY,vectorX)
        self.vectorX=pyxel.cos(angle)
        self.vectorY=pyxel.sin(angle)
        self.countdown=90
        
    def draw(self):
        match self.type:
            case 0:
                pyxel.blt(self.x*8, self.y*8,1, 8*7,8*0, 8, 8,0)
            case 1:
                pyxel.blt(self.x*8, self.y*8,1, 8*8,8*0, 8, 8)
    
    def deplacement(self):
        if self.type==0:
            v=(1/10)*self.vitesse
            self.x+=self.vectorX*v
            self.y+=self.vectorY*v

class item:
    def __init__(self,type,x,y):
        self.type=type
        self.x=x
        self.y=y

    def draw(self):
        match self.type:
            case 0:
                pyxel.blt(self.x*8, self.y*8,1, 8*7,8*0, 8, 8,0)
            case 1:
                pyxel.blt(self.x*8, self.y*8,1, 8*8,8*0, 8, 8)

class zombie:
    def __init__(self,type,vie,vitesse,x,y):
        self.type=type
        self.vie=vie
        self.vitesse=vitesse
        self.x=x
        self.y=y
        self.attack=10
        self.countdown=0
        self.pathFinding=[[0 for i2 in range(40)] for i in range(40)]

    def draw(self):
        match self.type:
            case 0:
                pyxel.blt(self.x*8, (self.y-1)*8,1, 8*0,8*2, 8, 16,0)
    
    def deplacement(self,pathFinding):
        x = round(self.x)
        y = round(self.y)
        myLevel = pathFinding[x][y]
        v=(1/100)*self.vitesse
        if y<39 and pathFinding[x][y+1]>myLevel:
            self.y+=v
            self.sprit=3
        if y>0 and pathFinding[x][y-1]>myLevel:
            self.y-=v
            self.sprit=2
        if x>0 and pathFinding[x-1][y]>myLevel:
            self.x-=v
            self.sprit=1
        if x<39 and pathFinding[x+1][y]>myLevel:
            self.x+=v
            self.sprit=0
    
    def is_dead(self):
        if self.vie<=0:
            return True
        else:
            return False

class player:
    def __init__(self,vie,vitesse,x,y):
        self.vie=vie
        self.x=x
        self.y=y
        self.sprit=0
        self.tnt=0
        self.pierre=0
        self.vitesse=vitesse
    
    def deplacement(self,tilemap):
        x = self.x
        y = self.y
        v=(1/100)*self.vitesse
        if (pyxel.btn(pyxel.KEY_S) or pyxel.btn(pyxel.GAMEPAD1_BUTTON_DPAD_DOWN)) and tilemap.pget(x,pyxel.ceil(y+v))==(1,1):
            self.y+=v
            self.sprit=3
        if (pyxel.btn(pyxel.KEY_Z) or pyxel.btn(pyxel.GAMEPAD1_BUTTON_DPAD_UP)) and tilemap.pget(x,pyxel.floor(y-v))==(1,1):
            self.y-=v
            self.sprit=2
        if (pyxel.btn(pyxel.KEY_Q) or pyxel.btn(pyxel.GAMEPAD1_BUTTON_DPAD_LEFT)) and tilemap.pget(pyxel.floor(x-v),y)==(1,1):
            self.x-=v
            self.sprit=1
        if (pyxel.btn(pyxel.KEY_D) or pyxel.btn(pyxel.GAMEPAD1_BUTTON_DPAD_RIGHT)) and tilemap.pget(pyxel.ceil(x+v),y)==(1,1):
            self.x+=v
            self.sprit=0
    
    def draw(self):
        match self.sprit:
            case 0:
                pyxel.blt(self.x*8, (self.y-1)*8,1, 8*4,0, 8, 16,0)
            case 1:
                pyxel.blt(self.x*8, (self.y-1)*8,1, 8*4,0, -8, 16,0)
            case 2:
                pyxel.blt(self.x*8, (self.y-1)*8,1, 8*6,0, 8, 16,0)
            case 3:
                pyxel.blt(self.x*8, (self.y-1)*8,1, 8*5,0, 8, 16,0)
    
    def is_dead(self):
        if self.vie<=0:
            return True
        else:
            return False

class Jeu:
    def __init__(self):
        pyxel.init(320, 320, title="Jeu", capture_scale=4)
        pyxel.load("images.pyxres")
        pyxel.playm(0,tick=0,loop=True)
        pyxel.playm(0,tick=0,loop=True)
        pyxel.mouse(True)
        self.list_use_item=[]
        self.list_item_sol=[]
        self.list_mob=[]
        self.score=0
        self.nbSpawer=0
        self.niveau=0
        self.kill=0
        self.player=player(100,20,10,10)
        self.create_world()
        pyxel.run(self.update, self.draw)

    def use_item(self):
        if (pyxel.btn(pyxel.MOUSE_BUTTON_LEFT) or pyxel.btn(pyxel.GAMEPAD1_BUTTON_B)) and self.player.pierre>0:
            self.player.pierre-=1
            mouse_x = (pyxel.mouse_x/2552)*320/8
            mouse_y = (pyxel.mouse_y/2552)*320/8
            self.list_use_item.append(use_item(0,self.player.x,self.player.y,mouse_x*8-self.player.x,mouse_y*8-self.player.y))
        if (pyxel.btnp(pyxel.KEY_SPACE) or pyxel.btn(pyxel.GAMEPAD1_BUTTON_A)) and self.player.tnt>0:
            self.player.tnt-=1
            self.list_use_item.append(use_item(1,self.player.x,self.player.y,0,0))

    def summon_item(self):
        for x in range(40):
            for y in range(40):
                tile = pyxel.tilemaps[0].pget(x,y)
                if tile==(1,1) and pyxel.rndi(0,100)==0:
                    rand = pyxel.rndi(0,100)
                    if(rand>95):
                        self.list_item_sol.append(item(1,x,y))
                    else:
                        self.list_item_sol.append(item(0,x,y))

    def summon_mob(self):
        self.niveau+=1
        b=round((17-self.niveau)*(self.nbSpawer/150))
        for x in range(40):
            for y in range(40):
                tile = pyxel.tilemaps[0].pget(x,y)
                if tile==(1,0) and pyxel.rndi(0,b)==0:
                    self.list_mob.append(zombie(0,20,5,x,y))

    def create_world(self):
        for x in range(40):
            for y in range(40):
                n = pyxel.noise(x/10,y/10,2)
                tile=(1,1)
                if n > 0.2:
                    tile=(0,1)
                elif n > -0.28:
                    tile=(1,1)
                elif n > -1:
                    tile=(1,0)
                    self.nbSpawer+=1
                pyxel.tilemaps[0].pset(x,y,tile)

    def updatePathFinding(self):
        x = round(self.player.x)
        y = round(self.player.y)
        pathFinding = [[0 for i2 in range(40)] for i in range(40)]
        distance=40
        if pyxel.tilemaps[0].pget(x,y) == (1,1):
            pathFinding[x][y]=distance
        while distance>1:
            for x in range(40):
                for y in range(40):
                    if pathFinding[x][y]==distance:
                        if (pyxel.tilemaps[0].pget(x+1,y)==(1,1) or pyxel.tilemaps[0].pget(x+1,y)==(1,0)) and pathFinding[x+1][y]==0:
                            pathFinding[x+1][y]=distance-1
                        if (pyxel.tilemaps[0].pget(x-1,y)==(1,1) or pyxel.tilemaps[0].pget(x-1,y)==(1,0)) and pathFinding[x-1][y]==0:
                            pathFinding[x-1][y]=distance-1
                        if (pyxel.tilemaps[0].pget(x,y+1)==(1,1) or pyxel.tilemaps[0].pget(x,y+1)==(1,0)) and pathFinding[x][y+1]==0:
                            pathFinding[x][y+1]=distance-1
                        if (pyxel.tilemaps[0].pget(x,y-1)==(1,1) or pyxel.tilemaps[0].pget(x,y-1)==(1,0)) and pathFinding[x][y-1]==0:
                            pathFinding[x][y-1]=distance-1
            distance-=1
        self.player.pathFinding=pathFinding

    def update(self):
        if pyxel.btn(pyxel.KEY_ESCAPE):
            quit()
        if not self.player.is_dead():
            time = pyxel.frame_count/30
            if time%20==0:
                if self.niveau>15:
                    self.niveau=15
                self.score+=self.niveau*1000
                self.summon_mob()
                self.summon_item()
            self.updatePathFinding()
            self.player.deplacement(pyxel.tilemaps[0])
            for mob in self.list_mob:
                if mob.vie<=0:
                    del self.list_mob[self.list_mob.index(mob)]
                    self.score+=50
                    self.kill+=1
                if mob.countdown>0:
                    mob.countdown-=1
                mob.deplacement(self.player.pathFinding)
                if abs(mob.x-self.player.x)<1 and abs(mob.y-self.player.y)<1 and mob.countdown==0:
                    mob.countdown=30*2
                    self.player.vie-=mob.attack
            for item in self.list_item_sol:
                if abs(item.x-self.player.x)<1 and abs(item.y-self.player.y)<1:
                    pyxel.play(2,6)
                    if item.type==0:
                        self.player.pierre+=30
                        self.score+=10
                    if item.type==1:
                        self.player.tnt+=1
                        self.score+=100
                    del self.list_item_sol[self.list_item_sol.index(item)]
            self.use_item()
            for item in self.list_use_item:
                item.deplacement()
                if item.type==0:
                    if item.x>50 or item.x<-10 or item.x>50 or item.x<-10:
                        del self.list_use_item[self.list_use_item.index(item)]
                    else:
                        for mob in self.list_mob:
                            if abs(item.x-mob.x)<1 and abs(item.y-mob.y)<1:            
                                mob.vie-=1
                                del self.list_use_item[self.list_use_item.index(item)]
                                break
                else:
                    if item.countdown<=0:
                        pyxel.play(2,4)
                        pyxel.play(3,5)
                        for mob in self.list_mob:
                            distance=pyxel.sqrt((item.x-mob.x)**2+(item.y-mob.y)**2)
                            if distance<10:            
                                mob.vie-=30
                        del self.list_use_item[self.list_use_item.index(item)]
                    else:
                        item.countdown-=1
        else:
            pyxel.stop(0)
            pyxel.stop(1)
    
    def draw(self):
        pyxel.cls(9)
        if not self.player.is_dead():
            pyxel.bltm(0, 0, 0, 0, 0, 320, 320, 0)
            """for y in range(40):
                for x in range(40):
                    if pyxel.tilemaps[0].pget(x,y)==(1,1) and self.player.pathFinding[x][y]>0:
                        pyxel.rect(x*8, y*8,8,8, 1)
                        pyxel.text(x*8, y*8, str(self.player.pathFinding[x][y]), 0)
                    if self.player.pathFinding[x][y]==20:
                        pyxel.rect(x*8, y*8,8,8, 2)"""
            for mob in self.list_mob:
                mob.draw()
            for item in self.list_item_sol:
                item.draw()
            for item in self.list_use_item:
                item.draw()
        self.player.draw()
        pyxel.text(0, 0, "vie:"+str(self.player.vie), 0)
        pyxel.text(0, 8, "niveau:"+str(self.niveau), 0)
        pyxel.text(0, 16, "score:"+str(self.score), 0)
        pyxel.text(0, 24, "pierre:"+str(self.player.pierre), 0)
        pyxel.text(0, 32, "tnt:"+str(self.player.tnt), 0)
        pyxel.text(0, 40, "mob:"+str(len(self.list_mob)), 0)
        pyxel.text(0, 48, "kill:"+str(self.kill), 0)
        if self.player.is_dead():
            pyxel.text(320/2-18, 320/2-3, "game over", 0)
        

Jeu()