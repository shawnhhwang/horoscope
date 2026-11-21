export function synthesizeZiweiReply(rawInput: any, lastUserMsg: string, calculateTrueSolarTime: any, calculateZiweiChart: any): string {
  let raw = rawInput || {};
  if ((!raw.palaces || Object.keys(raw.palaces).length === 0) && (raw.birthDate || raw.birthDateTime)) {
    try {
      const std = new Date(raw.birthDate || raw.birthDateTime);
      const solar = calculateTrueSolarTime(std, Number(raw.longitude || 120));
      raw = calculateZiweiChart(solar.trueSolarTime, (raw.gender as any) || '男');
    } catch {}
  }

  const palacesList: any[] = Array.isArray(raw.palacesList)
    ? raw.palacesList
    : Array.isArray(raw.palaces)
    ? raw.palaces
    : typeof raw.palaces === 'object' && raw.palaces !== null
    ? Object.values(raw.palaces)
    : [];
  const mingPalace =
    palacesList.find((p: any) => p?.name === '命宮' || p?.isMingPalace) ||
    palacesList[0] ||
    (raw.palaces && raw.lifePalaceBranch ? raw.palaces[raw.lifePalaceBranch] : null);
  const stars = Array.isArray(mingPalace?.majorStars)
    ? mingPalace.majorStars.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join('、')
    : '主星';
  const bureau = raw.fiveElementBureau || raw.elementBureau || '本命局';
  const lifeBranch = raw.lifePalaceBranch || mingPalace?.branch || mingPalace?.name || '命宮';

  const patterns: any[] = Array.isArray(raw.patterns) ? raw.patterns : [];
  const patternContent = patterns.length > 0
    ? patterns.slice(0, 3).map((pt) => {
        const condStr = pt.conditions?.required?.length ? `（成立條件：${pt.conditions.required.join('；')}）` : '';
        const breakStr = pt.conditions?.breaking?.length ? `\n  - ⚠️ **破格警示**：${pt.conditions.breaking.join('；')}` : '';
        return `* **【${pt.name}】**（${pt.source || '正統三合古籍'}）${condStr}\n  - ${pt.description}${breakStr}`;
      }).join('\n')
    : '* **【三合中正格】**：命盤星曜配置端正，以本命三方四正星曜廟旺為依歸，宜行穩致遠。';

  const mingSummary = raw.mingGongSummary;
  const natureDesc = mingSummary?.nature ? `，命格星性為「**${mingSummary.nature}**」` : '';
  const keywordsDesc = mingSummary?.keywords?.length ? `，核心稟賦特質含：${mingSummary.keywords.join('、')}` : '';

  return `## 現代紫微斗數專業命理諮詢診斷報告（融匯古典三合天機心法 · 由程式庫精密排定）

依據您當前排盤：命宮安於「**${lifeBranch}**」宮，五行局為「**${bureau}**」，命宮內見主星「**${stars || '無主星（借對宮觀之）'}**」坐守${natureDesc}${keywordsDesc}。

針對您的諮詢重點：「**${lastUserMsg}**」，為您進行結構化專業解析：

### 1. 命身格局與核心特質（命宮為本）
* **星系原型與稟賦**：命宮主星「${stars}」體現出您在思維上具備高度前瞻性與自我期許。三合易理心法指出：「命宮決定先天性格基石，三方為後天用武之地。」

### 2. 命盤經典格局辨識與三合心法評斷
${patternContent}

### 3. 三方四正星系連動與四化動能
* **三方為用**：財帛、官祿、遷移三方互拱，凡事宜借勢謀定而後動，在專業技術或核心業務上建立不可替代的護城河。
* **四化時機**：當前運勢焦點落於「化祿開拓機遇」與「化權承擔責任」的交互作用期。

### 4. 具體可落地的實踐方針（人事與空間 2/3 大於 1/3 法則）
1. **事業職場**：掌握「命宮為本，三方為用」，優先在符合主星特質的專業領域深耕。
2. **陽宅環境**：遵循「名位相等原則」，居住環境採光通風充足，以優良地氣補強先天命運之不足。
3. **人生決策**：人事努力加上空間調適（2/3）必定大於天命（1/3），知果後主動修因，運勢自然漸入佳境。`;
}

