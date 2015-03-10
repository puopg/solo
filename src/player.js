var Player = function(){
    this.lives = 100000;
    this.misses = [];
    this.clicks = 0;
    this.missTotal = 0;
    this.accuracy = 1;
    this.currentScore = 0;
    this.highScore = 0;
}

Player.prototype.miss = function(){
    var coordinates = d3.mouse(d3.select("#canvas").node());
    var click = {
        x: coordinates[0],
        y: coordinates[1],
        r: 0,
        id: this.missTotal
    }

    this.misses.push(click);

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
    // Log info about the click
}

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

Player.prototype.updateScores = function(){
    if(this.clicks > 0)
        this.accuracy = (this.clicks-this.missTotal) / this.clicks;

    d3.select('.current span')
              .text(this.currentScore);

    d3.select('.misses span')
              .text(this.missTotal);

    d3.select('.accuracy span')
            .text( Math.round(this.accuracy * 100) + '%');
}