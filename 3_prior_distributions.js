const brown = "#666547"
const red = "#fb2e01"
const blue = '#6fcb9f'
const beige = "#ffe28a"
const yellow = "#fffeb3"


// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean=0, variance=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * Math.sqrt(variance) + mean;
}

function normal(mean, variance) {
	const x = d3.range(...[mean-5*Math.sqrt(variance), mean+5*Math.sqrt(variance)], Math.sqrt(variance)/20)
	const y = x.map(
		(x) => 
		1 / (Math.sqrt(variance)*Math.sqrt(2*Math.PI)) * Math.exp(-1/2*Math.pow((x-mean)/(Math.sqrt(variance)),2))
	);
	let points = d3.zip(x, y);
	// console.log(points)
	return points;
  }

// Specify the chart’s dimensions.
const width = 640;
const height = 450;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 20;
const marginLeft = 20;
const subwidth = 320;
const gap = 20;

// alpha
const a_mean = -20;
const a_variance = 5;
const a_color = red;

// Define the left horizontal scale.
const xl = d3.scaleLinear()
.domain([a_mean-3*Math.sqrt(a_variance), a_mean+3*Math.sqrt(a_variance)]).nice()
.range([marginLeft, subwidth - marginRight - gap]);


// Define the left vertical scale.
const central_l = 1 / (Math.sqrt(a_variance)*Math.sqrt(2*Math.PI)) * 
Math.exp(-1/2*Math.pow((0)/(Math.sqrt(a_variance)),2));

const yl = d3.scaleLinear()
.domain([0, central_l*1.2])
.range([(height - marginBottom), marginTop]);

// beta
const b_mean = 0.3;
const b_variance = 0.03;
const b_color = blue;

// Define the right horizontal scale.
const xr = d3.scaleLinear()
.domain([b_mean-4*Math.sqrt(b_variance), b_mean+4*Math.sqrt(b_variance)]).nice()
.range([marginLeft + subwidth + gap, width - marginRight]);


// Define the right vertical scale.
const central_r = 1 / (Math.sqrt(b_variance)*Math.sqrt(2*Math.PI)) * 
Math.exp(-1/2*Math.pow((0)/(Math.sqrt(b_variance)),2));

const yr = d3.scaleLinear()
.domain([0, central_r*1.2])
.range([(height - marginBottom), marginTop]);


function charts() {

//samples
var alpha_sample = gaussianRandom(a_mean, a_variance);
var alpha_sample_density = 	1 / (Math.sqrt(a_variance)*Math.sqrt(2*Math.PI)) * 
Math.exp((-1/2)*Math.pow((alpha_sample-a_mean)/(Math.sqrt(a_variance)),2));

var beta_sample = gaussianRandom(b_mean, b_variance);
var beta_sample_density = 	1 / (Math.sqrt(b_variance)*Math.sqrt(2*Math.PI)) * 
Math.exp((-1/2)*Math.pow((beta_sample-b_mean)/(Math.sqrt(b_variance)),2));

		
  var data = normal(a_mean, a_variance);
   // Create the container SVG.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-45, 0, width+45, height]) //adjusted for labels
      .attr("style", "max-width: 100%; height: auto;");

  // Add the axes.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xl).ticks(5))
	  .style('font-family', "Roboto Condensed")
  	  .style("font-size", "0.9rem");

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(
		d3.axisLeft(yl)
		).style('font-family', "Roboto Condensed")
	  .style("font-size", "0.9rem")


	const line = d3.line((d) => xl(d[0]), (d) => yl(d[1]));

	svg.append("path")
		.attr("d", line(data))
		.attr("stroke", beige)
		.attr("fill", a_color)
		.attr("id", "alpha_normal")
		.attr("opacity", 0.7)
		.attr("stroke-width", "1");




	data = normal(b_mean, b_variance);
	// Add the axes.
	svg.append("g")
	.attr("transform", `translate(0,${height - marginBottom})`)
	.call(d3.axisBottom(xr).ticks(5))
	.style('font-family', "Roboto Condensed")
	  .style("font-size", "0.9rem");

	svg.append("g")
	.attr("transform", `translate(${marginLeft + subwidth + gap},0)`)
	.call(
	  d3.axisLeft(yr)
	  ).style('font-family', "Roboto Condensed")
	.style("font-size", "0.9rem")


  const line_r = d3.line((d) => xr(d[0]), (d) => yr(d[1]));	
  svg.append("path")
	  .attr("d", line_r(data))
	  .attr("stroke", beige)
	  .attr("fill", b_color)
	  .attr("id", "beta_normal")
	  .attr("opacity", 0.7)
	  .attr("stroke-width", "1");

const legend_l = svg.append("g")
.attr("transform", "translate(" + (marginLeft*2) + "," + (marginTop*2) + ")")
legend_l
.append('text')
.text("α")
.attr("id", "legend")
.style('font-family', 'serif')
.style("font-size", "1.4rem")

const legend_4 = svg.append("g")
.attr("transform", "translate(" + ((marginLeft*2 + gap + subwidth)) + "," + (marginTop*2) + ")")
legend_4
.append('text')
.text("β")
.attr("id", "legend")
.style('font-family', 'serif')
.style("font-size", "1.4rem")

  return svg.node();
}




var div = document.querySelector("#plot3");
div.append(charts());