export function synthesizeSynastryAndFamilyReply(modType: string, raw: any, lastUserMsg: string): string {
  if (modType === 'BAZI_SYNASTRY') {
    const p1Name = raw.person1?.name || '男方 (乾造)';
    const p2Name = raw.person2?.name || '女方 (坤造)';
    const score = raw.score || 85;
    const level = raw.level || '天作之合 · 琴瑟和鳴';
    const bridging = raw.bridgingElement?.element || '水';
    const bridgingExp = raw.bridgingElement?.explanation || '以五行通關轉化相剋。';
    const zh = raw.ziweiHeming;

    return `## 八字合婚與紫微雙軌合盤深度諮詢報告（融匯《滴天髓》與三合雙宮聯參心法）

審視【**${p1Name}**】與【**${p2Name}**】之合婚盤：綜合契合度為「**${score}分**」（**${level}**）${zh ? `，三合紫微合盤星級為「**${zh.starRating}**」（**${zh.destinyType}**）` : ''}。

針對雙方的關係諮詢與心靈叩問：「**${lastUserMsg}**」，為您進行多維度結構化專業剖析：

### 1. 子平八字日主情義與夫妻宮合沖評析
* **日元本質與吸引力**：${raw.dimensions?.dayMasterSynergy?.description || '雙方日主氣機相投，既有精神理念之深度共鳴，亦能彼此欣賞對方的性格優勢。'}
* **夫妻宮日支默契**：${raw.dimensions?.spousePalaceSynergy?.description || '夫妻宮地支氣候和諧，象徵雙方在婚後生活步調、家事分工與金錢觀念上具備高度默契。'}

### 2. 三合天機紫微雙宮聯參與五步合盤診斷
* **雙宮聯參鐵律（夫妻宮 + 福德宮）**：${zh?.dualPalacePrinciple || '看婚姻必須同時觀照夫妻宮與福德宮，福德宮穩固則夫妻深層情分綿長。'}

### 3. 五行通關金鑰與陽宅空間落地策略
1. **通關五行借力**：雙方關鍵通關五行為「**${bridging}**」；${bridgingExp}
2. **陽宅空間定位（2/3 > 1/3 定律）**：夫妻主臥室最宜安於住宅西北方（乾宮）或西南方（坤宮），構成「地天泰卦」。
3. **溝通與財務共識**：${raw.marriageAdvice?.emotionalCommunication || '建立每週固定心靈對話時間。'} ${raw.marriageAdvice?.financialManagement || ''}`;
  }

  const title = raw.familyTitle || '幸福同舟之家';
  const count = raw.memberCount || raw.members?.length || 3;
  const dominant = raw.householdAura?.dominantElement || '木';
  const lacking = raw.householdAura?.lackingElement || '水';
  const auraTitle = raw.householdAura?.auraTitle || '厚德載物 · 興家立業氣場';
  const rolesList = Array.isArray(raw.familyRoles)
    ? raw.familyRoles.map((r: any) => `* **${r.roleCategory}**：${r.membersAssigned?.join('、') || '全體協同'} — ${r.description}`).join('\n')
    : '* **家族舵手**：負責全局把控與方向引導。';
  const baguaList = Array.isArray(raw.members)
    ? raw.members
        .filter((m: any) => m?.baguaPosition)
        .map((m: any) => `* **${m.name}（${m.role}）**：本位【**${m.baguaPosition.direction} · ${m.baguaPosition.trigram}**】（${m.baguaPosition.familyTitle}）— ${m.baguaPosition.niMingWeiRule}`)
        .join('\n')
    : '* **乾父西北、坤母西南、震長子正東、巽長女東南**：依後天八卦各安其位。';

  return `## 家族命理與周易八卦空間家庭動力系統解析報告

審視【**${title}**】（共 ${count} 位家庭成員）之群盤氣場：家庭核心五行格局為「**${auraTitle}**」，優勢主導能量為「**${dominant}**」，相對匱乏五行為「**${lacking}**」。

針對家庭諮詢課題：「**${lastUserMsg}**」：
### 1. 家族核心角色定位與優勢互補
${rolesList}

### 2. 周易陽宅空間：後天八卦「名位相等」配置
${baguaList}

### 3. 家運昌隆與跨世代因材施教指南
1. **名位相等鐵律**：把位置擺對了自然長幼有序、心意調和；補強缺失五行「${lacking}」，增進全家健康與情緒穩定。`;
}

