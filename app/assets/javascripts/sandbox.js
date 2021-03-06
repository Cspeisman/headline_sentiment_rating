
function BlankGraph () {


  w = $("#scatter").width();
  h = $("#scatter").height();
  padding = 15;

  svg = d3.select("#scatter")
              .append('svg')
              .attr("width", w)
              .attr("height", h);

}

function Calendar (data,source) {

  this.el = $('#calendarButtons .'+source);
  this.source = source;
  this.visible = false;
  this.button = $("#calendarButtons ."+source);
  var self = this;

  var calendarData =  _.map(data,function (el,i,list) {
                    day = [];
                    day[0] = moment.unix(el[0]).format('YYYY-MM-DD');
                    day[1] = el[1];
                    day[2] = el[2];
                    return day;
                  });

  this.data = calendarData
  // this.drawCalendar(this.data);

this.button.on('click', function(event) {
    // console.log(self.el)
    event.preventDefault();
    if (!self.el.hasClass('visible')){
      self.drawCalendar(self.data);

      $("#calendarButtons").children().removeClass('visible');
      self.el.addClass('visible');
    }
  });

  if (this.el.hasClass('visible')) {self.drawCalendar(self.data)};


}

function grabSources (argument) {
    var plotPoints =[];

    d3.json("/scatter", function(error, data){

      data.forEach(function(d){
        plotPoints.push([d.date, d.score, d.source])
      });

      $("#waiting").remove()

    xScale = d3.scale.linear()
        .domain([d3.min(plotPoints, function (d) { return d[0] }),d3.max(plotPoints, function(d) { return d[0]; })])
        .range([padding,w-padding-5]);

    yScale = d3.scale.linear()
        .domain([0.2,-0.2])
        .range([padding,h-padding]);

    line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
          return xScale(d[0]);
        })
        .y(function (d) {
          return yScale(d[1]);
        });
      // new newSource(plotPoints, "aggregate");
      var aggregate = $.extend(true, {}, plotPoints);
       new newSource(aggregate, "aggregate");

      var aggregate = plotPoints;
      sources = _.groupBy(plotPoints, function(d){return d[2]});
      _.each(sources,function(value,key,list){
        new newSource(value, key)});

      graph.makeAxis();
    });


}


function newSource(data, source) {
  console.log(source);

  var self = this;

  this.data = data
  this.source = source
  this.button = $('#scatterButtons .'+source);
  this.circleGroup = svg.append('svg:g');
  this.linePlot = svg.append('path');
  this.painted = false;
  // console.log(source);
  this.calendar = new Calendar(data,source);

        console.log(this.data);

  // this.makeCircles(this.data)
  var months = monthlyAverages(this.data);
  // this.makeLine(months, source);

  if (this.button.hasClass('selected')) {
    this.makeCircles(this.data, this.source)
    this.makeLine(months, source);
    this.painted = true;
  };



  this.button.on('click', function(event) {
    event.preventDefault();
    // console.log(self.circleGroup)
    if (!self.button.hasClass('selected')){
        if(self.painted == false){
          self.makeCircles(self.data, self.source)
          self.makeLine(months, source);
        }
        else{
          self.circleGroup.transition()
            .style('opacity',1);
          self.linePlot.transition()
            .style('opacity',1);
        }
          self.button.addClass('selected');
          self.painted = true;
    }
    else{
        // self.circleGroup.remove();
        // self.linePlot.remove();

        // self.circleGroup = svg.append('svg:g');
        // self.linePlot = svg.append('path');

          self.circleGroup.transition()
              .style('opacity',0);
          self.linePlot.transition()
              .style('opacity',0);

          self.button.removeClass('selected');
          // self.visible = true;
    }
  });
}

function oddIndexes (array) {
  var result = []
  for (var i = 0; i < array.length; i++) {
    if(i % 2 != 0) { // index is even
        result.push(array[i]);
    }
  }

  return result;
}

function monthlyAverages (points, source) {
  monthAverages = []
  var source = points[0][2]

  var linePoints = points

  _.each(linePoints,function (date) {
    date.pop();
  })

  var months = _.groupBy(linePoints,function (day) {
                return Math.floor(day[0]/2629740);
              });

  _.map(months,function (month) {

    var midMonth = (month[0][0]+(2629740/2));
    flatMonth = oddIndexes(_.flatten(month));

    sum = _.reduce(flatMonth,function (memo,day) {
            return memo + day;
      });
    average = sum/month.length;

    monthAverages.push([midMonth,average]);

    });

    return monthAverages

   // makeLine(monthAverages, source);
}


newSource.prototype.makeCircles = function(points, source) {
  console.log(points);
  this.circleGroup.selectAll("circle")
           .data(points)
           .enter()
           .append("circle")
           .attr("date", function(d){return d[0]})
           .attr('class', source)

          .attr("cx", function(d) {
                  return xScale(d[0]);
               })
           .attr("cy", function(d) {
              return yScale(d[1]);
           })
           .attr("r", function(d) {
               return 1 //Math.sqrt(h - d[1]);
           });

           return this.circleGroup;
};

newSource.prototype.makeLine = function(months, source) {

    this.linePlot
      .attr('class', 'line')
      .attr('class', source)
      .attr('d',function (d) {

        return line(months);
      })
  var totalLength = this.linePlot.node().getTotalLength();
    this.linePlot
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(2000)
        .ease("ease")
        .attr("stroke-dashoffset", 0);
};


BlankGraph.prototype.makeAxis = function() {
        xAxis = d3.svg.axis()
            // .tickValues()
          .tickFormat(function(d) {
            var myDate = new Date( d * 1000);
            year = myDate.getUTCFullYear();
            month = myDate.getUTCMonth() + 1;
            // return month + "-" + year
            return moment(myDate).format("MMM-YY");
          })
           .scale(xScale)
           .orient("top")
           .ticks(15)

      yAxis = d3.svg.axis()
            .tickFormat(function(d){
              if(d<0){return "More Negative"}
              if(d>0){return "More Positive"}
              // if(d==0){return }
            })
            .scale(yScale)
            .orient("right")
            .ticks(3)
            // .selectAll("text")
            //   .attr("font-size","5em")

      svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+(0)+"," + ((h/2)) + ")")
            // .attr("transform", "translate("+25+",0")
            .call(xAxis)


      svg.append("g")
          .attr("class", "axis")
          .attr("transform", "translate("+padding+",0)")
          .call(yAxis);

};







$(document).ready(function() {
  $("#waiting").prepend("<h2>Loading...</h2><img alt='Slipnslide' src='/assets/deal_with_it.gif'>")
  // Calendar();
  graph = new BlankGraph();

  grabSources();

});

