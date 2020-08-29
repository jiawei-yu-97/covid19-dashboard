const latestDate = getLastItem(dataCollection['confirmed']['date']);
addTextToElement(document.getElementById('footer-1'), "Data last updated: " + latestDate);
addTextToElement(document.getElementById('footer-3'), 'Some countries do not report recovery figures.');

document.getElementById('header-1').innerText = 'Summary Table';
document.getElementById('header-2').innerText = 'All Confirmed Cases';
document.getElementById('header-3').innerText = 'All Confirmed Deaths';
document.getElementById('header-4').innerText = 'Cases, Deaths and Recoveries';


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


drawSummaryTable(dataCollection,
    'summary-table',
    'summary-table-config',
    'add-table-filter');


drawMultipleAxesLineGraph(
    [dataCollection['confirmed'], dataCollection['deaths'], dataCollection['recovered']],
    ['Cases', 'Deaths', 'Recovered'],
    {},
    'multi-lines',
    'multi-lines-graph-options',
    'multi-lines'
);