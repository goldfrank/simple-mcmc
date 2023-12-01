//const data0 = await d3.csv("/challenger_data.csv");
// console.log(data0)
//const string = d3.csvFormat(data0, ["Date", "Temperature", "Incident"]);
// const data = d3.csvParse(string, (d) => {
//   return {
//     Date: d.Date, // lowercase and convert "Year" to Date
//     Temperature: +d.Temperature, // convert to number
//     Incident: +d.Incident, // convert to number
//   };
// });

const brown = "#666547"
const red = "#fb2e01"
const blue = '#6fcb9f'
const beige = "#ffe28a"
const yellow = "#fffeb3"

let current_alpha = 0.0;
let current_beta = 1;

function sigmoid(alpha, beta) {
	//console.log(typeof(alpha))
	// console.log(typeof(beta))
	const x = d3.range(...[-4, 4], 0.1)
	const y = x.map((x) => 1 - 1 / (1 + Math.pow(Math.E, -(+alpha + +beta * x))));
	let points = d3.zip(x, y);
	// console.log(points)
	return points;
  }

// Specify the chart’s dimensions.
const width = 640;
const height = 450;
const marginTop = 25;
const marginRight = 20;
const marginBottom = 85;
const marginLeft = 40;

// Define the horizontal scale.
const x = d3.scaleLinear()
	.domain([-4, 4]).nice()
	.range([marginLeft, width - marginRight]);

// Define the vertical scale.
const y = d3.scaleLinear()
	.domain([-0.1, 1.1])
	.range([(height - marginBottom), marginTop]);

function chart(data) {



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


  //svg.selectAll("text")
  	
svg.append("g")




  const line = d3.line((d) => x(d[0]), (d) => y(d[1]));
//   console.log(line(data))
  svg.append("path")
    .attr("d", line(data))
	.attr("stroke", brown)
	.attr("fill", "none")
	.attr("id", "sigmoid")
	.attr("stroke-width", "3");
//  console.log(data)

 const legend = svg.append("g")
    .attr("transform", "translate(" + (marginLeft*2) + "," + (height) + ")")
	legend
    .append('text')
    .text("α:" + current_alpha + "\u00A0 \u00A0 \u00A0 \u00A0" +  "β:" + current_beta)
	.attr("id", "legend1")
	.style('font-family', 'serif')
	  .style("font-size", "1.2rem")
  
	const legend2 = svg.append("g")
	.attr("transform", "translate(" + (width/2) + "," + (height-marginBottom/2) + ")")
	legend2
	.append('text')
	.text("t")
	.attr("id", "legend_1_bottom")
	.style('font-family', 'serif')
	.style('font-style', 'italic')
	.style("font-size", "1.2rem")

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
	d3.select("#plot1").select("#sigmoid").transition().duration(1000)
	.attr("d", line(data));
	
	
	d3.select("#plot1").select("#legend").transition().duration(1000)
	.text("α:" + current_alpha + "\u00A0 \u00A0 \u00A0 \u00A0" +  "β:" + current_beta)
	
}

const div = document.querySelector("#plot1");

var data = sigmoid(current_alpha, current_beta);
div.append(chart(data));

d3.select("#slider0").on("input", function() {
    var currentValue = this.value;
	data = sigmoid(current_alpha, currentValue)
	current_beta = currentValue;
	update_chart(data);
	})

d3.select("#slider1").on("input", function() {
	var currentValue = this.value;
	data = sigmoid(currentValue, current_beta)
	current_alpha = currentValue;
	// console.log(currentValue)
	update_chart(data);
	})