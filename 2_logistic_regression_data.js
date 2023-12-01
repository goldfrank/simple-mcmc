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
const beige = "#ffe28a"
const yellow = "#fffeb3"

let current_alpha = -20;
let current_beta = .3;



// Specify the chart’s dimensions.
const width = 640;
const height = 450;
const marginTop = 25;
const marginRight = 20;
const marginBottom = 85;
const marginLeft = 40;

var challenger_data = data; 
// Define the horizontal scale.
const x = d3.scaleLinear()
.domain(d3.extent(challenger_data, d => d.Temperature)).nice()
.range([marginLeft, width - marginRight]);

// Define the vertical scale.
const y = d3.scaleLinear()
.domain([-0.1, 1.1])
.range([(height - marginBottom), marginTop]);

function sigmoid(alpha, beta) {
	// console.log(typeof(alpha))
	// console.log(typeof(beta))
	const x_s = d3.range(...[52, 82], 1)
	const y_s = x_s.map((x_s) => 1 - 1 / (1 + Math.pow(Math.E, -(+alpha + +beta * x_s))));
	let points = d3.zip(x_s, y_s);
	// console.log(points)
	return points;
  }

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
      .attr("viewBox", [-45, 0, width+45, height]) //adjusted for labels
      .attr("style", "max-width: 100%; height: auto;");

  // Add the axes.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
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
	  //.on('mouseover', (event, d) => console.log(d.Date));

  //svg.selectAll("text")
  	
svg.append("g")




  const line = d3.line((d) => x(d[0]), (d) => y(d[1]));
  svg.append("path")
    .attr("d", line(sigmoid_data))
	.attr("stroke", brown)
	.attr("fill", "none")
	.attr("id", "sigmoid")
	.attr("stroke-width", "3");


	const legend = svg.append("g")
    .attr("transform", "translate(" + (marginLeft*2) + "," + (height) + ")")
	legend
    .append('text')
    .text("α:" + current_alpha + "\u00A0 \u00A0 \u00A0 \u00A0" +  "β:" + current_beta)
	.attr("id", "legend1")
	.style('font-family', 'serif')
	  .style("font-size", "1.2rem")
  
	const legend2 = svg.append("g")
	.attr("transform", "translate(" + (width/2-marginLeft) + "," + (height-marginBottom/2) + ")")
	legend2
	.append('text')
	.text("Temperature (°F)")
	.attr("id", "legend_1_bottom")
	.style('font-family', 'Roboto Condensed')
	.style("font-size", "1.0rem")

	const legend3 = svg.append("g")
	.attr("transform", "translate(" + (0) + "," + (height/2-marginTop) + ")")
	legend3
	.append('text')
	.text("p(t)")
	.attr("id", "legend_1_bottom")
	.style('font-family', 'serif')
	.style('font-style', 'italic')
	.style("font-size", "1.2rem")
  

  return svg.node();
}


function update_chart(data){
	const line = d3.line((d) => x(d[0]), (d) => y(d[1]));
	d3.select("#plot2").select("#sigmoid").transition().duration(1000)
	.attr("d", line(data));
	
	
	d3.select("#plot2").select("#legend").transition().duration(1000)
	.text("α:" + current_alpha + "\u00A0 \u00A0 \u00A0 \u00A0" +  "β:" + current_beta)
	
}

const div = document.querySelector("#plot2");

let new_sigmoid = sigmoid(current_alpha, current_beta);
div.append(chart(new_sigmoid, challenger_data));

d3.select("#slider2").on("input", function() {
    var currentValue = this.value;
	new_sigmoid = sigmoid(current_alpha, currentValue)
	current_beta = currentValue;
	update_chart(new_sigmoid);
	})

d3.select("#slider3").on("input", function() {
	var currentValue = this.value;
	new_sigmoid = sigmoid(currentValue, current_beta)
	current_alpha = currentValue;
	update_chart(new_sigmoid);
	})