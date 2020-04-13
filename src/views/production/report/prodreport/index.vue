<template>
  <div class="app-container">
    <!-- 搜素表单 -->
    <el-form :inline="true">
      <el-form-item label="生产日期">
        <el-date-picker
          v-model="queryParams.prodDate"
          type="date"
          placeholder="选择日期"
          clearable
          size="small"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item label="物料号">
        <el-input
          v-model="queryParams.partNumber"
          type="text"
          size="small"
          clearable
          placeholder="输入物料号"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled='!isSelected'
          @click="handleUpdate"
        >修改</el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled='!isSelected'
          @click="handleDelete"
        >删除</el-button>
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading='loading'
      :data='reportHistList'
      row-key='id'
      border
      stripe
      highlight-current-row
      size='mini'
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      @current-change="handleCurrentChange"
    >
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column prop="prodDate" label="生产日期" width="110">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.prodDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="reportDate" label="报工日期" width="110">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.reportDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="partProjName" label="产品名称" width="200"></el-table-column>
      <el-table-column prop="partNumber" label="物料号" width="140"></el-table-column>
      <el-table-column prop="operator" label="操作员" width="90"></el-table-column>
      <el-table-column prop="shift" label="班次" width="70">
        <template slot-scope="scope">
          <span>{{ scope.row.shift | shiftDisp }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="100"></el-table-column>
      <el-table-column prop="endTime" label="结束时间" width="100"></el-table-column>
      <el-table-column prop="dept" label="车间部门" width="100"></el-table-column>
      <el-table-column prop="group" label="班组" width="110"></el-table-column>
      <el-table-column prop="op" label="工序" width="120"></el-table-column>
      <!-- <el-table-column prop="componentName" label="零件名称" width="120"></el-table-column> -->
      <!-- <el-table-column prop="serialNumber" label="批序号" width="120"></el-table-column> -->
      <el-table-column prop="qtyCompleted" label="完成数" width="80"></el-table-column>
      <el-table-column prop="qtyRejected" label="不良数" width="80"></el-table-column>
      <el-table-column prop="qtyScrapped" label="报废数" width="80"></el-table-column>
      <el-table-column prop="qtyAccepted" label="合格数" width="80"></el-table-column>
      <el-table-column prop="rejectReason" label="不良原因" width="250"></el-table-column>
      <el-table-column prop="ppm" label="PPM" width="80"></el-table-column>
      <el-table-column prop="ftq" label="FTQ" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.ftq | perDisp }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show='total > 0'
      :total='total'
      :page.sync='queryParams.pageNum'
      :limit.sync='queryParams.pageSize'
      @pagination='getReportHistList'
    />

    <!-- 添加或修改报工对话框 -->
    <el-dialog :title="title" :visible.sync="open" :close-on-click-modal="false" :close-on-press-escape="false" 
      :width="dialogWidth" class="dialog" top="3vh !important" @close="closeDialog" center>
      <el-form ref="form" size="mini" :model="form" :rules="rules" label-width="90px">
        <!-- 表单行-生产日期 -->
        <el-row>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="生产日期" prop="prodDate">
              <el-date-picker
                v-model="form.prodDate"
                type="date"
                size="mini"
                style="width:100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="起始时间" prop="startTime">
              <!-- <el-col :span="8" :xs="{span:24, offset:0}"> -->
              <el-time-select
                v-model="form.startTime"
                :picker-options="{
                  start: '00:00',
                  step: '00:30',
                  end: '24:00'
                }"
                size="mini"
                style="width:100%"
                placeholder="起始时间"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8" :xs="{span:24, offset:0}"> 
              <!-- <el-col :span="8" :offset="2" :xs="{span:24, offset:0}"> -->
            <el-form-item label="至" prop="endTime">
              <el-time-select
                v-model="form.endTime"
                :picker-options="{
                  start: '00:00',
                  step: '00:30',
                  end: '24:00'
                }"
                size="mini"
                style="width:100%"
                placeholder="结束时间"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 表单行-车间班组工序 -->
        <el-row>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="生产车间" prop="dept">
              <el-select v-model="form.dept" placeholder="生产车间" clearable size="mini" 
                style="width:100%" @change='deptSelectionChanged'>
                <el-option
                  v-for="item in deptOptions"
                  :key="item.deptId"
                  :label="item.deptName"
                  :value="item.deptName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="班组" prop="group">
              <el-select v-model="form.group" placeholder="班组" clearable size="mini" 
                style="width:100%" @change="groupSelectionChanged">
                <el-option
                  v-for="item in groupOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="工序" prop="op">
              <el-select v-model="form.op" placeholder="工序" clearable size="mini" 
                style="width:100%" @change="opSelectionChanged">
                <el-option
                  v-for="item in opOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 表单行-物料号 -->
        <el-row>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="产品名称" prop="partProjName">
              <el-select 
                v-model="form.partProjName" 
                filterable 
                clearable
                size="mini" 
                placeholder="请选择"
                style="width:100%"
                @change="partSelectionChanged">
                <el-option
                  v-for="item in partOptions"
                  :key="item.id"
                  :label="item.projName"
                  :value="item.projName">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="ERP编码" prop="partNumber">
              <el-input
                v-model="form.partNumber"
                size="mini" 
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="1" :xs="{span:24, offset:0}" v-if="showAddComp">
            <div class="item-title" @click="addComponent"><i class="el-icon-circle-plus"/></div>
          </el-col>
        </el-row>

        <!-- 表单行 零件 多个动态 -->
        <el-row v-for='(comp, index) in form.components' :key="index">
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="零件名称"
              :prop="'components.' + index + '.component'" 
              :rules="{
                required: true, message: '零件名称不能为空', trigger: 'blur'
              }"
            >
              <el-select v-model="form.components[index].component" size="mini" clearable style="width:100%">
                <el-option
                  v-for="item in componentOptions"
                  :key="item.dictValue"
                  :label="item.ditctLabel"
                  :value="item.dictLabel">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="批序号" 
              :prop="'components.' + index + '.serialNumber'"
              :rules="{
                required: true, message: '批序号不能为空', trigger: 'blur'
              }"
            >
              <el-input v-model="form.components[index].serialNumber" clearable size="mini" />
            </el-form-item>
          </el-col>
          <el-col :span="1" v-if="index != 0">
            <div class="item-title" @click="removeComponent(index)"><i class="el-icon-remove"/></div>
          </el-col>
        </el-row>

        <!-- 表单行 零件 -->
        <!-- <el-row>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="*零件名称" prop="componentName">
              <el-select v-model="form.componentName" size="mini" placeholder="请选择" clearable style="width:100%">
                <el-option
                  v-for="item in componentOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictLabel">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="批序号" prop="serialNumber">
              <el-input
                v-model="form.serialNumber"
                clearable
                size="mini"
              />
            </el-form-item>
          </el-col>
        </el-row> -->

        <!-- 表单行-完成数 合格数 -->
        <el-row>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="完成数" prop="qtyCompleted">
              <el-input-number
                v-model="form.qtyCompleted"
                clearable
                size="mini"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 表单行-不良数 FTQ -->
        <el-row>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="不良数" prop="qtyRejected">
              <el-input-number
                v-model="form.qtyRejected"
                clearable
                size="mini"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 表单行-报废数 PPM -->
        <el-row>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="报废数" prop="qtyScrapped">
              <el-input-number
                v-model="form.qtyScrapped"
                clearable
                size="mini"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item v-if="showReason" label="不良原因" prop="rejectReason">
              <el-select v-model="form.rejectReason" placeholder="请选择" clearable size="mini" @change="reasonSelectionChanged($event)">
                <el-option
                  v-for="item in reasonOptions"
                  :key="item.id"
                  :label="item.reason"
                  :value="item.reason"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="合格数" prop="qtyAccepted">
              <el-input
                v-bind:value='qtyAccepted'
                clearable
                size="mini"
                readonly
              />
            </el-form-item>
          </el-col>

          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="FTQ" prop="ftq">
              <el-input
                v-bind:value='ftq | perDisp(ftq)'
                clearable
                size="mini"
                readonly
              />
            </el-form-item>
          </el-col>

          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="PPM" prop="ppm">
              <el-input
                v-bind:value='ppm'
                clearable
                size="mini"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 表单行-班次 操作员 -->
        <el-row>
          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="操作员" prop="operator">
              <el-input
                v-model="form.operator"
                placeholder="操作员姓名"
                clearable
                size="mini"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8" :xs="{span:24, offset:0}">
            <el-form-item label="班次" prop="shift">
              <template>
                <el-radio v-model="form.shift" label="0">白班</el-radio>
                <el-radio v-model="form.shift" label="1">夜班</el-radio>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button v-if="isNew" type="success" @click="submitContinue">确定并继续添加</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import 
{ 
  listReportHist, 
  getReportHistById, 
  addReportHist, 
  updateReportHist, 
  deleteReportHistById, 
  exportData
}
from '@/api/production/report/prodreport'

