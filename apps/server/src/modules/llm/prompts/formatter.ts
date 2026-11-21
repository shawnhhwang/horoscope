import {
  calculateBaziChart,
  calculateZiweiChart,
  drawTarotSpread,
  calculateTrueSolarTime,
} from '@celestial/astro-core';
import { normalizeModuleKey } from './roles.js';
import type { ChartContext } from '../types.js';

export function formatDeterministicChartData(chartContext: ChartContext): string {
  if (!chartContext) return '';

  const modType = normalizeModuleKey(chartContext.moduleType);
  let raw = chartContext.rawData || {};

  if (modType === 'BAZI' && (!raw.pillars || !raw.pillars.year)) {
    const bDate = raw.birthDate || raw.birthDateTime;
    if (bDate) {
      try {
        const stdTime = new Date(bDate);
        const solarInfo = calculateTrueSolarTime(stdTime, Number(raw.longitude || 120));
        raw = calculateBaziChart(solarInfo.trueSolarTime, (raw.gender as any) || '男');
      } catch (e) {
        console.error('Auto bazi calculation fallback error:', e);
      }
    }
  } else if (modType === 'ZIWEI' && (!raw.palaces || Object.keys(raw.palaces).length === 0)) {
    const bDate = raw.birthDate || raw.birthDateTime;
    if (bDate) {
      try {
        const stdTime = new Date(bDate);
        const solarInfo = calculateTrueSolarTime(stdTime, Number(raw.longitude || 120));
        raw = calculateZiweiChart(solarInfo.trueSolarTime, (raw.gender as any) || '男');
      } catch (e) {
        console.error('Auto ziwei calculation fallback error:', e);
      }
    }
  } else if (modType === 'TAROT' && (!raw.drawnCards || raw.drawnCards.length === 0)) {
    if (raw.spreadType) {
      try {
        raw = drawTarotSpread(raw.spreadType);
      } catch (e) {
        console.error('Auto tarot draw fallback error:', e);
      }
    }
  }

  if (modType === 'BAZI' && raw.pillars) {
    const p = raw.pillars;
    const formatPillar = (pil: any) => {
      if (!pil) return '無';
      const stemGod = pil.stemTenGod ? ` (天干十神: ${pil.stemTenGod})` : '';
      const nayin = pil.naYin ? ` / 納音: ${pil.naYin}` : '';
      const hidden = Array.isArray(pil.hiddenStems)
        ? ` / 藏干: ${pil.hiddenStems.map((h: any) => `${h.stem}(${h.tenGod})`).join('、')}`
        : '';
      return `【${pil.stem}${pil.branch}】${stemGod}${nayin}${hidden}`;
    };

    const dmStem = raw.dayMaster?.stem || p.day?.stem || '日主';
    const dmElem = raw.dayMaster?.element || p.day?.stemElement || '';
    const energy = raw.energy ? ` - ${raw.energy.status} (得分: ${raw.energy.score}分)` : '';
    const fe = raw.fiveElements
      ? `木 ${raw.fiveElements.wood}% | 火 ${raw.fiveElements.fire}% | 土 ${raw.fiveElements.earth}% | 金 ${raw.fiveElements.metal}% | 水 ${raw.fiveElements.water}%`
      : '';
    const fav =
      raw.favorableElements?.useful?.join('、') ||
      raw.favorableElements?.favorable?.join('、') ||
      (Array.isArray(raw.favorableElements) ? raw.favorableElements.join('、') : '木火');
    const unFav =
      raw.favorableElements?.avoid?.join('、') ||
      raw.favorableElements?.unfavorable?.join('、') ||
      '金水';
    const luckPillars = Array.isArray(raw.luckPillars)
      ? raw.luckPillars.map((lp: any) => `${lp.startAge}-${lp.endAge}歲【${lp.stem}${lp.branch}·${lp.tenGod}】`).join(' ➔ ')
      : '無';

    return `⚠️【排盤確定性鐵律 · 由 @celestial/astro-core 演算法庫精密排定，AI 嚴禁自行重算或改動】
- 測算系統: 四柱八字五行論命 (BAZI)
- 出生時間: ${raw.birthInfo?.solarDate || '已知'} (性別: ${raw.birthInfo?.gender || '乾造'})
- 四柱確定性干支與十神:
  * 年柱: ${formatPillar(p.year)}
  * 月柱: ${formatPillar(p.month)}
  * 日柱: ${formatPillar(p.day)} (日主元神: ${dmStem}${dmElem ? ` [${dmElem}]` : ''}${energy})
  * 時柱: ${formatPillar(p.hour)}
- 五行能量分佈: ${fe}
- 喜用神判定: 喜用五行【${fav}】 / 忌神五行【${unFav}】
- 十年大運走勢: ${luckPillars}`;
  }

  if (modType === 'ZIWEI' && (raw.palaces || raw.palacesList)) {
    const palacesMap = raw.palaces || {};
    const palacesList: any[] = Array.isArray(raw.palacesList)
      ? raw.palacesList
      : typeof palacesMap === 'object' && palacesMap !== null
      ? Object.values(palacesMap)
      : [];

    const lifeBranch = raw.lifePalaceBranch || '';
    const bodyBranch = raw.bodyPalaceBranch || '';
    const bureau = raw.fiveElementBureau || raw.elementBureau || '';
    const lifeMaster = raw.lifeMasterStar || '';
    const bodyMaster = raw.bodyMasterStar || '';

    const formattedPalaces = palacesList
      .map((pal: any) => {
        const isMing = pal.name === '命宮' || pal.branch === lifeBranch;
        const isBody = pal.isBodyPalace || pal.branch === bodyBranch;
        const majorStr =
          (pal.majorStars || [])
            .map((s: any) => {
              const name = typeof s === 'string' ? s : s.name;
              const bright = s.brightness ? `[${s.brightness}]` : '';
              const trans = s.transformation ? `(化${s.transformation})` : '';
              return `${name}${bright}${trans}`;
            })
            .join('、') || '無主星 (借對宮觀之)';
        const luckyStr = (pal.luckyStars || []).map((s: any) => (typeof s === 'string' ? s : s.name)).join('、') || '無';
        const unluckyStr = (pal.unluckyStars || []).map((s: any) => (typeof s === 'string' ? s : s.name)).join('、') || '無';
        const flags = [isMing ? '🌟【命宮】' : '', isBody ? '🏠【身宮】' : ''].filter(Boolean).join('');

        return `  * 【${pal.name || '宮位'}】(${pal.stem || ''}${pal.branch}宮) ${flags}
    - 主星: ${majorStr}
    - 六吉星: ${luckyStr}
    - 六煞星: ${unluckyStr}
    - 行運大限: ${pal.decadeStartAge ?? ''}-${pal.decadeEndAge ?? ''}歲`;
      })
      .join('\n');

    const patternsStr =
      Array.isArray(raw.patterns) && raw.patterns.length > 0
        ? raw.patterns.map((pt: any) => `* 【${pt.name}】(${pt.level || '吉'}): ${pt.description || ''}`).join('\n')
        : '* 【三合中正配置】：命盤星曜配置端正，以本命三方四正星曜廟旺為依歸。';

    return `⚠️【排盤確定性鐵律 · 由 @celestial/astro-core 演算法庫精密排定，AI 嚴禁自行重算或改動】
- 測算系統: 紫微斗數天機排盤 (ZIWEI)
- 命身座標: 命宮在「${lifeBranch}」宮 | 身宮在「${bodyBranch}」宮
- 五行局: ${bureau} | 命主星: ${lifeMaster} | 身主星: ${bodyMaster}
- 十二宮位精密星曜配置:
${formattedPalaces}
- 命中正統三合格局:
${patternsStr}`;
  }

  if (modType === 'TAROT' && (raw.drawnCards || raw.cards)) {
    const spreadTitle = raw.spreadTitle || raw.spreadName || raw.spread?.label || '韋特塔羅牌陣';
    const spreadType = raw.spreadType || 'three_cards';
    const drawnList: any[] = Array.isArray(raw.drawnCards)
      ? raw.drawnCards
      : Array.isArray(raw.cards)
      ? raw.cards
      : [];

    const formattedCards = drawnList
      .map((d: any, idx: number) => {
        const card = d.card || d;
        const posName = d.positionName || `槽位 ${idx + 1}`;
        const posMeaning = d.positionMeaning ? ` (${d.positionMeaning})` : '';
        const isRev = Boolean(d.isReversed);
        const meaning = isRev ? card.reversedMeaning : card.uprightMeaning;
        const kw = meaning?.keywords?.join('、') || '';
        const ov = meaning?.overview || '';
        const love = meaning?.love || '';
        const car = meaning?.career || '';

        return `  * 槽位 ${d.positionIndex || idx + 1}【${posName}】${posMeaning}
    - 抽得牌卡: 【${card.nameZh || card.name}】(${card.nameEn || ''}) — 【${isRev ? '逆位' : '正位'}】 (屬性: ${card.element || '元素'})
    - 牌面關鍵詞: ${kw}
    - 牌義概論: ${ov}
    - 愛情指引: ${love}
    - 事業指引: ${car}`;
      })
      .join('\n');

    return `⚠️【抽牌確定性鐵律 · 由程式 Fisher-Yates 隨機演算法客觀抽出，AI 嚴禁自行更改或編造牌卡】
- 測算系統: 78張韋特塔羅占卜 (TAROT)
- 牌陣架構: ${spreadTitle} (${spreadType}，共 ${drawnList.length} 張牌)
- 程式隨機抽牌客觀結果:
${formattedCards}
- 綜合啟示: ${raw.overallAdvice || '遵循牌陣客觀揭示，把握當下主導權。'}`;
  }

  if (modType === 'BUNCHO') {
    const lot = raw.lot || raw;
    if (lot && lot.name) {
      return `⚠️【確定性排盤數據 · 文鳥靈雀神籤由 @celestial/astro-core 隨機抽籤確定，AI 必須嚴格以此為準據，嚴禁自行重抽或竄改】
- 測算系統: 靈雀神諭·文鳥占卜 (BUNCHO)
- 所問事項: ${raw.question || chartContext.summary || '所求吉凶指引'}
- 問事面向: ${raw.aspect || '綜合'}
- 抽得靈籤: 第 ${lot.id || lot.number} 籤【${lot.name}】（吉凶: ${lot.luckLevel}，五行: ${lot.element}）
- 雀鳥銜籤動作: ${lot.birdAction || ''}
- 核心關鍵字: ${(lot.keywords || []).join('、')}
- 靈雀神籤詩句:
  ${(lot.poem || []).join('\n  ')}
- 整體白話意涵: ${lot.overallExplanation || ''}
- 專屬面向指引:
  • 感情婚姻: ${lot.aspects?.love || ''}
  • 工作事業: ${lot.aspects?.career || ''}
  • 財富投資: ${lot.aspects?.wealth || ''}
  • 學業進修: ${lot.aspects?.study || ''}
  • 重大抉擇: ${lot.aspects?.decision || ''}
- 文鳥靈犀悄悄話: ${lot.birdAdvice || ''}`;
    }
  }

  if (modType === 'TEMPLE_POEM') {
    const lot = raw.lot || raw;
    const aspectReport = raw.aspectReport || {};
    if (lot && lot.stemBranch) {
      return `⚠️【確定性排盤數據 · 台灣廟宇六十甲子籤與擲筊由 @celestial/astro-core 確定演算，AI 必須嚴格以此客觀籤文與神明聖意為準據，嚴禁自行編造或竄改】
- 測算系統: 台灣正統廟宇六十甲子籤詩 (TEMPLE_POEM)
- 信眾姓名: ${raw.seekerName || '善信'}
- 問事面向: ${aspectReport.aspectTitle || raw.inquiryAspect || '綜合'}
- 所求具體事項: ${raw.question || chartContext.summary || '所求吉凶指引'}
- 籤筒抽得神籤: 第 ${lot.id} 籤【${lot.stemBranch}】（宮位卦象: ${lot.palaceGua || ''}，吉凶: ${lot.luckLevel}）
- 歷史與戲曲典故: ${lot.title}
- 典故背景詳解: ${lot.allusion || ''}
- 七言絕句籤詩:
  ${(lot.poem || []).join('\n  ')}
- 聖意總綱 (解曰): ${lot.holyDecree || ''}
- 【${aspectReport.aspectTitle || '指定面向'}】專屬神明斷語:
  ${aspectReport.aspectInterpretation || (lot.aspects && raw.inquiryAspect ? lot.aspects[raw.inquiryAspect] : '') || lot.holyDecree}`;
    }
  }

  if (modType === 'DREAM') {
    const analysis = raw.synthesis ? raw : raw.analysis || {};
    const entries = raw.entries || analysis.entries || [];
    return `⚠️【確定性排盤數據 · 周公解夢與意象檢索由 @celestial/astro-core 字典庫確定檢索，AI 必須嚴格以此客觀意象與原典為準據，嚴禁脫離夢境符號自行胡亂編造】
- 測算系統: 周公解夢與榮格原型心理學分析 (DREAM)
- 夢境敘述: ${raw.scenario || chartContext.summary || '未提供詳細夢境敘述'}
- 匹配核心意象: ${(raw.matchedKeywords || []).join('、')}
- 主導吉凶等級: ${raw.dominantOmen || analysis.dominantOmen || '平吉'}
- 《周公解夢》匹配詞條原典與解析:
${entries
  .map(
    (e: any, idx: number) =>
      `  ${idx + 1}. 【${e.keyword}】（所屬類別: ${e.categoryName}，吉凶: ${e.omen}）\n     古籍原典: ${e.classicText}\n     通俗象徵: ${e.vernacularMeaning}\n     榮格心理學原型: ${e.psychologicalAnalysis}\n     調適建議: ${e.actionAdvice}`
  )
  .join('\n')}
- 夢境交織綜合提要: ${analysis.synthesis?.omenSummary || ''}
- 潛意識心理核心: ${analysis.synthesis?.psychologicalCore || ''}
- 現實行動指南: ${analysis.synthesis?.actionGuidance || ''}`;
  }

  return `【求測者當前排盤客觀數據】
- 測算系統: ${chartContext.moduleType}
- 命盤主題: ${chartContext.title || '無標題'}
- 盤面概覽: ${chartContext.summary || ''}
- 數據快照: ${JSON.stringify(raw).slice(0, 3200)}`;
}
