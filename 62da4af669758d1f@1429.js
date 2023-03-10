function _1(md){return(
md`# F1 Constructor Standings 2010-2019
Between watching [Drive to Survive](https://www.netflix.com/title/80204890) on Netflix and listening to the [Shift+F1](https://www.f1.cool) podcast, which hosts a great primer episode, I've recently become interested in the data behind Formula 1 and how to visualize some of the sport's dynamics.

One interesting aspect of the teams is that currently only three manufacture their own engines and supply to competing teams, leading to a few situations where a team can lose to their own engine. Honda has been been the only recent independent engine supplier but they [recently annouced thier exit](https://www.formula1.com/en/latest/article.breaking-honda-to-leave-f1-at-the-end-of-2021.3nsZ7zzaokaze5Sjc4V6s0.html) after 2021. The top places have also been fairly static with the [biggest budget teams](https://www.essentiallysports.com/what-are-the-budgets-for-all-10-formula-one-teams-2019) for the last few years with most of the activity happening among the mid-field. 

The visualization shows the final Formula 1 constructor (teams) standings and engine type for the 2010-2019 Seasons and by total points. Team ownership changes or rebrandings have been flattened to a single line under the most recent status. You can hover over team names or the engine legend to filter visibility. Special thanks to [@fil](https://observablehq.com/@fil) for the [curveDiagonal()](https://observablehq.com/d/1b87d619c46e349e) line function.
<br><br>
`
)}

function _2(md){return(
md`## Formula 1 Constructor (Team) Standings and Engines by Season, 2010-2019`
)}

