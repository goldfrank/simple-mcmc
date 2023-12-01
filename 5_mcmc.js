const data0 = await d3.csv("/challenger_data.csv");

const string = d3.csvFormat(data0, ["Date", "Temperature", "Incident"]);
const data = d3.csvParse(string, (d) => {
  return {
    Date: d.Date, // lowercase and convert "Year" to Date
    Temperature: +d.Temperature, // convert to number
    Incident: +d.Incident, // convert to number
  };
});

const brown = "#666547"
const red = "#fb2e01"
const blue = '#6fcb9f'
const purple= "#992F66"
const beige = "#ffe28a"
const dark_blue = "#18568E"
const yellow = "#fffeb3"
const time_interval = 300


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


  
function sigmoid(alpha, beta) {
	// console.log(typeof(alpha))
	// console.log(typeof(beta))
	const x_s = d3.range(...[52, 82], 1)
	const y_s = x_s.map((x_s) => 1 - 1 / (1 + Math.pow(Math.E, -(+alpha + +beta * x_s))));
	let points = d3.zip(x_s, y_s);
	// console.log(points)
	return points;
  }

function total_probability(alpha, beta, challenger_data) {
	let total_logprob = 0
	for (const d in challenger_data){
		if (d != 'columns') {
			let prob1 =  1  / (1 + Math.pow(Math.E, (+alpha + (+beta * challenger_data[d].Temperature))));
			let diff = 1 - Math.abs((prob1 - challenger_data[d].Incident));
			// console.log(diff)
			let logprob = Math.log(diff);
			// console.log(logprob)
			total_logprob += logprob;
		}
	};
	return total_logprob;
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

var alpha_sample = gaussianRandom(a_mean, a_variance);
var alpha_sample_density = 	1 / (Math.sqrt(a_variance)*Math.sqrt(2*Math.PI)) * 
Math.exp((-1/2)*Math.pow((alpha_sample-a_mean)/(Math.sqrt(a_variance)),2));
var saved_alpha = alpha_sample

var beta_sample = gaussianRandom(b_mean, b_variance);
var beta_sample_density = 	1 / (Math.sqrt(b_variance)*Math.sqrt(2*Math.PI)) * 
Math.exp((-1/2)*Math.pow((beta_sample-b_mean)/(Math.sqrt(b_variance)),2));
var saved_beta = beta_sample

var current_prob = total_probability(alpha_sample, beta_sample, challenger_data) 


function charts() {

//samples


		
  let normal_data = normal(a_mean, a_variance);
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
		.attr("d", line(normal_data))
		.attr("stroke", beige)
		.attr("fill", a_color)
		.attr("id", "alpha_normal")
		.attr("opacity", 0.7)
		.attr("stroke-width", "1");

	svg.append("circle")
		.attr("cx", "" + xl(alpha_sample))
		.attr("cy", "" + yl(alpha_sample_density))
		.attr("r", 2)
		.attr("fill", brown)
		.attr("id", "alpha_circle")
	
	svg.append("line")
		.attr("x1", xl(alpha_sample))
		.attr("y1", "" + (height-marginBottom))
		.attr("x2", xl(alpha_sample))
		.attr("y2", yl(alpha_sample_density))
		.attr("stroke", "black")
		.attr("stroke-width", 0.5)
		.attr("id", "alpha_vline")


	let normal_data_b = normal(b_mean, b_variance);
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
	  .attr("d", line_r(normal_data_b))
	  .attr("stroke", beige)
	  .attr("fill", b_color)
	  .attr("id", "beta_normal")
	  .attr("opacity", 0.7)
	  .attr("stroke-width", "1");

	  svg.append("circle")
	  .attr("cx", "" + xr(beta_sample))
	  .attr("cy", "" + yr(beta_sample_density))
	  .attr("r", 2)
	  .attr("fill", brown)
	  .attr("id", "beta_circle")
  
  svg.append("line")
	  .attr("x1", xr(beta_sample))
	  .attr("y1", "" + (height-marginBottom))
	  .attr("x2", xr(beta_sample))
	  .attr("y2", yr(beta_sample_density))
	  .attr("stroke", "black")
	  .attr("stroke-width", 0.5)
	  .attr("id", "beta_vline")

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

function resample() {
	//samples
	let old_prob = total_probability(saved_alpha, saved_beta, challenger_data) 
	let saved_sigmoid = sigmoid(saved_alpha, saved_beta);  
	const line = d3.line((d) => x(d[0]), (d) => y(d[1]));
	//console.log("Plotting with" + saved_alpha)
	let svg = d3.select("#mcmc_results")
	svg.append("path")
    	.attr("d", line(saved_sigmoid))
		.attr("stroke", dark_blue)
		.attr("opacity", 0.025)
		.attr("fill", "none")
		.attr("stroke-width", "3");  

	alpha_sample = gaussianRandom(a_mean, a_variance);
	alpha_sample_density = 	1 / (Math.sqrt(a_variance)*Math.sqrt(2*Math.PI)) * 
	Math.exp((-1/2)*Math.pow((alpha_sample-a_mean)/(Math.sqrt(a_variance)),2));
	
	beta_sample = gaussianRandom(b_mean, b_variance);
	beta_sample_density = 	1 / (Math.sqrt(b_variance)*Math.sqrt(2*Math.PI)) * 
	Math.exp((-1/2)*Math.pow((beta_sample-b_mean)/(Math.sqrt(b_variance)),2));
	
	d3.select("#plot6").select("#alpha_circle").transition().duration(time_interval)
	.attr("cx", "" + xl(alpha_sample))
	.attr("cy", "" + yl(alpha_sample_density));

	d3.select("#plot6").select("#alpha_vline").transition().duration(time_interval)
		.attr("x1", xl(alpha_sample))
		.attr("y1", "" + (height-marginBottom))
		.attr("x2", xl(alpha_sample))
		.attr("y2", yl(alpha_sample_density));
	
	d3.select("#plot6").select("#beta_circle").transition().duration(time_interval)
		.attr("cx", "" + xr(beta_sample))
		.attr("cy", "" + yr(beta_sample_density));
	
	d3.select("#plot6").select("#beta_vline").transition().duration(time_interval)
		.attr("x1", xr(beta_sample))
		.attr("y1", "" + (height-marginBottom))
		.attr("x2", xr(beta_sample))
		.attr("y2", yr(beta_sample_density));

	let new_sigmoid = sigmoid(alpha_sample, beta_sample)
	let current_sigmoid = sigmoid(saved_alpha, saved_beta)
	const line2 = d3.line((d) => x(d[0]), (d) => y(d[1]));
	d3.select("#plot7").select("#sigmoid").transition().duration(time_interval)
	.attr("d", line2(new_sigmoid));
	d3.select("#plot7").select("#saved-curve").transition().duration(time_interval)
	.attr("d", line2(current_sigmoid));

	current_prob = total_probability(alpha_sample, beta_sample, challenger_data) 

	  //console.log("Current: " + current_prob);
	  //console.log("Old: " + old_prob)
	  if (current_prob > old_prob){
		//console.log("Accepting")
		saved_alpha = alpha_sample
		saved_beta = beta_sample
	  } else {
		let acceptance_prob = Math.exp(current_prob - old_prob)
		//console.log("Acceptance Probability: " + acceptance_prob)
		if (Math.random() < acceptance_prob){
			//console.log("Accepted")
			saved_alpha = alpha_sample
			saved_beta = beta_sample
		} else {
			current_prob = old_prob
			//console.log("Rejecting")
		}
	  }
	  //console.log("Saved Alpha: " + saved_alpha)
	
	
}


// Specify the chart’s dimensions.
const width1 = 640;
const height1 = 450;
const marginTop1 = 25;
const marginRight1 = 20;
const marginBottom1 = 85;
const marginLeft1 = 40;

var challenger_data = data; 
// Define the horizontal scale.
const x = d3.scaleLinear()
.domain(d3.extent(challenger_data, d => d.Temperature)).nice()
.range([marginLeft, width - marginRight]);

// Define the vertical scale.
const y = d3.scaleLinear()
.domain([-0.1, 1.1])
.range([(height - marginBottom1), marginTop]);

//logistic regression
function chart(sigmoid_data, challenger_data) {

  //calculate if point needs to be jittered
	
	var jitter = {}; // new dict for determining duplicate points
	for (const d in challenger_data){ //loop through and determine dupes
		if (d != 'columns') { // 'columns' is index
			var pair = [challenger_data[d].Temperature, challenger_data[d].Incident];
			if (! (pair in jitter)) {
				jitter[pair] = false;
				challenger_data[d]['jitter'] = 0
			} else {
				jitter[pair] = true;
				challenger_data[d]['jitter'] = 1
			}
		}
	}

   // Create the container SVG.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
	  .attr("id", "mcmc_results")
      .attr("viewBox", [-45, 0, width+45, height]) //adjusted for labels
      .attr("style", "max-width: 100%; height: auto;");

  // Add the axes.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom1})`)
      .call(d3.axisBottom(x))
	  .style('font-family', "Roboto Condensed")
  	  .style("font-size", "0.9rem");

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(
		d3.axisLeft(y)
	  	.tickValues([0,1])
		).style('font-family', "Roboto Condensed")
	  .style("font-size", "0.9rem")

  // Append a circle for each data point.
  svg.append("g")
    .selectAll("circle")
    .data(challenger_data)
    .join("circle")
      .attr("cx", d => x(d.Temperature + (Math.random()*250/width-125/width)*d.jitter))
      .attr("cy", d => y(d.Incident + (Math.random()*14/height-7/height)*d.jitter))
      .attr("r", 6)
	  .attr("opacity", 0.6)
	  .style("fill", d => (d.Incident == 1) ? red : blue);


	  
	//console.log(current_prob)
  	
svg.append("g")

  const line = d3.line((d) => x(d[0]), (d) => y(d[1]));
  svg.append("path")
    .attr("d", line(sigmoid_data))
	.attr("stroke", brown)
	.attr("fill", "none")
	.attr("id", "sigmoid")
	.attr("stroke-width", "3");

	svg.append("path")
    .attr("d", line(sigmoid_data))
	.attr("stroke", purple)
	.attr("fill", "none")
	.attr("id", "saved-curve")
	.attr("opacity", 0.3)
	.attr("stroke-width", "5");

 
	const legend2 = svg.append("g")
	.attr("transform", "translate(" + (width/2-marginLeft) + "," + (height-marginBottom1/5) + ")")
	legend2
	.append('text')
	.text("Temperature (°F)")
	.attr("id", "legend_1_bottom")
	.style('font-family', 'Roboto Condensed')
	.style("font-size", "1.0rem")

	const legend3 = svg.append("g")
	.attr("transform", "translate(" + (-20) + "," + (height/2-marginTop) + ")")
	legend3
	.append('text')
	.text("p(t)")
	.attr("id", "legend_1_bottom")
	.style('font-family', 'serif')
	.style('font-style', 'italic')
	.style("font-size", "1.2rem")
  
	
	

  return svg.node();
}




var div = document.querySelector("#plot6");
div.append(charts());

var div = document.querySelector("#plot7");
let new_sigmoid = sigmoid(alpha_sample, beta_sample);
div.append(chart(new_sigmoid, challenger_data));

var Timer;

d3.select('#resample_button3').on("click", function() {
	Timer = setInterval(resample, time_interval);		
	}
)

d3.select('#resample_button4').on("click", function() {
	clearInterval(Timer);
	}
)