const fetchedTime = dataCollection['fetched'];
const lastestDate = getLatestDate(dataCollection['confirmed']);

addTextToElement(document.getElementById('footer-1'),lastestDate);
addTextToElement(document.getElementById('footer-2'),fetchedTime);


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
    let rateUnit = 0;
    let population = {};
    if (document.getElementById(type + '-cases-per-capita-toggle').checked) {
        rateUnit = 1000000;
        if (mode === 'confirmed' && type === 'aggregate') {
            rateUnit = 1000;
        }
        population = dataCollection['population'];
    }
    if (mode === 'confirmed') {
        mode = 'cases';
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

        document.getElementById(type + '-cases-smoothing-select').onchange = function () {
            drawFlats(type);
        }
    } else if (type === 'aggregate') {
        data = dataCollection[mode];
    }
    if (mode === 'confirmed') {
        mode = 'cases';
    }
    mode = type + ' ' + mode;;

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
    'new cases and deaths per day',
    [dataCollection['confirmed_daily'], dataCollection['deaths_daily']],
    ['new cases', 'new deaths'],
    { 'new deaths': 'y2' },
    'new-cases-multi-lines',
    'new-cases-multi-lines-graph-options',
    'new-cases-multi-lines',
    0
);

drawMultipleAxesLineGraph(
    "cumulative active, deaths and recovered cases",
    [dataCollection['recovered'], dataCollection['deaths'], dataCollection['active']],
    ['recovered', 'deaths', 'active'],
    {},
    'aggregate-cases-multi-lines',
    'aggregate-cases-multi-lines-graph-options',
    'aggregate-cases-multi-lines',
    2
);


//window.addEventListener('resize', function() {
//    location.reload();
//});