import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      columns: [
        {
          name: "order",
          required: true,
          label: "序号",
          align: "left",
          field: (row) => row.order,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "name",
          align: "center",
          label: "任务名称",
          field: "name",
        },
        { name: "IP", label: "IP地址", field: "IP" },
        { name: "command", label: "命令", field: "command" },
        { name: "state", label: "任务状态", field: "state" },
        { name: "time", label: "开始时间", field: "time" },
        {
          name: "operation",
          label: "操作",
          field: "operation",
        },
      ],
      data: [
        {
          order: 1,
          name: "Test1",
          IP: "9.10.33.13",
          command: "在线调优",
          state: "运行中",
          time: 87,
          operation: "14%",
        },
        {
          order: 2,
          name: "Test2",
          IP: "9.10.33.13",
          command: "离线调优",
          state: "运行中",
          time: 129,
          operation: "8%",
        },
        {
          order: 3,
          name: "Test3",
          IP: "9.10.33.13",
          command: "在线调优",
          state: "已完成",
          time: 337,
          operation: "6%",
        },
        {
          order: 4,
          name: "Test4",
          IP: "9.10.33.13",
          command: "离线调优",
          state: "运行中",
          time: 413,
          operation: "3%",
        },
        {
          order: 5,
          name: "Test5",
          IP: "9.10.33.13",
          command: "离线调优",
          state: "已完成",
          time: 327,
          operation: "7%",
        },
        {
          order: 6,
          name: "Test6",
          IP: "9.10.33.13",
          command: "在线调优",
          state: "已完成",
          time: 50,
          operation: "0%",
        },
        {
          order: 7,
          name: "Test7",
          IP: "9.10.33.13",
          command: "在线调优",
          state: "运行中",
          time: 38,
          operation: "0%",
        },
        {
          order: 8,
          name: "Test8",
          IP: "9.10.33.13",
          command: "离线调优",
          state: "运行中",
          time: 562,
          operation: "0%",
        },
        {
          order: 9,
          name: "Test9",
          IP: "9.10.33.13",
          command: "在线调优",
          state: "失败",
          time: 326,
          operation: "2%",
        },
        {
          order: 10,
          name: "Test10",
          IP: "9.10.33.13",
          command: "在线调优",
          state: "已完成",
          time: 54,
          operation: "12%",
        },
      ],
    };
  },
});