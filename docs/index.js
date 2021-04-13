let container = document.querySelector('#svgcontainer');
let dataName = "male_names.csv";
let searchOn = false;

var width = container.offsetWidth;
var height = container.offsetHeight;

let colors={
  'ALL': "#20686c",
  "HISPANIC": "#009236",
  "WHITE NON HISPANIC": "#6bc4a6",
  "ASIAN AND PACIFIC ISLANDER": "#fe982a",
  "BLACK NON HISPANIC": "#bc4f07"
};

var svg = d3.select("#svgcontainer")
            .append("svg")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("text-anchor", "middle")
            .attr("viewBox", [0,0,width, height]);

const view = svg.append("g")
      .attr("cursor", "grab");

const label = svg.append("g");

label.append("text")
  .attr("class", "year")
  .text("2011")
  .style("font-size", "4rem")
  .attr("text-anchor", "start")
  .attr("x", "2rem")
  .attr("y", "5rem")
  .style("fill-opacity", 0.4);

label.append("text")
  .attr("class", "gender")
  .text("Male")
  .style("font-size", "2rem")
  .attr("text-anchor", "start")
  .attr("x", "2.2rem")
  .attr("y", "7.5rem")
  .style("fill-opacity", 0.7);

label.append("text")
  .attr("class", "ethnicity")
  .style("font-size", "1.3rem")
  .attr("text-anchor", "start")
  .attr("x", "2.2rem")
  .attr("y", "9.5rem")
  .style("fill-opacity", 0.7);

var zoom = d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

svg.call(zoom);

let tooltip = d3.select("#svgcontainer").append('div')
                  .attr('class', 'tooltp')

function zoomed({transform}) {
    view.attr("transform", transform);
}

function resetZoom() {
  svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
}

function convert_to_ints(d){
    d.Rank = +d.Rank;
    d.Count = +d.Count;
    d["Year of Birth"] = +d["Year of Birth"];
    return d;
}

function changeGender(genderInput) {
  if (genderInput==='male') {
    dataName = "male_names.csv";
    label.select("text.gender").text("Male");
  } else {
    dataName = "female_names.csv";
    label.select("text.gender").text("Female");
  }
  if (searchOn) {
    search_name = document.getElementById("search-box").value
    applySearchView(search_name)
  }
  else {
    applyData();
  }

}

function filterEthnicity() {
  let ethnicities = document.getElementById('ethnicity').value;
  if (ethnicities == "ALL") {
    label.select("text.ethnicity").text("");
  } else {
    label.select("text.ethnicity").text(ethnicities);
  }

  if (searchOn) {
    search_name = document.getElementById("search-box").value
    applySearchView(search_name)
  }
  else {
    applyData();
  }

  resetZoom();
}

document.getElementById("year-filter").addEventListener("input", e=>{
  let year = e.target.value;
  document.getElementById("year-selected").innerHTML = year;
  label.select("text.year").text(year);

  if (searchOn) {
    search_name = document.getElementById("search-box").value
    applySearchView(search_name)
  }
  else {
    applyData();
  }
});

document.getElementById("search-button").addEventListener("click", e=>{
  searchOn = true;
  search_name = document.getElementById("search-box").value
  name_element = document.getElementById("search-name")
  name_element.innerHTML = search_name
  name_element.style.display = 'flex'
  name_element.style.fontSize = '5rem'
  name_element.style.justifyContent = 'center'
  cancel_button = document.getElementById("cancel")
  cancel_button.style.display = 'flex'
  cancel_button.style.marginTop = '10px'
  cancel_button.style.marginRight = '10px'
  applySearchView(search_name);
});

document.getElementById("cancel").addEventListener("click", e=> {
  searchOn = false;
  name_element.style.display = 'none'
  cancel_button.style.display = 'none'
  svg.selectAll("text").remove() // the text from old charts
  svg.selectAll("rect").remove() // remove previous chart
  svg.selectAll("path").remove() // remove previous chart axis
  applyData();
})

