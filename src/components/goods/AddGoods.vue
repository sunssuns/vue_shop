<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :active="active" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单区域 -->
      <el-form :model="addGoodsForm" :rules="addGoodsRules" ref="addGoodsRef">
        <!-- 标签页区域 -->
        <el-tabs
          tab-position="left"
          v-model="activeName"
          :before-leave="handleBeforeLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器区域 -->
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="cateListProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyTabeData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  :label="cb"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :headers="header"
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button
              class="addBtn"
              type="primary"
              @click="addGoods('addGoodsRef')"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="预览图片" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 标签页、步骤条状态值
      activeName: '0',
      // 表单填写值
      addGoodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品分类所属数组
        goods_cat: [],
        // 上传的图片临时路径（对象）
        pics: [],
        // 商品介绍
        goods_introduce: ''
      },
      // 表单验证对象
      addGoodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          {
            type: 'array',
            required: true,
            message: '请输入商品分类',
            trigger: 'change'
          }
        ]
      },
      // 商品分类列表数据
      cateList: [],
      // 级联选择器数据配置
      cateListProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 商品参数
      manyTabeData: [],
      // 商品属性
      onlyTableData: [],
      // 图片上传路径
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传请求头
      header: {
        authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片路径
      previewPath: '',
      // 控制显示预览图片
      previewVisible: false
    }
  },
  computed: {
    active() {
      return Number(this.activeName)
    },
    selectedKeys() {
      return this.addGoodsForm.goods_cat
    },
    cateId() {
      return this.addGoodsForm.goods_cat[2]
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      //   console.log(res)
      this.cateList = res.data
    },
    // 选择商品分类后对应的处理函数
    handleChange() {
      // console.log(this.addGoodsForm.goods_cat)
    },
    // Tags切换标签之前的处理函数
    handleBeforeLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.selectedKeys.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // tab被选中时触发的函数
    async tabClick() {
      // 选中第二项
      if (this.activeName === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败')
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTabeData = res.data
      } else if (this.activeName === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败')
        }
        this.onlyTableData = res.data
      }
    },
    // 点击文件列表中已上传的文件时的钩子
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 文件列表移除文件时的钩子
    handleRemove(file) {
      // 获取图片文件临时存储路径
      const filepath = file.response.data.tmp_path
      // 找到临时存储路径的索引值
      const index = this.addGoodsForm.pics.findIndex(
        (x) => x.tmp_path === filepath
      )
      // 删除 addGoodsForm.pics 中已被删除的路径值
      this.addGoodsForm.pics.splice(index, 1)
      // console.log(this.addGoodsForm.pics)
    },
    // 文件上传成功时的钩子
    handleSuccess(response) {
      if (response.meta.status !== 200) {
        this.$message.error('图片上传失败')
      }

      const pic = { pic: response.data.tmp_path }

      this.addGoodsForm.pics.push(pic)
      // console.log(this.addGoodsForm)
    },
    // 添加商品
    addGoods(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (!valid) {
          this.$message.error('请将基本信息填写完整！')
        }
        const form = _.cloneDeep(this.addGoodsForm)
        form.goods_cat = form.goods_cat.join(',')
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          console.log(res)
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('goods')
      })
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-form-item {
  margin: 20px 0;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.el-dialog img {
  width: 100%;
  height: 100%;
}
.addBtn {
  margin-top: 6px;
  margin-left: 48%;
}
</style>
