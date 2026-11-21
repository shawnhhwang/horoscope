import { prisma } from '@celestial/database';
import { getModuleRole, normalizeModuleKey } from '../prompts/roles.js';
import type { ChartContext } from '../types.js';

const ASTROLOGICAL_TERMS = [
  '紫微', '天機', '太陽', '武曲', '天同', '廉貞', '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍',
  '化祿', '化權', '化科', '化忌', '殺破狼', '機月同梁', '火貪格', '陽梁昌祿', '君臣慶會',
  '夫妻宮', '福德宮', '子女宮', '父母宮', '田宅宮', '官祿宮', '財帛宮', '疾厄宮',
  '乾卦', '坤卦', '震卦', '巽卦', '坎卦', '離卦', '艮卦', '兌卦', '西北方', '西南方', '正東方', '東南方',
  '白羊座', '金牛座', '雙子座', '巨蟹座', '獅子座', '處女座', '天秤座', '天蠍座', '射手座', '摩羯座', '水瓶座', '雙魚座',
  '白羊', '金牛', '雙子', '巨蟹', '獅子', '處女', '天秤', '天蠍', '射手', '摩羯', '水瓶', '雙魚',
  '月亮', '水星', '金星', '火星', '木星', '土星', '天王星', '海王星', '冥王星', '上升點', '天頂',
  '愚者', '魔術師', '女祭司', '皇后', '皇帝', '教皇', '戀人', '戰車', '力量', '隱士',
  '命運之輪', '正義', '倒吊人', '死神', '節制', '惡魔', '高塔', '星星', '審判', '世界',
  '權杖', '聖杯', '寶劍', '錢幣',
  '角木蛟', '亢金龍', '氐土貉', '房日兔', '心月狐', '尾火虎', '箕水豹',
  '斗木獬', '牛金牛', '女土蝠', '虛日鼠', '危月燕', '室火豬', '壁水貐',
  '奎木狼', '婁金狗', '胃土彘', '昴日雞', '畢月烏', '觜火猴', '參水猿',
  '井木犴', '鬼金羊', '柳土獐', '星日馬', '張月鹿', '翼火蛇', '軫水蚓',
  '恩星', '難星', '仇星', '用星', '建除', '成日', '乾為天', '坤為地',
  '八字合婚', '合婚', '天干五合', '六合', '三合', '相沖', '通關', '滴天髓', '子平真詮', '家庭五行', '家運', '代際', '因材施教', '名位相等', '雙宮聯參',
  '周公解夢', '解夢', '夢見', '夢中', '水體', '深水', '海洋', '潛意識', '靈蛇', '神龍', '飛翔', '墜落', '牙齒',
  '六十甲子籤', '籤詩', '擲筊', '聖筊', '笑筊', '陰筊', '神明', '典故', '問事',
  '文鳥', '靈雀', '銜籤', '神諭', '隨緣', '流年生活曆', '歲運', '起居', '作息', '四正', '子午卯酉',
  '百歲流年', '人生推演', '大運', '歷史時代', '大夢', '五格', '三才', '數理', '康熙字典', '筆畫', '六爻', '動爻', '變卦', '本卦', '互卦', '時位',
];

const MASTER_KEYWORDS = [
  '榮格', 'jung', '路德雅爾', 'rudhyar', '莉茲格林', 'greene', '阿若優', 'arroyo', '漢德', 'hand',
  '韋特', 'waite', '波拉克', 'pollack', '格利爾', 'greer', '佐杜洛夫斯基', 'jodorowsky',
  '果老', '耶律楚材', '滴天髓', '沈孝瞻', '子平', '合婚', '通關', '家庭場域', '代際', '宗師', '大師', '心法', '語錄', '原型', '共時性', '陰影', '愚人之旅', '逆位',
  '雙宮聯參', '天作之合', '四化飛化', '名位相等', '後天八卦', '地天泰', '水火既濟', '雷天大壯', '以果決行',
  '周公', '反夢', '解夢', '六十甲子', '擲筊', '聖筊', '文鳥', '靈雀', '起居', '四正', '百歲', '數理',
];

