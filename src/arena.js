var Arena = function(width, height){
    this.width = width;
    this.height = height;
    this.svg = null;
    this.totalEnemiesCreated = 0;
    this.enemies = [];
    this.misses = [];
    this.spawnRateMilisec = 1000000;
}
//----- Arena Methods -----
Arena.prototype.createArena = function(){
    // Initialize svg arena
    this.svg = d3.select('#arena');
    d3.select('#canvas')
      .on('click', this.playerMiss.bind(this))

    // Periodically, add enemies to the arena
    var interval = this.intervalEnemySpawn();
    setInterval(function(){
      clearInterval(interval);
      this.enemyIncreaseSpawnRate();
      interval = this.intervalEnemySpawn();
    }.bind(this), 5000)

    // Cause all enemies to grow/shrink
    this.intervalEnemyGrow();
}

Arena.prototype.playerMiss = function(){
  var coordinates = d3.mouse(d3.select("#canvas").node());

  var click = new PlayerClick(coordinates[0], coordinates[1]);
  this.misses.push(click);

  var miss = this.svg.selectAll('circle.miss')
                        .data(this.misses);

  miss.enter().append('svg:circle')
         .attr('class', 'miss')
         .attr('cx', function(d) {return d.x;} )
         .attr('cy', function(d) {return d.y;} )
         .attr('r',  function(d) {return d.r;})
}

Arena.prototype.missGrow = function() {
  this.misses.forEach(function(miss){
    miss.grow();
  });

  var misses = this.svg.selectAll('circle.miss')
                        .data(this.misses)

  // Update enemy radius and state
  enemies.attr('r',  function(d) {return d.r;})

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

Arena.prototype.enemyIncreaseSpawnRate = function() {
  this.spawnRateMilisec = this.spawnRateMilisec * 0.9;
  console.log('going faster: ' + this.spawnRateMilisec);
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
    if(this.enemies[i].state === 'dead')
      this.enemies.splice(i,1);
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
  console.log('Enemy ' + data.id + ' Destroyed');
}
//----- Arena Enemy Methods End -----
                       

//----- Arena Intervals -----

Arena.prototype.intervalEnemyGrow = function(){
  return setInterval(function(){
      this.enemyGrow();
      this.enemyRemoveDead();
    }.bind(this), 50);
}

Arena.prototype.intervalEnemySpawn = function(){
  return setInterval(function(){
      this.enemySpawn();
    }.bind(this), this.spawnRateMilisec);
}


