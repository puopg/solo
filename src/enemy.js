var Enemy = function(arenaWidth, arenaHeight, id){
    // Private Members
    this.x = getRandomArbitrary(0.05,0.95) * arenaWidth;
    this.y = getRandomArbitrary(0.05,0.95) * arenaHeight;
    this.id = id;

    // Public Members
    this.r = 0;
    this.maxSize = 30;
    this.growRate = 0.5;
    
    this.state = 'grow';
}

// Spawn enemy into arena
Enemy.prototype.grow = function(){
    if(this.r === this.maxSize && this.state === 'grow')
        this.state = 'shrink';

    else if(this.r === 0 && this.state === 'shrink')
        this.state = 'dead';

    else if(this.r < this.maxSize && this.state === 'grow')
        this.r += this.growRate;

    else if(this.state === 'shrink')
        this.r -= this.growRate;
}

Enemy.prototype.deathAnimation = function(arr){
    var click = {
        x: this.x,
        y: this.y,
        r: 10,
        id: this.id
    }
    arr.push(click);

    var death = d3.select('#arena').selectAll('circle.death')
                                    .data(arr, function(d) {return d.id});

    death.enter().append('svg:circle')
           .attr('class', 'death')
           .attr('cx', function(d) {return d.x;} )
           .attr('cy', function(d) {return d.y;} )
           .attr('r',  function(d) {return d.r;} )
}
// Remove enemy from arena

// 