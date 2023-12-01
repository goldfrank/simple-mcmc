const data0 = await d3.csv("/challenger_data.csv");
// console.log(data0)
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

function chart(data) {
	var challenger_data = data;
	
	//calculate if point needs to be jittered
	
	var jitter = {}; // new dict for determining duplicate points
	for (const d in data){ //loop through and determine dupes
		if (d != 'columns') { // 'columns' is index
			var pair = [data[d].Temperature, data[d].Incident];
			if (! (pair in jitter)) {
				jitter[pair] = false;
				data[d]['jitter'] = 0
			} else {
				jitter[pair] = true;
				data[d]['jitter'] = 1
			}
		}
	}

// console.log(data)

// Specify the chart’s dimensions.
  const width = 640;
  const height = 400;
  const marginTop = 25;
  const marginRight = 20;
  const marginBottom = 35;
  const marginLeft = 40;

  // Define the horizontal scale.
  const x = d3.scaleLinear()
      .domain(d3.extent(challenger_data, d => d.Temperature)).nice()
      .range([marginLeft, width - marginRight]);

  // Define the vertical scale.
  const y = d3.scaleLinear()
      .domain([-0.1, 1.1])
      .range([(height - marginBottom), marginTop]);

 const y_ax = d3.scaleLinear()
      .domain(d3.extent(challenger_data, d => d.Incident)).nice()
      .range([(height - marginBottom), marginTop]);

  // Create the container SVG.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-45, 0, width+45, height]) //adjusted for labels
      .attr("style", "max-width: 100%; height: auto;");

  // Add the axes.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x));

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y)
	  	.tickValues([0,1])
	  	.tickFormat( d => d == 1 ? "Incident" : "No Incident")
	  )


  svg.selectAll("text")
  	.style('font-family', "Roboto Condensed")
  	.style("font-size", "0.9rem");


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

  const legend = svg.append("g")
    .attr("transform", "translate(" + (width/2 - marginLeft)  + 
    "," + (height+5) + ")")
	  legend
    .append('text')
    .text("Temperature (°F)")
	  .attr("id", "legend0")
	  .style('font-family', 'Roboto Condensed')
	  .style("font-size", "0.9rem")

  return svg.node();
}

const div = document.querySelector("#plot0");
div.append(chart(data));


// console.log(data)