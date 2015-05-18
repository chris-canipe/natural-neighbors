var initData = 'co-national-parks.geojson';
var overlay;
var pointRadius = 5;
var SVG_OVERLAY_CLASS = 'SvgOverlay'
// The center of Colorado
var mapCenter = new google.maps.LatLng(39, -105.547222);
// Ala http://stackoverflow.com/a/12027910
var projectionOffset = 4000;

// Convert coordinates to pixels.
var googleMapProjection = function (projection, coords) {
  var googleCoords = new google.maps.LatLng(coords[1], coords[0]);
  var pixelCoords = projection.fromLatLngToDivPixel(googleCoords);
  return [
    pixelCoords.x + projectionOffset,
    pixelCoords.y + projectionOffset
  ];
};

// Google Map Initialization
var map = new google.maps.Map(
  document.getElementById('map_canvas'),
  {
    zoom: 7,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    center: mapCenter
  }
);

// Overlays are how one adds objects to Google Maps.
// They are tied to coordinates and adhere to drag/zoom.
neighborhoodOverlay.prototype = new google.maps.OverlayView();
function neighborhoodOverlay(map, pointjson) {
  this.pointjson = pointjson;
  this.svgoverlay = null;
  this.setMap(map);

  this.onAdd = function() {
    var layer = d3
      .select(this.getPanes().overlayMouseTarget)
      .append("div")
      .classed(SVG_OVERLAY_CLASS, true);
    var svg = layer.append("svg");
    this.svgoverlay = svg.append("g");
  };

  this.draw = function() {
    var projection = this.getProjection();
    var points = this.pointjson.features;
    var pixelPositions = [];

    points.forEach(function(d) {
      pixelPositions.push(
        googleMapProjection(
          projection,
          d.geometry.coordinates
        )
      );
    });

    /* Set up tooltips */
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return d.properties.Name;
      });
    this.svgoverlay.call(tip);

    /* Draw neighborhoods */
    // (M)ove to the first point and draw a
    // (L)ine to each other point.
    // Finally, close the path (Z).
    var polygons = d3.geom.voronoi(pixelPositions);
    var pathDescription = {
      "d": function(d, i) {
        return "M" + polygons[i].join("L") + "Z"
      }
    };
    this.svgoverlay.selectAll("path")
      .data(points)
      .attr(pathDescription)
      .enter()
      .append("path")
      .classed("neighborhood", true)
      .attr(pathDescription);

    /* Draw points */
    var pointAttr = {
      "cx": function(d, i) { return pixelPositions[i][0] },
      "cy": function(d, i) { return pixelPositions[i][1] },
      "r": pointRadius
    };
    this.svgoverlay.selectAll("circle")
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

function main(pointjson) {
  d3.selectAll('.' + SVG_OVERLAY_CLASS).remove();
  overlay = new neighborhoodOverlay(map, pointjson);
};

function change_data_source() {
  var geojson = this.options[this.selectedIndex].value;
  d3.json(geojson, function(pointjson){
    main(pointjson);
  });
};

d3.select('#data_source')
  .on('change', change_data_source);

d3.json(initData, function(pointjson){
  main(pointjson);
});
