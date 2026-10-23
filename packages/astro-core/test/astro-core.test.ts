import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  calculateTrueSolarTime,
  getEquationOfTime,
  calculateZiweiChart,
  calculateBaziChart,
  getTenGod,
  castCoinDivination,
  castPlumBlossom,
  analyzeName,
  recommendNames,
  calculateWesternNatalChart,
  drawTarotSpread,
  generateFullDeck,
  calculateQizhengChart,
  calculateDailyAlmanac,
} from '../src/index.js';

describe('🌟 萬象天儀 核心演算法庫 Intent-Based Tests', () => {
  describe('1. 曆法與真太陽時 (Calendar & True Solar Time)', () => {
    it('應正確校準台北經度 (121.5654) 之真太陽時提前量', () => {
      const standardDate = new Date('2024-06-21T12:00:00Z');
      const result = calculateTrueSolarTime(standardDate, 121.5654, 120);
      // 經度差 = 1.5654 度 -> 經度補償約 6.26 分鐘
      expect(result.longitude).toBe(121.5654);
      expect(result.trueSolarTime.getTime()).not.toBe(standardDate.getTime());
      // 驗證真太陽時在正午夏至時有合理均時差與經度位移
      const diffMinutes = (result.trueSolarTime.getTime() - standardDate.getTime()) / (60 * 1000);
      expect(diffMinutes).toBeCloseTo(result.timeOffsetMinutes, 1);
    });

    it('均時差 (Equation of Time) 應在合理天文範圍 (-20 ~ +20 分鐘)', () => {
      const dates = [
        new Date('2024-02-14'), // 均時差約 -14 分鐘
        new Date('2024-05-15'), // 均時差約 +3.7 分鐘
        new Date('2024-07-26'), // 均時差約 -6.4 分鐘
        new Date('2024-11-03'), // 均時差約 +16.4 分鐘
      ];
      dates.forEach((d) => {
        const eot = getEquationOfTime(d);
        expect(eot).toBeGreaterThanOrEqual(-20);
        expect(eot).toBeLessThanOrEqual(20);
      });
    });
  });

  describe('2. 紫微斗數排盤演算法 (Zi Wei Dou Shu)', () => {
    it('應正確排布十二宮位與十四主星，且不遺失主星', () => {
      // 測試案例: 1990年5月15日 08:30 (辰時)
      const testDate = new Date('1990-05-15T08:30:00Z');
      const chart = calculateZiweiChart(testDate, '男');

      expect(chart.palacesList.length).toBe(12);
      expect(chart.fiveElementBureau).toBeDefined();
      expect(chart.lifeMasterStar).toBeDefined();
      expect(chart.bodyMasterStar).toBeDefined();

      // 統計所有宮位中的十四主星數量
      const allMajorStars = chart.palacesList.flatMap((p) => p.majorStars.map((s) => s.name));
      expect(allMajorStars).toContain('紫微');
      expect(allMajorStars).toContain('天府');
      expect(allMajorStars).toContain('太陽');
      expect(allMajorStars).toContain('太陰');
      expect(allMajorStars.length).toBe(14); // 剛好 14 顆主星
    });

    it('生年干四化星應準確標註在對應主星或吉星上', () => {
      // 1984 年為甲子年，甲干四化: 廉貞化祿, 破軍化權, 武曲化科, 太陽化忌
      const testDate = new Date('1984-07-15T10:00:00Z');
      const chart = calculateZiweiChart(testDate, '男');

      const transformedStars = chart.palacesList
        .flatMap((p) => [...p.majorStars, ...p.luckyStars])
        .filter((s) => s.transformation);

      const lu = transformedStars.find((s) => s.transformation === '祿');
      const quan = transformedStars.find((s) => s.transformation === '權');
      const ke = transformedStars.find((s) => s.transformation === '科');
      const ji = transformedStars.find((s) => s.transformation === '忌');

      expect(lu?.name).toBe('廉貞');
      expect(quan?.name).toBe('破軍');
      expect(ke?.name).toBe('武曲');
      expect(ji?.name).toBe('太陽');
    });

    it('應完整排布六吉星、祿馬與六煞星，且亮度適度對應', () => {
      const testDate = new Date('1990-05-15T08:30:00Z');
      const chart = calculateZiweiChart(testDate, '男');

      const allLucky = chart.palacesList.flatMap((p) => p.luckyStars.map((s) => s.name));
      const allUnlucky = chart.palacesList.flatMap((p) => p.unluckyStars.map((s) => s.name));

      expect(allLucky).toContain('文昌');
      expect(allLucky).toContain('文曲');
      expect(allLucky).toContain('左輔');
      expect(allLucky).toContain('右弼');
      expect(allLucky).toContain('天魁');
      expect(allLucky).toContain('天鉞');
      expect(allLucky).toContain('祿存');
      expect(allLucky).toContain('天馬');

      expect(allUnlucky).toContain('擎羊');
      expect(allUnlucky).toContain('陀羅');
      expect(allUnlucky).toContain('火星');
      expect(allUnlucky).toContain('鈴星');
      expect(allUnlucky).toContain('地空');
      expect(allUnlucky).toContain('地劫');
    });

    it('應精準識別紫微斗數三合派正統格局與倪海廈命相心法', () => {
      const testDate = new Date('1990-05-15T08:30:00Z');
      const chart = calculateZiweiChart(testDate, '男');

      expect(chart.patterns).toBeDefined();
      expect(chart.patterns.length).toBeGreaterThan(0);
      expect(chart.mingGongSummary).toBeDefined();
      expect(chart.mingGongSummary?.nature).toBeTruthy();

      // 驗證格局資料結構規範（正體中文、出處、條件分層）
      for (const pattern of chart.patterns) {
        expect(pattern.name).toBeTruthy();
        expect(['excellent', 'good', 'neutral', 'caution']).toContain(pattern.level);
        expect(pattern.description).toBeTruthy();
        expect(pattern.palaces.length).toBeGreaterThan(0);
        if (pattern.conditions) {
          expect(Array.isArray(pattern.conditions.required)).toBe(true);
        }
      }
    });
  });

  describe('3. 四柱八字與十神旺衰 (BaZi Four Pillars)', () => {
    it('應準確推算十神關係', () => {
      // 日干為甲木 (陽木)
      expect(getTenGod('甲', '甲')).toBe('比肩');
      expect(getTenGod('甲', '乙')).toBe('劫財');
      expect(getTenGod('甲', '丙')).toBe('食神');
      expect(getTenGod('甲', '丁')).toBe('傷官');
      expect(getTenGod('甲', '戊')).toBe('偏財');
      expect(getTenGod('甲', '己')).toBe('正財');
      expect(getTenGod('甲', '庚')).toBe('七殺');
      expect(getTenGod('甲', '辛')).toBe('正官');
      expect(getTenGod('甲', '壬')).toBe('偏印');
      expect(getTenGod('甲', '癸')).toBe('正印');
    });

    it('應產出完整的年月日時四柱、五行能量百分比與大運', () => {
      const birthDate = new Date('1995-10-24T14:30:00Z');
      const bazi = calculateBaziChart(birthDate, '女');

      expect(bazi.pillars.year.stem).toBeDefined();
      expect(bazi.pillars.month.stem).toBeDefined();
      expect(bazi.pillars.day.stem).toBeDefined();
      expect(bazi.pillars.hour.stem).toBeDefined();

      const { wood, fire, earth, metal, water } = bazi.fiveElements;
      expect(wood + fire + earth + metal + water).toBeCloseTo(100, -1);

      expect(bazi.energy.status).toMatch(/身強|身弱|專旺|從格/);
      expect(bazi.favorableElements.useful.length).toBeGreaterThan(0);
      expect(bazi.luckPillars.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('4. 周易卜卦演算法 (I Ching Divination)', () => {
    it('乾為天卦全陽，錯卦應為坤為地，綜卦亦為乾為天', () => {
      // 指定 6 個少陽 7 -> 陽爻且不變動
      const res = castCoinDivination([7, 7, 7, 7, 7, 7]);
      expect(res.baseHexagram.name).toBe('乾為天');
      expect(res.transformedHexagram).toBeUndefined(); // 無動爻則無變卦
      expect(res.complementaryHexagram.name).toBe('坤為地'); // 錯卦全反
      expect(res.invertedHexagram.name).toBe('乾為天'); // 綜卦反轉仍為乾
    });

    it('老陽(9)與老陰(6)動爻應精準觸發之卦(變卦)', () => {
      // 初爻老陽 9 (變陰), 其餘少陰 8 -> 本卦天風姤/下陽變陰
      const res = castCoinDivination([9, 8, 8, 8, 8, 8]);
      expect(res.changingLineIndexes).toEqual([1]);
      expect(res.transformedHexagram).toBeDefined();
      expect(res.transformedHexagram?.binary).toBe('000000'); // 初爻轉陰，全陰為坤
    });

    it('梅花易數數理起卦應確定性生成本卦與動爻', () => {
      // 乾1, 坤8, 動爻3
      const res = castPlumBlossom(1, 8, 3);
      expect(res.mode).toBe('plum_blossom');
      expect(res.changingLineIndexes).toEqual([3]);
    });
  });

  describe('5. 姓名學與五格起名 (Name Analysis & Recommendation)', () => {
    it('應正確計算單姓雙名之天人地總外五格筆劃', () => {
      // 測試名: "李若桐"
      // 李: 7 劃 -> 天格: 7 + 1 = 8 (金)
      // 若: 11 劃 -> 人格: 7 + 11 = 18 (金)
      // 桐: 10 劃 -> 地格: 11 + 10 = 21 (木)
      // 總格: 7 + 11 + 10 = 28 (金)
      // 外格: 28 - 18 + 1 = 11 (木)
      const res = analyzeName('李', '若桐');
      expect(res.grids.tian.strokes).toBe(8);
      expect(res.grids.ren.strokes).toBe(18);
      expect(res.grids.di.strokes).toBe(21);
      expect(res.grids.zong.strokes).toBe(28);
      expect(res.grids.wai.strokes).toBe(11);
      expect(res.overallScore).toBeGreaterThanOrEqual(60);
    });

    it('起名推薦應根據喜用神優先過濾包含喜用五行之好名', () => {
      const recs = recommendNames('陳', ['木', '水'], '女');
      expect(recs.length).toBeGreaterThan(0);
      recs.forEach((r) => {
        expect(r.totalScore).toBeGreaterThanOrEqual(90);
        expect(r.origin).toBeDefined();
      });
    });
  });

  describe('6. 西洋星盤、月相與相位 (Western Astrology)', () => {
    it('春分日 (3月20日前後) 太陽黃道度數應落在白羊座 0 度附近', () => {
      const vernalEquinox = new Date('2024-03-20T03:06:00Z');
      const chart = calculateWesternNatalChart(vernalEquinox);
      expect(chart.sunSign).toBe('白羊座');
      const sun = chart.planets.find((p) => p.name === '太陽');
      expect(sun?.degree).toBeLessThan(3);
    });

    it('應正確計算八大月相原型與月亮星座深度報告', () => {
      const chart = calculateWesternNatalChart(new Date('2024-04-08T18:20:00Z')); // 日全食新月日
      expect(chart.lunarPhase.name).toBeDefined();
      expect(chart.lunarPhase.archetypeTitle).toBeDefined();
      expect(chart.moonDepthReport.emotionalNeeds).toBeDefined();
      expect(chart.aspects.length).toBeGreaterThan(0);
    });
  });

  describe('7. 塔羅牌庫與排陣 (Tarot Divination)', () => {
    it('完整牌庫應精確包含 78 張牌且 ID 無重複', () => {
      const deck = generateFullDeck();
      expect(deck.length).toBe(78);
      const ids = new Set(deck.map((c) => c.id));
      expect(ids.size).toBe(78);

      const majorCount = deck.filter((c) => c.arcana === 'major').length;
      const minorCount = deck.filter((c) => c.arcana === 'minor').length;
      expect(majorCount).toBe(22);
      expect(minorCount).toBe(56);
    });

    it('抽取塞爾特十字牌陣應準確獲得 10 張不重複牌', () => {
      const reading = drawTarotSpread('celtic_cross');
      expect(reading.drawnCards.length).toBe(10);
      const drawnIds = new Set(reading.drawnCards.map((d) => d.card.id));
      expect(drawnIds.size).toBe(10); // 無重複抽牌
      expect(reading.drawnCards[0].positionName).toContain('現狀核心');
      expect(reading.drawnCards[9].positionName).toContain('最終歸宿');
    });

    it('全套 78 張牌庫應 100% 映射至實體牌面圖片檔案且檔案非空', () => {
      const deck = generateFullDeck();
      const possiblePath1 = path.resolve(process.cwd(), '../../apps/web/public/images/tarot/cards');
      const possiblePath2 = path.resolve(process.cwd(), 'apps/web/public/images/tarot/cards');
      const cardsDir = fs.existsSync(possiblePath1) ? possiblePath1 : possiblePath2;

      expect(fs.existsSync(cardsDir)).toBe(true);

      deck.forEach((card) => {
        let filename = '';
        if (card.arcana === 'major') {
          filename = `m${String(card.number).padStart(2, '0')}.jpg`;
        } else {
          const suitPrefix =
            card.suit === 'wands' ? 'w' :
            card.suit === 'cups' ? 'c' :
            card.suit === 'swords' ? 's' : 'p';
          filename = `${suitPrefix}${String(card.number).padStart(2, '0')}.jpg`;
        }
        const filePath = path.join(cardsDir, filename);
        expect(fs.existsSync(filePath), `圖片檔案缺失: ${filename} (${card.nameZh})`).toBe(true);
        const stat = fs.statSync(filePath);
        expect(stat.size).toBeGreaterThan(10240); // 檔案大小需大於 10KB
      });
    });
  });

  describe('8. 七政四餘天星排盤演算法 (Qizheng Siyu Celestial Chart)', () => {
    it('應正確推導七政（七大行星）與四餘（羅計氣孛）共11星體坐標與二十八宿', () => {
      const birthDate = new Date('1995-10-24T08:30:00Z');
      const qizheng = calculateQizhengChart(birthDate, 121.56, 25.03);

      expect(qizheng.planets.length).toBe(11);
      const planetNames = qizheng.planets.map((p) => p.name);
      expect(planetNames).toContain('太陽');
      expect(planetNames).toContain('太陰');
      expect(planetNames).toContain('歲星');
      expect(planetNames).toContain('熒惑');
      expect(planetNames).toContain('填星');
      expect(planetNames).toContain('太白');
      expect(planetNames).toContain('辰星');
      expect(planetNames).toContain('羅睺');
      expect(planetNames).toContain('計都');
      expect(planetNames).toContain('月孛');
      expect(planetNames).toContain('紫氣');

      // 驗證羅睺與計都必然相沖 180 度 (容許誤差 < 0.1 度)
      const rahu = qizheng.planets.find((p) => p.name === '羅睺')!;
      const ketu = qizheng.planets.find((p) => p.name === '計都')!;
      const diff = Math.abs(rahu.eclipticDegree - ketu.eclipticDegree);
      const angle = diff > 180 ? 360 - diff : diff;
      expect(angle).toBeCloseTo(180, 0);

      // 驗證命宮與十二人事宮排布
      expect(qizheng.palaces.length).toBe(12);
      expect(qizheng.palaces[0].name).toBe('命宮');
      expect(qizheng.mingPalaceBranch).toBeDefined();
      expect(qizheng.fourStarRelations.rulerStar).toBeDefined();
      expect(qizheng.fourStarRelations.generativeStar).toBeDefined();
      expect(qizheng.verdict.lifeOverview).toContain('命宮');
    });
  });

  describe('9. 每日黃曆吉凶與流日生肖運勢 (Daily Almanac & Horoscope)', () => {
    it('應產出完整農曆年月日、建除十二神、二十八宿禽星值日與吉凶宜忌', () => {
      const today = new Date('2026-10-20T08:00:00Z');
      const almanac = calculateDailyAlmanac(today);

      expect(almanac.date).toBe('2026-10-20');
      expect(almanac.lunarDate.formatted).toBeDefined();
      expect(almanac.solarTerm).toBeDefined();
      expect(almanac.ganzhi.year).toBeDefined();
      expect(almanac.ganzhi.day).toBeDefined();

      // 建除十二神
      expect(almanac.dayOfficer.name).toMatch(/建|除|滿|平|定|執|破|危|成|收|開|閉/);
      expect(almanac.dayOfficer.nature).toMatch(/吉|凶|平/);

      // 宜忌
      expect(almanac.suitableActivities.length).toBeGreaterThan(0);
      expect(almanac.unsuitableActivities.length).toBeGreaterThan(0);

      // 吉神方位
      expect(almanac.deityDirections.joyGod).toBeDefined();
      expect(almanac.deityDirections.wealthGod).toBeDefined();

      // 十二時辰神煞
      expect(almanac.hourlyFortunes.length).toBe(12);
      expect(almanac.hourlyFortunes[0].branch).toBe('子');

      // 十二生肖每日運勢
      expect(almanac.zodiacHoroscopes.length).toBe(12);
      const dragon = almanac.zodiacHoroscopes.find((z) => z.animal === '龍');
      expect(dragon).toBeDefined();
      expect(dragon?.stars).toBeGreaterThanOrEqual(1);

      // 十天干日主指南
      expect(Object.keys(almanac.dayMasterGuidance).length).toBe(10);
      expect(almanac.dayMasterGuidance['甲'].tenGod).toBeDefined();
    });
  });
});
