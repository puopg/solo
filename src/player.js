var Player = function(){
    this.lives = 10;
    this.misses = [];
    this.historyHits = [];
    this.historyMiss = [];
    this.clicks = 0;
    this.missTotal = 0;
    this.accuracy = 1;
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
    var coordinates = d3.mouse(d3.select("#canvas").node());
    console.log('x: ' + coordinates[0] + 'y: ' + coordinates[1]);
    var click = {
        x: coordinates[0],
        y: coordinates[1],
        r: 0,
        id: this.missTotal
    }

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
    this.updateScores();

    // If you really suck...
    if(this.currentScore <= -100){
      document.dispatchEvent(endEvent);
    }

    // Log info about the click
}
Player.prototype.heal = function(){
  console.log('Player heals for 3!');

  if(this.lives+3 >= 10)
    this.lives = 10;
  else
    this.lives += 3;
}

Player.prototype.hurtPlayer = function(){
    this.lives--;
    d3.select('.lives span')
              .text(this.lives);
}
//----- Click actions End -----

//----- Click Animations -----
Player.prototype.clickAnimation = function() {
    this.misses.forEach(function(miss){
      miss.r += 4;
    });

    var misses = d3.select('#arena').selectAll('circle.miss')
                          .data(this.misses)

    // Update enemy radius and state
    misses.attr('r',  function(d) {return d.r;})
}


Player.prototype.removeClick = function(){
  for(var i = this.misses.length-1; i >=0 ; i--){
    if(this.misses[i].r > 75)
      this.misses.splice(i,1);
  }

  var misses = d3.select('#arena').selectAll('circle.miss')
                        .data(this.misses,function(d) {return d.id;})
                        .exit().remove();
}
//----- Click Animations End-----


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

Player.prototype.processStats = function(arenaWidth, arenaHeight){
  var hq1 = hq2 = hq3 = hq4 = 0;
  var mq1 = mq2 = mq3 = mq4 = 0;
  // The canvas is structured like:
  // *---------------------------------------------*
  // |(0,0)                          (arenaWidth,0)|
  // |                                             |
  // |      II                        I            |
  // |                                             |
  // |                                             |
  // |                                             |
  // |                                             |
  // |                                             |
  // |                                             |
  // |      III                       IV           |
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






