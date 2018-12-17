window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};
var allRivers = myData();
//getRivers();
createChart();





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
        createChart();
    }).fail(function (xhr, status, error) {
        // write fail message here, in case
    })

}

function createChart() {
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["0", "1"],
            datasets: [{
                label: allRivers[0].name + ": " + allRivers[0].stations[0].city,
                backgroundColor: window.chartColors.red,
                borderColor: window.chartColors.red,
                data: [
                    allRivers[0].stations[0].current.value
                ],
                fill: false,
            }, {
                label: allRivers[0].name + ": " + allRivers[0].stations[1].city,
                fill: false,
                backgroundColor: window.chartColors.blue,
                borderColor: window.chartColors.blue,
                data: [
                    allRivers[0].stations[1].current.value
                ],
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Chart.js Line Chart'
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
                        labelString: 'Month'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        }
    });
}
