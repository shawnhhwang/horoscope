import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<'dark' | 'light'>('dark');

  function initTheme() {
    const saved = localStorage.getItem('celestial_theme') as 'dark' | 'light' | null;
    if (saved) {
      currentTheme.value = saved;
    } else {
      currentTheme.value = 'dark';
    }
    applyTheme();
  }

  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem('celestial_theme', currentTheme.value);
    applyTheme();
  }

  function applyTheme() {
    const root = document.documentElement;
    if (currentTheme.value === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  return {
    currentTheme,
    initTheme,
    toggleTheme,
  };
});
