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
    // Disable the start game button
    d3.select('#startBtn').attr('disabled', 'true');
    d3.select('#endBtn').attr('disabled',  null);
}


PointerPrecisionGame.prototype.end = function(){
    // End the game
    this.arena.endGame();
    d3.select('#startBtn').attr('disabled', null);
    d3.select('#endBtn').attr('disabled', 'true');
}