import crypto from 'crypto';
import {
  calculateTrueSolarTime,
  calculateZiweiChart,
  calculateBaziChart,
  calculateBaziSynastry,
  calculateFamilyGroup,
  calculateWesternNatalChart,
  calculateQizhengChart,
  calculateAnnualDestinyCalendar,
  evaluateHabitResonance,
  calculateDailyAlmanac,
  getAllBunchoLots,
  getAllTemplePoemLots,
} from '@celestial/astro-core';
import { cacheGet, cacheSet } from '../../utils/cache.js';
import { findInterpretationsByModules } from './repository.js';

const THIRTY_DAYS_SEC = 30 * 24 * 60 * 60;

function makeChartCacheKey(prefix: string, payload: Record<string, unknown>): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 24);
  return `chart:${prefix}:${hash}`;
}

export async function computeZiweiService(params: {
  birthDate: string;
  gender: '男' | '女';
  longitude: number;
  targetDate?: string;
  targetYear?: number;
}) {
  const cacheKey = makeChartCacheKey('ziwei', params);
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return { ...cached, cacheHit: true };

  const standardTime = new Date(params.birthDate);
  const solarInfo = calculateTrueSolarTime(standardTime, params.longitude);
  const target = params.targetYear ? Number(params.targetYear) : params.targetDate ? new Date(params.targetDate) : undefined;
  const chart = calculateZiweiChart(solarInfo.trueSolarTime, params.gender, target);
  const interpretations = await findInterpretationsByModules(['ZIWEI']);

  const result = { solarInfo, chart, interpretations };
  await cacheSet(cacheKey, result, THIRTY_DAYS_SEC);
  return result;
}

export async function computeBaziService(params: {
  birthDate: string;
  gender: '男' | '女';
  longitude: number;
}) {
  const cacheKey = makeChartCacheKey('bazi', params);
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return { ...cached, cacheHit: true };

  const standardTime = new Date(params.birthDate);
  const solarInfo = calculateTrueSolarTime(standardTime, params.longitude);
  const chart = calculateBaziChart(solarInfo.trueSolarTime, params.gender);
  const interpretations = await findInterpretationsByModules(['BAZI']);

  const result = { solarInfo, chart, interpretations };
  await cacheSet(cacheKey, result, THIRTY_DAYS_SEC);
  return result;
}

export async function computeWesternService(params: {
  birthDate: string;
  latitude: number;
  longitude: number;
}) {
  const cacheKey = makeChartCacheKey('western', params);
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return { ...cached, cacheHit: true };

  const chart = calculateWesternNatalChart(new Date(params.birthDate), params.latitude, params.longitude);
  await cacheSet(cacheKey, chart, THIRTY_DAYS_SEC);
  return chart;
}

export async function computeQizhengService(params: {
  birthDate: string;
  longitude: number;
  latitude: number;
}) {
  const cacheKey = makeChartCacheKey('qizheng', params);
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return { ...cached, cacheHit: true };

  const chart = calculateQizhengChart(new Date(params.birthDate), params.longitude, params.latitude);
  await cacheSet(cacheKey, chart, THIRTY_DAYS_SEC);
  return chart;
}

export async function getCachedBunchoLotsService() {
  const key = 'static:buncho:lots:v1';
  const cached = await cacheGet<any[]>(key);
  if (cached) return cached;
  const lots = getAllBunchoLots();
  await cacheSet(key, lots); // 永久快取
  return lots;
}

export async function getCachedTempleLotsService() {
  const key = 'static:temple:lots:v1';
  const cached = await cacheGet<any[]>(key);
  if (cached) return cached;
  const lots = getAllTemplePoemLots();
  await cacheSet(key, lots); // 永久快取
  return lots;
}

/**
 * [P2-PROD-01] 一鍵全息命格合參中樞：同步運行八字、紫微、西洋占星與七政四餘四大引擎並交叉比對共識與張力
 */
