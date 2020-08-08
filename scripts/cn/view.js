class View {
    constructor(viewID, data = null) {
        this.viewID = viewID;
        this.viewNode = getNode(viewID);
    }
}


/*
TABLE
*/
class Table extends View {
    constructor(tableID, addIndex = false, data = null, tableNode = null) {
        super(tableID, data);
        this.setData(data);
        this.tableNode = this.viewNode;
        if (this.tableNode === null) {
            this.tableNode = tableNode;
        }

        // initialize variables for keeping track of row index
        this.addIndex = addIndex;
        this.rowIndex = 1;

        this.rowFunc = ((rowNode, rowData) => null);
        this.cellFunc = ((cellNode, cellData) => null);
    }

    get ncol() {
        if (this.data) {
            return this.data.ncol;
        }
        return 0;
    }

    get headerRow() {
        for (let child of this.tableNode.childNodes) {
            if (child.nodeName === 'TR') {
                if (child.childNodes[0].nodeName === 'TH') {
                    return child;
                }
            }
        }
        return null;
    }

    get entryRows() {
        let rows = [];
        for (let child of this.tableNode.childNodes) {
            if (child.nodeName === 'TR') {
                if (child.childNodes[0].nodeName === 'TD') {
                    rows.push(child);
                }
            }
        }
        return rows;
    }

    setData(data) {
        this.validate(data);
        this.data = data;
        this.headerNames = [...data.headerNames];
        if (this.addIndex){
            this.headerNames.unshift('#');
        }
    }

    validate(data) {
        if (data !== null && !data instanceof TabularData) {
            throw Error('Table.validate: data is not a TabularData object');
        }
        return true;
    }

    setRowFunc(func) {
        this.rowFunc = func;
    }

    setCellFunc(func) {
        this.cellFunc = func;
    }

    addHeaders() {
        if (this.addIndex) {
            this.addRow(['#'].concat(this.data.headerNames), 'th', false);
        } else {
            this.addRow(this.data.headerNames, 'th', false);
        }
    }

    removeHeaders() {
        this.headerRow.remove();
    }

    addRow(array, cellType = 'td', addIndex = this.addIndex) {
        let rowNode = document.createElement('tr');
        let arrayCopy = [...array];
        if (addIndex) {
            arrayCopy.unshift(this.rowIndex);
            this.rowIndex += 1;
        }
        for (let a of arrayCopy) {
            let cellNode = document.createElement(cellType);
            cellNode.appendChild(document.createTextNode(a));
            this.cellFunc(cellNode, a);
            rowNode.appendChild(cellNode);

            if (getDataType(a) === 'string') {
                cellNode.style = 'text-align: center';
            } else {
                cellNode.style = 'text-align: right';
            }
            if (a === '全球'){
                rowNode.style = 'font-style: italic; font-weight: bold;';
            }
        }
        this.rowFunc(rowNode, arrayCopy);
        this.tableNode.appendChild(rowNode);
    }

    removeEntryRows() {
        let rows = this.entryRows;
        for (let row of rows) {
            row.remove();
        }
        this.rowIndex = 1;
    }

    refillEntryRows() {
        this.removeEntryRows();
        for (let row of this.data.rows) {
            this.addRow(row);
        }
    }

    clearTable() {
        this.removeHeaders();
        this.removeEntryRows();
    }

    refillTable(data = null, addIndex = this.addIndex) {
        this.addIndex = addIndex;
        if (data !== null) {
            this.setData(data);
        }
        this.clearTable();
        this.addHeaders();
        this.refillEntryRows();
    }
}


class TypedTable extends Table {
    constructor(tableID, addIndex, data, tableNode) {
        super(tableID, addIndex, data, tableNode);
    }

    get dataTypes() {
        if (this.data) {
            return this.data.dataTypes;
        }
        return [];
    }
}


/*
GRAPH
*/
class Graph extends View {
    constructor(graphID, data = null) {
        super(graphID, data);
        this.graphID = graphID;
        this.graphNode = this.viewNode;
    }
}


class PlotlyGraph extends Graph {
    constructor(graphID, data = null) {
        super(graphID, data);
        this.layout = this.defaultLayout();
    }

    setLayout(layout) {
        for (let key of Object.keys(layout)) {
            this.layout[key] = layout[key];
        }
    }

    defaultLayout() {
        return {
            font: { color: color1 }
        }
    }
}


class FlatGraph extends PlotlyGraph {
    // FlatGraph accepts TabularData with at least 2 columns
    // The data column (dataCol) needs to have type Number
    constructor(graphID, data = null, labelCol = null, dataCol = null) {
        super(graphID, data);
        this.setData(data, labelCol, dataCol);
        this.xname = null;
        this.yname = null;
    }

    validate(data) {
        if (data === null) {
            return true;
        } else if (!data instanceof TabularData) {
            throw Error('BarGraph.validate: data needs to be an instance of TabularData')
        } else if (data.ncol < 2) {
            throw Error('BraGraph.validate: data needs at least 2 columns');
        }
    }

