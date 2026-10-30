/**
 * 台灣近現代至未來重大歷史事件與公衛社會變遷映射庫 (1845 ~ 2060+)
 * 涵蓋：歷史大事紀、各年代人口平均壽命、主流傳染病與公共衛生型態
 * 賦予百歲流年推演高度在地化、擬真感、時代沉浸與生命脆弱度共鳴
 */

export interface TaiwanEraRecord {
  year: number;
  event: string;
  theme: string;
  influence: string;
  avgLifeExpectancy: number;      // 該年代當期全台居民平均預期壽命 (歲)
  prevailingEpidemics: string[]; // 該年代主流威脅之傳染病或疾厄型態
  sanitationContext: string;     // 當代公衛、醫療水準與防疫狀態描寫
  isEpidemicOutbreak?: boolean;  // 該年是否正處於重大傳染病流行或公衛轉折期
}

export const TAIWAN_HISTORICAL_EVENTS: Record<number, TaiwanEraRecord> = {
  // ==========================================
  // 1840 ~ 1850 年代 (清代道光/咸豐年間：水災瘟疫與分類械鬥)
  // 平均壽命約 31~32 歲；瘴癘、霍亂、天花、傷寒橫行，嬰幼兒夭折率高達 250‰
  // ==========================================
  1845: {
    year: 1845,
    event: '台灣西海岸雲林口湖爆發「金湖大水災」，海嘯暴雨吞噬數千人命，災後水體污染引發霍亂與瘴癘時疫大流行。',
    theme: '金湖大水災·時疫大流行',
    influence: '沿海聚落百廢待興，常民求神建醮送王船禳災，家族艱難撫孤重建生計。',
    avgLifeExpectancy: 31,
    prevailingEpidemics: ['霍亂 (虎列拉)', '惡性瘧疾 (瘴癘)', '天花', '傷寒'],
    sanitationContext: '無自來水與現代醫學，全台水媒傳染病盛行，依靠漢方草藥與王爺宮廟問卜保命。',
    isEpidemicOutbreak: true,
  },
  1848: {
    year: 1848,
    event: '彰化大地震重創中部，鹿港商賈與常民集資重修天后宮與龍山寺，沿海航運繁盛。',
    theme: '彰化大地震·鹿港郊商',
    influence: '家族商號修整店鋪，防範震後疫病蔓延，米糧鹽糖貿易熱絡。',
    avgLifeExpectancy: 31,
    prevailingEpidemics: ['惡性瘧疾 (瘴癘)', '天花', '痢疾'],
    sanitationContext: '常民生活刻苦，夏秋之交瘴癘熱病頻傳，四十不惑即屬高壽。',
  },
  1850: {
    year: 1850,
    event: '清廷咸豐帝即位，台灣海盜平定後內山樟腦腦灶興盛，洋商開始覬覦台灣天然資源。',
    theme: '樟腦初興·內山開墾',
    influence: '墾戶冒瘴癘之險深入丘陵提煉樟腦，生計獲利豐厚但風險極高。',
    avgLifeExpectancy: 32,
    prevailingEpidemics: ['惡性瘧疾 (瘴癘)', '天花', '霍亂'],
    sanitationContext: '入山墾殖極易染瘴癘熱病，民間廣用青草茶與雄黃避邪化毒。',
  },
  1853: {
    year: 1853,
    event: '台北爆發重大分類械鬥「頂下郊拚」，同安人退守大稻埕開闢新市街，大稻埕日後崛起為全台貿易中心。',
    theme: '頂下郊拚·大稻埕開端',
    influence: '族群遷徙重新安身立命，建立霞海城隍廟祈求庇佑身家健康與商業繁榮。',
    avgLifeExpectancy: 32,
    prevailingEpidemics: ['惡性瘧疾', '傷寒', '霍亂'],
    sanitationContext: '聚落密度增加致水溝惡臭，夏令霍亂時有蔓延。',
  },
  1858: {
    year: 1858,
    event: '英法聯軍逼迫清廷簽訂《天津條約》，台灣安平、淡水被指定為對外通商口岸。',
    theme: '天津條約·開港前夕',
    influence: '商埠買辦階層初露頭角，沿海商旅往來頻繁，帶來更多外來病原風險。',
    avgLifeExpectancy: 32,
    prevailingEpidemics: ['天花', '惡性瘧疾', '阿米巴痢疾'],
    sanitationContext: '天花每數年一次大流行，幼童多行吹痘法（人痘接種）以求存活。',
  },

  // ==========================================
  // 1860 ~ 1874 年代 (開港通商、西方現代醫療引入與牡丹社事件)
  // 平均壽命約 32~33 歲；馬雅各、馬偕引進金雞納霜與西醫，但全台仍為瘴癘之島
  // ==========================================
  1860: {
    year: 1860,
    event: '《北京條約》簽訂，淡水、安平、打狗（高雄）、雞籠（基隆）陸續正式開港，洋行林立，茶葉樟腦外銷啟動。',
    theme: '開港通商·洋行進駐',
    influence: '農村轉向種植包種茶與烏龍茶，青壯年湧入洋行擔任買辦、苦力與烘茶工。',
    avgLifeExpectancy: 32,
    prevailingEpidemics: ['惡性瘧疾', '霍亂', '天花'],
    sanitationContext: '外國水手常因染台灣瘴癘瘧疾喪命，稱台灣為「東方惡疾之島」。',
  },
  1862: {
    year: 1862,
    event: '戴潮春事件蔓延中部數年；全台南部夏秋爆發嚴重霍亂與瘴癘大流行。',
    theme: '戴潮春事件·南部大時疫',
    influence: '戰亂與瘟疫交加，物資米價飛漲，民眾閉門自守祈求王爺神兵除疫。',
    avgLifeExpectancy: 31,
    prevailingEpidemics: ['霍亂 (虎列拉)', '惡性瘧疾', '痢疾'],
    sanitationContext: '霍亂數日內奪人性命，全台多地設醮普渡祈求疫止。',
    isEpidemicOutbreak: true,
  },
  1865: {
    year: 1865,
    event: '英國長老教會馬雅各醫生抵達台南，設立台灣第一座現代西醫診所（新樓醫院前身），引進金雞納霜抗瘧疾。',
    theme: '馬雅各抵台·西醫開端',
    influence: '現代外科手術與西方奎寧藥品首次進入基層，常民自疑懼逐漸轉向求醫。',
    avgLifeExpectancy: 33,
    prevailingEpidemics: ['惡性瘧疾', '天花', '寄生蟲病'],
    sanitationContext: '金雞納霜治療瘧疾顯現神效，但西醫普及率仍極為有限。',
  },
  1867: {
    year: 1867,
    event: '美國商船羅妹號（Rover）在恆春半島遇難引發衝突，李仙得與斯卡羅大股頭卓杞篤簽訂南岬之盟。',
    theme: '羅妹號事件·南岬之盟',
    influence: '南台灣邊陲地位引發國際矚目，邊境貿易戒慎維穩。',
    avgLifeExpectancy: 33,
    prevailingEpidemics: ['惡性瘧疾', '傷寒', '霍亂'],
    sanitationContext: '恆春與南台灣熱帶林區惡性瘧疾極其嚴重，外人難以涉足。',
  },
  1871: {
    year: 1871,
    event: '八瑤灣琉球宮古島船難事件爆發，為日後牡丹社事件埋下伏筆。',
    theme: '琉球船難·南疆風雲',
    influence: '沿海防務日益吃緊，地方鄉勇戒備森嚴。',
    avgLifeExpectancy: 33,
    prevailingEpidemics: ['天花', '惡性瘧疾'],
    sanitationContext: '天花在各部落與街坊流竄，民間常以此作為幼童命運大考驗。',
  },
  1872: {
    year: 1872,
    event: '加拿大長老教會馬偕牧師（George Leslie Mackay）登陸淡水，開展北部拔牙行醫、施藥與現代教育。',
    theme: '馬偕登陸淡水·北部醫道',
    influence: '北部鄉鎮受惠於馬偕免費拔牙與瘧疾藥物，教會學校開啟平民受教之風。',
    avgLifeExpectancy: 33,
    prevailingEpidemics: ['惡性瘧疾', '肺癆', '霍亂'],
    sanitationContext: '馬偕隨身攜帶奎寧與拔牙鉗，足跡遍及北台灣與宜蘭平原。',
  },
  1874: {
    year: 1874,
    event: '日本藉琉球事件出兵恆春爆發「牡丹社事件」；日軍染惡性瘧疾死者高達500餘人遠超戰死者；沈葆楨受命任欽差大臣來台加強海防。',
    theme: '牡丹社事件·沈葆楨治台',
    influence: '惡性熱病重創入侵日軍，清廷大舉投入開山撫番，開通八通關古道。',
    avgLifeExpectancy: 32,
    prevailingEpidemics: ['惡性瘧疾 (黑尿熱)', '霍亂', '痢疾'],
    sanitationContext: '牡丹社戰役使各國深知台灣瘴癘之險，沈葆楨官兵亦因水土不服死傷枕藉。',
    isEpidemicOutbreak: true,
  },

  // ==========================================
  // 1875 ~ 1894 年代 (沈葆楨與劉銘傳建省現代化)
  // 平均壽命約 33~35 歲；全台設省、基隆鐵路通車，但公共衛生尚未建立
  // ==========================================
  1875: {
    year: 1875,
    event: '沈葆楨奏請增設台北府，全面廢除渡台禁令與入山番界限制，大量福建廣東漢民遷徙渡台。',
    theme: '廢除渡台禁令·增設台北府',
    influence: '大批新移民渡過黑水溝開拓茶園與礦業，家族根基向北部扎根。',
    avgLifeExpectancy: 33,
    prevailingEpidemics: ['惡性瘧疾', '霍亂', '傷寒'],
    sanitationContext: '渡台航行環境惡劣，移民抵達後常先染「水土病」大半年。',
  },
  1877: {
    year: 1877,
    event: '沈葆楨聘洋工程師敷設台南安平至旗後之第一條軍用水下電報線，台灣電訊現代化啟動。',
    theme: '第一條海底電報線',
    influence: '南北商情情報提速，商業信用與金融兌匯更具效率。',
    avgLifeExpectancy: 34,
    prevailingEpidemics: ['天花', '阿米巴痢疾'],
    sanitationContext: '盛夏時節井水污染頻發，痢疾奪走眾多幼童與老年人命。',
  },
  1880: {
    year: 1880,
    event: '馬偕在淡水創辦「偕醫館」（北部首座現代西醫醫院，馬偕紀念醫院前身）。',
    theme: '滬尾偕醫館落成',
    influence: '北台灣居民重症疾病首度有現代化病房收治，救治大量外傷與熱病病患。',
    avgLifeExpectancy: 34,
    prevailingEpidemics: ['肺結核 (癆病)', '惡性瘧疾', '霍亂'],
    sanitationContext: '肺結核開始在市街手工業密集群體中蔓延，俗稱「乾癆」。',
  },
  1884: {
    year: 1884,
    event: '中法戰爭（西仔反）戰火延燒基隆與滬尾（淡水），劉銘傳督軍奮戰擊退法軍孤拔艦隊。',
    theme: '中法戰爭·滬尾大捷',
    influence: '海禁封鎖引發物價波動，民眾投身民團鄉勇保衛鄉土。',
    avgLifeExpectancy: 33,
    prevailingEpidemics: ['霍亂', '惡性瘧疾', '傷寒'],
    sanitationContext: '法軍因基隆濕熱染病喪失戰鬥力，孤拔將軍隨後亦因熱病逝於澎湖。',
    isEpidemicOutbreak: true,
  },
  1885: {
    year: 1885,
    event: '慈禧太后頒布懿旨台灣建省，劉銘傳受命擔任首任台灣巡撫，大力推動自強新政。',
    theme: '台灣建省·劉銘傳督造',
    influence: '全台行政地位空前提升，公共工程大興，青年有機會進入電報學堂。',
    avgLifeExpectancy: 34,
    prevailingEpidemics: ['惡性瘧疾', '天花', '霍亂'],
    sanitationContext: '官府開始注重軍營環境衛生，但平民聚落依然仰賴傳統深井水。',
  },
  1887: {
    year: 1887,
    event: '台灣省正式成軍設立省會，台北大稻埕興建西學堂、郵政總局、電報局與自來火煤氣燈。',
    theme: '台灣省正式設立·新政大興',
    influence: '台北成為現代化示範市街，工商業與國際貿易蓬勃成長。',
    avgLifeExpectancy: 34,
    prevailingEpidemics: ['肺結核', '天花', '傷寒'],
    sanitationContext: '市街夜間開始有路燈與石板道路，但排泄物與下水道仍未有系統。',
  },
  1891: {
    year: 1891,
    event: '基隆至台北鐵路全線完工通車（全台第一條客貨運鐵路，長28.6公里），劉銘傳因官場鬥爭辭官離台。',
    theme: '基隆台北鐵路通車',
    influence: '北台灣煤礦、茶葉與民夫運輸時間自兩天縮短至幾小時，鐵道經濟萌芽。',
    avgLifeExpectancy: 35,
    prevailingEpidemics: ['惡性瘧疾', '天花', '霍亂'],
    sanitationContext: '鐵道工人興建期間常因瘧疾倒下，清廷調集大批金雞納霜救治。',
  },
  1894: {
    year: 1894,
    event: '甲午戰爭在朝鮮海域爆發，台北府城牆與各防務城門全部竣工，島內戒備森嚴。',
    theme: '甲午戰爭爆發·台北城完工',
    influence: '米糧與物資全面管制，社會瀰漫大戰臨頭之緊繃氣氛。',
    avgLifeExpectancy: 35,
    prevailingEpidemics: ['天花', '惡性瘧疾'],
    sanitationContext: '清末時期全台人口約280萬，平均壽命約35歲，過半數人難度知命之年。',
  },

  // ==========================================
  // 1895 ~ 1919 年代 (日治前期：乙未割台、鼠疫大流行、自來水水道建設與西班牙流感)
  // 平均壽命約 34~38 歲；1896~1917 鼠疫大流行，1918 西班牙流感奪4萬命
  // ==========================================
  1895: {
    year: 1895,
    event: '清日簽署《馬關條約》割讓台灣，台灣民主國抗日防衛戰爆發，日軍樺山資紀進駐台北城開啟半世紀日本統治。',
    theme: '乙未割台·民主國保衛戰',
    influence: '政權易幟引發社會劇烈動盪，抗日義勇軍於中南部山區奮戰，百姓面臨身分去留抉擇。',
    avgLifeExpectancy: 34,
    prevailingEpidemics: ['惡性瘧疾', '霍亂', '痢疾'],
    sanitationContext: '北白川宮能久親王等數千日軍因染霍亂與瘧疾病死，促使日本高度重視在台公衛。',
    isEpidemicOutbreak: true,
  },
  1896: {
    year: 1896,
    event: '台北大稻埕首次檢出腺鼠疫（黑死病）爆發，迅速蔓延全島長達二十年；總督府成立避病院強制隔離。',
    theme: '鼠疫大流行爆發·避病院',
    influence: '街坊鄰里強制滅鼠、家家戶戶生石灰消毒，染疫者即被送入避病院隔離。',
    avgLifeExpectancy: 33,
    prevailingEpidemics: ['鼠疫 (黑死病)', '霍亂', '惡性瘧疾'],
    sanitationContext: '鼠疫在全台爆發長達20年（1896-1917），累計染疫超3萬人，死亡破2.4萬人。',
    isEpidemicOutbreak: true,
  },
  1897: {
    year: 1897,
    event: '台灣總督府開辦「台北病院」，公布全島公醫制度，民政長官後藤新平推行「生物學治台」與現代公衛改革。',
    theme: '公醫制度確立·現代公衛啟航',
    influence: '各鄉鎮派駐日本與本土受訓公醫，傳染病通報、牛痘強制接種制度落地。',
    avgLifeExpectancy: 35,
    prevailingEpidemics: ['鼠疫', '惡性瘧疾', '天花'],
    sanitationContext: '後藤新平延請巴爾頓（William Burton）規劃全台主要都市現代化給排水下水道系統。',
  },
  1899: {
    year: 1899,
    event: '台灣總督府醫學校正式成立（台大醫學院前身），高木友枝等醫學學者投入全島熱帶醫學與防疫研究。',
    theme: '台灣總督府醫學校成立',
    influence: '醫生成為台籍青年最尊崇的社會階層與求學首選，開啟長達百年的「行醫濟世」文化傳統。',
    avgLifeExpectancy: 35,
    prevailingEpidemics: ['鼠疫', '惡性瘧疾', '霍亂'],
    sanitationContext: '總督府成立防役衛生委員會，全面撲殺老鼠，防範鼠蚤帶菌傳播。',
  },
  1900: {
    year: 1900,
    event: '鼠疫與霍亂雙重侵襲全台各主要市街；總督府大力推行台北自來水水道建設，改善飲用水源。',
    theme: '自來水水道開工·雙重時疫',
    influence: '民眾逐漸由飲用混濁井水轉向使用自來水龍頭，水媒傳染病逐步受控。',
    avgLifeExpectancy: 35,
    prevailingEpidemics: ['鼠疫 (黑死病)', '霍亂', '傷寒'],
    sanitationContext: '總督府制定強制清潔法規，定期實施「大掃除」，徹底清洗水溝與糞坑。',
    isEpidemicOutbreak: true,
  },
  1905: {
    year: 1905,
    event: '台灣實施首次現代全島戶口普查（國勢調查），總人口突破304萬人，建立精確戶籍與生命統計資料庫。',
    theme: '首次臨時台灣戶口調查',
    influence: '戶籍資料嚴格掌控，常民出生登記、種痘卡與死亡死因診斷書制度化。',
    avgLifeExpectancy: 36,
    prevailingEpidemics: ['鼠疫', '瘧疾', '肺結核'],
    sanitationContext: '生命統計首次揭露全台平均壽命僅約 36 歲，瘧疾仍為農村主要死亡威脅。',
  },
  1908: {
    year: 1908,
    event: '台灣南北縱貫鐵路全線通車（基隆至高雄），全長405公里，全島一日交通網全面成型。',
    theme: '縱貫鐵路全線通車',
    influence: '城鄉交流劇增，農產品大量運銷，車站成為各市鎮現代公衛防疫檢疫的第一線。',
    avgLifeExpectancy: 37,
    prevailingEpidemics: ['瘧疾', '肺結核', '阿米巴痢疾'],
    sanitationContext: '鐵路車站廣設檢疫所，防範鼠疫與霍亂沿鐵路線南下擴散。',
  },
  1915: {
    year: 1915,
    event: '余清芳、江定發動西來庵事件（噍吧哖事件），漢人最後一場武裝抗日落幕，轉向文化體制內政治抗爭。',
    theme: '西來庵事件·抗爭轉向體制內',
    influence: '社會氛圍轉趨平靜，台籍仕紳轉向支持現代教育、商業投資與醫療事業。',
    avgLifeExpectancy: 38,
    prevailingEpidemics: ['瘧疾', '肺結核', '天花'],
    sanitationContext: '鼠疫疫情在全台歷經20年撲殺與自來水普及後終於絕跡，為東亞公衛奇蹟。',
  },
  1918: {
    year: 1918,
    event: '全球「西班牙大流感」（Spanish Flu）強烈襲擊台灣，全島染疫達77萬餘人，死亡人數逾4萬人。',
    theme: '西班牙流感大爆發',
    influence: '全台各級公學校停課，公共集會暫停，街坊全面配戴紗布口罩，醫院人滿為患。',
    avgLifeExpectancy: 36,
    prevailingEpidemics: ['西班牙流感 (H1N1原型)', '肺炎', '瘧疾'],
    sanitationContext: '流感重挫青壯年人口，促使全台建立流感通報與早期隔離口罩衛生習慣。',
    isEpidemicOutbreak: true,
  },

  // ==========================================
  // 1920 ~ 1936 年代 (日治中期：文化協會、蓬萊米培育與嘉南大圳)
  // 平均壽命約 40~46 歲；近代公衛改善，肺結核成頭號殺手，瘧疾受控
  // ==========================================
  1920: {
    year: 1920,
    event: '台灣地方官制大改革（改設台北、新竹、台中、台南、高雄五州及花蓮港、台東二廳），嘉南大圳正式動工。',
    theme: '地方五州改制·嘉南大圳動工',
    influence: '州廳官治與現代警察公衛體系成型，基層衛生所全面設立。',
    avgLifeExpectancy: 40,
    prevailingEpidemics: ['肺結核', '瘧疾', '砂眼'],
    sanitationContext: '鼠疫霍亂絕跡後，肺結核（癆病）上升為台灣第一大死因。',
  },
  1921: {
    year: 1921,
    event: '林獻堂、蔣渭水等人成立「台灣文化協會」，推動台灣議會設置請願運動，喚醒全島現代公民與衛生覺醒。',
    theme: '台灣文化協會成立·蔣渭水診斷',
    influence: '蔣渭水發表《臨床講義：關於名為台灣的患者》，倡導現代科學文明與公衛普及。',
    avgLifeExpectancy: 41,
    prevailingEpidemics: ['肺結核', '局地瘧疾', '寄生蟲病'],
    sanitationContext: '文化協會在廟埕舉辦大眾講座，宣導戒鴉片、常洗手與破除迷信求神治病。',
  },
  1926: {
    year: 1926,
    event: '磯永吉與末永仁在陽明山培育改良日本種稻成功，正式命名為「蓬萊米」，引發台灣稻米增產外銷狂潮。',
    theme: '蓬萊米誕生·農村繁榮',
    influence: '農民收入大幅增加，家庭伙食營養明顯改善，幼兒營養不良與疳積顯著減少。',
    avgLifeExpectancy: 43,
    prevailingEpidemics: ['肺結核', '砂眼', '鉤蟲病'],
    sanitationContext: '赤腳耕作常致鉤蟲寄生蟲病，公醫推動農民穿草鞋與定期驅蟲。',
  },
  1928: {
    year: 1928,
    event: '台北帝國大學（台灣大學前身）正式創立，設立文政學部與理農學部，醫學部於1936年加入。',
    theme: '台北帝國大學成立',
    influence: '台灣最高學術殿堂建立，熱帶農學、風土病研究躍居國際前沿。',
    avgLifeExpectancy: 44,
    prevailingEpidemics: ['肺結核', '恙蟲病', '瘧疾'],
    sanitationContext: '帝大醫學部成立熱帶醫學研究所，深入高山與林野研究恙蟲病與熱帶寄生蟲。',
  },
  1930: {
    year: 1930,
    event: '八田與一歷時十年設計監造之「嘉南大圳」全線通水竣工，灌溉嘉南平原十五萬甲良田；同年爆發霧社事件。',
    theme: '嘉南大圳完工·水利奇蹟',
    influence: '嘉南平原告別三年輪作苦旱，稻米糖產暴增，水溝整治同時大幅減少蚊蠅孳生。',
    avgLifeExpectancy: 45,
    prevailingEpidemics: ['肺結核', '砂眼', '傷寒'],
    sanitationContext: '大圳建設改善了水質灌溉與排澇，農民罹患惡性瘧疾比率明顯下降。',
  },
  1935: {
    year: 1935,
    event: '新竹台中大地震（關刀山大地震）死傷逾萬；總督府盛大舉辦「始政四十周年紀念台灣博覽會」。',
    theme: '關刀山大地震·始政博覽會',
    influence: '博覽會展示台灣自來水、現代醫院、防癆宣傳等近代化成果，全島逾三百萬人次參觀。',
    avgLifeExpectancy: 46,
    prevailingEpidemics: ['肺結核', '砂眼', '白喉'],
    sanitationContext: '總督府公布「結核病預防規則」，設立松山療養院，鼓勵開窗通風與隔離休養。',
  },

  // ==========================================
  // 1937 ~ 1945 年代 (日治後期：皇民化、改姓名、太平洋戰爭與二戰空襲)
  // 平均壽命約 43~46 歲；戰時物資配給、藥物匱乏、肺結核惡化、空襲避難
  // ==========================================
  1937: {
    year: 1937,
    event: '中日全面戰爭爆發，台灣總督府推行「皇民化運動」，廢除報紙漢文欄，社會轉入戰時體制。',
    theme: '皇民化運動·戰時體制',
    influence: '物資統制開始，青年服兵役防空演習，醫療資源優先供給前線軍隊。',
    avgLifeExpectancy: 46,
    prevailingEpidemics: ['肺結核', '傷寒', '營養不良'],
    sanitationContext: '民間藥品價格飛漲，消炎藥盤尼西林尚未普及，肺結核病患死亡率攀升。',
    isEpidemicOutbreak: true,
  },
  1940: {
    year: 1940,
    event: '皇民化運動推行「改日本姓名」、國語家庭認定與神社神道參拜，全島家庭動員支援戰力。',
    theme: '改姓名熱潮·國語家庭',
    influence: '家族面臨文化認同張力，糧食砂糖全面實施配給票制，肉品雞蛋難得一見。',
    avgLifeExpectancy: 45,
    prevailingEpidemics: ['肺結核', '疳積 (營養不良)', '砂眼'],
    sanitationContext: '食糧配給不足致居民免疫力下降，結核病與兒童營養不良普遍惡化。',
  },
  1941: {
    year: 1941,
    event: '太平洋戰爭爆發，日軍偷襲珍珠港，台灣被定為「南進基地」，實施燈火管制與全島動員。',
    theme: '太平洋戰爭爆發·燈火管制',
    influence: '夜晚家家戶戶懸掛黑布遮光，台灣青年大量被徵召為軍伕、通譯與護士遠赴南洋。',
    avgLifeExpectancy: 44,
    prevailingEpidemics: ['南洋瘧疾', '肺結核', '登革熱'],
    sanitationContext: '徵召至南洋戰場之台灣青年大量感染惡性熱帶瘧疾與叢林恙蟲病，死傷慘重。',
  },
  1943: {
    year: 1943,
    event: '盟軍首次派遣戰機空襲新竹機場；開羅會議宣言發表台灣應歸還中華民國。',
    theme: '盟軍空襲新竹·戰火逼近',
    influence: '市區居民開始疏開至中南部鄉村避難，學校停課，民生物資全面告急。',
    avgLifeExpectancy: 43,
    prevailingEpidemics: ['肺結核', '疥瘡', '蛔蟲病'],
    sanitationContext: '鄉村疏開避難生活簡陋，缺乏清潔肥皂，寄生蟲與疥瘡皮膚病蔓延。',
    isEpidemicOutbreak: true,
  },
  1944: {
    year: 1944,
    event: '日本實施台灣陸海軍徵兵制，數萬名台籍青年正式入伍被派往前線。',
    theme: '全面徵兵·台籍青年上戰場',
    influence: '家家戶戶掛起武運長久出征旗，老幼婦孺承擔農耕與防空勞動。',
    avgLifeExpectancy: 43,
    prevailingEpidemics: ['肺結核', '赤痢', '營養不良'],
    sanitationContext: '藥物完全斷絕，醫院僅能以鹽水消毒，病死率劇增。',
  },
  1945: {
    year: 1945,
    event: '盟軍發動「台北大空襲」，總督府與全台市街毀損嚴重；8月日本投降二戰結束，台灣脫離日本統治迎來光復重建。',
    theme: '台北大空襲·光復重建',
    influence: '全台百廢待興，居民自疏開農村返城重建家園，家族重整生計。',
    avgLifeExpectancy: 44,
    prevailingEpidemics: ['肺結核', '霍亂', '天花'],
    sanitationContext: '戰後初期公衛體系受損，水電中斷，全台面臨戰後流行病復發危機。',
  },

  // ==========================================
  // 1946 ~ 1970 年代 (戰後重建、戒嚴幣改、美援抗生素、小兒麻痺與瘧疾根除)
  // 平均壽命自 52 歲飆升至 68 歲；美援引進沙賓疫苗、卡介苗、盤尼西林；1965 瘧疾根除
  // ==========================================
  1946: {
    year: 1946,
    event: '戰後往來兩岸船隻帶來短暫霍亂與天花復發；政府展開全台強制普種牛痘與水源氯化消毒。',
    theme: '戰後防疫·撲滅天花霍亂',
    influence: '港口實施嚴密檢疫，衛生所全面重整，迅速撲滅戰後霍亂威脅。',
    avgLifeExpectancy: 52,
    prevailingEpidemics: ['天花', '霍亂', '肺結核'],
    sanitationContext: '此為台灣歷史上最後一次天花霍亂規模流行，自此天花在台絕跡。',
    isEpidemicOutbreak: true,
  },
  1947: {
    year: 1947,
    event: '二二八事件爆發，社會局勢劇烈震盪，全台戒嚴戒慎自守。',
    theme: '二二八事件·局勢動盪',
    influence: '社會氛圍戒慎自保，家族行事轉趨低調，專注於身家安全與基層謀生。',
    avgLifeExpectancy: 53,
    prevailingEpidemics: ['肺結核', '瘧疾', '寄生蟲病'],
    sanitationContext: '社會動盪期間各公立醫院維持急救運作，民間醫藥依舊短缺。',
  },
  1949: {
    year: 1949,
    event: '政府宣布全台戒嚴，發行新台幣實施「四萬塊換一塊」幣制改革，百萬軍民渡海來台。',
    theme: '戒嚴令頒布·四萬換一塊',
    influence: '舊台幣積蓄劇烈貶值，各行各業艱難重整，勤儉白手起家。',
    avgLifeExpectancy: 54,
    prevailingEpidemics: ['肺結核', '瘧疾', '砂眼'],
    sanitationContext: '眷村與新聚落成立，國軍引進軍醫資源，推行衛生整潔競賽。',
  },
  1950: {
    year: 1950,
    event: '韓戰爆發，美軍第七艦隊協防台灣，美援時代全面開啟，美援麵粉袋與脫脂奶粉成為時代印記。',
    theme: '美援時代開啟·物資穩定',
    influence: '物資與外援穩定民生經濟，美援農復會（JCRR）推行農村衛生改革。',
    avgLifeExpectancy: 55,
    prevailingEpidemics: ['小兒麻痺症 (Polio)', '瘧疾', '肺結核'],
    sanitationContext: '美援引進抗生素盤尼西林（青黴素）與DDT滅蚊，大幅降低熱病死亡率。',
  },
  1952: {
    year: 1952,
    event: '全台爆發嚴重小兒麻痺症（Poliomyelitis）大流行，數千嬰幼兒發燒後肢體癱瘓，引發全島家庭恐慌。',
    theme: '小兒麻痺大流行·公衛震撼',
    influence: '無數孩童必須穿戴鐵肢支架度日，政府與美援小組加速籌劃引進沙賓口服疫苗。',
    avgLifeExpectancy: 56,
    prevailingEpidemics: ['小兒麻痺症 (急性脊髓灰質炎)', '瘧疾', '砂眼'],
    sanitationContext: '全台設立小兒麻痺復健中心，廣泛宣導「洗手、消毒、不喝生水」。',
    isEpidemicOutbreak: true,
  },
  1953: {
    year: 1953,
    event: '政府推行「耕者有其田」政策，佃農獲得土地晉升自耕農，地主轉型投資四大公司工商業。',
    theme: '耕者有其田·農村復甦',
    influence: '自耕農全力改良農產，生活伙食大幅改善，子女就學比例激增。',
    avgLifeExpectancy: 57,
    prevailingEpidemics: ['瘧疾', '肺結核', '蛔蟲病'],
    sanitationContext: '農村衛生所設立「衛生保健箱」，免費提供家庭常備外傷紅藥水與消炎軟膏。',
  },
  1957: {
    year: 1957,
    event: '「亞洲A型流感」（H2N2）全球大流行波及台灣，全台數十萬人發燒臥床，工廠學校暫停活動。',
    theme: '亞洲流感侵襲·全民防疫',
    influence: '市街戴口罩宣導與體溫檢測落實，展現台灣戰後公衛動員應變速度。',
    avgLifeExpectancy: 60,
    prevailingEpidemics: ['亞洲流感 (H2N2)', '小兒麻痺', '肺結核'],
    sanitationContext: '抗生素廣泛應用於防止流感引發之繼發性細菌肺炎，死亡率大幅低於1918年。',
    isEpidemicOutbreak: true,
  },
  1958: {
    year: 1958,
    event: '八二三砲戰爆發，台海局勢緊繃，全島軍民一心捐款前線，防空演習頻繁。',
    theme: '八二三砲戰·軍民同心',
    influence: '役男赴前線金門捍衛陣地，後方青年刻苦勤奮，重視身家強健。',
    avgLifeExpectancy: 61,
    prevailingEpidemics: ['肺結核', '砂眼', '腸道寄生蟲'],
    sanitationContext: '學校全面推行「點眼藥膏防砂眼」與「服藥排蛔蟲」，國民健康體質顯著提升。',
  },
  1960: {
    year: 1960,
    event: '政府頒布《獎勵投資條例》，推行「客廳即工廠」，婦女與孩童組裝玩具與聖誕燈泡貼補家用。',
    theme: '客廳即工廠·代工經濟起飛',
    influence: '全家老小共同投入家庭手工業，基層儲蓄率攀升，迎來經濟起飛前哨。',
    avgLifeExpectancy: 63,
    prevailingEpidemics: ['肺結核', '小兒麻痺', 'B型肝炎'],
    sanitationContext: '沙賓口服糖丸疫苗引進普及，小兒麻痺新增病例劇降，孩童健康更有保障。',
  },
  1962: {
    year: 1962,
    event: '副霍亂（El Tor 霍亂）自東南亞傳入引發全台防疫戒備，政府動員全面消毒海鮮與攤商。',
    theme: '副霍亂防檢·飲食衛生大整頓',
    influence: '路邊攤與冰品全面改用煮沸開水，台灣常民養成「熟食熱飲」優良生活習慣。',
    avgLifeExpectancy: 64,
    prevailingEpidemics: ['副霍亂', '肺結核', '砂眼'],
    sanitationContext: '台灣全面推行食物檢驗與公廁漂白水消毒，疫情迅速在兩個月內撲滅清零。',
    isEpidemicOutbreak: true,
  },
  1965: {
    year: 1965,
    event: '歷經十年全島滅蚊與抗瘧撲滅戰，世界衛生組織（WHO）正式頒發證書，宣布台灣為全球第一個「瘧疾根除」地區！',
    theme: 'WHO認證瘧疾根除·公衛里程碑',
    influence: '千年瘴癘之島魔咒徹底破除，農村青壯年不再受寒熱打擺子之苦，勞動力全面釋放。',
    avgLifeExpectancy: 66,
    prevailingEpidemics: ['肺結核', 'B型肝炎', '砂眼'],
    sanitationContext: '此為台灣公衛史上最耀眼勝利之一，全台平均壽命由光復時的44歲飛躍至66歲。',
    isEpidemicOutbreak: true,
  },
  1966: {
    year: 1966,
    event: '高雄加工出口區正式成立，電子與紡織加工廠林立，大批農村年輕女性北上或南下進廠打拼。',
    theme: '加工出口區成立·女工潮',
    influence: '女工每月將薪資匯回農村老家翻修磚瓦房、供養手足就學，家庭財務結構大轉型。',
    avgLifeExpectancy: 67,
    prevailingEpidemics: ['肺結核', '職業病 (近視/肩頸)', 'B型肝炎'],
    sanitationContext: '工廠推行定期胸部X光篩檢車巡迴檢查，提早揪出肺結核無症狀感染者。',
  },
  1968: {
    year: 1968,
    event: '「九年國民義務教育」正式實施；台東紅葉少棒隊以 7:0 擊敗日本關西明星隊，掀起全島棒球狂熱。',
    theme: '九年國教開辦·紅葉少棒傳奇',
    influence: '平民就學年齡普遍延長至15歲，清晨熬夜守候黑白電視收看威廉波特少棒直播。',
    avgLifeExpectancy: 68,
    prevailingEpidemics: ['B型肝炎', '肺結核', '砂眼'],
    sanitationContext: '國中小學生全面施打卡介苗，砂眼盛行率降至5%以下，學童體位明顯拔高。',
  },

  // ==========================================
  // 1971 ~ 1994 年代 (經濟起飛、十大建設、台灣錢淹腳目、B肝疫苗先驅與解嚴)
  // 平均壽命自 69 歲上升至 74.5 歲；急性傳染病受控，慢性病與B型肝炎成重心；1984 全球首創B肝疫苗
  // ==========================================
  1971: {
    year: 1971,
    event: '中華民國退出聯合國，外交遭遇重大轉折，全島激發「莊敬自強、處變不驚」愛國自強意志。',
    theme: '退出聯合國·莊敬自強',
    influence: '海外貿易全力開拓突破外交孤立，常民更加堅毅打拼蓄積儲蓄。',
    avgLifeExpectancy: 69,
    prevailingEpidemics: ['B型肝炎', '心血管疾病', '肺結核'],
    sanitationContext: '台灣醫學界宋瑞樓教授團隊發現台灣人肝癌高發與母嬰垂直感染B型肝炎密切相關。',
  },
  1973: {
    year: 1973,
    event: '第一次世界石油危機爆發導致物價飛漲；行政院全力推行「十大建設」（中山高、中鋼、核電廠等）。',
    theme: '十大建設起跑·重工業奠基',
    influence: '工程師與基層技術工極受重用，重工業與基礎交通帶動全台就業。',
    avgLifeExpectancy: 70,
    prevailingEpidemics: ['B型肝炎', '腦中風', '高血壓'],
    sanitationContext: '疾病結構由「急性傳染病」轉型為「慢性非傳染病」，中風成為全台死因榜首。',
  },
  1975: {
    year: 1975,
    event: '總統蔣中正逝世，電視廣播暫轉黑白播放，政局由蔣經國行政院長主導推展現代建設。',
    theme: '領袖逝世·政經交接',
    influence: '公共娛樂短暫肅穆，社會專注於經濟成長與基層生計。',
    avgLifeExpectancy: 71,
    prevailingEpidemics: ['高血壓', 'B型肝炎', '惡性腫瘤'],
    sanitationContext: '榮總、台大等醫學中心引進現代心血管造影與重症加護病房（ICU）。',
  },
  1978: {
    year: 1978,
    event: '中美斷交震撼全島；中山高速公路（國道一號）全線通車，西部走廊一日生活圈實現。',
    theme: '中美斷交·中山高通車',
    influence: '愛國自強捐款運動熱烈，長途交通與貨運提速數倍，商賈往返南北便利。',
    avgLifeExpectancy: 72,
    prevailingEpidemics: ['B型肝炎', '惡性腫瘤', '中風'],
    sanitationContext: '交通便利促進緊急醫療救護體系萌芽，救護車能更迅速將急重症送達都會醫院。',
  },
  1979: {
    year: 1979,
    event: '高雄爆發「美麗島事件」，民主運動走向關鍵轉折；第二核能發電廠等大型工程穩步推進。',
    theme: '美麗島事件·民主思潮啟蒙',
    influence: '黨外人士受審引發國際關注，民間言論思潮與本土自覺開始萌芽。',
    avgLifeExpectancy: 72,
    prevailingEpidemics: ['B型肝炎', '心臟病', '癌症'],
    sanitationContext: '醫療科技日益發達，心血管開胸手術與癌症化療在台灣成熟施行。',
  },
  1980: {
    year: 1980,
    event: '新竹科學工業園區正式成立，半導體與個人電腦代工起飛，海外留學生歸國創業潮湧現。',
    theme: '竹科成立·半導體啟航',
    influence: '理工電子工程師成為青年最熱門志願，台灣逐步奠定「科技島」世界地位。',
    avgLifeExpectancy: 73,
    prevailingEpidemics: ['慢性肝病 (肝硬化)', '心血管疾病', '癌症'],
    sanitationContext: '科技園區外商引入健康檢查福利，健檢觀念在白領工程師階層普及。',
  },
  1984: {
    year: 1984,
    event: '台灣領先全球首創實施「新生兒全面公費接種 B 型肝炎疫苗」，創下世界公共衛生奇蹟。',
    theme: '全球首創B肝全面疫苗·公衛傳奇',
    influence: '成功阻斷母嬰垂直傳染，使下一代台灣人B肝帶原率由20%驟降至1%以下，大幅降低日後肝癌罹患率。',
    avgLifeExpectancy: 73.5,
    prevailingEpidemics: ['慢性肝炎', '腦血管疾病', '癌症'],
    sanitationContext: '世界衛生組織與國際頂尖醫學期刊紛紛專文盛讚台灣為全球B肝防治之楷模。',
    isEpidemicOutbreak: true,
  },
  1987: {
    year: 1987,
    event: '總統蔣經國宣布自7月15日起台灣解除戒嚴、開放黨禁與報禁、開放大陸探親，社會力全面綻放。',
    theme: '宣告解嚴·開放探親',
    influence: '兩岸骨肉離散數十年首度重逢，街頭運動蓬勃，言論自由與文化創作自由盛開。',
    avgLifeExpectancy: 74,
    prevailingEpidemics: ['心臟病', '惡性腫瘤', '糖尿病'],
    sanitationContext: '糖尿病隨飲食豐足開始攀升，公衛推展「少糖、少鹽、多運動」健康生活運動。',
  },
  1988: {
    year: 1988,
    event: '南部地區爆發本土登革熱大流行；總統蔣經國逝世，李登輝繼任總統，政治轉向本土化。',
    theme: '登革熱大流行·政局本土化',
    influence: '社區全面推行「巡、倒、清、刷」清除積水容器防蚊，登革熱成為台灣夏秋常備公衛課題。',
    avgLifeExpectancy: 74,
    prevailingEpidemics: ['登革熱', '心血管疾病', '惡性腫瘤'],
    sanitationContext: '南台灣成立登革熱防治中心，落實社區環境衛生動員。',
    isEpidemicOutbreak: true,
  },
  1989: {
    year: 1989,
    event: '「台灣錢淹腳目」，台股加權指數首度衝破萬點大關（最高達12,682點），大家樂與房地產狂飆；無殼蝸牛運動夜宿忠孝東路。',
    theme: '台股破萬點·無殼蝸牛夜宿',
    influence: '全民炒股炒房熱潮席捲街坊，但高房價讓年輕受薪族倍感壓力，人生價值觀迎來衝擊。',
    avgLifeExpectancy: 74.5,
    prevailingEpidemics: ['高血壓', '脂肪肝', '痛風'],
    sanitationContext: '生活富裕引發「富貴病」（高血脂、痛風、肥胖）暴增，民間掀起養生慢跑熱潮。',
  },
  1990: {
    year: 1990,
    event: '台北中正紀念堂爆發「野百合學運」，大專學生靜坐抗議要求解散萬年國會，李登輝總統接見學生承諾國政改革。',
    theme: '野百合學運·國會改革',
    influence: '台灣民主轉型走向體制改革高峰，大學校園思想獨立自由蔚然成風。',
    avgLifeExpectancy: 74.8,
    prevailingEpidemics: ['惡性腫瘤 (肺癌/肝癌)', '心臟病'],
    sanitationContext: '政府成立「全民健康保險規劃小組」，汲取國際經驗打造全島單一保險人制度。',
  },
  1992: {
    year: 1992,
    event: '第二屆立法委員全面改選，萬年國會走入歷史；刑法第一百條修正，思想犯不再入罪。',
    theme: '國會全面改選·思想自由',
    influence: '台灣邁入民主自由成熟體系，社會各項公共政策透明度大增。',
    avgLifeExpectancy: 75.0,
    prevailingEpidemics: ['癌症', '腦血管疾病', '心臟病'],
    sanitationContext: '醫療院所普及全台各鄉鎮，急診醫學與創傷中心網絡逐步確立。',
  },

  // ==========================================
  // 1995 ~ 2026 年代 (全民健保時代、SARS、高鐵通車、新冠三級警戒與AI浪潮)
  // 平均壽命突破 81 歲；健保全島覆蓋，抗擊 SARS 與 COVID-19 建立世界級公衛典範
  // ==========================================
  1995: {
    year: 1995,
    event: '「全民健康保險」於3月1日正式開辦，涵蓋全台99%人口，告別因病傾家蕩產悲劇。',
    theme: '全民健保正式開辦·就醫平權',
    influence: '常民憑健保卡即可在全國診所醫院就診，醫療可近性高居全球第一，貧弱長者獲得尊嚴照護。',
    avgLifeExpectancy: 75.5,
    prevailingEpidemics: ['惡性腫瘤', '腦中風', '心臟病'],
    sanitationContext: '健保開辦使慢性病早期篩檢與規範治療普及，大幅延展台灣人平均壽命。',
    isEpidemicOutbreak: true,
  },
  1996: {
    year: 1996,
    event: '台灣舉行歷史上首次正副總統公民直選，台海飛彈危機緊繃，李登輝與連戰當選第九任總統。',
    theme: '首次總統直選·台海飛彈危機',
    influence: '民主選舉正式成為生活常態，面對軍事演習股市震盪，社會依然展現冷靜成熟韌性。',
    avgLifeExpectancy: 76.0,
    prevailingEpidemics: ['癌症', '心臟病', '糖尿病'],
    sanitationContext: '健保制度穩定運作，癌症多專科聯合診療與放射腫瘤治療設備進駐各醫學中心。',
  },
  1998: {
    year: 1998,
    event: '全台爆發「腸病毒 71 型」大流行，奪走78名幼童性命，引發全國父母震撼。',
    theme: '腸病毒大流行·洗手運動推展',
    influence: '幼兒園與小學全面推行「濕、搓、沖、捧、擦」洗手口訣與班級停課標準。',
    avgLifeExpectancy: 76.5,
    prevailingEpidemics: ['腸病毒 71 型', '惡性腫瘤', '心臟病'],
    sanitationContext: '疾管局建立兒科重症通報網絡與體外膜氧合（葉克膜 ECMO）緊急搶救機制。',
    isEpidemicOutbreak: true,
  },
  1999: {
    year: 1999,
    event: '9月21日凌晨南投集集發生規模 7.3「921大地震」，釀成2,415人罹難，中台灣災情慘烈。',
    theme: '921大地震·全台同胞互助',
    influence: '社會激發空前動員互助，災後重建推動建築耐震法規改革與社區營造復興。',
    avgLifeExpectancy: 76.8,
    prevailingEpidemics: ['災後創傷壓力 (PTSD)', '惡性腫瘤'],
    sanitationContext: '災區迅速建立緊急避難醫療站與水源消毒，成功防止災後次生霍亂或痢疾爆發。',
  },
  2000: {
    year: 2000,
    event: '台灣完成歷史上「首次政黨輪替」，陳水扁當選總統；千禧年核四停建引發政經波瀾。',
    theme: '首次政黨輪替·千禧時代',
    influence: '青年世代政治參與熱情高漲，資訊網際網路與手機簡訊全面進入常民生活。',
    avgLifeExpectancy: 77.0,
    prevailingEpidemics: ['癌症', '心臟病', '糖尿病'],
    sanitationContext: '政府成立衛生署疾病管制局（CDC），整合全台傳染病監測體系。',
  },
  2003: {
    year: 2003,
    event: '「SARS 嚴重急性呼吸道症候群」襲台，台北市立和平醫院爆發院內感染封院抗疫，醫護英勇殉職；全台戴 N95 口罩、量體溫抗疫。',
    theme: '抗擊SARS·和平醫院封院',
    influence: '全台街頭冷清、量測額溫與酒精消毒成為習慣，促成後續疾管傳染病防治法大修法與負壓隔離病房網絡建構。',
    avgLifeExpectancy: 77.5,
    prevailingEpidemics: ['SARS 冠狀病毒', '癌症', '心臟病'],
    sanitationContext: 'SARS 慘痛教訓奠定了台灣日後全球頂尖傳染病應變防護體系之深厚基石。',
    isEpidemicOutbreak: true,
  },
  2007: {
    year: 2007,
    event: '台灣高速鐵路全線正式通車營運，台北至高雄縮減至90分鐘，北高一日生活圈全面成熟。',
    theme: '台灣高鐵通車·一日生活圈',
    influence: '返鄉探親、跨縣市商務出差與旅遊一日往返，重大跨區醫療轉診提速。',
    avgLifeExpectancy: 78.5,
    prevailingEpidemics: ['癌症', '心臟病', '慢性腎臟病'],
    sanitationContext: '台灣透析醫療（洗腎）照護品質高居全球領先，腎友存活年限顯著拉長。',
  },
  2008: {
    year: 2008,
    event: '美國次貸危機引發全球金融海嘯波及台灣，科技園區實施無薪假，政府發放每人3,600元消費券振興經濟。',
    theme: '金融海嘯衝擊·無薪假與消費券',
    influence: '職場白領面臨降薪與無薪假壓力，家庭開支保守，學會避險防禦資產配置。',
    avgLifeExpectancy: 78.8,
    prevailingEpidemics: ['憂鬱症與身心焦慮', '慢性疾病'],
    sanitationContext: '社區身心健康諮商中心成立，關注失業與經濟壓力引發之心理健康。',
  },
  2009: {
    year: 2009,
    event: '全球爆發「H1N1 新型流感」；8月莫拉克颱風釀成「八八水災」，高雄小林村遭土石流淹沒。',
    theme: '八八風災震殤·H1N1抗疫',
    influence: '全台動員防範新流感並投入災區互助重建，公衛推展國產疫苗大規模接種。',
    avgLifeExpectancy: 79.0,
    prevailingEpidemics: ['H1N1 新型流感', '類鼻疽 (災後)', '癌症'],
    sanitationContext: '風災後南部泥漿引發類鼻疽感染，疾管局迅速投藥隔離防止擴散。',
    isEpidemicOutbreak: true,
  },
  2014: {
    year: 2014,
    event: '學生發起「太陽花學運」佔領立法院議場24天，抗議海峽兩岸服務貿易協議黑箱審查，公民社會全面覺醒。',
    theme: '太陽花學運·公民意識激盪',
    influence: '青年世代廣泛參與公共政策，科技社群（g0v 零時政府）興起，數位民主萌芽。',
    avgLifeExpectancy: 79.8,
    prevailingEpidemics: ['癌症', '心臟血管疾病', '肺炎'],
    sanitationContext: '肺炎上升為國人十大死因第三名，政府擴大為長者公費接種肺炎鏈球菌疫苗。',
  },
  2015: {
    year: 2015,
    event: '台南與南台灣爆發歷史嚴重本土登革熱疫情，病例逾4萬人，全島動員科技滅蚊與醫療分流。',
    theme: '南部登革熱疫情·科技防疫',
    influence: '運用大數據與地理資訊系統（GIS）精準標定孑孓孳生熱點，社區滅蚊機制升級。',
    avgLifeExpectancy: 80.2,
    prevailingEpidemics: ['登革熱', '癌症', '糖尿病'],
    sanitationContext: '氣候變遷致暖冬病媒蚊難以越冬死亡，防疫成為常態全年工作。',
    isEpidemicOutbreak: true,
  },
  2016: {
    year: 2016,
    event: '蔡英文當選中華民國首位女性總統；推動綠能非核家園能源轉型與長照 2.0 政策。',
    theme: '首位女總統就任·長照2.0啟動',
    influence: '社區設立「C級長照柑仔店」，日間照護與居家喘息服務減輕青壯世代撫老負擔。',
    avgLifeExpectancy: 80.5,
    prevailingEpidemics: ['失智症', '心臟病', '癌症'],
    sanitationContext: '台灣步入「高齡社會」，高齡失智照護與長照資源納入國家發展重點。',
  },
  2019: {
    year: 2019,
    event: '立法院通過《司法院釋字第七四八號解釋施行法》，台灣成為亞洲第一個同性婚姻合法化國家；年底因應武漢未知肺炎通報，台灣率先啟動登機檢疫。',
    theme: '同婚亞洲第一·超前部署防檢',
    influence: '多元包容人權形象躍居國際前列；12月31日疾管署超前部署對武漢直航班機登機檢疫。',
    avgLifeExpectancy: 80.9,
    prevailingEpidemics: ['流感', '癌症', '心臟病'],
    sanitationContext: '台灣超前警覺通報WHO，為隨後全球疫情風暴爭取到關鍵應變黃金時間。',
  },
  2020: {
    year: 2020,
    event: '全球爆發「COVID-19 新冠肺炎疫情」，台灣成立中央流行疫情指揮中心，打造「口罩國家隊」與實名制，抗疫表現享譽國際。',
    theme: 'COVID-19抗疫·口罩國家隊',
    influence: '全民配戴口罩自律，邊境檢疫守住防線，台灣在全球經濟重創中維持正成長。',
    avgLifeExpectancy: 81.3,
    prevailingEpidemics: ['COVID-19 (新冠病毒)', '癌症', '心臟病'],
    sanitationContext: '健保快易通 App 綁定購買口罩與實名登記，展現台灣頂尖數位公共衛生治理實力。',
    isEpidemicOutbreak: true,
  },
  2021: {
    year: 2021,
    event: '本土 COVID-19 疫情升溫，全台發布「三級警戒」，居家遠距上班上課，落實實聯制與各國疫苗大規模接種。',
    theme: '新冠三級警戒·遠距生活',
    influence: '街頭餐飲禁止內用，數位遠距外送與視訊會議成為新常態，全島展現高度團結自律。',
    avgLifeExpectancy: 80.8,
    prevailingEpidemics: ['COVID-19 (Alpha/Delta/Omicron)', '癌症'],
    sanitationContext: '短暫疫情使平均壽命受微幅干擾降至80.8歲，但疫苗覆蓋率迅速衝刺至全球前列。',
    isEpidemicOutbreak: true,
  },
  2022: {
    year: 2022,
    event: '台灣因應病毒輕症化逐步走向「與病毒共存」，快篩普及，10月正式重開國門解除隔離檢疫。',
    theme: '防疫共存鬆綁·國門重啟',
    influence: '出國旅遊與觀光商務復甦，日常生活全面回歸正軌。',
    avgLifeExpectancy: 81.0,
    prevailingEpidemics: ['Omicron 輕症流感化', '長新冠 (Long COVID)'],
    sanitationContext: '各大醫院開設「長新冠整合門診」，照顧染疫康復者腦霧與心肺修復。',
  },
  2024: {
    year: 2024,
    event: '台灣半導體「護國神山」與生成式 AI 算力伺服器躍居全球科技心臟，黃仁勳掀起全台 AI 旋風。',
    theme: '半導體矽盾·生成式AI浪潮',
    influence: '科技產業薪資待遇居高，智慧醫療與 AI 影像輔助判讀大量導入全台醫院。',
    avgLifeExpectancy: 81.5,
    prevailingEpidemics: ['癌症 (精準免疫治療)', '心血管疾病', '退化性關節炎'],
    sanitationContext: 'AI 輔助早期肺癌低劑量電腦斷層（LDCT）篩檢大幅普及，早期治癒率高。',
  },
  2025: {
    year: 2025,
    event: '台灣正式跨過門檻邁入「超高齡社會」（65歲以上人口佔總人口達 20% 以上），長照 3.0 政策全面啟動。',
    theme: '超高齡社會來臨·長照3.0',
    influence: '銀髮樂齡產業與在宅醫療蓬勃，退休生活規劃與財富傳承成為中年必修課。',
    avgLifeExpectancy: 82.0,
    prevailingEpidemics: ['阿茲海默症 (高齡失智)', '肌少症', '多重慢性病'],
    sanitationContext: '全台廣設社區失智共照中心，健保推行「在宅急症照護」讓長者在家即可接受點滴抗生素治療。',
    isEpidemicOutbreak: true,
  },
  2026: {
    year: 2026,
    event: '丙午火旺年，AI 個人代理與精準生醫基因晶片融入常民日常健康管理，全台百歲人瑞突破萬人。',
    theme: '精準生醫躍進·火運創新',
    influence: '穿戴裝置即時預警心律不整與睡眠呼吸中止，預防醫學讓高齡長者活力自主生活。',
    avgLifeExpectancy: 82.5,
    prevailingEpidemics: ['心血管退化', '認知障礙', '代謝症候群'],
    sanitationContext: '個人化生活規劃曆與五行調神養生心法成為熟齡族修身實踐指南。',
  },

  // ==========================================
  // 2027 ~ 2060+ 年代 (超高齡智慧永續社會與生醫長壽時代)
  // 平均壽命邁向 85~90+ 歲；無人長照自駕車、再生醫學修復、百歲天年成為常態
  // ==========================================
  2030: {
    year: 2030,
    event: '全島智慧微電網成熟，AI 居家陪伴機器人與生醫微流體健康晶片普及至多數長者家庭。',
    theme: '智慧微電網·AI照護普及',
    influence: '銀髮族在宅安老比例突破85%，長輩生活尊嚴與獨立自主大幅提升。',
    avgLifeExpectancy: 83.5,
    prevailingEpidemics: ['慢性退化性疾病', '極端氣候熱浪脆弱'],
    sanitationContext: '全台公共場所廣設「熱浪避難降溫站」，科技降低極端氣候對高齡心血管之威脅。',
  },
  2035: {
    year: 2035,
    event: 'AI 照護機器人進駐全台社區日照中心，緩解少子化照護人力短缺；自體免疫與幹細胞修復技術在台生根。',
    theme: 'AI照護機器人·再生醫學普及',
    influence: '退化性關節與臟器修復治療平民化，七八十歲長者依然健步如飛暢遊山海。',
    avgLifeExpectancy: 85.0,
    prevailingEpidemics: ['細胞衰老綜合症', '晚期失智'],
    sanitationContext: '再生醫學突破使癌症轉化為可長期共存之慢性病，不再聞癌色變。',
  },
  2040: {
    year: 2040,
    event: '台灣邁入智慧淨零永續社會，無人巡迴醫療車穿梭偏鄉部落，全島城鄉醫療落差完全消除。',
    theme: '淨零永續·無人巡迴醫療',
    influence: '數位遊牧與城鄉移居生活隨處可行，偏鄉長老安享現代先端遠距生醫守護。',
    avgLifeExpectancy: 86.5,
    prevailingEpidemics: ['高齡器官功能耗損', '極端氣候適應'],
    sanitationContext: '個人基因定序終身追蹤，飲食與起居依據個人五行與基因缺陷即時調配。',
  },
  2050: {
    year: 2050,
    event: '台灣達成全島淨零碳排，無人微交通與全息遠端醫療融入生活，百歲健康老者比率居世界前茅。',
    theme: '淨零碳排達成·百歲天年世代',
    influence: '百歲人瑞依然從事社區志工與文化傳承，生命長壽且心智清朗。',
    avgLifeExpectancy: 88.0,
    prevailingEpidemics: ['自然天年機能沉降'],
    sanitationContext: '安寧緩和醫療臻於至善，長者在親友圍繞與優雅音樂中無痛安詳歸天。',
  },
  2060: {
    year: 2060,
    event: '次世代奈米修復科技與全息意識數位存檔實現，人類生命品質與精神傳承達到歷史新高峰。',
    theme: '奈米再生醫學·全息精神長青',
    influence: '肉體享百歲天年之際，其一生行誼、智慧悟道得以全息存檔世代流傳。',
    avgLifeExpectancy: 90.0,
    prevailingEpidemics: ['自然天命終局'],
    sanitationContext: '百歲長者在先進生醫與道家清淨心靈調和下，圓滿無疾而終、壽終正寢。',
  },
};

