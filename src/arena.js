var Arena = function(width, height){
    // Dimensions of the arena
    this.width = width;
    this.height = height;
    this.level = 1;
    this.crosshair = [];

    // Reference to the arena/SVG canvas area
    this.svg = null;

    // Used as the UID of an enemy
    this.totalEnemiesCreated = 0;

    // Create a player instance
    this.player = new Player();

    // A list of all enemies in the arena at any given time
    this.enemies = []; 

    // A list of all interval id's for cleanup later
    this.intervals=[];
}

//----- Arena Methods -----
/// Function: createArena()
/// This function will create the arena and populate enemies periodically. 
/// This needs to be called for the game to start. 
Arena.prototype.createArena = function(){
    // Initialize svg arena
    this.svg = d3.select('#arena');

    var intervalId = null,
    pos = null;

    this.crosshair.push({x:this.width/2, y:this.height/2});

    ARENA_WIDTH = this.width;
    ARENA_HEIGHT = this.height;

    this.svg.selectAll('circle.target')
            .data(this.crosshair)
            .enter()
            .append('svg:circle')
            .attr('class', 'target')
            .attr('cx', function(d) {return d.x;} )
            .attr('cy', function(d) {return d.y;} )
            .attr('r',  TARGET_SIZE);
            
    this.svg.selectAll('circle.crosshair')
            .data(this.crosshair)
            .enter()
            .append("svg:image")
            .attr('class', 'crosshair')
            .attr("height", 48)
            .attr("width", 48)
            .attr("transform", function(d) { return "translate(" + (d.x-24) + "," + (d.y-24) + ")"; } )
            .attr("xlink:href","assets/csReticle.png")

    this.svg.on('mousedown', function() {
    pos = d3.mouse(document.getElementById('arena'));
      this.player.shoot(pos, 9);
      intervalId = setInterval(function(){
        this.player.shoot(pos, 9);
        }.bind(this), 100);
    }.bind(this))

    .on('mouseup', function() {
      this.player.restoreAccuracy();
      clearInterval(intervalId);
    }.bind(this))
    .on("mousemove", function () {
        pos = d3.mouse(document.getElementById('arena'));
        this.crosshair[0].x = pos[0];
        this.crosshair[0].y = pos[1];
        this.svg.selectAll('image.crosshair')
                .data(this.crosshair)
                .attr("transform", function(d) { return "translate(" + (d.x-24) + "," + (d.y-24) + ")"; } )
    }.bind(this))

    // Bind click event on canvas for the player miss
    // d3.select('#canvas')
    //   .on('click', this.player.miss.bind(this.player));

    // Periodically, add enemies to the arena
    this.intervalEnemySpawn();

    // Cause all enemies to grow/shrink
    this.intervalEnemyGrow();

    // Cause all player misses to expand
    this.intervalPlayer();

    // Draw the current score
    this.player.updateScores();
}

/// Function: endGame()
/// This function will clean up the intervals being used and stop
/// them from continuing to execute. Will also remove all the animations and enemies
Arena.prototype.endGame = function(){
  // Clean up all intervals created
  this.intervals.forEach(function(interval){
    clearInterval(interval);
  });
  this.player.processStats(this.width, this.height);
  // Remove event handler for canvas click
  d3.select('#canvas')
    .on('click', null);

  // Remove all animations currently on screen. 
  this.removeEnemies();
  this.removeMissAnimations();
  this.removeDeathAnimations();

  // Update High Score if neceesary
  var currentHighScore = parseInt(d3.select('.high span').text());
  if(currentHighScore < this.player.currentScore)
    d3.select('.high span')
      .text(this.player.currentScore);
}
//----- Arena Methods End -----

//----- Arena Player Methods -----
/// Function: removeMissAnimations()
/// This function will cleanup all the miss animations on destruction of the arena
Arena.prototype.removeMissAnimations = function(){
  // Set the miss array to empty, d3 will handle the cleanup
  this.player.misses = [];

  var misses = this.svg.selectAll('circle.miss')
                        .data(this.player.misses, function(d) {return d.id;});
  
  // d3 will remove all exiting elements now
  misses.exit().remove();
}

Arena.prototype.removeDeathAnimations = function(){
  // Set the miss array to empty, d3 will handle the cleanup
  this.player.enemyDeaths = [];

  var deaths = this.svg.selectAll('circle.death')
                        .data(this.player.enemyDeaths, function(d) {return d.id;});
  
  // d3 will remove all exiting elements now
  deaths.exit().remove();
}
//----- Arena Player Methods End -----

