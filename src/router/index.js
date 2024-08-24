import { createRouter, createWebHistory } from 'vue-router'
import BabyDance from '../views/BabyDance.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'BabyDance',
      component: BabyDance
    }
  ]
})

export default router
