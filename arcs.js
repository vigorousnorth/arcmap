  		
var svg,
		width = 900,
    height = 700;

var projection = d3.geo.mercator()
		.rotate([-10,0]).scale(height/5).translate([width / 2, height / 2]).clipExtent([[0,0.1*height],[width,height*0.85]]);

var path = d3.geo.path()
    .projection(projection);

var graticule = d3.geo.graticule();

var path = d3.geo.path()
	.projection(projection);
 
d3.json("world-110m.json", function(error, world) {

	var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);
    
	svg.append("path")
		.datum(graticule)
		.attr("class", "graticule")
		.attr("d", path);
	
	svg.insert("path", ".graticule")
		.datum(topojson.feature(world, world.objects.land))
		.attr("class", "land")
		.attr("d", path);

	svg.insert("path", ".graticule")
		.datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
		.attr("class", "boundary")
		.attr("d", path);
		
	drawarcs(svg);

d3.select(self.frameElement).style("height", height + "px");

});

var tradedata = [
  {
 			destination: {latitude: -23.3, longitude: 132.2},
 			name: 'Australia',
 			trade: 5
 	},{
      destination: { latitude: -28.5, longitude: 24.7 },
      name: 'South Africa',
      trade : 6
  },{
      destination: { latitude: 31.7, longitude: 106.2 },
      name: 'China',
      trade : 16
  },{
      destination: { latitude: 36.1, longitude: 127.7 },
      name: 'S. Korea',
      trade: 8
  },{
      destination: { latitude: 53.6, longitude: -2.3},
      name: 'Great Britain',
      trade: 12
  },{
      destination: { latitude: 61.2, longitude: 9.7144087 },
      name: 'Norway',
      trade: 2
  },{
      destination: { latitude: 61.6, longitude: 15.4 },
      name: 'Sweden',
      trade: 5
  },{
      destination: { latitude: 64.93, longitude: -19.02},
      name: 'Iceland',
      trade: 15
  },{
      destination: { latitude: 20.9, longitude: -101.5 },
      name: 'Mexico',
      trade: 15
  },{
      destination: { latitude: -14.0, longitude: -47.643501 },
      name: 'Brazil',
      trade: 12
 },{
      destination: {  latitude: 55.86, longitude: -112.1 },
      name: 'Canada',
      trade: 32
  }
];

function drawarcs(svg) {

	var arcs = svg.append("g").selectAll('path.datamaps-arc').data( tradedata, JSON.stringify );

	arcs
		.enter()
		.append('path')
		.attr('class','arc')
		.attr('d', function(datum) {
			var origin = projection([-69.445469,45.253783]);
			var dest = projection([datum.destination.longitude, datum.destination.latitude]);
			var mid = [ (origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2];
			
			//define handle points for Bezier curves. Higher values for curveoffset will generate more pronounced curves.
			var curveoffset = 20,
				midcurve = [mid[0]+curveoffset, mid[1]-curveoffset]
		
			// the scalar variable is used to scale the curve's derivative into a unit vector 
			scalar = Math.sqrt(Math.pow(dest[0],2) - 2*dest[0]*midcurve[0]+Math.pow(midcurve[0],2)+Math.pow(dest[1],2)-2*dest[1]*midcurve[1]+Math.pow(midcurve[1],2));
		
			// define the arrowpoint: the destination, minus a scaled tangent vector, minus an orthogonal vector scaled to the datum.trade variable
			arrowpoint = [ 
				dest[0] - ( 0.5*datum.trade*(dest[0]-midcurve[0]) - datum.trade*(dest[1]-midcurve[1]) ) / scalar , 
				dest[1] - ( 0.5*datum.trade*(dest[1]-midcurve[1]) - datum.trade*(-dest[0]+midcurve[0]) ) / scalar	
			];

			// move cursor to origin
			return "M" + origin[0] + ',' + origin[1] 
			// smooth curve to offset midpoint
				+ "S" + midcurve[0] + "," + midcurve[1]
			//smooth curve to destination	
				+ "," + dest[0] + "," + dest[1]
			//straight line to arrowhead point
				+ "L" + arrowpoint[0] + "," + arrowpoint[1] 
			// straight line towards original curve along scaled orthogonal vector (creates notched arrow head)
				+ "l" + (0.3*datum.trade*(-dest[1]+midcurve[1])/scalar) + "," + (0.3*datum.trade*(dest[0]-midcurve[0])/scalar)
				// smooth curve to midpoint	
				+ "S" + (midcurve[0]) + "," + (midcurve[1]) 
				//smooth curve to origin	
				+ "," + origin[0] + "," + origin[1]
		});
	
	arcs.exit()
		.transition()
		.style('opacity', 0)
		.remove();

}

