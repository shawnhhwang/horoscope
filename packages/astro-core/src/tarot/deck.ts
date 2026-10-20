import { DrawnCard, SpreadType, TarotCard, TarotReadingResult, TarotSuit } from './types.js';

// 22 張大阿爾克那 (Major Arcana)
const MAJOR_ARCANA_DEFINITIONS: Omit<TarotCard, 'id'>[] = [
  {
    nameEn: 'The Fool',
    nameZh: '愚者',
    arcana: 'major',
    number: 0,
    element: '風',
    uprightMeaning: {
      keywords: ['冒險', '純真', '無限可能', '新起點'],
      overview: '放下成見與包袱，勇敢踏出未知的旅程，遵循直覺的指引。',
      love: '一段純真且自由無拘的戀情即將開啟，彼此沒有世俗壓力。',
      career: '全新的跨界嘗試或新項目啟動，富有前瞻性與創新機會。',
    },
    reversedMeaning: {
      keywords: ['魯莽', '盲目冒險', '缺乏責任', '猶豫不決'],
      overview: '需留意是否過於輕率或不計後果，避免未經深思的衝動行為。',
      love: '缺乏安全感或逃避承諾，感情中容易出現任性妄為。',
      career: '準備不足便倉促立項，可能面臨未預期的意外風險。',
    },
  },
  {
    nameEn: 'The Magician',
    nameZh: '魔術師',
    arcana: 'major',
    number: 1,
    element: '風',
    uprightMeaning: {
      keywords: ['創造力', '顯化', '掌握資源', '強大自信'],
      overview: '具備將思想化為現實的強大力量，所有必備的元素已俱全。',
      love: '展現出極富魅力與智慧的一面，溝通順暢，互動生動有趣。',
      career: '才華得到完美發揮，主導新專案並展現出色的組織統籌能力。',
    },
    reversedMeaning: {
      keywords: ['欺瞞', '才華浪費', '溝通障礙', '幻覺'],
      overview: '警惕口蜜腹劍或能力未善加運用，避免因自我膨脹而失信於人。',
      love: '缺乏真誠交流，可能存在言不由衷或花言巧語的隱患。',
      career: '技巧不足或過度投機，需踏實積累專業基礎再行出擊。',
    },
  },
  {
    nameEn: 'The High Priestess',
    nameZh: '女祭司',
    arcana: 'major',
    number: 2,
    element: '水',
    uprightMeaning: {
      keywords: ['直覺', '潛意識', '靈性智慧', '內在洞見'],
      overview: '靜觀其變，向內探尋真實答案。你的直覺往往比理性分析更為精準。',
      love: '含蓄深沉的心靈默契，彼此心照不宣，情感平靜而恆久。',
      career: '適合深思熟慮、調研與策劃，避免急躁決策，等待真相自然顯現。',
    },
    reversedMeaning: {
      keywords: ['情緒壓抑', '忽視直覺', '冷漠孤立', '表面化'],
      overview: '內心矛盾壓抑，或者對外部世界過度防備，導致心靈閉塞。',
      love: '態度冷淡或猜忌，難以坦誠向對方打開心扉。',
      career: '資訊不對稱或判斷失誤，需多聆聽理性客觀的專業反饋。',
    },
  },
  {
    nameEn: 'The Empress',
    nameZh: '皇后',
    arcana: 'major',
    number: 3,
    element: '土',
    uprightMeaning: {
      keywords: ['豐盛', '滋養', '母性溫暖', '藝術創造'],
      overview: '孕育豐碩成果的黃金時刻，享受生活之美，充滿包容與慈愛。',
      love: '溫馨甜蜜、彼此深情照料的成熟關係，容易開花結果。',
      career: '項目進入繁盛豐收期，資源充沛，團隊氛圍和諧融洽。',
    },
    reversedMeaning: {
      keywords: ['過度保護', '資源浪費', '創造力受阻', '情感依賴'],
      overview: '警惕窒息式的控制或溺愛，注意個人物質開銷與情緒健康平衡。',
      love: '過度黏人或因付出過多而心生怨懟，需學會給彼此獨立空間。',
      career: '進度拖延或資源配置失衡，宜重整節奏再求發展。',
    },
  },
  {
    nameEn: 'The Emperor',
    nameZh: '皇帝',
    arcana: 'major',
    number: 4,
    element: '火',
    uprightMeaning: {
      keywords: ['權威', '秩序', '堅定意志', '領導統御'],
      overview: '建立穩固的規則與邊界，以成熟剛毅的姿態主導事態前進。',
      love: '可靠沉穩的伴侶形象，給予堅實的保護與責任承諾。',
      career: '事業掌控力極強，升遷掌權之象，善用制度與決斷力達成目標。',
    },
    reversedMeaning: {
      keywords: ['專制蠻橫', '僵化死板', '權力失控', '軟弱無力'],
      overview: '過度嚴苛導致人際緊繃，或是在重壓之下缺乏足夠的魄力破局。',
      love: '大男人/大女人主義過重，溝通缺乏溫度與彈性。',
      career: '管理體系過於死板僵化，抑或領導無方導致團隊軍心渙散。',
    },
  },
  {
    nameEn: 'The Hierophant',
    nameZh: '教皇',
    arcana: 'major',
    number: 5,
    element: '土',
    uprightMeaning: {
      keywords: ['精神導師', '傳統智慧', '契約盟誓', '指引解惑'],
      overview: '遵循倫理規範與經典智慧，貴人或前輩將給予關鍵的人生指引。',
      love: '受到祝福的正統良緣，雙方價值觀契合，利於步入婚姻殿堂。',
      career: '適合在大型機構、成熟體制中循序漸進，多向資深導師請教。',
    },
    reversedMeaning: {
      keywords: ['盲從教條', '偽善偏見', '破除陳規', '特立獨行'],
      overview: '挑戰不合理的體制與框架，或警惕被錯誤的權威言論誤導。',
      love: '受到家庭世俗眼光阻撓，或在觀念上難以達成共識。',
      career: '不適應僵化教條，渴望突破傳統模式進行自主創新。',
    },
  },
  {
    nameEn: 'The Lovers',
    nameZh: '戀人',
    arcana: 'major',
    number: 6,
    element: '風',
    uprightMeaning: {
      keywords: ['靈魂吸引', '重大抉擇', '真誠和諧', '深度契合'],
      overview: '不僅代表愛情的甜蜜，更象徵遵循內心真正價值觀的關鍵抉擇。',
      love: '強烈的身心靈吸引，彼此尊重支持，是難得的靈魂伴侶體驗。',
      career: '絕佳的商業夥伴合作關係，雙方優勢互補，理念高度一致。',
    },
    reversedMeaning: {
      keywords: ['價值觀分歧', '猶豫兩難', '承諾破裂', '誘惑考驗'],
      overview: '面臨道德或情感的誘惑，抉擇困難，容易因逃避而引發內在衝突。',
      love: '溝通不暢導致隔閡，或面臨第三者干擾與價值觀衝突。',
      career: '合作夥伴之間出現信任危機，契約履行困難。',
    },
  },
  {
    nameEn: 'The Chariot',
    nameZh: '戰車',
    arcana: 'major',
    number: 7,
    element: '水',
    uprightMeaning: {
      keywords: ['勝利', '意志力', '克服衝突', '全速前進'],
      overview: '駕馭內心互相對立的慾望，以高度專注的意志力突破萬難斬獲勝利。',
      love: '主動追求並排除萬難，以堅定真誠贏得對方的青睞與認同。',
      career: '事業勢如破竹，競爭中脫穎而出，目標明確且執行力極強。',
    },
    reversedMeaning: {
      keywords: ['失控脫軌', '挫折受阻', '過度好鬥', '缺乏方向'],
      overview: '情緒或節奏失控，可能因操之過急或剛愎自用而導致事態陷入混亂。',
      love: '爭吵衝突加劇，雙方各執己見，缺乏包容而互不相讓。',
      career: '進展遭遇瓶頸障礙，需暫緩步伐重新調整策略方向。',
    },
  },
  {
    nameEn: 'Strength',
    nameZh: '力量',
    arcana: 'major',
    number: 8,
    element: '火',
    uprightMeaning: {
      keywords: ['柔能克剛', '內在勇氣', '耐心馴服', '同理心'],
      overview: '真正的力量源自溫柔與寬容，以愛與耐心化解狂暴的衝動。',
      love: '以理解與包容化解對方的固執，感情深厚且具備強大的修復力。',
      career: '以柔克剛的高超人際手腕，善於協調複雜衝突，贏得團隊由衷敬重。',
    },
    reversedMeaning: {
      keywords: ['缺乏自信', '軟弱妥協', '脾氣失控', '內在恐懼'],
      overview: '感到身心俱疲或被負面情緒壓倒，懷疑自我能力而產生退縮。',
      love: '情緒失衡或失去安全感，容易對伴侶胡亂發脾氣。',
      career: '面臨困難時信心動搖，需重拾內心自律與沉穩勇氣。',
    },
  },
  {
    nameEn: 'The Hermit',
    nameZh: '隱士',
    arcana: 'major',
    number: 9,
    element: '土',
    uprightMeaning: {
      keywords: ['沉思自省', '內在追尋', '孤獨明燈', '深沉智慧'],
      overview: '退離嘈雜喧囂的世界，在孤獨中點亮內在提燈，探求真理本質。',
      love: '享受精神層面的沉澱，亦或雙方給予彼此足夠的獨立思考空間。',
      career: '專注於深耕專業領域、研發與學術探索，厚積薄發。',
    },
    reversedMeaning: {
      keywords: ['孤僻自閉', '迷失方向', '拒絕溝通', '過度退縮'],
      overview: '與外界切斷聯繫過甚，陷入盲目的自我懷疑或思想死胡同。',
      love: '過於冷漠疏離，讓對方感受不到溫暖與在意。',
      career: '缺乏團隊協作意識，容易在細節中鑽牛角尖而延誤大局。',
    },
  },
  {
    nameEn: 'Wheel of Fortune',
    nameZh: '命運之輪',
    arcana: 'major',
    number: 10,
    element: '火',
    uprightMeaning: {
      keywords: ['命運轉折', '機遇順境', '宿命因緣', '週期律動'],
      overview: '人生迎來全新上升週期，順應天時地利，把握天賜良機。',
      love: '命定之緣的相逢，感情迎來重大突破或關鍵進展。',
      career: '事業迎來由逆轉順的黃金轉機，貴人出現，運勢大開。',
    },
    reversedMeaning: {
      keywords: ['波折阻滯', '抗拒變革', '時機未至', '週期低谷'],
      overview: '當前處於命運的低谷磨礪期，切勿盲目折騰，靜待轉機到來。',
      love: '感情進展受阻，外界不可抗力因素增多，考驗彼此耐心。',
      career: '投資或專案面臨外部環境不利衝擊，宜穩健防禦為上策。',
    },
  },
  {
    nameEn: 'Justice',
    nameZh: '正義',
    arcana: 'major',
    number: 11,
    element: '風',
    uprightMeaning: {
      keywords: ['公平正直', '因果業力', '清晰判斷', '法律契約'],
      overview: '種善因得善果，以客觀理性的天平權衡利弊，做出無愧於心的決策。',
      love: '坦誠平等的健康關係，凡事講道理並相互尊重彼此界線。',
      career: '合同簽署順利，法律訴訟占優，業務處置公道透明獲得好評。',
    },
    reversedMeaning: {
      keywords: ['不公不義', '偏袒偏激', '逃避責任', '法律糾紛'],
      overview: '面臨不公對待或自身處事有失偏頗，需正視過去的錯誤並承擔代價。',
      love: '感情中計較得失、互相指責，缺乏共情與體諒。',
      career: '合同條款暗藏陷阱，或內部管理偏私引發員工不滿。',
    },
  },
  {
    nameEn: 'The Hanged Man',
    nameZh: '倒吊人',
    arcana: 'major',
    number: 12,
    element: '水',
    uprightMeaning: {
      keywords: ['換位思考', '自我犧牲', '等待開悟', '臣服接納'],
      overview: '暫時停下腳步以倒轉視角審視人生，犧牲眼前的短暫利益換取更宏大的開悟。',
      love: '心甘情願為彼此付出，換位思考讓心靈更加貼近。',
      career: '進入蓄力等待期，不急於爭權奪利，從逆境中領悟創新之道。',
    },
    reversedMeaning: {
      keywords: ['無謂犧牲', '固執抱怨', '停滯不前', '自憐自艾'],
      overview: '自我感動式的犧牲並未換來回報，徒增挫折與無力感，需打破僵局。',
      love: '一廂情願的卑微討好，容易在關係中失去自我尊嚴。',
      career: '白費力氣或策略失誤，需停止無謂的耗損及時止損。',
    },
  },
  {
    nameEn: 'Death',
    nameZh: '死神',
    arcana: 'major',
    number: 13,
    element: '水',
    uprightMeaning: {
      keywords: ['終結與重生', '重大蛻變', '告別舊過往', '徹底斷捨離'],
      overview: '舊有的循環徹底結束，唯有勇敢放下腐朽的過去，嶄新的生命力才能破土重生。',
      love: '告別不健康的過往情感糾葛，迎來洗滌重生的全新開始。',
      career: '舊有業務模式瓦解轉型，陣痛期後迎來全新的生機與機遇。',
    },
    reversedMeaning: {
      keywords: ['抗拒改變', '苟延殘喘', '恐懼結束', '停滯沼澤'],
      overview: '明知事態已無法挽回卻死死不放，沉溺於過去的執念中無法自拔。',
      love: '勉強維持名存實亡的關係，徒增痛苦與互相折磨。',
      career: '抗拒產業革新變局，固步自封將導致競爭力徹底喪失。',
    },
  },
  {
    nameEn: 'Temperance',
    nameZh: '節制',
    arcana: 'major',
    number: 14,
    element: '火',
    uprightMeaning: {
      keywords: ['中庸平衡', '調和融合', '身心自癒', '耐心節制'],
      overview: '將兩股截然不同的力量巧妙調和，心境祥和寧靜，循序漸進達到完美境界。',
      love: '細水長流的默契交流，彼此相濡以沫，感情穩定持久。',
      career: '跨界整合順暢，資源配置恰到好處，事情在平和節奏中穩步推進。',
    },
    reversedMeaning: {
      keywords: ['失衡極端', '缺乏自制', '溝通斷裂', '身心失調'],
      overview: '過度放縱或走極端，導致身心失調，需及時重置生活的平衡支點。',
      love: '缺乏溝通耐心，容易因生活瑣事爆發摩擦與冷戰。',
      career: '資源衝突難以協調，合作各方同床異夢，進度混亂。',
    },
  },
  {
    nameEn: 'The Devil',
    nameZh: '惡魔',
    arcana: 'major',
    number: 15,
    element: '土',
    uprightMeaning: {
      keywords: ['物質誘惑', '執念束縛', '本能慾望', '金錢上癮'],
      overview: '被表面的物質、慾望或盲目崇拜所束縛，需認清究竟是誰鎖住了自己的雙手。',
      love: '充滿致命吸引力但可能帶有佔有慾與不健康的依附關係。',
      career: '追求短期暴利但可能承擔道德或合規風險，警惕利益陷阱。',
    },
    reversedMeaning: {
      keywords: ['掙脫枷鎖', '覺醒破局', '看破執念', '重獲自由'],
      overview: '終於意識到束縛自己的枷鎖本是虛妄，勇於斬斷不良習慣重獲心靈自由。',
      love: '看清有毒關係的真相，果斷抽身離開，重拾自信與自愛。',
      career: '擺脫被動受制於人的困局，重新拿回事業自主權。',
    },
  },
  {
    nameEn: 'The Tower',
    nameZh: '高塔',
    arcana: 'major',
    number: 16,
    element: '火',
    uprightMeaning: {
      keywords: ['突發劇變', '幻想破滅', '雷霆一擊', '不可抗力'],
      overview: '建立在虛妄假象上的高塔被雷電擊潰，雖然震撼，卻徹底掃除了隱患。',
      love: '隱藏的矛盾突然爆發，帶來關係的劇烈震盪或破裂。',
      career: '突發危機事件或團隊重大重組，迫使你必須在廢墟上重新出發。',
    },
    reversedMeaning: {
      keywords: ['化險為夷', '避免崩潰', '內心劇震', '餘震未平'],
      overview: '危機的破壞力稍顯緩和，或是內心深處正經歷一場悄無聲息的信念重組。',
      love: '勉強度過分手危機，但彼此內心的裂痕仍需長期用心修補。',
      career: '僥倖躲過重大損失，但警鐘已然敲響，必須立即排查內部隱患。',
    },
  },
  {
    nameEn: 'The Star',
    nameZh: '星星',
    arcana: 'major',
    number: 17,
    element: '風',
    uprightMeaning: {
      keywords: ['希望曙光', '心靈療癒', '靈感啟發', '純淨願景'],
      overview: '黑夜過後的第一道星光，內心創傷得到撫平，對未來重燃純淨而堅定的希望。',
      love: '真誠治癒的美好戀情，彼此如繁星般互相照亮，充滿溫柔。',
      career: '靈感泉湧，創意項目獲得高度認可，前途光明坦蕩。',
    },
    reversedMeaning: {
      keywords: ['失去信心', '悲觀沮喪', '不切實際', '懷才不遇'],
      overview: '一時陷入悲觀迷茫，看不清前路，需重燃心中的信念之火。',
      love: '對感情抱持過於虛幻的期待，或是因自卑而不敢勇敢追求。',
      career: '策劃案流於空想缺乏落地步驟，或付出未獲及時認可感到沮喪。',
    },
  },
  {
    nameEn: 'The Moon',
    nameZh: '月亮',
    arcana: 'major',
    number: 18,
    element: '水',
    uprightMeaning: {
      keywords: ['迷茫焦慮', '潛意識恐懼', '幻覺隱密', '真相未明'],
      overview: '月光下陰影重重，事物輪廓模糊不清，需提防欺瞞與內心恐懼作祟。',
      love: '充滿猜疑與不安，隱密的事情尚未浮出水面，情緒起伏劇烈。',
      career: '前景不明朗，充斥著謠言與不確定性，切勿輕舉妄動盲目投資。',
    },
    reversedMeaning: {
      keywords: ['雲開霧散', '真相大白', '破除焦慮', '走出陰霾'],
      overview: '迷局漸漸散去，掩蓋的真相浮現，內心的焦慮恐懼被理性之光驅散。',
      love: '解除誤會，看清彼此真實面貌，感情回歸真實坦誠。',
      career: '幕後黑手或潛在危機被揭示，問題找到根源，局面逐步受控。',
    },
  },
  {
    nameEn: 'The Sun',
    nameZh: '太陽',
    arcana: 'major',
    number: 19,
    element: '火',
    uprightMeaning: {
      keywords: ['無比輝煌', '生命活力', '光明磊落', '喜悅成功'],
      overview: '光芒萬丈，萬物生長。象徵無可抵擋的成功、由衷的喜悅與赤子之心。',
      love: '陽光開朗、熱情洋溢的幸福愛情，充滿歡聲笑語與光明前景。',
      career: '事業達到巔峰榮耀，廣受讚譽與支持，成績斐然。',
    },
    reversedMeaning: {
      keywords: ['暫時陰霾', '自負驕橫', '精力透支', '延遲成功'],
      overview: '陽光暫被薄雲遮擋，成功雖然會稍微延遲，但總體大局依然向好。',
      love: '感情大致良好，但偶有因任性或自我中心產生的小彆扭。',
      career: '取得成就時需保持謙卑，注意防止因精力過度透支而感到疲倦。',
    },
  },
  {
    nameEn: 'Judgement',
    nameZh: '審判',
    arcana: 'major',
    number: 20,
    element: '火',
    uprightMeaning: {
      keywords: ['靈魂召喚', '重生覺醒', '關鍵轉捩點', '清算解脫'],
      overview: '命運的號角吹響，重大的決定已經做出，迎來心靈與命運的徹底重生。',
      love: '關係迎來關鍵的本質昇華，復合、定終身或大徹大悟之刻。',
      career: '付出的長期努力終於迎來公正評價，通過考驗登上更高階舞台。',
    },
    reversedMeaning: {
      keywords: ['逃避召喚', '猶豫自責', '錯失良機', '悔不當初'],
      overview: '內心明明聽到了召喚卻因恐懼而裝聾作啞，容易錯過改變命運的窗口期。',
      love: '反覆糾纏過去的恩怨，無法做出決斷而讓彼此陷入消耗。',
      career: '決策猶豫不決，對自身實力缺乏正確客觀的評估。',
    },
  },
  {
    nameEn: 'The World',
    nameZh: '世界',
    arcana: 'major',
    number: 21,
    element: '土',
    uprightMeaning: {
      keywords: ['圓滿完成', '身心合一', '大成之境', '全新旅程'],
      overview: '一個偉大週期的完美謝幕與圓滿收官，身心靈達到前所未有的和諧與自由。',
      love: '修成正果的美好結局，共同構建圓滿幸福的人生新篇章。',
      career: '重大項目圓滿竣工，載譽而歸，成為行業領軍者並準備開啟下一個征程。',
    },
    reversedMeaning: {
      keywords: ['臨門一腳', '尚未收尾', '延宕拖延', '缺乏最後一塊拼圖'],
      overview: '雖然已極度接近成功，但仍有最後的關鍵細節需要耐心收尾，切勿鬆懈。',
      love: '差一點便能開花結果，需克服最後的現實阻礙方能定局。',
      career: '項目收尾工作繁雜，需打起精神完成最後驗收工作。',
    },
  },
];

