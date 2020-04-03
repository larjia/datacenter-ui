<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="班组名称">
        <el-input
          v-model="queryParams.name"
          placeholder='请输入班组名称'
          clearable
          @keyup.enter.native='handleQuery'
        />
      </el-form-item>
      <el-form-item label="所属车间">
        <treeselect v-model='queryParams.deptId' :options="deptOptions" :normalizer='normalizer' placeholder='选择所属车间' style="width:300px;"/>
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
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="groupList"
      row-key="id"
      default-expand-all
      border
      size='small'
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="dept.deptName"  label="车间"></el-table-column>
      <el-table-column prop="name" label="班组名称"></el-table-column>
      <!-- <el-table-column prop="orderNum" label="排序" width="200"></el-table-column> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
          >新增</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改生产车间班组对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-col :span="24">
          <el-form-item label="车间" prop="deptId">
            <treeselect v-model="form.deptId" :options="deptOptions" :normalizer='normalizer' placeholder="选择所属车间" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="班组" prop="name">
            <el-input v-model="form.name" placeholder="请输入班组名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="显示排序" prop="orderNum">
            <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
          </el-form-item>
        </el-col> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listGroup, getGroup, addGroup, updateGroup, delGroup } from '@/api/production/shopfloor/group/group'
import { listDept } from '@/api/system/dept'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: 'ShopFloorGroup',
  components: { Treeselect },
  data () {
    return {
      // 遮罩层
      loading: true,
      // 表格树数据
      groupList: [],
      // 部门树选项
      deptOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        name: undefined,
        deptId: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        // TODO 添加表单验证规则
      }
    }
  },
  created () {
    this.getTreeselect()
    this.getList()
  },
  methods: {
    // 查询班组列表
    getList () {
      this.loading = true
      listGroup(this.queryParams).then(response => {
        this.groupList = response.rows
        this.loading = false
      })
    },
    // 转换部门数据结构
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      }
    },
    // 查询部门下拉树结构
    getTreeselect () {
      listDept().then(response => {
        this.deptOptions = this.handleTree(response.data, 'deptId')
      })
    },
    // 取消按钮
    cancel () {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset () {
      this.form = {
        deptId: undefined,
        name: undefined
        // orderNum: undefined
      }
      this.resetForm('form')
    },
    // 搜索按钮操作
    handleQuery () {
      this.getList()
    },
    // 新增按钮操作
    handleAdd () {
      this.reset()
      this.getTreeselect()
      this.open = true
      this.title = '添加部门'
    },
    // 修改按钮操作
    handleUpdate (row) {
      this.reset()
      this.getTreeselect()
      getGroup(row.id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改部门'
      })
    },
    // 提交按钮
    submitForm () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) { // 修改
            updateGroup(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else { // 新增
            addGroup(this.form).then(response => {
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
    // 删除按钮操作
    handleDelete (row) {
      this.$confirm('是否确认删除名称为"' + row.name + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return delGroup(row.id)
      }).then(() => {
        this.getList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    }
  }
}
</script>

<style scoped>
</style>
