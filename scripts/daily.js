const latestDate = getLastItem(dataCollection['confirmed']['date']);

addTextToElement(document.getElementById('footer-1'), "As of " + latestDate);
addTextToElement(document.getElementById('footer-3'), 
    'Data may be inaccurate. \
    Some countries do not report recovery numbers or experience significant delays in reporting, \
    thus overestimating active cases.');

document.getElementById('header-1').innerText = 'Daily Cases';
document.getElementById('header-2').innerText = 'Daily Deaths';
document.getElementById('header-3').innerText = 'Active Cases Count';

drawBarPie(dataCollection['confirmed_daily'],
    'new-cases-bar', 'Countries with the most new cases',
    'new-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['confirmed_daily'], 
    'New Cases',
    'new-cases-table',
    'new-cases-graph-options',
    'new-cases-lines',
    'new-cases-smoothing',
    'new-cases-log',
    'new-cases-clear');


drawBarPie(dataCollection['deaths_daily'],
    'death-cases-bar', 'Countries with the most daily deaths',
    'death-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['deaths_daily'], 
    'Daily Deaths',
    'death-cases-table',
    'death-cases-graph-options',
    'death-cases-lines',
    'death-cases-smoothing',
    'death-cases-log',
    'death-cases-clear');


drawBarPie(dataCollection['active'],
    'active-cases-bar', 'Countries with the most active cases',
    'active-cases-pie', 'Percentage of world total');

drawLineGraph(dataCollection['active'], 
    'Active Cases',
    'active-cases-table',
    'active-cases-graph-options',
    'active-cases-lines',
    'active-cases-smoothing',
    'active-cases-log',
    'active-cases-clear');
