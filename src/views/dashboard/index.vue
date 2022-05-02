<template>
  <div class="app-container scroll-y">
    <el-descriptions v-loading="loading" :column="3" border>
      <el-descriptions-item label="操作系统名称" >{{ env.osName }}</el-descriptions-item>
      <el-descriptions-item label="初始化堆内存" >{{ env.initHeapMemory }}</el-descriptions-item>
      <el-descriptions-item label="CPU核心数" >{{ env.cpuCores }}</el-descriptions-item>

      <el-descriptions-item label="操作系统版本" >{{ env.osVersion }}</el-descriptions-item>
      <el-descriptions-item label="可使用堆内存" >{{ env.committedHeapMemory }}</el-descriptions-item>
      <el-descriptions-item label="可用内存" >{{ env.systemAvailableMemory }}</el-descriptions-item>

      <el-descriptions-item label="操作系统内核" >{{ env.osArch }}</el-descriptions-item>
      <el-descriptions-item label="最大堆内存" >{{ env.maxHeapMemory }}</el-descriptions-item>
      <el-descriptions-item label="总内存" >{{ env.systemTotalMemory }}</el-descriptions-item>
    </el-descriptions>

    <el-row style="margin-top: 30px">
      <el-col :span="24">
          <el-form :inline="true" label-width="80px" >
              <el-form-item label="服务器">
                  <el-radio-group v-model="monitorParams.server" @change="getMonitorData">
                      <el-radio-button v-for="op in servers" :key="op" :label="op" border ></el-radio-button>
                  </el-radio-group>
              </el-form-item>
          </el-form>
          <el-form :inline="true" >
              <el-form-item label="时间区间" label-width="80px" >
                  <el-radio-group v-model="monitorParams.minutes" @change="getMonitorData">
                      <el-radio-button label="60" border >1小时</el-radio-button>
                      <el-radio-button label="120" border >2小时</el-radio-button>
                      <el-radio-button label="180" border >3小时</el-radio-button>
                      <!-- <el-radio-button label="240" border >4小时</el-radio-button>
                      <el-radio-button label="480" border >8小时</el-radio-button>
                      <el-radio-button label="720" border >12小时</el-radio-button>
                      <el-radio-button label="1440" border >24小时</el-radio-button> -->
                  </el-radio-group>
              </el-form-item>
          </el-form>
      </el-col>
  </el-row>
  
  <el-row style="margin-top: 30px">
      <el-col :span="24">
          <div id="gcCharts" style="height: 500px; width: 100%" />
      </el-col>
      <el-col :span="24">
          <div id="heapCharts" style="height: 500px; width: 100%" />
      </el-col>
      <el-col :span="12">
          <div id="cpuCharts" style="height: 500px; width: 100%" />
      </el-col>
      <el-col :span="12">
          <div id="threadCharts" style="height: 500px; width: 100%" />
      </el-col>
  </el-row>
  </div>
</template>

