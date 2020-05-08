<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" size="mini">
      <el-form-item label="申请号" prop="appNbr">
        <el-input 
          v-model="queryParams.appNbr"
          placeholder="请输入申请号"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="dataList"
      size="mini"
      highlight-current-row
      @current-change="handleCurrentChange"
      border
      stripe
    >
      <el-table-column label="流程名称" prop="processName" width="150"/>
      <el-table-column label="实例号" prop="incident" />
      <el-table-column label="申请人" prop="applicant" />
      <el-table-column label="申请号" prop="appNbr" width="100"/>
      <el-table-column label="申请日期" prop="appDate"  width="120"/>
      <el-table-column label="备注" prop="remark" width="250" :show-overflow-tooltip="true"/>
      <el-table-column label="项目" prop="project" width="100" />
      <el-table-column label="成本中心" prop="cc" width="100" />
      <el-table-column label="账户" prop="account" width="100" />
      <el-table-column label="行" prop="line" />
      <el-table-column label="物料号" prop="part" width="250" />
      <el-table-column label="UM" prop="um" />
      <el-table-column label="供应商" prop="supplier" />
      <el-table-column label="货币" prop="currency" />
      <el-table-column label="采购成本" prop="purCost" width="110" />
      <el-table-column label="数量" prop="qty" width="110"/>
    </el-table>
  </div>
</template>

<script>
import { listBPMByAppNbr } from '@/api/bpm/applicationhist'

export default {
  name: 'BPMApplicationHist',
  data () {
    return {
      // 遮罩层
      loading: true,
      // BPM申请数据
      dataList: [],
      // 默认申请号(通过URL路由参数传递)
      defaultAppNbr: '',
      // 总记录数
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appNbr: undefined
      }
    }
  },
  created () {
    const appNbr = this.$route.params && this.$route.params.appNbr
    this.queryParams.appNbr = appNbr
    this.defaultAppNbr = appNbr
    this.getList()
  },
  methods: {
    // 查询BPM申请记录
    getList () {
      this.loading = true
      listBPMByAppNbr(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 查询操作
    handleQuery () {
      this.getList()
    },
    handleCurrentChange (val) {
      this.currentRow = val
    }
  }
}
</script>

<style scoped>

</style>
