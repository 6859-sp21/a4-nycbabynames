let container = document.querySelector('#svgcontainer');
let ethnicities = 'ALL';
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
  ethnicities = document.getElementById('ethnicity').value;
  applyData();
}

document.getElementById("year-filter").addEventListener("input", e=>{
  let year = e.target.value;
  document.getElementById("year-selected").innerHTML = year;
  applyData();
});

function applyData() {
  svg.selectAll("g").remove();
  d3.csv(dataName, convert_to_ints)
    .then(data => {
          let year = document.getElementById("year-filter").value
          data = data.filter(d=>d["Year of Birth"]==year);

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

          var g = svg.selectAll("g")
                      .data(topData)
                      .join(
                        enter  => {
                          // enter.append('g')
                          return enter.append('g');
                        },
                        update => update,
                        exit => exit.remove()
                      )

          var node = g.append("circle")
                          .attr("r", function(d){ return size(d.Count)})
                          .attr("cx", width / 2) // initial location within SVG rectangle
                          .attr("cy", height / 2) // initial location within SVG rectangle
                          .style("fill", "#69b3a2")
                          .style("fill-opacity", 0.3)
                          .attr("stroke", "#69a2b2")
                          .style("stroke-width", 2);

          var text = g.append('text')
                          .attr("x", width / 2)
                          .attr("y", height / 2)
                          .attr('text-anchor', "middle")
                          .attr("font-size", function(d) {
                              return Math.round(size(d.Count)/3) + 'px';
                          })
                          .text(d => d["Child's First Name"]);


          var simulation = d3.forceSimulation()
                          .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
                          .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
                          .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.Count)+3) }).iterations(1)); // Force that avoids circle overlapping

          simulation
              .nodes(topData)
              .on("tick", function(d){
                  node
                  .attr("cx", function(d){ return d.x; })
                  .attr("cy", function(d){ return d.y; })
                  text
                  .attr("x", function(d){ return d.x; })
                  .attr("y", function(d){ return d.y*1.005; })
              });
    });
  }

  applyData();