export async function computeHolographicSynthesisService(params: {
  birthDate: string;
  gender: '男' | '女';
  longitude: number;
  latitude: number;
  name?: string;
}) {
  const cacheKey = makeChartCacheKey('holographic', params);
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return { ...cached, cacheHit: true };

  const standardTime = new Date(params.birthDate);
  const solarInfo = calculateTrueSolarTime(standardTime, params.longitude);

  const [bazi, ziwei, western, qizheng] = await Promise.all([
    Promise.resolve(calculateBaziChart(solarInfo.trueSolarTime, params.gender)),
    Promise.resolve(calculateZiweiChart(solarInfo.trueSolarTime, params.gender)),
    Promise.resolve(calculateWesternNatalChart(standardTime, params.latitude, params.longitude)),
    Promise.resolve(calculateQizhengChart(standardTime, params.longitude, params.latitude)),
  ]);

  const consensusSignals: Array<{ dimension: string; level: 'STRONG' | 'MODERATE'; title: string; evidence: string }> = [];
  const conflictAlerts: Array<{ area: string; title: string; advice: string }> = [];

  const usefulElems: string[] = bazi.favorableElements?.useful || [];
  const palaces = Array.isArray((ziwei as any).palacesList)
    ? (ziwei as any).palacesList
    : Object.values(ziwei.palaces || {});
  const wealthPalace = palaces.find((p: any) => p.name === '財帛宮');
  const careerPalace = palaces.find((p: any) => p.name === '官祿宮');
  const hasLuInWealthOrCareer = [wealthPalace, careerPalace].some((pal: any) =>
    (pal?.majorStars || []).some((s: any) => s?.transformation === '祿')
  );
  const jupiter = (western.planets || []).find((p: any) => p.name === '木星' || p.nameEn === 'Jupiter');

  if (hasLuInWealthOrCareer || usefulElems.includes('火') || usefulElems.includes('木')) {
    consensusSignals.push({
      dimension: '事業與財運窗口',
      level: hasLuInWealthOrCareer ? 'STRONG' : 'MODERATE',
      title: hasLuInWealthOrCareer ? '強烈財官共振窗口期' : '穩健累積與資源擴張期',
      evidence: `八字日主【${bazi.dayMaster.stem}】喜用【${usefulElems.join('、')}】；紫微命宮【${ziwei.lifePalaceBranch}】財官動能活絡；西洋木星落【${jupiter?.sign || '吉宮'}】；七政恩星【${qizheng.fourStarRelations?.generativeStar || '歲星'}】護持。`,
    });
  }

  const sunSign = (western.planets || []).find((p: any) => p.name === '太陽')?.sign || '';
  const moonSign = (western.planets || []).find((p: any) => p.name === '月亮')?.sign || '';
  consensusSignals.push({
    dimension: '人格與天賦核心',
    level: 'STRONG',
    title: `${bazi.dayMaster.stem}${bazi.dayMaster.element} × ${sunSign}/${moonSign} 原型共鳴`,
    evidence: `紫微命主星【${ziwei.lifeMasterStar}】與七政命度【${qizheng.mingMansion}】共同強化系統規劃與專精突破特質。`,
  });

  const hasJiInMingOrCareer = palaces.some((pal: any) =>
    ['命宮', '官祿宮', '夫妻宮'].includes(pal?.name) &&
    (pal?.majorStars || []).some((s: any) => s?.transformation === '忌')
  );
  if (hasJiInMingOrCareer || (bazi.energy?.score ?? 50) < 42 || (bazi.energy?.score ?? 50) > 78) {
    conflictAlerts.push({
      area: '能量過載與化忌提醒',
      title: hasJiInMingOrCareer ? '執念化忌與外部壓力交互提醒' : '五行氣候偏枯或過旺失衡提醒',
      advice: `建議日常多導入喜用五行【${usefulElems.join('、') || '水木'}】元素，於合約簽署與情緒高峰期預留緩衝空間。`,
    });
  }

  const result = {
    profileName: params.name || '命主',
    solarInfo,
    engines: {
      bazi,
      ziwei,
      western,
      qizheng,
    },
    synthesis: {
      consensusSignals,
      conflictAlerts,
      summaryHeadline: `四維命盤全景對齊：${bazi.dayMaster.stem}${bazi.dayMaster.element}日主 × 紫微${ziwei.fiveElementBureau} × 西占${sunSign} × 七政${qizheng.mingMansion}`,
    },
  };

  await cacheSet(cacheKey, result, THIRTY_DAYS_SEC);
  return result;
}

/**
 * [P2-PROD-05] 智能擇日助手：篩選未來 N 天避開沖煞的吉日與吉時
 */
export function selectAuspiciousDatesService(params: {
  eventType: string;
  zodiac?: string;
  days?: number;
  startDate?: string;
}) {
  const days = Math.min(45, Math.max(7, Number(params.days) || 30));
  const start = params.startDate ? new Date(params.startDate) : new Date();
  const eventKeywordsMap: Record<string, string[]> = {
    簽約: ['簽約', '訂盟', '立券', '交易', '納財'],
    搬家: ['入宅', '移徙', '安床', '修造'],
    開幕: ['開市', '開業', '交易', '立券', '動土'],
    嫁娶: ['嫁娶', '訂盟', '納采', '會親友'],
  };
  const targetKeywords = eventKeywordsMap[params.eventType] || [params.eventType];
  const candidates: any[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const almanac = calculateDailyAlmanac(d);
    const clashText = almanac.clashInfo?.clashAnimal || '';
    if (params.zodiac && clashText.includes(params.zodiac)) {
      continue;
    }

    const suitableList: string[] = almanac.suitableActivities || [];
    const avoidList: string[] = almanac.unsuitableActivities || [];
    const hits = targetKeywords.filter((kw) => suitableList.some((s) => s.includes(kw)));
    const avoidHit = targetKeywords.some((kw) => avoidList.some((s) => s.includes(kw)));
    if (avoidHit) continue;

    const officerScore = ['成', '開', '定', '滿'].includes(almanac.dayOfficer?.name) ? 25 : 10;
    const score = Math.min(100, 60 + hits.length * 15 + officerScore);
    const auspiciousHours = (almanac.hourlyFortunes || [])
      .filter((h) => h.isAuspicious)
      .slice(0, 4)
      .map((h) => `${h.branch}時 (${h.timeSpan})`);

    candidates.push({
      date: d.toISOString().slice(0, 10),
      lunarDate: almanac.lunarDate?.formatted || '',
      dayGanZhi: almanac.ganzhi?.day || '',
      dayOfficer: almanac.dayOfficer?.name || '',
      clashAnimal: clashText,
      score,
      matchedActivities: hits.length > 0 ? hits : suitableList.slice(0, 3),
      auspiciousHours,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return {
    eventType: params.eventType,
    zodiac: params.zodiac || '不限',
    scannedDays: days,
    recommendations: candidates.slice(0, 8),
  };
}

export {
  calculateBaziSynastry,
  calculateFamilyGroup,
  calculateAnnualDestinyCalendar,
  evaluateHabitResonance,
};
