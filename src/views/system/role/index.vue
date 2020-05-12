<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" size="mini">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="queryParams.roleName"
          placeholder="请输入角色名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="角色标识" prop="roleKey">
        <el-input
          v-model="queryParams.roleKey"
          placeholder="请输入角色标识"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="角色状态"
          clearable
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>

      <el-table v-loading="loading" :data="roleList"
        highlight-current-row
        @current-change="handleCurrentChange"
        size="mini"
        border
        stripe
      >
        <el-table-column label="角色编号" prop="roleId"/>
        <el-table-column label="角色名称" prop="roleName"/>
        <el-table-column label="角色标识" prop="roleKey" />
      </el-table>
    </el-form>
  </div>
</template>

<script>
export default {
  
}
</script>

<style scoped>

</style>
