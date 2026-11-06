import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  calculateTrueSolarTime,
  getEquationOfTime,
  calculateZiweiChart,
  calculateZiweiHoroscope,
  SI_HUA_MAP,
  calculateBaziChart,
  getTenGod,
  calculateBaziSynastry,
  calculateFamilyGroup,
  castCoinDivination,
  castPlumBlossom,
  analyzeName,
  recommendNames,
  calculateWesternNatalChart,
  drawTarotSpread,
  generateFullDeck,
  calculateQizhengChart,
  calculateDailyAlmanac,
  calculateAnnualDestinyCalendar,
  evaluateHabitResonance,
  generate100YearTimeline,
  calculateInitialAttributes,
  resolveTurnDecision,
  evaluateMortalityCheck,
  generateOfflineTurnContent,
  generateOfflineFinalSummary,
  getTaiwanEraContext,
  getTaiwanEraHealthProfile,
  getTaiwanEraRecord,
  getYearMetaphysicalGuidance,
  getLifeStageIllustration,
  getInitialFemaleFriends,
  getInitialMaleFriends,
  getInitialRomanceFriends,
  getBlindRomanticEncounter,
  applyRomanticDecision,
  calculateOneInEightBillion,
  drawBunchoLot,
  getAllBunchoLots,
  getBunchoLotById,
  drawTempleLot,
  castBwaBwei,
  getAllTemplePoemLots,
  getTemplePoemLotById,
  getTemplePoemLotByStemBranch,
  formatTemplePoemAspectReport,
  searchDreamDictionary,
  getDreamEntriesByCategory,
  getAllDreamCategories,
  getDreamEntryById,
  interpretDreamScenario,
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

    it('應正確推算大限、流年、小限行運 (Horoscope) 且四化均為乾淨星曜名稱陣列 (bare star-name array)', () => {
      const birthDate = new Date('1995-10-24T06:30:00Z');
      const chart = calculateZiweiChart(birthDate, '男', 2026);

      expect(chart.horoscope).toBeDefined();
      const horoscope = chart.horoscope!;

      expect(horoscope.targetYear).toBe(2026);
      expect(horoscope.nominalAge).toBe(32); // 2026 - 1995 + 1 = 32

      // 1. 大限 (Decade Limit)
      expect(horoscope.decade).toBeDefined();
      expect(horoscope.decade.name).toBe('大限');
      expect(horoscope.decade.palaceName).toBeTruthy();
      expect(horoscope.decade.ageRange[0]).toBeLessThanOrEqual(32);
      expect(horoscope.decade.ageRange[1]).toBeGreaterThanOrEqual(32);
      // 四化必須為 bare star-name array (長度為 4 的純字串陣列 [祿, 權, 科, 忌])
      expect(Array.isArray(horoscope.decade.siHua)).toBe(true);
      expect(horoscope.decade.siHua.length).toBe(4);
      horoscope.decade.siHua.forEach((star) => expect(typeof star).toBe('string'));

      // 2. 流年 (Annual Limit)
      expect(horoscope.yearly).toBeDefined();
      expect(horoscope.yearly.name).toBe('流年');
      expect(horoscope.yearly.year).toBe(2026);
      expect(horoscope.yearly.stem).toBe('丙');
      expect(horoscope.yearly.branch).toBe('午');
      // 2026 丙年四化：丙同機昌廉 -> ['天同', '天機', '文昌', '廉貞'] (bare star-name array)
      expect(horoscope.yearly.siHua).toEqual(['天同', '天機', '文昌', '廉貞']);
      expect(horoscope.yearly.siHua.length).toBe(4);

      // 3. 小限 (Small Limit)
      expect(horoscope.smallLimit).toBeDefined();
      expect(horoscope.smallLimit.name).toBe('小限');
      expect(horoscope.smallLimit.age).toBe(32);
      expect(Array.isArray(horoscope.smallLimit.siHua)).toBe(true);
      expect(horoscope.smallLimit.siHua.length).toBe(4);
      horoscope.smallLimit.siHua.forEach((star) => expect(typeof star).toBe('string'));

      // 獨立函式計算驗證
      const customHoro = calculateZiweiHoroscope(chart, 2030);
      expect(customHoro.targetYear).toBe(2030);
      expect(customHoro.nominalAge).toBe(36);
      // 2030 庚年四化：庚日武陰同 -> ['太陽', '武曲', '太陰', '天同']
      expect(customHoro.yearly.stem).toBe('庚');
      expect(customHoro.yearly.branch).toBe('戌');
      expect(customHoro.yearly.siHua).toEqual(['太陽', '武曲', '太陰', '天同']);
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

    it('八字合婚演算法應能精準剖析天干五合、地支六合與五行互補評分', () => {
      // 乾造 (男) 與 坤造 (女)
      const man = {
        name: '張君豪',
        gender: '男' as const,
        birthDate: new Date('1992-06-18T10:30:00Z'),
      };
      const woman = {
        name: '林雅婷',
        gender: '女' as const,
        birthDate: new Date('1994-11-22T16:15:00Z'),
      };

      const synastry = calculateBaziSynastry(man, woman);

      expect(synastry.score).toBeGreaterThanOrEqual(50);
      expect(synastry.score).toBeLessThanOrEqual(100);
      expect(synastry.level).toBeDefined();
      expect(synastry.dimensions.dayMasterSynergy.description).toBeDefined();
      expect(synastry.dimensions.spousePalaceSynergy.description).toBeDefined();
      expect(synastry.dimensions.fiveElementsComplementarity.score).toBeGreaterThan(0);
      expect(synastry.bridgingElement.element).toMatch(/木|火|土|金|水/);
      expect(synastry.bridgingElement.dailyTips.length).toBeGreaterThanOrEqual(2);
      expect(synastry.fourPillarsDetailedCross.length).toBe(4);
      expect(synastry.marriageAdvice.emotionalCommunication).toBeDefined();

      // 驗證對標 ziwei-doushu-main 之紫微斗數×倪海廈《天紀》合盤五步法與雙宮聯參
      expect(synastry.ziweiHeming).toBeDefined();
      expect(synastry.ziweiHeming?.starRating).toContain('星');
      expect(synastry.ziweiHeming?.destinyType).toBeTruthy();
      expect(synastry.ziweiHeming?.dualPalacePrinciple).toContain('夫妻宮');
      expect(synastry.ziweiHeming?.fiveSteps.step1BaseCompatibility).toBeTruthy();
      expect(synastry.ziweiHeming?.fiveSteps.step2SpouseCrossMatch).toBeTruthy();
      expect(synastry.ziweiHeming?.fiveSteps.step5TimingAndYangzhai).toContain('陽宅');
      expect(synastry.ziweiHeming?.person1Profile.fuqiStars.length).toBeGreaterThan(0);
      expect(synastry.ziweiHeming?.person2Profile.fuqiStars.length).toBeGreaterThan(0);
    });

    it('家人群組比對演算法應能聚合全家五行場域並建立兩兩成員交叉矩陣與角色定位', () => {
      const family = [
        { name: '父親 (建華)', role: '父親', gender: '男' as const, birthDate: new Date('1965-03-12T08:00:00Z') },
        { name: '母親 (淑芬)', role: '母親', gender: '女' as const, birthDate: new Date('1968-09-20T14:30:00Z') },
        { name: '長子 (浩宇)', role: '長子', gender: '男' as const, birthDate: new Date('1995-10-24T06:30:00Z') },
        { name: '次女 (子晴)', role: '次女', gender: '女' as const, birthDate: new Date('1999-07-08T18:45:00Z') },
      ];

      const res = calculateFamilyGroup(family, '建華一家');

      expect(res.memberCount).toBe(4);
      expect(res.members.length).toBe(4);
      expect(res.householdAura.dominantElement).toMatch(/木|火|土|金|水/);
      expect(res.householdAura.auraTitle).toBeDefined();

      // 4 人兩兩組合共 C(4, 2) = 6 組關係
      expect(res.crossMatrix.length).toBe(6);
      expect(res.crossMatrix[0].fromName).toBeDefined();
      expect(res.crossMatrix[0].toName).toBeDefined();
      expect(res.crossMatrix[0].relationType).toBeDefined();

      // 角色配置
      expect(res.familyRoles.length).toBe(4);
      expect(res.harmonyGuidelines.length).toBeGreaterThanOrEqual(2);

      // 驗證對標 ziwei-doushu-main 1848條語料庫之倪海廈《天紀·地脈道》後天八卦名位相等配置
      const father = res.members.find((m) => m.role === '父親');
      const mother = res.members.find((m) => m.role === '母親');
      const eldestSon = res.members.find((m) => m.role === '長子');
      const secondDaughter = res.members.find((m) => m.role === '次女');

      expect(father?.baguaPosition?.trigram).toBe('乾卦');
      expect(father?.baguaPosition?.direction).toBe('西北方');
      expect(mother?.baguaPosition?.trigram).toBe('坤卦');
      expect(mother?.baguaPosition?.direction).toBe('西南方');
      expect(eldestSon?.baguaPosition?.trigram).toBe('震卦');
      expect(eldestSon?.baguaPosition?.direction).toBe('正東方');
      expect(secondDaughter?.baguaPosition?.trigram).toBe('離卦');
      expect(secondDaughter?.baguaPosition?.direction).toBe('正南方');
      expect(father?.ziweiFamilyPalaceNote).toContain('命宮');
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

    it('78 張牌庫應全數具備獨立且深度的正逆位牌意 (非模板字串)', () => {
      const deck = generateFullDeck();
      expect(deck.length).toBe(78);
      deck.forEach((card) => {
        expect(card.uprightMeaning.keywords.length).toBeGreaterThanOrEqual(3);
        expect(card.uprightMeaning.overview.length).toBeGreaterThanOrEqual(15);
        expect(card.uprightMeaning.love.length).toBeGreaterThanOrEqual(10);
        expect(card.uprightMeaning.career.length).toBeGreaterThanOrEqual(10);

        expect(card.reversedMeaning.keywords.length).toBeGreaterThanOrEqual(3);
        expect(card.reversedMeaning.overview.length).toBeGreaterThanOrEqual(15);
        expect(card.reversedMeaning.love.length).toBeGreaterThanOrEqual(10);
        expect(card.reversedMeaning.career.length).toBeGreaterThanOrEqual(10);

        // 牌名與概論不得為模板佔位符
        expect(card.uprightMeaning.overview).not.toContain('${');
        expect(card.uprightMeaning.keywords[0]).not.toContain('能量');
      });
    });

    it('應支援完整的 6 種經典牌陣 (單張、時間之流、聖三角、二選一、六芒星、塞爾特十字) 且抽牌由程式隨機進行', () => {
      const spreadConfigs: { spread: any; expectedCount: number }[] = [
        { spread: 'single', expectedCount: 1 },
        { spread: 'three_cards', expectedCount: 3 },
        { spread: 'holy_triangle', expectedCount: 3 },
        { spread: 'two_choices', expectedCount: 5 },
        { spread: 'hexagram', expectedCount: 7 },
        { spread: 'celtic_cross', expectedCount: 10 },
      ];

      spreadConfigs.forEach(({ spread, expectedCount }) => {
        const res = drawTarotSpread(spread);
        expect(res.drawnCards.length).toBe(expectedCount);
        const cardIds = new Set(res.drawnCards.map((c) => c.card.id));
        expect(cardIds.size).toBe(expectedCount); // 隨機抽牌無重複
        res.drawnCards.forEach((d) => {
          expect(d.positionName).toBeDefined();
          expect(d.positionMeaning).toBeDefined();
          expect(typeof d.isReversed).toBe('boolean');
        });
      });

      // 驗證六芒星牌陣槽位定義
      const hexRes = drawTarotSpread('hexagram');
      expect(hexRes.spreadTitle).toContain('六芒星');
      expect(hexRes.drawnCards[0].positionName).toContain('過去起因');
      expect(hexRes.drawnCards[6].positionName).toContain('最終綜合預測');
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

  describe('10. 流年曆與生活起居規劃 (Annual Destiny Calendar & Life Planner)', () => {
    it('應正確推演指定流年 (2026 丙午) 之年綱、日主十神與十二流月行運曆', () => {
      const birthDate = new Date('1990-05-15T08:30:00Z');
      const calendar = calculateAnnualDestinyCalendar(birthDate, '男', 2026);

      expect(calendar.targetYear).toBe(2026);
      expect(calendar.yearGanZhi).toBe('丙午');
      expect(calendar.yearStem).toBe('丙');
      expect(calendar.yearBranch).toBe('午');
      expect(calendar.animal).toBe('馬');
      expect(calendar.yearElement).toBe('火');
      expect(calendar.dayMaster).toBeDefined();
      expect(calendar.yearTenGod).toBeDefined();

      // 流年紫微大盤
      expect(calendar.ziweiYearlyInfo.palaceBranch).toBe('午');
      expect(calendar.ziweiYearlyInfo.siHua).toEqual(['天同', '天機', '文昌', '廉貞']);
      expect(calendar.ziweiYearlyInfo.siHua.length).toBe(4);

      // 十二流月細部
      expect(calendar.monthlyHorizons.length).toBe(12);
      const m1 = calendar.monthlyHorizons[0];
      expect(m1.lunarMonth).toBe(1);
      expect(m1.branch).toBe('寅');
      // 丙辛之歲尋庚上 (五虎遁丙年正月為庚寅)
      expect(m1.stem).toBe('庚');
      expect(m1.ganzhi).toBe('庚寅');
      expect(m1.siHua).toEqual(['太陽', '武曲', '太陰', '天同']);
      expect(m1.habitFocus.sleepRecommendation).toContain('臥');
      expect(m1.habitFocus.dietRecommendation).toBeDefined();
      expect(m1.habitFocus.exerciseRecommendation).toBeDefined();
      expect(m1.habitFocus.decisionTiming).toBeDefined();

      // 十二月為辛丑
      const m12 = calendar.monthlyHorizons[11];
      expect(m12.lunarMonth).toBe(12);
      expect(m12.branch).toBe('丑');
      expect(m12.stem).toBe('辛');
    });

    it('應能依據生活起居紀錄精準評估命盤諧振度並產出個人化生活規劃書', () => {
      const birthDate = new Date('1990-05-15T08:30:00Z');
      const calendar = calculateAnnualDestinyCalendar(birthDate, '男', 2026);

      const sampleHabits = [
        {
          date: '2026-06-10',
          sleepHours: 7.5,
          sleepQuality: '良好',
          dietType: '均衡清淡',
          waterMl: 2200,
          exerciseMinutes: 40,
          energyLevel: 4,
          notes: '晨跑 3 公里，思緒清明',
          tags: ['早起', '慢跑'],
        },
        {
          date: '2026-06-11',
          sleepHours: 8.0,
          sleepQuality: '優質',
          dietType: '多蔬少油',
          waterMl: 2500,
          exerciseMinutes: 30,
          energyLevel: 5,
          notes: '專注推進合約審閱',
          tags: ['冥想', '早睡'],
        },
      ];

      const evaluation = evaluateHabitResonance(calendar, sampleHabits);

      expect(evaluation.resonanceScore).toBeGreaterThanOrEqual(60);
      expect(evaluation.resonanceScore).toBeLessThanOrEqual(100);
      expect(evaluation.resonanceLevel).toMatch(/極佳|良好|普通|需調整|警示/);
      expect(evaluation.elementalHarmony.waterScore).toBeGreaterThanOrEqual(50);
      expect(evaluation.sleepAnalysis.avgSleepHours).toBeCloseTo(7.75, 1);
      expect(evaluation.dietAnalysis.avgWaterMl).toBeGreaterThanOrEqual(2000);
      expect(evaluation.actionPlans.length).toBeGreaterThanOrEqual(3);
      expect(evaluation.holisticSummary).toContain(String(calendar.targetYear));
    });
  });

  describe('11. 百歲流年人生推演模擬器與台灣時代背景 (0-100 BaZi Life Odyssey Simulator & Taiwan Era Realism)', () => {
    it('應推算完整的 0～100 歲流年時間軸、關鍵轉折、五維屬性與終局總結', () => {
      const birthDate = new Date('1990-05-15T08:30:00Z');
      const { baziChart, nodes } = generate100YearTimeline(birthDate, '男');

      // 1. 驗證 0 到 100 歲完整性 (共 101 個節點)
      expect(nodes.length).toBe(101);
      expect(nodes[0].age).toBe(0);
      expect(nodes[0].solarYear).toBe(1990);
      expect(nodes[100].age).toBe(100);
      expect(nodes[100].solarYear).toBe(2090);

      // 2. 驗證流年干支與大運連續性
      nodes.forEach((n, idx) => {
        expect(n.age).toBe(idx);
        expect(n.nominalAge).toBe(idx + 1);
        expect(n.ganzhi.length).toBe(2);
        expect(n.tenGod).toBeDefined();
        expect(n.daYun.stem).toBeDefined();
        expect(n.daYun.branch).toBeDefined();
      });

      // 3. 驗證關鍵人生里程碑標記 (如 18 歲成年升學、22 歲就業)
      const node18 = nodes[18];
      expect(node18.isKeyMilestone).toBe(true);
      expect(node18.milestoneReason).toContain('成年之禮');

      const node22 = nodes[22];
      expect(node22.isKeyMilestone).toBe(true);
      expect(node22.milestoneReason).toContain('學成啟航');

      // 4. 驗證四大領域初始屬性計算 (健康, 知識, 財富, 情感)
      const initialAttrs = calculateInitialAttributes(baziChart);
      expect(initialAttrs.health).toBeGreaterThanOrEqual(40);
      expect(initialAttrs.health).toBeLessThanOrEqual(100);
      expect(initialAttrs.knowledge).toBeGreaterThanOrEqual(10);
      expect(initialAttrs.knowledge).toBeLessThanOrEqual(35);
      expect(initialAttrs.wealth).toBeGreaterThanOrEqual(20);
      expect(initialAttrs.wealth).toBeLessThanOrEqual(50);
      expect(initialAttrs.relationship).toBeGreaterThanOrEqual(50);
      expect(initialAttrs.relationship).toBeLessThanOrEqual(90);

      // 驗證 0~100 歲四大領域隨年紀與流年之合理演化
      expect(nodes[18].snapshotAttributes.knowledge).toBeGreaterThan(initialAttrs.knowledge);
      expect(nodes[40].snapshotAttributes.wealth).toBeGreaterThan(nodes[18].snapshotAttributes.wealth);
      expect(nodes[90].snapshotAttributes.health).toBeLessThan(nodes[20].snapshotAttributes.health);

      // 5. 驗證決策結算與屬性衰減邏輯
      const turnContent = generateOfflineTurnContent(node18, initialAttrs);
      expect(turnContent.options.length).toBe(3);

      const chosen = turnContent.options[0];
      const { newAttributes, deltas } = resolveTurnDecision(initialAttrs, 18, node18.fortuneLevel, chosen);
      expect(newAttributes.career).toBeGreaterThanOrEqual(initialAttrs.career);
      expect(deltas.career).toBeGreaterThan(0);

      // 驗證高齡自然生理衰減 (85歲生理衰減 -3)
      const elderAttrs = { ...initialAttrs, health: 60 };
      const elderTurn = resolveTurnDecision(elderAttrs, 85, '平順');
      expect(elderTurn.deltas.health).toBe(-3);

      // 6. 驗證壽元與終局檢驗
      const healthyCheck = evaluateMortalityCheck(50, { ...initialAttrs, health: 70 }, '大吉');
      expect(healthyCheck.isTerminal).toBe(false);

      const deadCheck = evaluateMortalityCheck(82, { ...initialAttrs, health: 0 }, '大凶');
      expect(deadCheck.isTerminal).toBe(true);
      expect(deadCheck.reason).toContain('82歲');

      // 7. 驗證終局一生總結報告
      const mockSession = {
        sessionId: 'test_session',
        profileName: '王大同',
        gender: '男' as const,
        birthDate: '1990-05-15T08:30:00Z',
        currentAge: 85,
        status: 'COMPLETED' as const,
        attributes: { health: 50, wealth: 78, career: 82, relationship: 75, wisdom: 88 },
        history: nodes.slice(0, 86),
        milestoneFootprints: ['18歲考入頂尖大學', '30歲創立設計工作室'],
      };
      const summary = generateOfflineFinalSummary(mockSession);
      expect(summary.endingTitle).toBeDefined();
      expect(summary.finalAge).toBe(85);
      expect(summary.biographyRichText).toContain('王大同');
      expect(summary.keyTriumphs.length).toBeGreaterThan(0);
      expect(summary.destinyAlignmentScore).toBeGreaterThanOrEqual(60);

      // 驗證多重視角風格生成 (方案 C: 倪師心法、正史太史公列傳、時代回憶錄)
      expect(summary.perspectiveBiographies?.TIANJI).toContain('天紀蓋棺論');
      expect(summary.perspectiveBiographies?.SHIJI).toContain('太史公曰');
      expect(summary.perspectiveBiographies?.MEMOIR).toContain('回憶錄');

      const shijiSummary = generateOfflineFinalSummary(mockSession, 'SHIJI');
      expect(shijiSummary.activePerspective).toBe('SHIJI');
      expect(shijiSummary.biographyRichText).toContain('太史公曰');

      const memoirSummary = generateOfflineFinalSummary(mockSession, 'MEMOIR');
      expect(memoirSummary.activePerspective).toBe('MEMOIR');
      expect(memoirSummary.biographyRichText).toContain('回憶錄');
    });

    it('應依據西曆年份深刻融入台灣時代風貌與歷史社會重大事件', () => {
      const birthDate = new Date('1990-05-15T08:30:00Z');
      const { nodes } = generate100YearTimeline(birthDate, '男');

      // 1. 驗證 101 個節點皆注入台灣時代背景
      nodes.forEach((n) => {
        expect(n.taiwanEraContext).toBeTruthy();
        expect(typeof n.taiwanEraContext).toBe('string');
      });

      // 2. 驗證特定年份重大歷史節點之精準對應
      // 1999 年 (9 歲)：逢 921 大地震與社會動員
      const node1999 = nodes.find((n) => n.solarYear === 1999);
      expect(node1999?.taiwanEraContext).toContain('921');

      // 2003 年 (13 歲)：逢 SARS 與台北 101 上樑
      const node2003 = nodes.find((n) => n.solarYear === 2003);
      expect(node2003?.taiwanEraContext).toContain('SARS');

      // 2021 年 (31 歲)：逢新冠疫情三級警戒與口罩國家隊/遠距工作
      const node2021 = nodes.find((n) => n.solarYear === 2021);
      expect(node2021?.taiwanEraContext).toContain('三級警戒');

      // 3. 驗證年代歷史里程碑推導與回退推導函式 getTaiwanEraContext
      expect(getTaiwanEraContext(1949)).toContain('四萬塊換一塊');
      expect(getTaiwanEraContext(1971)).toContain('退出聯合國');
      expect(getTaiwanEraContext(1979)).toContain('美麗島');
      expect(getTaiwanEraContext(1987)).toContain('解嚴');
      expect(getTaiwanEraContext(2000)).toContain('首次政黨輪替');
      expect(getTaiwanEraContext(2007)).toContain('高鐵');
      expect(getTaiwanEraContext(2024)).toContain('AI');
      expect(getTaiwanEraContext(2025)).toContain('超高齡');
      expect(getTaiwanEraContext(2038)).toContain('超高齡');

      // 4. 驗證線下事件情境描寫包含台灣時代年輪標籤
      const sampleNode = nodes[18];
      const initialAttrs = { health: 80, wealth: 50, career: 50, relationship: 50, wisdom: 50 };
      const turnContent = generateOfflineTurnContent(sampleNode, initialAttrs);
      expect(turnContent.eventNarrative).toContain('台灣時代年輪');
    });

    it('應支援自1845年清代起之歷史映射、各時代人類平均壽命與傳染病公衛機制', () => {
      // 1. 驗證 1845 年 (清道光二十五年) 出生之命主推演
      const birth1845 = new Date('1845-06-15T12:00:00Z');
      const { nodes, baziChart } = generate100YearTimeline(birth1845, '男');
      expect(nodes.length).toBe(101);
      expect(nodes[0].solarYear).toBe(1845);
      expect(nodes[100].solarYear).toBe(1945);
      expect(baziChart.pillars.year.stem).toBe('乙');
      expect(baziChart.pillars.year.branch).toBe('巳');

      // 1845 年節點應反映清代金湖大水災時疫背景與時代平均壽命 (~31歲)
      const node0 = nodes[0];
      expect(node0.taiwanEraContext).toContain('金湖');
      expect(node0.eraAvgLifeExpectancy).toBe(31);
      expect(node0.isEpidemicYear).toBe(true);
      expect(node0.eraEpidemics?.some((e) => e.includes('霍亂'))).toBe(true);

      // 1895 年 (50 歲)：甲午割台，應被標註為重大轉折
      const node1895 = nodes.find((n) => n.solarYear === 1895);
      expect(node1895).toBeDefined();
      expect(node1895?.isKeyMilestone).toBe(true);
      expect(node1895?.taiwanEraContext).toContain('乙未割台');
      expect(node1895?.eraEpidemics?.some((e) => e.includes('霍亂') || e.includes('瘧疾'))).toBe(true);

      // 1896 年 (51 歲)：鼠疫黑死病爆發
      const node1896 = nodes.find((n) => n.solarYear === 1896);
      expect(node1896?.isEpidemicYear).toBe(true);
      expect(node1896?.eraEpidemics?.some((e) => e.includes('鼠疫'))).toBe(true);

      // 1918 年 (73 歲)：西班牙流感大流行
      const node1918 = nodes.find((n) => n.solarYear === 1918);
      expect(node1918?.isEpidemicYear).toBe(true);
      expect(node1918?.eraEpidemics?.some((e) => e.includes('西班牙流感'))).toBe(true);

      // 2. 驗證各歷史時代之健康輪廓推算 (getTaiwanEraHealthProfile)
      const profile1845 = getTaiwanEraHealthProfile(1845);
      expect(profile1845.avgLifeExpectancy).toBe(31);
      expect(profile1845.isEpidemicOutbreak).toBe(true);
      expect(profile1845.prevailingEpidemics.length).toBeGreaterThan(0);

      const profile1920 = getTaiwanEraHealthProfile(1920);
      expect(profile1920.avgLifeExpectancy).toBe(40);

      const profile1965 = getTaiwanEraHealthProfile(1965);
      expect(profile1965.avgLifeExpectancy).toBe(66);
      expect(profile1965.eraName).toContain('瘧疾');

      const profile2026 = getTaiwanEraHealthProfile(2026);
      expect(profile2026.avgLifeExpectancy).toBeGreaterThanOrEqual(81);

      // 3. 驗證傳染病爆發年份的線下決策選項生成 (generateOfflineTurnContent)
      const epidemicNode = nodes[0]; // 1845 is epidemic
      const testAttrs = { health: 70, wealth: 50, career: 50, relationship: 50, wisdom: 50 };
      const epidemicTurn = generateOfflineTurnContent(epidemicNode, testAttrs);
      expect(epidemicTurn.options.some((o) => o.text.includes('防疫') || o.text.includes('避疫') || o.text.includes('求醫') || o.text.includes('草藥'))).toBe(true);

      // 4. 驗證動態時代壽命衰減與傳染病衝擊決策規則 (resolveTurnDecision)
      // 1896 年 (鼠疫大流行 outbreak, avgLifeExpectancy=33)，51歲超過平均壽命 1.25倍 (41歲)，衰減為 -3
      // 加上 AGGRESSIVE 在疫病大流行年份額外增加染疫風險健康扣減 (-2)，合計 health delta <= -5
      const decisionResult1845 = resolveTurnDecision(
        testAttrs,
        51,
        '平順',
        { id: 'opt_agg', text: '鋌而走險冒疫外出經商', potentialImpact: { career: 5 }, attitude: 'AGGRESSIVE' },
        undefined,
        1896,
      );
      expect(decisionResult1845.deltas.health).toBeLessThanOrEqual(-5);

      // 5. 驗證動態時代壽元與死亡評估 (evaluateMortalityCheck)
      // 在 1880 年 (清代)，若 65 歲 (超過平均壽命 33 歲且達到高齡門檻 60 歲) 且健康低於 15，大凶即觸發終局
      const mortality1880Elder = evaluateMortalityCheck(65, { ...testAttrs, health: 10 }, '大凶', 1880);
      expect(mortality1880Elder.isTerminal).toBe(true);

      // 若健康歸零，生平死因敘事深刻反映清末淡水偕醫館與流行病時代特徵
      const mortality1880Zero = evaluateMortalityCheck(35, { ...testAttrs, health: 0 }, '大凶', 1880);
      expect(mortality1880Zero.isTerminal).toBe(true);
      expect(mortality1880Zero.reason).toContain('滬尾偕醫館');
      expect(mortality1880Zero.reason).toContain('肺結核');
    });

    it('應在轉折年、大凶年與大吉年產出精準之命理決策錦囊與行動指引 (Metaphysical Decision Guidance)', () => {
      const birth = new Date('1990-05-15T08:30:00Z');
      const { nodes } = generate100YearTimeline(birth, '男');

      // 1. 驗證大凶年錦囊 (提供避凶化煞、穩健守成指引)
      const mockDaXiongNode = {
        ...nodes[25],
        fortuneLevel: '大凶' as const,
        isKeyMilestone: false,
      };
      const guidanceDaXiong = getYearMetaphysicalGuidance(mockDaXiongNode);
      expect(guidanceDaXiong).toBeDefined();
      expect(guidanceDaXiong?.isApplicable).toBe(true);
      expect(guidanceDaXiong?.category).toBe('DA_XIONG');
      expect(guidanceDaXiong?.title).toContain('大凶');
      expect(guidanceDaXiong?.recommendedAction).toContain('CONSERVATIVE');
      expect(guidanceDaXiong?.decisionTips.length).toBeGreaterThanOrEqual(3);

      // 2. 驗證大吉年錦囊 (提供乘風破浪、積極開拓指引)
      const mockDaJiNode = {
        ...nodes[28],
        fortuneLevel: '大吉' as const,
        isKeyMilestone: false,
      };
      const guidanceDaJi = getYearMetaphysicalGuidance(mockDaJiNode);
      expect(guidanceDaJi).toBeDefined();
      expect(guidanceDaJi?.isApplicable).toBe(true);
      expect(guidanceDaJi?.category).toBe('DA_JI');
      expect(guidanceDaJi?.title).toContain('大吉');
      expect(guidanceDaJi?.recommendedAction).toContain('AGGRESSIVE');
      expect(guidanceDaJi?.decisionTips.some((t) => t.label.includes('開拓'))).toBe(true);

      // 3. 驗證純重大轉折年錦囊 (平順運勢但為大運/里程碑關口)
      const mockMilestoneNode = {
        ...nodes[18],
        fortuneLevel: '平順' as const,
        isKeyMilestone: true,
        milestoneReason: '大運交接關口與升學試煉',
      };
      const guidanceMilestone = getYearMetaphysicalGuidance(mockMilestoneNode);
      expect(guidanceMilestone).toBeDefined();
      expect(guidanceMilestone?.category).toBe('MILESTONE');
      expect(guidanceMilestone?.title).toContain('轉折');
      expect(guidanceMilestone?.summary).toContain('大運交接關口');

      // 4. 驗證轉折年逢大凶之複合嚴峻考驗
      const mockDualNode = {
        ...nodes[40],
        fortuneLevel: '大凶' as const,
        isKeyMilestone: true,
        milestoneReason: '中年大限交接天剋地沖',
      };
      const guidanceDual = getYearMetaphysicalGuidance(mockDualNode);
      expect(guidanceDual?.category).toBe('DA_XIONG');
      expect(guidanceDual?.title).toContain('關鍵轉折');
      expect(guidanceDual?.title).toContain('大凶');

      // 5. 驗證非轉折平順年不觸發特殊指引 (保持介面簡潔)
      const mockOrdinaryNode = {
        ...nodes[7],
        fortuneLevel: '平順' as const,
        isKeyMilestone: false,
      };
      expect(getYearMetaphysicalGuidance(mockOrdinaryNode)).toBeNull();
    });

    it('應在每一年生成對應人生階段之深度年輪敘事文字 (每年一段) 並支援男性視角紅顏盲盒邂逅與80億分之一的遊戲結算', () => {
      const birthDate = new Date('1995-10-24T14:30:00Z');
      const { nodes, baziChart } = generate100YearTimeline(birthDate, '男');

      // 1. 驗證 0~100 歲共 101 個節點，每一年皆具備深度人生階段年輪文字 (每年一段)
      expect(nodes.length).toBe(101);
      nodes.forEach((n) => {
        expect(n.lifeStageTitle).toBeTruthy();
        expect(n.annualStory).toBeTruthy();
        expect(n.annualStory!.length).toBeGreaterThan(40);
        expect(n.annualStory).toContain(`${n.age}歲`);
      });

      // 驗證幼年、青年、中年、老年人生階段名稱與日式寫實插畫路徑映射
      expect(nodes[0].lifeStageTitle).toContain('襁褓');
      expect(nodes[18].lifeStageTitle).toContain('志學');
      expect(nodes[35].lifeStageTitle).toContain('而立');
      expect(nodes[60].lifeStageTitle).toContain('花甲');
      expect(nodes[100].lifeStageTitle).toContain('期頤');
      expect(getLifeStageIllustration(0)).toContain('stage_01_infancy');
      expect(getLifeStageIllustration(18)).toContain('stage_04_capping');
      expect(getLifeStageIllustration(35)).toContain('stage_06_prime');
      expect(getLifeStageIllustration(100)).toContain('stage_09_centenarian');

      // 2. 驗證男性視角紅顏盲盒知己名冊初始化 (支援 KEYIN 生日、年歲對齊與對方好感度)
      const femaleFriends = getInitialFemaleFriends('1990-05-15', [
        { id: 'friend_1', birthDate: '1989-09-12' }, // 自訂 KEYIN
      ]);
      expect(femaleFriends.length).toBe(5);
      expect(femaleFriends.map((f) => f.name)).toContain('沈婉晴');
      expect(femaleFriends.map((f) => f.name)).toContain('林若曦');
      expect(femaleFriends.map((f) => f.name)).toContain('宋雨薇');
      expect(femaleFriends[0].birthDate).toBe('1989-09-12');
      expect(femaleFriends[0].herAffinity).toBeGreaterThan(0); // 媒合對方好感度

      // 3. 驗證盲盒相遇與年歲搭配 (選擇當下不會揭露真實姓名，只出現神秘化身、情境、相伴一生選項與雙方年歲對齊)
      const encounter18 = getBlindRomanticEncounter(18, femaleFriends, '台北', 2008, '男');
      expect(encounter18.isRomanticTurn).toBe(true);
      expect(encounter18.mysteryAlias).toBe('【素雅白裙的知性女子】');
      expect(encounter18.eventNarrative).not.toContain('沈婉晴'); // 嚴格不暴雷真實姓名
      expect(encounter18.eventNarrative).toContain('18 歲'); // 男主年齡
      expect(encounter18.eventNarrative).toContain('19 歲'); // 女方年齡 (2008 - 1989)
      expect(encounter18.eventNarrative).toContain('好感度'); // 對方好感度提示
      expect(encounter18.options?.length).toBe(4);
      expect(encounter18.options?.some((o) => o.text.includes('相伴一生'))).toBe(true);

      // 4. 驗證盲盒抉擇與相伴一生結算 (選擇相伴一生 status 轉為 SPOUSE，好感度升至 100)
      const updatedFriends = applyRomanticDecision(femaleFriends, 'opt_romantic_spouse_friend_1', 18, '男');
      const friend1 = updatedFriends.find((f) => f.id === 'friend_1');
      expect(friend1?.affinity).toBe(100);
      expect(friend1?.herAffinity).toBe(100);
      expect(friend1?.status).toBe('SPOUSE');
      expect(friend1?.encounterStory).toContain('相伴一生');

      // 5. 驗證女性視角專屬 · 80億分之一藍顏名冊 (支援自訂生日與年歲對齊)
      const maleFriends = getInitialMaleFriends('1992-03-10', [
        { id: 'friend_m1', birthDate: '1991-09-15' }, // 自訂 KEYIN
      ]);
      expect(maleFriends.length).toBe(5);
      expect(maleFriends.map((f) => f.name)).toContain('陸子軒');
      expect(maleFriends.map((f) => f.name)).toContain('傅宇霖');
      expect(maleFriends.map((f) => f.name)).toContain('霍柏翰');
      expect(maleFriends.map((f) => f.name)).toContain('江承澤');
      expect(maleFriends.map((f) => f.name)).toContain('顧睿安');
      expect(maleFriends[0].birthDate).toBe('1991-09-15');
      expect(maleFriends[0].illustration).toContain('romance_male_zixuan');

      const femaleEncounter18 = getBlindRomanticEncounter(18, maleFriends, '台北', 2010, '女');
      expect(femaleEncounter18.isRomanticTurn).toBe(true);
      expect(femaleEncounter18.mysteryAlias).toBe('【溫暖清朗的白襯衫學長】');
      expect(femaleEncounter18.eventNarrative).not.toContain('陸子軒');
      expect(femaleEncounter18.options?.some((o) => o.text.includes('相伴一生'))).toBe(true);

      const updatedMaleFriends = applyRomanticDecision(maleFriends, 'opt_romantic_spouse_friend_m1', 18, '女');
      const maleFriend1 = updatedMaleFriends.find((f) => f.id === 'friend_m1');
      expect(maleFriend1?.status).toBe('SPOUSE');
      expect(maleFriend1?.encounterStory).toContain('相伴一生');

      // 6. 驗證 80 億分之一的遊戲 (One in Eight Billion) 終局機率與紅顏/藍顏揭曉
      const mockSession = {
        sessionId: 'session_8b_test',
        profileName: '張道遠',
        gender: '男' as const,
        birthDate: '1995-10-24T14:30:00Z',
        currentAge: 85,
        status: 'COMPLETED' as const,
        attributes: { health: 75, wealth: 80, career: 88, relationship: 82, wisdom: 90 },
        history: nodes.slice(0, 86),
        milestoneFootprints: ['18歲邂逅素雅白裙女子', '30歲創立軟體科技公司'],
        femaleFriends: updatedFriends,
      };

      const oneIn8B = calculateOneInEightBillion(mockSession);
      expect(oneIn8B.destinyCode).toContain('DESTINY-TW-8B');
      expect(oneIn8B.rarityScoreText).toContain('80');
      expect(oneIn8B.revealedFriends.length).toBe(5);
      const revealedFriend1 = oneIn8B.revealedFriends.find((f) => f.id === 'friend_1');
      expect(revealedFriend1?.name).toBe('沈婉晴');
      expect(revealedFriend1?.statusText).toContain('相伴一生');

      // 驗證 generateOfflineFinalSummary 支援 ONE_IN_8_BILLION 視角
      const summary8B = generateOfflineFinalSummary(mockSession, 'ONE_IN_8_BILLION');
      expect(summary8B.activePerspective).toBe('ONE_IN_8_BILLION');
      expect(summary8B.biographyRichText).toContain('80億分之一');
      expect(summary8B.biographyRichText).toContain('沈婉晴');
      expect(summary8B.oneInEightBillion).toBeDefined();
    });
  });

  describe('12. 文鳥抽籤演算法庫 (Buncho Divination Engine)', () => {
    it('應能隨機抽取文鳥靈籤並支援指定籤號確定性驗算', () => {
      const randomResult = drawBunchoLot({ question: '今年適合換工作嗎？', aspect: '事業' });
      expect(randomResult.lot).toBeDefined();
      expect(randomResult.lot.id).toBeGreaterThanOrEqual(1);
      expect(randomResult.lot.id).toBeLessThanOrEqual(28);
      expect(randomResult.question).toBe('今年適合換工作嗎？');
      expect(randomResult.aspect).toBe('事業');
      expect(randomResult.drawnAt).toBeDefined();

      // 指定第 1 籤
      const lot1Result = drawBunchoLot({ customLotId: 1 });
      expect(lot1Result.lot.id).toBe(1);
      expect(lot1Result.lot.name).toContain('靈雀銜春');
      expect(lot1Result.lot.luckLevel).toBe('大吉');
      expect(lot1Result.lot.poem.length).toBe(4);
      expect(lot1Result.lot.birdAction).toContain('白文鳥');
      expect(lot1Result.lot.aspects.career).toBeDefined();
      expect(lot1Result.lot.birdAdvice).toContain('啾');
    });

    it('文鳥靈籤庫應完整收錄 28 籤且全數具備獨立詩文與面向斷語', () => {
      const allLots = getAllBunchoLots();
      expect(allLots.length).toBe(28);

      const ids = new Set(allLots.map((l) => l.id));
      expect(ids.size).toBe(28);

      for (const lot of allLots) {
        expect(lot.name).toBeTruthy();
        expect(lot.poem.length).toBe(4);
        expect(lot.birdAction.length).toBeGreaterThan(10);
        expect(lot.keywords.length).toBeGreaterThanOrEqual(3);
        expect(lot.overallExplanation.length).toBeGreaterThan(15);
        expect(lot.aspects.love).toBeTruthy();
        expect(lot.aspects.career).toBeTruthy();
        expect(lot.aspects.wealth).toBeTruthy();
        expect(lot.aspects.study).toBeTruthy();
        expect(lot.aspects.decision).toBeTruthy();
        expect(lot.birdAdvice).toBeTruthy();
      }

      const lot7 = getBunchoLotById(7);
      expect(lot7?.name).toContain('翠竹報平');
    });
  });

  describe('13. 台灣廟宇六十甲子籤詩與擲筊系統 (Taiwan Temple Poem & Bwa-Bwei System)', () => {
    it('六十甲子籤庫應完整包含 1~60 籤且天干地支與典故皆嚴格對齊', () => {
      const allLots = getAllTemplePoemLots();
      expect(allLots.length).toBe(60);

      const stems = allLots.map((l) => l.stemBranch);
      expect(stems[0]).toBe('甲子');
      expect(stems[59]).toBe('癸亥');

      // 驗證無重複 ID
      const ids = new Set(allLots.map((l) => l.id));
      expect(ids.size).toBe(60);

      for (const lot of allLots) {
        expect(lot.poem.length).toBe(4);
        expect(lot.allusion.length).toBeGreaterThan(10);
        expect(lot.holyDecree.length).toBeGreaterThan(10);
        expect(lot.aspects.career).toBeTruthy();
        expect(lot.aspects.wealth).toBeTruthy();
        expect(lot.aspects.marriage).toBeTruthy();
        expect(lot.aspects.health).toBeTruthy();
        expect(lot.aspects.pregnancy).toBeTruthy();
        expect(lot.aspects.lawsuit).toBeTruthy();
        expect(lot.aspects.travel).toBeTruthy();
        expect(lot.aspects.lostItem).toBeTruthy();
        expect(lot.aspects.family).toBeTruthy();
        expect(lot.aspects.business).toBeTruthy();
      }

      // 依干支查詢
      const jiazi = getTemplePoemLotByStemBranch('甲子');
      expect(jiazi?.id).toBe(1);
      expect(jiazi?.title).toContain('包公');

      const guihai = getTemplePoemLotById(60);
      expect(guihai?.stemBranch).toBe('癸亥');
      expect(guihai?.luckLevel).toBe('大吉');
    });

    it('擲筊演算法應依物理機率與自訂模式輸出聖筊、笑筊與陰筊', () => {
      const sheng = castBwaBwei('sheng_bwei');
      expect(sheng.type).toBe('sheng_bwei');
      expect(sheng.typeName).toBe('聖筊');
      expect(sheng.isAccepted).toBe(true);
      expect(sheng.block1 !== sheng.block2).toBe(true);

      const xiao = castBwaBwei('xiao_bwei');
      expect(xiao.type).toBe('xiao_bwei');
      expect(xiao.typeName).toBe('笑筊');
      expect(xiao.isAccepted).toBe(false);
      expect(xiao.block1).toBe('flat');
      expect(xiao.block2).toBe('flat');

      const yin = castBwaBwei('yin_bwei');
      expect(yin.type).toBe('yin_bwei');
      expect(yin.typeName).toBe('陰筊');
      expect(yin.isAccepted).toBe(false);
      expect(yin.block1).toBe('round');
      expect(yin.block2).toBe('round');

      // 隨機擲筊多次應能產生三種結果之一
      const randomBwei = castBwaBwei();
      expect(['sheng_bwei', 'xiao_bwei', 'yin_bwei']).toContain(randomBwei.type);
    });

    it('應能依據特定問事面向 (如婚姻、求財、官司) 精準格式化解籤報告', () => {
      const lot1 = getTemplePoemLotById(1)!;
      const marriageReport = formatTemplePoemAspectReport(lot1, 'marriage');
      expect(marriageReport.aspectTitle).toContain('婚姻');
      expect(marriageReport.aspectInterpretation).toBe(lot1.aspects.marriage);

      const careerReport = formatTemplePoemAspectReport(lot1, 'career');
      expect(careerReport.aspectTitle).toContain('功名');
      expect(careerReport.aspectInterpretation).toBe(lot1.aspects.career);
    });
  });

  describe('14. 周公解夢與潛意識意象分析 (Duke of Zhou Dream Interpretation)', () => {
    it('解夢字典應涵蓋八大分類且每項皆有原典、白話與榮格心理學分析', () => {
      const categories = getAllDreamCategories();
      expect(categories.length).toBe(8);

      const plantEntries = getDreamEntriesByCategory('plant');
      expect(plantEntries.length).toBeGreaterThanOrEqual(4);

      const snake = getDreamEntryById('dream_snake');
      expect(snake).toBeDefined();
      expect(snake?.keyword).toBe('蛇');
      expect(snake?.classicText).toContain('周公解夢');
      expect(snake?.vernacularMeaning.length).toBeGreaterThan(20);
      expect(snake?.psychologicalAnalysis).toContain('榮格');
      expect(snake?.actionAdvice.length).toBeGreaterThan(10);
    });

    it('應支援關鍵字模糊搜尋與分類過濾', () => {
      const searchRes = searchDreamDictionary('蛇');
      expect(searchRes.total).toBeGreaterThanOrEqual(1);
      expect(searchRes.matchedEntries.some((e) => e.keyword === '蛇')).toBe(true);

      const searchTeeth = searchDreamDictionary('掉牙齒');
      expect(searchTeeth.total).toBeGreaterThanOrEqual(1);
      expect(searchTeeth.matchedEntries[0].id).toBe('dream_teeth_falling');

      const animalEntries = getDreamEntriesByCategory('animal');
      expect(animalEntries.length).toBeGreaterThanOrEqual(5);
    });

    it('夢境交織解析演算法應能從長篇敘述中自動抽樣多重意象並給出綜合主導吉凶與心理指引', () => {
      const scenario = '昨晚做了一個奇怪的夢，我夢見自己走過一座大橋，水面突然發大水，橋邊還有一條巨大的金龍在空中飛翔！';
      const analysis = interpretDreamScenario(scenario);

      expect(analysis.matchedKeywords.length).toBeGreaterThanOrEqual(2);
      expect(analysis.entries.length).toBeGreaterThanOrEqual(2);
      expect(analysis.dominantOmen).toBe('大吉');
      expect(analysis.synthesis.omenSummary).toContain('大吉');
      expect(analysis.synthesis.psychologicalCore).toBeTruthy();
      expect(analysis.synthesis.actionGuidance).toBeTruthy();
    });
  });
});
