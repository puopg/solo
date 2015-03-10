var Player = function(){
    this.lives = 5;
    this.misses = [];
    this.missTotal = 0;
}

Player.prototype.miss = function(){
    var coordinates = d3.mouse(d3.select("#canvas").node());
    var click = {
        x: coordinates[0],
        y: coordinates[1],
        r: 0,
        id: this.missTotal
    }
    this.missTotal++;

    this.misses.push(click);

    var miss = d3.select('#arena').selectAll('circle.miss')
                                    .data(this.misses, function(d) {return d.id});

    miss.enter().append('svg:circle')
           .attr('class', 'miss')
           .attr('cx', function(d) {return d.x;} )
           .attr('cy', function(d) {return d.y;} )
           .attr('r',  function(d) {return d.r;} )

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
