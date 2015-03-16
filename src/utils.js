//----- Global Constants -----
// ARENA
var RING_SIZE = 75;
var RING_SPEED = 4;
var MAX_ENEMIES = 25;
var DEFAULT_ENEMIES = 10;
var TIME_PER_LEVEL_SECONDS = 10;
var ARENA_WIDTH = 0;
var ARENA_HEIGHT = 0;

// PLAYER
var PLAYER_HEAL_AMOUNT = 2;
var PLAYER_HEAL_FREQ = 3;
var PLAYER_LIVES = 10;
var PLAYER_INIT_ACCURACY = 1;

// SHOT
var SHOT_DURATION = 200;
var SHOT_SIZE = 3;

// TARGET
var TARGET_SIZE = 8;
//----- Global Constants End -----
var getRandomArbitrary = function(min, max) {
  return Math.random() * (max - min) + min;
}

var setDeceleratingTimeout = function( callback, factor, times )
{
  var internalCallback = function( t, counter )
  {
    return function()
    {
      if ( --t > 0 )
      {
        window.setTimeout( internalCallback, factor*1000 );
        callback();
      }
    }
  }( times, 0 );

  window.setTimeout( internalCallback, factor*1000 );
};

var lineDistance = function(x1,y1,x2,y2)
{
  var xs = 0;
  var ys = 0;
 
  xs = x2 - x1;
  xs = xs * xs;
 
  ys = y2- y1;
  ys = ys * ys;
 
  return Math.sqrt( xs + ys );
}