var allRivers = myData();
//getRivers();

// Contains cached realtime (today) history of water levels.
// Key: Station id, string
// Value: {riverName, stationName, values: [float], labels: [string]}
// TODO: Invalidate when new data point is coming (every 15min)
var realTimeHistory = {};


// Get values from API

function getRivers() {
    var adress = 'https://heichwaasser.lu/api/v1/rivers';
    $.ajax({
        type: "GET",
        url: adress,
    }).done(function (data) {
        for (var i in data) {
            allRivers.push(i);
        }
        // createChart();
    }).fail(function (xhr, status, error) {
        // write fail message here, in case
    })

}

// Create a random color, not too dark, not too bright
function makeColor(i) {
    var r = Math.random() * 160 + 64;
    var g = Math.random() * 160 + 64;
    var b = Math.random() * 160 + 64;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

// Creates new chart with a list of {riverName, cityName, labels array, values array}
function createNewChart(graphs) {
    var datasets = [];
    var color_index = 0;
    graphs.forEach(g => {
        datasets.push({
            label: g.riverName + ": " + g.cityName,
            backgroundColor: makeColor(color_index),
            borderColor: makeColor(color_index),
            data: g.values,
            fill: false,
        });
        color_index++;
    });

    // Delete the graph canvas and add a clean one
    $('#myChart').remove();
    var chartCanvas = $('<canvas/>')
        .attr('id', 'myChart')
        .appendTo($('#myChartContainer'));

    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: graphs[0].labels,
            datasets: datasets,
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Water Level'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Time'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Lewel'
                        }
                    }]
                }
            }
        }
    });
}


// For list of ids, request them one after one and store in a global dictionary.
// ids and ids_orig contain same value initially, but ids is used to fetch each
// history chart and gets shorter, while ids_orig is used to create the final chart.
// start_t, end_t - integer, unix time
function getHistory(ids, ids_orig, start_t, end_t) {
    if (ids.length == 0) {
        // End of the line: Have all data available
        // Build graphs array of cached station history {}
        var graphs = [];
        ids_orig.forEach(element => {
            graphs.push(realTimeHistory[element]);
        });
        createNewChart(graphs);
        return;
    }
    var id = ids[0];
    if (id in realTimeHistory) {
        // Have already cached this station id, just continue
        return getHistory(ids.slice(1), ids_orig, start_t, end_t);
    }
    var adress = 'https://heichwaasser.lu/api/v1/stations/' + id + '/start/' + start_t + '/end/' + end_t + '/reversed';
    $.ajax({
        type: "GET",
        url: adress,
    }).done(function (data) {
        var riverName = data.river.name
        var cityName = data.city

        var values = [];
        var labels = [];
        for (i in data.measurements) {
            values.push(data.measurements[i].value);
            labels.push(data.measurements[i].timestamp);
        }
        realTimeHistory[id] = {
            riverName: riverName,
            cityName: cityName,
            values: values,
            labels: labels
        }
        getHistory(ids.slice(1), ids_orig, start_t, end_t);
    }).fail(function (xhr, status, error) {
        // write fail message here, in case
    })

}

//Bind stations name list in sub menu (first 10)
function createCheckList() {
    var assetList = $('#Stations');
    var count = 3;
    $.each(allRivers, function (i) {

        $.each(allRivers[i].stations, function (j) {
            var station = allRivers[i].stations[j];
            var div = $('<div/>')
                .attr('role', 'menuitem')
                .appendTo(assetList);
            var input = $('<input/>')
                .addClass("chk")
                .attr('type', 'checkbox')
                .attr('value', station.id);
            if (count > 0) {
                input.attr("checked", "checked");
                count--;
            } else {
                div.addClass("chk-hideable").hide();
            }
            input.appendTo(div);

            var aaa = $('<a/>')
                .text(allRivers[i].name + " — " + station.city)
                .appendTo(div);
        })
    });

    // For all checkboxes set event on click
    $(".chk").click(function () {
        recreateChart();
    });
    $("#btn-more").click(function() {
        $('.chk-hideable').show();
        $('#btn-less').show();
        $('#btn-more').hide();
    });
    $("#btn-less").click(function() {
        $('.chk-hideable').hide();
        $('#btn-more').show();
        $('#btn-less').hide(); 
    }).hide();
}

createCheckList();
recreateChart();

// Collect checkboxes, query history for midnight to now for each checked id
// and recreate the chart.
function recreateChart() {
    var chkArray = [];
    $(".chk:checked").each(function () {
        chkArray.push($(this).val());
    });

    // Realtime history
    var start_t = Math.floor(new Date().setHours(0) / 1000);
    var end_t = Math.floor(Date.now() / 1000);
    getHistory(chkArray, chkArray, start_t, end_t);
}
