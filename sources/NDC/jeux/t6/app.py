import pyxel
import random


class Game:
    def __init__(self):
        pyxel.init(256, 256, title="Nuit du code", fps=30, quit_key=pyxel.KEY_ESCAPE)
        pyxel.load("2.pyxres")
        self.x = 64
        self.y = 64
        self.ennemis_liste = []
        self.cadavres = []  
        self.ennemis_actifs = 0
        self.background = 6
        self.sword = False
        self.sword_counter = 0
        self.sword_frame = 0
        self.sword_frames = [(0, 236, 11, 4), (0, 228, 11, 4), (0, 217, 11, 7), (0, 205, 11, 11)]  
        self.pixel_sword_x = self.x + 6
        self.pixel_sword_y = self.y + 8
        self.pv = 300
        self.points = 0  
        self.game_over = False  
        pyxel.run(self.update, self.draw)
   
    def ennemis_creation(self):
        if (pyxel.frame_count % 120 == 0):
            x_range = range(int(self.x) + 20, int(self.x) + 80)  # Convertir les coordonnées en entiers
            y_range = range(int(self.y) + 20, int(self.y) + 80)
            self.ennemis_liste.append([random.choice(x_range), random.choice(y_range)])


   
    def ennemis_deplacement(self):
        for ennemi in self.ennemis_liste:
            if ennemi[0] < self.x:
                ennemi[0] += 1
            elif ennemi[0] > self.x:
                ennemi[0] -= 1
            if ennemi[1] < self.y:
                ennemi[1] += 1
            elif ennemi[1] > self.y:
                ennemi[1] -= 1
           
    def ennemis_suppression(self):
        ennemis_non_supprimes = []
        for ennemi in self.ennemis_liste:
            if self.sword == True and abs(self.pixel_sword_x - ennemi[0]) <= 5 and abs(self.pixel_sword_y - ennemi[1]) <= 5:
                self.cadavres.append([ennemi[0], ennemi[1], pyxel.frame_count])  
                self.points += 1  
                continue  
            ennemis_non_supprimes.append(ennemi)  
        self.ennemis_liste = ennemis_non_supprimes  




    def cadavres_suppression(self):
        cadavres_non_supprimes = []
        for cadavre in self.cadavres:
            if pyxel.frame_count - cadavre[2] > 180:  
                continue
            cadavres_non_supprimes.append(cadavre)  
        self.cadavres = cadavres_non_supprimes  




    def deplacement(self):
        if pyxel.btn(pyxel.KEY_RIGHT) and self.x < 243:
            self.x += 0.75
        if pyxel.btn(pyxel.KEY_LEFT) and self.x > 0:
            self.x += -0.75
        if pyxel.btn(pyxel.KEY_DOWN) and self.y < 240:
            self.y += 0.75
        if pyxel.btn(pyxel.KEY_UP) and self.y > 0:
            self.y += -0.75
   
    def attaque(self):
        if pyxel.btnp(pyxel.KEY_SPACE):
            self.sword = True
            self.sword_counter = 15  




        if self.sword:
            self.sword_counter -= 1
            if self.sword_counter % 4 == 0:  
                self.sword_frame = (self.sword_frame + 1) % len(self.sword_frames)
            if self.sword_counter <= 0:
                self.sword = False
                self.sword_frame = 0
       
    def update(self):
        if not self.game_over:  
            self.deplacement()
            self.attaque()
            self.ennemis_creation()
            self.ennemis_deplacement()
            self.ennemis_suppression()
            self.cadavres_suppression()
            # Vérification des collisions
            if self.sword:  # Vérifier la collision uniquement lorsque l'épée est active
                for ennemi in self.ennemis_liste:
                    if abs(ennemi[0] - self.x) < 10 and abs(ennemi[1] - self.y) < 10:
                        self.pv -= 5  # Dégâts lorsque touché par un ennemi
                        if self.pv <= 0:
                            self.game_over = True
        if self.pv <= 0:  
            self.game_over = True


       
    def draw(self):
        pyxel.cls(self.background)
        pyxel.pal(5,self.background)
        pyxel.blt(self.x, self.y, 0, 2, 8, 12, 16)
        if self.sword:
            u, v, w, h = self.sword_frames[self.sword_frame]
            self.pixel_sword_y = self.y + 5 - (len(self.sword_frames) - 1 - self.sword_frame) * 2  
            self.pixel_sword_x = self.x + 12
            pyxel.blt(self.pixel_sword_x, self.pixel_sword_y, 0, u, v, w, h)  
        for ennemi in self.ennemis_liste:
            pyxel.blt(ennemi[0], ennemi[1], 0, 2, 184, 11, 15)  
        for cadavre in self.cadavres:
            pyxel.blt(cadavre[0], cadavre[1], 0, 51, 190, 10, 10)  
        pyxel.rect(10, 10, self.pv * 2, 10, 8)  
        pyxel.text(10, 20, "Score: " + str(self.points), 8)  # Affichage du score
        if self.game_over:  
            pyxel.text(128, 128, "Game Over, Appuie sur ECHAP", pyxel.frame_count % 16)
            pyxel.text(128, 138, "Score: " + str(self.points), pyxel.frame_count % 16)


Game()

