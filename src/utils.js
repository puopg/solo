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