/**
 * 依西曆年份取得時代公衛與傳染病健康輪廓資料
 */
export function getTaiwanEraHealthProfile(year: number): {
  eraName: string;
  avgLifeExpectancy: number;
  prevailingEpidemics: string[];
  sanitationContext: string;
  isEpidemicOutbreak: boolean;
  epidemicName?: string;
  healthDecayMultiplier: number;
} {
  // 若該年有精準字典對應
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

  // 區間年代回退推導 (1845 以前或中間未精確列舉年份)
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
  if (year >= 1860 && year <= 1894) {
    return {
      eraName: `${year}年清同治/光緒年間開港通商時期`,
      avgLifeExpectancy: 33,
      prevailingEpidemics: ['惡性瘧疾', '霍亂', '天花', '阿米巴痢疾'],
      sanitationContext: '西方教會醫師引進金雞納霜抗瘧，但整體公共衛生尚未建立，四十歲即為高壽。',
      isEpidemicOutbreak: false,
      healthDecayMultiplier: 1.6,
    };
  }
  if (year >= 1895 && year <= 1919) {
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
  if (year >= 1920 && year <= 1945) {
    return {
      eraName: `${year}年日治中後期（近代防疫與戰時體制）`,
      avgLifeExpectancy: 45,
      prevailingEpidemics: ['肺結核 (癆病)', '局地瘧疾', '砂眼', '營養不良'],
      sanitationContext: '鼠疫天花絕跡，自來水普及；但肺結核仍為頭號殺手，戰時藥品短缺、避難衛生條件嚴苛。',
      isEpidemicOutbreak: year >= 1941,
      healthDecayMultiplier: 1.2,
    };
  }
  if (year >= 1946 && year <= 1970) {
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
  if (year >= 1971 && year <= 1994) {
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
  if (year >= 1995 && year <= 2026) {
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

  // 2027 及未來
  return {
    eraName: `${year}年超高齡智慧永續時代`,
    avgLifeExpectancy: 86,
    prevailingEpidemics: ['高齡退化性疾病', '失智症', '極端氣候熱浪'],
    sanitationContext: '全台邁入超高齡社會，生醫科技、長照3.0與AI居家微電網守護百歲天年健康。',
    isEpidemicOutbreak: false,
    healthDecayMultiplier: 0.5,
  };
}

/**
 * 取得完整年度歷史與公衛紀錄
 */
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

/**
 * 依據西曆年份取得對應之台灣當代社會時代背景與公衛壽命脈絡
 */
export function getTaiwanEraContext(year: number): string {
  const record = getTaiwanEraRecord(year);
  const epidemicText = record.prevailingEpidemics.length > 0
    ? ` 主要疾疫為${record.prevailingEpidemics.slice(0, 3).join('、')}。`
    : '';
  const outbreakNotice = record.isEpidemicOutbreak ? ' ⚠️【時代重大時疫/公衛關卡】' : '';

  return `${year}年台灣時代背景【${record.theme}】：${record.event}${outbreakNotice} 當代公衛環境：全台平均壽命約 ${record.avgLifeExpectancy} 歲。${epidemicText}${record.sanitationContext}`;
}