//----- Arena Enemy Methods -----

/// Function: enemySpawn()
/// This function will spawn an enemy at a random location inside the arena.
Arena.prototype.enemySpawn = function() {
  return;
  // Create a new enemy
  var enemy = new Enemy(this.width, this.height, this.totalEnemiesCreated);
  this.enemies.push(enemy);  

  // Increment the number of total enemies, used as the unique id of each enemy. 
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

/// Function: removeEnemies()
/// This function will remove all enemies from the arena
/// d3 handles the removal from the DOM. 
Arena.prototype.removeEnemies = function(){
  this.enemies = [];
  // Select all enemies and append them to the DOM
  var enemies = this.svg.selectAll('circle.enemy')
                        .data(this.enemies, function(d) {return d.id;});
  
  enemies.exit().remove();
}

/// Function: enemyGrow()
/// This function will cause all enemies to grow in size. 
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

/// Function: enemyRemoveDead()
/// This function will remove all enemies which are dead from the DOM. 
/// When an enemy has died, the player should take damage since he has
/// failed to destroy it in time. 
Arena.prototype.enemyRemoveDead = function(){
  for(var i = this.enemies.length-1; i >=0 ; i--){
    if(this.enemies[i].state === 'dead'){
        this.player.hurtPlayer();
        this.player.addToHistoryMiss(this.enemies[i].x, this.enemies[i].y);
        this.enemies[i].deathAnimation(this.player.enemyDeaths);
        this.enemies.splice(i,1);

        if(this.player.lives <= 0)
          document.dispatchEvent(endEvent);
    }
  }

  var enemies = this.svg.selectAll('circle.enemy')
                        .data(this.enemies,function(d) {return d.id;})
                        .exit().remove();
}

/// Function: enemyDestroy(data)
/// data: The enemy to find in the enemies array
/// This function will remove a given enemy from the list.
Arena.prototype.enemyDestroy = function(enemy) {
  // Find the enemy to destroy, and splice it out of the array
  var enemyToDestroyIdx = this.enemies.indexOf(enemy);
  var enemyRemoved = this.enemies.splice(enemyToDestroyIdx,1);
  var enemies = this.svg.selectAll("circle.enemy")
                        .data(this.enemies, function(d) {return d.id;});

  // Remove the enemy
  enemies.exit().remove();

  // Update the player
  this.player.hit(enemy);
  console.log('Enemy ' + enemy.id + ' Destroyed');
}
//----- Arena Enemy Methods End -----      

//----- Arena Intervals -----
/// These are a set of intervals which will run during the game.

Arena.prototype.intervalEnemyGrow = function(){
  var interval = setInterval(function(){
      this.enemyGrow();
      this.enemyRemoveDead();
    }.bind(this), 50);

  this.intervals.push(interval);
}

Arena.prototype.intervalEnemySpawn = function(){
  var rateSeconds = TIME_PER_LEVEL_SECONDS;
  var numberToPlace = DEFAULT_ENEMIES;

  console.log('Level: ' + this.level);
  console.log('Spawning ' + numberToPlace/rateSeconds + ' every second')
  setDeceleratingTimeout(this.enemySpawn.bind(this), rateSeconds/numberToPlace, numberToPlace);

  var interval = setInterval(function(){
    // Capping the max speed
    if(numberToPlace <= MAX_ENEMIES)
      numberToPlace += 1;

    this.level++;

    // Replenish 3 lives on every 3rd level
    if( (this.level % PLAYER_HEAL_FREQ) === 0 ){
      this.player.heal();
    }

    console.log('Level: ' + this.level);
    console.log('Spawning ' + numberToPlace/rateSeconds + ' every second')

    setDeceleratingTimeout(this.enemySpawn.bind(this), rateSeconds/numberToPlace, numberToPlace);
  
  }.bind(this),rateSeconds*1000);

  this.intervals.push(interval);
}  

Arena.prototype.intervalPlayer = function(){
  var interval = setInterval(function(){
    if(this.player.misses.length > 0){
      this.player.missAnimation();
      this.player.removeMiss();
    }
    if(this.player.enemyDeaths.length > 0){
      this.player.deathAnimation();
      this.player.removeDeaths();
    }
    if(this.player.shots.length > 0){
      this.player.shotAnimation();
      this.player.removeShots();
    }
  }.bind(this),50);

  this.intervals.push(interval);
}