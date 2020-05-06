<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="90px" size="mini">
      <el-form-item label="采购订单号" prop="orderNbr">
        <el-input
          v-model="queryParams.orderNbr"
          placeholder="请输入采购订单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supplier">
        <el-input
          v-model="queryParams.supplier"
          placeholder="请输入供应商编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="供应商名称" prop="supplierName">
        <el-input
          v-model="queryParams.supplierName"
          placeholder="请输入供应商名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-tag>采购订单</el-tag>
    <el-table
      v-loading="loading"
      :data="orderList"
      size="mini"
      stripe
      border
      highlight-current-row
      @current-change="handleCurrentChange"
      max-height="220"
      ref="orderTable"
    >
      <el-table-column label="采购订单号" align="center" prop="orderNbr" />
      <el-table-column label="供应商" align="center" prop="supplier" />
      <el-table-column label="供应商名称" align="center" width="220" prop="supplierName" :show-overflow-tooltip="true"/>
      <el-table-column label="发运至" align="center" prop="shipTo" />
      <el-table-column label="订单日期" align="center" prop="orderDate" />
      <el-table-column label="货币" align="center" prop="currency" />
      <el-table-column label="支付方式" align="center" prop="crTerm" />

    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-tag>采购订单详细</el-tag>

    <el-table
      v-loading="loading"
      :data="orderDetailsList"
      size="mini"
      stripe
      border
      ref="detailTable"
    >
      <el-table-column label="行" align="center" prop="line" />
      <el-table-column label="地点" align="center" prop="site" />
      <el-table-column label="申请号" align="center"  width="120" prop="appNbr">
        <template slot-scope="scope">
          <router-link :to="'/bpm/applicationhist/' + scope.row.appNbr" class="link-type">
            <span>{{ scope.row.appNbr }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="物料号" align="center" width="220" prop="part" :show-overflow-tooltip="true" />
      <el-table-column label="UM" align="center" width="100" prop="um" />
      <el-table-column label="已订购量" align="center" width="120" prop="qtyOrder" />
      <el-table-column label="采购成本" align="center" width="120" prop="purCost" />
      <el-table-column label="应纳税" align="center" prop="taxable">
        <template slot-scope="scope">
          <span>{{ scope.row.taxable | YesNoFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="含税" align="center" prop="taxIn">
        <template slot-scope="scope">
          <span>{{ scope.row.taxIn | YesNoFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="税率" align="center" prop="taxRate" />
      <el-table-column label="采购账户" align="center" width="120" prop="purAccount" />
      <el-table-column label="成本中心" align="center" width="120" prop="cc" />
      <el-table-column label="项目" align="center" width="120" prop="project" />
      <el-table-column label="类型" align="center" prop="type" />
    </el-table>
  </div>
</template>

<script>
import { listPurchaseOrder } from '@/api/purchase/order'

export default {
  name: 'PurchaseOrder',
  data () {
    return {
      // 遮罩层
      loading: true,
      // 总记录数
      total: 0,
      // 采购订单表格数据
      orderList: [],
      // 采购订单详细表格数据
      orderDetailsList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNbr: undefined
      },
      currentRow: null
    }
  },
  created () {
    this.getList()
  },
  filters: {
    YesNoFilter (value) {
      if (value === '0') return 'No'
      else return 'Yes'
    }
  },
  methods: {
    // 获取采购订单列表
    getList () {
      this.loading = true
      listPurchaseOrder(this.queryParams).then(response => {
        this.orderList = response.rows
        this.total = response.total
        this.loading = false
        this.currentRow = null
      })
    },
    // 当前行处理
    handleCurrentChange (val) {
      this.currentRow = val
      this.orderDetailsList = (this.currentRow == null) ? [] : this.currentRow.orderDetails
    },
    // 搜索操作
    handleQuery () {
      this.getList()
    }
  }
}
</script>
