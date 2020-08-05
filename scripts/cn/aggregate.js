const latestDate = getLastItem(dataCollection['confirmed']['date']);
addTextToElement(document.getElementById('footer-1'), "最近数据更新：" + latestDate);
addTextToElement(document.getElementById('footer-3'), '部分国家没有痊愈人数的记录.');

document.getElementById('header-1').innerText = '累计确诊人数';
document.getElementById('header-2').innerText = '累计病亡人数';
document.getElementById('header-3').innerText = '数据详表';


drawBarPie(dataCollection['confirmed'],
    'all-cases-bar', '累计确诊最多的国家',
    'all-cases-pie', '占全球总数比例');

drawLineGraph(dataCollection['confirmed'], 
    '累计确诊',
    'all-cases-table',
    'all-cases-graph-options',
    'all-cases-lines',
    'all-cases-smoothing',
    'all-cases-log',
    'all-cases-clear');


drawBarPie(dataCollection['deaths'],
    'deaths-cases-bar', '累计病亡最多的国家',
    'deaths-cases-pie', '占全球总数比例');

drawLineGraph(dataCollection['deaths'], 
    '累计病亡',
    'deaths-cases-table',
    'deaths-cases-graph-options',
    'deaths-cases-lines',
    'deaths-cases-smoothing',
    'deaths-cases-log',
    'deaths-cases-clear');


drawSummaryTable(dataCollection,
    'summary-table');