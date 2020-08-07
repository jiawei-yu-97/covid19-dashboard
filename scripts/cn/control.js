class Control {
    constructor(view, data = null) {
        this.view = view;

        if (data === null){
            data = this.view.data;
        }
        this.setViewData(data);
        this.setControllerData(data);
        this.chain = null;
    }

    get chainedControls() {
        let controls = [];
        if (this.chain !== null){
            for (let control of this.chain.controls){
                if (control !== this){
                    controls.push(control)
                }
            }
        }
        return controls;
    }

    validate(view, data){
        if (!view instanceof View){
            throw Error('Control.validate: view is not an instance of class View');
        } else if (data!== null && !data instanceof Data){
            throw Error('Control.validate: data is not an instance of class Data');
        }
    }

    setControllerData(data, validate=true){
        if (validate){
            this.validate(this.view, data);
        }
        this.data = data;
    }

    setViewData(data=this.data){
        this.view.setData(data);
    }

    updateData(data=this.getChainData(), validate=true){
        if (validate){
            this.validate(this.view, data);
        }
        return data;
    }

    getChainData() {
        if (this.chain === null){
            return this.data.copy();
        } else {
            return this.chain.getData();
        }
    }

    runChainedUpdates(data=this.getChainData(), validate=false){
        for (let control of this.chainedControls){
            data = control.updateData(data, validate);
        }
        return data;
    }

    updateAndDisplay() {
        let data = this.runChainedUpdates();
        data = this.updateData(data);
        this.setViewData(data);
        this.view.display();
    }

    display() {
        this.view.display();
    }
}


class ControlsChain {
    constructor(controls, data = null, validate=true){
        if (validate){
            this.validate(controls);
        }
        this.controls = controls;
        for (let control of controls){
            control.chain = this;
        }
        this.data = null;
        this.setData(data);
    }

    setData(data) {
        for (let control of this.controls){
            control.validate(control.view, data);
        }
        this.data = data;
        for (let control of this.controls){
            control.setControllerData(data, false);
        }
    }

    getData() {
        if (this.data !== null){
            return this.data.copy();
        }
        return null;
    }

    validate(controls){
        for (let i=0; i<controls.length; i++){
            let control = controls[i];
            if (!control instanceof Control){
                throw Error('ControlChain: an object is not an instance of class Control.');
            }
            if (controls[i] in controls.slice(i+1, controls.length)){
                throw Error('ControlsChain: duplicate controls are not allowed.');
            }
        }
        return true;
    }

    addToChain(control) {
        if (control in this.controls){
                throw Error('ControlsChain.addToChain: control already exists in chain');
        }
        this.controls.push(control);
        control.chain = this;
    }
}


/*
TABLE CONTROL
*/
class TableControl extends Control{
    constructor(table, data=null, validate=true) {
        super(table, data);
        if (validate){
            this.validate(table, data);
        }
        this.table = table;
    }

    validate(table, data){
        super.validate(table, data);
        if (!table instanceof Table){
            throw Error('SortableTableHeader.validate: table is not an instance of class TypedTable');
        }
        return true;
    }

    display(data=this.table.data) {
        let headerChanged = !arrayEqual(data.headerNames, this.table.data.headerNames);
        if (headerChanged) {
            this.table.refillTable();
        } else {
            this.table.refillEntryRows();
        }
    }
}


class TypedTableControl extends TableControl {
    constructor(table, data=null) {
        super(table, data);
    }

    validate(table, data){
        super.validate(table, data);
        if (!table instanceof TypedTable){
            throw Error('TypedTableControl.validate: table is not an instance of class TypedTable');
        } else if (data!== null && !data instanceof TypedTabularData) {
            throw Error('TypedTableControl.validate: data is not an instance of class SortableData');
        }
    }
}


class SortableTableHeader extends TypedTableControl {
    constructor(table, data=null, validate=true) {
        super(table, data, validate);
        this.colOrderReverse = [];
        this.lastSortedColumn = 0;
    }

