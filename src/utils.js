//----- Global Constants -----
// ARENA
var RING_SIZE = 75;
var RING_SPEED = 4;
var MAX_ENEMIES = 25;
var DEFAULT_ENEMIES = 10;
var TIME_PER_LEVEL_SECONDS = 10;

// PLAYER
var PLAYER_HEAL_AMOUNT = 2;
var PLAYER_LIVES = 10;
var PLAYER_INIT_ACCURACY = 1;

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