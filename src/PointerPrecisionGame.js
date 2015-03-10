var PointerPrecisionGame = function(width, height){
    this.width = width;
    this.height = height;
    this.arena = null;
    this.gameState = 'Ready';
}

PointerPrecisionGame.prototype.play = function(){
    // Create board
    this.arena = new Arena(this.width, this.height);
    this.arena.createArena();
}


PointerPrecisionGame.prototype.end = function(){
    // End the game
    this.arena.endGame();
}