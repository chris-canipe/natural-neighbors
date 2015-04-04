var pointRadius = 5;
var initData = 'co-national-parks.geojson';
// The center of Colorado
var mapCenter = new google.maps.LatLng(39, -105.547222);
// Ala http://stackoverflow.com/a/12027910
var projectionOffset = 4000;

// Convert coordinates to pixels.
var googleMapProjection = function (overlayProjection, coords) {
  var googleCoords = new google.maps.LatLng(coords[1], coords[0]);
  var pixelCoords = overlayProjection.fromLatLngToDivPixel(googleCoords);
  return [
    pixelCoords.x + projectionOffset,
    pixelCoords.y + projectionOffset
  ];
};

d3.json(initData, function(pointjson){
  main(pointjson);
});

function main(pointjson) {

  // Google Map Initialization
  var map = new google.maps.Map(
    document.getElementById('map_canvas'),
    {
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      center: mapCenter
    }
  );

  var overlay = new google.maps.OverlayView(); // OverLay Creating Objects

  // Overlay Additional
  overlay.onAdd = function () {

    var layer = d3
      .select(this.getPanes().overlayMouseTarget)
      .append("div")
      .classed("SvgOverlay", true);
    var svg = layer.append("svg");
    var svgoverlay = svg.append("g");

    // Callback for Redrawing
    overlay.draw = function () {
      var markerOverlay = this;
      var overlayProjection = markerOverlay.getProjection();

      // Mother Point Position Information
      var points = pointjson.features;

      // Pixel Position Information
      var positions = [];

      points.forEach(function(d) {
        // Convert position information to pixels
        positions.push(googleMapProjection(overlayProjection, d.geometry.coordinates));
      });

      var polygons = d3.geom.voronoi(positions);

      /* Set up tooltips */
      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return d.properties.Name;
        });
      svgoverlay.call(tip);

      /* Draw neighborhoods */
      // (M)ove to the first point and draw a
      // (L)ine to each other point.
      // Finally, close the path (Z).
      var pathDescription = {
        "d": function(d, i) {
          return "M" + polygons[i].join("L") + "Z"
        }
      };
      svgoverlay.selectAll("path")
        .data(points)
        .attr(pathDescription)
        .enter()
        .append("path")
        .classed("neighborhood", true)
        .attr(pathDescription);

      /* Draw points */
      var pointAttr = {
        "cx": function(d, i) { return positions[i][0] },
        "cy": function(d, i) { return positions[i][1] },
        "r": pointRadius
      };
      svgoverlay.selectAll("circle")
        .data(points)
        .attr(pointAttr)
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
