/*************** 
Helper Functions
****************/

const color1 = "#0B2545";
const color2 = "#13315C";
const color3 = "#134074";
const color4 = "#8DA9C4";
const color5 = "#EEf4ED";


function copyObj(obj){
    let newObj = {};
    for (name of Object.keys(obj)){
        newObj[name] = obj[name];
    }
    return newObj;
}


function isSubStr(str, substr){
    return String(str).indexOf(String(substr)) !== -1;
}


function floatToPerct(n) {
    return (n*100).toFixed(2) + '%';
}


function PerctToFloat(n) {
    return Number(n.slice(0, -1)) / 100;
}


function getDataType(n){
    if (typeof n === 'string' && getLastItem(n) === '%'){
        return 'percent';
    } else if (typeof n === 'string' && !isNaN(n)){
        return 'string-number';
    }
     else {
        return typeof n;
    }
}


function getLastItem(array){
    return array[array.length - 1];
}


function getLatestDate(data) {
    return getLastItem(data['date']);
}


function addTextToElement(element, text) {
    let textNode = document.createTextNode(text);
    element.appendChild(textNode);
}


function getRandColor() {
    return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
}


function getNode(nodeID){
    return document.getElementById(nodeID);
}


function selectColor(number) {
    let r = (number + 13) * 59 % 255;
    let g = (number + 7) * 73 % 255;
    let b = (number + 11) * 67 % 255;
    return {r: r, g: g, b: b};
}


function getColorsDict(names){
    let i = 0;
    let colors = {};
    for (let name of names){
        colors[name] = selectColor(i);
        i += 17;
    }
    return colors;
}


function getRate(data, population, unit=1000000) {
    rates = {}
    for (let key of Object.keys(data)){
        if (key in population) {
            rate = (data[key] / population[key] * unit).toFixed(2);
            rates[key] = rate;
        }
    }
    return rates;
}


/*************** 
Array Functions
****************/

function arrayEqual(a1, a2){
    // requires a1 and a2 to be 1-dimensional
    if (a1.length !== a2.length){
        return false;
    }
    for (let i=0; i<a1.length; i++){
        if (a1[i] !== a2[i]){
            return false;
        }
    }
    return true;
}


function objToArray(obj){
    let array = [];
    for (let key of Object.keys(obj)){
        if (obj[key].hasOwnProperty('length')){
            array.push([key].concat(obj[key]));
        } else {
            array.push([key, obj[key]]);
        }
    }
    return array;
}


function sum(array) {
    return array.reduce((a, b) => a + b);
}


function sliceByIndices(array, indices){
    let ret = [];
    for (let i of indices){
        ret.push(array[i]);
    }
    return ret;
}


function smoothSeries(series, window) {
    let halfWindow = Math.floor((window) / 2);
    let smooths = [];
    for (let i = 0; i < series.length; i++) {
        let leftIndex = Math.max(0, i - halfWindow);
        let rightIndex = Math.min(series.length, i + halfWindow + 1);
        if (rightIndex - leftIndex < window) {
            if (leftIndex === 0){
                rightIndex += window - (rightIndex - leftIndex);
            } else {
                leftIndex -= window - (rightIndex - leftIndex);
            }
        }
        let smoothed = sum(series.slice(leftIndex, rightIndex)) / (rightIndex - leftIndex);
        smooths.push(Math.floor(smoothed));
    }
    return smooths;
}


function smoothData(data, window) {
    let newData = {};
    newData['latest'] = {};
    newData['date'] = data['date'];
    newData['population'] = data['population'];
    for (let key of Object.keys(data)) {
        if (key !== 'latest' && key !== 'date' && key !== 'population'){
            let country = key;
            let countryData = {'latest': {}};
            for (let key2 of Object.keys(data[country])) {
                if (key2 !== 'latest') {
                    countryData[key2] = smoothSeries(data[country][key2], window);
                    countryData['latest'][key2] = getLastItem(countryData[key2]);
                }
            }
            newData[country] = countryData;
            newData['latest'][country] = getLastItem(countryData['total'])
        }
    }
    return newData;
}


function getKeysIntersection(objs){
    let intersection = [];
    if (!objs.length){
        return intersection;
    }
    for (let key of Object.keys(objs[0])){
        let common = true;
        for (let obj of objs){
            if (!key in obj){
                common = false;
                break;
            }
        }
        if (common){
            intersection.push(key);
        }
    }
    return intersection;
}


function cmpNumber(a, b){
    return a-b;
}


function cmpStr(a, b){
    if (!isNaN(Number(a)) && !isNaN(Number(b))){
        return cmpNumber(Number(a), Number(b));
    }
    
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a < b) {
        return -1;
    } else if (a === b) {
        return 0;
    } else {
        return 1;
    }
}


function cmpPerct(a, b){
    return cmpNumber(PerctToFloat(a), PerctToFloat(b));
}
