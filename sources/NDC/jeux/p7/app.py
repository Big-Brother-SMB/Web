import pyxel, time

isPlaying = False
playerPos = [32,64]
playerSprite = [16,8]
toward = 0
jumpState = 0
hearts=3

gold = 0
goldSpriteAnim = [(32,160,8,8),(40,160,8,8),(48,160,8,8),(56,160,8,8)]

jouerColor=8
quitColor=13
posxJouer=64-10
posyJouer=64
posxQuit=64-13
posyQuit=100

niv1Plaftorm = []
collision = []
drapeau = []
cactus = []
goldCoin = [[16,56,0],[24,56,0]]

ti = 0
previousTime = 0
deltaTime = 0


isOnPlatform = False

# Define gravity strength
gravity = 60
jumpCount = 0

pyxel.init(128, 128, title="Platform-Code", fps=60)
pyxel.load("4.pyxres")

def playerDeplacement(playerPos):
    global playerSprite, toward
    if pyxel.btn(pyxel.KEY_RIGHT):
        if (playerPos[0] < 128-8):
            playerPos[0] = playerPos[0] + 40*deltaTime 
            playerSprite = [8,16]
            toward = 0
    elif pyxel.btn(pyxel.KEY_LEFT):
        if (playerPos[0] > 0):
            playerPos[0] = playerPos[0] - 40*deltaTime
            playerSprite = [8,24]
            toward = 1
    else:
        if toward == 0:
            playerSprite = [0,16]
        else:
            playerSprite = [0,24]

    if (pyxel.btn(pyxel.KEY_SPACE) or pyxel.btn(pyxel.KEY_UP)) and isOnPlatform:
        playerPos[1]-= 30
    return playerPos







def updateDeltaTime():
    global deltaTime, ti, previousTime

    deltaTime = ti - previousTime
    previousTime = ti
    ti = time.time()

def resetPlayerPos():
    global playerPos 
    playerPos = [0,48]


def isTitleJouer():
    global isPlaying, jouerColor, quitColor
    if pyxel.mouse_x-25<64-10<pyxel.mouse_x+10 and pyxel.mouse_y-10<64<pyxel.mouse_y+10:
        jouerColor=14
        if pyxel.btn(pyxel.MOUSE_BUTTON_LEFT):
            isPlaying = True
            resetPlayerPos()
            loadLvl1()
    else:
        jouerColor=8    
    if pyxel.mouse_x-30<64-13<pyxel.mouse_x+10 and pyxel.mouse_y-10<100<pyxel.mouse_y+10:
        quitColor=7
        if pyxel.btn(pyxel.MOUSE_BUTTON_LEFT):
            pyxel.quit()
    else:
        quitColor=13

def appendPlateform(liste):
    global niv1Plaftorm, collision
    niv1Plaftorm.append(liste)
    for i in range (niv1Plaftorm[-1][5]):
        for j in range (niv1Plaftorm[-1][6]):
            collision.append[niv1Plaftorm[-1][0]+i,niv1Plaftorm[-1][1]+j]

def loadLvl1():
    global niv1Plaftorm, drapeau
    niv1Plaftorm.append([0,64,0,8,216,8,24])#Début plateforme
    niv1Plaftorm.append([8,64,0,16,216,8,24])#Milieu plateforme
    niv1Plaftorm.append([16,64,0,16,216,8,24])
    niv1Plaftorm.append([24,64,0,16,216,8,24])
    niv1Plaftorm.append([32,64,0,16,216,8,24])
    niv1Plaftorm.append([40,64,0,24,216,8,24])#fin plateforme

    niv1Plaftorm.append([56,56,0,8,208,8,8])#Début plateforme fine
    niv1Plaftorm.append([64,56,0,24,208,8,8])#fin plateforme fine

    niv1Plaftorm.append([88,56,0,8,216,8,24])#Début plateforme
    niv1Plaftorm.append([96,56,0,16,216,8,24])#Milieu plateforme
    niv1Plaftorm.append([104,56,0,16,216,8,24])
    niv1Plaftorm.append([112,56,0,16,216,8,24])
    niv1Plaftorm.append([120,56,0,24,216,8,24])#fin plateforme
    
    drapeau.append([120,48,0,16,168,7,8])#drapeau fin
    cactus.append([104,40,0,0,162,8,16])



def loseHeartCactus():
    global hearts, playerPos, cactus
    for ele in cactus:
        if pyxel.frame_count % 30 == 0:                  
            if playerPos[0] > ele[0] and playerPos[0] < ele[0]+8 or playerPos[0]+8 > ele[0] and playerPos[0] < ele[0]+8:
                if playerPos[1] > ele[1] and playerPos[1] < ele[1]+8 or playerPos[1]+16 > ele[1] and playerPos[1] < ele[1]+16:
                    hearts = hearts-0.5
                    
                

