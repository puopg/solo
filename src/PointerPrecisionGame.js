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
    // Stop all intervals
    this.arena.endGame();
    // Remove all enemies and miss animations
    this.arena.removeEnemies();
    this.arena.removeMissAnimations();
    // Display loss and stats

}