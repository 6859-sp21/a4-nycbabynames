let container = document.querySelector('#svgcontainer');
let dataName = "male_names.csv";

var width = container.offsetWidth;
var height = container.offsetHeight;

var svg = d3.select("#svgcontainer")
            .append("svg")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("text-anchor", "middle");

let tooltip = d3.select("#svgcontainer").append('div')
                  .attr('class', 'tooltp')

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

function rank(i) {
  return i > 0 ? "+"+i : i;
}

function createTooltip(e, d) {
  tooltip.style('display', 'inherit');
  tooltip.append('p').text(d["Child's First Name"]);
  let ul = tooltip.append('ul');
  ul.append('li').text('Babies: ' + d.Count);
  ul.append('li').text('Rank Within Selection: ' + (d.selRank));
  ul.append('li').text('National Rank: ' + d.natRank);
  if (d.delta) {
    let delta = d.delta-d.selRank;
    let li = ul.append('li');
    li.text('Change From Prev Year: ' + rank(delta));
    let imgSrc = delta>0 ? 'arrow.svg' : 'down-arrow.svg';
    if (delta !== 0) {
      li.append('img')
        .attr('src', imgSrc)
        .attr('width', '12px')
    }

  }
  updateTooltip(e,d);
}

function updateTooltip(e, d) {
  tooltip
    .style('left', e.pageX+15+"px")
    .style('top', e.pageY-170+"px")
}

function removeTooltip(e, d) {
  tooltip.selectAll('p').remove();
  tooltip.selectAll('ul').remove();
  tooltip.style('display', 'none');
}

function filter(data, year, ethnicities) {
  yearData = data.filter(d=>d["Year of Birth"]==year);
  if (ethnicities === 'ALL') {
    // combine counts for multiple ethnicities
    yearData.forEach(function(row) {
      var count = yearData
        .filter(d => d["Child's First Name"] === row["Child's First Name"])
        .reduce(function(total, value) {
          return total + value.Count;
        }, 0);
      row.Count = count;
    });

    let names=[];
    let combinedData=[];
    yearData.forEach(function(row) {
      var index = names.indexOf(row["Child's First Name"]);
      if (index == -1) {
        row.Ethnicity = 'All'
        names.push(row["Child's First Name"]);
        combinedData.push(row);
      }
    });

    yearData = combinedData;
  } else {
    yearData = yearData.filter(d => d.Ethnicity === ethnicities);
  }

  let out = yearData.sort((a, b) => b.Count - a.Count).slice(0, 100);
  out.forEach((d,i) => {
    d.selRank = i+1;
  })
  return out
}

function augmentData(topData, prev) {
  topData.forEach(d => {
    prev.forEach(prevD => {
      if (prevD["Child's First Name"] == d["Child's First Name"])
        d.delta = prevD.selRank;
    })
  })
}

function applyData() {
  d3.csv(dataName, convert_to_ints)
    .then(data => {
          simulation.stop();

          let year = document.getElementById("year-filter").value;
          let ethnicities = document.getElementById('ethnicity').value;

          let prev = filter(data, year-1, ethnicities);
          var topData = filter(data, year, ethnicities);
          augmentData(topData, prev);

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
              .style("stroke-width", 2)
              .on("mouseover", createTooltip)
              .on("mousemove", updateTooltip)
              .on("mouseout", removeTooltip);


          gEnter.append('text')
              .attr('text-anchor', "middle")
              .attr("font-size", function(d) {
                  return Math.round(size(d.Count)/3) + 'px';
              })
              .text(d => d["Child's First Name"])
              .on("mouseover", createTooltip)
              .on("mousemove", updateTooltip)
              .on("mouseout", removeTooltip);

          g.select("circle")
            .attr("r", d=>size(d.Count));

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