function _chartStandings(width,d3,standings,curveDiagonal,teamColors,data,chartTip,engines)
{
    const height = 550
    const margin = ({ top: 80, right: 120, bottom: 130, left: 75 });
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const chartid = "chart-places";

    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("id", chartid);

    const group = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let y = d3.scaleLinear()
      .domain(standings.extPlaces)
      .range([0, innerHeight]);

    let x = d3.scaleLinear()
      .domain(standings.extTime).nice()
      .range([25, innerWidth-25]);

    let yAxis = d3.axisLeft(y);
    let xAxis = d3.axisTop(x).tickFormat(d3.format("d"));

    group.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate("+ 0 + "," + (-20) + ")")
      .call(xAxis)
      .call(g => g.selectAll(".domain").remove());

    group.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .call(g => g.selectAll(".domain").remove());
  
  
    // Title
    group.append("text")
      .text('Seasons')
      .attr("text-anchor", "middle")
      .attr("class", "x-axis-label")
      .attr("y", -29)
      .attr("x", innerWidth + 25)
      .style('fill', '#999')
      .style('font-size', '14px')
      .style('font-family','sans-serif' );

    group.append("text")
      .text('Final Team Standing')
      .attr("text-anchor", "middle")
      .attr("class", "y-axis-label")
      .attr("transform", "translate(" + (0 - margin.left * 0.65) + "," + (innerHeight/2) + ") rotate(-90)")
      .style('fill', '#999')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('font-family','sans-serif' );
  
    // Source Text
    group.append("text")
      .attr("class", "graph-source")
      .text("Data: Formula 1 Constructor Standings / Design: @geohotz")
      .attr("text-anchor", "left")
      .attr("x", 0)
      .attr("y", innerHeight + margin.bottom - 18)
      .style('fill', '#999')
      .style('font-size', '.60em')
      .style('font-family', 'sans-serif');


    // Custom Place Grid
    // The 11th and 12th places that don't run the full width are trimmed progammatically
    // Should be converted to an automated data subset.

    var gridlines = group.append("g")
      .attr("class", "gridlines")

    let grid = gridlines.selectAll("line")
      .data([1,2,3,4,5,6,7,8,9,10,11,12])
      .join("line")
      .attr("class", "line-grid")
      .attr("style", "fill:none !important")
      .attr("stroke-width", 28)
      .attr("stroke", "#EFEFEF")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-opacity", 1.0)
      .attr('x1', x(2010))
      .attr('x2', (d, i) => {
          if (d === 11) { return x(2016) }
          else if (d === 12) { return x(2012) }
          else { return x(2019) }
      })
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))


    // Lines
    var lines = group.append("g")
      .attr("class", "team-lines")

    var line = d3.line()
      .x(function(d) { return x(d['year']); })
      .y(function(d) { return y(d['place']); })
      .curve(curveDiagonal(0.25));

    let team = lines.selectAll("g")
      .data(standings.series)
      .join("g")
      .attr("class", (d) => "team-line " + d.id)

    team.append("path")
      .attr("class", "background")
      .attr("style", "fill:none !important")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 8)
      .attr("stroke", "#FFFFFF")
      .attr("stroke-opacity", 0.8)
      .attr('d', (d) => line(d.data))

    team.append("path")
      .attr("class", "primary")
      .attr("style", "fill:none !important")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 4)
      .attr("stroke", (d) => teamColors[d.id])
      .attr("stroke-opacity", 0.8)
      .attr('d', (d) => line(d.data))


  // Engine Nodes
  var nodes = group.append("g")
    .attr("class", "team-engines")
  
  var node = nodes.selectAll("node")
    .data(data)
    .join("g")
    .attr("transform", function(d) { 
      return "translate(" + x(d['year']) + "," + y(d['place']) + ")";             
    })
    .attr("class", function(d) { return 'team-engine ' + d['group'].toLowerCase()})
    .on('mousemove', (event, d) => {
      
      // Custom toolTip Content
      let tipContent = ``; // Start content string
      tipContent += `<strong style="color: ${teamColors[d.id]};">${nameFormat(d.name, d.engine)}</strong><br>`
      tipContent += `Engine: <strong>${d.engine}</strong><br>`
      tipContent += `Place: <strong>${d.place}</strong><br>`
      tipContent += `Points: <strong>${d.points}</strong><br>`
      
      function nameFormat(name, engine){
        if( name !== engine ){
          return name.replace(engine, "")
        } else {
          return name
        }
      }
    
      chartTip.style("left", () => {
            if ((innerWidth - d3.pointer(event)[0]) < 120) {
              return event.pageX - (24+240) + "px";
            } else {
              return event.pageX + 24 + "px";
            }             
         })
        .style("top", event.pageY + 24 + "px")
        .style("display", "inline-block")
        .html(`<strong>${d.year}</strong><br>${tipContent}`);
     })
    .on('mouseout', (event) => {
        chartTip.style("display", "none"); // Hide toolTip
     });
  
  
  node.append("circle")
    .attr("r", 10)
    .attr('fill', '#414042')
    //.attr("r", function(d) { return size(d['goals_for']) })
    .attr('opacity', '1.0')
    .on('mousemove', (event, d) => {
      d3.select(event.target)
        .attr('stroke', '#000')
        .attr('stroke-width', 3);
     })
    .on('mouseout', (event) => {
        d3.select(event.target)
        .attr('stroke', 'none')
        .attr('stroke-width', 0);
    });
  
  node.append("text")
    .attr("class", 'label')
    .attr('x', function(d) { return 0 })
    .attr('dy', '.35em')
    //.attr('alignment-baseline', 'middle')
    .attr("text-anchor", "middle")
    .attr('pointer-events', 'none')
    .text(function(d) { return d['engine'].charAt(0) })
    .attr('fill', function(d) { return engines[d['engine']].c })
    .style('font-weight', 'bold')
    .style('font-size', '11px')
    .style('font-family', 'sans-serif');
  
  
  // Line Labels
  var labels = group.append("g")
    .attr("class", "line-labels")

  var label = labels.selectAll("text")
    .data(standings.series)
    .join("text")
    .attr("class", "line-label")
    .text( (d) => { return d['label'] })
    .attr('x', (d) => { return x(d['last']) + 20 })
    .attr('y', (d) => { return y(d['lastpos']) })
    .attr('dy', '.35em')
    .style('fill', (d) => { return teamColors[d.id] })
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .on("mouseover", (event, d) => {
      d3.select(event.target).style("cursor", "pointer"); 
      d3.selectAll("#" + chartid + " .team-line")
        .transition().style('opacity', g => { return g.id === d.id ? 1 : 0.2; });
      d3.selectAll("#" + chartid + " .line-label")
        .transition().style('opacity', g => { return g.id === d.id ? 1 : 0.2; });
      d3.selectAll("#" + chartid + " .team-engine")
        .transition().style('opacity', g => { return g.id === d.id ? 1 : 0.2; });
    })
    .on("mouseout",  (event, d) => { 
      d3.select(event.target).style("cursor", "default"); 
      d3.selectAll("#" + chartid + " .team-line")
        .transition().style('opacity', 1 );
      d3.selectAll("#" + chartid + " .line-label")
        .transition().style('opacity', 1 );
      d3.selectAll("#" + chartid + " .team-engine")
        .transition().style('opacity', 1 );
    });

    
  // Legend for Engine Types  
  group.append("text")
      .text('Engines')
      .attr("text-anchor", "end")
      .attr("class", "legend-label")
      .attr("y", innerHeight + 5)
      .attr("x", innerWidth - 45)
      .style('fill', '#999')
      .style('font-size', '14px')
      .style('font-family','sans-serif' )
      .style('font-weight', 'bold');

  
  let legend = group.append("g")
    .attr("class", "legend")
    .attr("transform", "translate("+ 0 + "," + (innerHeight) + ")")
  
  var engineType = legend.selectAll("engine")
    .data(Object.entries(engines))
    .enter().append("g")
    .attr("class", (d) => { return 'engine engine-' + d[1].name.toLowerCase() })
    .attr("transform", function(d, i) { 
      return "translate(" +  x(2019) + "," + (i*24) + ")";             
    })
    .on("mouseover", (event, d) => {
      d3.select(event.target).style("cursor", "pointer"); 
      d3.selectAll("#" + chartid + " .team-engine")
        .transition().style('opacity', g => { return g['engine'] ===  d[1].name ? 1 : 0.2; });
      d3.selectAll("#" + chartid + " .engine")
        .transition().style('opacity', g => { return g[1].name ===  d[1].name ? 1 : 0.2; });
    })
    .on("mouseout",  (event, d) => { 
      d3.select(event.target).style("cursor", "default"); 
      d3.selectAll("#" + chartid + " .team-engine")
        .transition().style('opacity', 1 );
      d3.selectAll("#" + chartid + " .engine")
        .transition().style('opacity', 1 );
    });
  
  engineType.append("circle")
    .attr("r", 10)
    .attr('fill', '#414042')
    //.attr("r", function(d) { return size(d['goals_for']) })
    .attr('opacity', '1.0');
  
  engineType.append("text")
    .attr("class", function(d) { return 'engine-type engine-' + d[1].name.toLowerCase() })
    .attr('x', function(d) { return 0 })
    .attr('dy', '.35em')
    .attr("text-anchor", "middle")
    .text(function(d) { return d[1].name.charAt(0) })
    .attr('fill', function(d) { return d[1].c })
    .style('font-weight', 'bold')
    .style('font-size', '11px')
    .style('font-family', 'sans-serif');
  
  engineType.append("text")
    .attr("class", function(d) { return 'label' })
    .attr('x', 20)
    .attr('dy', '.35em')
    .attr("text-anchor", "start")
    .text(function(d) { return d[1].name })
    .attr('fill', function(d) { 
      // return d[1].c
      return '#555';
    })
    .style('font-weight', 'bold')
    .style('font-size', '14px')
    //.style('font-family', 'sans-serif');
  
  return svg.node();
}


