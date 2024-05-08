import pyxel
import random

pyxel.init(128, 128, title="Super Jeu")
pyxel.load('resfruits.pyxres')

#Lancement de la musique
pyxel.playm(0, loop=True)
########################################
# FONCTIONs GERANT LES ELEMENTS DU JEU #
#######################################
#affichage du score et du niveau actuel
def statique() :
    pyxel.text(100,10,str(score) + " PT",10)
    pyxel.text(10,10,"LEVEL " + str(niv),8)    

#Permet de remettre les balles(astéroides et points) en haut
def bouge_balle():
    global x, y, vx, vy, v2x, v2y, y2, x2, y3, x3, v3y, v2x, v3x, y4, v4x, v4y, x4
# Gestion des rebonds
    if y > 127: ##or y2 < 1 or y2 > 127
        y = 0
        x = random.randint(0, 110)
    if y2 > 127:
        y2 = 0
        x2 = random.randint(0, 110)
    if y3 > 127:
        y3 = 0
        x3 = random.randint(0, 110) 
    if y4 > 127:
        y4 = 0
        x4 = random.randint(0, 110) 
# Mise à jour des coordonnées
    y = y + vy
    y2 = y2 + v2y
    y3 = y3 + v3y
    y4 = y4 + v4y
 
#Affichage des balles (astéroides et points)    
def affiche_balle():
    pyxel.blt(x, y, 0, 16, 0, 16, 16)
    
def affiche_balle3():
    pyxel.blt(x3, y3, 0, 8, 0, 8, 8)   
    
def affiche_balle4():
    pyxel.blt(x4, y4, 0, 48, 0, 16, 16)    
    
def affiche_balle2():
    pyxel.blt(x2, y2, 0, 32, 0, 16, 16)
    
def fond():    
    pyxel.blt(0, 105, 0, 0, 32, 32, 32, 0)

#Permet de controler le vaisseau horizontalement
def bouge_vaisseau():
    """Déplacement avec les touches directionnelles"""
    global vaisseau_x, vaisseau_y, vaisseau_2x, vaisseau_2y
    if pyxel.btn(pyxel.KEY_RIGHT):
        if (vaisseau_x < 109.5) :
            vaisseau_x = vaisseau_x + 3.5
            vaisseau_2x = vaisseau_2x + 3.5
    if pyxel.btn(pyxel.KEY_LEFT):
        if (vaisseau_x > 51.5) :
            vaisseau_x = vaisseau_x - 3.5
            vaisseau_2x = vaisseau_2x - 3.5

#affichage des vaisseaux
def affiche_vaisseau():
    pyxel.blt(vaisseau_x, vaisseau_y, 0, 48, 16, 16, 16, 0)
           
def affiche_vaisseau2():
    pyxel.blt(vaisseau_2x, vaisseau_2y, 0, 48, 16, 16, 16, 0)           
  
 #Permet de calculer le carré de la distance entre 2 points   
def calculer_distance(x_A, y_A, x_B, y_B):
    """renvoie le carré de la distance entre deux points"""
    return (x_B - x_A)**2 + (y_B - y_A)**2
    
#Permet d'ajouter +1 au score, de la vitesse et augmenter de niveau quand le vaisseau prend un point(pièce jaune)    
def attraper_objet():
    global calculer_distance , vaisseau_x , vaisseau_y , x3 , y3 , score , v2y, vitesse, vy, v3y, niv
    if calculer_distance(vaisseau_x , vaisseau_y , x3 , y3) <128 or calculer_distance(vaisseau_2x, vaisseau_2y, x3, y3) <128:
        score = score + 1
        pyxel.play(0, 2)
        pyxel.playm(1, loop=True)
        affiche_balle3 = False
        x3= random.randrange(10,120)
        y3=5
        if (score != 0) and ((score % 3) == 0):
            niv = niv + 1
            v2y = v2y + 0.25
            vy = vy + 0.25
            v3y = v3y + 0.25
            vitesse = vitesse + 1
##################
# GESTION DU JEU #
#################
#Permet d'arréter le jeu quand le vaisseau touche un astéroide
fin = False

def update():
    global fin
    bouge_balle()
    bouge_vaisseau()
    if calculer_distance(x, y, vaisseau_x, vaisseau_y) < 128 or calculer_distance(x, y, vaisseau_2x, vaisseau_2y) < 128 or calculer_distance(x2, y2, vaisseau_x, vaisseau_y) < 150 or calculer_distance(x2, y2, vaisseau_2x, vaisseau_2y) < 150 or calculer_distance(x4, y4, vaisseau_x, vaisseau_y) < 150 or calculer_distance(x4, y4, vaisseau_2x, vaisseau_2y) < 150:
        fin = True
        pyxel.stop()
        pyxel.play(0, 0)
    attraper_objet()


#Affichage du Game Over, des points et du niveau attient quand la partie est fini    
def draw():
    pyxel.cls(0)
    if fin:
        pyxel.text(40, 60, "!    ", 7)
        pyxel.text(40, 60, "  GAME", 5)
        pyxel.text(65, 60, " OVER", 7)
        pyxel.text(65, 60, "      !", 5)
        pyxel.text(20, 72, "Votre Score est de :", 7)
        pyxel.text(105, 72, str(score)+ " PT" , 5)
        pyxel.text(10, 48, "Vous avez atteint le", 5)
        pyxel.text(90, 48, " LEVEL "+str(niv) , 7)
    else:
        affiche_balle()
        affiche_balle2()
        affiche_balle3()
        affiche_balle4()
        affiche_vaisseau()
        affiche_vaisseau2()
        statique()
########################
# PROGRAMME PRINCIPAL #
########################
# Coordonnées initiales des astéroides
x = random.randrange(10,120)
y = 25
x2 = random.randrange(10,120)
y2 = 25
x3 = random.randrange(10,120)
y3 = 25
x4 = random.randrange(10,120)
y4 = 25
# Vitesse initial des astéroides
vx = 0.5
vy = 0.5
v2x = 1
v2y = 1
v3x = 0.5
v3y = 0.5
v4x = 1.5
v4y = 1.5
# position initiale des vaisseaux, et valeur inital du score et du niveau
# (origine des positions : coin haut gauche)
vaisseau_x = 80
vaisseau_y = 112
score = 0
niv = 1
vaisseau_2x = 30
vaisseau_2y = 112
# Lancement du jeu
pyxel.run(update, draw)