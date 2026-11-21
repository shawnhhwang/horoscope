import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import ScenarioGuideWidget from '../src/components/home/ScenarioGuideWidget.vue';
import SharePosterButton from '../src/components/common/SharePosterButton.vue';
import { router } from '../src/router/index.js';

describe('✨ [Phase 2 & 3] 前端新元件與路由隔離測試', () => {
  it('公開前端 Router 應註冊 /holographic 且完全移除 /admin 後台路由', () => {
    const routePaths = router.getRoutes().map((r) => r.path);
    expect(routePaths).toContain('/holographic');
    expect(routePaths.some((p) => p.startsWith('/admin'))).toBe(false);
  });

  it('ScenarioGuideWidget 應渲染五大情境並隨切換更新推薦占卜流步驟', async () => {
    const wrapper = mount(ScenarioGuideWidget, {
      global: {
        plugins: [createPinia()],
        stubs: { RouterLink: { template: '<a :href="to"><slot /></a>', props: ['to'] } },
      },
    });

    expect(wrapper.text()).toContain('感情與關係');
    expect(wrapper.text()).toContain('雙人八字/紫微合盤');

    const wealthBtn = wrapper.findAll('button').find((b) => b.text().includes('財運與投資'));
    expect(wealthBtn).toBeDefined();
    await wealthBtn!.trigger('click');

    expect(wrapper.text()).toContain('全息四維合參');
    expect(wrapper.text()).toContain('黃曆簽約擇日');
  });

  it('SharePosterButton 應正常渲染下載海報觸發按鈕', () => {
    const wrapper = mount(SharePosterButton, {
      props: { targetRef: null, filename: 'test-poster', label: '下載命盤海報' },
    });
    expect(wrapper.text()).toContain('下載命盤海報');
    expect(wrapper.find('button').exists()).toBe(true);
  });
});