function _4(md){return(
md`
#### Data 
Team standings and team engine designations referenced from [formula1.com](https://www.formula1.com/en/results.html). Transitional details around rebrands and acquisitions are referenced from team wikipedia pages to show current teams as single line historically.
`
)}

function _5(md){return(
md`#### Team Transitions and Engine Details
+ 2016-2018 Red Bull’s Renault engines were rebranded TAG Heuer
+ Renault was rebranded Lotus F1 from 2012-2015
+ Toro Rosso was rebranded AlphaTauri for the 2020 Season
+ Racing Point was formerly Force India until mid-2018 season
+ Alfa Romeo was previously Sauber through 2018
+ Caterham operated as Lotus F1 from 2010-2011
`
)}

function _6(md){return(
md`#### Points Comparison
When looking just at the final places above, it doesn't quite show how far ahead the top three teams have gotten in terms total points. The chart below shows the total points for each team by season and hovering shows details for each year. The three teams from 2010-2016 that are not currently competing are not displayed due to having either no points scored or less than 5 per season.
`
)}

function _7(md){return(
md`## Formula 1 Constructor (Team) Total Points by Season, 2010-2019`
)}

function _chartPoints(width,standings,d3,teamColors,chartTip)
{
  const height = 500 // only height defined to width is defined responsive
  const margin = ({ top: 50, right: 120, bottom: 100, left: 75 });
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;
  const chartid = "chart-points"; // chart ID to isolate d3 class selections to just this chart
  
  // filtering previous teams that havent scored more than 2 points in a season.
  let selectSeries = standings.series.filter(d => d.maxpoints > 2)
  
  // Define SVG
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("id", chartid);
  
  // Main chart group/area inset by top/left margin
  const group = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  // Define Scales
  let y = d3.scaleLinear()
    .domain(standings.extPoints)
    .range([innerHeight, 0])
    .nice();
  
  let x = d3.scaleLinear()
    .domain(standings.extTime).nice()
    .range([20, innerWidth]);
  
  // Define and Call Axes
  let yAxis = d3.axisLeft(y);
  let xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));

  group.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate("+ 0 + "," + (innerHeight + 20) + ")")
      .call(xAxis)
      .call(g => g.selectAll(".domain").remove())

  group.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .call(g => g.selectAll(".domain").remove())
  
  // Grid Lines
  let grid = (g) => {g
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g.append("g")
      .selectAll("line")
      .data(x.ticks())
      .join("line")
        .attr("x1", d => 0.5 + x(d))
        .attr("x2", d => 0.5 + x(d))
        .attr("y1", 0)
        .attr("y2", innerHeight+20))
    .call(g => g.append("g")
      .selectAll("line")
      .data(y.ticks())
      .join("line")
        .attr("y1", d => 0.5 + y(d))
        .attr("y2", d => 0.5 + y(d))
        .attr("x1", 0)
        .attr("x2", innerWidth));
  }
  
  group.append("g")
     .call(grid);

  // Axis Labels
  group.append("text")
    .text('Seasons')
    .attr("text-anchor", "middle")
    .attr("class", "x-axis-label")
    .attr("y", innerHeight + 70)
    .attr("x", innerWidth/2)
    .style('fill', '#999')
    .style('font-size', '14px')
    .style('font-family','sans-serif' );

  group.append("text")
    .text('Total Season Points')
    .attr("text-anchor", "middle")
    .attr("class", "graph-title")
    .attr("transform", "translate(" + (0 - margin.left * 0.65) + "," + (innerHeight/2) + ") rotate(-90)")
    .style('fill', '#999')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('font-family','sans-serif' );
  
  // Source Text
  group.append("text")
    .attr("class", "graph-source")
    .text("Data: Formula 1 Constructor Standings / Design: @geohotzdata")
    .attr("text-anchor", "left")
    .attr("x", 0)
    .attr("y", innerHeight + margin.bottom - 18)
    .style('fill', '#999')
    .style('font-size', '.60em')
    .style('font-family', 'sans-serif');

  
  group.append("line")
    .attr("class", "y-highlight")
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .style('stroke', '#999')
    .style('opacity', 0);

    // Custom Place Grid
    // The 11th and 12th places that don't run the full width are trimmed progammatically
    // Should be converted to an automated data subset.
  
    // Lines
    var lines = group.append("g")
      .attr("class", "team-lines")

    var line = d3.line()
      .x(function(d) { return x(d['year']); })
      .y(function(d) { return y(d['points']); })
    let team = lines.selectAll("g")
      .data(selectSeries)
      .join("g")
      .attr("class", (d) => "team-line line-" + d.id)
   
    // Mask 
    team.append("path")
      .attr("class", "line-background")
      .attr("style", "fill:none !important")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 8)
      .attr("stroke", "#FFFFFF")
      .attr("stroke-opacity", 0.8)
      .attr('d', (d) => line(d.data))

    // Line with Team Color
    team.append("path")
      .attr("class", (d) => "line-primary")
      .attr("style", "fill:none !important")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 4)
      .attr("stroke", (d) => teamColors[d.id])
      .attr("stroke-opacity", 0.8)
      .attr('d', (d) => line(d.data))


  // Nodes
  
