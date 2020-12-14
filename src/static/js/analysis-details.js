/**
 * @file help function for html AnalysisDetails page
 *
 * Copyright (c) 2020 Huawei Technologies Co., Ltd.
 * A-Tune is licensed under the Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *    http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
 * PURPOSE.
 * See the Mulan PSL v2 for more details.
 * Create: 2020-11-05
*/

import echarts from 'echarts';
import axios from 'axios';
import {host, port, engineHost, enginePort} from './utils.js';

export default {
    data() {
        return {
            fileName: '',
            fileWorkLoad: '',
            appName: '',
            avgCPU: 0,
            avgMEM: 0,
            avgNET: 0,
            avgSTR: 0,
            paramData: [],
            paramColumns: [{colName: 'Section', align: 'center', label: 'Section', field: 'Section'},
                {colName: 'Status', align: 'center', label: 'Status', field: 'Status'},
                {colName: 'Key', align: 'center', label: 'Key', field: 'Key'},
                {colName: 'Value', align: 'center', label: 'Value', field: 'Value'},
                {colName: 'Note', align: 'center', label: 'Note', field: 'Note'}],
            paramPagination: {page: 1, rowsPerPage: 10},
            modelDim: [],
            optionDim: [],
            modelCompare: [],
            optionCompare: [],
            fileChartId: [],
            compareChartId: [],
            statisticData: [],
            statisticColumns: [
                {colName: 'Name', align: 'center', label: 'Name', field: 'Name'},
                {colName: 'Round#', align: 'center', label: 'Round#', field: 'Round#'},
                {colName: 'Mean', align: 'center', label: 'Mean', field: 'Mean'},
                {colName: 'Variance', align: 'center', label: 'Variance', field: 'Variance'},
                {colName: 'Standard Division', align: 'center',
                label: 'Standard Division', field: 'Standard Division'}],
            statisticPagination: {page: 1, rowsPerPage: 6},
            detectResData: [],
            detectResColumns: [
                {colName: 'Parameters', align: 'center', label: 'Parameters', field: 'Parameters'},
                {colName: 'Minimum', align: 'center', label: 'Minimum', field: 'Minimum'},
                {colName: 'Maximum', align: 'center', label: 'Maximum', field: 'Maximum'},
                {colName: 'Outlier', align: 'center', label: 'Outlier', field: 'Outlier'}],
            detectResPagination: {page: 1, rowsPerPage: 5},
            verticalDisplay: ['div-CPU', 'div-MEM', 'div-NET', 'div-STORAGE']
        };
    },
    components: { },
    methods: {
        closePopUp() {
            document.getElementById('popup-window').style.display = 'none';
        },

        closeDetectPopUp() {
            document.getElementById('detect-popup-window').style.display = 'none';
        },

        showDetectPopUp() {
            document.getElementById('detect-popup-window').style.display = 'block';
        },

        cleanDetectPopUp() {
            document.getElementById('detect-error-empty').style.display = 'none';
            document.getElementById('detect-error-nonexist').style.display = 'none';
            document.getElementById('detect-error').style.display = 'none';
            document.getElementById('detect-result-form').style.display = 'none';
            this.detectResData.splice();
        },

        onSubmit() {
            for (var el in this.optionDim) {
                var container = document.getElementById('div-' + this.optionDim[el]);
                if (this.modelDim.indexOf(this.optionDim[el]) > -1) {
                    if (this.verticalDisplay.includes('div-' + this.optionDim[el])) {
                        container.style.display = 'grid';
                    } else {
                        container.style.display = 'block';
                    }
                } else {
                    container.style.display = 'none';
                }
            }
            deleteOldData(this.fileChartId, this.compareChartId);
            this.compareChartId.splice();
            var count = 1;
            for (var file in this.modelCompare) {
                this.addCompareFileInfo(this.modelCompare[file], 0, count);
                count++;
            }
        },

        onSubmitDetect() {
            this.cleanDetectPopUp();
            if (this.appName === undefined || this.appName === '') {
                document.getElementById('detect-btn').disabled = false;
                document.getElementById('detect-error-empty').style.display = 'block';
            } else {
                document.getElementById('detect-btn').disabled = true;
                const path = `http://${engineHost}:${enginePort}/v1/detecting`;
                var params = {appname: this.appName, detectpath: this.fileName};
                axios.get(path, {params: params}, {'Access-Control-Allow-Origin': '*'}).then((res) => {
                    document.getElementById('detect-btn').disabled = false;
                    if (res.data.length === 0) {
                        document.getElementById('detect-error-nonexist').style.display = 'block';
                        return;
                    }
                    document.getElementById('detect-result-form').style.display = 'block';
                    var container = document.getElementById('detect-result');
                    var lines = res.data.split('@');
                    for (var el in lines) {
                        if (lines[el].length > 0) {
                            var newParam = {};
                            var name = lines[el].split(/ /);
                            newParam['Parameters'] = name[0];
                            var outliner = name[1].split(/<|>/);
                            if (outliner.length >= 2) {
                                newParam['Outlier'] = outliner[0];
                                newParam['Maximum'] = outliner[1].split(',')[0];
                                newParam['Minimum'] = outliner[1].split(',')[1];
                                this.detectResData.push(newParam);
                            }
                        }
                    }
                });
            }
        },

        addCompareFileInfo(file, line, fileNum) {
            const path = `http://${host}:${port}/v1/UI/analysis/compareWith`;
            var params = {name: file, csvLine: line};
            axios.get(path, {params: params}, {'Access-Control-Allow-Origin': '*'}).then((res) => {
                if (typeof(res.data) === 'string') {
                    res.data = JSON.parse(res.data);
                }
                if (res.data.isExist === false) {
                    this.optionCompare.splice(this.optionCompare.indexOf(file), 1);
                    if (this.modelCompare.indexOf(file) > -1) {
                        this.modelCompare.splice(this.modelCompare.indexOf(file), 1);
                    }
                } else {
                    if (line === 0) {
                        for (var el in res.data.table_header) {
                            if (document.getElementById('chart-' + res.data.table_header[el]) === null) {
                                var divId = res.data.table_header[el].split('.')[0];
                                if (document.getElementById('div-' + divId) === null) {
                                    var container = document.getElementById('analysis-chart');
                                    this.createDiv(container, divId, null, null);
                                    this.compareChartId.push(divId);
                                }
                                initialParamChart('div-' + divId, res.data.table_header[el],
                                    file, this.verticalDisplay);
                                this.compareChartId.push('chart-' + res.data.table_header[el]);
                            } else {
                                addSeriesForChart('chart-' + res.data.table_header[el], file);
                            }
                        }
                    }
                    updateParamChart(res.data.table_header, res.data.csv_data, fileNum, file);
                    if (res.data.hasNext) {
                        this.addCompareFileInfo(file, res.data.nextCsv, fileNum);
                    }
                }
            });
        },

        initialDetailInfo(file, csvLine, logLine) {
            const path = `http://${host}:${port}/v1/UI/analysis/getAnalysisData`;
            var params = {name: file, csvLine: csvLine, logLine: logLine};
            axios.get(path, {params: params}, {'Access-Control-Allow-Origin': '*'}).then((res) => {
                if (typeof(res.data) === 'string') {
                    res.data = JSON.parse(res.data);
                }
                if (!res.data.isExist) {
                    this.$q.notify('Data has been deleted');
                    this.$router.push({
                        path: '/analysis',
                        name: 'Analysis',
                    });
                    return;
                }
                if (csvLine === 0) {
                    this.initialChart(res.data.table_header, this.fileName);
                }
                if (res.data.workload !== undefined) {
                    document.getElementById('workload-type').style.display = 'block';
                    this.fileWorkLoad = res.data.workload;
                }
                if (res.data.csv_data.length > 0) {
                    updateParamChart(res.data.table_header, res.data.csv_data, 0, this.fileName);
                    this.avgCPU = parseFloat(getAvgById('chart-CPU.STAT.util').toFixed(3));
                    this.avgMEM = parseFloat(getAvgById('chart-MEM.BANDWIDTH.Total_Util').toFixed(3));
                    this.avgNET = parseFloat(getAvgById('chart-NET.STAT.ifutil').toFixed(3));
                    this.avgSTR = parseFloat(getAvgById('chart-STORAGE.STAT.util').toFixed(3));
                }
                if (res.data.nextLog !== 0) {
                    document.getElementById('analysis-param-form').style.display = 'block';
                    for (var m = 0; m < res.data.log_data.length; m++) {
                        var newParam = {Section: res.data.log_data[m][0], Status: res.data.log_data[m][1]};
                        newParam[this.paramColumns[0].colName] = res.data.log_data[m][0];
                        newParam[this.paramColumns[1].colName] = res.data.log_data[m][1];
                        newParam[this.paramColumns[2].colName] = res.data.log_data[m][2];
                        newParam[this.paramColumns[3].colName] = res.data.log_data[m][3];
                        newParam[this.paramColumns[4].colName] = res.data.log_data[m][4];
                        this.paramData.push(newParam);
                    }
                }
                if (res.data.hasNext) {
                    setTimeout(this.initialDetailInfo, res.data.interval, file, res.data.nextCsv, res.data.nextLog);
                }
            });
        },

        createDiv(dim, container, chart, fileName) {
            var div = document.createElement('div');
            div.id = 'div-' + dim;
            container.appendChild(div);
            var br = document.createElement('br');
            br.style.clear = 'both';
            br.style.buttom = '0';
            div.appendChild(br);
            div.appendChild(document.createElement('hr'));
            this.optionDim.push(dim);
            this.modelDim.push(dim);
            if (chart !== null) {
                initialParamChart('div-' + dim, chart, fileName, this.verticalDisplay);
                this.fileChartId.push('chart-' + chart);
            }
        },

        initialChart(header, fileName) {
            var container = document.getElementById('analysis-chart');
            this.createDiv('CPU', container, 'CPU.STAT.util', fileName);
            this.createDiv('STORAGE', container, 'STORAGE.STAT.util', fileName);
            this.createDiv('NET', container, 'NET.STAT.ifutil', fileName);
            this.createDiv('MEM', container, 'MEM.BANDWIDTH.Total_Util', fileName);
            for (var el in header) {
                var dim = header[el].split('.')[0];
                if (this.optionDim.indexOf(dim) <= -1) {
                    this.createDiv(dim, container, null, fileName);
                }
                initialParamChart('div-' + dim, header[el], fileName, this.verticalDisplay);
                if (this.fileChartId.indexOf('chart-' + header[el]) <= -1) {
                    this.fileChartId.push('chart-' + header[el]);
                }
            }
            this.onSubmit();
        },

        setPopUp(id) {
            this.statisticData = [];
            var chartSmall = echarts.init(document.getElementById(id));
            var chartPopUp = echarts.init(document.getElementById('chart-container'));
            if (chartPopUp.getOption() !== undefined) {
                var oldSeries = chartPopUp.getOption().series;
                for (var i = 0; i < oldSeries.length; i++) {
                    oldSeries[i].data = [];
                    oldSeries[i].name = '';
                    oldSeries[i] = {};
                }
                chartPopUp.setOption({
                    xAxis: {data: []},
                    series: oldSeries
                });
            } else {
                initialPopUp();
                chartPopUp = echarts.init(document.getElementById('chart-container'));
            }
            chartPopUp.setOption({
                title: {text: chartSmall.getOption().title[0].text},
                xAxis: {data: chartSmall.getOption().xAxis[0].data},
                series: chartSmall.getOption().series
            });
            for (var el in chartSmall.getOption().series) {
                var newStatistic = {};
                newStatistic['Name'] = chartSmall.getOption().series[el].name;
                var round = chartSmall.getOption().series[el].data.length;
                var avg = roundCal(getTotal(chartSmall.getOption().series[el].data), round, '/');
                var variance = roundCal(getVariance(chartSmall.getOption().series[el].data, avg), round, '/');
                var stdDiv = Math.sqrt(variance);
                newStatistic['Round#'] = round;
                newStatistic['Mean'] = avg;
                newStatistic['Variance'] = variance;
                newStatistic['Standard Division'] = stdDiv;
                this.statisticData.push(newStatistic);
            }
            document.getElementById('popup-window').style.display = 'grid';
        }
    },
    created() {
        if (Object.keys(this.$route.params).length > 0) {
            sessionStorage.setItem('analysisParams', JSON.stringify(this.$route.params));
            this.fileName = this.$route.params.name;
            this.optionCompare = this.$route.params.optionCompare;
            this.detectResData.splice();
            this.appName = '';
            this.initialDetailInfo(this.fileName, 0, 0);
        } else if (sessionStorage.analysisParams === undefined) {
            this.$router.push({
                path: '/analysis',
                name: 'Analysis'
            });
        } else {
            this.fileName = JSON.parse(sessionStorage.analysisParams).name;
            this.optionCompare = JSON.parse(sessionStorage.analysisParams).optionCompare;
            this.detectResData.splice();
            this.appName = '';
            this.initialDetailInfo(this.fileName, 0, 0);
        }
    },
    mounted() {
        window.setPopUpWindow = this.setPopUp;
    }
};

