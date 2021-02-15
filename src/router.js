import Vue from "vue"
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export const router = new VueRouter({

  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import("./components/Main")
    },
    {
      path: '/tournaments/:id',
      name: 'tournament',
      component: () => import("./components/Tournament")
    },
    {
      path: '/players/:id',
      name: 'player',
      component: () => import("./components/Player")
    }

  ]

})
