class Data {
    constructor(data, validate = true){
        if (validate){
            this.validate(data);
        }
    }

    validate(data){
        return true;
    }
}


/*
TABULAR DATA
*/
class TabularData extends Data{
    // data is a 2D array ([row1, row2, ...])
    constructor(rows, headerNames){
        super(rows);
        this.rows = rows;
        this.headerNames = headerNames;
    }

    validate(rows, typed = false) {
        if (rows === null || rows.length === 0){
            return true;
        }
        
        const firstRowLength = rows[0].length;
        const firstRowTypes = rows[0].map(n => getDataType(n));
        for (let row of rows){
            if (row.length !== firstRowLength){
                throw Error('TabularData: rows is not 2-dimensional with fixed shape');
            }
            if (typed){
                let rowTypes = row.map(n => getDataType(n));
                if (!arrayEqual(firstRowTypes, rowTypes)){
                    throw Error('TabularData: some column does not have fixed data type.');
                }
            }
        }
        return true;
    }

    copy() {
        return new TabularData([...this.rows], this.headerNames, false);
    }

    get ncol() {
        if (this.rows.length > 0){
            return this.rows[0].length;
        }
        return 0;
    }

    get length() {
        return this.rows.length;
    }
    
    get dataTypes() {
        let dataTypes = [];
        if (this.rows !== null){
            dataTypes = this.rows[0].map(n => getDataType(n));
        }
        return dataTypes;
    }

    getColumn(col){
        return this.rows.map(row => row[col]);
    }

    getColumns(cols){
        let newData = this.rows.map(row => sliceByIndices(row, cols));
        return new TabularData(newData, sliceByIndices(this.headerNames, cols), false);
    }

    slice(lindex, rindex){
        let newData = this.rows.slice(lindex, rindex);
        return new TabularData(newData, this.headerNames, false);
    }

    addRow(row, inplace=true){
        if (!inplace){   
            return new TabularData([...this.rows].concat(row), this.headerNames, false);
        } else {
            this.rows.push(row);
        }
    }
}


class TypedTabularData extends TabularData{
    constructor(rows, headerNames){
        super(rows, headerNames);
    }
    
    validate(rows){
        return super.validate(rows, true);
    }

    copy() {
        return new TypedTabularData([...this.rows], this.headerNames, false);
    }

    getColumns(cols){
        let newData = this.rows.map(row => sliceByIndices(row, cols));
        return new TypedTabularData(newData, sliceByIndices(this.headerNames, cols), false);
    }

    slice(lindex, rindex){
        let newData = this.rows.slice(lindex, rindex);
        return new TypedTabularData(newData, this.headerNames, false);
    }

    addRow(row, inplace=true){
        if (!inplace){   
            return new TypedTabularData([...this.rows].concat(row), this.headerNames, false);
        } else {
            this.rows.push(row);
        }
    }

    reverse() {
        this.rows.reverse();
    }

    sortByCol(col, reverse=false, inplace=true){
        if (col < 0){
            return null;
        }

        let rows = [...this.rows];
        let dataType = this.dataTypes[col];
        
        if (dataType === 'number'){
            rows.sort((a, b) => cmpNumber(a[col], b[col]));
        } else if (dataType === 'string' || dataType === 'string-number'){
            rows.sort((a, b) => cmpStr(a[col], b[col]));
        } else if (dataType === 'percent'){
            rows.sort((a, b) => cmpPerct(a[col], b[col]));
        } else {
            throw Error('TypedTabularData.sortByCol: unknown data type');
        }

        if (reverse){
            rows.reverse();
        }

        if (inplace){
            this.rows = rows;
        } else {
            return new TypedTabularData(rows, this.headerNames, false);
        }
    }

    filterByStr(col, str){
        let rows = this.rows.filter(array => isSubStr(String(array[col]).toLowerCase(), str));
        return new TypedTabularData(rows, this.headerNames, false);
    }

    filterByMin(col, min){
        if (this.dataTypes[col] === 'percent') {
            return this.filterByPerctMin(col, min);
        } else {
            let rows = this.rows.filter(array => array[col] >= Number(min));
            return new TypedTabularData(rows, this.headerNames, false);
        }
    }

    filterByMax(col, max){
        if (this.dataTypes[col] === 'percent') {
            return this.filterByPerctMax(col, max);
        } else {
            let rows = this.rows.filter(array => array[col] <= Number(max));
            return new TypedTabularData(rows, this.headerNames);
        }
    }

    filterByPerctMin(col, min){
        min = Number(min) / 100;
        let rows = this.rows.filter(array => PerctToFloat(array[col]) >= min);
        return new TypedTabularData(rows, this.headerNames);
    }