function applySearchView(search_name) {
  svg.selectAll("circle").remove(); // remove bubble view
  svg.selectAll("text").remove() // the text from the bubbles and old charts
  svg.selectAll("rect").remove() // remove previous chart
  svg.selectAll("path").remove() // remove previous chart axis
  svg.attr("text-anchor", null);
  d3.csv("baby_names.csv", convert_to_ints)
       .then(data => {
          data = data.slice().sort((a, b) => d3.descending(a.Ethnicity, b.Ethnicity))
          let year = document.getElementById("year-filter").value
          if (document.getElementById("male-filter").checked) {
            var gender = "MALE";
          }
          else {
            var gender = "FEMALE";
          }
          data = data.filter(d=>d["Year of Birth"] == year);
          data = data.filter(d=>d["Gender"] == gender);

          name_results = data.filter(d=>d["Child's First Name"] == search_name);
          if (name_results.length == 0) {
            var search_label = svg.append("g");

              search_label.append("text")
                .attr("class", "line1")
                .text("Sorry, there are no results")
                .style("font-size", "3rem")
                .attr("text-anchor", "start")
                .attr("x", "5rem")
                .attr("y", "5rem")
                .style("fill-opacity", 0.7);

              search_label.append("text")
                .attr("class", "line2")
                .text("for " + gender + " " + search_name + " in " + year ) // TODO: lowercase male
                .style("font-size", "3rem")
                .attr("text-anchor", "start")
                .attr("x", "5rem")
                .attr("y", "8rem")
                .style("fill-opacity", 0.7);

              search_label.append("text")
                .attr("class", "line3")
                .text("Please try again.")
                .style("font-size", "3rem")
                .attr("text-anchor", "start")
                .attr("x", "5rem")
                .attr("y", "11rem")
                .style("fill-opacity", 0.7);

          }
          else {
            var i = 0

            for (item in name_results) {
              name_results[i].key = i // ethnicities are not all in the same place the whole time, i think if i sort then it should be fine?
              i = i + 1
            }

            yScale = d3.scaleBand()
                .domain(name_results.map(d => d.key))
                .range([height/3, 0]) // px
                .padding(0.2)

            xScale = d3.scaleLinear()
                .domain([0, d3.max(name_results, d => d.Count)])
                .range([0, width/2]) // px

            var search = svg.append("g");

            search.selectAll('rect')
                .data(name_results)
                .join('rect')
                  .attr('x', width/4)
                  .attr('y', d => {return yScale(d.key) + height/8})        // Use the "yScale" here instead of manually positioning bars
                  .attr('width', d => {return xScale(d.Count)})
                  .attr('height', yScale.bandwidth())  // because range is 0 to h/3, each band is h/12 in height // Band scales divide a pixel range into equally-sized bands
                  .style('fill', function(d) {return colors[d.Ethnicity]})
                  .style('stroke', function(d) {return colors[d.Ethnicity]})
                  .style("fill-opacity", 0.3)

            search.selectAll('text')
                .data(name_results)
                .join('text')
                  .attr('x', d => width/4 + xScale(d.Count))
                  .attr('y', d => yScale(d.key) + height/8 )   // Use the "yScale" here instead of manually positioning labels
                  .attr('dx', 10)
                  .attr('dy', yScale.bandwidth()/2 + 5) // unsure what the conversion to rem is here
                  .attr('fill', '#404040')
                  .style('font-size', 'medium')
                  .text(d => d.Count)
            
            yAxis = g => g
                .attr("transform", `translate(${width/4},${height/8})`)
                .call(d3.axisLeft(yScale).tickFormat(i => name_results[i].Ethnicity).tickSizeOuter(0))
            
            search.append("g")
                  .call(yAxis);
          }
       });
}

var simulation = d3.forceSimulation()
                    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the view area
                    .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
                    .force('x', d3.forceX().strength(.001).x(width/2))
                    .force('y', d3.forceY().strength(.001).y(height/2))
                    .on("tick", function(d){
                        view.selectAll("circle")
                          .attr("cx", function(d){ return d.x; })
                          .attr("cy", function(d){ return d.y; })
                        view.selectAll("text")
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
        row.Ethnicity = 'ALL'
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

          var g = view.selectAll("g").data(topData, d=>d["Child's First Name"]);
          var gEnter = g.enter().append("g");

          g.exit().remove();
          gEnter.append("circle")
              .attr("class", function(d) {return d["Child's First Name"]})
              .attr("r", function(d){ return size(d.Count)})
              .style("fill", function(d) {return colors[d.Ethnicity]})
              .style("fill-opacity", 0.3)
              .attr("stroke", function(d) {return colors[d.Ethnicity]})
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
            .attr("r", d=>size(d.Count))
            .style("fill", function(d) {return colors[d.Ethnicity]})
            .attr("stroke", function(d) {return colors[d.Ethnicity]});

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
