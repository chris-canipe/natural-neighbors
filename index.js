// The center of Colorado
var mapCenter = new google.maps.LatLng(39, -105.547222);

var pointRadius = 5;

d3.json('co-national-parks.geojson', function(pointjson){
  main(pointjson);
});

function main(pointjson) {

  // Google Map Initialization
  var map = new google.maps.Map(document.getElementById('map_canvas'), {
    zoom: 7,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    center: mapCenter
  });

  var overlay = new google.maps.OverlayView(); // OverLay Creating Objects

  // Overlay Additional
  overlay.onAdd = function () {

    var layer = d3.select(this.getPanes().overlayMouseTarget).append("div").attr("class", "SvgOverlay");
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

      // (M)ove to the first point and draw a
      // (L)ine to each other point.
      // Finally, close the path (Z).
      var pathDescription ={
        "d":function(d, i) { return "M" + polygons[i].join("L") + "Z"}
      };

      // State Representation
      svgoverlay.selectAll("path")
        .data(pointdata)
        .enter()
        .append("svg:path")
        .attr("class", "neighborhood")
        .attr(pathDescription)

      var pointAttr = {
        "cx": function(d, i) { return positions[i][0] },
        "cy": function(d, i) { return positions[i][1] },
        "r": pointRadius
      };

      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return d.properties.Name;
        });

      svgoverlay.call(tip);

      // Mother Dots
      svgoverlay.selectAll("circle")
        .data(pointdata)
        .enter()
        .append("circle")
        .attr(pointAttr)
        .classed('point', true)
        .on('mouseover', function(d) {
          tip.show(d);
          d3.select(this)
            .classed('mouseover', true)
            .classed('mouseout', false);
        })
        .on('mouseout', function(d) {
          tip.hide(d);
          d3.select(this)
            .classed('mouseover', false)
            .classed('mouseout', true);
        });
    };

  };

  // Overlay the SVG onto the map
  overlay.setMap(map);
};

function change_data_source() {
  var geojson = this.options[this.selectedIndex].value;
  d3.json(geojson, function(pointjson){
    main(pointjson);
  });
};

d3.select('#data_source')
  .on('change', change_data_source);