// 產生完整 78 張牌庫
export function generateFullDeck(): TarotCard[] {
  const cards: TarotCard[] = [];

  // 1. 加入 22 張大阿爾克那
  MAJOR_ARCANA_DEFINITIONS.forEach((def, idx) => {
    cards.push({
      id: idx,
      ...def,
    });
  });

  // 2. 加入 56 張小阿爾克那
  const suits: { suit: TarotSuit; nameZh: string; element: '火' | '水' | '風' | '土' }[] = [
    { suit: 'wands', nameZh: '權杖', element: '火' },
    { suit: 'cups', nameZh: '聖杯', element: '水' },
    { suit: 'swords', nameZh: '寶劍', element: '風' },
    { suit: 'pentacles', nameZh: '星幣', element: '土' },
  ];

  let cardId = 22;
  suits.forEach((s) => {
    // 1(Ace) ~ 10
    for (let num = 1; num <= 10; num++) {
      const numLabel = num === 1 ? '首牌 (Ace)' : `${num}`;
      cards.push({
        id: cardId++,
        nameEn: `${s.suit} ${num}`,
        nameZh: `${s.nameZh}${numLabel}`,
        arcana: 'minor',
        suit: s.suit,
        number: num,
        element: s.element,
        uprightMeaning: {
          keywords: [`${s.nameZh}能量`, '積極順行', '專注行動'],
          overview: `${s.nameZh}元素正位顯化，象徵在${s.element}屬性領域具備主動且協調的創造力。`,
          love: `感情中展現出真誠主動的一面，彼此信任加深。`,
          career: `工作進度推進順暢，掌握了關鍵的執行資源與要領。`,
        },
        reversedMeaning: {
          keywords: [`${s.nameZh}阻滯`, '精力分散', '需重整節奏'],
          overview: `${s.nameZh}能量過剩或匱乏，需要放緩節奏檢視內外平衡。`,
          love: `溝通節奏錯位，需多些體貼與聆聽。`,
          career: `執行中出現小波折，宜重新梳理流程後再繼續。`,
        },
      });
    }

    // 4 張宮廷牌 (侍從 Page, 騎士 Knight, 王后 Queen, 國王 King)
    const courtCards = [
      { num: 11, title: '侍從 (Page)' },
      { num: 12, title: '騎士 (Knight)' },
      { num: 13, title: '王后 (Queen)' },
      { num: 14, title: '國王 (King)' },
    ];

    courtCards.forEach((court) => {
      cards.push({
        id: cardId++,
        nameEn: `${s.suit} ${court.title}`,
        nameZh: `${s.nameZh}${court.title}`,
        arcana: 'minor',
        suit: s.suit,
        number: court.num,
        element: s.element,
        uprightMeaning: {
          keywords: [`${s.nameZh}人格`, '能力發揮', '掌控局面'],
          overview: `象徵具備${s.nameZh}成熟特質的人物或自身相應人格的完美顯現。`,
          love: `在感情中展現出可靠迷人的特質，給予堅定的支持。`,
          career: `領導統御或專業執行力受到高度肯定，扮演關鍵角色。`,
        },
        reversedMeaning: {
          keywords: ['不成熟表現', '情緒失衡', '缺乏耐心'],
          overview: `警惕任性或缺乏擔當的消極行為，需提升成熟度與包容力。`,
          love: `關係中偶有孩子氣或固執己見的小爭執。`,
          career: `處事不夠老練，需虛心接受前輩的指點與批評。`,
        },
      });
    });
  });

  return cards;
}

