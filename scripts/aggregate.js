const latestDate = getLastItem(dataCollection['confirmed']['date']);
addTextToElement(document.getElementById('footer-1'), "As of " + latestDate);
addTextToElement(document.getElementById('footer-2'), 'Data from https://data.humdata.org/ - \
Centre for Humanitarian Data of the UN.');
addTextToElement(document.getElementById('footer-3'), 'Some countries do not report recovery figures.');

document.getElementById('header-1').innerText = 'All Confirmed Cases';
document.getElementById('header-2').innerText = 'All Confirmed Deaths';
document.getElementById('header-3').innerText = 'Summary Table';


drawBarPie(dataCollection['confirmed'],
    'all-cases-bar', 'Countries with the most confirmed cases',
    'all-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['confirmed'], 
    'Aggregate Cases',
    'all-cases-table',
    'all-cases-graph-options',
    'all-cases-lines',
    'all-cases-smoothing',
    'all-cases-log',
    'all-cases-clear');


drawBarPie(dataCollection['deaths'],
    'deaths-cases-bar', 'Countries with the most total deaths',
    'deaths-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['deaths'], 
    'Aggregate Deaths',
    'deaths-cases-table',
    'deaths-cases-graph-options',
    'deaths-cases-lines',
    'deaths-cases-smoothing',
    'deaths-cases-log',
    'deaths-cases-clear');


drawSummaryTable(dataCollection,
    'summary-table');