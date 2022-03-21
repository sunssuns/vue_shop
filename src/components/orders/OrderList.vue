<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @blur="getOrderList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据展示区域 -->
      <el-table
        :data="orderList"
        height="360"
        border
        style="width: 100%"
        stripe
      >
        <el-table-column type="index" width="50"></el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80">
        </el-table-column>
        <el-table-column label="是否付款" width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status == 1" type="success"
              >已付款</el-tag
            >
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80">
        </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | timeFilter }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialogVisible = true"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-map-location"
              size="mini"
              @click="showLogistics"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      @close="editDialogClosed('editAddressRef')"
      width="50%"
    >
      <el-form
        :model="editAddressForm"
        :rules="editAddressRules"
        ref="editAddressRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="editAddressForm.address1"
            :options="citydata"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input
            v-model="editAddressForm.address2"
          ></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 查看物流对话框 -->
    <el-dialog title="物流信息" :visible.sync="viewLogisticsDialog" width="50%">
      <!-- 时间线 -->
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in logisticsList"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="viewLogisticsDialog = false">取 消</el-button>
        <el-button type="primary" @click="viewLogisticsDialog = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 保存订单列表数据
      orderList: [],
      total: 0,
      // 修改地址信息
      editAddressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址信息的表单验证规则
      editAddressRules: {
        address1: [
          { required: true, message: '请输入省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 控制显示修改地址对话框
      editDialogVisible: false,
      citydata,
      // 控制显示查看物流信息对话框
      viewLogisticsDialog: false,
      logisticsList: [],
      reverse: false
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单管理列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表数据失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
      // console.log(this.orderList)
    },
    // 当页订单条数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 当页页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    editDialogClosed(formName) {
      this.$refs[formName].resetFields()
    },
    // 查看物流信息
    async showLogistics() {
      this.viewLogisticsDialog = true
      const { data: res } = await this.$http.get('/kuaidi/YT5841021373178')
      if (res.meta.status !== 200) {
        this.$message.error('获取物流信息失败')
      }
      this.logisticsList = res.data
      // console.log(res.data)
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
