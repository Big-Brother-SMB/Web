import pyxel
pyxel.init(128,128,"chasse")
pyxel.load("theme2.pyxres")

#player
player_speed = 0
player_x = 16
player_y = 82
checkpoint = [16, 82]
orrientation = 1
moving = 0

def player_movement(x, y, scroll, orrientation, moving):
    if pyxel.btn(pyxel.KEY_RIGHT) and not(block_collision_left()):
        if x < 120:
            orrientation = 1
            moving = 1
            x = x + 2
            if scroll_right():
                x = x - 2
                scroll = scroll - 2
        
    if pyxel.btn(pyxel.KEY_LEFT) and not(block_collision_right()):
        if x > 0:
            orrientation = 0
            moving = 1
            x = x - 2
            if scroll_left():
                x = x + 2
                scroll = scroll + 2
    if not(pyxel.btn(pyxel.KEY_LEFT)) and not(pyxel.btn(pyxel.KEY_RIGHT)):
        moving = 0
    return x, y, scroll, orrientation, moving

#jump
jump_frame = 1
jump_left = 0

def jump(jump_frame, jump_left):
    if jump_left == 1:
        if pyxel.btn(pyxel.KEY_UP) and jump_frame > 0:
            return 0.85*jump_frame - jump_frame // 2, jump_frame-1, jump_left
        else:
            jump_left = 0
            
    return 0, jump_frame, jump_left

#block
block_list = []
block_list.append([0, 96, 56, 32, 3])
block_list.append([0, 0, 2048, 48, 3])
block_list.append([0, 0, 8, 128, 3])
block_list.append([40, 83, 16, 13, 3])
block_list.append([64, 75, 16, 40, 3])
block_list.append([88, 67, 16, 48, 3])
block_list.append([112, 75, 16, 40, 3])
block_list.append([136, 83, 16, 13, 3])
block_list.append([136, 96, 88, 32, 3])
block_list.append([192, 64, 32, 32, 3])
block_list.append([256, 96, 152, 32, 3])
block_list.append([304, 88, 56, 8, 3])
block_list.append([312, 80, 40, 8, 3])
block_list.append([320, 72, 24, 8, 3])
block_list.append([416, 64, 128, 24, 3])
block_list.append([416, 96, 128, 16, 3])
block_list.append([408, 120, 152, 8, 3])
block_list.append([536, 48, 8, 58, 3])
block_list.append([560, 112, 8, 16, 3])
block_list.append([568, 104, 8, 24, 3])
block_list.append([576, 96, 72, 32, 3])
block_list.append([592, 80, 16, 16, 3])
block_list.append([664, 80, 8, 16, 3])
block_list.append([696, 80, 8, 16, 3])
block_list.append([728, 80, 32, 16, 3])
block_list.append([728, 96, 1000, 32, 3])
block_list.append([872, 0, 8, 128, 3])

def block_collision_top_inside():
    delta_y = 0
    for block in block_list:
        if (player_y+8 > block[1] and player_y+8 <= block[1] + block[3]/2) and player_x+8 > block[0] and player_x < block[0] + block[2] :
            delta_y = player_y+8 - block[1]
    return delta_y
    
def block_collision_top():
    collision = False
    for block in block_list:
        if player_y+8 == block[1]and player_x+8 > block[0] and player_x < block[0] + block[2] :
            collision = True
    return collision

def block_collsion_bottom():
    collision = False
    for block in block_list:
        if player_y == block[1] + block[3] and player_x+8 > block[0] and player_x < block[0] + block[2]:
            collision = True
    return collision
    
def block_collision_bottom_inside():
    delta_y = 0
    for block in block_list:
        if (player_y < block[1] + block[3] and player_y >= block[1] + block[3] - block[3]/2) and player_x+8 > block[0] and player_x < block[0] + block[2] :
            delta_y = block[1] + block[3] - player_y - 2
    return delta_y

def block_collision_left():
    collision = False
    for block in block_list:
        if player_y + 8 > block[1] and player_y < block[1]+block[3]-1 and player_x + 8 == block[0]:
            collision = True
            return collision

def block_collision_right():
    collision = False
    for block in block_list:
        if player_y > block[1]-8 and player_y < block[1]+block[3] and player_x == block[0] + block[2]:
            collision = True
            return collision

#ladder
ladder_list = []
ladder_list.append([184, 64, 8, 32, 9])
ladder_list.append([408, 64, 8, 56, 9])
ladder_list.append([656, 80, 8, 16, 9])
ladder_list.append([688, 80, 8, 16, 9])
ladder_list.append([720, 80, 8, 16, 9])

def ladder_collision(y):
    top = False
    for ladder in ladder_list:
        if player_x + 8 >= ladder[0] and player_x <= ladder[0] + ladder[2] - 1 and player_y + 8 > ladder[1] and player_y <= ladder[1] + ladder[3] -1:
            if pyxel.btn(pyxel.KEY_SPACE):
                y = y - 3
        elif (player_y + 8 == ladder[1] or player_y + 8 == ladder[1] + 1)and player_x + 8 >= ladder[0] and player_x <= ladder[0] + ladder[2] - 1:
            top = True
            if pyxel.btn(pyxel.KEY_DOWN):
                y = y + 3
    return y, top

