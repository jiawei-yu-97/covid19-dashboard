const latestDate = getLastItem(dataCollection['confirmed']['date']);
addTextToElement(document.getElementById('footer-1'), "Data last updated: " + latestDate);


drawSummaryTable(dataCollection,
    'summary-table',
    'summary-table-config',
    'add-table-filter');


// Daily Data
function drawFlatDailys(smoothing) {
    drawChoropleth(dataCollection['confirmed_daily'],
        'new-cases-choropleth',
        'New Cases by Country',
        smoothing,
        10000);

    drawBarPie(dataCollection['confirmed_daily'],
        'new-cases-bar', 'Countries with the most new cases',
        'new-cases-pie', 'Percentage of world total',
        smoothing);


    drawChoropleth(dataCollection['deaths_daily'],
        'new-deaths-choropleth',
        'New Deaths by Country',
        smoothing);

    drawBarPie(dataCollection['deaths_daily'],
        'new-deaths-bar', 'Countries with the most new deaths',
        'new-deaths-pie', 'Percentage of world total',
        smoothing);
}

drawFlatDailys(7);


drawLineGraph(dataCollection['confirmed_daily'],
    'New Cases',
    'new-cases-lines',
    'new-cases-graph-options');

drawLineGraph(dataCollection['deaths_daily'],
    'New Deaths',
    'new-deaths-lines',
    'new-deaths-graph-options');


setSelectToggler('section-daily-select',
    ['Confirmed Cases', 'Deaths'],
    ['section-new-cases', 'section-new-deaths']);


drawMultipleAxesLineGraph(
    [dataCollection['confirmed_daily'], dataCollection['deaths_daily'], dataCollection['recovered_daily']],
    ['New Cases', 'New Deaths'],
    { 'New Deaths': 'y2' },
    'daily-multi-lines',
    'daily-multi-lines-graph-options',
    'daily-multi-lines',
    0
);



// Aggregate Data
drawChoropleth(dataCollection['confirmed'],
    'all-cases-choropleth',
    'Aggregate Cases by Country');

drawBarPie(dataCollection['confirmed'],
    'all-cases-bar', 'Countries with the most confirmed cases',
    'all-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['confirmed'],
    'Aggregate Cases',
    'all-cases-lines',
    'all-cases-graph-options');


drawChoropleth(dataCollection['deaths'],
    'all-deaths-choropleth',
    'Aggregate Deaths by Country');

drawBarPie(dataCollection['deaths'],
    'deaths-cases-bar', 'Countries with the most total deaths',
    'deaths-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['deaths'],
    'Aggregate Deaths',
    'deaths-cases-lines',
    'deaths-cases-graph-options');

setSelectToggler('section-aggregate-select',
    ['Confirmed Cases', 'Deaths'],
    ['section-aggregate-cases', 'section-aggregate-deaths']);

drawMultipleAxesLineGraph(
    [dataCollection['recovered'], dataCollection['deaths'], dataCollection['active']],
    ['Recovered', 'Deaths', 'Active'],
    {},
    'aggregate-multi-lines',
    'aggregate-multi-lines-graph-options',
    'aggreagte-multi-lines',
    2
);


window.addEventListener('resize', function() {
    location.reload();
});