    setColumns(labelCol, dataCol) {
        if (this.data === null) {
            if (labelCol !== null || dataCol !== null) {
                throw Error('BarGraph.setColumns: cannot to set columns on null data');
            }
        } else if (labelCol >= this.data.ncol) {
            throw Error('BarGraph.setColumns: labelCol > number of columns of data');
        } else if (dataCol >= this.data.ncol) {
            throw Error('BarGraph.setColumns: dataCol > number of columns of data');
        } else if (this.data.dataTypes[dataCol] !== 'number') {
            throw Error('BarGraph.setColumn: data in dataCol needs to be type number');
        }

        this.labelCol = labelCol;
        this.dataCol = dataCol;
        this.graphData = this.getGraphData();
    }

    setData(data, labelCol, dataCol) {
        this.data = data;
        this.labelCol = labelCol;
        this.dataCol = dataCol;
        this.graphData = this.getGraphData();
    }

    getGraphData(data = this.data, labelCol = this.labelCol, dataCol = this.dataCol) {
        let graphData = {};
        if (data !== null) {
            graphData[this.xname] = data.getColumn(labelCol);
            graphData[this.yname] = data.getColumn(dataCol);
        }
        return graphData;
    }

    display() {
        Plotly.newPlot(this.graphID, [this.graphData], this.layout);
    }
}


class BarGraph extends FlatGraph {
    constructor(graphID, data = null, labelCol = null, dataCol = null) {
        super(graphID, data, labelCol, dataCol);
        this.xname = 'x';
        this.yname = 'y';
    }

    defaultLayout() {
        let layout = super.defaultLayout();
        layout['marker'] = { color: color3 };
        return layout;
    }

    getGraphData() {
        let data = super.getGraphData();
        data['type'] = 'bar';
        return data;
    }
}


class PieGraph extends FlatGraph {
    constructor(graphID, data = null, labelCol = null, dataCol = null) {
        super(graphID, data, labelCol, dataCol);
        this.xname = 'labels';
        this.yname = 'values';
    }

    getGraphData() {
        let data = super.getGraphData();
        data['type'] = 'pie';
        data['textinfo'] = "label+percent";
        data['insidetextorientation'] = 'horizontal';
        return data;
    }
}


class LineGraph extends PlotlyGraph {
    constructor(graphID, data, mode = 'lines', colors = {}) {
        super(graphID, data);
        this.setData(data, mode, colors);
        this.config = this.defaultConfig();
    }

    setData(data, mode = this.mode, colors = this.colors) {
        this.data = data;
        this.mode = mode;
        this.colors = colors;
    }

    defaultConfig() {
        return {
            scrollZoom: true,
            responsive: true
        }
    }

    defaultLayout() {
        let layout = super.defaultLayout();
        layout['hovermode'] = 'closest';
        layout['yaxis'] = {
            autorange: true,
            type: 'linear'
        }
        layout['xaxis'] = {
            rangeselector: {
                buttons: [
                    {
                        count: 1,
                        label: '1个月',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {
                        count: 3,
                        label: '3个月',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {
                        count: 6,
                        label: '6个月',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    { step: 'all' }
                ]
            }
        }
        return layout;
    }

    display() {
        let traces = [];
        for (let name of this.data.seriesNames) {
            traces.push(this.makeTrace(name));
        }
        Plotly.newPlot(this.graphID, traces, this.layout, this.config);
    }

    getColor(name) {
        if (name in this.colors) {
            return this.colors[name];
        } else {
            let color = getRandColor();
            this.colors[name] = color;
            return color;
        }
    }

    makeTrace(name) {
        return {
            x: this.data.dates,
            y: this.data.series[name],
            mode: this.mode,
            marker: {
                color: this.getColor(name),
                size: 5
            },
            name: name
        }
    }
}


class MultipleAxesLineGrpah extends LineGraph {
    constructor(graphID, data, axes, mode = 'lines', colors = {}) {
        super(graphID, data, mode, colors);

        this.axes = axes;
        this.defaultColors = ['blue','red','green'];
    }

    getColor(dataName){
        let i = 0;
        for (let key of Object.keys(this.data.data)) {
            if (key === dataName){
                return this.defaultColors[i];
            } else {
                i += 1;
            }
        }
        return super.getColor(dataName);
    }

    makeTrace(dataName, countryName) {
        let trace = {
            x: this.data.dates,
            y: this.data.data[dataName].series[countryName],
            mode: this.mode,
            marker: {
                color: this.getColor(dataName),
                size: 5
            },
            name: dataName
        }
        if (dataName in this.axes){
            trace['yaxis'] = this.axes[dataName];
        }
        return trace;
    }

    defaultLayout() {
        let layout = super.defaultLayout();
        layout['yaxis2'] = {
            overlaying: 'y',
            side: 'right'
        };
        return layout;
    }

    display() {
        let traces = [];
        for (let dataName of Object.keys(this.data.data)) {
            for (let countryName of this.data.countries){
                traces.push(this.makeTrace(dataName, countryName));
            }
        }
        Plotly.newPlot(this.graphID, traces, this.layout, this.config);
    }
}