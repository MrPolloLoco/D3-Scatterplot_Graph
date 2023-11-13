// Set the dimensions and margins of the graph.
const margin = { top: 100, right: 20, bottom: 30, left: 60 };
const width = 920 - margin.left - margin.right; // Whats important here is that you subtract the right and left when dealing with width. This will provide a nice margin on both sides of the graph.
const height = 630 - margin.top - margin.bottom;

// Define the colors for the graph.
let color = d3.scaleOrdinal(d3.schemeSet1); 

// Set the x and y scales of your graph.
// Remember in D3 we need to scale our data to fit the graph.
const x = d3.scaleLinear() // Here we are saying the xAxis will fall in a certain range of pixels.
  .range([0, width]);

const y = d3.scaleTime()
  .range([0, height]); // The svg coordinates for the yAxis are reversed which is why we have height first.

let timeFormat = d3.timeFormat('%M:%S');
let xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));
let yAxis = d3.axisLeft(y).tickFormat(timeFormat);

// Create the tooltip.
const div = d3.select('#root')
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);


// Create the SVG element and append it to the chart container.
const svg = d3.select('#root')
  .append('svg')
  .attr('width', width + margin.left + margin.right) // Here we add the margins back in because we want the our SVG to be the full width and height of our conatiner.
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`); // This is for centering pruposes.

// Create or load and process your data.
d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json').then((data) => {
    data.forEach(function (d) {
        d.Place = +d.Place;
        let parsedTime = d.Time.split(':');
        d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]); // Here we are creating a new date object to represent the time.
    })
     // Define the x and y domains.
      x.domain([d3.min(data, function (d) {
        return d.Year - 1;
      }),
        d3.max(data, function (d) {
            return d.Year + 1;
        })
    ]);

    y.domain(d3.extent(data, function (d) {
        return d.Time;
    })
    );
 
     // Create the xAxis and yAxis.
     svg.append('g')
       .attr('class', 'x-axis')
       .attr('id', 'x-axis')
       .attr('transform', `translate(0, ${height})`)
       .call(xAxis)
       .append('text')
       .attr('class', 'x-axis-label')
       .attr('x', width)
       .attr('y', -6)
       .style('text-anchor', 'end')
       .text('Year');


    svg.append('g')
      .attr('class', 'y-axis')
      .attr('id', 'y-axis')
      .call(yAxis)
      .append('text')
      .attr('class', 'label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Best Time (minutes)');

    // Create label.
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -160)
      .attr('y', -45)
      .style('font-size', 18)
      .text('Time in Minutes');

    // Create the plots of data on graph.
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 6)
      .attr('cx', function (d) {
        return x(d.Year);
      })
      .attr('cy', function (d) {
        return y(d.Time);
      })
      .attr('data-xvalue', function (d) {
        return d.Year;
      })
      .attr('data-yvalue', function (d) {
        return d.Time.toISOString();
      })
      .style('fill', function (d) {
        return color(d.Doping !== '');
      })
      .on('mouseover', function (event, d) {
        div.style('opacity', 0.9);
        div.attr('data-year', d.Year);
        div
          .html(
            d.Name +
              ': ' +
              d.Nationality +
              '<br/>' +
              'Year: ' +
              d.Year +
              ', Time: ' +
              timeFormat(d.Time) +
              (d.Doping ? '<br/><br/>' + d.Doping : '')
          )
          .style('left', event.pageX + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function () {
        div.style('opacity', 0);
      });

    var legendContainer = svg.append('g').attr('id', 'legend');

    var legend = legendContainer
      .selectAll('#legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend-label')
      .attr('transform', function (d, i) {
        return 'translate(0,' + (height / 2 - i * 20) + ')';
      });

    legend
      .append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

    legend
      .append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(function (d) {
        if (d) {
          return 'Riders with doping allegations';
        } else {
          return 'No doping allegations';
        }
      });

 
}).catch(err => console.log(err));