//   var nodes = group.append("g")
//     .attr("class", "nodes")
  
//   var node = nodes.selectAll("node")
//     .data(data)
//     .join("g")
//     .attr("class", "place-point")
//     .attr("transform", function(d) { 
//       return "translate(" + x(d['Year']) + "," + y(d['Points']) + ")";             
//     })
//     .attr("class", function(d) { return d['Team'].toLowerCase()})

//   // Labels 
//   var labels = group.append("g")
//     .attr("class", "labels")

//   var label = labels.selectAll("text")
//     .data(filteredSeries)
//     .enter().append("text")
//     .text( (d) => { return d['label'] })
//     .attr('x', (d) => { return x(d['last']) + 18 })
//     .attr('y', (d) => { return y(d['lastpoints']) })
//     .attr('dy', '.35em')
//     .style('fill', (d) => { return teamColors[d.id] })
//     .style('font-size', '14px')
//     .style('font-weight', 'bold')
  
  // Label Object
  let labelset = Array.from(selectSeries).map(d => {
    let obj = {}
    obj.id = d.id;
    obj.label = d['label'];
    obj.color = teamColors[d.id];
    obj.val = d['lastpoints'];
    return obj
  })
    
  // Force Line Labels - Basic Version
  let forceLabelOffset = 20
  let forceLabels = group.append("g")
      .attr('class', 'line-force-labels')

  const forceLabelLeader = forceLabels.selectAll('line')
    .data(labelset)
    .join('line')
    .attr("class", 'lfl-leader')
    .attr('x1', x(standings.extTime[1]) + 4)
    .attr('x2', x(standings.extTime[1]) + forceLabelOffset)
    .attr('y1', d => y(d.val))
    .attr('y2', d => y(d.val))
    .attr('stroke', '#CCC')

  const forceLabel = forceLabels.selectAll('g')
    .data(labelset)
    .join('g')
    .attr('transform', function(d) { 
       // contrains node x,y to bounds
       d.x =  x(standings.extTime[1]) + forceLabelOffset;
       d.y =  y(d.val);
       return `translate(${d.x},${d.y})`
    })
    .on("mouseover", (event, d) => {
      console.log(d)
      d3.selectAll("#" + chartid + " .team-line")
        .transition().style('opacity', g => { return g.id === d.id ? 1 : 0.2; });
      d3.selectAll("#" + chartid + " .lfl-text")
        .transition().style('opacity', g => { return g.id === d.id ? 1 : 0.2; });
      d3.selectAll("#" + chartid + " .lfl-leader")
        .transition().style('opacity', g => { return g.id === d.id ? 1 : 0.2; });
      })
    .on("mouseout",  (event, d) => { 
      d3.selectAll("#" + chartid + " .team-line")
        .transition().style('opacity', 1 );
      d3.selectAll("#" + chartid + " .lfl-text")
        .transition().style('opacity', 1 );
      d3.selectAll("#" + chartid + " .lfl-leader")
        .transition().style('opacity', 1 );
    });

  forceLabel.append('text')
    .attr("class", 'lfl-text')
    .html(d => d.label)
    .attr('fill', d => d.color)
    .attr('alignment-baseline', 'middle')
    .style('font-size', '.75em')
    .style('font-size', '14px')
    .style('font-weight', 'bold');

  forceLabel.append('rect')
    .attr("class", 'lfl-rect')

  const simulation = d3.forceSimulation(labelset)
    .force("charge", d3.forceManyBody().strength(-10))
    .force('y', d3.forceY().y(d => y(d.val)))
    .force('x', d3.forceX().x(x(standings.extTime[1]) + forceLabelOffset))
    //.force("rectcollide", rectCollide())
    .force('collision', d3.forceCollide().radius(8));

  simulation.on('tick', () => {
    forceLabel.attr('transform', function(d) { 
       //d.y =  Math.max(Math.min(innerHeight, d.y), 0); // constrain y to vertical chart area
       d.x =  x(standings.extTime[1]) + forceLabelOffset; // constrain x for all labels
       return `translate(${d.x},${d.y})`
    });
    forceLabelLeader
      .attr("x2", d => d.x-2)
      .attr("y2", d => d.y)
  })
  
  
  // Chart Area Tooltip
  
  // Group for line highligt points, sits below tootTip area so point don't interfere with hover
  let yPoints = group.append("g")
    .attr('class', 'y-highlight-points')
  
  // Chart toolTip Area (defines where hover with be active)
  let tipArea = group.append("g")
    .attr("class", "tip-area");
  
  tipArea.append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('opacity', 0)
    .attr('pointer-events', 'all')
    .on('mousemove', (event) => {
      // Get the date on the y axis for the mouse position
      let invert = x.invert(d3.pointer(event)[0])
      // console.log({invert})
      // let bisect = d3.bisector(function(d) { return d; }).right;
      // let hoverDate = (data.years[bisect(data.years, invert)]); //it would return 2.
      
      let hoverDate = Math.round(invert); //it would return 2.
      console.log({hoverDate})
    
      let lookup = standings.mapYear.get(hoverDate)
      console.log({lookup})
    
      //.sort((a, b) => d3.ascending(a[place], b[place]));
    
      // Display and position vertical line
      d3.select("#" + chartid + " .y-highlight")
         .attr('x1',x(hoverDate))
         .attr('x2',x(hoverDate))
         .style('opacity', 1);

    
      // Update Pattern for the Point Highlights
      const yPoint = yPoints.selectAll('g')
        .data(lookup, d => d.id)
        .join(
        enter => enter.append("g")
            .attr('class', 'y-highlight-point')
            .attr('transform', function(d) { 
              return `translate(${x(d.year)},${y(d.points)})`
            })
            .attr('opacity', d => !isNaN(d.points) ? 1 : 0) // hide if value is NaN, 
            .append('circle')
            .attr('r', 4)
            .attr('stroke-weight', 4)
            .attr('stroke', '#FFFFFF')
            .attr('fill', (d) => teamColors[d.id]),
        update => update
            .attr('transform', function(d) { 
              return `translate(${x(d.year)},${y(d.points)})`
            })
            .attr('opacity', d => !isNaN(d.points) ? 1 : 0), // hide if value is NaN
        exit => exit.remove()
        )
      
      // Custom toolTip Content
      let tipContent = ``; // Start content string
      tipContent += `<table class="tip-table"><thead><tr><th></th><th>Place</th><th>Points</th></tr></thead><tbody>`;
      // Interate over selected categories
      lookup.map( d => {
        tipContent += `<tr><td class="row-header"><strong style="color: ${teamColors[d.id]};">${d.name}</strong></td>`
        tipContent += `<td class="primary"><span class="tip-values">${d.place}</td>`
        tipContent += `<td>${d.points}</td></tr>`
      });
      tipContent += `</tbody></table>`;
    
      chartTip.style("left", () => {
            if ((innerWidth - d3.pointer(event)[0]) < 120) {
              return event.pageX - (24+240) + "px";
            } else {
              return event.pageX + 24 + "px";
            }             
         })
        .style("top", event.pageY + 24 + "px")
        .style("display", "inline-block")
        .html(`<strong>${hoverDate}</strong><br>${tipContent}`);
     })
    .on('mouseout', (event) => {
        chartTip.style("display", "none"); // Hide toolTip
        d3.select("#" + chartid + " .y-highlight").style('opacity', 0); // Hide y-highlight line
        d3.selectAll("#" + chartid + " .y-highlight-point").remove(); // Remove y-highlight points 
     });
  
  
  

  
  return svg.node();
}


