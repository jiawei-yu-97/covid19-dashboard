const latestDate = getLastItem(dataCollection['confirmed']['date']);
addTextToElement(document.getElementById('footer-1'), "最近更新：" + latestDate);
addTextToElement(document.getElementById('footer-3'), '部分国家对于治愈人数的统计不准确');

document.getElementById('header-1').innerText = '数据详表';
document.getElementById('header-2').innerText = '累积确诊';
document.getElementById('header-3').innerText = '累积死亡';
document.getElementById('header-4').innerText = '累积确诊、死亡、痊愈';


drawBarPie(dataCollection['confirmed'],
    'all-cases-bar', '累计确诊最多的国家',
    'all-cases-pie', '累计确诊占全球比例');

drawLineGraph(dataCollection['confirmed'],
    '累计确诊',
    'all-cases-lines',
    'all-cases-graph-options');


drawBarPie(dataCollection['deaths'],
    'deaths-cases-bar', '累计死亡最多的国家',
    'deaths-cases-pie', '累计死亡占全球比例');

drawLineGraph(dataCollection['deaths'],
    '累积死亡',
    'deaths-cases-lines',
    'deaths-cases-graph-options');


drawSummaryTable(dataCollection,
    'summary-table',
    'summary-table-config',
    'add-table-filter');


drawMultipleAxesLineGraph(
    [dataCollection['confirmed'], dataCollection['deaths'], dataCollection['recovered']],
    ['确诊', '死亡', '痊愈'],
    {},
    'multi-lines',
    'multi-lines-graph-options',
    'multi-lines'
);