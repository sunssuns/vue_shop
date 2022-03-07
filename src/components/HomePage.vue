<template>
  <el-container>
    <!-- 页面头部区域 -->
    <el-header>
      <div class="logo">
        <img src="~@/assets/heima.png" alt="" />
        <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="signout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 页面侧边栏 -->
      <el-aside width="200px" :class="{ toggleClass: isCollapse }">
        <!-- 折叠按钮 -->
        <div class="collapse-button" @click="toggle">|||</div>
        <!-- 菜单区域 -->
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#40485b"
          text-color="#fff"
          :collapse="isCollapse"
          :collapse-transition="false"
          unique-opened
          router
          :default-active="isNavState"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="'/' + menu.path"
            v-for="menu in menulist"
            :key="menu.id"
          >
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="icons[menu.id]"></i>
              <!-- 文字 -->
              <span>{{ menu.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + child.path"
              v-for="child in menu.children"
              :key="child.id"
              @click="saveNavState('/' + child.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文字 -->
                <span>{{ child.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 页面主体区 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      icons: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      isNavState: ''
    }
  },
  created() {
    this.getMenuList()
    this.isNavState = window.sessionStorage.getItem('path')
  },
  methods: {
    signout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus')
      this.menulist = res.data
    },
    toggle() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(path) {
      window.sessionStorage.setItem('path', path)
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: #40485b;
  padding-left: 0;

  .logo img {
    width: 40px;
    height: 40px;
    vertical-align: middle;
  }
  .logo span {
    color: #fff;
    margin-left: 20px;
  }
}
.el-aside {
  background-color: #40485b;
  border-right: 0;
  .el-menu {
    border-right: 0;
  }
  .collapse-button {
    font-size: 10px;
    text-align: center;
    color: #fff;
    cursor: pointer;
    background-color: #4a5064;
  }
  span {
    padding-left: 10px;
  }
}
.toggleClass {
  width: 70px !important;
}
.el-main {
  background-color: #e9edf1;
}
</style>
