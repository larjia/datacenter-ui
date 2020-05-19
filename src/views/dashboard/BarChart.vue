<template>
    <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

const animationDuration = 3000
import { getFTQLeakRate, getFTQ, getLeakRate } from '@/api/production/reporting/quality'

export default {
  name: 'BarChart',
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '500px'
    },
    title: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'FTQ'
    }
  },
  data () {
    return {
      chart: null,
      // 日期列表
      dateList: [],
      // 物料号列表
      partList: []
    }
  },
  computed: {
    minValue () {
      return (this.type === 'FTQ') ? 90 : 0
    },
    maxValue () {
      return (this.type === 'leakRate') ? 5 : 100
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy () {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart () {
      this.chart = echarts.init(this.$el, 'macarons')

      const dd = new Date()
      const end = this.convertDate(dd)
      // const lastDay = today.setTime(today.getTime() - 14 * 24 * 60 * 60 * 1000)
      dd.setDate(dd.getDate() - 300)
      const start = this.convertDate(dd)
      const query = {
        beginTime: start,
        endTime: end
      }

      this.getData(query).then(response => {
        this.dateList = this.getProdDateList(response.rows)
        this.partList = this.getPartNumberList(response.rows)

        this.chart.setOption({
          title: {
            text: this.title,
            textStyle: {
              fontSize: 14
            }
          },
          legend: {},
          tooltip: {
            trigger: 'item',
            axisPointer: {
              type: 'shadow'
            },
            formatter: function (param) {
              let sName = param.seriesName
              let startHtml = param.name + '<br>'
              startHtml += param.marker + " " + param.seriesName + ' : ' + param.data[sName] + '%</br>'
              return startHtml
            }
          },
          grid: {
            top: 50,
            left: '2%',
            right: '3%',
            containLabel: true
          },
          xAxis: [{
            type: 'category',
            axisTick: {
              alignWithLabel: true
            }
          }],
          yAxis: [{
            type: 'value',
            axisTick: {
              show: true
            },
            min: this.minValue,
            max: this.maxValue,
            axisLabel: {
              formatter: '{value} %'
            }
          }],
          dataset: {
            dimensions: this.getDimensions(this.partList),
            source: this.convertData(response.rows, this.dateList)
            // dimensions: [ 'prodDate', '2300240004', '2300020037', '2300260009', '2300010127', '2300020046'],
            // source: [
            //   { '2300010127': 2080, '2300240004': 900, 'prodDate': '2020-02-26' },
            //   { '2300010127': 1200, '2300020037': 250, '2300020046': 1200, 'prodDate': '2020-03-26' },
            //   { '2300020037': 500,  '2300260009': 450,  'prodDate': '2020-04-15' },
            //   { '2300020037': 1300, 'prodDate': '2020-04-16' },
            //   { '2300240004': 310,  'prodDate': '2020-04-18' }
            // ]
          },
          series: this.getSeries(response.rows)
        })
      })
    },
    getData (query) {
      if (this.type === 'FTQ') {
        return getFTQ(query)
      } else if (this.type === 'leakRate') {
        return getLeakRate(query)
      }
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
    // },
    convertData (data, dateList) {
      let res = []
      for (let date in dateList) {
        let obj = {}
        for (let d in data) {
          if (data[d].prodDate == dateList[date]) {
            if (this.type === 'FTQ') {
              obj[data[d].partNumber] = this.calcFTQ(data[d].qtyRejected, data[d].qtyCompleted)
            } else if (this.type === 'leakRate') {
              obj[data[d].partNumber] = this.calcLeakRate(data[d].qtyRejected, data[d].qtyCompleted)
            }
            obj.prodDate = dateList[date]
          }
        }
        res.push(obj)
      }

      return res
    },
    getProdDateList (data) {
      let res = []
      for (let property in data) {
        if (res.indexOf(data[property].prodDate) == -1) {
          res.push(data[property].prodDate)
        }
      }
      return res.sort(function (a, b) {
        return a > b
      })
    },
    getPartNumberList (data) {
      let res = []
      for (let property in data) {
        if (res.indexOf(data[property].partNumber) == -1) {
          res.push(data[property].partNumber)
        }
      }

      return res.sort(function (a, b) {
        return a > b
      })
    },
    getSeries (data) {
      let res = []
      let size = this.partList.length
      for (let i = 0; i < size; i++) {
        res.push({
          type: 'bar',
          // label: {
          //   normal: {
          //     show: true,
          //     position: 'insightRight',
          //     formatter: '{c}%'
          //   }
          // }
        })
      }

      return res
    },
    getDimensions (data) {
      let copy = data.slice()
      copy.splice(0, 0, 'prodDate')
      return copy
    },
    calcFTQ (qtyRejected, qtyCompleted) {
      if (qtyCompleted == 0) {
        return 0
      } else {
        return (1.0 - qtyRejected / qtyCompleted).toFixed(4) * 100
      }
    },
    calcLeakRate (qtyRejected, qtyCompleted) {
      if (qtyCompleted == 0) {
        return 0
      } else {
        return (qtyRejected / qtyCompleted).toFixed(4) * 100
      }
    },
    convertDate (date) {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      return year + '-' + month + '-' + day
    }
  }
}
</script>
