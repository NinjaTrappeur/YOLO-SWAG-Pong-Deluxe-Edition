/*
 * This composant compute the game state.
 * It needs a GameState to compute it.
 */

var GameEngine= function(gameState){
  if(gameState instanceof GameState){
    this.gameState = gameState;

    gameState.addBall(new Ball(new Position(0,0,0.08), new Size(0.08,0.08)));
    gameState.balls[0].velocity.set(-0.001,-0.001,0);
    gameState.addBat(new Bat(new Position(-0.2,-0.8,0.08), new Size(0.4,0.08),
                             0, gameState.arena.size.width/2));
    gameState.addObstacle(new Obstacle(new Position(-0.2,0.2,0.08), new Size(0.08,0.08)));
    this.step = 0.01;
    this.keyboard = new THREEx.KeyboardState();
  }
  else
    throw("The game engine needs a GameState in parameter.");
}

GameEngine.prototype.computeKeyboard= function(){
  var bat = this.gameState.bats[0];
  if(this.keyboard.pressed("right"))
    bat.moveRight(this.step);
  else if(this.keyboard.pressed("left"))
    bat.moveLeft(this.step);
}

GameEngine.prototype.computeBalls = function(){
  var ball;
  for(var i=0;i<this.gameState.balls.length;i++)
    {
      ball= this.gameState.balls[i];
      if(ball.position.x+ball.velocity.x > this.gameState.arena.size.width/2)
        ball.position.x-=this.gameState.arena.size.width;
      else if(ball.position.x+ball.velocity.x<-this.gameState.arena.size.width/2)
        ball.position.x+=this.gameState.arena.size.width;
      ball.position.x += ball.velocity.x;

      if(ball.position.y+ball.velocity.y > this.gameState.arena.size.length/2)
        ball.position.y-=this.gameState.arena.size.length;
      else if(ball.position.y+ball.velocity.y<-this.gameState.arena.size.length/2)
        ball.position.y+=this.gameState.arena.size.length;
      ball.position.y += ball.velocity.y;

      ball.updateMesh();
    }
}

GameEngine.prototype.compute = function(){
  this.computeKeyboard();
  this.computeBalls();
}
