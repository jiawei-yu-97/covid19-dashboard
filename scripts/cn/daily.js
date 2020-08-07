const latestDate = getLastItem(dataCollection['confirmed']['date']);

addTextToElement(document.getElementById('footer-1'), "As of " + latestDate);

document.getElementById('header-1').innerText = '新增确诊';
document.getElementById('header-2').innerText = '新增死亡';
document.getElementById('header-3').innerText = '新增确诊与死亡';

drawBarPie(dataCollection['confirmed_daily'],
    'new-cases-bar', '新增确诊最多的国家',
    'new-cases-pie', '新增确诊占全球比例');

drawLineGraph(dataCollection['confirmed_daily'], 
    '新增确诊',
    'new-cases-lines',
    'new-cases-graph-options');


drawBarPie(dataCollection['deaths_daily'],
    'deaths-cases-bar', '新增死亡最多的国家',
    'deaths-cases-pie', '新增死亡占全球比例');

drawLineGraph(dataCollection['deaths_daily'], 
    '新增死亡',
    'deaths-cases-lines',
    'deaths-cases-graph-options');


drawMultipleAxesLineGraph(
    [dataCollection['confirmed_daily'], dataCollection['deaths_daily'], dataCollection['recovered_daily']],
    ['新增确诊', '新增死亡'],
    {'新增死亡': 'y2'},
    'multi-lines', 
    'multi-lines-graph-options',
    'multi-lines'
);