function initialParamChart(divId, param, fileName, vertical) {
    if (document.getElementById('chart-' + param) !== null) {
        return;
    }
    var container = document.getElementById(divId);
    if (vertical.includes(divId)) {
        container.style.display = 'grid';
        container.style.float = 'left';
    } else {
        container.style.display = 'block';
    }
    var div = document.createElement('div');
    div.id = 'chart-' + param;
    div.onclick = function () {
        setPopUpWindow(div.id);
    };
    div.className = 'io-chart';
    container.appendChild(div);
    var chart = initialEchart(div, param, fileName);
    return chart;
}

function initialEchart(div, param, fileName) {
    var chart = echarts.init(document.getElementById(div.id));
    var option = {
        title: {
            text: param,
            textStyle: {
                color: '#036',
                fontSize: 10
            },
            left: 'center',
            padding: [20, 0, 5, 0]
        },
        color: ['#003366', '#e5323e', '#fcc565', '#db6eba'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
                mark: {show: true}
            }
        },
        dataZoom: [{
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            left: '9%',
            bottom: -5,
            start: 0,
            end: 100
        }],
        xAxis: [{
            name: '',
            data: []
        }],
        yAxis: [{
            name: '',
            type: 'value'
        }],
        axisLabel: {
            show: true,
            formatter: function (value) {
                return getYAxis(value);
            }
        },
        series: [{
            name: fileName,
            type: 'line',
            symbolSize: 5,
            barGap: 0,
            data: []
        }]
    };
    chart.setOption(option);
    return chart;
}