import { listProdDept } from '@/api/system/dept'
import { listPart } from '@/api/masterdata/part'
import { listGroup } from '@/api/production/shopfloor/group/group'
import { listOperation } from '@/api/production/shopfloor/operation/operation'
import { listReason } from '@/api/production/shopfloor/operation/oprejectreason'

export default {
  name: 'ProdReport',
  data () {
    /**
     * --- 字段 ---
     * 生产日期: form.prodDate
     * 开始时间: form.startTime
     * 结束时间: form.endTime
     * 产品名称: form.partProjName
     * 物料编码: form.partNumber
     * 零件名称: form.componentName
     * 批序号  : form.serialNumber
     * 生产车间: form.dept
     * 班组    : form.group
     * 工序    : form.op
     * 操作员  : form.operator
     * 班次    : form.shift
     * 不良原因: form.rejectReason
     * 完成数  : form.qtyCompleted
     * 不良数  : form.qtyRejected
     * 报废数  : form.qtyScrapped
     * 合格数  : form.qtyAccepted
     * FTQ     : form.ftq
     * PPM     : form.ppm
     * 
     * --- 下拉框 ---
     * 产品名称: partOptions
     * 零件名称: componentOptions
     * 生产车间: deptOptions
     * 班组    : groupOptions
     * 工序    : opOptions
     * 原因    : reasonOptions
     */

    // 完成数       : > 0
    // 不良数,报废数: 为空或者>0
    let validLargerThanZero = (rule, value, cb) => {
      if (value !== '') {
        if (value <= 0) {
          cb(new Error('完成数不能小于等于0'))
        } else {
          cb()
        }
      } else {
        cb()
      }
    }

    let validNoLessThanZero = (rule, value, cb) => {
      if (value !== '') {
        if (value < 0) {
          cb(new Error('数量不能小于0'))
        } else {
          cb()
        } 
      } else {
        cb()
      }
    }

    // 不良原因
    // let validRejectReason = (rule, value, cb) => {
    //   if (this.showReason && !this.form.rejectReason) {
    //     cb(new Error('不良原因不能为空'))
    //   } else {
    //     cb()
    //   }
    // }

    return {
      /**
       * index页面数据
       */
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 表格数据
      reportHistList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        prodDate: undefined,
        partNumber: undefined
      },
      /**
       * 新增或修改页面数据
       */
      // 产品列表
      partOptions: [],
      // 零件名称列表
      componentOptions: [],
      // 部门列表
      deptOptions: [],
      // 班组列表
      groupOptions: [],
      // 工序列表
      opOptions: [],
      // 不良原因列表
      reasonOptions: [],
      // 员工列表
      // operatorOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否需要选择不良原因
      needReason: false,
      // 是否需要显示不良原因选择框
      // showReason: false,
      // 是否为新增或修改(false: 修改 true: 新增)
      isNew: false,
      // 当前行
      currentRow: null,
      // 对话框宽度
      dialogWidth: 0,
      // 是否显示新增零件按钮
      showAddComp: false,
      // 表单参数
      form: {
        components: []
      },
      // 表单校验
      rules: {
        prodDate: [
          { required: true, message: '生产日期不能为空', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '起始时间不能为空', trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '结束时间不能为空', trigger: 'blur' }
        ],
        partProjName: [
          { required: true, message: '产品名称不能为空', trigger: 'blur' }
        ],
        // componentName: [
        //   { required: true, message: '零件名称不能为空', trigger: 'blur' }
        // ],
        // serialNumber: [
        //   { required: true, message: '批序号不能为空', trigger: 'blue' }
        // ],
        dept: [
          { required: true, message: '车间部门不能为空', trigger: 'blur' }
        ],
        group: [
          { required: true, message: '班组不能为空', trigger: 'blur' }
        ],
        op: [
          { required: true, message: '工序不能为空', trigger: 'blur' }
        ],
        qtyCompleted: [
          { required: true, message: '完成数不能为空', trigger: 'change' },
          { validator: validLargerThanZero, trigger: 'change' }
        ],
        operator: [
          { required: true, message: '操作员姓名不能为空', trigger: 'blur' }
        ],
        qtyRejected: [
          { required: true, message: '数量不能为空', trigger: 'change' },
          { validator: validNoLessThanZero, trigger: 'change' }
        ],
        qtyScrapped: [
          { required: true, message: '数量不能为空', trigger: 'change' },
          { validator: validNoLessThanZero, trigger: 'change' }
        ],
        qtyAccepted: [
          { validator: this.validateQtyAccepted, trigger: 'change' }
        ],
        rejectReason: [
        //   { validator: validRejectReason, trigger: 'blur' }
          { validator: this.validateRejectReason, trigger: 'blur' }
        ],
        component: [
          { required: true, message: '零件名称不能为空', trigger: 'blur' }
        ],
        serialNumber: [
          { required: true, message: '批序号不能为空', trigger: 'blur' }
        ]
      },
    }
  },
  created () {
    this.setDialogWidth()
    this.getReportHistList()
  },
  mounted () {
    window.onresize = () => {
      return (() => {
        this.setDialogWidth()
      })()
    }
  },
  filters: {
    perDisp (value) {
      let res = value ? (parseFloat((value * 100).toFixed(2)) + '%') : value
      return res
    },
    shiftDisp (value) {
      return value === '0' ? '白班' : '夜班'
    }
  },
  computed: {
    qtyAccepted () {
      // get () {
        return this.form.qtyCompleted - this.form.qtyRejected - this.form.qtyScrapped
      // }
    },
    ftq () {
      if (this.form.qtyCompleted !== 0) {
        let res = parseFloat((this.qtyAccepted / this.form.qtyCompleted).toFixed(4))
        return res
      }
      return ''
    },
    ppm () {
      if (this.form.qtyCompleted !== 0) {
        let res = parseFloat((1000000 * (this.form.qtyRejected + this.form.qtyScrapped) / this.form.qtyCompleted).toFixed(0))
        return res
      }
      return ''
    },
    // 是否需要显示并选择原因
    showReason () {
      // if (this.needReason && (this.form.qtyRejected !== 0 || this.form.qtyScrapped !== 0)) {
      //   return true
      // }
      // this.form.rejectReason = ''
      // return false
      return this.calcShowReason()
    },
    // 是否有当前行选中
    isSelected () {
      return this.currentRow == null ? false : true
    }
  },
  methods: {
    /**
     * Index View的方法
     */
    // 获取生产报工列表
    getReportHistList () {
      this.loading = true
      // 分页切换重置currentRow
      this.currentRow = null
      listReportHist(this.queryParams).then(response => {
        this.reportHistList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 表格选择行变化
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    // 搜索按钮操作
    handleQuery () {
      this.queryParams.pageNum = 1
      this.getReportHistList()
    },
    // 新增按钮操作
    handleAdd () {
      this.isNew = true
      this.reset()
      this.getPartList(true) // 产品名称列表
      this.getComponentList() // 零件名称列表
      this.getDeptList() // 部门列表
      this.open = true
      this.title = '新增报工记录'
    },
    // 修改按钮操作
    handleUpdate (row) {
      this.isNew = false
      this.reset()
      // const id = row.id || this.ids
      const id = row.id || this.currentRow.id
      getReportHistById(id).then(response => {
        this.form = response.data
        if (this.form.group === '装配班') {
          this.showAddComp = true
        }
        this.getPartList()
        this.getComponentList()
        return
      }).then(() => {
        listProdDept().then(response => {
        this.deptOptions = response.data
        return response.data
      }).then(res => {
          let deptId = res.find(item => item.deptName === this.form.dept).deptId
          let groupQuery = {
            deptId: deptId
          }
          listGroup(groupQuery).then(response => {
            this.groupOptions = response.rows
            return response.rows
          }).then(res => {
            let groupId = res.find(item => item.name === this.form.group).id
            let opQuery = {
              groupId: groupId
            }
            listOperation(opQuery).then(response => {
              this.opOptions = response.rows
              return response.rows
            }).then(res => {
              let info = res.find(item => item.name === this.form.op)
              if (info && info.needReason === '1') {
                this.needReason = true
                let reasonQuery = {
                  opId: info.id
                }
                listReason(reasonQuery).then(response => {
                  this.reasonOptions = response.rows
                })
              } else {
                // this.needReason = false
              }
              this.$forceUpdate()
            })
          })
        })
      })

      if (this.form.rejectReason != '') {
        this.needReason = true
      }

      // open and title
      this.open = true
      this.title = '修改报工记录'
    },
    // 删除按钮操作
    handleDelete (row) {
      // const id = row.id || this.ids
      const id = row.id || this.currentRow.id
      this.$confirm('是否确认删除?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteReportHistById(id)
      }).then(() => {
        this.getReportHistList()
        this.msgSuccess('删除成功')
      }).catch(function () {})
    },
    // 导出按钮操作
    handleExport () {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有数据项?', '信息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return exportData(queryParams)
      }).then(response => {
        this.download(response.msg)
      }).catch(function () {})
    },
    /**
     * 新增或修改页面方法
     */
    // 获取产品名称 物料号
    getPartList (active) {
      const query = active ? { status: 'Active' } : {}
      listPart(query).then(response => {
        this.partOptions = response.rows
      })
    },
    // 产品名称选中值发生变化
    partSelectionChanged (part) {
      if (part) {
        let info = this.partOptions.find(item => item.projName === part)
        this.form.partNumber = info.number
      } else {
        this.form.partNumber = ''
      }
    },
    // 获取零件名称表
    getComponentList () {
      this.getDicts("prod_component_name").then(response => {
        this.componentOptions = response.data
      })
    },
    // 获取车间部门列表
    getDeptList () {
      listProdDept().then(response => {
        this.deptOptions = response.data
        return response
      })
    },
    // 部门选择值发生变化
    deptSelectionChanged (dept) {
      this.groupOptions = []
      this.form.group = ''
      this.opOptions = []
      this.form.op = ''
      this.needReason = false
      this.reasonOptions = []
      this.form.rejectReason = ''

      if (dept) {
        let deptId = this.deptOptions.find(item => item.deptName === dept).deptId
        let query = {
          deptId: deptId
        }
        listGroup(query).then(response => {
          this.groupOptions = response.rows
        })
      }
    },
    // 班组选择值发生变化
    groupSelectionChanged (group) {
      this.opOptions = []
      this.form.op = ''
      this.needReason = false
      this.reasonOptions = []
      this.form.rejectReason = ''

      // 装配班需要输入零件
      if (group && group === '装配班') {
        this.showAddComp = true
        this.form.components.push({})
      } else {
        this.showAddComp = false
        this.form.components = []
      }

      if (group) {
        let groupId = this.groupOptions.find(item => item.name === group).id
        let query = {
          groupId: groupId
        }
        listOperation(query).then(response => {
          this.opOptions = response.rows
        })
      }
    },
    // 工序选择值发生变化
    opSelectionChanged (op) {
      if (op) {
        let info = this.opOptions.find(item => item.name === op)
        
        if (info.needReason === '1') {
          this.needReason = true
        } else {
          this.needReason = false
        }
        let query = {
          opId: info.id
        }
        listReason(query).then(response => {
          this.reasonOptions = response.rows
          this.form.rejectReason = ''
        })
      } else {
        this.needReason = false
        this.reasonOptions = []
        this.form.rejectReason = ''
      }
      this.$forceUpdate()
    },
    reasonSelectionChanged () {
      this.$forceUpdate()
    },
    // 表单重置
    reset () {
      this.form = {
        prodDate: new Date(), // 默认当前日期
        shift: '0', // 默认白班
        startTime: '',
        endTime: '',
        // partNumber: '', // ERP物料号
        // serialNumber: '', // 批序号
        components: [],
        qtyCompleted: 0,
        qtyRejected: 0,
        qtyScrapped: 0
      }
      this.partOptions = []
      this.componentOptions = []
      this.deptOptions = []
      this.groupOptions = []
      this.opOptions = []
      this.reasonOptions = []
      this.showAddComp = false
      this.resetForm('form')
    },
    // 点击确定按钮
    submit () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.isNew) { // 新增
            this.form.qtyAccepted = this.qtyAccepted
            this.form.ppm = this.ppm
            this.form.ftq = this.ftq
            if (!this.showReason) {
              this.form.rejectReason = ''
            }
            // if (this.showReason) {
            //   this.form.rejectReason = this.form.rejectReason.reason
            // }

            addReportHist(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getReportHistList()
              } else {
                this.msgError(response.msg)
              }
            })

          } else {          // 修改
            this.form.qtyAccepted = this.qtyAccepted
            this.form.ppm = this.ppm
            this.form.ftq = this.ftq
            if (!this.showReason && this.form.rejectReason) {
              this.form.rejectReason = ''
            }

            updateReportHist(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getReportHistList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    // 点击确定并继续添加按钮
    submitContinue () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          // 不再需要,因为下拉框value已经绑定至属性而非对象
          // this.form.partProjName = this.form.partProjName.projName
          // this.form.dept = this.form.dept.deptName
          // this.form.group = this.form.group.name
          // this.form.op = this.form.op.name
          this.form.qtyAccepted = this.qtyAccepted
          this.form.ppm = this.ppm
          this.form.ftq = this.ftq
          // if (this.showReason) {
          //   this.form.rejectReason = this.form.rejectReason.reason
          // }

          addReportHist(this.form).then(response => {
            if (response.code === 200) {
              this.msgSuccess('新增成功')
              // this.open = false
              this.reset()
              this.getReportHistList()
              // this.handleAdd()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    // 取消按钮
    cancel () {
      this.open = false
      this.reset()
    },
    // 关闭对话框
    closeDialog () {
      this.reset()
    },
    setDialogWidth () {
      var val = document.body.clientWidth
      const def = 1000 // 默认宽度
      if (val < 1000) {
        this.dialogWidth = '100%'
      } else {
        this.dialogWidth = def + 'px'
      }
    },
    // 校验
    validateRejectReason (rule, value, cb) {
      if (this.showReason && !this.form.rejectReason) {
        cb(new Error('不良原因不能为空'))
      }
      cb()
    },
    // 校验合格数是否大于等于0
    validateQtyAccepted (rule, value ,cb) {
      if (this.qtyAccepted < 0) {
        cb(new Error('合格数不能小于0'))
      }
      cb()
    },
    // 计算是否显示不良原因
    calcShowReason () {
      if (this.needReason && (this.form.qtyRejected !== 0 || this.form.qtyScrapped !== 0)) {
        return true
      }
      // this.form.rejectReason = ''
      return false
    },
    // 动态添加零件
    addComponent () {
      // const index = this.form.components.length
      this.form.components.push({
        component: '',
        serialNumber: ''
      })
    },
    // 动态删除零件
    removeComponent (index) {
      this.form.components.splice(index, 1)
    },
    // 当前行改变
    handleCurrentChange (val) {
      this.currentRow = val
    }
  }
}
</script>

<style scoped>
/* .app-container .el-table--enable-row-hover .el-table__body tr:hover>td {
  background-color: #212e3e !important;
} */
.app-container ::v-deep .el-dialog__body {
  padding: 20px 25px 0 25px;
}

.app-container ::v-deep .el-dialog__header {
  padding: 15px 25px 10px 25px;
  background-color: #eee;
}

.app-container ::v-deep .el-dialog__headerbtn {
  top: 15px;
}

/* if use scoped style, need v-deep */
/* .app-container ::v-deep .el-table--enable-row-hover .el-table__body tr:hover > td {
	background-color: red;
} */

/* .app-container ::v-deep .el-dialog__footer {
  padding-left: 25px;
  padding-right: 25px;
  text-align: center;
} */

/* .el-input-number--small {
  width: 210px;
} */

/* .el-dialog {
  margin-top: 3vh !important;
} */

/* .el-dialog .el-input {
  width: 210px;
} */

/* .el-date-editor {
  width: 205px;
} */

.el-date-editor+.el-date-editor {
  margin-left: 10px;
}

.item-title {
  text-align: center;
  margin-top: 5px;
}

/* .el-table__row:hover>td {
  background: red !important;
} */

/* .el-table__body tr:hover>td{
  background-color: red !important;
}
 
.el-table__body tr.current-row>td{
  background-color: blue !important;
} */
</style>