    filterByPerctMax(col, max){
        max = Number(max) / 100;
        let rows = this.rows.filter(array => PerctToFloat(array[col]) <= max);
        return new TypedTabularData(rows, this.headerNames);
    }
}


/*
TIME SERIES DATA
*/
class TimeSeriesData extends Data {
    constructor(data, validate=true){
        super(data, validate);
        this.setData(data, false);
    }

    get seriesNames() {
        return Object.keys(this.series);
    }

    static validateProcessedDict(data){
        if (data === null){
            return true;
        }
        if (!data instanceof Object){
            throw Error('TimeSeriesData.validate: data needs to be an object');
        } 
        if (! 'date' in Object.keys(data)){
            throw Error('TimeSeriesData.validate: key "date" is not found in object');
        }
        for (let key of Object.keys(data)){
            if (key === 'latest' || key === 'rate'){
                continue;
            }
            let arr = data[key];
            if (key !== 'date') {
                arr = data[key]['total'];
            }
            
            if (!(arr.hasOwnProperty('length')) && (arr instanceof Object)) {
                throw Error('TimeSeriesData.validate: data[' + key + '] needs to be an array');
            }
        }
    }

    static fromProcessedDict(data, validate=true){
        if (validate){
            this.validateProcessedDict(data);
        }
        let newData = {};
        newData['date'] = data['date'];
        for (let key of Object.keys(data)){
            if (key === 'date' || key === 'latest' || key === 'rate'){
                continue;
            }
            let countryTotal = data[key]['total'];
            newData[key] = countryTotal;
        }
        return new TimeSeriesData(newData, true);
    }

    copy() {
        let newData = {'date': this.dates};
        for (let key of Object.keys(this.series)){
            newData[key] = this.series[key];
        }
        return new TimeSeriesData(newData, true);
    }

    validate(data) {
        if (data === null){
            return true;
        }
        if (!data instanceof Object){
            throw Error('TimeSeriesData.validate: data needs to be an object');
        } 
        if (! 'date' in Object.keys(data)){
            throw Error('TimeSeriesData.validate: key "date" is not found in object');
        }
        for (let key of Object.keys(data)){
            if (key === 'latest' || key === 'rate'){
                continue;
            }
            let arr = data[key];
            if (!(arr.hasOwnProperty('length')) && (arr instanceof Object)) {
                throw Error('TimeSeriesData.validate: data[' + key + '] needs to be an array');
            }
        }
    }

    setData(data, validate=true){
        if (validate){
            this.validate(data);
        }
        this.series = {};
        this.countries = [];
        this.dates = data['date'];
        for (let key of Object.keys(data)){
            if (key === 'date' || key === 'latest' || key === 'rate'){
                continue;
            }
            let country = key;
            this.countries.push(country);
            this.series[country] = data[country];
        }
    }

    filterBySeries(series){
        let newData = {};
        newData['date'] = this.dates;
        for (let country of series){
            newData[country] = this.series[country];
        }
        return new TimeSeriesData(newData, false);
    }

    smoothSeries(smoothing){
        let newData = {};
        newData['date'] = this.dates;
        for (let country of Object.keys(this.series)){
            newData[country] = smoothSeries(this.series[country], smoothing);
        }
        return new TimeSeriesData(newData, false);
    }
}


class MultiTimeSeriesData extends TimeSeriesData {
    constructor(data, validate=true) {
        super(data, validate);
        if (data !== null){
            this.setData(data);
        }
    }

    static fromProcessedDict(dataArray, dataNames, validate=true){
        let data = {};
        for (let i=0; i<dataNames.length; i++){
            data[dataNames[i]] = TimeSeriesData.fromProcessedDict(dataArray[i]);
        }
        return new MultiTimeSeriesData(data);
    }

    validate(data){
        for (let key of Object.keys(data)){
            if (!data[key] instanceof TimeSeriesData) {
                throw Error('MultiTimeSeriesData.validate: data must be a dictionary of TimeSeriesData');
            }
        }
    }

    copy() {
        let newData = {};
        for (let key of Object.keys(this.data)){
            newData[key] = this.data[key].copy();
        }
        return new MultiTimeSeriesData(newData, true);
    }

    setData(data, validate=true){
        if (validate){
            this.validate(data);
        }
        this.data = data;
        this.dates = data[Object.keys(data)[0]].dates;
        this.countries = data[Object.keys(data)[0]].countries;
    }

    filterBySeries(series){
        let newData = {};
        for (let key of Object.keys(this.data)){
            newData[key] = this.data[key].filterBySeries(series);
        }
        return new MultiTimeSeriesData(newData, false);
    }

    smoothSeries(smoothing){
        let newData = {};
        for (let key of Object.keys(this.data)){
            newData[key] = this.data[key].smoothSeries(smoothing);
        }
        return new MultiTimeSeriesData(newData, false);
    }
}