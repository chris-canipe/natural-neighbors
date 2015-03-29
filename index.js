d3.json('co-national-forests.geojson', function(pointjson){
  main(pointjson);
});

function main(pointjson) {

  var mapCenter = new google.maps.LatLng(39.7392, -104.9903);

  // Google Map Initialization
  var map = new google.maps.Map(document.getElementById('map_canvas'), {
    zoom: 7,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: mapCenter
  });

  var overlay = new google.maps.OverlayView(); // OverLay Creating Objects

  // Overlay Additional
  overlay.onAdd = function () {

    var layer = d3.select(this.getPanes().overlayLayer).append("div").attr("class", "SvgOverlay");
    var svg = layer.append("svg");
    var svgoverlay = svg.append("g").attr("class", "AdminDivisions");

    // Callback for Redrawing
    overlay.draw = function () {
      var markerOverlay = this;
      var overlayProjection = markerOverlay.getProjection();

      // Google Map Projection Set
      var googleMapProjection = function (coordinates) {
        var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
        var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
        return [pixelCoordinates.x + 4000, pixelCoordinates.y + 4000];
      }

      // Mother Point Position Information
      var pointdata = pointjson.features;

      // Pixel Position Information
      var positions = [];

      pointdata.forEach(function(d) {
        positions.push(googleMapProjection(d.geometry.coordinates)); // Convert position information to pixels
      });

      // Voronoi Conversion Function
      var polygons = d3.geom.voronoi(positions);

      var pathAttr ={
        "d":function(d, i) { return "M" + polygons[i].join("L") + "Z"}
      };

      // State Representation
      svgoverlay.selectAll("path")
        .data(pointdata)
        .attr(pathAttr)
        .enter()
        .append("svg:path")
        .attr("class", "cell")
        .attr(pathAttr)

      var circleAttr = {
            "cx":function(d, i) { return positions[i][0]; },
            "cy":function(d, i) { return positions[i][1]; },
            "r":3
      }

      // Mother Dots
      svgoverlay.selectAll("circle")
        .data(pointdata)
        .attr(circleAttr)
        .enter()
        .append("svg:circle")
        .attr(circleAttr)

    };

  };

  // Overlay the SVG onto the map
  overlay.setMap(map);
};