    setControllerData(data, validate=true){
        super.setControllerData(data, validate);
        this.resetColOrderReverse();
        this.lastSortedColumn = 0;
    }

    updateData(data=this.getChainData(), validate=true){
        let col = this.lastSortedColumn;
        let reverse = this.colOrderReverse[col];
        data.sortByCol(col, !reverse);
        return data;
    }

    resetColOrderReverse() {
        if (this.data !== null){
            this.colOrderReverse = this.data.dataTypes.map(x => false);
        } else {
            this.colOrderReverse = [];
        }
    }

    sortTable(col){
        let data = this.getChainData();
        data = this.runChainedUpdates(data, false);
        let reverse = this.colOrderReverse[col];
        this.colOrderReverse[col] = !reverse;
        data.sortByCol(col, reverse);
        this.lastSortedColumn = col;
        this.setViewData(data);
        this.display();
    }

    setHeaderEventListeners() {
        let col = 0;
        col -= Number(this.table.addIndex);
        if (this.table.headerRow === null){
            this.table.addHeaders();
        }
        for (let node of this.table.headerRow.childNodes){
            if (node.nodeName === 'TH'){
                let col_copy = col;
                let control = this;
                node.addEventListener('click', function() {
                    control.sortTable(col_copy); 
                });
                col += 1;
            }
        }
    }
}


class TableFilter extends TypedTableControl {
    constructor(table, parentNode, divClass=null, data=null,validate=true){
        super(table, data, validate);
        this.parentNode = parentNode;
        this.divClass = divClass;

        this.filters = {};
        this.filterCount = 0;
    }

    setControllerData(data, validate=true){
        super.setControllerData(data, validate);
        if (data !== null){
            this.headerNames = data.headerNames;
            this.columnIndices = {};
            let i = 0;
            for (let col of this.headerNames){
                this.columnIndices[col] = i;
                i+=1;
            }
        }
    }
    
    updateData(data=this.getChainData(), validate=true){
        data = this.applyFilters(data);
        return data;
    }

    onChangeFunction(){
        this.table.removeEntryRows();

        let data = this.getChainData();
        data = this.runChainedUpdates(data, false);
        data = this.applyFilters(data);
        this.setViewData(data);
        this.display();
    }

    makeSelectNode(values, selectID=null, selectName=null){
        let selectNode = document.createElement('select');

        for (let value of values){
            let optionNode = document.createElement('option');
            optionNode.innerHTML = value;
            optionNode.setAttribute('value', value);
            selectNode.appendChild(optionNode);
        }
        
        selectNode.setAttribute('id', selectID);
        selectNode.setAttribute('name', selectName);
        return selectNode;
    }

    makeInputNode(id=null, name=null, size=10){
        let inputNode = document.createElement('input');
        inputNode.setAttribute('type', 'text');
        inputNode.setAttribute('id', id);
        inputNode.setAttribute('name', name);
        inputNode.setAttribute('size', size);
        return inputNode;
    }

    makeControlArea(deleteButton=true){
        let control = this;

        let divNode = document.createElement('div');
        divNode.setAttribute('class', this.divClass);
        this.parentNode.appendChild(divNode);

        let selectColumnNode = this.makeSelectNode(this.headerNames);
        divNode.appendChild(selectColumnNode);
        let filters = ['包含', '不少于', '不多于'];
        let filterNode = this.makeSelectNode(filters);
        divNode.appendChild(filterNode);
        let inputNode = this.makeInputNode();
        divNode.appendChild(inputNode);

        let filterID = this.filterCount;
        this.filters[filterID] = [selectColumnNode, filterNode, inputNode];
        this.filterCount += 1;

        inputNode.addEventListener('input',function() {
            control.onChangeFunction()
        })
        filterNode.addEventListener('change',function() {
            control.onChangeFunction()
        }) 
        selectColumnNode.addEventListener('change',function() {
            control.onChangeFunction();
        })

        if (deleteButton){
            let removeButton = document.createElement('button');
            removeButton.innerHTML = '删除条件';
            removeButton.onclick = function() {
                control.filters[filterID] = null;
                divNode.remove();
                control.onChangeFunction();
            }
            divNode.appendChild(removeButton);
        }
    }

