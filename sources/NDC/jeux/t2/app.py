
import pyxel
import random

class App:
    def __init__(self):
        pyxel.init(256,256, title="Nuit Du Code")
        self.x = 0
        self.xx = 0
        self.vitesse = 3
        self.xcube = 40
        pyxel.run(self.update, self.draw)
        self.score = 0
        self.partiefini = False
       
    def update(self):
        self.x = (self.x - self.vitesse) % pyxel.width
        self.xx = (self.xx - self.vitesse) % pyxel.width
       
    def draw(self):
        pyxel.cls(5)
        pyxel.rect(0,210,256, 50, 7)
        pyxel.rect(self.xcube,190,20,20,14)
        pyxel.rect(self.x, 195, 3, 15, 13)
        pyxel.rect(self.xx, 195, 3, 15, 13)
       
         
   
    def jeu(self):
        if pyxel.btnp(pyxel.KEY_UP):
            saut()
            self.score = self.score + 1 
            
            
            
       
    def menu(self):
        if btn(KEY_ESCAPE) == True:
            pyxel.quit()
   
   
   
   
    def saut(self):
        while self.xcube != 80:
            self.xcube = (self.xcube + 4) % pyxel.width
        while self.xcube != 40:
            self.xcube = (self.xcube + 4) % pyxel.width
   
   
App()