function _9(html){return(
html`
<style>

/*.axis .domain { opacity: 0; }*/
.y.axis text {
  font-weight: bold;
  fill: #555;
}

#chart-places .y.axis text {
  font-size: 16px; 
}

#chart-points .y.axis text {
  font-size: 14px; 
}

.x.axis text, .x-axis-label {
  font-size: 14px;
  font-weight: bold;
  fill: #999;
}
.tick line {
  stroke: #999;
}

</style>
`
)}

function _10(md){return(
md`### curveDiagonal() for d3.line()
Special thanks to [@fil](https://observablehq.com/@fil) for making this incredibly helpful [curveDiagonal()](https://observablehq.com/d/1b87d619c46e349e) function. In the standings chart it allows the stepped diagonal line transition between points.
And special thanks to [@benoldenburg] (https://observablehq.com/@benoldenburg) for making this incredible dataset and design template :)
`
)}

function _11(html){return(
html`
<!-- Generator: Adobe Illustrator 24.3.0, SVG Export Plug-In  -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="50%" viewBox="0 0 274.08 57.33" style="overflow:visible;enable-background:new 0 0 274.08 57.33;"
	 xml:space="preserve">
<style type="text/css">
	.st0{fill:none;stroke:#000000;stroke-miterlimit:10;}
	.st1{stroke:#FFFFFF;stroke-miterlimit:10;}
	.st2{fill:#BCBEC0;}
</style>
<defs>
</defs>
<polyline class="st0" points="154.81,27.86 178.08,27.86 202.08,53.96 226.08,53.96 250.08,3.5 274.08,3.5 "/>
<circle class="st1" cx="166.08" cy="27.86" r="3"/>
<circle class="st1" cx="214.44" cy="53.83" r="3"/>
<circle class="st1" cx="262.08" cy="3.5" r="3"/>
<polyline class="st0" points="3.5,27.86 51.87,53.96 99.5,3.5 "/>
<circle class="st1" cx="3.5" cy="27.86" r="3"/>
<circle class="st1" cx="51.87" cy="53.83" r="3"/>
<circle class="st1" cx="99.5" cy="3.5" r="3"/>
<polygon class="st2" points="137.48,27.86 125.1,20.71 125.1,35 "/>
</svg>


`
)}

