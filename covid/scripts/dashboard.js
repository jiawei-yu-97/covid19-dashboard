const latestDate = getLastItem(dataCollection['confirmed']['date']);
addTextToElement(document.getElementById('footer-1'), "Data last updated: " + latestDate);


// functions
function drawFlats(type) {
    let mode = document.getElementById(type + '-cases-section-select').value;
    let smoothing = 1;
    let data = null;

    if (type === 'new') {
        data = dataCollection[mode + '_daily'];
        smoothing = document.getElementById(type + '-cases-smoothing-select').value;
    } else if (type === 'aggregate') {
        data = dataCollection[mode];
    }
    if (mode === 'confirmed'){
        mode = 'cases';
    }
    let rateUnit = 0;
    let population = {};
    if (document.getElementById(type + '-cases-per-capita-toggle').checked) {
        rateUnit = 1000000;
        if (mode === 'cases' && type === 'aggregate'){
            rateUnit = 1000;
        }
        population = dataCollection['population'];
    }
    mode = type + ' ' + mode;

    drawChoropleth(data,
        type + '-cases-choropleth',
        mode + ' by country',
        smoothing,
        rateUnit,
        population);

    drawBarPie(data,
        type + '-cases-bar', 'countries with the most ' + mode,
        type + '-cases-pie', 'percentage of world total',
        smoothing);
}


function drawGraphs(type) {
    drawFlats(type);

    let mode = document.getElementById(type + '-cases-section-select').value;
    let data = null;
    if (type === 'new') {
        data = dataCollection[mode + '_daily'];
        mode = type + ' Cases';

        document.getElementById(type + '-cases-smoothing-select').onchange = function () {
            drawFlats(type);
        }
    } else if (type === 'aggregate') {
        data = dataCollection[mode];
        mode = type + ' Deaths';
    }

    drawLineGraph(data,
        mode,
        type + '-cases-lines',
        type + '-cases-graph-options');

    document.getElementById(type + '-cases-section-select').onchange = function () {
        drawGraphs(type);
    }
    document.getElementById(type + '-cases-per-capita-toggle').onchange = function () {
        drawFlats(type);
    }
}


//Action
drawSummaryTable(dataCollection,
    'summary-table',
    'summary-table-config',
    'add-table-filter');

drawGraphs('new');

drawGraphs('aggregate');

drawMultipleAxesLineGraph(
    [dataCollection['confirmed_daily'], dataCollection['deaths_daily']],
    ['New Cases', 'New Deaths'],
    { 'New Deaths': 'y2' },
    'new-cases-multi-lines',
    'new-cases-multi-lines-graph-options',
    'new-cases-multi-lines',
    0
);

drawMultipleAxesLineGraph(
    [dataCollection['recovered'], dataCollection['deaths'], dataCollection['active']],
    ['Recovered', 'Deaths', 'Active'],
    {},
    'aggregate-cases-multi-lines',
    'aggregate-cases-multi-lines-graph-options',
    'aggregate-cases-multi-lines',
    2
);


//window.addEventListener('resize', function() {
//    location.reload();
//});