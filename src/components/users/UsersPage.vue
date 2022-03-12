<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 输入框区域 -->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input
            clearable
            @clear="getUsersList"
            placeholder="请输入内容"
            v-model="queryInfo.query"
          >
            <el-button
              @click="searchUserInfo"
              slot="append"
              icon="el-icon-search"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"
            >添加新用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="userslist" stripe style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="username" label="姓名" width="180">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180">
        </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="stateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="warning"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-button
              type="danger"
              icon="el-icon-setting"
              size="mini"
              @click="showAllotRoles(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 6, 8]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框区域 -->
    <el-dialog
      title="添加新用户"
      :visible.sync="dialogVisible"
      width="30%"
      @close="addDialogClosed('addFormRef')"
    >
      <!-- 内容主体区域 -->
      <el-form
        label-position="left"
        label-width="80px"
        :model="addForm"
        ref="addFormRef"
        :rules="addFormRules"
      >
        <!-- 添加用户信息 -->
        <el-form-item label="用户昵称" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="mobile">
          <el-input v-model.number="addForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser('addFormRef')"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 修改用户信息对话框区域 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="30%"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="addFormRules"
        label-width="80px"
      >
        <el-form-item label="用户昵称">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="mobile">
          <el-input v-model.number="editForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="editForm.email"></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUserInfo('editFormRef')"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="提示" :visible.sync="allotRolesDialog" width="50%">
      <div>
        <p>用户名称：{{ userInfo.username }}</p>
        <p>用户角色：{{ userInfo.role_name }}</p>
        <el-select v-model="selectedRolesId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRolesDialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        // 当前的页数
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 6
      },
      // 获取的用户列表
      userslist: [],
      // 用户总数
      total: 0,
      // 控制是否显示添加用户对话框
      dialogVisible: false,
      // 保存添加用户的信息
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 校验添加用户表单的规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ],
        mobile: [
          {
            type: 'number',
            message: '请输入正确的电话号码',
            trigger: ['blur', 'change']
          }
        ],
        email: [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ]
      },
      // 控制是否编辑用户信息对话框
      editDialogVisible: false,
      // 保存要修改的用户信息
      editForm: {},
      // 控制显示分配角色对话框
      allotRolesDialog: false,
      // 分配角色的用户信息
      userInfo: {},
      // 角色列表
      rolesList: [],
      selectedRolesId: ''
    }
  },
  created() {
    this.getUsersList()
  },
  methods: {
    async getUsersList() {
      // 发送获取用户数据的请求
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userslist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    handleSizeChange(Newsize) {
      // 更新当前页面数据条数
      this.queryInfo.pagesize = Newsize
      this.getUsersList()
    },
    handleCurrentChange(Newpage) {
      // 更新当前页面页数
      this.queryInfo.pagenum = Newpage
      this.getUsersList()
    },
    async stateChange(userInfo) {
      // 发送修改用户状态的请求
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    searchUserInfo() {
      this.getUsersList()
    },
    addDialogClosed(formName) {
      // 重置清空表单
      this.$refs[formName].resetFields()
    },
    addUser(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) return this.$message.error('添加用户失败')
        // 发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        // 隐藏添加用户的对话框
        this.dialogVisible = false
        this.$message.success(res.meta.msg)
        // 重新获取用户列表数据
        this.getUsersList()
      })
    },
    showEditDialog(editInfo) {
      // 显示修改用户信息对话框
      this.editDialogVisible = true
      // 保存要修改的用户信息
      this.editForm = editInfo
    },
    updateUserInfo(formName) {
      // 修改用户信息通过表单校验后进行操作
      this.$refs[formName].validate(async (valid) => {
        // 发送修改用户信息的请求
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          {
            mobile: this.editForm.mobile,
            email: this.editForm.email
          }
        )
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getUsersList()
        this.editDialogVisible = false
        // 重置表单
        this.$refs[formName].resetFields()
      })
    },
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult === 'cancel') {
        return this.$message.error('已取消删除操作')
      }
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getUsersList()
      this.$message.success(res.meta.msg)
    },
    async showAllotRoles(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rolesList = res.data
      this.allotRolesDialog = true
    },
    async allotRoles() {
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          id: this.userInfo.id,
          rid: this.selectedRolesId
        }
      )
      console.log(res)
      if (res.meta.status !== 200) this.$message.error(res.meta.msg)
      this.allotRolesDialog = false
      this.getUsersList()
      this.$message.success(res.meta.msg)
    }
  }
}
</script>

<style lang="less" scoped></style>
