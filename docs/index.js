d3.csv("2011_baby_girl_sample.csv", convert_to_ints, function(data){
    var width = 600;
    var height = 500;
    var size = d3.scaleLinear()
                .domain([0, 200]) // range on name counts
                .range([5,35])  // circle will be between 7 and 55 px wide, need to play with this
    var svg = d3.select("#svgcontainer")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("text-anchor", "middle");
    var g = svg.selectAll("g")
                .data(data)
                .enter()
                .append("g")
    var node = g.append("circle")
                    .attr("r", function(d){ return size(d.Count)})
                    .attr("cx", width / 2) // initial location within SVG rectangle
                    .attr("cy", height / 2) // initial location within SVG rectangle
                    .style("fill", "#69b3a2")
                    .style("fill-opacity", 0.3)
                    .attr("stroke", "#69a2b2")
                    .style("stroke-width", 2)

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
                    .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.Count)+3) }).iterations(1)) // Force that avoids circle overlapping
              
    simulation
        .nodes(data)
        .on("tick", function(d){
            node
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
            text
            .attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; })
        });
});

function convert_to_ints(d){
    d.Rank = +d.Rank;
    d.Count = +d.Count;
    d["Year of Birth"] = +d["Year of Birth"];
    return d;
}

