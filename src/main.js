import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'
//  导入字体图标
import '@/assets/fonts/iconfont.css'
//  导入全局样式表
import '@/assets/css/global.css'
// 导入网络请求库
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use((config) => {
  config.headers.authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

Vue.filter('timeFilter', function (time) {
  //  返回处理后的值
  const date = new Date(time)

  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 月份是从0开始的
  const day = date.getDate()
  const hour = date.getHours()
  const min = date.getMinutes()
  const sec = date.getSeconds()
  const preArr = Array.apply(null, Array(10)).map(function (elem, index) {
    return '0' + index
  })

  const newTime =
    year +
    '-' +
    (preArr[month] || month) +
    '-' +
    (preArr[day] || day) +
    ' ' +
    (preArr[hour] || hour) +
    ':' +
    (preArr[min] || min) +
    ':' +
    (preArr[sec] || sec)

  return newTime
})

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
