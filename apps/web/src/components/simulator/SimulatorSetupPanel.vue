<template>
  <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto shadow-cosmic mb-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-gold/15">
      <h2 class="text-sm font-bold text-gold-gradient flex items-center space-x-2">
        <span>⏳</span>
        <span>設定命主生辰 · 開啟百歲人生推演</span>
      </h2>
      <div v-if="savedProfiles.length > 0" class="flex items-center space-x-2 text-xs">
        <span class="text-dark-muted hidden sm:inline">載入命盤：</span>
        <select
          @change="$emit('loadProfile', ($event.target as HTMLSelectElement).value)"
          class="bg-black/60 dark:bg-black/60 light:bg-white border border-dark-gold/30 rounded-lg px-2.5 py-1 text-dark-text text-xs focus:border-dark-gold outline-none"
        >
          <option value="">選擇已存命盤人物...</option>
          <option v-for="p in savedProfiles" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.gender }} · {{ p.birthDatetime?.slice(0, 10) }})
          </option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
      <div>
        <label class="block text-dark-muted mb-1.5 font-bold">推演者姓名 / 稱謂</label>
        <input v-model="form.profileName" type="text" placeholder="例如：張道遠" class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none" />
      </div>
      <div>
        <label class="block text-dark-muted mb-1.5 font-bold">出生國曆年月日時</label>
        <input v-model="form.birthDate" type="datetime-local" class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none" />
      </div>
      <div>
        <label class="block text-dark-muted mb-1.5 font-bold">生理性別 (影響大運順逆)</label>
        <select v-model="form.gender" class="w-full bg-black/40 border border-dark-gold/30 rounded-xl px-3 py-2 text-dark-text text-xs focus:border-dark-gold outline-none">
          <option value="男">男 (乾造)</option>
          <option value="女">女 (坤造)</option>
        </select>
      </div>
      <div class="flex items-end">
        <button
          @click="$emit('start')"
          :disabled="loading"
          class="w-full py-2.5 rounded-xl font-bold text-xs bg-dark-gold text-dark-void hover:bg-yellow-500 transition-all shadow-cosmic cursor-pointer flex items-center justify-center"
        >
          {{ loading ? '天命推演起局中...' : '✨ 開啟百歲人生推演' }}
        </button>
      </div>
    </div>

    <!-- 80億分之一知己盲盒相遇模式設定 -->
    <div
      class="mt-4 p-4 rounded-2xl text-xs border"
      :class="form.gender === '女' ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-rose-950/20 border-rose-500/30'"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold flex items-center space-x-1.5" :class="form.gender === '女' ? 'text-indigo-300' : 'text-rose-300'">
          <span>{{ form.gender === '女' ? '💎' : '🌹' }}</span>
          <span>{{ form.gender === '女' ? '女性視角 · 80億分之一藍顏名冊 (自訂生辰與年歲對齊)' : '男性視角 · 80億分之一紅顏名冊 (自訂生辰與年歲對齊)' }}</span>
        </span>
        <span class="text-[11px] text-dark-gold font-mono">5位命中注定的相遇</span>
      </div>
      <div
        class="text-[10px] rounded-lg p-2.5 mb-3 flex items-start space-x-2 border"
        :class="form.gender === '女' ? 'text-cyan-300/90 bg-cyan-950/30 border-cyan-500/30' : 'text-amber-300/90 bg-amber-950/40 border-amber-500/30'"
      >
        <span>🔒</span>
        <span><strong>隱私與虛構提醒</strong>：本模擬所有角色與事件均為虛構演繹，請勿輸入真實第三方機敏個資；推演僅供文化探索參考。</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-[11px]">
        <div
          v-for="friend in romanceFriendsSetup"
          :key="friend.id"
          class="p-2.5 rounded-xl bg-black/50 border flex flex-col justify-between space-y-2"
          :class="form.gender === '女' ? 'border-indigo-500/30' : 'border-rose-500/30'"
        >
          <div v-if="friend.illustration" class="w-full h-20 rounded-lg overflow-hidden border relative" :class="form.gender === '女' ? 'border-indigo-500/20' : 'border-rose-500/20'">
            <img :src="friend.illustration" :alt="friend.name" width="720" height="720" loading="lazy" decoding="async" class="w-full h-full object-cover" />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold" :class="form.gender === '女' ? 'text-indigo-200' : 'text-rose-200'">{{ friend.name }}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                {{ friend.ageOffset === 0 ? '同齡' : friend.ageOffset && friend.ageOffset < 0 ? `小${Math.abs(friend.ageOffset)}歲` : `大${friend.ageOffset}歲` }}
              </span>
            </div>
            <div class="text-[10px] text-dark-muted">{{ friend.archetype }}</div>
          </div>
          <div>
            <label class="block text-[10px] mb-0.5 font-bold" :class="form.gender === '女' ? 'text-indigo-300/80' : 'text-rose-300/80'">🎂 自訂生辰</label>
            <input v-model="friend.birthDate" type="date" @change="$emit('friendBirthChange', friend)" class="w-full bg-black/60 border border-dark-gold/30 rounded px-1.5 py-1 text-[11px] outline-none font-mono" />
          </div>
          <div class="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
            <span>💖 好感 {{ friend.herAffinity }}%</span>
            <span class="text-amber-300/90">🌟 默契 {{ friend.compatibilityScore }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FemaleFriendProfile } from '@celestial/astro-core';
import type { SavedProfile } from '../../composables/useLifeSimulator.js';

defineProps<{
  form: { profileName: string; birthDate: string; gender: string };
  romanceFriendsSetup: FemaleFriendProfile[];
  savedProfiles: SavedProfile[];
  loading: boolean;
}>();

defineEmits<{
  (e: 'loadProfile', id: string): void;
  (e: 'start'): void;
  (e: 'friendBirthChange', friend: FemaleFriendProfile): void;
}>();
</script>
