const latestDate = getLastItem(dataCollection['confirmed']['date']);

addTextToElement(document.getElementById('footer-1'), "Data last updated: " + latestDate);

document.getElementById('header-1').innerText = 'Daily Cases';
document.getElementById('header-2').innerText = 'Daily Deaths';
document.getElementById('header-3').innerText = 'Daily Cases and Deaths';

drawBarPie(dataCollection['confirmed_daily'],
    'new-cases-bar', 'Countries with the most new cases',
    'new-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['confirmed_daily'], 
    'New Cases',
    'new-cases-lines',
    'new-cases-graph-options');


drawBarPie(dataCollection['deaths_daily'],
    'deaths-cases-bar', 'Countries with the most new deaths',
    'deaths-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['deaths_daily'], 
    'New Deaths',
    'deaths-cases-lines',
    'deaths-cases-graph-options');


drawMultipleAxesLineGraph(
    [dataCollection['confirmed_daily'], dataCollection['deaths_daily'], dataCollection['recovered_daily']],
    ['New Cases', 'New Deaths'],
    {'New Deaths': 'y2'},
    'multi-lines', 
    'multi-lines-graph-options',
    'multi-lines'
);
