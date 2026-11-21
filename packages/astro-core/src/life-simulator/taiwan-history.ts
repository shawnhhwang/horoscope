import historyJson from '../../data/taiwan-history.json';

export interface TaiwanEraRecord {
  year: number;
  event: string;
  theme: string;
  influence: string;
  avgLifeExpectancy: number;
  prevailingEpidemics: string[];
  sanitationContext: string;
  isEpidemicOutbreak?: boolean;
}

export const TAIWAN_HISTORICAL_EVENTS: Record<number, TaiwanEraRecord> =
  historyJson as unknown as Record<number, TaiwanEraRecord>;

export function getTaiwanEraHealthProfile(year: number): {
  eraName: string;
  avgLifeExpectancy: number;
  prevailingEpidemics: string[];
  sanitationContext: string;
  isEpidemicOutbreak: boolean;
  epidemicName?: string;
  healthDecayMultiplier: number;
} {
  if (TAIWAN_HISTORICAL_EVENTS[year]) {
    const item = TAIWAN_HISTORICAL_EVENTS[year];
    let multiplier = 1.0;
    if (item.avgLifeExpectancy <= 35) multiplier = 1.8;
    else if (item.avgLifeExpectancy <= 45) multiplier = 1.4;
    else if (item.avgLifeExpectancy <= 60) multiplier = 1.1;
    else if (item.avgLifeExpectancy <= 75) multiplier = 0.9;
    else multiplier = 0.7;

    return {
      eraName: item.theme,
      avgLifeExpectancy: item.avgLifeExpectancy,
      prevailingEpidemics: item.prevailingEpidemics,
      sanitationContext: item.sanitationContext,
      isEpidemicOutbreak: !!item.isEpidemicOutbreak,
      epidemicName: item.isEpidemicOutbreak ? item.theme : undefined,
      healthDecayMultiplier: multiplier,
    };
  }

  if (year < 1860) {
    return {
      eraName: `${year}年清道光/咸豐年間（瘴癘草藥時代）`,
      avgLifeExpectancy: 31,
      prevailingEpidemics: ['惡性瘧疾 (瘴癘)', '霍亂 (虎列拉)', '天花', '傷寒'],
      sanitationContext: '無自來水與現代醫學，全台水媒傳染病盛行，依靠漢方草藥與王爺宮廟問卜，嬰幼兒夭折率高達250‰。',
      isEpidemicOutbreak: false,
      healthDecayMultiplier: 1.8,
    };
  }
  if (year <= 1894) {
    return {
      eraName: `${year}年清同治/光緒年間開港通商時期`,
      avgLifeExpectancy: 33,
      prevailingEpidemics: ['惡性瘧疾', '霍亂', '天花', '阿米巴痢疾'],
      sanitationContext: '西方教會醫師引進金雞納霜抗瘧，但整體公共衛生尚未建立，四十歲即為高壽。',
      isEpidemicOutbreak: false,
      healthDecayMultiplier: 1.6,
    };
  }
  if (year <= 1919) {
    return {
      eraName: `${year}年日治前期（公衛現代化與大流行抗擊期）`,
      avgLifeExpectancy: 36,
      prevailingEpidemics: ['鼠疫 (黑死病)', '霍亂', '西班牙流感', '瘧疾'],
      sanitationContext: '總督府引進避病院、公醫制、自來水水道與定期滅鼠大掃除，全島抗擊大傳染病。',
      isEpidemicOutbreak: year === 1918 || year === 1896 || year === 1900,
      epidemicName: year === 1918 ? '西班牙流感' : year === 1896 ? '鼠疫大流行' : undefined,
      healthDecayMultiplier: 1.4,
    };
  }
  if (year <= 1945) {
    return {
      eraName: `${year}年日治中後期（近代防疫與戰時體制）`,
      avgLifeExpectancy: 45,
      prevailingEpidemics: ['肺結核 (癆病)', '局地瘧疾', '砂眼', '營養不良'],
      sanitationContext: '鼠疫天花絕跡，自來水普及；但肺結核仍為頭號殺手，戰時藥品短缺、避難衛生條件嚴苛。',
      isEpidemicOutbreak: year >= 1941,
      healthDecayMultiplier: 1.2,
    };
  }
  if (year <= 1970) {
    return {
      eraName: `${year}年戰後美援時期（抗生素普及與傳染病撲滅）`,
      avgLifeExpectancy: 60,
      prevailingEpidemics: ['小兒麻痺症', '肺結核', '砂眼', 'B型肝炎'],
      sanitationContext: '美援引進沙賓疫苗、卡介苗與盤尼西林，全台大規模滅蚊，1965年成功撲滅瘧疾。',
      isEpidemicOutbreak: year === 1952 || year === 1957 || year === 1962,
      epidemicName: year === 1952 ? '小兒麻痺大流行' : year === 1957 ? '亞洲流感' : undefined,
      healthDecayMultiplier: 1.0,
    };
  }
  if (year <= 1994) {
    return {
      eraName: `${year}年經濟起飛期（慢性病轉型與B肝疫苗先驅）`,
      avgLifeExpectancy: 73,
      prevailingEpidemics: ['心血管疾病', '中風', '慢性肝病', '登革熱'],
      sanitationContext: '由急慢性傳染病轉型為慢性非傳染病，1984年領先全球普及新生兒B肝疫苗。',
      isEpidemicOutbreak: year === 1984 || year === 1988,
      epidemicName: year === 1988 ? '登革熱大流行' : undefined,
      healthDecayMultiplier: 0.9,
    };
  }
  if (year <= 2026) {
    return {
      eraName: `${year}年全民健保與現代醫學時代`,
      avgLifeExpectancy: 81,
      prevailingEpidemics: ['腸病毒', 'SARS (2003)', 'COVID-19 (2020-2022)', '癌症'],
      sanitationContext: '全民健保提供全球頂尖醫療可近性，歷經SARS和平醫院封院抗疫與COVID-19三級警戒。',
      isEpidemicOutbreak: year === 1998 || year === 2003 || year === 2020 || year === 2021,
      epidemicName: year === 2003 ? 'SARS抗疫' : year >= 2020 && year <= 2021 ? 'COVID-19疫情' : undefined,
      healthDecayMultiplier: 0.7,
    };
  }

  return {
    eraName: `${year}年超高齡智慧永續時代`,
    avgLifeExpectancy: 86,
    prevailingEpidemics: ['高齡退化性疾病', '失智症', '極端氣候熱浪'],
    sanitationContext: '全台邁入超高齡社會，生醫科技、長照3.0與AI居家微電網守護百歲天年健康。',
    isEpidemicOutbreak: false,
    healthDecayMultiplier: 0.5,
  };
}

