# Pyxel Studio

import pyxel
import random
import time

class App :
    def __init__(self):
        pyxel.init(128,128,title="ndc_baspatou", fps=30)
        pyxel.load('theme2.pyxres')
        self.victoire = False
        self.perso_x = 56
        self.perso_y = 24
        self.terre = [
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], 
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], 
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
        for i in range(4):
            self.coffre_x = random.randint(0,15)
            self.coffre_y = random.randint(4,15)
            self.terre[self.coffre_y][self.coffre_x] = -1
        self.temps = 0 
        for i in range(len(self.terre)):
            for j in range(len(self.terre[i])):
                if self.terre[i][j] == 0:
                    if random.randint(0, 1) == 0:
                        self.terre[i][j] = -2
        pyxel.run(self.update, self.draw)
        
        
    def bouge(self):
        if pyxel.btn(pyxel.KEY_RIGHT) and self.perso_x < 120 and self.terre[int((self.perso_y//8))][int(((self.perso_x+8)/8))] > 0 and self.terre[int(((self.perso_y+7)//8))][int(((self.perso_x+8)//8))] > 0:
            self.perso_x += 1
        if pyxel.btn(pyxel.KEY_LEFT) and self.perso_x > 0 and self.terre[int((self.perso_y//8))][int(((self.perso_x-1)//8))] > 0 and self.terre[int(((self.perso_y+7)//8))][int(((self.perso_x-1)//8))] > 0:
            self.perso_x -= 1
        if pyxel.btn(pyxel.KEY_DOWN) and self.perso_y < 120 and self.terre[int(((self.perso_y+8)//8))][int((self.perso_x)//8)] > 0 and self.terre[int(((self.perso_y+8)//8))][int((self.perso_x+7)//8)] > 0:
            self.perso_y += 1
        if pyxel.btn(pyxel.KEY_UP) and self.perso_y > 0 and self.terre[int(((self.perso_y-1)//8))][int((self.perso_x)//8)] > 0 and self.terre[int(((self.perso_y-1)//8))][int((self.perso_x+7)//8)] > 0:
            self.perso_y -= 1
            
    def minage(self):
        if pyxel.btn(pyxel.KEY_SPACE) and pyxel.btn(pyxel.KEY_RIGHT) and self.terre[int((self.perso_y//8))][int(((self.perso_x)//8)+1)] <= 0:
            time.sleep(0.6)
            if self.terre[int((self.perso_y//8))][int(((self.perso_x)//8)+1)] == -1:
                self.terre[int((self.perso_y//8))][int(((self.perso_x)//8)+1)] = 5
            else :
                self.terre[int((self.perso_y//8))][int(((self.perso_x)//8)+1)] = 1

            
        if pyxel.btn(pyxel.KEY_SPACE) and pyxel.btn(pyxel.KEY_LEFT) and self.terre[int((self.perso_y//8))][int(((self.perso_x-1)//8))] <= 0 :
            time.sleep(0.6)
            if self.terre[int((self.perso_y//8))][int(((self.perso_x-1)//8))] == -1:
                self.terre[int((self.perso_y//8))][int(((self.perso_x-1)//8))] = 5
            else :
                self.terre[int((self.perso_y//8))][int(((self.perso_x-1)//8))] = 1 
            
        if pyxel.btn(pyxel.KEY_SPACE) and pyxel.btn(pyxel.KEY_DOWN) and self.terre[int((self.perso_y//8)+1)][int((self.perso_x)//8)] <= 0:
            time.sleep(0.6)
            if self.terre[int((self.perso_y//8)+1)][int((self.perso_x)//8)] == -1:
                self.terre[int((self.perso_y//8)+1)][int((self.perso_x)//8)] = 5
            else :
                self.terre[int((self.perso_y//8)+1)][int((self.perso_x)//8)] = 1
            
        if pyxel.btn(pyxel.KEY_SPACE) and pyxel.btn(pyxel.KEY_UP) and self.terre[int((self.perso_y//8)-1)][int((self.perso_x)//8)] <= 0 :
            time.sleep(0.6)
            if self.terre[int((self.perso_y//8)-1)][int((self.perso_x)//8)] == -1:
                self.terre[int((self.perso_y//8)-1)][int((self.perso_x)//8)] = 5
            else :
                self.terre[int((self.perso_y//8)-1)][int((self.perso_x)//8)] = 1

    def trouver_tresor(self):
        if self.terre[int(((self.perso_y+4)//8))][int((self.perso_x+4)//8)] == 5 :
            self.victoire = True
            
        
    def chrono(self):
         if pyxel.frame_count % 30 == 0 and self.victoire == False:
             self.temps += 1 
    
    def update(self):
        self.bouge()
        self.minage()
        self.trouver_tresor()
        self.chrono()
        
    def draw(self):
        pyxel.cls(0)
        if self.victoire == False:
            for i in range(len(self.terre)):
                for j in range(len(self.terre[i])):
                    if self.terre[i][j] == 2:
                        pyxel.rect(j*8,i*8,8,8,6)
                    elif self.terre[i][j] == 3:
                        pyxel.blt(j*8,i*8, 0, 8, 8, 8, 8)
                    elif self.terre[i][j] == 1:
                        pyxel.blt(j*8,i*8, 0, 8, 0, 8, 8)
                    elif self.terre[i][j] == 0 or self.terre[i][j] == -1:
                        pyxel.blt(j*8,i*8, 0, 0, 8, 8, 8)
                    elif self.terre[i][j] == -2:
                        pyxel.blt(j*8,i*8, 0, 16, 8, 8, 8)
                    elif self.terre[i][j] == 5:
                        pyxel.blt(j*8,i*8, 0, 16, 0, 8, 8)
            pyxel.text(1,1, 'chrono:' + str(self.temps ),8)
            pyxel.blt(self.perso_x, self.perso_y, 0, 0, 0, 8, 8, 0)
        elif self.victoire == True:
            pyxel.text(48,50,'VICTOIRE',10)
            pyxel.text(40,60,'FINI EN : ' + str(self.temps),10)
            
        
App()
        
        
pyxel.run(update,draw)