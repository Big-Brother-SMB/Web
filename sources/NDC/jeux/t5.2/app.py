# Pyxel Studio
import pyxel


tile_type = {"vide":(1,0),"mur":(0,0),"Tete_perso":(0,1),"Pied_perso":(0,2),'spawner':(3,5),'bar1':(4,1),'bar2':(5,1), 'lave1': (3,4), 'lave2': (4,4),"ladder":(5,4)}
app=None

class App():
    def __init__(self):
        global app
        app = self
        pyxel.init(128*2,128*2, title='souterrain',fps=30)
        self.zombie_list=[]
        self.clef=[]

        self.x2=32
        self.y2=32

        self.game_over=False
        pyxel.load("res.pyxres")
        self.tilemap = pyxel.tilemap(0)
        self.player = Joueur()
        pyxel.run(self.update,self.draw)
   
    def creation_zombie(self):
        ax=pyxel.floor(self.player.x/8)-20
        bx=pyxel.floor(self.player.x/8)+20
        ay=pyxel.floor(self.player.y/8)-20
        by=pyxel.floor(self.player.y/8)+20
        for x in range(ax,bx):
            for y in range(ay,by):
                if self.tilemap.pget(x,y) == tile_type.get('spawner'):
                    self.zombie_list.append(zombie(x*8,y*8))


    def update(self):
        self.player.deplacement()
        if pyxel.frame_count%90==0:
            self.creation_zombie()
        for zo in self.zombie_list:
            zo.deplacement()
            if zo.touch():
                self.zombie_list.remove(zo)
                self.player.life-=1
        if self.player.life<=0:
            self.game_over=True
        
             
    def draw(self):
        relatif_x=-120+self.player.x
        relatif_y=-120+self.player.y
        pyxel.cls(0)
        pyxel.bltm(-relatif_x,-relatif_y,0,0,0,248*8,248*8)
        pyxel.blt(120,120,0,0,8,8,8)
        for z in self.zombie_list:
            pyxel.blt(z.x-relatif_x,z.y-relatif_y,0,0,8*5,8,8,1)
        
        pyxel.text(0, 0,f'--> {self.player.life} heart', 0)
        if self.game_over==True:
            pyxel.text(128, 128,"game over",0)
        #pyxel.text(64, 64,str(self.player.momentum), 0)
        #pyxel.rectb(self.x2,self.y2,8,8,4)
        #pyxel.text(64, 0,f'--> {self.life}heart', 2)


class Utile():
    def collision_detect(object_a, object_b):
        a_left_edge = object_a.x
        a_top_edge = object_a.y
        a_right_edge = object_a.x + (object_a.hitbox[0]*8  - 1)
        a_bottom_edge = object_a.y + (object_a.hitbox[1]*8 - 1)

        b_left_edge = object_b.x
        b_top_edge = object_b.y
        b_right_edge = object_b.x + (object_b.hitbox[0]*8 - 1)
        b_bottom_edge = object_b.y + (object_b.hitbox[1]*8 - 1)

        if a_top_edge > b_bottom_edge:
            return False
        if b_top_edge > a_bottom_edge:
            return False
        if a_left_edge > b_right_edge:
            return False
        if b_left_edge > a_right_edge:
            return False

        return True

    def getObj(x,y,obj):
        a1 = app.tilemap.pget(pyxel.floor(x/8), pyxel.floor(y/8)) == obj
        a2 = app.tilemap.pget(pyxel.floor((x+7)/8), pyxel.floor(y/8)) == obj
        return (a1 and a2)

    def isOnTop(x,y,momentum):
        tile1 = app.tilemap.pget(pyxel.floor(x/8), pyxel.floor((y-momentum)/8))
        tile2 = app.tilemap.pget(pyxel.floor((x+7)/8), pyxel.floor((y-momentum)/8))
        return Utile.isTop(tile1) or Utile.isTop(tile2)
    
    def isOnFloor(x,y,momentum):
        tile1 = app.tilemap.pget(pyxel.floor(x/8), pyxel.floor((y-momentum)/8)+1)
        tile2 = app.tilemap.pget(pyxel.floor((x+7)/8), pyxel.floor((y-momentum)/8)+1)
        return Utile.isFloor(tile1) or Utile.isFloor(tile2)

    def isLeftMur(x,y,vitesse,momentum):
        v8 = vitesse/8
        tile1 = app.tilemap.pget(pyxel.floor(x/8-v8), pyxel.floor(y-momentum)/8)
        tile2 = app.tilemap.pget(pyxel.floor(x/8-v8), pyxel.floor((y-momentum+7)/8))
        return Utile.isMur(tile1) or Utile.isMur(tile2)
    
    def isRightMur(x,y,vitesse,momentum):
        v8 = vitesse/8
        tile1 = app.tilemap.pget(pyxel.floor((x+7)/8+v8), pyxel.floor(y-momentum)/8)
        tile2 = app.tilemap.pget(pyxel.floor((x+7)/8+v8), pyxel.floor((y-momentum+7)/8))
        return Utile.isMur(tile1) or Utile.isMur(tile2)
    
    def isTop(tile):
        a = tile == tile_type.get('vide')
        b = tile == tile_type.get('lave1')
        g = tile == tile_type.get('lave2')
        c = tile == tile_type.get('spawner')
        e = tile == tile_type.get('bar1')
        f = tile == tile_type.get('bar2')
        return not (a or b or c or e or f or g)
    
    def isFloor(tile):
        a = tile == tile_type.get('vide')
        b = tile == tile_type.get('lave1')
        c = tile == tile_type.get('spawner')
        d = tile == tile_type.get('lave2')
        return not (a or b or c or d)
    
    def isMur(tile):
        a = tile == tile_type.get('vide')
        b = tile == tile_type.get('lave1')
        g = tile == tile_type.get('lave2')
        c = tile == tile_type.get('spawner')
        d = tile == tile_type.get('ladder')
        e = tile == tile_type.get('bar1')
        f = tile == tile_type.get('bar2')
        return not (a or b or c or d or e or f or g)

