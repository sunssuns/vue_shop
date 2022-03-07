import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from '@/components/LoginPage.vue'
import HomePage from '@/components/HomePage.vue'
import WelcomePage from '@/components/WelcomePage.vue'
import UsersPage from '@/components/users/UsersPage.vue'
import RightsPage from '@/components/rights/RightsPage.vue'
import RolesPage from '@/components/rights/RolesPage.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  {
    path: '/home',
    component: HomePage,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: WelcomePage
      },
      {
        path: '/users',
        component: UsersPage
      },
      {
        path: '/roles',
        component: RolesPage
      },
      {
        path: '/rights',
        component: RightsPage
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
