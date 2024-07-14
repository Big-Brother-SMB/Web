# Pyxel Studio
import pyxel

tile_type = {"vide":(1,0),"mur":(0,0),"Tete_perso":(0,1),"Pied_perso":(0,2),"gros_enemie":(()),'spawner':(3,5), 'lave': (3,4)}


class App():
    def __init__(self):
        pyxel.init(128,128, title='souterrain')
        self.zombie_list=[]
        self.clef=[]
        pyxel.load("theme2.pyxres")
        self.tilemap = pyxel.tilemap(0)
        self.life = 3
        self.j= Joueur()
        print("azza")
        pyxel.run(self.update,self.draw)
    
    def creation_zombie(self):
        ax=pyxel.floor(self.j.x/8)-10
        bx=pyxel.floor(self.j.x/8)+10
        ay=pyxel.floor(self.j.y/8)-10
        by=pyxel.floor(self.j.y/8)+10
        print("test2")
        return
        for x in range(ax,bx):
            for y in range(ay,by):
                if self.tilemap.pget(x,y) == tile_type.get('spawner'):
                    self.zombie_list.append(zombie(x*8,y*8,self.j))

    def update(self):
        self.j.deplacement(self.tilemap)
        #print("lol")
        #print(pyxel.frame_count)
        #if pyxel.frame_count%60==0:
        #    print("test",self.zombie_list)
        #    self.creation_zombie()
        #for zo in self.zombie_list:
        #    zo.deplacement()
             
    def draw(self):
        print("a5a")
        pyxel.cls(0)
        
        print("a58a")
        pyxel.rect(self.j.x,self.j.y,8,4,0)
        
        print("a59a")
        pyxel.bltm(0,0,0,0,0,248*8,248*8)
        
        print("a55a")
        pyxel.camera(self.j.x-64,self.j.y-64)
        print("aa2")
        pyxel.blt(self.j.x,self.j.y,0,0,8,8,8)
        #for z in self.zombie_list:
        #    print(z,z.x,z.y)
        #    pyxel.rect(z.x,z.y,8,4,4)
        #pyxel.rect(self.x2,self.y2,8,4,4)
        #pyxel.text(64, 0,f'--> {self.life}heart', 2)


def abs(num):
    return pyxel.sgn(num) * num

class Joueur():
    def __init__(self):
        self.x = 32
        self.y =32
        self.momentum=0
        self.vitesse = 2
        self.clef=[]
        self.life = 3

    def deplacement(self,t):
        self.tilemap = t
        x = self.x/8
        y = self.y/8
        v8 = self.vitesse/8

        if pyxel.btn(pyxel.KEY_Q) and self.tilemap.pget(pyxel.floor(x-v8+0.01), pyxel.floor(y+1)) == tile_type.get('vide'):
            self.x-=self.vitesse
        if pyxel.btn(pyxel.KEY_D) and self.tilemap.pget(pyxel.floor(x+1+v8-0.01), pyxel.floor(y+1)) == tile_type.get('vide'):
            self.x+=self.vitesse
        
        if pyxel.btn(pyxel.KEY_SPACE) and self.tilemap.pget(pyxel.floor(x), pyxel.floor(y)+2) != tile_type.get('vide'):
            self.momentum = 3
        
        # update le momentum
        self.momentum -= 0.2
        if self.momentum <= -3:
            self.momentum=-3
        
        # si le joueur est sur un surface sont momentum vaut 0
        if self.momentum < 0 and self.tilemap.pget(pyxel.floor(x), pyxel.floor((self.y-self.momentum)/8)+1) != tile_type.get('vide') and self.tilemap.pget(pyxel.floor(x), pyxel.floor((self.y-self.momentum)/8)+1) != tile_type.get('lave') :
            self.momentum=0
        self.y -= self.momentum 

        # si le joueur est dans la lave il meurt
        if self.tilemap.pget(self.x, self.y) == tile_type.get('lave'):
            pyxel.text(0,0,'[Achievement Unlocked] : Poulet roti')
            
    
    def check_planche(self):
        for _ in self.planches:
            if self.x  and self.y:
                _.player_on()







class zombie():
    def __init__(self,x,y,player):
        self.x=x
        self.y=y
        self.hitbox = (1,2)
        self.vie=80
        pla

    
    def deplacement(self):
        #if self.x-app.x<=50 and self.x-app.x>0 and self.y-app.y<=32 and self.y-app.y>0  or app.y-self.y<=32 and self.y-app.y>0:
        #    self.x-=1
        #elif app.x-self.x<=50 and app.x-self.x>0 and self.y-app.y>0  or app.y-self.y<=32 and self.y-app.y>0:
        #    self.x+=1

        d=pyxel.sqrt((self.player.x-self.x)**2+(self.player.y-self.y)**2)
        if d<=20:
            sens = pyxel.sgn(self.player.x-self.x)
            vitesse=1
            x = self.x/8
            y = self.y/8
            v8 = vitesse/8
            if sens==-1 and self.tilemap.pget(pyxel.floor(x-v8+0.01), pyxel.floor(y+1)) == tile_type.get('vide'):
                self.x-=vitesse
            if sens==1 and self.tilemap.pget(pyxel.floor(x+1+v8-0.01), pyxel.floor(y+1)) == tile_type.get('vide'):
                self.x+=vitesse



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