function getSearchModules(targetModule: string): string[] {
  switch (targetModule) {
    case 'WESTERN': return ['WESTERN', 'WESTERN_NATAL'];
    case 'NAME': return ['NAME', 'NAMING'];
    case 'BAZI_SYNASTRY': return ['BAZI_SYNASTRY', 'BAZI', 'ZIWEI'];
    case 'FAMILY_GROUP': return ['FAMILY_GROUP', 'BAZI', 'ZIWEI', 'ICHING'];
    case 'DREAM': return ['DREAM', 'WESTERN', 'ICHING'];
    case 'TEMPLE_POEM': return ['TEMPLE_POEM', 'ICHING', 'ALMANAC'];
    case 'BUNCHO': return ['BUNCHO', 'ICHING', 'ALMANAC'];
    case 'ANNUAL_PLANNER': return ['ANNUAL_PLANNER', 'BAZI', 'ALMANAC'];
    case 'LIFE_SIMULATOR': return ['LIFE_SIMULATOR', 'BAZI', 'ZIWEI'];
    case 'BAZI': return ['BAZI', 'BAZI_SYNASTRY'];
    case 'HOLOGRAPHIC': return ['ZIWEI', 'BAZI', 'WESTERN', 'QIZHENG'];
    default: return [targetModule];
  }
}

/**
 * [P0-SEC-03] 檢索增強生成 (RAG) 知識檢索模組
 * - 嚴格租戶隔離：查詢使用者歷史紀錄時強制帶入 WHERE userId = currentUserId
 */