export function synthesizeWesternAndTarotReply(modType: string, rawInput: any, lastUserMsg: string, drawTarotSpread: any): string {
  if (modType === 'WESTERN') {
    const raw = rawInput || {};
    const planets: any[] = Array.isArray(raw.planets) ? raw.planets : [];
    const sun = planets.find((p: any) => p?.name === '太陽')?.sign || raw.sunSign || '白羊座';
    const moon = planets.find((p: any) => p?.name === '月亮')?.sign || raw.moonSign || '巨蟹座';
    const asc = raw.ascendantSign || raw.angles?.ascendantSign || planets.find((p: any) => p?.name === '上升點')?.sign || '上升座';
    const phase = raw.lunarPhase?.phaseName || '滿月';

    return `## 現代人本與心理占星深度解析報告（融匯榮格深層心理與當代占星宗師心法）

依據您的個人星盤：太陽落入「**${sun}**」，月亮駐守「**${moon}**」，上升點 (ASC) 落在「**${asc}**」，誕生於「**${phase}**」的月相能量原型。

針對您的心靈與現實叩問：「**${lastUserMsg}**」：
### 1. 日月升核心人格動力
* **太陽 (${sun}) 英雄之旅**：意識核心與個體化自我實現導向。
* **月亮 (${moon}) 安全感需索**：潛意識情感需求與內在滋養源泉。
* **上升 (${asc}) 面具與路徑**：初次與世界互動之濾鏡風格。

### 2. 榮格與人本占星宗師心法（個體化與陰影整合）
* **卡爾·榮格 (Carl Jung) 洞見**：「在潛意識被引導為意識之前，它將主宰你的人生，而你將稱其為命運。」覺察星盤即是照亮心靈陰影、邁向完整自我的起點。
* **丹·路德雅爾 (Dane Rudhyar) 心法**：「事件不會平白無故降臨，而是人在內在心理結構中呼喚了共振的經驗。」
* **莉茲·格林 (Liz Greene) 勉勵**：土星是靈魂的終極基石，今日的限制正是日後的專業厚度。`;
  }

  let raw = rawInput || {};
  if ((!raw.drawnCards || raw.drawnCards.length === 0) && raw.spreadType) {
    try { raw = drawTarotSpread(raw.spreadType); } catch {}
  }
  const spreadName = raw.spreadTitle || raw.spreadName || raw.spread?.label || '78張經典韋特塔羅牌陣';
  const drawnList: any[] = Array.isArray(raw.drawnCards) ? raw.drawnCards : Array.isArray(raw.cards) ? raw.cards : [];
  const cardNames = drawnList.map((c: any) => `【${c.card?.nameZh || c.name || '牌卡'}】(${c.isReversed ? '逆位' : '正位'})`).join('、') || '塔羅諸牌';
  const cardDetails = drawnList
    .map((d: any, idx: number) => {
      const card = d.card || d;
      const posName = d.positionName || `槽位 ${idx + 1}`;
      const revStr = d.isReversed ? '逆位' : '正位';
      const meaning = d.isReversed ? card.reversedMeaning : card.uprightMeaning;
      const ov = meaning?.overview || '牌面象徵當下能量的客觀映照。';
      return `* **【${posName}】**：抽得【**${card.nameZh || card.name}**】（${revStr}）— ${ov}`;
    })
    .join('\n');

  return `## 專業韋特塔羅心靈諮商啟示報告（抽牌由程式 Fisher-Yates 隨機演算法客觀抽出）

牌陣布局：「**${spreadName}**」｜抽取牌位：${cardNames}
針對疑惑：「**${lastUserMsg}**」

### 1. 牌位對應與潛意識盲點透視
${cardDetails || '* 正位牌卡象徵擁有的實質資源；逆位牌卡提示向內反思。'}

### 2. 韋特與當代塔羅宗師啟迪
* **愛德華·韋特 (A. E. Waite) 圖解之鑰**：大阿爾克那呈現從「愚者」純真起步、穿越試煉抵達覺悟的「愚人之旅（The Fool's Journey）」。
* **蕾切爾·波拉克 (Rachel Pollack) 啟示**：「塔羅牌不是預測不可更改的宿命，而是賦予我們看見內在真實、掌握自由意志的覺察工具。」
* **阿歷安度·佐杜洛夫斯基 (Alejandro Jodorowsky) 心法**：塔羅協助我們切除自我設限的幻象，直面當下力量。`;
}
