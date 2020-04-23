<template>
  <div class="dashboard-editor-container">
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <el-col :lg="12">
        <bar-chart v-bind:title="title1" v-bind:type="type1" ref="ftq"/>
      </el-col>
      <el-col :lg="12">
        <bar-chart v-bind:title="title2" v-bind:type="type2" ref="leak"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import BarChart from './dashboard/BarChart'
import { getFTQLeakRate, getFTQ, getLeakRate } from '@/api/production/reporting/quality'

export default {
  name: 'Index',
  components: {
    BarChart
  },
  data () {
    return {
      title1: 'FTQ',
      title2: '泄漏率',
      ftqList: {},
      leakRateList: {},
      type1: 'FTQ',
      type2: 'leakRate'
    }
  },
  created () {
    // this.getDateXAxis()
    // this.getData()
  },
  methods: {
    getData () {
      // const today = new Date()
      // const lastDay = (new Date()).setDate(today.getDate() - 6)
      // const query = {
      //   startTime: today,
      //   endTime: lastDay
      // }

      // getFTQ().then(response => {
      //   this.ftqList = response.rows
      // })

      // getLeakRate().then(response => {
      //   this.leakRateList = response.rows
      // })
    },
    // getDateXAxis () {
    //   let base = new Date()
    //   let oneDay = 24 * 3600 * 1000;
    //   let date = []

    //   for (let i = 1; i < 8; i++) {
    //     let current = new Date(base - ((7 - i) * oneDay))
    //     date.push([current.getFullYear(), current.getMonth() + 1, current.getDate()].join('/'))
    //   }

    //   return date;
    // }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 15px;
  background-color: rgb(240, 242, 245);
  position: relative;
}
</style>
