import Vue from "vue"
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export const router = new VueRouter({

  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import("./components/Ranking")
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
    },
    {
      path: '/quizz/',
      name: 'quizz',
      component: () => import("./components/Quizz")
    },
    {
      path: '/login',
      name: 'login',
      component: () => import("./components/Login")
    },
    {
      path: '/waiting',
      name: 'waiting',
      component: () => import("./components/Waiting")
    }

  ]

})