export function getTaiwanEraRecord(year: number): TaiwanEraRecord {
  if (TAIWAN_HISTORICAL_EVENTS[year]) {
    return TAIWAN_HISTORICAL_EVENTS[year];
  }
  const health = getTaiwanEraHealthProfile(year);
  return {
    year,
    theme: health.eraName,
    event: `歲次逢西元${year}年，台灣常民在${health.eraName}背景下勤勞耕耘、生息繁衍。`,
    influence: '常民順應時代大勢，在環境挑戰中傳承家族生計。',
    avgLifeExpectancy: health.avgLifeExpectancy,
    prevailingEpidemics: health.prevailingEpidemics,
    sanitationContext: health.sanitationContext,
    isEpidemicOutbreak: health.isEpidemicOutbreak,
  };
}

export function getTaiwanEraContext(year: number): string {
  const record = getTaiwanEraRecord(year);
  const epidemicText = record.prevailingEpidemics.length > 0
    ? ` 主要疾疫為${record.prevailingEpidemics.slice(0, 3).join('、')}。`
    : '';
  const outbreakNotice = record.isEpidemicOutbreak ? ' ⚠️【時代重大時疫/公衛關卡】' : '';

  return `${year}年台灣時代背景【${record.theme}】：${record.event}${outbreakNotice} 當代公衛環境：全台平均壽命約 ${record.avgLifeExpectancy} 歲。${epidemicText}${record.sanitationContext}`;
}