function updateParamChart(header, data, fileNum, fileName) {
    for (var el in header) {
        var chart = echarts.init(document.getElementById('chart-' + header[el]));
        if (fileNum === 0) {
            var oldData = chart.getOption().series[0].data;
            var oldX = chart.getOption().xAxis[0].data;
            var val = 1;
            if (oldData.length !== 0) {
                val = oldX[oldX.length - 1] + 1;
            }
            for (var i in data[el]) {
                oldX.push(val);
                oldData.push(data[el][i]);
                val++;
            }
            chart.setOption({
                xAxis: {data: oldX},
                series: [{data: oldData}]
            });
        } else {
            var sery = 1;
            var currSeries = chart.getOption().series;
            for (i = 1; i < currSeries.length; i++) {
                if (currSeries[i].name === fileName) {
                    sery = i;
                    break;
                }
            }
            oldX = chart.getOption().xAxis[0].data;
            oldData = chart.getOption().series[sery].data;
            for (i in data[el]) {
                if (oldX.length === oldData.length) {
                    oldX.push(oldX.length + 1);
                }
                oldData.push(data[el][i]);
            }
            var newData = chart.getOption().series;
            newData[sery].data = oldData;
            chart.setOption({
                xAxis: {data: oldX},
                series: newData
            });
        }
    }
}

