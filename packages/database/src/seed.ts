import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. 建立預設管理員與會員
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPassword123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@celestial.dao' },
    update: {},
    create: {
      email: 'admin@celestial.dao',
      passwordHash: adminPasswordHash,
      displayName: '天機天衍管理員',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'vip@celestial.dao' },
    update: {},
    create: {
      email: 'vip@celestial.dao',
      passwordHash: userPasswordHash,
      displayName: '星象尊榮會員',
      role: 'VIP',
      emailVerified: true,
    },
  });

  console.log(`👤 Created Users: Admin (${admin.email}), Member (${member.email})`);

  // 2. 建立示範命盤資料
  await prisma.birthProfile.create({
    data: {
      userId: member.id,
      name: '本命盤 (本人)',
      gender: '男',
      birthDatetime: new Date('1995-10-24T06:30:00Z'),
      longitude: 121.5654,
      latitude: 25.033,
      birthLocationName: '台灣台北市',
      notes: '個人主視角命盤',
    },
  });

  // 3. 注入命理解讀辭庫種子
  const interpretations = [
    {
      moduleType: 'ZIWEI',
      keyCode: 'ZIWEI_STAR_ZIWEI_LU',
      category: 'STAR',
      title: '紫微星化祿入命宮',
      contentRich:
        '紫微化祿主威嚴中帶有祥和之氣，主掌貴氣、名望與實質財祿。若會照左輔右弼等吉曜，主一生得貴人長伴，事業宏偉開展。',
      tags: JSON.stringify(['紫微', '化祿', '命宮', '大吉']),
    },
    {
      moduleType: 'BAZI',
      keyCode: 'BAZI_JIA_WOOD_STRONG',
      category: 'DAY_MASTER',
      title: '甲木日主身強格局',
      contentRich:
        '甲木參天，脫胎要火。春木得令逢水生扶而身旺，最喜庚金官殺劈甲引丁火，以食傷洩秀生財，成棟樑之器。',
      tags: JSON.stringify(['甲木', '身強', '喜金火']),
    },
    {
      moduleType: 'ICHING',
      keyCode: 'ICHING_HEXAGRAM_01',
      category: 'HEXAGRAM',
      title: '乾為天（元亨利貞）',
      contentRich:
        '天行健，君子以自強不息。六爻皆陽，象徵純陽剛健、宏偉開創。求事大利，唯需戒驕戒躁，避免「亢龍有悔」。',
      tags: JSON.stringify(['乾卦', '元亨利貞', '純陽']),
    },
    {
      moduleType: 'TAROT',
      keyCode: 'TAROT_MAJOR_00_FOOL',
      category: 'TAROT_CARD',
      title: '愚者 (The Fool) 正位',
      contentRich:
        '愚者手持白玫瑰站在懸崖邊緣，象徵純真無畏的心靈冒險。當前正是打破舊有束縛，大膽開啟全新人生篇章的黃金時刻。',
      tags: JSON.stringify(['大阿爾克那', '愚者', '新起點']),
    },
    {
      moduleType: 'WESTERN_NATAL',
      keyCode: 'WESTERN_SUN_ARIES',
      category: 'PLANET_SIGN',
      title: '太陽落入白羊座 (Sun in Aries)',
      contentRich:
        '黃道第一宮的烈火能量，賦予盤主充沛的生命原動力、果敢的決斷力與開創精神。勇於直面挑戰，是天生的先鋒與領導者。',
      tags: JSON.stringify(['太陽', '白羊座', '火象']),
    },
    {
      moduleType: 'QIZHENG',
      keyCode: 'QIZHENG_EN_STAR_SHENG',
      category: 'STAR_RELATION',
      title: '恩星生我命度格局',
      contentRich:
        '七政四餘以生我命度之曜為恩星。命度逢恩星相生，主其人根基深厚、天賦過人，一生常得長輩或貴人實質提攜，逢凶化吉。',
      tags: JSON.stringify(['七政四餘', '恩星', '命度', '大吉']),
    },
    {
      moduleType: 'NAME',
      keyCode: 'NAME_THREE_TALENTS_MU_HUO_TU',
      category: 'THREE_TALENTS',
      title: '三才配置木火土順生大吉',
      contentRich:
        '天格木生人格火，人格火生地格土，三才順次相生。基礎穩固，上得長上恩寵栽培，下得部屬同儕擁戴，身心健全，事業昌隆。',
      tags: JSON.stringify(['姓名學', '三才', '木火土', '大吉']),
    },
    {
      moduleType: 'ALMANAC',
      keyCode: 'ALMANAC_OFFICER_CHENG',
      category: 'DAY_OFFICER',
      title: '建除十二神之成日',
      contentRich:
        '成日主成就、吉慶、圓滿之意。凡開市、簽約、嫁娶、出行等百事皆吉，象徵事半功倍、水到渠成。',
      tags: JSON.stringify(['黃曆', '建除十二神', '成日', '吉日']),
    },
  ];

  for (const item of interpretations) {
    await prisma.systemInterpretation.upsert({
      where: { keyCode: item.keyCode },
      update: item,
      create: item,
    });
  }

  console.log(`📖 Seeded ${interpretations.length} Interpretation Entries.`);

  // 4. 初始化 LLM 助手系統配置
  const defaultLlmConfig = {
    enabled: true,
    provider: 'custom',
    endpoint: 'http://192.168.1.3:11434/v1',
    apiKey: '',
    model: 'gemma4:e2b',
    temperature: 0.7,
    systemPrompt:
      '你是一位融匯東西方星象與命理體系的現代專業命理諮詢顧問。你精通紫微斗數、四柱八字、現代人本占星、周易決策、韋特塔羅、七政四餘、姓名學與通勝曆法。你的口吻專業、客觀、條理分明且富有人文關懷，嚴禁使用虛假神仙、道士或玄幻小說口吻（如自稱老夫、貧道、天機星君或稱對方為道友）。請依據每次對話自動注入的具體星盤坐標與 RAG 領域知識，為求測者提供清晰、深邃且具實踐價值的診斷與決策建議。',
  };

  await prisma.systemConfig.upsert({
    where: { key: 'LLM_CONFIG' },
    update: {},
    create: {
      key: 'LLM_CONFIG',
      value: JSON.stringify(defaultLlmConfig),
      description: '萬象天儀 AI 靈犀大語言模型後端端點與諮詢配置',
    },
  });

  console.log('🤖 Initialized Default LLM Assistant Configuration.');
  console.log('✅ Database Seeding Completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
