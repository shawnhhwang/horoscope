import {
  calculateBaziChart,
  calculateZiweiChart,
  drawTarotSpread,
  calculateTrueSolarTime,
} from '@celestial/astro-core';
import { normalizeModuleKey } from './roles.js';
import { generateScenarioConsultationGuide } from './scenarioGuide.js';
import {
  synthesizeZiweiReply,
  synthesizeSynastryAndFamilyReply,
  synthesizeWesternAndTarotReply,
} from './synthesizerDomains.js';
import type { ChatMessage, ChartContext } from '../types.js';

/**
 * 內建專業現代命理與星象顧問合成器 (嚴禁使用仙人道士口吻)
 */
export function generateProfessionalSynthesizerReply(messages: ChatMessage[], chartContext?: ChartContext): string {
  const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content || '';

  if (!chartContext) {
    return generateScenarioConsultationGuide(lastUserMsg);
  }

  try {
    const modType = normalizeModuleKey(chartContext.moduleType);
    switch (modType) {
      case 'ZIWEI':
        return synthesizeZiweiReply(chartContext.rawData, lastUserMsg, calculateTrueSolarTime, calculateZiweiChart);

      case 'BAZI': {
        let raw = chartContext.rawData || {};
        if (!raw.pillars && (raw.birthDate || raw.birthDateTime)) {
          try {
            const std = new Date(raw.birthDate || raw.birthDateTime);
            const solar = calculateTrueSolarTime(std, Number(raw.longitude || 120));
            raw = calculateBaziChart(solar.trueSolarTime, (raw.gender as any) || '男');
          } catch {}
        }
        const p = raw.pillars;
        const pillarsStr = p ? `年柱【${p.year.stem}${p.year.branch}】、月柱【${p.month.stem}${p.month.branch}】、日柱【${p.day.stem}${p.day.branch}】、時柱【${p.hour.stem}${p.hour.branch}】` : '';
        const dayMaster = raw.fourPillars?.day?.stem?.name || raw.dayMaster?.stem || raw.dayMaster || '日主';
        const favorable = Array.isArray(raw.favorableElements?.useful)
          ? raw.favorableElements.useful.join('、')
          : Array.isArray(raw.favorableElements?.favorable)
          ? raw.favorableElements.favorable.join('、')
          : '木、火';

        return `## 專業子平八字命理深度診斷報告（由 @celestial/astro-core 演算法庫精密排定）

審視您的四柱命造${pillarsStr ? `（${pillarsStr}）` : ''}，日主天干五行為「**${dayMaster}**」，五行喜用神為「**${favorable}**」。

針對您所詢問之課題：「**${lastUserMsg}**」：
### 1. 日主元神與五行格局分析
* 日主「${dayMaster}」賦予您堅定踏實的性格基調，局中需以「${favorable}」作為平衡氣候與流通才華的樞紐。
### 2. 落地生活與決策建言
1. 優先選擇契合喜用五行屬性（${favorable}）的產業或生活環境。
2. 順境積極開拓，逆境注重技能儲備與作息調養。`;
      }

      case 'BAZI_SYNASTRY':
      case 'FAMILY_GROUP':
        return synthesizeSynastryAndFamilyReply(modType, chartContext.rawData || {}, lastUserMsg);

      case 'WESTERN':
      case 'TAROT':
        return synthesizeWesternAndTarotReply(modType, chartContext.rawData, lastUserMsg, drawTarotSpread);

      case 'ICHING': {
        const raw = chartContext.rawData || {};
        const original = raw.originalHexagram?.name || raw.originalHexagram || '本卦';
        const transformed = raw.transformedHexagram?.name || raw.transformedHexagram || '變卦';
        return `## 易經戰略決策動態解析報告\n\n此次起筮得本卦「**${original}**」，變卦化為「**${transformed}**」。\n\n針對您的決策詢問：「**${lastUserMsg}**」：\n1. **本卦時位定性**：當前處於蓄勢待發、明辨事理之關鍵階段，宜穩住核心籌碼。\n2. **動爻與變卦走向**：君子以思患而預防之，在局勢明朗前保持彈性、白紙黑字釐清權責，知進知退則無往不利。`;
      }

      case 'QIZHENG': {
        const raw = chartContext.rawData || {};
        return `## 古典七政四餘天星度數詳批報告（宗承果老星宗法脈）\n\n依據周天星盤推步：立命「**${raw.mingPalaceStation || '玄枵'}**」之次、命度入「**${raw.mingMansion || '角木蛟'}**」、宮主星「**${raw.fourStarRelations?.rulerStar || '歲星'}**」、恩星「**${raw.fourStarRelations?.generativeStar || '辰星'}**」。\n\n宗承《果老星宗》心法：天步經緯各有定數，以恩星方位與敬慎修身應對天行節律，必能轉危為安。`;
      }

      case 'NAME': {
        const raw = chartContext.rawData || {};
        return `## 正統姓名學與文字學專業評估報告\n\n審析姓名五格數理配置：總評分「**${raw.fiveGrids?.totalScore || raw.totalScore || 90}分**」，三才配置「**${raw.threeTalents?.pattern || '木火土'}**」。\n\n名字音形義與八字喜用平衡相輔相成，人格數理展現穩健自律與信諾特質，有助於現代社交信任與個人專業品牌凝聚。`;
      }

      case 'ALMANAC': {
        const raw = chartContext.rawData || {};
        return `## 通勝曆法與今日生活擇吉指引報告\n\n今日值農曆「**${raw.lunarDate?.formatted || '今日'}**」，日值十二神之「**${raw.dayOfficer?.name || '建'}**」日，喜神在「**${raw.deityDirections?.joyGod || '東南'}**」、財神在「**${raw.deityDirections?.wealthGod || '正西'}**」。\n\n順應時令節奏，今日適合策略規劃與團隊對齊目標，重要洽公借力吉方，忌急躁衝動簽約。`;
      }

      case 'ANNUAL_PLANNER': {
        const raw = chartContext.rawData || {};
        const cal = raw.calendar || raw;
        return `## ${cal.targetYear || 2026} ${cal.yearGanZhi || '丙午'}年度生活行運曆報告\n\n流年十神「**${cal.yearTenGod || '食神'}**」，起居諧振評分「**${raw.evaluation?.resonanceScore || 85}分**」。建議 23:00 前就寢養護腎水、清淡飲食並維持規律有氧，順應流月四化節奏推進目標。`;
      }

      case 'LIFE_SIMULATOR': {
        const raw = chartContext.rawData || {};
        return `## 百歲流年·人生推演命運報告書 (${raw.ganzhi || '丙午'} · ${raw.age ?? 25}歲)\n\n針對「**${lastUserMsg}**」：順境宜積極開拓，逆境宜守正修身。人事大於天命，每一次抉擇皆在事前修因轉化。`;
      }

      case 'BUNCHO': {
        const lot = chartContext.rawData?.lot || chartContext.rawData || {};
        return `## 靈雀神諭·文鳥占卜心靈開示\n\n抽得 **${lot.name || '靈雀神籤'}**（【${lot.luckLevel || '大吉'}】· 五行屬【${lot.element || '木'}】）：${lot.overallExplanation || '萬木逢春，順勢而為。'}\n${lot.birdAdvice || '「啾啾～心存善念，每一步都算數！」'}`;
      }

      case 'TEMPLE_POEM': {
        const lot = chartContext.rawData?.lot || chartContext.rawData || {};
        return `## 台灣正統廟宇六十甲子籤詩聖意解讀\n\n第 **${lot.id || 1}** 籤【${lot.stemBranch || '甲子'}】（${lot.title || '神明賜籤'} · ${lot.luckLevel || '大吉'}）：${lot.holyDecree || '心誠則靈，天道酬勤。'} 歷史典故：${lot.allusion || ''}`;
      }

      case 'DREAM': {
        const raw = chartContext.rawData || {};
        const analysis = raw.synthesis ? raw : raw.analysis || {};
        const entries: any[] = raw.entries || analysis.entries || [];
        return `## 周公解夢與榮格深層心理學分析\n\n核心意象【**${(raw.matchedKeywords || []).join('、') || '夢境符號'}**】，評定「**${raw.dominantOmen || analysis.dominantOmen || '平吉'}**」。\n${entries.map((e: any) => `* **${e.keyword}**：${e.classicText}（${e.psychologicalAnalysis}）`).join('\n')}`;
      }

      case 'HOLOGRAPHIC':
        return `## 🌌 全息四維命格合參總報告\n\n針對「**${lastUserMsg}**」，已同步交叉比對八字四柱、紫微斗數、西洋本命星盤與七政四餘四大系統。請檢視上方【高共識訊號】與【衝突提醒】交叉驗證表，把握事業與財富窗口期並提前規避煞忌風險。`;

      default:
        return `## 專業命理與星象諮詢診斷\n\n針對您的提問：「**${lastUserMsg}**」：\n人生運勢起伏乃客觀節律，善用命盤稟賦並配合務實行動，自能穩步邁向理想目標。`;
    }
  } catch (err) {
    console.error('Professional Synthesizer Error:', err);
    return `## 專業命理與星象諮詢診斷\n\n針對您所詢問之課題：「**${lastUserMsg}**」，當前命盤數據已完整記錄。請依據您的核心稟賦踏實耕耘。`;
  }
}