export async function retrieveModuleKnowledge(
  moduleType: string,
  chartContext?: ChartContext,
  userQuery?: string,
  currentUserId?: string
): Promise<string> {
  const role = getModuleRole(moduleType);
  const ragSnippets: string[] = [];

  ragSnippets.push(`【${role.title}·核心原則與分析框架】\n${role.coreKnowledge}`);

  const raw = chartContext?.rawData || {};
  if (raw.ziweiHeming) {
    const zh = raw.ziweiHeming;
    ragSnippets.push(
      `【紫微斗數三合合盤雙宮聯參與五步法即時演算】\n` +
        `• 合盤星級：${zh.starRating}（${zh.starRatingCriteria}）｜緣分定性：${zh.destinyType}\n` +
        `• 雙宮聯參總評：${zh.dualPalacePrinciple}\n` +
        `• ${zh.person1Profile?.name}夫妻宮【${zh.person1Profile?.fuqiStars?.join('、')}】：${zh.person1Profile?.fuqiSummary}${zh.person1Profile?.fuqiNiQuote || zh.person1Profile?.fuqiClassicQuote ? `（三合易理心法：「${zh.person1Profile.fuqiClassicQuote || zh.person1Profile.fuqiNiQuote}」）` : ''}\n` +
        `• ${zh.person2Profile?.name}夫妻宮【${zh.person2Profile?.fuqiStars?.join('、')}】：${zh.person2Profile?.fuqiSummary}${zh.person2Profile?.fuqiNiQuote || zh.person2Profile?.fuqiClassicQuote ? `（三合易理心法：「${zh.person2Profile.fuqiClassicQuote || zh.person2Profile.fuqiNiQuote}」）` : ''}\n` +
        `• 五步診斷：(1) ${zh.fiveSteps?.step1BaseCompatibility} (2) ${zh.fiveSteps?.step2SpouseCrossMatch} (3) ${zh.fiveSteps?.step3SunMoonAnalysis} (4) ${zh.fiveSteps?.step4SihuaMutualFly}`
    );
  }
  if (Array.isArray(raw.members) && raw.members.some((m: any) => m?.baguaPosition)) {
    const baguaLines = raw.members
      .filter((m: any) => m?.baguaPosition)
      .map(
        (m: any) =>
          `• ${m.name}（${m.role}·${m.dayMaster}）：後天八卦本位【${m.baguaPosition.direction}·${m.baguaPosition.trigram}】（${m.baguaPosition.familyTitle}）｜紫微六親：${m.ziweiFamilyPalaceNote || ''}｜${m.baguaPosition.niMingWeiRule}`
      )
      .join('\n');
    ragSnippets.push(`【家庭成員後天八卦「名位相等」空間易理定位表】\n${baguaLines}`);
  }

  // 2. 租戶隔離：僅在明確提供 currentUserId 時查詢該會員本人近期測算摘要，嚴禁跨租戶檢索
  if (currentUserId) {
    try {
      const targetModule = normalizeModuleKey(moduleType);
      const userReadings = await prisma.readingRecord.findMany({
        where: {
          userId: currentUserId,
          moduleType: targetModule,
        },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { moduleType: true, aiSummary: true, createdAt: true },
      });
      const validSummaries = userReadings.filter((r) => r.aiSummary);
      if (validSummaries.length > 0) {
        ragSnippets.push(
          `【個人歷史測算脈絡 (Tenant-Isolated User History)】\n` +
            validSummaries.map((r) => `• ${r.createdAt.toISOString().slice(0, 10)}: ${String(r.aiSummary).slice(0, 180)}`).join('\n')
        );
      }
    } catch {
      // 忽略歷史紀錄讀取失敗
    }
  }

  // 3. 從系統公共辭庫 SystemInterpretation 檢索專業詞條
  try {
    const rawDataStr = JSON.stringify(chartContext?.rawData || {});
    const targetModule = normalizeModuleKey(moduleType);
    const searchModules = getSearchModules(targetModule);

    const interpretations = await prisma.systemInterpretation.findMany({
      where: {
        OR: searchModules.map((m) => ({ moduleType: { contains: m } })),
      },
      take: 120,
    });

    if (interpretations.length > 0) {
      const patternNames: string[] = Array.isArray(chartContext?.rawData?.patterns)
        ? chartContext!.rawData!.patterns.map((p: any) => p?.name).filter(Boolean)
        : [];

      const userQLower = (userQuery || '').toLowerCase();
      const chartTitleLower = (chartContext?.title || '').toLowerCase();
      const chartSummaryLower = (chartContext?.summary || '').toLowerCase();
      const queryLower = `${chartTitleLower} ${chartSummaryLower} ${userQLower} ${rawDataStr}`.toLowerCase();

      const scored = interpretations.map((item) => {
        let score = 0;
        const key = item.keyCode.toLowerCase();
        const title = item.title.toLowerCase();
        const content = item.contentRich.toLowerCase();
        const tags = (item.tags || '').toLowerCase();

        if (item.moduleType === targetModule) score += 12;

        if (userQLower.length >= 2) {
          if (title.includes(userQLower) || (userQLower.length >= 3 && userQLower.includes(title))) score += 24;
          if (key.includes(userQLower)) score += 16;
        }

        for (const pName of patternNames) {
          const pLower = pName.toLowerCase();
          if (title.includes(pLower) || content.includes(pLower) || tags.includes(pLower)) score += 18;
        }

        if (key.includes('nihai') || key.includes('tianji') || key.includes('sanhe')) {
          score += 6;
          if (['三合', '天機', '格局', '雙宮聯參', '福德宮', '名位相等', '陽宅', '倪海廈', '倪師'].some((k) => queryLower.includes(k))) {
            score += 12;
          }
        }

        if (key.includes('master') || item.category === 'MASTER_WISDOM' || item.category.startsWith('NIHAI_') || item.category.startsWith('CLASSIC_')) {
          score += 5;
          if (MASTER_KEYWORDS.some((kw) => queryLower.includes(kw))) score += 12;
        }

        if (queryLower.includes(title) || title.includes(queryLower)) score += 14;

        try {
          const parsedTags: string[] = JSON.parse(item.tags || '[]');
          for (const t of parsedTags) {
            const tl = t.toLowerCase();
            if (tl.length >= 2) {
              if (userQLower.includes(tl)) score += 16;
              else if (queryLower.includes(tl) || tl.includes(queryLower)) score += 10;
            }
          }
        } catch {
          if (tags.length > 2 && queryLower.includes(tags)) score += 6;
        }

        for (const term of ASTROLOGICAL_TERMS) {
          const termLower = term.toLowerCase();
          if (queryLower.includes(termLower)) {
            const isUserIntent = userQLower.includes(termLower);
            if (title.includes(termLower) || key.includes(termLower)) score += isUserIntent ? 18 : 12;
            else if (content.includes(termLower)) score += isUserIntent ? 8 : 5;
          }
        }

        if (queryLower.includes(key) || key.includes(queryLower)) score += 4;
        if (queryLower.includes(item.category.toLowerCase())) score += 3;

        return { item, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const topItems = scored.filter((s) => s.score > 0).slice(0, 6).map((s) => s.item);
      const selected = topItems.length > 0 ? topItems : interpretations.slice(0, 3);

      if (selected.length > 0) {
        const dbKnowledge = selected
          .map((i) => `• [${i.category}] ${i.title}：${i.contentRich.slice(0, 360)}`)
          .join('\n');
        ragSnippets.push(`【權威命理辭典、三合正統易理語料庫與國際宗師 RAG 文獻 (Database Grounding)】\n${dbKnowledge}`);
      }
    }
  } catch {
    // 容錯降級
  }

  return ragSnippets.join('\n\n');
}
