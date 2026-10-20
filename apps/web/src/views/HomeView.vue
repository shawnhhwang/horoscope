<template>
  <div class="relative min-h-screen pt-28">
    <!-- 英雄區 (Hero Section) 結合 3D 渾天星盤 -->
    <section class="relative max-w-7xl mx-auto px-6 pt-12 pb-20 flex flex-col items-center text-center">
      <!-- 徽章標籤 -->
      <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-dark-gold/30 bg-dark-gold/5 backdrop-blur-md mb-8 shadow-cosmic">
        <span class="w-2 h-2 rounded-full bg-dark-gold animate-pulse"></span>
        <span class="text-xs uppercase tracking-[0.25em] font-serif text-dark-gold">AWWWARDS & FWA 精品級星象數位殿堂</span>
      </div>

      <!-- 宏大標題 -->
      <h1 class="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
        <span class="block text-gold-gradient">萬象天儀 · 乾坤天衍</span>
        <span class="block text-2xl sm:text-4xl lg:text-5xl font-normal mt-2 opacity-90">
          東西方雙軌星象與命理系統
        </span>
      </h1>

      <p class="max-w-2xl text-sm sm:text-base text-dark-muted font-sans leading-relaxed mb-8">
        融匯東方干支命理（紫微斗數、四柱八字、周易文王六爻、易經姓名學）與西方占星神秘學（本命星盤、月相原型、78張韋特塔羅）。透過現代 WebGL 渾天儀與精密天文真太陽時校準，探尋命運流轉的永恆幾何。
      </p>

      <!-- 快速入口按鈕 -->
      <div class="flex flex-wrap items-center justify-center gap-4 mb-8">
        <router-link
          to="/ziwei"
          class="px-8 py-3.5 rounded-full font-serif text-sm font-semibold tracking-wider bg-dark-gold text-dark-void hover:opacity-90 shadow-cosmic transition-all transform hover:-translate-y-0.5"
        >
          探索紫微斗數
        </router-link>
        <router-link
          to="/tarot"
          class="px-8 py-3.5 rounded-full font-serif text-sm font-semibold tracking-wider glass-panel border border-dark-gold/40 text-dark-gold hover:border-dark-gold transition-all transform hover:-translate-y-0.5"
        >
          開啟 3D 塔羅占卜
        </router-link>
      </div>

      <!-- 3D 渾天星盤互動元件 -->
      <div class="w-full max-w-4xl relative">
        <ArmillarySphere />
      </div>
    </section>

    <!-- 六大核心命理與占星模組矩陣 -->
    <section class="max-w-7xl mx-auto px-6 py-20 border-t border-dark-gold/15">
      <div class="text-center mb-16">
        <h2 class="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
          八大東方玄學與西方神秘學體系
        </h2>
        <p class="text-sm text-dark-muted">嚴謹數學模型 · 完整古籍斷語 · 實體擬真星圖 · 現代智能白話解析</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- 1. 七政四餘 (新增) -->
        <router-link to="/qizheng" class="group glass-panel rounded-2xl p-6 hover:border-dark-gold transition-all duration-300 hover:shadow-cosmic relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="text-xs font-serif text-dark-gold tracking-widest uppercase mb-2">IMPERIAL ASTROLOGY</div>
            <h3 class="font-serif text-xl font-bold mb-2 group-hover:text-dark-gold transition-colors">七政四餘天星盤</h3>
            <p class="text-xs text-dark-muted leading-relaxed mb-4">
              果老星宗正統，推算日月五星與羅計氣孛，結合二十八宿度數、十二辰次與恩難用仇四星吉凶。
            </p>
          </div>
          <div class="flex items-center text-xs font-serif text-dark-gold pt-2 border-t border-dark-gold/15">
            <span>推演七政星盤</span>
            <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </router-link>

        <!-- 2. 每日黃曆 (新增) -->
        <router-link to="/almanac" class="group glass-panel rounded-2xl p-6 hover:border-dark-gold transition-all duration-300 hover:shadow-cosmic relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="text-xs font-serif text-dark-gold tracking-widest uppercase mb-2">DAILY ALMANAC</div>
            <h3 class="font-serif text-xl font-bold mb-2 group-hover:text-dark-gold transition-colors">每日通勝黃曆</h3>
            <p class="text-xs text-dark-muted leading-relaxed mb-4">
              協紀辨方正宗，建除十二神值日、二十八宿禽星吉凶、紫白九星、每日宜忌、吉神方位與十二生肖流日運勢。
            </p>
          </div>
          <div class="flex items-center text-xs font-serif text-dark-gold pt-2 border-t border-dark-gold/15">
            <span>查閱今日吉凶</span>
            <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </router-link>

        <!-- 3. 紫微斗數 -->
        <router-link to="/ziwei" class="group glass-panel rounded-2xl p-6 hover:border-dark-gold transition-all duration-300 hover:shadow-cosmic relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="text-xs font-serif text-dark-gold tracking-widest uppercase mb-2">EASTERN ASTROLOGY</div>
            <h3 class="font-serif text-xl font-bold mb-2 group-hover:text-dark-gold transition-colors">紫微斗數排盤</h3>
            <p class="text-xs text-dark-muted leading-relaxed mb-4">
              十二琉璃宮格、十四主星廟旺平陷、六吉六煞、生年四化動態會照，呈列三方四正幾何網絡。
            </p>
          </div>
          <div class="flex items-center text-xs font-serif text-dark-gold pt-2 border-t border-dark-gold/15">
            <span>排演天機命盤</span>
            <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </router-link>

        <!-- 4. 四柱八字 -->
        <router-link to="/bazi" class="group glass-panel rounded-2xl p-6 hover:border-dark-gold transition-all duration-300 hover:shadow-cosmic relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="text-xs font-serif text-dark-gold tracking-widest uppercase mb-2">FOUR PILLARS</div>
            <h3 class="font-serif text-xl font-bold mb-2 group-hover:text-dark-gold transition-colors">四柱八字論命</h3>
            <p class="text-xs text-dark-muted leading-relaxed mb-4">
              節氣干支換算、地支藏干、十神格局、五行能量分佈雷達、日主強弱判別與喜用神推導。
            </p>
          </div>
          <div class="flex items-center text-xs font-serif text-dark-gold pt-2 border-t border-dark-gold/15">
            <span>透析四柱五行</span>
            <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </router-link>

        <!-- 5. 周易卜卦 -->
        <router-link to="/iching" class="group glass-panel rounded-2xl p-6 hover:border-dark-gold transition-all duration-300 hover:shadow-cosmic relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="text-xs font-serif text-dark-gold tracking-widest uppercase mb-2">I CHING DIVINATION</div>
            <h3 class="font-serif text-xl font-bold mb-2 group-hover:text-dark-gold transition-colors">周易六爻神卦</h3>
            <p class="text-xs text-dark-muted leading-relaxed mb-4">
              模擬三枚古銅錢投擲起卦或梅花易數，剖析 64 卦 384 爻辭、動爻翻轉、本卦互卦與之卦。
            </p>
          </div>
          <div class="flex items-center text-xs font-serif text-dark-gold pt-2 border-t border-dark-gold/15">
            <span>搖擲古錢起卦</span>
            <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </router-link>

        <!-- 6. 姓名學與命名 -->
        <router-link to="/naming" class="group glass-panel rounded-2xl p-6 hover:border-dark-gold transition-all duration-300 hover:shadow-cosmic relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="text-xs font-serif text-dark-gold tracking-widest uppercase mb-2">CHINESE ONOMASTICS</div>
            <h3 class="font-serif text-xl font-bold mb-2 group-hover:text-dark-gold transition-colors">易經姓名學剖析</h3>
            <p class="text-xs text-dark-muted leading-relaxed mb-4">
              正統康熙筆劃部首、天人地總外五格剖象數理、三才配置生剋吉凶評級，八字喜用神起名。
            </p>
          </div>
          <div class="flex items-center text-xs font-serif text-dark-gold pt-2 border-t border-dark-gold/15">
            <span>測名與喜用起名</span>
            <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </router-link>

        <!-- 7. 西洋星盤與月相 -->
        <router-link to="/western" class="group glass-panel rounded-2xl p-6 hover:border-dark-gold transition-all duration-300 hover:shadow-cosmic relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="text-xs font-serif text-dark-gold tracking-widest uppercase mb-2">WESTERN ASTROLOGY</div>
            <h3 class="font-serif text-xl font-bold mb-2 group-hover:text-dark-gold transition-colors">西洋本命星盤</h3>
            <p class="text-xs text-dark-muted leading-relaxed mb-4">
              黃道十二宮開普勒星盤、上升點 ASC 與天頂 MC、五大主相位網絡及月亮星座原型深度報告。
            </p>
          </div>
          <div class="flex items-center text-xs font-serif text-dark-gold pt-2 border-t border-dark-gold/15">
            <span>繪製本命天宮</span>
            <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </router-link>

        <!-- 8. 塔羅牌占卜 -->
        <router-link to="/tarot" class="group glass-panel rounded-2xl p-6 hover:border-dark-gold transition-all duration-300 hover:shadow-cosmic relative overflow-hidden flex flex-col justify-between">
          <div>
            <div class="text-xs font-serif text-dark-gold tracking-widest uppercase mb-2">TAROT ESOTERICISM</div>
            <h3 class="font-serif text-xl font-bold mb-2 group-hover:text-dark-gold transition-colors">78張韋特塔羅占卜</h3>
            <p class="text-xs text-dark-muted leading-relaxed mb-4">
              22 大阿爾克那與 56 小阿爾克那，沉浸式翻牌與正逆位解析，支援塞爾特十字等 5 大牌陣。
            </p>
          </div>
          <div class="flex items-center text-xs font-serif text-dark-gold pt-2 border-t border-dark-gold/15">
            <span>洗牌抽取神諭</span>
            <span class="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ArmillarySphere from '../components/celestial/ArmillarySphere.vue';
</script>
