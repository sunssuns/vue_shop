import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from '@/components/LoginPage.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/loginPage' },
  { path: '/loginPage', component: LoginPage }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
