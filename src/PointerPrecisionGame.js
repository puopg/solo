var PointerPrecisionGame = function(width, height){
    this.width = width;
    this.height = height;
    this.arena = null;
}

PointerPrecisionGame.prototype.play = function(){
    // Create board
    this.arena = new Arena(this.width, this.height);
    this.arena.createArena();
}