let container = document.querySelector('#svgcontainer');
let dataName = "male_names.csv";

var width = container.offsetWidth;
var height = container.offsetHeight;

var svg = d3.select("#svgcontainer")
            .append("svg")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("text-anchor", "middle");

function convert_to_ints(d){
    d.Rank = +d.Rank;
    d.Count = +d.Count;
    d["Year of Birth"] = +d["Year of Birth"];
    return d;
}

function changeGender(genderInput) {
  if (genderInput==='male') {
    dataName = "male_names.csv";
  } else {
    dataName = "female_names.csv";
  }
  applyData();
}

function filterEthnicity() {
  applyData();
}

document.getElementById("year-filter").addEventListener("input", e=>{
  let year = e.target.value;
  document.getElementById("year-selected").innerHTML = year;
  applyData();
});

document.getElementById("search-button").addEventListener("click", e=>{
  search_name = document.getElementById("search-box").value
  name_element = document.getElementById("search-name")
  name_element.innerHTML = search_name
  name_element.style.display = 'flex'
  name_element.style.fontSize = '5rem'
  name_element.style.justifyContent = 'center'
  applySearchView(search_name);
});

function applySearchView(search_name) {
  svg.selectAll("circle").remove(); // remove bubble view
  svg.selectAll("text").remove() // the text from the bubbles
  svg.attr("text-anchor", null);
  d3.csv("baby_names.csv", convert_to_ints)
       .then(data => {
          let year = document.getElementById("year-filter").value
          data = data.filter(d=>d["Year of Birth"] == year);
          name_results = data.filter(d=>d["Child's First Name"] == search_name);
          if (name_results.length == 0) {
            // TODO: add a no results found page
            console.log("no results found")
          }
          else {
            var i = 0

            for (item in name_results) {
              name_results[i].key = i
              i = i + 1
            }
            
            yScale = d3.scaleBand()
                .domain(name_results.map(d => d.key))
                .range([60, 0]) // px

            xScale = d3.scaleLinear()
                .domain([0, d3.max(name_results, d => d.Count)])
                .range([0, 100]) // px

            
            svg.selectAll('rect')
                .data(name_results)
                .join('rect')
                  .attr('x', width/2)
                  .attr('y', d => {return yScale(d.key) + height/4})        // Use the "yScale" here instead of manually positioning bars
                  .attr('width', d => {return xScale(d.Count)})
                  .attr('height', yScale.bandwidth())   // Band scales divide a pixel range into equally-sized bands
                  .style('fill','black')
                  .style('stroke', 'white')
              
            svg.selectAll('text')
                .data(name_results)
                .join('text')
                  .attr('x', d => xScale(d.Count))
                  .attr('y', d => yScale(d.key))   // Use the "yScale" here instead of manually positioning labels
                  .attr('dx', 20)
                  .attr('dy', '1em')
                  .attr('fill', 'black')
                  .style('font-size', 'small')
                  // .text(d => d.Count)
          }
       });
}

var simulation = d3.forceSimulation()
                    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
                    .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
                    .force('x', d3.forceX().strength(.001).x(width/2))
                    .force('y', d3.forceY().strength(.001).y(height/2))
                    .on("tick", function(d){
                        svg.selectAll("circle")
                          .attr("cx", function(d){ return d.x; })
                          .attr("cy", function(d){ return d.y; })
                        svg.selectAll("text")
                          .attr("x", function(d){ return d.x; })
                          .attr("y", function(d){ return d.y*1.005; })
                    });
var persistent_data = [];

function applyData() {
  d3.csv(dataName, convert_to_ints)
    .then(data => {
          simulation.stop();

          let year = document.getElementById("year-filter").value
          data = data.filter(d=>d["Year of Birth"]==year);
          let ethnicities = document.getElementById('ethnicity').value;
          if (ethnicities === 'ALL') {
            // combine counts for multiple ethnicities
            data.forEach(function(row) {
              var count = data
                .filter(d => d["Child's First Name"] === row["Child's First Name"])
                .reduce(function(total, value) {
                  return total + value.Count;
                }, 0);
              row.Count = count;
            });

            let names=[];
            let combinedData=[];
            data.forEach(function(row) {
              var index = names.indexOf(row["Child's First Name"]);
              if (index == -1) {
                row.Ethnicity = 'All'
                names.push(row["Child's First Name"]);
                combinedData.push(row);
              }
            });

            data = combinedData;
          } else {
            data = data.filter(d => d.Ethnicity === ethnicities);
          }

          var topData = data.sort((a, b) => b.Count - a.Count).slice(0, 100);
          var size = d3.scaleLinear()
                      .domain([d3.min(topData, d=>d.Count), d3.max(topData, d=>d.Count)]) // range on name counts
                      .range([width/80, width/20]);  // circle will be between 7 and 55 px wide, need to play with this

          var g = svg.selectAll("g").data(topData, d=>d["Child's First Name"]);
          var gEnter = g.enter().append("g");

          g.exit().remove();
          gEnter.append("circle")
              .attr("class", function(d) {return d["Child's First Name"]})
              .attr("r", function(d){ return size(d.Count)})
              .style("fill", "#69b3a2")
              .style("fill-opacity", 0.3)
              .attr("stroke", "#69a2b2")
              .style("stroke-width", 2);

          gEnter.append('text')
              .attr('text-anchor', "middle")
              .attr("font-size", function(d) {
                  return Math.round(size(d.Count)/3) + 'px';
              })
              .text(d => d["Child's First Name"]);

          g.select("circle")
            .attr("r", function(d) {return size(d.Count)});

          g.select('text')
              .attr("x", width / 2)
              .attr("y", height / 2)
              .attr("font-size", function(d) {
                  return Math.round(size(d.Count)/3) + 'px';
              });

          // 🤮 yucky gross way to preserve the state info that the simulation needs
          var new_data = [];
          topData.forEach(d => {
            let alreadyPresent = false;
            persistent_data.forEach(oldD=>{
              if (oldD["Child's First Name"] == d["Child's First Name"]) {
                alreadyPresent = true;
                d.x = oldD.x;
                d.y = oldD.y;
                d.vx = oldD.vx;
                d.vy = oldD.vy;
                new_data.push(d);
              }
            });
            if (!alreadyPresent) {
              d.x=width/2;
              d.y=height/2;
              new_data.push(d);
            }
          })
          persistent_data = new_data;

          simulation.nodes(persistent_data)
            .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.Count)+3) }).iterations(5))
            .alpha(1).restart();
    });
  }

  applyData();
