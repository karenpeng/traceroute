var MODE = 0;
// 0 color
// 1 opacity
// 2 light

var json;

var colorPalette = [
  '#00ffff',
  // '#00ff99',
  // '#00ff33',
  // '#ccff00',
  '#ffff00',
  '#ffcc00',
  '#ff9900',
  '#ff6600',
  '#ff3300',
  '#ff0077',
]


$(document).ready(function() {
  $.ajax({
    url: "universities.json",
    dataType: "text",
    success: function(data) {
      //console.log(data);
      json = $.parseJSON(data);
    }
  });
});



function initialize() {

  //////////////////////////////////////////////////  stylize

  // Create an array of styles.
  var styles = [
    {
      stylers: [
        { hue: "#FFFFFF" },
        { saturation: -100 },
        { lightness: 20 },
        { gamma: 0.80 },
        { invert_lightness: true }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: -50 },
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];  
  // Create a new StyledMapType object, passing it the array of styles,
  // as well as the name to be displayed on the map type control.
  var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});



  // Create a map object, and include the MapTypeId to add
  // to the map type control.
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(37.09024, -95.712891),
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    }
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');



  ////////////////////////////////////////////////// circle & polyline

  for (var j=0; j<json.universities.length; j++) {
    
    
    //var lineCoordinates = [];
    
    var preLocation;
    // var preLat;
    // var preLng;

    var tColor;
    var tOpacity;
    var tSize;
    var tStrokeWeight;

    for (var i=0; i<json.universities[j].locs.length; i++) {

      var lat = json.universities[j].locs[i][0];
      var lng = json.universities[j].locs[i][1];

      // var rptAmt = 0.001;
      // if (lat == preLat) lat += rptAmt;
      // if (lng == preLng) lng += rptAmt;

      var location = new google.maps.LatLng(lat, lng);
      var speed = json.universities[j].speed[i]*0.6;

      switch(MODE) {
        case 0:
          var colorIndex = Math.floor(speed*0.11);
          if (colorIndex > colorPalette.length-1) colorIndex = colorPalette.length-1;
          tColor = colorPalette[colorIndex];
          tOpacity = 0.5;
          tSize = 1000 + speed*500;
          tStrokeWeight = 1;
          break;
        case 1:
          tColor = '#ff3300';
          tOpacity = 0.3 + speed/10;
          if (tOpacity > 1) tOpacity = 1;
          tSize = 10000 + speed*300;
          tStrokeWeight = 1;
          break;
         case 2:
          tColor = '#ccff00';
          tOpacity = 1 - speed/50;
          if (tOpacity > 1) tOpacity = 1;
          tSize = 500 + speed*500;
          tStrokeWeight = 1;
          break;
      }

      
      var circleOptions = {
        strokeColor: tColor,
        strokeOpacity: tOpacity,
        strokeWeight: tStrokeWeight*2,
        fillColor: tColor,
        fillOpacity: tOpacity/3,
        map: map,
        center: location,
        radius: tSize //Math.sqrt(citymap[city].population) * 10
      };
      // Add the circle for this city to the map.
      var circle = new google.maps.Circle(circleOptions);

      // draw polyline
      if (i > 0){
        var lineCoordinates = [preLocation, location];
        //lineCoordinates.push(location);

        var linePath = new google.maps.Polyline({
          path: lineCoordinates,
          geodesic: false,
          strokeColor: tColor,
          strokeOpacity: tOpacity,
          strokeWeight: tStrokeWeight
        });
        linePath.setMap(map);
      }

      preLocation = location;
      // preLat = lat;
      // preLng = lng;
    }
  }
}


////////// Asynchronous Loading //////////

// instead of the line below:
// google.maps.event.addDomListener(window, 'load', initialize);

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&' +
      'callback=initialize';
  document.body.appendChild(script);
}

window.onload = loadScript;




