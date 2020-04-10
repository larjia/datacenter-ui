<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="80px" size="mini">
      <el-form-item label="产品名称" prop="projName">
        <el-input
          v-model="queryParams.projName"
          clearable
          size='mini'
          @keyup.enter.native='handleQuery'
        />
      </el-form-item>
      <el-form-item label="物料编码" prop="number">
        <el-input
          v-model="queryParams.number"
          clearable
          size='mini'
          @keyup.enter.native='handleQuery'
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <!-- <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button> -->
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="!currentRow"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="!currentRow"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading='loading' :data="partList" border size='mini' 
      highlight-current-row @current-change="handleCurrentChange">
      <el-table-column label="产品名称" align="left" prop="projName" />
      <el-table-column label="编码" align="left" prop="number" />
      <el-table-column label="状态" align="left" prop="status" />
    </el-table>

    <pagination
      v-show='total > 0'
      :total='total'
      :page.sync='queryParams.pageNum'
      :limit.sync='queryParams.pageSize'
      @pagination='getList'
    />

    <!-- 新增或修改计量单位对话框 -->
    <el-dialog :title="title" :visible.sync='open' width='500px' 
      :close-on-click-modal="false" :close-on-press-escape="false" @close="closeDialog" center>
      <el-form ref="form" :model="form" :rules="rules" label-width='80px'>
        <el-form-item label="产品名称" prop="projName">
          <el-input v-model="form.projName" clearable />
        </el-form-item>
        <el-form-item label="物料编码" prop="number">
          <el-input v-model="form.number" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
import
{
  listPart,
  getPartById,
  addPart,
  updatePart,
  deletePartById
}
from '@/api/masterdata/part'

export default {
  name: 'Part',
  data () {
    return {
      // 遮罩层
      loading: true,
      // 总记录数
      total: 0,
      // 产品表格数据
      partList: [],
      // 状态Options
      statusOptions: [
        {
          value: 'Active',
          label: 'Active'
        },
        {
          value: 'N/A',
          label: 'N/A'
        }
      ],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否为新增 true: 新增 false: 修改
      isNew: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        number: undefined,
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        projName: [
          { required: true, message: '产品名称不能为空', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '产品编码不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ]
      },
      currentRow: null
    }
  },
  created () {
    this.getList()
  },
  computed () {
    
  },
  methods: {
    /** 查询产品列表 */
    getList () {
      this.loading = true
      listPart(this.queryParams).then(response => {
        this.partList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.isNew = true
      this.reset()
      this.open = true
      this.title = '新增产品'
    },
    /** 修改按钮操作 */
    handleUpdate () {
      this.isNew = false
      this.reset()
      const id = this.currentRow.id
      getPartById(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改产品'
      })
    },
    /** 删除按钮操作 */
    handleDelete () {
      const id = this.currentRow.id
      this.$confirm('是否确定删除名称为"' + this.currentRow.projName + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deletePartById(id)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    },
    /** 重置表单 */
    reset () {
      this.form = {
      }
      this.resetForm('form')
    },
    /** 点击确定按钮 */
    submit () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.isNew) {   //  新增
            addPart(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {            //  修改 
            updatePart(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
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
    /** 关闭对话框 */
    closeDialog () {
      this.reset()
    },
    /** 点击取消按钮 */
    cancel () {
      this.open = false
      this.reset()
    },
    handleCurrentChange (val) {
      this.currentRow = val
    }
  }
}
</script>

<style scoped>
.app-container ::v-deep .el-dialog__body {
  padding: 20px 25px 0 25px;
}

.app-container ::v-deep .el-dialog__header {
  padding: 15px 25px 10px 25px;
  background-color: #eee;
}

.app-container ::v-deep .el-dialog__headerBtn {
  top: 15px;
}
</style>
