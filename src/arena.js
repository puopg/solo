var Arena = function(width, height){
    this.width = width;
    this.height = height;
    this.svg = null;
    this.totalEnemiesCreated = 0;
    this.player = new Player();
    this.enemies = [];
    this.intervals=[];
}

//----- Arena Methods -----
Arena.prototype.createArena = function(){
    // Initialize svg arena
    this.svg = d3.select('#arena');

    d3.select('#canvas')
      .on('click', this.player.miss.bind(this.player));

    // Periodically, add enemies to the arena
    this.intervalEnemySpawn();

    // Cause all enemies to grow/shrink
    this.intervalEnemyGrow();

    // Cause all player misses to expand
    this.intervalPlayer();

    this.player.updateScores();
}

Arena.prototype.endGame = function(){
  this.intervals.forEach(function(interval){
    clearInterval(interval);
  });
}
//----- Arena Methods End -----

//----- Arena Enemy Methods -----
Arena.prototype.enemySpawn = function() {
  var enemy = new Enemy(this.width, this.height, this.totalEnemiesCreated);
  this.enemies.push(enemy);  
  this.totalEnemiesCreated++;

  // Select all enemies and append them to the DOM
  var enemies = this.svg.selectAll('circle.enemy')
                        .data(this.enemies, function(d) {return d.id;});
  
  enemies.enter().append('svg:circle')
         .attr('class', 'enemy')
         .attr('cx', function(d) {return d.x;} )
         .attr('cy', function(d) {return d.y;} )
         .attr('id', function(d) {return d.id;})
         .attr('r',  function(d) {return d.r;})
         .attr('state', function(d) {return d.state;})
         .on('click', this.enemyDestroy.bind(this))
}
Arena.prototype.removeEnemies = function(){
  this.enemies = [];
  // Select all enemies and append them to the DOM
  var enemies = this.svg.selectAll('circle.enemy')
                        .data(this.enemies, function(d) {return d.id;});
  
  enemies.exit().remove();
}

Arena.prototype.removeMissAnimations = function(){
  this.player.misses = [];
  // Select all enemies and append them to the DOM
  var misses = this.svg.selectAll('circle.miss')
                        .data(this.player.misses, function(d) {return d.id;});
  
  misses.exit().remove();
}

Arena.prototype.enemyGrow = function() {
  // Trigger the grow method for each enemy
  this.enemies.forEach(function(enemy){
    enemy.grow();
  });

  var enemies = this.svg.selectAll('circle.enemy')
                        .data(this.enemies,function(d) {return d.id;})

  // Update enemy radius and state
  enemies.attr('r',  function(d) {return d.r;})
         .attr('state',  function(d) {return d.state;});
}

Arena.prototype.enemyRemoveDead = function(){
  for(var i = this.enemies.length-1; i >=0 ; i--){
    if(this.enemies[i].state === 'dead'){
      if(this.player.lives <= 0)
        document.dispatchEvent(endEvent);
      this.enemies.splice(i,1);
      this.player.lives -= 1;
    }
  }

  var enemies = this.svg.selectAll('circle.enemy')
                        .data(this.enemies,function(d) {return d.id;})
                        .exit().remove();
}

Arena.prototype.enemyDestroy = function(data) {
  // Find the enemy to destroy, and splice it out of the array
  var enemyToDestroyIdx = this.enemies.indexOf(data);
  var enemyRemoved = this.enemies.splice(enemyToDestroyIdx,1);
  var enemies = this.svg.selectAll("circle.enemy")
                        .data(this.enemies, function(d) {return d.id;});

  // Remove the enemy
  enemies.exit().remove();
  this.player.clicks++;
  this.player.currentScore += 1;
  this.player.updateScores();

  console.log('Enemy ' + data.id + ' Destroyed');
}
//----- Arena Enemy Methods End -----
                       

//----- Arena Intervals -----

Arena.prototype.intervalEnemyGrow = function(){
  var interval = setInterval(function(){
      this.enemyGrow();
      this.enemyRemoveDead();
    }.bind(this), 50);
  this.intervals.push(interval);
}

Arena.prototype.intervalEnemySpawn = function(){
  var rate = 10000;
  var numberToPlace = 10;
  var level = 1;

  setDeceleratingTimeout(this.enemySpawn.bind(this), rate/numberToPlace, numberToPlace);

  var interval = setInterval(function(){
    console.log('Level: ' + level);
    console.log('Spawning ' + numberToPlace/(rate/1000) + ' every second')
    setDeceleratingTimeout(this.enemySpawn.bind(this), rate/numberToPlace, numberToPlace);
    numberToPlace += 3;
    level++;
  }.bind(this),rate);
  this.intervals.push(interval);
}

Arena.prototype.intervalPlayer = function(){
  var interval = setInterval(function(){
    if(this.player.misses.length > 0){
      this.player.clickAnimation();
      this.player.removeClick();
    }
  }.bind(this),50);
  this.intervals.push(interval);
}

// Arena.prototype.intervalEnemySpawnRate = function(){
//   setInterval(function(){
//     this.enemyIncreaseSpawnRate();
//     var interval = this.intervalEnemySpawn();
//     this.intervals.push(interval);
//   }.bind(this), 5000)
//   this.intervals.push(interval);
// }