def abs(num):
    return pyxel.sgn(num) * num


class Joueur():
    def __init__(self):
        self.x = 77*8
        self.y = 77*8
        self.momentum=0
        self.vitesse = 2
        self.clef=[]
        self.life = 3

    def deplacement(self):
        if pyxel.btn(pyxel.KEY_Q) and not Utile.isLeftMur(self.x,self.y,self.vitesse,self.momentum):#self.tilemap.pget(pyxel.floor(x-v8), pyxel.floor(y+1)) == tile_type.get('vide'):
            self.x-=self.vitesse
        if pyxel.btn(pyxel.KEY_D) and not Utile.isRightMur(self.x,self.y,self.vitesse,self.momentum):#self.tilemap.pget(pyxel.floor(x+1+v8-0.01), pyxel.floor(y+1)) == tile_type.get('vide'):
            self.x+=self.vitesse
            
        if pyxel.btn(pyxel.KEY_SPACE) and self.momentum <= 0 and Utile.isOnFloor(self.x,self.y,self.momentum):#and self.tilemap.pget(pyxel.floor(x+0.5), pyxel.floor((self.y-self.momentum)/8)+1) != tile_type.get('vide'):
            self.momentum = 3.6
       
        # update le momentum
        if not Utile.isOnFloor(self.x,self.y,self.momentum):
            self.momentum -= 0.2
        if self.momentum <= -6:
            self.momentum=-6
       
        # si le joueur est sur un surface sont momentum vaut 0
        if self.momentum < 0 and Utile.isOnFloor(self.x,self.y,self.momentum):
            self.momentum=0
            self.y = pyxel.ceil(self.y/8)*8
        elif self.momentum > 0 and Utile.isOnTop(self.x,self.y,self.momentum):
            self.momentum=0
            self.y = pyxel.floor(self.y/8)*8
        
        if Utile.getObj(self.x,self.y,tile_type.get('ladder')) or Utile.getObj(self.x,self.y+8,tile_type.get('ladder')):
            if pyxel.btn(pyxel.KEY_SPACE):
                self.y -= 1.6
            elif pyxel.btn(pyxel.KEY_S) and not Utile.isOnFloor(self.x,self.y,self.momentum):
                self.y += 1.6
        else:
            self.y -= self.momentum

        (app.x2,app.y2) = (pyxel.floor(self.x/8+1+self.vitesse/8), pyxel.floor(self.y/8))
        app.x2*=8
        app.y2*=8

        # si le joueur est dans la lave il meurt
        #if self.tilemap.pget(self.x, self.y) == tile_type.get('lave'):
        #    pyxel.text(0,0,'[Achievement Unlocked] : Poulet roti',0)
           
   
    def check_planche(self):
        for _ in self.planches:
            if self.x  and self.y:
                _.player_on()


class zombie():
    def __init__(self,x,y):
        self.x=x
        self.y=y
        self.hitbox = (1,1)
        self.vie=80
        self.vitesse=pyxel.rndf(0.1,1)
        self.momentum=0

    def touch(self):
        Px = app.player.x
        Py = app.player.y
        Sx = self.x
        Sy = self.y
        touch = Sx-8<=Px and Px<=Sx+8 and Sy-8<=Py and Py<=Sy+8
        return touch            
   
    def deplacement(self):
        d=pyxel.sqrt((app.player.x-self.x)**2+(app.player.y-self.y)**2)
        if d<=8*20 and d>0.5:
            sens = pyxel.sgn(app.player.x-self.x)
            if sens==-1 and not Utile.isLeftMur(self.x,self.y,self.vitesse,self.momentum):
                self.x-=self.vitesse
            if sens==1 and not Utile.isRightMur(self.x,self.y,self.vitesse,self.momentum):
                self.x+=self.vitesse
        
        # update le momentum
        if not Utile.isOnFloor(self.x,self.y,self.momentum):
            self.momentum -= 0.2
        if self.momentum <= -3:
            self.momentum=-3
       
        # si le joueur est sur un surface sont momentum vaut 0
        if self.momentum < 0 and Utile.isOnFloor(self.x,self.y,self.momentum) :
            self.momentum=0
            self.y = pyxel.ceil(self.y/8)*8
        self.y -= self.momentum






class diable():
    def __init__(self,x,y):
        self.bdf=[]
        self.vie=200
        self.x=x
        self.y=y
   
    def tir_bdf(self):
        d= pyxel.sqrt((j.x-self.x)**2+(j.y-self.y)**2)
        if d<=50:
            self.bdf.append((1))




class planche():
    def __init__(self,x,y):
        self.x = x
        self.y = y
        self.last_step_on = 0
        self.countdown = 30
        self.tilemap = pyxel.tilemap(0)
   
    def player_on(self):
        if self.last_step_on - pyxel.frame_count > 5 and self.countdown > 0:
            self.countdown = 30
            self.tilemap.pset(self.x, self.y, 'normal')


        if self.countdown >= 0:    
            self.countdown -= 1
            if self.countdown == 15:
                self.tilemap.pset(self.x, self.y, 'semi_broken')
            elif self.countdoxn == 0:
                self.tilemap.pset(self.x, self.y, 'vide')
            self.last_step_on = pyxel.frame_count
           



App()