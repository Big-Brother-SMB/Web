import pyxel

pyxel.init(128, 128, title = "Titre du jeu")

pyxel.load("4.pyxres")

player_x, player_y = 16, 104

level = 0

gravity = 1

air_time = 0

glitches = []

def player_movements(x, y, air_time):
    """movements of the player"""
    if pyxel.btn(pyxel.KEY_D) and not is_colliding(x, y) == "east" and x < 120:
        x += 1
    if pyxel.btn(pyxel.KEY_Q) and not is_colliding(x, y) == "west" and x > 0:
        x -= 1
    if pyxel.btnp(pyxel.KEY_SPACE, 0, 30) and not is_colliding(x, y) == "north":
        y -= 20
    if not is_colliding(x, y) == "south" and y < 128:
        if pyxel.btn(pyxel.KEY_S):
            y += gravity
        if pyxel.frame_count % 6:
            y += gravity + int(air_time / 16)
        air_time += gravity / 2
    else:
        air_time = 0
    if pyxel.btnp(pyxel.KEY_R) or y > 120: # =     =     =     =     =     =     =     =     =     =     or killzone
        x, y = spawn
        air_time = 0
    return x, y, air_time

def dash(direction, cooldown):
    None

def is_colliding(x, y):
    x1, y1 = pyxel.tilemaps[0].pget(int(x // 8) + 16 * level, int(y // 8))
    if x1 >= 0 and x1 <= 17 and y1 >= 25 and y1 <= 31:
        glitches.append([x, y])
    x1, y1 = pyxel.tilemaps[0].pget(int(x // 8) + 16 * level, int(y // 8) - 1)
    if x1 >= 0 and x1 <= 17 and y1 >= 25 and y1 <= 31:
        return "north"
    x1, y1 = pyxel.tilemaps[0].pget(int(x // 8) - 1 + 16 * level, int(y // 8))
    if x1 >= 0 and x1 <= 17 and y1 >= 25 and y1 <= 31:
        return "west"
    x1, y1 = pyxel.tilemaps[0].pget(int(x // 8) + 1 + 16 * level, int(y // 8))
    if x1 >= 0 and x1 <= 17 and y1 >= 25 and y1 <= 31:
        return "east"
    x1, y1 = pyxel.tilemaps[0].pget(int(x // 8) + 16 * level, int(y // 8) + 1)
    if x1 >= 0 and x1 <= 17 and y1 >= 25 and y1 <= 31:
        return "south"

def update():
    global spawn, player_x, player_y, gravity, air_time, level, glitches
    
    if pyxel.btnp(pyxel.KEY_ESCAPE):
        pyxel.quit()
    
    if level < 3:
        spawns = [(16, 104), (32, 16), (8, 16), (0, 0)]
        spawn = spawns[level]
        
        ends = [(13, 11), (1, 11), (14, 11), (0, 0)]
        end = ends[level]
        
        stars = [(8, 56), ()]
        
        if player_x // 8 == end[0] and player_y // 8 == end[1]:
            level += 1
            player_x, player_y, = spawns[level]
        
        player_x, player_y, air_time = player_movements(player_x, player_y, air_time)
    

def draw() :
    pyxel.cls(0)
    
    if level < 3:
        pyxel.bltm(0, 0, 0, level * 128, 0, 128, 128)
        
        for elt in glitches:
            pyxel.blt(elt[0], elt[1], 0, 24, 184, 8, 8)
        pyxel.blt(player_x, player_y, 0, 0, 16, 8, 8, 5)
    
    else:
        pyxel.bltm(0, 0, 0, 0, 128, 128, 128)
        
        pyxel.text(34, 65, "CONGRATULATIONS", 7)

pyxel.run(update, draw)