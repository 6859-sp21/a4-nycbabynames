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

var simulation = d3.forceSimulation()
                    .on("tick", function(d){
                        console.log('running')
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
                      .data(topData, d=>d["Child's First Name"])
                      .join(
                        enter  => {
                          let ig = enter.append('g');
                          ig.append("circle")
                                          .attr("r", function(d){ return size(d.Count)})
                                          .style("fill", "#69b3a2")
                                          .style("fill-opacity", 0.3)
                                          .attr("stroke", "#69a2b2")
                                          .style("stroke-width", 2);
                          ig.append('text')
                                          .attr('text-anchor', "middle")
                                          .attr("font-size", function(d) {
                                              return Math.round(size(d.Count)/3) + 'px';
                                          })
                                          .text(d => d["Child's First Name"])
                          return ig;
                        },
                        update => {
                          svg.selectAll("circle")
                                          .transition()
                                          .duration(500)
                                          .attr("r", function(d){ return size(d.Count)})
                        svg.selectAll('text')
                                        .attr("x", width / 2)
                                        .attr("y", height / 2)
                                        .attr("font-size", function(d) {
                                            return Math.round(size(d.Count)/3) + 'px';
                                        })
                          return update;
                        },
                        exit => exit.remove()
                      )

          // 🤮 yucky gross way to preserve the state info that the simulation needs
          topData.forEach(d => {
            let alreadyPresent = false;
            persistent_data.forEach(oldD=>{
              if (oldD["Child's First Name"] == d["Child's First Name"])
                alreadyPresent = true;
            });
            if (!alreadyPresent) {
              d.x=width/2;
              d.y=height/2;
              persistent_data.push(d)
            }
          })
          persistent_data = persistent_data.filter(d=>{
              let removed=true;
              topData.forEach(newD => {
                if (newD["Child's First Name"] == d["Child's First Name"])
                  removed = false;
              })
              return !removed;
          })

          console.log(persistent_data)

          simulation.nodes(persistent_data)
                          .force('x', d3.forceX().strength(.001).x(width/2))
                          .force('y', d3.forceY().strength(.001).y(height/2))
                          .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.Count)+3) }).iterations(5))
                          .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
                          .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
                          .alpha(1).restart()

    });
  }

  applyData();
