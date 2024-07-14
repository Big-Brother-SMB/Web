import pyxel
class jeu:
    def __init__(self):
        pyxel.init(128,128, title="ndc")
        pyxel.load("3.pyxres")

        self.perso_x = 60
        self.perso_y = 60
        self.vie = 3
        self.tir = []
        self.ennemis_liste = []
        self.munition = 10
        self.sound_id = pyxel.play(0, [1], loop=True)
        pyxel.run(self.update, self.draw)
        
        
    def update(self):
        self.perso_mouvement()
        self.apparition_tir()
        self.tir_deplacement()

    def draw(self):
        pyxel.cls(0)
        if self.vie > 0:
            """vie"""
            if self.vie == 3:
                pyxel.blt(5,1,0,51,203,10,10,5)
                pyxel.blt(15,1,0,51,203,10,10,5)
                pyxel.blt(25,1,0,51,203,10,10,5)
            if self.vie == 2:
                pyxel.blt(5,1,0,51,203,10,10,5)
                pyxel.blt(15,1,0,51,203,10,10,5)
            if self.vie == 1:
                pyxel.blt(5,1,0,51,203,10,10,5)
            """mouv"""
            pyxel.blt(self.perso_x,self.perso_y,0,2,9,14,14,5)

            """munition"""
            pyxel.text(40,1, 'munition:' + str(self.munition ),4)
            for tir in self.tir:
                pyxel.rect(tir[0], tir[1], 1, 4, 10)
        else:
            pyxel.text(50,64, 'GAME OVER', 7)
    
    def perso_mouvement(self):
        if pyxel.btn(pyxel.KEY_RIGHT) and self.perso_x<120:
            self.perso_x += 1
        if pyxel.btn(pyxel.KEY_LEFT) and self.perso_x>0:
            self.perso_x += -1
        if pyxel.btn(pyxel.KEY_DOWN) and self.perso_y < 115:
            self.perso_y += 1
        if pyxel.btn(pyxel.KEY_UP) and self.perso_y>0:
            self.perso_y += -1
        if (pyxel.frame_count % 10 == 0) and self.perso_y < 115:
            self.perso_y += 1
     
            

    def apparition_tir(self):
         if pyxel.btnr(pyxel.KEY_SPACE) and self.munition > 0:
            self.tir.append([self.perso_x+4, self.perso_y-4])
            self.munition -= 1

    def tir_deplacement(self):
        for tir in self.tir:
            tir[1] -= 1
            if  tir[1]<-8:
                self.tir.remove(tir)
    
    
    def bonus (self):
        
        if self.perso_x == self.bonus_x and self.perso_y == self.bonus_y and self.vie < 3 :
            self.vie += 1
            self.dispartion_bonus()


jeu()