// 牌陣槽位定義
const SPREAD_CONFIGS: Record<SpreadType, { title: string; count: number; positions: { name: string; meaning: string }[] }> = {
  single: {
    title: '每日神諭單張牌陣',
    count: 1,
    positions: [{ name: '核心指引', meaning: '當下情勢之本質與心靈啟迪' }],
  },
  three_cards: {
    title: '時間之流三張牌陣',
    count: 3,
    positions: [
      { name: '過去因由', meaning: '導致當前局面的過往根源' },
      { name: '現在態勢', meaning: '目前所處的實際環境與心態' },
      { name: '未來趨勢', meaning: '若維持當前狀態之未來演變' },
    ],
  },
  holy_triangle: {
    title: '身心靈聖三角牌陣',
    count: 3,
    positions: [
      { name: '物質與身體', meaning: '現實生活、身體精力與物質基礎' },
      { name: '心智與情緒', meaning: '思想觀念、心理狀態與情緒模式' },
      { name: '靈魂與直覺', meaning: '高我靈性召喚與內在最高指引' },
    ],
  },
  two_choices: {
    title: '二選一抉擇牌陣',
    count: 5,
    positions: [
      { name: '現狀核心', meaning: '當前所面臨的決策本質' },
      { name: '選擇 A 的路徑', meaning: '採取第一種選項將面臨的過程' },
      { name: '選擇 A 的結局', meaning: '第一種選項最終可能獲得的成果' },
      { name: '選擇 B 的路徑', meaning: '採取第二種選項將面臨的過程' },
      { name: '選擇 B 的結局', meaning: '第二種選項最終可能獲得的成果' },
    ],
  },
  celtic_cross: {
    title: '經典塞爾特十字牌陣',
    count: 10,
    positions: [
      { name: '1. 現狀核心', meaning: '問題的當前本質與核心處境' },
      { name: '2. 阻礙與助力', meaning: '當前橫在面前的挑戰或直接助力' },
      { name: '3. 潛意識根基', meaning: '深層隱藏的動機與潛意識基礎' },
      { name: '4. 過去經歷', meaning: '剛過去不久且仍發揮影響的事件' },
      { name: '5. 顯意識目標', meaning: '你所期望達成的目標與顯性態度' },
      { name: '6. 即將到來', meaning: '即將顯化並發生的下一步' },
      { name: '7. 自我心態', meaning: '你如何看待自己在這件事情中的位置' },
      { name: '8. 外部環境', meaning: '周圍他人、社會與家庭對你的態度' },
      { name: '9. 希望與恐懼', meaning: '內心深處最渴望或最擔憂的隱密焦點' },
      { name: '10. 最終歸宿', meaning: '在所有力量匯聚之下的最終結局' },
    ],
  },
};

