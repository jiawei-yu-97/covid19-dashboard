const latestDate = getLastItem(dataCollection['confirmed']['date']);

addTextToElement(document.getElementById('footer-1'), "最近数据更新：" + latestDate);
addTextToElement(document.getElementById('footer-3'), 
    '数据可能存在不准确。 \
    部分国家并未统计痊愈人数，或者发布的统计数字严重滞后。 \
    因此这些国家的现存确诊会被高估。');

document.getElementById('header-1').innerText = '新增确诊';
document.getElementById('header-2').innerText = '新增病亡';
document.getElementById('header-3').innerText = '现存确诊';

drawBarPie(dataCollection['confirmed_daily'],
    'new-cases-bar', '新增确诊人数最多的国家',
    'new-cases-pie', '占全球总数比例');

drawLineGraph(dataCollection['confirmed_daily'], 
    '新增确诊',
    'new-cases-table',
    'new-cases-graph-options',
    'new-cases-lines',
    'new-cases-smoothing',
    'new-cases-log',
    'new-cases-clear');


drawBarPie(dataCollection['deaths_daily'],
    'death-cases-bar', '新增死亡人数最多的国家',
    'death-cases-pie', '占全球总数比例');

drawLineGraph(dataCollection['deaths_daily'], 
    '新增病亡',
    'death-cases-table',
    'death-cases-graph-options',
    'death-cases-lines',
    'death-cases-smoothing',
    'death-cases-log',
    'death-cases-clear');


drawBarPie(dataCollection['active'],
    'active-cases-bar', '现存确诊人数最多的国家',
    'active-cases-pie', '占全球总数比例');

drawLineGraph(dataCollection['active'], 
    '现存确诊',
    'active-cases-table',
    'active-cases-graph-options',
    'active-cases-lines',
    'active-cases-smoothing',
    'active-cases-log',
    'active-cases-clear');
