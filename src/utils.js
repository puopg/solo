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
        window.setTimeout( internalCallback, factor );
        callback();
      }
    }
  }( times, 0 );

  window.setTimeout( internalCallback, factor );
};