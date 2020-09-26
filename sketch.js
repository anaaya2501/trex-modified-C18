//declring all global variables
//Global variables: A variable declared outside a function, becomes GLOBAL. All scripts and functions in the code can access it.

var trex,trex_runningcloud,cloudImage,trex_finished;
var ground,groundImage,invisibleGround;
var restart,restart_again;
var gameOver,gameOver_done;
var score = 0;
var groupClouds,GroupObstacles;
var PLAYSTATE = 1;
var END = 0;
var gameState = PLAYSTATE;

//All images, sounds, animations need to be loaded here before they can be added to the setup/draw function
function preload(){
  //loading animations
  trex_running=loadAnimation("trex1.png","trex3.png","trex4.png");
  trex_finished = loadAnimation("trex_collided.png");
  //loading Images
  groundImage = loadImage("ground2.png");
  cloudImage = loadImage("cloud.png");
  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png");
  obstacle6 = loadImage("obstacle6.png");
  restart_again = loadImage("restart.png");
  gameOver_done = loadImage("gameOver.png");
  //loading Sounds
  checkpoint = loadSound("checkPoint.mp3");
  dieSound = loadSound("die.mp3");
  jumpSound = loadSound("jump.mp3");
}


function setup() {
  
  createCanvas(windowWidth,windowHeight);
  
  //creating trex sprite
  trex = createSprite(20,height-50,20,60);
  trex.addAnimation("label1",trex_running); //original animation
  trex.addAnimation("trex_over",trex_finished); //after collision animation
  trex.scale = 0.5;
  //Setcollider decides the distance of collision detection between the obstacle and the   animation
  //setcollider("rectangle", x-offset, y-offset, width, height)
  //setcollider("circle", x-offset, y-offset, diameter)
  //if offset values are 0,0 then the center of the sahpe and center of animation will overlap
  //The number on the collider in the output screen increases as the depth of thetrex increases everytime the cloud passes the screen
  trex.setCollider("circle",30,0,40);
  trex.debug = false;//if false then the green colored collider will disapper
  
  //creating ground sprite
  ground = createSprite(width/2,height-20,width,20);
  ground.addImage("label2",groundImage);
  
  //creating groups
  groupClouds = new Group();
  groupObstacles = new Group();
  
  //creating invisible ground sprite
  //trex looks like it's floating in air. To prevent this, invisibleGround is created so that the trex may touch this invisibleGround instead of ground.
  invisibleGround = createSprite(width/2,height-10,width,20);
  invisibleGround.visible = false;
 
  //defining edge sprites
  edges = createEdgeSprites();
  
  //creating restart sprite and adding Image
  restart = createSprite(width/2,height/2);
  restart.addImage("restart_done",restart_again);
  
  //creating gameover sprite and adding Image
  gameOver = createSprite(width/2,height/2-50);
gameOver.addImage("gameOverFinish",gameOver_done);
  
  
  //score size- added here so everywher the size remains same.
  textSize(35);
}

