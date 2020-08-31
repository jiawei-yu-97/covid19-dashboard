function drawLineGraph(data, dataName, lineGraphID, graphOptionsID){
    let tabularData = new TypedTabularData(objToArray(data['latest']), ['country', dataName]);
    let timeSeriesData = TimeSeriesData.fromProcessedDict(data);
    
    let colors = getColorsDict(timeSeriesData.seriesNames);
    let lineGraph = new LineGraph(lineGraphID, null, 'lines', colors);
    lineGraph.setLayout({title: dataName + ' per day'});
    
    let graphOptionsNode = getNode(graphOptionsID)
    let combinedControl = new TimeSeriesCombinedControl(lineGraph, timeSeriesData, tabularData, graphOptionsNode,dataName);
    combinedControl.makeLogControl('Use Log Scale');
    combinedControl.makeSmoothingControl('Smoothing: ');

    graphOptionsNode.appendChild(document.createElement('br'));
    graphOptionsNode.appendChild(document.createTextNode('Data filter'));

    combinedControl.makeTable('scroll-y height240', 'Clear Selection');
    combinedControl.updateAndDisplay();
}


function drawMultipleAxesLineGraph(dataArray, dataNames, axes, lineGraphID, graphOptionsID, controlName, tableColumnIndex){
    let tabularData = new TypedTabularData(objToArray(dataArray[tableColumnIndex]['latest']), ['country', dataNames[tableColumnIndex]]);

    let lineGraph = new MultipleAxesLineGrpah(lineGraphID, null, axes, 'lines');
    lineGraph.setLayout({title: 'Cases per day'});
    let multiTimeSeriesData = MultiTimeSeriesData.fromProcessedDict(dataArray, dataNames);

    let graphOptionsNode = getNode(graphOptionsID)
    let combinedControl = new TimeSeriesCombinedControl(lineGraph, multiTimeSeriesData, tabularData, graphOptionsNode, controlName);
    combinedControl.makeLogControl('Use Log Scale');
    combinedControl.makeSmoothingControl('Smoothing: ');

    graphOptionsNode.appendChild(document.createElement('br'));
    graphOptionsNode.appendChild(document.createTextNode('Data filter'));

    combinedControl.makeTable('scroll-y height240', 'Clear Selection', true);
    combinedControl.updateAndDisplay();
}


function drawBarPie(data, barID, barName, pieID, pieName, smoothing=1) {
    data = copyObj(data);
    data = smoothData(data, smoothing);
    data = data['latest'];

    data = objToArray(data);
    let headerNames = ['country', 'cases'];
    tabularData = new TypedTabularData(data, headerNames);

    if (smoothing > 1) {
        barName = barName + ', ' + smoothing + '-day average';
        pieName = pieName + ', ' + smoothing + '-day average';
    }
    
    pieGraph = new PieGraph(pieID, tabularData, 0, 1);
    pieGraph.setLayout({'title': pieName});
    pieControl = new PieControl(pieGraph, tabularData, 9);
    pieControl.updateAndDisplay();

    barGraph = new BarGraph(barID, tabularData, 0, 1);
    barGraph.setLayout({'title': barName});
    barControl = new BarControl(barGraph, tabularData, 15);
    barControl.updateAndDisplay();
}


function drawChoropleth(data, graphID, graphName, smoothing=1, zmax=null){
    data = copyObj(data);
    data = smoothData(data, smoothing);
    data = data['latest'];

    data['World'] = 0;
    data = objToArray(data);
    let headerNames = ['country', 'cases'];
    tabularData = new TypedTabularData(data, headerNames);

    choroplethGraph = new ChoroplethGraph(graphID, tabularData, 0, 1);
    if (smoothing > 1) {
        graphName = graphName + ', ' + smoothing + '-day average';
    }
    choroplethGraph.setLayout({'title': graphName});
    choroplethGraph.graphData['zmax'] = zmax;
    choroplethGraph.display();
}


function drawSummaryTable(dataCollection, tableID, graphConfigID, addFilterID) {
    let deaths = dataCollection['deaths']['latest'];
    let deathsPerCapita = dataCollection['deaths']['rate'];
    let cases = dataCollection['confirmed']['latest'];
    let casesPerCapita = dataCollection['confirmed']['rate'];
    let recovs = dataCollection['recovered']['latest'];

    let newCases = dataCollection['confirmed_daily']['latest'];
    let newDeaths = dataCollection['deaths_daily']['latest'];

    const countries = getKeysIntersection([deaths, cases, recovs]);
    let dataArray = [];
    for (let country of countries) {
        let death = deaths[country];
        let newDeath = newDeaths[country];
        let deathPerCapita = deathsPerCapita[country];
        let recov = recovs[country];
        let confirmed = cases[country];
        let newConfirmed = newCases[country];
        let confirmedPerCapita = casesPerCapita[country];
        let deathRate = floatToPerct(death / confirmed);
        let recovRate = floatToPerct(recov / confirmed);
        let resolved = floatToPerct((death + recov) / confirmed);
        dataArray.push([country, newConfirmed, newDeath, confirmed, confirmedPerCapita, death, deathPerCapita, deathRate, recov, recovRate, resolved]);
    }
    let headerNames = ['Country', 'New Cases', 'New Deaths', 'Total Cases', 'Cases/1K pop','Total Deaths', 'Deaths/1M pop','Fatality Rate', 'Total Recovery', 'Receovery Rate', 'Resolved Rate'];

    let tabularData = new TypedTabularData(dataArray, headerNames);
    let tableView = new TypedTable(tableID, true, tabularData);

    let headerControl = new SortableTableHeader(tableView);
    let addFilterButton = getNode(addFilterID);
    let tableFilter = new TableFilter(tableView, getNode(graphConfigID), 'table-control');
    let controlsChain = new ControlsChain([headerControl, tableFilter]);
    controlsChain.setData(tabularData);

    headerControl.setHeaderEventListeners();
    headerControl.display();
    addFilterButton.onclick = function () {
        tableFilter.makeControlArea();
    }
    // Sort by the Total Cases column
    headerControl.sortTable(3);
    headerControl.sortTable(3);
    tableFilter.makeControlArea();
}


function setSelectToggler(selectID, names, secIDs){
    if (names.length !== secIDs.length) {
        console.log('setSelectToggler: names and secIDs have different lengths.');
    }
    let selectNode = document.getElementById(selectID);
    for (let i=0; i<names.length; i++){
        let optionNode = document.createElement('option');
        optionNode.innerHTML = names[i];
        optionNode.setAttribute('value', names[i]);
        selectNode.appendChild(optionNode);
        if (i !== 0){
            document.getElementById(secIDs[i]).style.display='none';
        }
    }

    selectNode.addEventListener('change', function() {
        for (let i=0; i<names.length; i++){
            if (this.value === names[i]){
                document.getElementById(secIDs[i]).style.display='inline';
            } else {
                document.getElementById(secIDs[i]).style.display='none';
            }
        }
    })
}
