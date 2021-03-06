<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" size="mini" label-width="80px">
      <el-row>
        <el-form-item label="字典名称" prop="dictType">
          <el-select v-model="queryParams.dictType" size="mini">
            <el-option
              v-for="item in typeOptions"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictType"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input
            v-model="queryParams.dictLabel"
            clearable
            size="mini"
            placeholder="请输入字典标签"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="数据状态" clearable size="mini">
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
          <el-button type="success" icon="el-icon-edit" size="mini" 
            :disabled="!isSelected"
            @click="handleUpdate"
          >修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" 
            :disabled="!isSelected"
            @click="handleDelete"
          >删除</el-button>
        </el-form-item>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="dataList" 
      highlight-current-row
      border
      stripe
      size="mini"
      @current-change="handleCurrentChange"
    >
      <el-table-column label="字典编码" align="center" prop="dictCode" />
      <el-table-column label="字典标签" align="center" prop="dictLabel" />
      <el-table-column label="字典键值" align="center" prop="dictValue" />
      <el-table-column label="字典排序" align="center" prop="dictSort" />
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listData, getData, delData, addData, updateData, exportData } from '@/api/system/dict/data'
import { listType, getType } from '@/api/system/dict/type'

export default {
  name: 'Data',
  data () {
    return {
      // 遮罩层
      loading: true,
      // 总记录数
      total: 0,
      // 字典表格数据
      dataList: [],
      // 默认字典类型,根据路由地址获取
      defaultDictType: '',
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 类型字典数据
      typeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dictLabel: [
          { required: true, message: '字典数据标签不能为空', trigger: 'blur' }
        ],
        dictValue: [
          { required: true, message: '字典数据键值不能为空', trigger: 'blur' }
        ],
        dictSort: [
          { required: true, message: '字典数据顺序不能为空', trigger: 'blur' }
        ]
      },
      // 当前行
      currentRow: null
    }
  },
  computed: {
    isSelected () {
      return (this.currentRow == null) ? false : true
    }
  },
  created () {
    // 通过路由地址获取dictId
    const dictId = this.$route.params && this.$route.params.dictId
    this.getType(dictId)
    this.getTypeList()
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询字典类型详细 */
    getType (dictId) {
      getType(dictId).then(response => {
        this.queryParams.dictType = response.data.dictType
        this.defaultDictType = response.data.dictType
        this.getList()
      })
    },
    /** 查询字典类型列表 */
    getTypeList () {
      listType().then(response => {
        this.typeOptions = response.rows
      })
    },
    /** 查询字典数据列表 */
    getList () {
      this.loading = true
      // 清空当前行
      this.currentRow = null
      listData(this.queryParams).then(response => {
        this.dataList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 数据状态字典翻译
    statusFormat (row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 取消按钮
    cancel () {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset () {
      this.form = {
        dictCode: undefined,
        dictLabel: undefined,
        dictValue: undefined,
        dictSort: 0,
        status: '0',
        remark: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮 */
    handleQuery () {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮 */
    resetQuery () {
      this.resetForm("queryForm")
      this.queryParams.dictType = this.defaultDictType
      this.handleQuery()
    },
    /** 新增按钮 */
    handleAdd () {
      this.reset()
      this.open = true
      this.title = '添加字典数据'
      this.form.dictType = this.queryParams.dictType
    },
    /** 修改按钮操作 */
    handleUpdate () {
      this.reset()
      const dictCode = this.currentRow.dictCode
      getData(dictCode).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改字典数据'
      })
    },
    /** 删除按钮 */
    handleDelete () {
      const dictCode = this.currentRow.dictCode
      const dictLabel = this.currentRow.dictLabel
      this.$confirm('是否确定删除"' + dictLabel + '"字典编码?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        return delData(dictCode)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    },
    /** 提交按钮 */
    submit () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.dictCode != undefined) {  // 修改
            updateData(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {                                // 新增
            addData(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 当前行更改 */
    handleCurrentChange (val) {
      this.currentRow = val
    }
  }
}
</script>

<style scoped>

</style>