    filterData(data, col, filterType, input){
        if (filterType === '不多于'){
            data = data.filterByMax(col, Number(input));
        } else if (filterType === '不少于'){
            data = data.filterByMin(col, Number(input));
        } else {
            data = data.filterByStr(col, input);
        }
        return data;
    }

    applyFilter(data, selectColumnNode, filterNode, inputNode){
        let columnValue = selectColumnNode.value;
        let columnIndex = this.columnIndices[columnValue];
        let filterType = filterNode.value;
        let inputText = inputNode.value;
        return this.filterData(data, columnIndex, filterType, inputText);
    }

    applyFilters(data){
        for (let k of Object.keys(this.filters)){
            let filter = this.filters[k];
            if (filter === null){
                continue;
            }
            let selectColumnNode = filter[0];
            let filterNode = filter[1];
            let inputNode = filter[2];
            data = this.applyFilter(data, selectColumnNode, filterNode, inputNode);
        }
        return data;
    }
}


/*
graph CONTROL
*/
class FlatGraphControl extends Control{
    constructor(graph, data = null, validate=true){
        super(graph, data);
        if (validate){
            this.validate(graph, data);
        }
        this.graph = this.view;
    }

    setViewData(data=this.data, labelCol=this.view.labelCol, dataCol=this.view.dataCol){
        this.view.setData(data, labelCol, dataCol);
    }
}


class BarControl extends FlatGraphControl {
    constructor(graph, data = null, barsToDisplay = 12, validate=true) {
        super(graph, data, validate);
        this.barsToDisplay = barsToDisplay;
    }

    validate(graph, data){
        if (!graph instanceof BarGraph){
            throw Error('BarControl.validate: view needs to be an instance of class BarGraph');
        } else if (data!== null && !data instanceof TabularData){
            throw Error('BarControl.validate: data needs to be an instance of class TabularData');
        }
    }

    updateData(data=this.getChainData(), validate=true){
        data.sortByCol(this.graph.dataCol, true);
        data = data.slice(1, this.barsToDisplay+1);
        return data;
    }
}


class PieControl extends FlatGraphControl {
    constructor(graph, data = null, piesToDisplay = 10,  validate=true) {
        super(graph, data, validate);
        this.piesToDisplay = piesToDisplay;
    }

    validate(graph, data){
        if (!graph instanceof PieGraph){
            throw Error('PieControl.validate: view needs to be an instance of class PieGraph');
        } else if (data!== null && !data instanceof TabularData){
            throw Error('BarControl.validate: data needs to be an instance of class TabularData');
        }
    }

    updateData(data=this.getChainData(), validate=true){
        data.sortByCol(this.graph.dataCol, true);
        data = data.slice(1, data.length);
        let ySum = sum(data.getColumn(this.graph.dataCol));
        data = data.slice(0, this.piesToDisplay-1);
        let otherSum = ySum - sum(data.getColumn(this.graph.dataCol));
        
        let newRow = new Array(data.ncol);
        newRow[this.graph.labelCol] = '其余';
        newRow[this.graph.dataCol] = otherSum;
        data.addRow(newRow);

        data.sortByCol(this.graph.dataCol, true);
        return data;
    }
}


class TimeSeriesSelection extends Control {
    constructor(view, data, table, clearOnClick=false, validate=true){
        super(view, data, validate);
        this.validate(view, data, table);
        this.graph = view;
        this.table = table;
        this.clearOnClick = clearOnClick;
    }

    validate(view, data, table){
        if (!view instanceof LineGraph){
            throw Error('TimeSeriesControl.validate: view needs to be an instance of class LineGraph');
        } else if (data!== null && !data instanceof TimeSeriesData){
            throw Error('TimeSeriesControl.validate: data needs to be an instance of class TimeSeriesData');
        } else if (!table instanceof TabularData){
            throw Error('TimeSeriesControl.validate: table needs to be an instance of class TabularData');
        }
    }

