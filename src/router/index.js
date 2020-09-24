import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'
import Welcome from '../views/Welcome.vue'
import ENB from '../views/ENB.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '',
        component: Welcome
      },
      {
        path: 'enb',
        component: ENB
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
