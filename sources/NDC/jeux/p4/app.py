import pyxel
import time
pyxel.init(128,128, title="Bienvenue dans notre chasse au trésor aquatique !!!")

def update():
    if pyxel.btnp(pyxel.KEY_Q):
        pyxel.quit()
       
global perso_x, perso_y, poisson_x, poisson_y
perso_x = 25
perso_y = 60
poisson1_x = 124
poisson2_x = 124
poisson3_x = 124
poisson1_y = pyxel.rndi(0,124)
poisson2_y = pyxel.rndi(0,124)
poisson3_y = pyxel.rndi(0,124)
nb_poisson1 = 0
nb_poisson2 = 0
nb_poisson3 = 0
nb_requin = 0
requin_x = 124
requin_y = pyxel.rndi(0, 124)
piece_x = 124
piece_y = pyxel.rndi(0,124)
nb_piece = 0
vies = 5
liste_poissons1= [[poisson1_x, poisson1_y, nb_poisson1]]
liste_poissons2= [[poisson2_x, poisson2_y, nb_poisson2]]
liste_poissons3= [[poisson3_x, poisson3_y, nb_poisson3]]
liste_requins=[[requin_x, requin_y, nb_requin]]
liste_piece=[[piece_x, piece_y, nb_piece]]

def draw():
    pyxel.load("theme2.pyxres")
    pyxel.bltm(0,0, 0, 0, 257, 128, 128)
    # personnage principal
    global perso_x, perso_y
    perso_x = deplacement_perso(perso_x, perso_y)[0]
    perso_y = deplacement_perso(perso_x, perso_y)[1]
    principal = pyxel.blt(perso_x,perso_y, 0, 32, 0, 16, 16, 0)
   
    # poissons ennemis
    global poisson1_x,poisson1_y
    poisson1_x = deplacement_poisson1(poisson1_x, poisson1_y)[0]
    poisson1_y = deplacement_poisson1(poisson1_x, poisson1_y)[1]
    poissons1 = pyxel.blt(poisson1_x,poisson1_y,0,0, 16, 16, 16, 0)
    
    global poisson2_x,poisson2_y
    poisson2_x = deplacement_poisson2(poisson2_x, poisson2_y)[0]
    poisson2_y = deplacement_poisson2(poisson2_x, poisson2_y)[1]
    poissons2 = pyxel.blt(poisson2_x,poisson2_y,0,16, 16, 16, 16, 0)
    
    global poisson3_x,poisson3_y
    poisson3_x = deplacement_poisson3(poisson3_x, poisson3_y)[0]
    poisson3_y = deplacement_poisson3(poisson3_x, poisson3_y)[1]
    poissons3 = pyxel.blt(poisson3_x,poisson3_y,0,0, 32, 16, 16, 0)

    # requins ennemis
    global requin_x, requin_y
    requin_x = deplacement_requin(requin_x, requin_y)[0]
    requin_y = deplacement_requin(requin_x, requin_y)[1]
    requins = pyxel.blt( requin_x,requin_y,0, 32, 16, 16, 16, 0)
   

    # pieces
    global piece_x, piece_y
    piece_x = deplacement_piece(piece_x, piece_y)[0]
    piece_y = deplacement_piece(piece_x, piece_y)[1]
    pieces = pyxel.blt(piece_x,piece_y,0,0,0,16,16, 0)
   
    global vies
    pyxel.text( 5,3, "score : " + str(nb_piece), 0)
    pyxel.text( 5,10, "vies : " + str(vies), 0)
   
    # appels des fonctions lors de la collision
    touche_piece(perso_x, perso_y, piece_x, piece_y)
    touche_poisson1(perso_x, perso_y, poisson1_x, poisson1_y)
    touche_poisson2(perso_x, perso_y, poisson2_x, poisson2_y)
    touche_poisson3(perso_x, perso_y, poisson3_x, poisson3_y)
    touche_requin(perso_x, perso_y, requin_x, requin_y)
   
    generer_poissons1(liste_poissons1)
    generer_poissons2(liste_poissons2)
    generer_poissons3(liste_poissons3)   
    generer_requins(liste_requins )
    generer_pieces(liste_piece)