/**
 * 隨機洗牌並抽取牌陣
 */
export function drawTarotSpread(spreadType: SpreadType = 'three_cards', customDrawnCardIds?: { id: number; isReversed: boolean }[]): TarotReadingResult {
  const deck = generateFullDeck();
  const config = SPREAD_CONFIGS[spreadType] || SPREAD_CONFIGS.three_cards;

  const drawn: DrawnCard[] = [];

  if (customDrawnCardIds && customDrawnCardIds.length >= config.count) {
    for (let i = 0; i < config.count; i++) {
      const item = customDrawnCardIds[i];
      const card = deck.find((c) => c.id === item.id) || deck[i];
      drawn.push({
        card,
        isReversed: item.isReversed,
        positionIndex: i + 1,
        positionName: config.positions[i].name,
        positionMeaning: config.positions[i].meaning,
      });
    }
  } else {
    // Fisher-Yates 隨機洗牌
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    for (let i = 0; i < config.count; i++) {
      const isReversed = Math.random() < 0.35; // 35% 逆位機率
      drawn.push({
        card: shuffled[i],
        isReversed,
        positionIndex: i + 1,
        positionName: config.positions[i].name,
        positionMeaning: config.positions[i].meaning,
      });
    }
  }

  return {
    spreadType,
    spreadTitle: config.title,
    drawnCards: drawn,
    timestamp: new Date().toISOString(),
    overallAdvice: `牌陣呈現能量流動：在【${drawn[0].positionName}】抽得【${drawn[0].card.nameZh}】(${drawn[0].isReversed ? '逆位' : '正位'})，指引你正視內心真實感受，以智慧調和外部環境，命運的主導權始終握於自我手中。`,
  };
}
