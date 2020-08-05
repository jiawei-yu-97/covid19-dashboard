function drawLineGraph(data, dataName, tableID, graphOptionsID, lineGraphID, lineSmootingID, lineLogID, clearButtonID){
    let tabularData = new TypedTabularData(objToArray(data['latest']), ['国家或地区', dataName]);
    let table = new TypedTable(tableID, false, tabularData);
    
    let headerControl = new SortableTableHeader(table);
    headerControl.setHeaderEventListeners();
    headerControl.display();
    
    let tableFilter = new TableFilter(table, graphOptionsID,'table-control');
    tableFilter.makeControlArea(false);
    
    let lineGraph = new LineGraph(lineGraphID, null);
    lineGraph.setLayout({title: '每日' + dataName});
    let timeSeriesSelection = new TimeSeriesSelection(lineGraph, null, table);
    let timeSeriesSmoothing = new TimeSeriesSmoothing(lineGraph, null, lineSmootingID)
    
    let timeSeriesData = TimeSeriesData.fromProcessedDict(data);
    let controlsChain = new ControlsChain([timeSeriesSelection, timeSeriesSmoothing], timeSeriesData);
    
    timeSeriesSelection.setTableRowFunc();
    timeSeriesSelection.countriesClicked['全球'] = true;
    timeSeriesSelection.refillTable();
    timeSeriesSelection.updateAndDisplay();
    timeSeriesSmoothing.addRadios();
    
    let timeSeriesLogScale = new TimeSeriesLogScale(lineGraph, lineLogID);
    timeSeriesLogScale.setEventListener();
    
    let clearButton = document.getElementById(clearButtonID);
    clearButton.onclick = function() {
        timeSeriesSelection.ClearSelection();
    }

    lineGraph.display();
}


function drawBarPie(data, barID, barName, pieID, pieName) {
    data = data['latest'];
    data = objToArray(data);
    let headerNames = ['国家或地区', '人数'];
    tabularData = new TypedTabularData(data, headerNames);

    pieGraph = new PieGraph(pieID, tabularData, 0, 1);
    pieGraph.setLayout({'title': pieName});
    pieControl = new PieControl(pieGraph, tabularData, 10);
    pieControl.updateAndDisplay();

    barGraph = new BarGraph(barID, tabularData, 0, 1);
    barGraph.setLayout({'title': barName});
    barControl = new BarControl(barGraph, tabularData, 15);
    barControl.updateAndDisplay();
}


function drawSummaryTable(dataCollection, tableID) {
    let deaths = dataCollection['deaths']['latest'];
    let cases = dataCollection['confirmed']['latest'];
    let recovs = dataCollection['recovered']['latest'];

    const countries = getKeysIntersection([deaths, cases, recovs]);
    let dataArray = [];
    for (let country of countries) {
        let death = deaths[country];
        let recov = recovs[country];
        let confirmed = cases[country];
        let deathRate = floatToPerct(death / confirmed);
        let recovRate = floatToPerct(recov / confirmed);
        let resolved = floatToPerct((death + recov) / confirmed);
        dataArray.push([country, confirmed, death, deathRate, recov, recovRate, resolved]);
    }
    let headerNames = ['国家或地区', '确诊总数', '病亡总数', '死亡率', '痊愈总数', '痊愈率', '死亡+痊愈比例'];

    let tabularData = new TypedTabularData(dataArray, headerNames);
    let tableView = new TypedTable(tableID, true, tabularData);

    let headerControl = new SortableTableHeader(tableView);
    let addFilterButton = document.getElementById('add-table-filter');
    let graphConfigID = 'summary-table-config';
    let tableFilter = new TableFilter(tableView, graphConfigID, 'table-control');
    let controlsChain = new ControlsChain([headerControl, tableFilter]);
    controlsChain.setData(tabularData);

    headerControl.setHeaderEventListeners();
    headerControl.display();
    headerControl.sortTable(1);
    headerControl.sortTable(1);
    addFilterButton.onclick = function () {
        tableFilter.makeControlArea();
    }
    tableFilter.makeControlArea();
}


//window.addEventListener('resize', function() {
//    location.reload();
//})
