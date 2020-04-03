<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true">
      <el-form-item label="工序名称">
        <el-input
          v-model="queryParams.opName"
          placeholder='请输入工序名称'
          clearable
          size="small"
          @keyup.enter.native='handleQuery'
        />
      </el-form-item>
      <el-form-item label="班组">
        <el-select v-model="queryParams.groupId" placeholder="班组" clearable size="small">
          <el-option
            v-for="group in groupOptions"
            :key="group.id"
            :label="group.name"
            :value="group.id"
          />
        </el-select>
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

    <!-- 数据表格 -->
    <el-table
      v-loading='loading'
      :data='opList'
      row-key="opId"
      default-expand-all
      border
      size='small'
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="group.dept.deptName" label="车间"></el-table-column>
      <el-table-column prop="group.name" label="班组"></el-table-column>
      <el-table-column prop="name" label="工序名称"></el-table-column>
      <!-- <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column> -->
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
            v-if="scope.row.parentId != 0"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改生产工序对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!-- 车间 -->
        <el-col :span="24">
          <el-form-item label="车间">
            <treeselect :options="deptOptions" :normalizer="normalizer" placeholder="选择所属车间" />
          </el-form-item>
        </el-col>
        <!-- 班组 -->
        <el-col :span="24">
          <el-form-item label="班组" prop="groupId">
            <el-select v-model="form.groupId" placeholder="班组" clearable size="small">
              <el-option
                v-for="group in groupOptions"
                :key="group.id"
                :label="group.name"
                :value="group.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 工序 -->
        <el-col :span="24">
          <el-form-item label="工序" prop="name">
            <el-input v-model="form.name" placeholder="请输入工序名称" />
          </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOperation, getOperation, addOperation, updateOperation, delOperation } from '@/api/production/shopfloor/operation/operation'
import { listGroup } from '@/api/production/shopfloor/group/group'
import { listDept } from '@/api/system/dept'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: 'ShopFloorOperation',
  components: { Treeselect },
  data () {
    return {
      // 遮罩层
      loading: true,
      // 表格数据
      opList: [],
      // 班组选项
      groupOptions: [],
      // 车间选项
      deptOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        opName: undefined,
        groupId: undefined
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
    this.getGroupList()
    this.getOpList()
  },
  methods: {
    // 查询工序列表
    getOpList () {
      this.loading = true
      listOperation(this.queryParams).then(response => {
        this.opList = response.rows
        this.loading = false
      })
    },
    // 查询班组下拉树结构
    getGroupList () {
      listGroup().then(response => {
        this.groupOptions = response.rows
      })
    },
    // 查询车间下拉树结构
    getDeptTreeList () {
      listDept().then(response => {
        this.deptOptions = this.handleTree(response.data, 'deptId')
      })
    },
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
    // 取消按钮
    cancel () {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset () {
      this.form = {
        name: undefined,
        groupId: undefined
      }
      this.resetForm('form')
    },
    // 搜索按钮操作
    handleQuery () {
      this.getOpList()
    },
    // 新增按钮操作
    handleAdd () {
      this.reset()
      this.getDeptTreeList()
      // this.getGroupList()
      this.open = true
      this.title = '添加工序'
    },
    // 修改按钮操作
    handleUpdate (row) {
      this.reset()
      this.getDeptTreeList()
      getOperation(row.id).then(response => {
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
            updateOperation(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('修改成功')
                this.open = false
                this.getOpList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else { // 新增
            addOperation(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.open = false
                this.getOpList()
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
        return delOperation(row.id)
      }).then(() => {
        this.getOpList()
        this.msgSuccess('删除成功')
      }).catch(function() {})
    }
  }
}
</script>

<style scoped>

</style>