function _curveDiagonal(){return(
function curveDiagonal(step = 0.1) {
  return function(context) {
    return {
      _context: context,
      x0: null,
      y0: null,
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line || (this._line !== 0 && this._point === 1))
          this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        (x = +x), (y = +y);
        switch (this._point) {
          case 0:
            this._point = 1;
            this._line
              ? (this._context.lineTo(this.x0 + step * (x - this.x0), this.y0),
                this._context.lineTo(x - step * (x - this.x0), y),
                this._context.lineTo(x, y))
              : this._context.moveTo(x, y);
            break;
          case 1:
            this._point = 2; // proceed
          default:
            this._context.lineTo(this.x0 + step * (x - this.x0), this.y0),
              this._context.lineTo(x - step * (x - this.x0), y),
              this._context.lineTo(x, y);
            break;
        }
        this.x0 = x;
        this.y0 = y;
      }
    };
  };
}
)}

function _chartTip(d3){return(
d3.select("body").append("div").attr("class", "toolTip chartTip")
)}

function _14(html){return(
html`
<style> 
.toolTip {
  position: absolute;
  display: none;
  min-width: 30px;
  border-radius: 4px;
  height: auto;
  background: rgba(250,250,250, 0.9);
  border: 1px solid #DDD;
  padding: 4px 8px;
  font-size: .85rem;
  text-align: left;
}

.eventTip {  max-width: 140px;}
.chartTip {  max-width: 240px;}

.tip-values {  
font-weight: bold;
color: #787878;
}
.tip-values .secondary{   
font-weight: normal;
}

.tip-table {
   font-size: 11px;
   text-align: right;
   color: #787878;
}

.tip-table td, .tip-table th {
  padding-right: 3px;
  padding-left: 3px;
}

.tip-table th {
  font-size: 9px;
  text-align: right;
  color: #AAA;
  vertical-align: bottom;
}

.tip-table .row-header {
  text-align: left;
}

.tip-table .primary {
  font-weight: bold;
}
</style>
`
)}

