<template>
  <button
    type="button"
    @click="downloadPoster"
    :disabled="exporting"
    class="px-4 py-2 rounded-xl border border-dark-gold/40 bg-dark-gold/10 hover:bg-dark-gold/20 text-dark-gold text-xs font-serif font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
  >
    <span>🖼️</span>
    <span>{{ exporting ? '正在生成海報...' : label || '生成分享海報 PNG' }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { toPng } from 'html-to-image';

const props = defineProps<{
  targetRef: HTMLElement | null;
  filename?: string;
  label?: string;
}>();

const exporting = ref(false);

async function downloadPoster() {
  if (!props.targetRef || exporting.value) return;
  exporting.value = true;
  try {
    const dataUrl = await toPng(props.targetRef, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#0B0E17',
    });
    const link = document.createElement('a');
    link.download = `${props.filename || 'celestial-reading'}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err: any) {
    alert('海報生成失敗：' + (err?.message || '瀏覽器繪圖受限'));
  } finally {
    exporting.value = false;
  }
}
</script>