#deplacement du personnage de haut en bas
def deplacement_perso(x, y):
    if pyxel.btn(pyxel.KEY_UP) == True :
         y -= 2
    if pyxel.btn(pyxel.KEY_DOWN) == True :
         y += 2
    return x, y

#deplacement des poissons
def deplacement_poisson1(x,y):
    x -= 1
    y=y
    return x,y
    
def deplacement_poisson2(x,y):
    x -= 1
    y=y
    return x,y

def deplacement_poisson3(x,y):
    x -= 1
    y=y
    return x,y
   
def creation():
    while piece < 10 :
         liste_poissons.append(deplacement_poisson(x,y)[0],deplacement_poisson(x,y)[1],nb_poisson + 1)
    time.sleep(5)
   
   
   
   

#deplacements des requin
def deplacement_requin(x,y):
    x -= 2
    y=y
    return x,y

#deplacements pieces
def deplacement_piece(x,y):
    x -= 1
    y=y
    return x,y

# generer les entites
def generer_poissons1(liste_poissons1):
    if pyxel.frame_count % 30 == 0 and len(liste_poissons1) < 10 :
        liste_poissons1.append([piece_x, piece_y])
    return liste_poissons1

def generer_poissons2(liste_poissons2):
    if pyxel.frame_count % 30 == 0 and len(liste_poissons2) < 10 :
        liste_poissons2.append([piece_x, piece_y])
    return liste_poissons2

def generer_poissons3(liste_poissons3):
    if pyxel.frame_count % 30 == 0 and len(liste_poissons3) < 10 :
        liste_poissons3.append([piece_x, piece_y])
    return liste_poissons3

def generer_requins(liste_requins ):
    if pyxel.frame_count % 30 == 0 and len(liste_requins) < 10 :
        liste_requins.append([piece_x, piece_y])
    return liste_requins

def generer_pieces(liste_piece):
    if pyxel.frame_count % 30 == 0 and len(liste_piece) < 10 :
        liste_piece.append([piece_x, piece_y])
    return liste_piece


#Quand le perso touche quelque chose
def touche_piece(perso_x, perso_y, piece_x, piece_y):
    global nb_piece
    if perso_x+5 >piece_x> perso_x and (perso_y +5>piece_y >perso_y or perso_y +5>piece_y +5>perso_y):
       nb_piece =nb_piece + 1/4
    if nb_piece == 10 :
        "afficher le tresor"
        pass
       
       
def touche_requin(perso_x, perso_y, requin_x, requin_y):
    global vies
    if perso_x+5 >requin_x> perso_x and (perso_y +5>requin_y >perso_y or perso_y +5>requin_y +5>perso_y):
        vies = 0
    if vies == 0 :
        pyxel.quit()


def touche_poisson1(perso_x, perso_y, poisson1_x, poisson1_y):
    global vies
    if perso_x+5 >poisson1_x> perso_x and (perso_y +5>poisson1_y >perso_y or perso_y +5>poisson12_y +5>perso_y):
         vies -= 1/4
    if vies == 0:
         pyxel.quit()
         
def touche_poisson2(perso_x, perso_y, poisson2_x, poisson2_y):
    global vies
    if perso_x+5 >poisson2_x> perso_x and (perso_y +5>poisson2_y >perso_y or perso_y +5>poisson2_y +5>perso_y):
         vies -= 1/4
    if vies == 0:
         pyxel.quit()
         
def touche_poisson3(perso_x, perso_y, poisson3_x, poisson3_y):
    global vies
    if perso_x+5 >poisson3_x> perso_x and (perso_y +5>poisson3_y >perso_y or perso_y +5>poisson3_y +5>perso_y):
         vies -= 1/4
    if vies == 0:
         pyxel.quit()













pyxel.run(update, draw)