function _15(md){return(
md`### Data Processing`
)}

function _teamColors(){return(
{
'mercedes': 'rgb(67,191,180)',
'ferrari': 'rgb(218,31,38)',
'red-bull': 'rgb(58,79,162)',
'mclaren': 'rgb(246,135,31)',
'renault': 'rgb(255,194,15)',
'toro-rosso': 'rgb(0,114,188)',
'racing-point': 'rgb(239,151,192)',
'alfa-romeo': 'rgb(150,26,29)',
'haas': 'rgb(120,121,121)',
'williams': 'rgb(68,149,209)',
'lotus': 'rgb(70,96,54)',
'mrt': 'rgb(242,96,53)',
'hrt': 'rgb(139,115,81)',
'caterham': 'rgb(2,79,48)',
'closed': 'rgb(215,207,205)'
}
)}

function _engines(){return(
{
  'Mercedes': {
    'name': 'Mercedes',
    'letter': 'M',
    'c': 'rgb(124,204,196)'
  },
  'Renault': {
    'name': 'Renault',
    'letter': 'R',
    'c': 'rgb(255,206,7)'
  },
  'Ferrari': {
    'name': 'Ferrari',
    'letter': 'F',
    'c': 'rgb(231,128,101)'
  },
  'Honda': {
    'name': 'Honda',
    'letter': 'H',
    'c': 'rgb(255,255,255'
  },
  'Cosworth': {
    'name': 'Cosworth',
    'letter': 'C',
    'c': 'rgb(255,255,255'
  },
}
)}

