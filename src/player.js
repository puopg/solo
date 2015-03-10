var Player = function(){
    // Number of lives to give the player
    this.lives = PLAYER_LIVES;

    // List of misses used for animation sake
    this.misses = [];
    this.enemyDeaths = [];

    // History of all hits and misses, to be used in data aggregation
    this.historyHits = [];
    this.historyMiss = [];

    // Total number of clicks made
    this.clicks = 0;

    // Total number of misses
    this.missTotal = 0;

    // Initialize player accuracy
    this.accuracy = PLAYER_INIT_ACCURACY;

    // Player Score
    this.currentScore = 0;
    this.highScore = 0;
}

//----- Click actions -----
Player.prototype.hit = function(enemy){
  this.addToHistoryHits(enemy.x, enemy.y);

  this.clicks++;
  this.currentScore++;
  this.updateScores();
}

Player.prototype.miss = function(){
    // Get the coordinates of the miss
    var coordinates = d3.mouse(d3.select("#canvas").node());
    var click = {
        x: coordinates[0],
        y: coordinates[1],
        r: 0,
        id: this.missTotal
    }
    // Add new miss to list so d3 can render it. Also add to history
    this.misses.push(click);
    this.addToHistoryMiss(click.x, click.y);

    var miss = d3.select('#arena').selectAll('circle.miss')
                                    .data(this.misses, function(d) {return d.id});

    miss.enter().append('svg:circle')
           .attr('class', 'miss')
           .attr('cx', function(d) {return d.x;} )
           .attr('cy', function(d) {return d.y;} )
           .attr('r',  function(d) {return d.r;} )

    // Decrement the player score by 3 and increase number of misses
    this.clicks++;
    this.missTotal++;
    this.currentScore -= 3;

    // Update Scores
    this.updateScores();

    // If you really suck... (you lose)
    if(this.currentScore <= -100){
      document.dispatchEvent(endEvent);
    }
}
Player.prototype.heal = function(){
  console.log('Player heals for ' + PLAYER_HEAL_AMOUNT + '!');

  if(this.lives + PLAYER_HEAL_AMOUNT >= 10)
    this.lives = 10;
  else
    this.lives += PLAYER_HEAL_AMOUNT;
}

Player.prototype.hurtPlayer = function(){
    this.lives--;
    d3.select('.lives span')
              .text(this.lives);
}
//----- Click actions End -----

//----- Animations -----
/// Function: clickAnimation()
/// This function will modify all the circle.miss elements and increase the radius
/// by the amount specified in RING_SPEED. 
Player.prototype.missAnimation = function() {
    this.misses.forEach(function(miss){
      miss.r += RING_SPEED;
    });

    var misses = d3.select('#arena').selectAll('circle.miss')
                                    .data(this.misses)

    // Update
    misses.attr('r',  function(d) {return d.r;})
}

/// Function: deathAnimation()
/// This function will modify all the circle.death elements and increase the radius
/// by the amount specified in RING_SPEED. 
Player.prototype.deathAnimation = function() {
    this.enemyDeaths.forEach(function(death){
      death.r += RING_SPEED;
    });

    var deaths = d3.select('#arena').selectAll('circle.death')
                          .data(this.enemyDeaths, function(d){return d.id;})

    // Update
    deaths.attr('r',  function(d) {return d.r;})
}

/// Function: removeMiss()
/// This function will remove all miss animations that have reached a maximum size. 
/// d3 will see this change and render accordingly. 
Player.prototype.removeMiss = function(){
  for(var i = this.misses.length-1; i >=0 ; i--){
    if(this.misses[i].r > RING_SIZE)
      this.misses.splice(i,1);
  }

  var misses = d3.select('#arena').selectAll('circle.miss')
                        .data(this.misses,function(d) {return d.id;})
                        .exit().remove();
}

/// Function: removeDeaths()
/// This function will remove all enemy death animations that have reached a maximum size. 
/// d3 will see this change and render accordingly. 
Player.prototype.removeDeaths = function(){
  for(var i = this.enemyDeaths.length-1; i >=0 ; i--){
    if(this.enemyDeaths[i].r > RING_SIZE)
      this.enemyDeaths.splice(i,1);
  }

  var enemyDeaths = d3.select('#arena').selectAll('circle.death')
                        .data(this.enemyDeaths,function(d) {return d.id;})
                        .exit().remove();
}
//----- Animations End-----

