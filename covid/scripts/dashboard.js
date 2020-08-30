const latestDate = getLastItem(dataCollection['confirmed']['date']);
addTextToElement(document.getElementById('footer-1'), "Data last updated: " + latestDate);



drawSummaryTable(dataCollection,
    'summary-table',
    'summary-table-config',
    'add-table-filter');


// Daily Data
drawBarPie(dataCollection['confirmed_daily'],
    'new-cases-bar', 'Countries with the most new cases',
    'new-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['confirmed_daily'], 
    'New Cases',
    'new-cases-lines',
    'new-cases-graph-options');


drawBarPie(dataCollection['deaths_daily'],
    'new-deaths-bar', 'Countries with the most new deaths',
    'new-deaths-pie', 'Percentage of world total');

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
    {'New Deaths': 'y2'},
    'daily-multi-lines', 
    'daily-multi-lines-graph-options',
    'daily-multi-lines',
    0
);



// Aggregate Data
drawBarPie(dataCollection['confirmed'],
    'all-cases-bar', 'Countries with the most confirmed cases',
    'all-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['confirmed'],
    'Aggregate Cases',
    'all-cases-lines',
    'all-cases-graph-options');

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
    ['Recovered','Deaths','Active'],
    {},
    'aggregate-multi-lines',
    'aggregate-multi-lines-graph-options',
    'aggreagte-multi-lines',
    2
);
