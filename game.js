var width = 320,
//width of the canvas
  height = 480,
//height of the canvas
gLoop,
points = 0,
state = true;

  c = document.getElementById('c'), 
//canvas itself 

  ctx = c.getContext('2d');
//and two-dimensional graphic context of the
//canvas, the only one supported by all 
//browsers for now

c.width = width;
c.height = height;
//setting canvas size 

var clear = function(){
  ctx.fillStyle = '#d0e7f9';
//set active color to #d0e... (nice blue)
//UPDATE - as 'Ped7g' noticed - using clearRect() in here is useless, we cover whole surface of the canvas with blue rectangle two lines below. I just forget to remove that line
//ctx.clearRect(0, 0, width, height);
//clear whole surface
  ctx.beginPath();
//start drawing
  ctx.rect(0, 0, width, height);
//draw rectangle from point (0, 0) to
//(width, height) covering whole canvas
  ctx.closePath();
//end drawing
  ctx.fill();
//fill rectangle with active
//color selected before
}

var howManyCircles = 10, circles = [];

for (var i = 0; i < howManyCircles; i++) 
  circles.push([Math.random() * width, Math.random() * height, Math.random() * 100, Math.random() / 2]);
//add information about circles into
//the 'circles' Array. It is x & y positions, 
//radius from 0-100 and transparency 
//from 0-0.5 (0 is invisible, 1 no transparency)

var DrawCircles = function(){
  for (var i = 0; i < howManyCircles; i++) {
    ctx.fillStyle = 'rgba(255, 255, 255, ' + circles[i][3] + ')';
//white color with transparency in rgba
    ctx.beginPath();
    ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2, true);
//arc(x, y, radius, startAngle, endAngle, anticlockwise)
//circle has always PI*2 end angle
    ctx.closePath();
    ctx.fill();
  }
};

var MoveCircles = function(deltaY){
  for (var i = 0; i < howManyCircles; i++) {
    if (circles[i][1] - circles[i][2] > height) {
//the circle is under the screen so we change
//informations about it 
      circles[i][0] = Math.random() * width;
      circles[i][2] = Math.random() * 100;
      circles[i][1] = 0 - circles[i][2];
      circles[i][3] = Math.random() / 2;
    } else {
//move circle deltaY pixels down
      circles[i][1] += deltaY;
    }
  }
};

var player = new (function(){

    var that = this;
//'that' will be the context now

//attributes
    that.image = new Image();
    that.image.src = "angel.png";
//create new Image

that.isJumping = false;
that.isFalling = false;
//state of the object described by bool variables - is it rising or falling?

that.jumpSpeed = 0;
that.fallSpeed = 0;

    that.width = 65;
//width of the single frame
    that.height = 95;
//height of the single frame

    that.X = 0;
    that.Y = 0;
//X&Y position

//methods 
    that.setPosition = function(x, y){
    that.X = x;
    that.Y = y;
}
    that.frames = 1;
//number of frames indexed from zero
    that.actualFrame = 0;
//start from which frame
    that.interval = 0;
//we don't need to switch animation frame
//on each game loop, interval will helps
//with this.

    that.draw = function(){
        try {
            ctx.drawImage(that.image, 0, that.height * that.actualFrame, that.width, that.height, that.X, that.Y, that.width, that.height);
//3rd agument needs to be multiplied by number of frames, so on each loop different frame will be cut from the source image
        } catch (e) {};

        if (that.interval == 4 ) {
            if (that.actualFrame == that.frames) {
                that.actualFrame = 0;
            } else {
                that.actualFrame++;
            }
            that.interval = 0;
        }
    that.interval++;
//all that logic above just
//switch frames every 4 loops  
    }
	that.jump = function() {
//initiation of the jump
if (!that.isJumping && !that.isFalling) {
//if objects isn't currently jumping or falling (preventing of 'double jumps', or bouncing from the air
that.fallSpeed = 0;
that.isJumping = true;
that.jumpSpeed = 17;
// initial velocity
}
}

that.checkJump = function() {     
    if (that.Y > height*0.4) {
//if player is under about half of the screen - let him move
        that.setPosition(that.X, that.Y - that.jumpSpeed);        
    } else {
		if (that.jumpSpeed > 10) points++;
        MoveCircles(that.jumpSpeed * 0.5); 
//clouds are in the background, further than platforms and player, so we will move it with half speed
        
        platforms.forEach(function(platform, ind){
            platform.y += that.jumpSpeed;

            if (platform.y > height) {
//if platform moves outside the screen, we will generate another one on the top
                var type = ~~(Math.random() * 5);
                if (type == 0) 
                    type = 1;
                else 
                    type = 0;
                platforms[ind] = new Platform(Math.random() * (width - platformWidth), platform.y - height, type);
            }
        });
    }
    
    
    that.jumpSpeed--;
    if (that.jumpSpeed == 0) {
        that.isJumping = false;
        that.isFalling = true;
        that.fallSpeed = 1;
    }

}

that.checkFall = function(){
//same situation as in checkJump()
if (that.Y < height - that.height) {
//check if the object meets the bottom of the screen, if not just change the position and increase fallSpeed (simulation of gravity acceleration)...
that.setPosition(that.X, that.Y + that.fallSpeed);
that.fallSpeed++;
} else {
if (points == 0) 
//allow player to step on the floor at he beginning of the game
            that.fallStop();
        else 
            GameOver();
that.fallStop();
}
}

that.fallStop = function(){
//stop falling, start jumping again
that.isFalling = false;
that.fallSpeed = 0;
that.jump();    
}

that.moveLeft = function(){
if (that.X > 0) {
//check whether the object is inside the screen
that.setPosition(that.X - 5, that.Y);
}
}

that.moveRight = function(){
if (that.X + that.width < width) {
//check whether the object is inside the screen
that.setPosition(that.X + 5, that.Y);
}
}
document.onmousemove = function(e){
if (player.X + c.offsetLeft > e.pageX) {
//if mouse is on the left side of the player.
player.moveLeft();
} else if (player.X + c.offsetLeft < e.pageX) {
//or on right?
player.moveRight();
}
}
})();