    setControllerData(data){
        this.data = data;
        this.countriesClicked = {};
        if (data !== null){
            for (let key of data.countries){
                this.countriesClicked[key] = false;
            }
        }
    }

    updateData(data=this.getChainData()){
        let countries = [];
        for (let key of Object.keys(this.countriesClicked)){
            if (this.countriesClicked[key]){
                countries.push(key);
            }
        }
        data = data.filterBySeries(countries);
        return data;
    }

    setTableRowFunc(){
        let control = this;
        this.table.setRowFunc(function(rowNode, rowData) {
            let country = rowData[0];
            if (control.countriesClicked[country]){
                rowNode.setAttribute('class', 'region-button-clicked');
            } else {
                rowNode.setAttribute('class', 'region-button');
            }
        
            rowNode.onclick = function() {
                let country = this.childNodes[0].innerHTML;
                if (control.clearOnClick) {
                    for (let key of Object.keys(control.countriesClicked)) {
                        control.countriesClicked[key] = false;
                        for (let row of control.table.entryRows){
                            row.setAttribute('class', 'region-button');
                        }
                    }
                }

                if (control.countriesClicked[country]){
                    this.setAttribute('class', 'region-button');
                    control.countriesClicked[country] = false;
                } else {
                    this.setAttribute('class', 'region-button-clicked');
                    control.countriesClicked[country] = true;
                }

                control.updateAndDisplay();
            }
        })
    }

    refillTable() {
        this.table.refillEntryRows();
    }
    
    clearSelection() {
        for (let key of Object.keys(this.countriesClicked)) {
            this.countriesClicked[key] = false;
        }
        this.refillTable();
        this.updateAndDisplay();
    }
}


class TimeSeriesSmoothing extends Control {
    constructor(view, data, divNode, id='', labelUnit = '天', smoothingOptions = [3,7,15]){
        super(view, data);
        this.validate(view, data)
        this.divNode = divNode;
        this.smoothingOptions = smoothingOptions;
        this.smoothing = 1;
        this.id = id;
        this.labelUnit = labelUnit;
    }

    validate(view, data){
        if (!view instanceof LineGraph){
            throw Error('TimeSeriesSmoothingControl.validate: view needs to be an instance of class LineGraph');
        } else if (data!== null && !data instanceof TimeSeriesData){
            throw Error('TimeSeriesSmoothingControl.validate: data needs to be an instance of class TimeSeriesData');
        } 
    }

    updateData(data = this.getChainData(), validate=false){
        return data.smoothSeries(this.smoothing);
    }

    addRadios(){
        let control = this;
        let inputName = this.id + 'time-series-smoothing';
        let inputID = this.id + 'time-series-smoothing-no';

        let inputNode = document.createElement('input');
        inputNode.setAttribute('type', 'radio');
        inputNode.setAttribute('name', inputName);
        inputNode.setAttribute('id', inputID);
        inputNode.setAttribute('value', 1);
        inputNode.setAttribute('checked', true);
        let labelNode = document.createElement('label');
        labelNode.setAttribute('for', inputID);
        labelNode.appendChild(document.createTextNode('无'));

        this.divNode.appendChild(inputNode);
        this.divNode.appendChild(labelNode);

        inputNode.onclick = function(){
            control.smoothing = 1;
            control.updateAndDisplay();
        }

        for (let s of this.smoothingOptions){
            let inputID = this.id + 'time-series-smoothing-' + s;

            let inputNode = document.createElement('input');
            inputNode.setAttribute('type', 'radio');
            inputNode.setAttribute('name', inputName);
            inputNode.setAttribute('id', inputID)
            inputNode.setAttribute('value', s);
            let labelNode = document.createElement('label');
            labelNode.setAttribute('for', inputID);
            labelNode.appendChild(document.createTextNode(s+this.labelUnit));

            this.divNode.appendChild(inputNode);
            this.divNode.appendChild(labelNode);

            inputNode.onclick = function(){
                control.smoothing = s;
                control.updateAndDisplay();
            }
        }
    }
}