<script setup>
import { getSystemEnv, getSystemServers, getSystemMonitor, getReviews } from '@/api/env'
import { toRefs, reactive, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const state = reactive({
  loading: false,
  env: {},
  servers:[],
  monitorParams:{
    minutes: 60,
    server: "",
  },
  loadRemoteStatus: false,
  charts: {
      gcCharts: null,
      cpuCharts: null,
      threadCharts: null,
      heapCharts: null,
  },

  times:[],
  youngGC:[],
  youngGCTime:[],
  oldGC:[],
  oldGCTime:[],
  cpuLoadAverage:[], 
  threadCount:[],
  threadDaemonCount:[],
  heap:[],
})
let { loading, env, servers, monitorParams } = toRefs(state)

onBeforeMount(() => {
  getSystemEnv().then((response) => {
    state.env = response.data
  }).catch((e) => {
    ElMessage.error(e.message)
  }) 
  getSystemServers().then(response => {
      state.servers = response.data
      state.monitorParams.minutes = 60

      if(state.servers.length > 0) {
          state.monitorParams.server = state.servers[0];
      }
      if(state.monitorParams.server != '') {
          getMonitorData();
      }
  }).catch(e => {
      ElMessage.error(e.message)
  });
})

const getMonitorData = () => {
  if(!state.loadRemoteStatus) {
      setTimeout(function(){
          state.loadRemoteStatus = false
          getMonitorData()
      }, 1000 * 60)
      state.loadRemoteStatus = true
  }

  getSystemMonitor(state.monitorParams).then(response => {
      state.times = []
      state.youngGC = []
      state.youngGCTime = []
      state.oldGC = []
      state.oldGCTime = []
      state.cpuLoadAverage = []
      state.threadCount = []
      state.threadDaemonCount = []
      state.heap = []
      for(var i = 0;i<response.data.length;i++) {
          var obj = response.data[i];
          state.youngGC.push(obj.youngGC)
          state.youngGCTime.push(obj.youngGCTime)
          state.oldGC.push(obj.oldGC)
          state.oldGCTime.push(obj.oldGCTime)
          state.times.push(obj.createTime)
          state.cpuLoadAverage.push(obj.cpuLoadAverage)
          state.threadCount.push(obj.threadCount)
          state.threadDaemonCount.push(obj.threadDaemonCount)
          state.heap.push(obj.usedHeap)
      }

      setGcChartsOptions();
      setCPUChartsOptions();
      setThreadChartsOptions();
      setHeapChartsOptions();
  }).catch(e => {
      ElMessage.error(e.message)
  });
}

const setThreadChartsOptions = () => {
  if(state.charts.threadCharts == null) {
      var div = document.getElementById('threadCharts');
      state.charts.threadCharts = markRaw(echarts.init(div))
  }
  state.charts.threadCharts.setOption({
      title: {
          text: '线程数',
          top: '0',
          x: 'center',
      },
      
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          }
      },
      calculable: true,
      xAxis: [
          {
              type: 'category',
              // prettier-ignore
              data: state.times
          }
      ],
      yAxis: [
          {
              type: 'value',
          },
          {
              type: 'value',
          },
      ],
      series: [
          {
              data: state.threadCount,
              type: 'line',
              name: '线程数',
          },
          {
              data: state.threadDaemonCount,
              type: 'line',
              name: '守护线程数',
          }
      ]
  }, true)
}

const setHeapChartsOptions = () => {
  if(state.charts.heapCharts == null) {
      var div = document.getElementById('heapCharts');
      state.charts.heapCharts = markRaw(echarts.init(div))
  }
  state.charts.heapCharts.setOption({
      title: {
          text: '已使用内存',
          top: '0',
          x: 'center',
      },
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          }
      },
      calculable: true,
      xAxis: [
          {
              type: 'category',
              // prettier-ignore
              data: state.times
          }
      ],
      yAxis: [
          
          {
              name: '已使用内存',
              type: 'value',
              axisLabel: {
                  formatter: '{value} MB'
              }
          }
      ],
      series: [
          {
              type: 'bar',
              data: state.heap,
          },
          
      ]
  }, true)
}

const setGcChartsOptions = () => {
  if(state.charts.gcCharts == null) {
      var div = document.getElementById('gcCharts');
      state.charts.gcCharts = markRaw(echarts.init(div))
  }
  state.charts.gcCharts.setOption({
      title: {
          text: 'GC次数',
          top: '0',
          x: 'center',
      },
      
      legend: {
          data: ['YoungGC', 'OldGC', 'YoungGCTime', 'OldGCTime'],
          x: 'center',
          top: '30',
      },
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          }
      },
      calculable: true,
      xAxis: [
          {
              type: 'category',
              data: state.times
          }
      ],
      yAxis: [
          {
              name: 'GC次数',
              type: 'value',
          },
          {
              name: 'GC时间',
              type: 'value',
              axisLabel: {
                  formatter: '{value} ms'
              }
          }
      ],
      series: [
          {
              name: 'YoungGC',
              type: 'bar',
              data: state.youngGC,
          },
          {
              name: 'OldGC',
              type: 'bar',
              data: state.oldGC,
          },
          {
              name: 'YoungGCTime',
              type: 'line',
              yAxisIndex: 1,
              data: state.youngGCTime,
          },
          {
              name: 'OldGCTime',
              type: 'line',
              yAxisIndex: 1,
              data: state.oldGCTime,
          }
      ]
  }, true)
}

const setCPUChartsOptions = () => {
  if(state.charts.cpuCharts == null) {
      var div = document.getElementById('cpuCharts');
      state.charts.cpuCharts = markRaw(echarts.init(div))
  }
  state.charts.cpuCharts.setOption({
      title: {
          text: 'CPU负载',
          top: '0',
          x: 'center',
      },
      
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          }
      },
      calculable: true,
      xAxis: [
          {
              type: 'category',
              // prettier-ignore
              data: state.times
          }
      ],
      yAxis: [
          {
              type: 'value',
          },
      ],
      series: [
          {
              data: state.cpuLoadAverage,
              type: 'line',
              name: '平均负载',
          }
      ]
  }, true)
}



</script>

<style lang="scss" scoped>

</style>