#spikes
deaths = 0
danger_list = []
danger_list.append([56, 110, 80, 4, 8])
danger_list.append([224, 108, 32, 4, 8])
danger_list.append([648, 116, 1000, 4, 8])

def spike_collision():
    for danger in danger_list:
        if player_x + 8 >= danger[0] and player_x <= danger[0] + danger[2] - 1 and player_y + 8 > danger[1] and player_y <= danger[1] + danger[3] -1:
            return True

#scrolling
borders = [20, 88]
scroll = 0

def scroll_left():
    if player_x == borders[0] and scroll < 0:
        for block in block_list:
            block[0] = block[0] + 2
        
        for ladder in ladder_list:
            ladder[0] = ladder[0] + 2
            
        for coin in coin_list:
            coin[0] = coin[0] + 2
            
        for danger in danger_list:
            danger[0] = danger[0] + 2
        
        level[0] = level[0] + 2
        
        return True

def scroll_right():
    if player_x == borders[1]:
        for block in block_list:
            block[0] = block[0] - 2
        
        for ladder in ladder_list:
            ladder[0] = ladder[0] - 2

        for coin in coin_list:
            coin[0] = coin[0] - 2
    
        for danger in danger_list:
            danger[0] = danger[0] - 2
        
        level[0] = level[0] - 2
        
        return True
    
def scroll_reset(scroll):
    for block in block_list:
        block[0] = block[0] - scroll
        
    for ladder in ladder_list:
        ladder[0] = ladder[0] - scroll
    
    for coin in coin_list:
        coin[0] = coin[0] - scroll
            
    for danger in danger_list:
        danger[0] = danger[0] - scroll
        
    level[0] = level[0] - scroll
        
#animation
        
def animation_timer():
    return pyxel.frame_count%4

#sprite
level = [0, 0, 0, 0, 0, 2048, 128]

#coin
coin_total = 0
coin_list = []

coin_list.append([160, 88, 8, 8, 7])
coin_list.append([552, 112, 8, 8, 7])
coin_list.append([712, 64, 8, 8, 7])

def coin_collision():
    for coin in coin_list:
        if player_x + 8 >= coin[0] and player_x <= coin[0] + coin[2] - 1 and player_y + 8 > coin[1] and player_y <= coin[1] + coin[3] -1:
            coin_list.remove(coin)
            return True

#-------------------------------#

def update():
    global player_x, player_y, block_list, jump_frame, jump_left, deaths, scroll, orrientation, moving, level, coin_total, chest_list, win
    
    player_x, player_y, scroll, orrientation, moving = player_movement(player_x, player_y, scroll, orrientation, moving)
    
    delta_y, jump_frame, jump_left = jump(jump_frame, jump_left)
    player_y = player_y - delta_y
    
    player_y, ladder_top = ladder_collision(player_y)
    
    if block_collision_top_inside() != 0:
        player_y = player_y - block_collision_top_inside()
        
    if block_collision_bottom_inside() != 0:
        player_y = player_y + block_collision_bottom_inside()
        
    if block_collision_top() or ladder_top:
        jump_left = 1
        jump_frame = 15
    else:
        player_y += 2
        
    if block_collsion_bottom():
        jump_left = 0
    
    if spike_collision():
        deaths += 1
        player_x, player_y = checkpoint
        scroll_reset(scroll)
        scroll = 0
    
    if coin_collision():
        coin_total = coin_total + 1
        
    
def draw():
    pyxel.cls(0)
    pyxel.bltm(level[0], level[1], level[2], level[3], level[4], level[5], level[6])
    
    if moving == 0:
        if orrientation == 1:
            pyxel.blt(player_x, player_y, 0, 0, 120, 8, 8, 0)
        
        else:
            pyxel.blt(player_x, player_y, 0, 0, 120, -8, 8, 0)
    
    else:
        if orrientation == 1:
            if animation_timer() <= 1:
                pyxel.blt(player_x, player_y, 0, 8, 120, 8, 8, 0)
            
            else:
                pyxel.blt(player_x, player_y, 0, 0, 120, 8, 8, 0)
        
        else:
            if animation_timer() >= 2:
                pyxel.blt(player_x, player_y, 0, 8, 120, -8, 8, 0)
            
            else:
                pyxel.blt(player_x, player_y, 0, 0, 120, -8, 8, 0)
    
    for coin in coin_list:
        pyxel.blt(coin[0], coin[1], 0,  32, 136 ,8, 8)
    
    pyxel.text(5,5, "Mort: " + str(deaths), 7)
    pyxel.text(5,15, "Piece: " + str(coin_total), 7)

pyxel.run(update, draw)