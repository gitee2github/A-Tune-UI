/**
 * @file help function for html Analysis page
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
 * Create: 2020-10-29
*/
import echarts from 'echarts';
import axios from 'axios';
import {host, port} from './utils.js';

export default {
    data() {
        return {
            analysis: [],
            optionCompare: [],
            currFileName: '',
            newFileName: ''
        };
    },
    components: { },
    methods: {
        closeRenamePopUp() {
            console.log('close popup');
            document.getElementById('rename-popup-window').style.display = 'none';
            document.getElementById('rename-error-duplicate').style.display = 'none';
            document.getElementById('rename-error-same').style.display = 'none';
            document.getElementById('rename-error-empty').style.display = 'none';
            this.newFileName = '';
            this.currFileName = '';
        },

        rename(file) {
            document.getElementById('rename-popup-window').style.display = 'block';
            document.getElementById('rename-error-duplicate').style.display = 'none';
            document.getElementById('rename-error-same').style.display = 'none';
            document.getElementById('rename-error-empty').style.display = 'none';
            this.currFileName = file.name;
        },

        onSubmitRename() {
            document.getElementById('rename-error-duplicate').style.display = 'none';
            document.getElementById('rename-error-same').style.display = 'none';
            document.getElementById('rename-error-empty').style.display = 'none';
            if (this.newFileName === undefined || this.newFileName === '') {
                document.getElementById('rename-error-empty').style.display = 'block';
            } else if (this.newFileName === this.currFileName) {
                document.getElementById('rename-error-same').style.display = 'block';
            } else {
                const path = `http://${host}:${port}/analysis/${this.currFileName}/new_file/${this.newFileName}`;
                axios.get(path).then((res) => {
                    if (res.data.duplicate) {
                        document.getElementById('rename-error-duplicate').style.display = 'block';
                    } else if (res.data.rename) {
                        this.$q.notify('Rename success');
                        this.closeRenamePopUp();
                        this.getAnalysisList();
                    } else {
                        this.$q.notify('Rename error');
                        this.closeRenamePopUp();
                        this.getAnalysisList();
                    }
                });
            }
        },

        getAnalysisList() {
            const path = `http://${host}:${port}/analysis`;
            axios.get(path).then((res) => {
                this.analysis = res.data.analysis;
                this.optionCompare.splice();
                for (var el in this.analysis) {
                    this.optionCompare.push(this.analysis[el].name);
                }
            });
        },

        initialAnalysisDetails(file, line) {
            this.fileName = file.name;
            if (this.optionCompare.indexOf(file.name) > -1) {
                this.optionCompare.splice(this.optionCompare.indexOf(file.name), 1);
            }
            const path = `http://${host}:${port}/analysis/${file.name}/${line}`;
            axios.get(path).then((res) => {
                if (!res.data.file_exist) {
                    this.$q.notify('Data has been deleted');
                    this.analysis.clear();
                    this.getAnalysisList();
                } else {
                    this.$router.push({
                        path: '/analysis/details',
                        name: 'AnalysisDetails',
                        params: {
                            name: file.name,
                            optionCompare: this.optionCompare
                        }
                    });
                }
            });
        },
    },
    created() {
        this.getAnalysisList();
    }
};
