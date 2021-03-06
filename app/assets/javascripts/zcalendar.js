
// $(document).ready(function() {
Calendar.prototype.drawCalendar = function(data){
  d3.select("#calendars").selectAll("svg").remove();

// var my_request = d3.xhr('/cnn_calendar')
// my_request.post(function(d){
  console.log('called');
  var width = $('#calendars').width(),
      height = 115,
      cellSize = 15; // cell size

  var day = d3.time.format("%w"),
      week = d3.time.format("%U"),
      percent = d3.format(".1%"),
      format = d3.time.format("%Y-%m-%d");

  var color = d3.scale.quantize()
      .domain([-.3, .3])
      .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

  var svg = d3.select("#calendars").selectAll("svg")
      .data(d3.range(2008, 2014))
    .enter().append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "RdYlGn")
    .append("g")
      .attr("transform", "translate(" + (10+(width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

  svg.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .style("font-size","1.5em")
      .style("font-weight","bold")
      .text(function(d) { return d; });

  var rect = svg.selectAll(".day")
      .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d) { return week(d) * cellSize; })
      .attr("y", function(d) { return day(d) * cellSize; })
      .on("click", function (d) {
        grabHeadlines(d);


      })
      // .on("click", grabHeadlines(d))

      .datum(format);

  rect.append("title")
      .text(function(d) { return d; });

  svg.selectAll(".month")
      .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
      .attr("class", "month")
      .attr("d", monthPath);

          function monthPath(t0) {
        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = +day(t0), w0 = +week(t0),
            d1 = +day(t1), w1 = +week(t1);
        return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
            + "H" + w0 * cellSize + "V" + 7 * cellSize
            + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
            + "H" + (w1 + 1) * cellSize + "V" + 0
            + "H" + (w0 + 1) * cellSize + "Z";
      }
      var days = {};
      // console.log(data)
      data.forEach(function(d){
        days[d[0]] = d[1];
      });

      var data = days;

      rect.filter(function(d) { return d in data; })
      .attr("class", function(d) { return "day " + color(data[d]); })
      .select("title")
      .text(function(d) { return d + ": " + percent(data[d]); });
}


function grabHeadlines (date) {

  var source = $('#calendarButtons .visible').attr('class').split(' ')[0];
  
  $("html,body").css("overflow","hidden");

  $.ajax({
    url: '/headlines',
    type: 'Post',
    data: {param1: date, param2: source},
  })
  .done(function(response) {
    var headlines = response;

    $.modal(headlines.html, {
      appendTo: "#wrapper",
      minWidth: 500,
      onClose: function(){
        $("html,body").css("overflow","auto");
        $.modal.close();
      }
    });

  })
  .fail(function() {
    console.log("error");
  })
  .always(function() {
    console.log("complete");
  });

  $("#wrapper").on('click', '#simplemodal-overlay', function(event) {
    event.preventDefault();
    $.modal.close();
  });

}



