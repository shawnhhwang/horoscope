import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/guide', name: 'guide', component: () => import('../views/UserManualView.vue') },
  { path: '/manual', redirect: '/guide' },
  { path: '/user-manual', redirect: '/guide' },
  { path: '/ziwei', name: 'ziwei', component: () => import('../views/ZiweiView.vue') },
  { path: '/bazi', name: 'bazi', component: () => import('../views/BaziView.vue') },
  { path: '/buncho', name: 'buncho', component: () => import('../views/BunchoView.vue') },
  { path: '/bird-divination', redirect: '/buncho' },
  { path: '/temple-poem', name: 'temple-poem', component: () => import('../views/TemplePoemView.vue'), alias: ['/temple', '/poem'] },
  { path: '/dream', name: 'dream', component: () => import('../views/DreamView.vue'), alias: ['/zhougong', '/dreams'] },
  { path: '/simulator', name: 'simulator', component: () => import('../views/LifeSimulatorView.vue'), alias: '/life-simulator' },
  { path: '/synastry', name: 'synastry', component: () => import('../views/SynastryView.vue'), alias: '/hehun' },
  { path: '/annual-planner', name: 'annual-planner', component: () => import('../views/AnnualPlannerView.vue'), alias: ['/planner', '/annual-calendar', '/calendar'] },
  { path: '/qizheng', name: 'qizheng', component: () => import('../views/QizhengView.vue') },
  { path: '/almanac', name: 'almanac', component: () => import('../views/AlmanacView.vue'), alias: '/huangli' },
  { path: '/iching', name: 'iching', component: () => import('../views/IchingView.vue'), alias: '/yijing' },
  { path: '/naming', name: 'naming', component: () => import('../views/NamingView.vue') },
  { path: '/western', name: 'western', component: () => import('../views/WesternView.vue'), alias: '/astrology' },
  { path: '/tarot', name: 'tarot', component: () => import('../views/TarotView.vue') },
  { path: '/holographic', name: 'holographic', component: () => import('../views/HolographicView.vue') },
  { path: '/vault', name: 'vault', component: () => import('../views/VaultView.vue'), alias: '/profiles' },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/',
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
