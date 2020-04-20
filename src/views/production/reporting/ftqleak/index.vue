<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true">
      <el-row>
        <el-form-item label="生产日期">
          <el-date-picker
            v-model="dateRange"
            size="mini"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="产品">
          <el-input
            v-model="queryParams.partProjName"
            type="text"
            size="mini"
            clearable
            placeholder="产品名称或物料号"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            class="filter-item"
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="generateReport"
          >生成报表</el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <el-table
      v-loading='loading'
      :data="reportList"
      border
      stripe
      highlight-current-row
      size='mini'
      :default-sort="{prop: 'prodDate', order: 'descending'}"
    >
      <el-table-column prop="prodDate" label="生产日期" width="110" sortable>
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.prodDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="partProjName" label="产品名称" width="200"></el-table-column>
      <el-table-column prop="partNumber" label="物料号" width="140"></el-table-column>
      <el-table-column prop="ftq" label="FTQ" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.ftq | perFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="leakRate" label="泄漏率" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.leakRate | perFilter }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getFTQLeakRate } from '@/api/production/reporting/quality'

export default {
  name: 'FTQLeak',
  data () {
    return {
      // 遮罩层
      loading: false,
      // 总记录数
      total: 0,
      // 报表数据
      reportList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        partProjName: undefined,
        partNumber: undefined
      },
      // 查询时生产日期范围
      dateRange: [],
      currentRow: null
    }
  },
  created () {

  },
  methods: {
    // 生产报表
    generateReport () {
      this.loading = true
      // 分页切换重置currentRow
      this.currentRow = null
      getFTQLeakRate(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.reportList = response.rows
        this.total = response.total
        this.loading = false
      })
    }
  },
  filters: {
    // 百分比显示
    perFilter (value) {
      return (value * 100).toFixed(2) + '%'
    }
  }
}
</script>

<style scoped>

</style>
