import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ZiweiView from '../views/ZiweiView.vue';
import BaziView from '../views/BaziView.vue';
import IchingView from '../views/IchingView.vue';
import NamingView from '../views/NamingView.vue';
import WesternView from '../views/WesternView.vue';
import TarotView from '../views/TarotView.vue';
import VaultView from '../views/VaultView.vue';
import QizhengView from '../views/QizhengView.vue';
import AlmanacView from '../views/AlmanacView.vue';
import SynastryView from '../views/SynastryView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/ziwei', name: 'ziwei', component: ZiweiView },
  { path: '/bazi', name: 'bazi', component: BaziView },
  { path: '/synastry', name: 'synastry', component: SynastryView },
  { path: '/qizheng', name: 'qizheng', component: QizhengView },
  { path: '/almanac', name: 'almanac', component: AlmanacView },
  { path: '/iching', name: 'iching', component: IchingView },
  { path: '/naming', name: 'naming', component: NamingView },
  { path: '/western', name: 'western', component: WesternView },
  { path: '/tarot', name: 'tarot', component: TarotView },
  { path: '/vault', name: 'vault', component: VaultView },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('../views/admin/DashboardView.vue') },
      { path: 'interpretations', name: 'admin-interpretations', component: () => import('../views/admin/InterpretationsView.vue') },
      { path: 'users', name: 'admin-users', component: () => import('../views/admin/UsersView.vue') },
      { path: 'database', name: 'admin-database', component: () => import('../views/admin/DatabaseView.vue') },
      { path: 'llm-settings', name: 'admin-llm-settings', component: () => import('../views/admin/LlmSettingsView.vue') },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