function _standings(d3,data)
{
  
    let result = {}; // object to return
  
    // Temp Map to Lookup Last Position by Team and Last Year Appearing
    let mapTeamYear = d3.group(data, d => d['id'], d => d['year']) 
    
    // Map of data by year for tooltip lookup
    result.mapYear = d3.group(data, d => d['year']) 
  
    result.years = Array.from(result.mapYear).map(d => d[0]);
  
    // Axis Domains
    result.extTime = d3.extent(data, d => d['year'])
    result.extPlaces = d3.extent(data, d => d['place'])
    result.extPoints = d3.extent(data, d => d['points'])
  
    // Series by Team
    result.series = Array.from(d3.group(data, d => d['id'])).map(d => {
      let obj = {}
      obj.id = d[0];
      obj.label = d[1][0]['group'];
      obj.data = d[1];
      // Last Year/Place for Handling label position
      obj.last = d3.max(d[1], d => d['year']);
      obj.maxpoints = d3.max(d[1], d => d['points']);
      obj.lastpos = mapTeamYear.get(obj.id).get(obj.last)[0]['place'];
      obj.lastpoints = mapTeamYear.get(obj.id).get(obj.last)[0]['points'];
      return obj;
    });
  
    return result;
}


function _data(FileAttachment){return(
FileAttachment("f1-constructor-standings-2010-2019-v4.tsv").tsv().then(
  function(data) {
    data.forEach(function(d) {
      d['id'] = d['group'].trim().toLowerCase().replace(/ /g, '-');
      d['place'] = +d['place'];
      d['year'] = +d['year'];
      d['points'] = +d['points'];
      d['group'] = d['group'].trim();
      
    });
    return data;
  })
)}

function _22(md){return(
md`### D3`
)}

function _d3(require){return(
require("d3@6")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["f1-constructor-standings-2010-2019-v4.tsv", {url: new URL("./files/2665819a6a9c9a4980f879af42f8419cdd779e87b02d92dc8a2cac8924d9377c52a6f1eb729c248fe8901d5a406c15e3593ed08fee9d86e8db887bf41d55b56e.tsv", import.meta.url), mimeType: "text/tab-separated-values", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("chartStandings")).define("chartStandings", ["width","d3","standings","curveDiagonal","teamColors","data","chartTip","engines"], _chartStandings);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer()).define(["md"], _7);
  main.variable(observer("chartPoints")).define("chartPoints", ["width","standings","d3","teamColors","chartTip"], _chartPoints);
  main.variable(observer()).define(["html"], _9);
  main.variable(observer()).define(["md"], _10);
  main.variable(observer()).define(["html"], _11);
  main.variable(observer("curveDiagonal")).define("curveDiagonal", _curveDiagonal);
  main.variable(observer("chartTip")).define("chartTip", ["d3"], _chartTip);
  main.variable(observer()).define(["html"], _14);
  main.variable(observer()).define(["md"], _15);
  main.variable(observer("teamColors")).define("teamColors", _teamColors);
  main.variable(observer("engines")).define("engines", _engines);
  main.variable(observer("standings")).define("standings", ["d3","data"], _standings);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer()).define(["md"], _22);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
