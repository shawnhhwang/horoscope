import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import InterpretationsView from '../views/InterpretationsView.vue';
import UsersView from '../views/UsersView.vue';
import LlmSettingsView from '../views/LlmSettingsView.vue';

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
  { path: '/interpretations', name: 'interpretations', component: InterpretationsView },
  { path: '/users', name: 'users', component: UsersView },
  { path: '/llm-settings', name: 'llm-settings', component: LlmSettingsView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('admin_token');
  if (to.name !== 'login' && !token) {
    next({ name: 'login' });
  } else {
    next();
  }
});