function deleteOldData(fileChartId, compareChartId) {
    for (var el in fileChartId) {
        var chart = echarts.init(document.getElementById(fileChartId[el]));
        var oldSeries = chart.getOption().series;
        var option = chart.getOption();
        for (var i = 1; i < oldSeries.length; i++) {
            option.series[i] = undefined;
        }
        chart.setOption(option, true);
    }
    for (var e in compareChartId) {
        var element = document.getElementById(compareChartId[e]);
        if (element !== undefined) {
            element.remove();
        }
    }
}

function addSeriesForChart(id, fileName) {
    var chart = echarts.init(document.getElementById(id));
    var newSeries = [];
    for (var ser in chart.getOption().series) {
        newSeries.push(chart.getOption().series[ser]);
    }
    newSeries.push({
        name: fileName,
        type: 'line',
        symbolSize: 5,
        barGap: 0,
        data: []
    });
    chart.setOption({
        series: newSeries
    });
}

function getTotal(list) {
    var res = 0;
    for (var i in list) {
        res = roundCal(res, parseFloat(list[i]), '+');
    }
    return res;
}

function getVariance(list, avg) {
    var res = 0;
    for (let i in list) {
        var div = roundCal(parseFloat(list[i]), avg, '-');
        var tempRes = roundCal(div, div, '*');
        res = roundCal(res, tempRes, '+');
    }
    return res;
}

function roundCal(numA, numB, operator) {
    numA = Math.floor(parseFloat(numA.toFixed(2)) * 100);
    numB = Math.floor(parseFloat(numB.toFixed(2)) * 100);
    switch (operator) {
        case '+':
            return (numA + numB) / 100;
        case '-':
            return (numA - numB) / 100;
        case '*':
            return (numA * numB) / 10000;
        case '/':
            return (numA / numB);
    }
}

function getYAxis(value) {
    var texts = value;
    if (texts >= 1000000000) {
        texts = texts / 1000000000;
        return texts + 'b';
    }
    if (texts >= 1000000) {
        texts = texts / 1000000;
        return texts + 'm';
    }
    if (texts >= 1000) {
        texts = texts / 1000;
        return texts + 'k';
    }
    return texts;
}

function initialPopUp() {
    var container = document.getElementById('chart-container');
    container.className = 'popup-chart';
    var ret = initialEchart(container, '', '');
    ret.setOption({
        title: {textStyle: {fontSize: 25}, padding: [10, 0, 10, 0]}
    });
}

function getAvgById(id) {
    var chart = echarts.init(document.getElementById(id));
    if (chart === undefined) {
        return 0;
    }
    var data = chart.getOption().series[0].data;
    var total = 0;
    var count = 0;
    for (var el in data) {
        total += parseFloat(data[el]);
        count++;
    }
    total /= count;
    return total;
}
