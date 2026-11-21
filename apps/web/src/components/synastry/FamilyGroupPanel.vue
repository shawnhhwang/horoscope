<template>
  <div class="space-y-8 animate-fade-in">
    <!-- 成員設定與群組輸入卡片 -->
    <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto shadow-cosmic">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-gold/15">
        <div>
          <h2 class="text-sm font-bold text-gold-gradient flex items-center space-x-2">
            <span>👨‍👩‍👧‍👦</span>
            <span>設定家庭成員名單 (2 ~ 8 位成員)</span>
          </h2>
          <p class="text-xs text-dark-muted mt-0.5">可自訂家庭標題，並逐一配置家人之姓名、角色與出生時間</p>
        </div>
        <button
          v-if="savedProfiles.length >= 2"
          @click="$emit('importAll')"
          class="px-3 py-1.5 rounded-full text-xs font-serif bg-dark-gold/15 hover:bg-dark-gold/25 text-dark-gold border border-dark-gold/40 transition-colors"
        >
          📥 一鍵匯入已存檔案 ({{ savedProfiles.length }}位)
        </button>
      </div>

      <div class="mb-5 max-w-xs">
        <label class="block text-[11px] text-dark-muted mb-1">家庭群組稱謂</label>
        <input
          v-model="familyForm.familyTitle"
          type="text"
          placeholder="例如：建華幸福之家"
          class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none"
        />
      </div>

      <div class="space-y-3 mb-6">
        <div
          v-for="(member, idx) in familyForm.members"
          :key="idx"
          class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 flex flex-col md:flex-row items-center gap-3"
        >
          <span class="text-xs font-mono text-dark-gold font-bold w-6">#{{ idx + 1 }}</span>
          <div class="w-full md:w-32">
            <input v-model="member.name" type="text" placeholder="成員姓名" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none" />
          </div>
          <div class="w-full md:w-28">
            <select v-model="member.role" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none">
              <option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="w-full md:w-24">
            <select v-model="member.gender" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none">
              <option value="男">男 (乾)</option>
              <option value="女">女 (坤)</option>
            </select>
          </div>
          <div class="w-full md:flex-1">
            <input v-model="member.birthDate" type="datetime-local" class="w-full px-3 py-2 rounded-lg bg-black/40 border border-dark-gold/30 text-xs focus:border-dark-gold outline-none" />
          </div>
          <button
            v-if="familyForm.members.length > 2"
            @click="$emit('removeMember', idx)"
            class="text-rose-400 hover:text-rose-300 p-2 text-xs font-sans transition-colors cursor-pointer"
            title="移除此成員"
          >
            ✕ 移除
          </button>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          @click="$emit('addMember')"
          :disabled="familyForm.members.length >= 8"
          class="px-4 py-2 rounded-xl text-xs font-serif border border-dashed border-dark-gold/50 text-dark-gold hover:bg-dark-gold/10 transition-colors cursor-pointer disabled:opacity-40"
        >
          + 增加一位家庭成員 (上限 8 位)
        </button>
        <button
          @click="$emit('calculate')"
          :disabled="loadingFamily"
          class="w-full sm:w-auto px-8 py-3 rounded-xl font-serif text-xs font-bold bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all disabled:opacity-50 cursor-pointer"
        >
          {{ loadingFamily ? '家庭氣場推演中...' : '推演家庭群盤 ⚡' }}
        </button>
      </div>
    </div>

    <!-- 家庭群盤結果展示 -->
    <div v-if="familyResult" ref="familyPosterRef" class="space-y-8 animate-fade-in">
      <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-dark-gold/20">
          <div>
            <span class="text-xs text-dark-gold uppercase font-serif tracking-wider">HOUSEHOLD FIVE ELEMENTS AURA · {{ familyResult.memberCount }} MEMBERS</span>
            <h3 class="text-2xl font-bold text-gold-gradient mt-1">{{ familyResult.householdAura.auraTitle }}</h3>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 font-bold">
              主導：{{ familyResult.householdAura.dominantElement }}氣
            </span>
            <span class="text-xs px-2.5 py-1 rounded bg-rose-950/70 border border-rose-500/30 text-rose-300 font-bold">
              缺失：{{ familyResult.householdAura.lackingElement }}氣
            </span>
          </div>
        </div>
        <p class="text-xs text-dark-text leading-relaxed mb-6">{{ familyResult.householdAura.description }}</p>

        <div class="space-y-2">
          <span class="text-[11px] text-dark-gold font-bold block mb-1">全家平均五行分布比例：</span>
          <div class="grid grid-cols-5 gap-2 text-center text-xs">
            <div class="p-2 rounded bg-black/40 border border-emerald-500/30">
              <span class="text-emerald-400 font-bold block">木</span>
              <span class="text-dark-muted font-mono">{{ familyResult.householdAura.elementBreakdown.wood }}%</span>
            </div>
            <div class="p-2 rounded bg-black/40 border border-rose-500/30">
              <span class="text-rose-400 font-bold block">火</span>
              <span class="text-dark-muted font-mono">{{ familyResult.householdAura.elementBreakdown.fire }}%</span>
            </div>
            <div class="p-2 rounded bg-black/40 border border-amber-500/30">
              <span class="text-amber-400 font-bold block">土</span>
              <span class="text-dark-muted font-mono">{{ familyResult.householdAura.elementBreakdown.earth }}%</span>
            </div>
            <div class="p-2 rounded bg-black/40 border border-slate-300/30">
              <span class="text-slate-300 font-bold block">金</span>
              <span class="text-dark-muted font-mono">{{ familyResult.householdAura.elementBreakdown.metal }}%</span>
            </div>
            <div class="p-2 rounded bg-black/40 border border-cyan-500/30">
              <span class="text-cyan-400 font-bold block">水</span>
              <span class="text-dark-muted font-mono">{{ familyResult.householdAura.elementBreakdown.water }}%</span>
            </div>
          </div>
        </div>

        <div class="mt-6 p-3.5 rounded-xl bg-black/30 border border-dark-gold/15 text-xs text-dark-muted leading-relaxed">
          🌿 <strong>居家環境調和建言：</strong>{{ familyResult.householdAura.homeEnvironmentAdvice }}
        </div>
      </div>

      <!-- 家庭核心角色與人際動態矩陣 -->
      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto">
        <h3 class="text-sm font-bold text-gold-gradient mb-4">家庭天然角色定位與優勢互補</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div v-for="role in familyResult.familyRoles" :key="role.roleCategory" class="p-4 rounded-xl bg-black/30 border border-dark-gold/20 flex flex-col justify-between">
            <div>
              <span class="font-bold text-amber-300 block mb-1">{{ role.roleCategory }}</span>
              <div class="space-y-1 my-2">
                <span v-for="m in role.membersAssigned" :key="m" class="inline-block px-2 py-0.5 rounded bg-dark-gold/10 text-dark-gold border border-dark-gold/20 mr-1 mb-1">
                  {{ m }}
                </span>
              </div>
            </div>
            <p class="text-[11px] text-dark-muted leading-relaxed mt-2 pt-2 border-t border-dark-gold/10">{{ role.description }}</p>
          </div>
        </div>
      </div>

      <div class="glass-panel rounded-2xl p-6 border border-dark-gold/30 max-w-4xl mx-auto">
        <h3 class="text-sm font-bold text-gold-gradient mb-3">成員兩兩互動動態關係矩陣 ({{ familyResult.crossMatrix.length }}組關係)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div v-for="(pair, idx) in familyResult.crossMatrix" :key="idx" class="p-4 rounded-xl bg-black/30 border border-dark-gold/15 hover:border-dark-gold/40 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-dark-text">{{ pair.fromName }} ({{ pair.fromRole }}) ↔ {{ pair.toName }} ({{ pair.toRole }})</span>
              <span class="px-2 py-0.5 rounded text-[10px] bg-dark-gold/20 text-dark-gold border border-dark-gold/30 font-bold">
                {{ pair.relationType }} ({{ pair.score }}分)
              </span>
            </div>
            <p class="text-dark-muted text-[11px] leading-relaxed">{{ pair.description }}</p>
          </div>
        </div>
      </div>

      <!-- 《周易》後天八卦空間名位相等配置 -->
      <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/35 shadow-cosmic max-w-4xl mx-auto space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-dark-gold/20">
          <div>
            <span class="text-[10px] uppercase tracking-wider text-dark-gold">TIANJI BAGUA HOUSEHOLD POSITIONING</span>
            <h3 class="text-base font-bold text-gold-gradient">⊞ 《周易》後天八卦空間名位相等配置</h3>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-dark-gold/15 border border-dark-gold/35 text-dark-gold font-bold self-start sm:self-auto">
            「名位相等則大吉 · 命同人不同在於位置」
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div v-for="m in familyResult.members" :key="m.id" class="p-4 rounded-xl bg-black/35 border border-dark-gold/25 space-y-2">
            <div class="flex items-center justify-between border-b border-dark-gold/15 pb-1.5">
              <div>
                <span class="font-bold text-dark-text text-sm">{{ m.name }}</span>
                <span class="ml-1.5 px-2 py-0.5 rounded text-[10px] bg-dark-gold/20 text-dark-gold border border-dark-gold/30 font-semibold">{{ m.role }}</span>
              </div>
              <span v-if="m.baguaPosition" class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {{ m.baguaPosition.trigram }} · {{ m.baguaPosition.direction }}
              </span>
            </div>
            <p v-if="m.ziweiFamilyPalaceNote" class="text-[11px] text-cyan-300/90 leading-relaxed">✦ <strong>紫微六親與命主：</strong>{{ m.ziweiFamilyPalaceNote }}</p>
            <div v-if="m.baguaPosition" class="space-y-1.5 text-[11px] leading-relaxed">
              <p class="text-dark-text"><span class="text-dark-gold font-semibold">【{{ m.baguaPosition.roleTitle }}】名位法則：</span>{{ m.baguaPosition.niMingWeiRule }}</p>
              <p class="text-rose-300/90 bg-rose-950/20 border border-rose-500/20 rounded-lg p-2">⚠️ <strong>陽宅越位與錯位警示：</strong>{{ m.baguaPosition.tabooWarning }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 家族和睦調適指南、分享海報與存檔 -->
      <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-gold/30 max-w-4xl mx-auto space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-dark-gold/15">
          <h3 class="text-sm font-bold text-gold-gradient">家族和睦調適心法</h3>
          <div class="flex flex-wrap items-center gap-2">
            <SharePosterButton :target-ref="familyPosterRef" :filename="`family-${familyResult.familyTitle}`" label="下載家庭群盤海報" />
            <button @click="$emit('save')" class="px-4 py-2 rounded-lg font-serif text-xs font-semibold border border-dark-gold/40 text-dark-gold hover:bg-dark-gold/15 transition-all cursor-pointer shadow-cosmic">
              儲存家庭群盤至占卜日記 📖
            </button>
          </div>
        </div>
        <div class="space-y-3 text-xs leading-relaxed">
          <div v-for="(guide, idx) in familyResult.harmonyGuidelines" :key="idx" class="p-4 rounded-xl bg-black/30 border border-dark-gold/15">
            <span class="font-bold text-dark-gold block mb-1">✦ {{ guide.title }}</span>
            <p class="text-dark-muted">{{ guide.advice }}</p>
          </div>
        </div>
      </div>

      <InPageAiAnalysis
        module-type="FAMILY_GROUP"
        :title="`家庭群盤 (${familyResult.familyTitle})`"
        :summary="`成員: ${familyResult.memberCount}位 · 主氣場: ${familyResult.householdAura.dominantElement} · 匱乏: ${familyResult.householdAura.lackingElement}`"
        :raw-data="familyResult"
        :prompt="familyAiPrompt"
        button-text="✨ 啟動 AI 家族命理與家庭動力系統深度全盤詳批"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FamilyGroupResult } from '@celestial/astro-core';
import InPageAiAnalysis from '../ai/InPageAiAnalysis.vue';
import SharePosterButton from '../common/SharePosterButton.vue';

defineProps<{
  savedProfiles: any[];
  familyForm: { familyTitle: string; members: Array<{ name: string; role: string; gender: '男' | '女'; birthDate: string }> };
  familyResult: FamilyGroupResult | null;
  loadingFamily: boolean;
  familyAiPrompt: string;
}>();

defineEmits<{
  (e: 'importAll'): void;
  (e: 'addMember'): void;
  (e: 'removeMember', idx: number): void;
  (e: 'calculate'): void;
  (e: 'save'): void;
}>();

const familyPosterRef = ref<HTMLElement | null>(null);
const roleOptions = ['父親', '母親', '長子', '次子', '長女', '次女', '祖父', '祖母', '長輩', '伴侶', '家庭成員'];
</script>