player.setPosition(~~((width-player.width)/2),  ~~((height - player.height)/2));
player.jump();

var GameLoop = function(){
  clear();
  MoveCircles(5);
  DrawCircles();

  
  if (player.isJumping) player.checkJump();
  if (player.isFalling) player.checkFall();
  
    
  player.draw();
  
    platforms.forEach(function(platform, index){
        if (platform.isMoving) {
//if platform is able to move
            if (platform.x < 0) {
//and if is on the end of the screen
                platform.direction = 1;
            } else if (platform.x > width - platformWidth) {
                platform.direction = -1;
//switch direction and start moving in the opposite direction
            }
            platform.x += platform.direction * (index / 2) * ~~(points / 100);
//with speed dependent on the index in platforms[] array (to avoid moving all the displayed platforms with the same speed, it looks ugly) and number of points
        }
        platform.draw();
    });
	
	checkCollision();
  
  ctx.fillStyle = "Black";
//change active color to black
ctx.fillText("POINTS:" + points, 10, height-10);
//and add text in the left-bottom corner of the canvas
      if (state)
  gLoop = setTimeout(GameLoop, 1000 / 50);
}

var Platform = function(x, y, type){
//function takes position and platform type
var that=this;
that.isMoving = ~~(Math.random() * 2);
//first, let's check if platform will be able to move (1) or not (0)
    that.direction= ~~(Math.random() * 2) ? -1 : 1;
//and then in which direction
that.firstColor = '#FF8C00';
that.secondColor = '#EEEE00';
that.onCollide = function(){
player.fallStop();
};
//if platform type is different than 1, set right color & collision function (in this case just call player's fallStop() method we defined last time
if (type === 1) {
//but if type is equal '1', set different color and set jumpSpeed to 50. After such an operation checkJump() method will takes substituted '50' instead of default '17' we set in jump().
that.firstColor = '#AADD00';
that.secondColor = '#698B22';
that.onCollide = function(){
player.fallStop();
player.jumpSpeed = 50;
};
}


that.x = ~~x;
that.y = y;
that.type = type;

that.draw = function(){
ctx.fillStyle = 'rgba(255, 255, 255, 1)';
//it's important to change transparency to '1' before drawing the platforms, in other case they acquire last set transparency in Google Chrome Browser, and because circles in background are semi-transparent it's good idea to fix it. I forgot about that in my 10kApart entry, I think because Firefox and Safari change it by default
var gradient = ctx.createRadialGradient(that.x + (platformWidth/2), that.y + (platformHeight/2), 5, that.x + (platformWidth/2), that.y + (platformHeight/2), 45);
gradient.addColorStop(0, that.firstColor);
gradient.addColorStop(1, that.secondColor);
ctx.fillStyle = gradient;
ctx.fillRect(that.x, that.y, platformWidth, platformHeight);
//drawing gradient inside rectangular platform
};

return that;
};

//GameOver screen
var GameOver = function(){
	
    state = false;
//set state to false
    clearTimeout(gLoop);
//stop calling another frame
    setTimeout(function(){
//wait for already called frames to be drawn and then clear everything and render text
        clear(); 
        ctx.fillStyle = "Black";
        ctx.font = "7pt Arial";
        ctx.fillText("YOU LOSE!", 100, 100);
        ctx.fillText("YOUR RESULT:" + points, 100, 120); 
		state = true; 
		points = 0;
		GameLoop();
		});

		
};

var nrOfPlatforms = 5, 
platforms = [],
platformWidth = 70,
platformHeight = 20;
//global (so far) variables are not the best place for storing platform size information, but in case it will be needed to calculate collisions I put it here, not as a Platform attributes
var generatePlatforms = function(){
var position = 0, type;
//'position' is Y of the platform, to place it in quite similar intervals it starts from 0
for (var i = 0; i < nrOfPlatforms; i++) {
type = ~~(Math.random()*5);
if (type == 0) type = 1;
else type = 0;
//it's 5 times more possible to get 'ordinary' platform than 'super' one
platforms[i] = new Platform(Math.random()*(width-platformWidth),position,type);
//random X position
if (position < height - platformHeight) 
position += ~~(height / nrOfPlatforms);
}
//and Y position interval
}();

var checkCollision = function(){
platforms.forEach(function(e, ind){
//check every plaftorm
if (
(player.isFalling) && 
//only when player is falling
(player.X < e.x + platformWidth) && 
(player.X + player.width > e.x) && 
(player.Y + player.height > e.y) && 
(player.Y + player.height < e.y + platformHeight)
//and is directly over the platform
) {
e.onCollide();
}
})
}

GameLoop();