function draw() {
  background(180);
  
  //2 game states define- PLAY and END
  if(gameState ===PLAYSTATE){
    
   //scoring the trex  
  score = score + Math.round(getFrameRate()/60);
  text("score" + score,20,50);
    
  //Ground velocity given.
  ground.velocityX = -10  ;
    
  //Playing checkpoint sound
  //score%100 means any number of score which is completely divisible by 100 giving remainder 0. Everytime remainder becomes 0, RHS will be equal to LHS and the condition is satisfied playing the sound at-100,200,300,400,...
  if(score%100===0 && score>0){
   checkpoint.play();
      }
    
  //making the trex jump
  if( (touches.length>0 || keyDown("space"))&&trex.y>150){
    touches = [];
    trex.velocityY = -6;
    jumpSound.play();
  }
    
  //adding gravity
  trex.velocityY = trex.velocityY + 0.2;
    
  //resetting the ground
  //if not resetted, the trex falls down, this basically gives a never ending ground
  if(ground.x<0){
    ground.x = ground.width/2;
  }
    
  //Calling clouds and cactuses
  spawn_clouds();
  spawn_obstacles();
        
  //ending the game
  if(trex.isTouching(groupObstacles)){
    dieSound.play();
    gameState = END;
  }
    
  //visibility- if not given the restart and gameover sprite will be visible even during the game
  restart.visible = false;
  gameOver.visible = false;
   }
  else if(gameState===END){
    
    //ground should stop moving
    ground.velocityX = 0  ;
    
    //trex should not jump
    trex.velocityY = 0  ;
    
    //changing the trex animation
    trex.changeAnimation("trex_over",trex_finished);
    
    //Clouds and cactuses should not be moving
    groupClouds.setVelocityXEach(0);
    groupObstacles.setVelocityXEach(0);
    
    //setting lifetime
    //New clouds and cactuses should not come.
    //Lifetime of an object basically keeps reducing by 1 after everyframe
    //Eg-if lifetime is set as 5, after 5 frames the lifetime becomes 0 and the object disappears and new object comes on the screen
    //To prevent this we make it -1, so everytime 1 is submtracted fromit, the lifetime which is an absolute value will always keep increasing=(-1-1=-2, -2-1=-3...)
    groupClouds.setLifetimeEach(-1);
    groupObstacles.setLifetimeEach(-1);

    //visiblity- if not given, the restart and gameover sprite will not come on the screen
    restart.visible = true;
    gameOver.visible = true;
   
   
              }
 
  //trex collide or bounce off
  trex.collide(invisibleGround);
  
  //restarting the game
  if(touches.length>0 || mousePressedOver(restart)){
    touches = [];
    reset();
      
       
       }
  
  
 
  drawSprites();
}

//The modulus operator - or more precisely, the modulo operation - is a way to determine the remainder of a division operation. Instead of returning the result of the division, the modulo operation returns the whole number remainder

//Spawning clouds.
function spawn_clouds(){
  //If framecount is not given, then cloud will appear in every fram and they will be overlapped
  if (frameCount%60===0){

  var cloud = createSprite(width + 20,height-300,30,20);
  cloud.addImage ("cloud_flying", cloudImage);
  cloud.velocityX = -3;
    
  //Generating a random number so that the cloud's Y position is always different
  cloud.y = Math.round(random(1,50));
    
   //adjusting the depth- to prevent the trex from going behind the cloud.
  //We make the cloud.depth same as trex depth- ed if trex.depth is 1 then cloud also becomes 1.Then we say, now make trex depth +1 which is 2.Thuse trex xomes infront of cloud
  cloud.depth = trex.depth;
  trex.depth = trex.depth + 1;  
    
  //time of the clouds= distance/speed
  //Distance is the width of canvas, and speed is that of ground
  //This lifetime is given to prevent memory leak problem
  cloud.lifetime = 200;
    
  //adding clouds in group
  groupClouds.add(cloud);
}

}
  //To increase the speed of the ground and make the game more challenging, we have added 3*score/100 to original velocity of -10.This is your choice. The number to be added can be anything.

//If framecount is not given, then cactus will appear in every frame and they will be overlapped. Everytime framecount is divisible by 100 the cactus will come.Basically adds delay between two cactuses
function spawn_obstacles(){
  if (frameCount%100===0){
    
  var obstacles = createSprite(width + 20,height-95,20,100);
  obstacles.velocityX = -(10 + score/100);
    
  //generating random value between 1 to 6
  var rant = Math.round(random(1,6));
    
   // switch case is used to select 1 out of 6 cactus images
    switch(rant){
      case 1:obstacles.addImage(obstacle1); break;       case 2:obstacles.addImage(obstacle2); break; 
      case 3:obstacles.addImage(obstacle3); break; 
      case 4:obstacles.addImage(obstacle4); break; 
      case 5:obstacles.addImage(obstacle5); break; 
      case 6:obstacles.addImage(obstacle6); break; 
      default:break;
    
      
    }
    //lifetime of cactuses-distance/speed
    //distance is width of canvas and speed of ground
    obstacles.lifetime = 60;

    //adding cactus in group
    groupObstacles.add(obstacles);
}
}

function reset(){
  gameState = PLAYSTATE;
  groupObstacles.destroyEach();
  groupClouds.destroyEach();
  score = 0;
  trex.changeAnimation("label1",trex_running);
  
}