class TimeSeriesLogScale extends Control {
    constructor(view, checkBoxNode){
        super(view, null);
        this.checkBoxNode = checkBoxNode;
        this.graph = view;
    }

    setEventListener(){
        let control = this;
        this.checkBoxNode.onclick = function() {
            if (this.checked){
                control.graph.setLayout({yaxis: {type:'log'}});
            } else {
                control.graph.setLayout({yaxis: {type:'linear'}});
            }
            control.graph.display();
        }
    }
}


class TimeSeriesCombinedControl extends Control {
    constructor(graph, graphData, tableData, parentNode, name, ){
        super(graph, graphData);
        this.graph = graph;
        this.graphData = graphData;
        this.tableData = tableData;
        this.parentNode = parentNode;
        this.name = name;
        this.chain = new ControlsChain([], graphData);
    }

    makeLogControl(text) {
        let checkboxID = this.name+'-log';
        let checkboxNode = document.createElement('input');
        checkboxNode.setAttribute('type', 'checkbox');
        checkboxNode.setAttribute('id', checkboxID);
        checkboxNode.setAttribute('name', checkboxID);
        let labelNode = document.createElement('label');
        labelNode.setAttribute('for', checkboxID);
        labelNode.innerHTML = text;

        this.parentNode.appendChild(checkboxNode);
        this.parentNode.appendChild(labelNode);

        let logControl = new TimeSeriesLogScale(this.view, checkboxNode);
        this.logControl = logControl;
        logControl.setEventListener();
    }

    makeSmoothingControl(smoothingText) {
        let divNode = document.createElement('div');
        divNode.appendChild(document.createTextNode(smoothingText))
        divNode.setAttribute('id', this.name + '-smoothing');
        this.parentNode.appendChild(divNode);

        let smoothingControl = new TimeSeriesSmoothing(this.graph, null, divNode, this.name);
        this.smoothingControl = smoothingControl;
        this.chain.addToChain(smoothingControl);
        smoothingControl.addRadios();
    }

    makeTable(divClass, clearButtonText, clearOnClick=false, defaultSelected = ['全球']) {
        let divNode = document.createElement('div');
        divNode.setAttribute('class', divClass);

        let tableID = this.name+'-table';
        let tableNode = document.createElement('table');
        tableNode.setAttribute('id', tableID);
        divNode.appendChild(tableNode);

        let table = new TypedTable(tableID, false, this.tableData, tableNode);
        this.table = table;
        let headerControl = new SortableTableHeader(table);
        headerControl.setHeaderEventListeners();

        this.makeTableFilter(table);
        this.parentNode.appendChild(divNode);

        let graphSelection = this.makeGraphSelection(table, clearOnClick, defaultSelected);
        this.makeClearButton(graphSelection, clearButtonText);
    }

    makeTableFilter(table){
        let tableFilter = new TableFilter(table, this.parentNode, 'table-control');
        tableFilter.makeControlArea(false);
        this.tableFilter = tableFilter;
    }

    makeGraphSelection(table, clearOnClick, defaultSelected) {
        let timeSeriesSelection = new TimeSeriesSelection(this.graph, null, table, clearOnClick);
        this.chain.addToChain(timeSeriesSelection);
        timeSeriesSelection.setTableRowFunc();
        for (let country of defaultSelected){
            timeSeriesSelection.countriesClicked[country] = true;
        }
        timeSeriesSelection.refillTable();
        this.timeSeriesSelection = timeSeriesSelection;
        return timeSeriesSelection
    }

    makeClearButton(graphSelection, clearButtonText) {
        let clearButton = document.createElement('button');
        clearButton.innerHTML = clearButtonText;
        clearButton.onclick = function() {
            graphSelection.clearSelection();
        }
        this.parentNode.appendChild(clearButton);
    }

    updateAndDisplay() {
        this.timeSeriesSelection.updateAndDisplay();
    }
}