def heartCount():
        if hearts == 3:
            pyxel.blt(1,1,0,48,168,8,8)
            pyxel.blt(10,1,0,48,168,8,8)
            pyxel.blt(19,1,0,48,168,8,8) 
        elif hearts == 2:
            pyxel.blt(1,1,0,48,168,8,8)
            pyxel.blt(10,1,0,48,168,8,8)
            pyxel.blt(19,1,0,56,168,8,8)

        elif hearts == 1:
            pyxel.blt(1,1,0,48,168,8,8)
            pyxel.blt(10,1,0,56,168,8,8)
            pyxel.blt(19,1,0,56,168,8,8)
        
        else: 
            pyxel.blt(1,1,0,56,168,8,8)
            pyxel.blt(10,1,0,56,168,8,8)
            pyxel.blt(19,1,0,56,168,8,8)
            pyxel.text(28,2,'Game Over',8)

        

def isPlayerOk():
    if hearts<= 0:
        return False
    return True

def goldCount():
    global gold, playerPos, goldCoin
    for ele in goldCoin:
        if playerPos[0] > ele[0] and playerPos[0] < ele[0]+8 or playerPos[0]+8 > ele[0] and playerPos[0] < ele[0]+8:
            if playerPos[1] > ele[1] and playerPos[1] < ele[1]+8 or playerPos[1]+8 > ele[1] and playerPos[1] < ele[1]+8:
               gold +=1
               goldCoin.remove(ele)
    pyxel.blt(1,9,0,32,160,8,8)
    pyxel.text(10,10,str(gold),7)

def endLevel():
    global isPlaying
    if playerPos[0] > 120 and playerPos[0] < 127 or playerPos[0]+8 > 120 and playerPos[0] < 127:
        if playerPos[1] > 48 and playerPos[1] < 56 or playerPos[1]+8 > 48 and playerPos[1] < 56:
            pyxel.text(28,2,'Level Finished',8)
            resetLevel()
            isPlaying = False

def resetLevel():
    global goldCoin, gold, hearts
    resetPlayerPos()
    goldCoin = [[16,56,0],[24,56,0]]
    gold = 0
    hearts = 3
    time.sleep(1)


def goldBlit():
    global posxGold, posyGold
    for ele in goldCoin:
        if pyxel.frame_count % 30 == 0:
            if ele[2] <3:
                ele[2]+=1
            else:
                ele[2] = 0
        pyxel.blt(ele[0], ele[1], 0, goldSpriteAnim[ele[2]][0],goldSpriteAnim[ele[2]][1],goldSpriteAnim[ele[2]][2],goldSpriteAnim[ele[2]][3])
        
    
def applyGravity(playerPos):
    if not isStandingOnPlatform():
        playerPos[1] += gravity * deltaTime
    return playerPos

def isStandingOnPlatform():
    global playerPos, isOnPlatform
    
    playerPoint = [playerPos[0]+4, playerPos[1]+8]
    for platform in niv1Plaftorm:
        if (playerPoint[0] > platform[0] and playerPoint[0] < platform[0] + platform[5]) and (playerPoint[1] > platform[1]-2 and playerPoint[1] < platform[1]+2):
            isOnPlatform = True
            playerPos[1] = platform[1]-8
            return True
    isOnPlatform = False
    return False


def update():
    
    global playerPos, isPlaying, hearts

    heartCount()
    updateDeltaTime()
    endLevel()
    loseHeartCactus()
    isPlayerOk()
    if isPlaying == False:
        pyxel.mouse(True)
        isTitleJouer()
    else:
        playerPos = playerDeplacement(playerPos)
        playerPos = applyGravity(playerPos)
        pyxel.mouse(False)

        if playerPos[1] >=120:
            resetPlayerPos()
            hearts -=1



    
    


def draw():
    global isPlaying, playerPos, jouerColor, posxJouer, posyJouer, posxQuit, posyJouer, niv1Plaftorm
    pyxel.cls(0)
    if isPlaying == True:
        


        pyxel.rect(0,0,128,128,5)
        goldCount()
        endLevel()
        for ele in niv1Plaftorm:
            pyxel.blt(ele[0],ele[1],ele[2],ele[3],ele[4],ele[5],ele[6]) #afficher plateformes
            
        for ele in drapeau:
            pyxel.blt(ele[0],ele[1],ele[2],ele[3],ele[4],ele[5],ele[6]) 
        for ele in cactus:
            pyxel.blt(ele[0],ele[1],ele[2],ele[3],ele[4],ele[5],ele[6])
        loseHeartCactus()
        heartCount()
        goldBlit()
        if isPlayerOk() == True:
            pyxel.blt(playerPos[0], playerPos[1],0,playerSprite[0],playerSprite[1],8,8, 5)
    else:
        pyxel.rect(0,0,128,128,1)
        pyxel.text(40,25,'Platform-Code',2)
        pyxel.text(posxJouer,posyJouer,'Jouer',jouerColor)
        pyxel.text(posxQuit,posyQuit,'Quitter',quitColor)

    



        
pyxel.run(update,draw)