import pyxel
a = 5
b = 5


class App:
    def __init__(self):
        pyxel.init(256, 256, title="Nuit du Code")
        pyxel.load("res.pyxres")
        self.x = 150
        self.y = 150
        self.speed = 5
        pyxel.run(self.update, self.draw)
        
        
        
        
    def update(self):
        
        
        
        if pyxel.btn(pyxel.KEY_LEFT) == True:
            self.x = (self.x - self.speed)
          
        if pyxel.btn(pyxel.KEY_RIGHT) == True:
            self.x = (self.x + self.speed) 
            
        if pyxel.btn(pyxel.KEY_UP) == True:
            self.y = (self.y - self.speed) 
            
        if pyxel.btn(pyxel.KEY_DOWN) == True:
            self.y = (self.y + self.speed) 
        print(pyxel.frame_count * 3 / 100)
        
        
        if pyxel.pget(127.5,127.5) == 4:
            a = 127.5
            b = 128
            pyxel.playm(2)
            for i in range(100000000000):
                self.x = self.x
                self.y = self.y
            pyxel.quit()
            
        if pyxel.pget(127.5,127.5) == 14:
            a = 127.5
            b = 128
            
            pyxel.quit()
            
        if pyxel.pget(127.5,127.5) == 9:
            a = 127.5
            b = 128
            pyxel.quit()
            
        print(pyxel.pget(127.5,127.5))
        
        if pyxel.frame_count < 1:
            pyxel.playm(3,False,True) 
        
        
        
    def draw(self):
        pyxel.cls(0)
        pyxel.bltm(0, 0, 0, self.x , self.y , 255, 255)
        pyxel.blt(127.5, 127.5, 0, 0, 0, 16, 16, 11)
        if pyxel.btn(pyxel.KEY_LEFT) == True:
            pyxel.blt(127.5, 127.5, 0, 0, 0, 16, 16, 11)
        if pyxel.btn(pyxel.KEY_RIGHT) == True:
            pyxel.blt(127.5, 127.5, 0, 0, 16, 16, 16, 11)
        pyxel.text(a,b, str(pyxel.frame_count * 3 / 100), 7)
       
        
        #pyxel.blt(200, 20, 0, 16, 0, 15, 15, 11)
        
App()