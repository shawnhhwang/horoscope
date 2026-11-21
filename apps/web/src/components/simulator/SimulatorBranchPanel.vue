<template>
  <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
    <!-- What-If 平行分歧推演卡片 -->
    <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 shadow-cosmic space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-gold/15 pb-3">
        <div>
          <span class="text-[10px] font-sans uppercase tracking-[0.2em] text-dark-gold font-bold">WHAT-IF PARALLEL TIMELINE</span>
          <h2 class="text-lg font-bold text-gold-gradient">平行人生分支比較推演</h2>
        </div>
        <span class="text-xs text-dark-muted">選定關鍵分岔年齡，對比 Path A 與 Path B 至百歲的運勢落差</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label class="block text-dark-muted mb-1">分岔年齡 (歲)</label>
          <input v-model.number="whatIfForm.branchAge" type="number" min="18" max="75" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 outline-none" />
        </div>
        <div>
          <label class="block text-dark-muted mb-1">路徑 A (積極闖蕩)</label>
          <input v-model="whatIfForm.pathALabel" type="text" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 outline-none" />
        </div>
        <div>
          <label class="block text-dark-muted mb-1">路徑 B (穩健守成)</label>
          <input v-model="whatIfForm.pathBLabel" type="text" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 outline-none" />
        </div>
        <div class="flex items-end">
          <button
            @click="$emit('runWhatIf')"
            :disabled="whatIfLoading"
            class="w-full py-2 rounded-lg bg-dark-gold text-dark-void font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {{ whatIfLoading ? '分歧推演中...' : '🔀 執行雙軌推演' }}
          </button>
        </div>
      </div>

      <div v-if="whatIfResult" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div
          v-for="(branch, key) in [whatIfResult.pathA, whatIfResult.pathB]"
          :key="key"
          class="p-4 rounded-xl bg-black/40 border space-y-2 text-xs"
          :class="key === 0 ? 'border-amber-500/40' : 'border-emerald-500/40'"
        >
          <div class="font-bold text-sm" :class="key === 0 ? 'text-amber-300' : 'text-emerald-300'">
            {{ key === 0 ? 'Path A · ' : 'Path B · ' }}{{ branch.label }}
          </div>
          <div class="grid grid-cols-5 gap-1.5 text-center font-mono text-[11px]">
            <div class="p-1.5 rounded bg-black/50">❤️ {{ branch.finalAttributes.health }}</div>
            <div class="p-1.5 rounded bg-black/50">📖 {{ branch.finalAttributes.knowledge }}</div>
            <div class="p-1.5 rounded bg-black/50">🪙 {{ branch.finalAttributes.wealth }}</div>
            <div class="p-1.5 rounded bg-black/50">🌸 {{ branch.finalAttributes.relationship }}</div>
            <div class="p-1.5 rounded bg-black/50">👑 {{ branch.finalAttributes.career }}</div>
          </div>
        </div>
        <div class="md:col-span-2 p-3 rounded-xl bg-dark-gold/10 border border-dark-gold/30 text-xs text-dark-gold">
          ✨ <strong>分支結論（日主 {{ whatIfResult.dayMaster }}）：</strong>{{ whatIfResult.verdict }}
        </div>
      </div>
    </div>

    <!-- Couple 雙人共同人生模擬卡片 -->
    <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 shadow-cosmic space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-gold/15 pb-3">
        <div>
          <span class="text-[10px] font-sans uppercase tracking-[0.2em] text-dark-gold font-bold">COUPLE DESTINY TIMELINE</span>
          <h2 class="text-lg font-bold text-gold-gradient">雙人共同人生節點模擬</h2>
        </div>
        <span class="text-xs text-dark-muted">推演伴侶五階段共同流年磁場、合婚契合度與時代軌跡</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div v-for="(p, idx) in [coupleForm.person1, coupleForm.person2]" :key="idx" class="p-3.5 rounded-xl bg-black/35 border border-dark-gold/20 space-y-2">
          <div class="font-bold text-dark-gold">{{ idx === 0 ? '伴侶甲' : '伴侶乙' }}</div>
          <div class="grid grid-cols-3 gap-2">
            <input v-model="p.name" type="text" placeholder="姓名" class="px-2.5 py-1.5 rounded bg-black/50 border border-dark-gold/30 outline-none" />
            <select v-model="p.gender" class="px-2 py-1.5 rounded bg-black/50 border border-dark-gold/30 outline-none">
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
            <input v-model="p.birthDate" type="datetime-local" class="px-2 py-1.5 rounded bg-black/50 border border-dark-gold/30 outline-none text-[11px]" />
          </div>
        </div>
      </div>

      <button
        @click="$emit('runCouple')"
        :disabled="coupleLoading"
        class="px-6 py-2.5 rounded-xl bg-dark-gold text-dark-void font-bold text-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
      >
        {{ coupleLoading ? '推演共命軌跡中...' : '💑 啟動雙人共同流年推演' }}
      </button>

      <div v-if="coupleResult" class="space-y-3 pt-2 text-xs">
        <div class="p-3.5 rounded-xl bg-dark-gold/10 border border-dark-gold/30 flex flex-wrap items-center justify-between gap-2">
          <span class="font-bold text-dark-gold">合婚評級：{{ coupleResult.synastryScore }} 分 · {{ coupleResult.level }}</span>
          <span class="text-amber-300">🔑 通關守護元素：{{ coupleResult.bridgingElement }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <div v-for="m in coupleResult.milestones" :key="m.age" class="p-3 rounded-xl bg-black/40 border border-dark-gold/20 space-y-1">
            <div class="font-bold text-dark-gold">{{ m.age }}歲 ({{ m.solarYear }})</div>
            <div class="text-[11px] font-mono text-amber-300">{{ m.ganzhi }} · {{ m.era }}</div>
            <div class="text-[11px] text-dark-muted">{{ m.jointTheme }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  whatIfForm: { branchAge: number; pathALabel: string; pathBLabel: string };
  whatIfLoading: boolean;
  whatIfResult: any;
  coupleForm: {
    person1: { name: string; gender: '男' | '女'; birthDate: string };
    person2: { name: string; gender: '男' | '女'; birthDate: string };
  };
  coupleLoading: boolean;
  coupleResult: any;
}>();

defineEmits<{
  (e: 'runWhatIf'): void;
  (e: 'runCouple'): void;
}>();
</script>