/// Function: updateScores()
/// This function will update the DOM with current scores
Player.prototype.updateScores = function(){
    if(this.clicks > 0)
        this.accuracy = (this.clicks-this.missTotal) / this.clicks;

    d3.select('.lives span')
                .text(this.lives);

    d3.select('.current span')
              .text(this.currentScore);

    d3.select('.misses span')
              .text(this.missTotal);

    d3.select('.accuracy span')
            .text( Math.round(this.accuracy * 100) + '%');
}

Player.prototype.addToHistoryHits = function(clickX, clickY){
  var click = {
      x: clickX,
      y: clickY
  }
  this.historyHits.push(click);
}

Player.prototype.addToHistoryMiss = function(clickX, clickY){
  var click = {
      x: clickX,
      y: clickY
  }
  this.historyMiss.push(click);
}

/// Function: processStats(arenaWidth,arenaHeight)
/// arenaWidth: The maximum width of the arena
/// arenaHeight: The maximum height of the arena
Player.prototype.processStats = function(arenaWidth, arenaHeight){
  var hq1 = hq2 = hq3 = hq4 = 0;
  var mq1 = mq2 = mq3 = mq4 = 0;
  // The canvas is structured like:
  // *---------------------------------------------*
  // |(0,0)                          (arenaWidth,0)|
  // |                                             |
  // |        II                      I            |
  // |                                             |
  // |                                             |
  // |                                             |
  // |                                             |
  // |                                             |
  // |                                             |
  // |        III                     IV           |
  // |                                             |
  // |                                             |
  // |(0,arenaHeight)      (arenaWidth,arenaHeight)|
  // *---------------------------------------------*

  this.historyHits.forEach(function(hit){
    // Quadrant I is bounded by (x > arenaWidth/2) and (y < arenaHeight/2)
    if(hit.x >= arenaWidth/2 && hit.y < arenaHeight/2){
      hq1++;
    }
    // Quadrant II is bounded by (x < arenaWidth/2) and (y < arenaHeight/2)
    if(hit.x < arenaWidth/2 && hit.y < arenaHeight/2){
      hq2++;
    }
    // Quadrant III is bounded by (x < arenaWidth/2) and (y > arenaHeight/2)
    if(hit.x < arenaWidth/2 && hit.y >= arenaHeight/2){
      hq3++;
    }
    // Quadrant IV is bounded by (x > arenaWidth/2) and (y > arenaHeight/2)
    if(hit.x >= arenaWidth/2 && hit.y >= arenaHeight/2){
      hq4++;
    }
  });

  this.historyMiss.forEach(function(miss){
    // Quadrant I is bounded by (x > arenaWidth/2) and (y < arenaHeight/2)
    if(miss.x >= arenaWidth/2 && miss.y < arenaHeight/2){
      mq1++;
    }
    // Quadrant II is bounded by (x < arenaWidth/2) and (y < arenaHeight/2)
    if(miss.x < arenaWidth/2 && miss.y < arenaHeight/2){
      mq2++;
    }
    // Quadrant III is bounded by (x < arenaWidth/2) and (y > arenaHeight/2)
    if(miss.x < arenaWidth/2 && miss.y >= arenaHeight/2){
      mq3++;
    }
    // Quadrant IV is bounded by (x > arenaWidth/2) and (y > arenaHeight/2)
    if(miss.x >= arenaWidth/2 && miss.y >= arenaHeight/2){
      mq4++;
    }
  });

  var q1Accuracy = 1 - mq1/(hq1+mq1);
  var q2Accuracy = 1 - mq2/(hq2+mq2);
  var q3Accuracy = 1 - mq3/(hq3+mq3);
  var q4Accuracy = 1 - mq4/(hq4+mq4);

  // Figure out where the misses were, i.e. quadrant 1,2,3,4
  d3.select('.q1 span')
            .text(Math.round(q1Accuracy * 100) + '%   ' + hq1 + ' / ' + (hq1+mq1));

  d3.select('.q2 span')
            .text(Math.round(q2Accuracy * 100) + '%   ' + hq2 + ' / ' + (hq2+mq2));

  d3.select('.q3 span')
            .text(Math.round(q3Accuracy * 100) + '%   ' + hq3 + ' / ' + (hq3+mq3));

  d3.select('.q4 span')
            .text(Math.round(q4Accuracy * 100) + '%   ' + hq4 + ' / ' + (hq4+mq4));
  
  // Report Max level reached

  // 

}






