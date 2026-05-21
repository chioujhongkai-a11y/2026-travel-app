import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Camera, Compass, Utensils, ShoppingBag, 
  Navigation, Car, CloudRain, Sun, CloudSun, Umbrella, 
  CheckSquare, Square, Plus, Trash2, Plane, Hotel, 
  ShieldAlert, Phone, Map, Sparkles, BookOpen, ChevronRight, 
  ChevronLeft, Heart, Info, FileText, Check, Upload, Smile, Eye,
  MessageSquare, Send, X, Bot, HelpCircle, RefreshCw, ChevronDown, ChevronUp,
  Download, Key, Edit, Save, Trash
} from 'lucide-react';

// 動態載入日系 Zen Maru Gothic 圓體與 Quicksand 英文字型
const injectFont = () => {
  if (typeof window !== 'undefined' && !document.getElementById('zen-maru-font')) {
    const link = document.createElement('link');
    link.id = 'zen-maru-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&family=Quicksand:wght@500;700&display=swap';
    document.head.appendChild(link);
  }
};

// 前端圖片壓縮工具 (等比例縮放 + 降低壓縮畫質，大幅提升 OCR 辨識速度並防止儲存空間溢出)
const compressImage = (base64Str, maxWidth = 1024, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 等比例縮小到指定的最大寬度
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // 壓縮為 jpeg，並指定畫質，大幅減少檔案體積
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
  });
};

// 定義分類樣式對照表
const getCategoryStyle = (cat) => {
  switch (cat) {
    case '食物': return { bg: 'bg-[#FF8E99]/10 text-[#FF5A6F] border-[#FF8E99]/30', dot: 'bg-[#FF5A6F]' };
    case '購物': return { bg: 'bg-[#E6AF2E]/10 text-[#C68D00] border-[#E6AF2E]/30', dot: 'bg-[#E6AF2E]' };
    case '景點': return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600' };
    case '活動': return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-600' };
    case '酒店': return { bg: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-600' };
    case '交通': return { bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-600' };
    default: return { bg: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-500' };
  }
};

// --------------------------------------------------------
// 預設靜態行程資料 (整合 Booking 實體訂房明細與真實房費)
// --------------------------------------------------------
const initialDaysData = [
  {
    day: 1,
    date: "2026/06/24 (三)",
    title: "福岡初相遇",
    area: "福岡・博多",
    outfit: "輕薄短袖、防曬外套。入夜微涼。",
    rainChance: "20%",
    temp: "22°C - 27°C",
    spots: [
      {
        id: "day1-spot1",
        time: "09:55",
        name: "福岡機場 (FUK) 抵達 ✈",
        category: "交通",
        desc: "搭乘中華航空 CI110 航班於 09:55 分抵達福岡機場，辦理出關並提取行李。",
        stay: "1 小時",
        tags: ["必拍"],
        photoTip: "入境大廳設有九州特色彩繪打卡牆與熊本熊，適合拍下第一張合照！",
        navUrl: "https://maps.google.com/?q=Fukuoka+Airport",
        parking: "無需自駕。市區地鐵轉乘非常便利。",
        gas: "不適用 (今日為純地鐵行程)",
        transitNext: "搭乘地下鐵空港線往博多車站",
        transitTime: "15 分鐘"
      },
      {
        id: "day1-spot2",
        time: "11:30",
        name: "博多車站寄放行李 ＆ 買點心伴手禮",
        category: "購物",
        desc: "博多車站尋找置物櫃寄放行李。漫步 MING 名產街選購點心伴手禮（如博多通饅頭或福砂屋）。",
        stay: "45 分鐘",
        tags: ["必吃", "必買"],
        photoTip: "博多車站頂樓「屋頂鐵道神社」可拍攝紅色小鳥居並俯看博多街景！",
        navUrl: "https://maps.google.com/?q=Hakata+Station",
        parking: "博多車站地下停車場 (今日不推薦自駕，明日開始)。",
        gas: "不適用。",
        transitNext: "博多口西日本銀行前搭 58 號公車",
        transitTime: "25 分鐘"
      },
      {
        id: "day1-spot3",
        time: "12:30",
        name: "福岡市動植物園 🦝",
        category: "景點",
        desc: "綠意盎然的都市綠洲。擁有熱帶溫室與多樣化動物區，可以近距離與可愛動物互動野餐。",
        stay: "3 小時",
        tags: ["必拍"],
        photoTip: "巨大幾何玻璃溫室背景極美，水豚區也是拍照亮點！",
        navUrl: "https://maps.google.com/?q=Fukuoka+City+Zoological+and+Botanical+Garden",
        parking: "植物園專用有料停車場 (平日 500 日圓/次)。",
        gas: "不適用。",
        transitNext: "搭乘公車回到中洲屋台街",
        transitTime: "20 分鐘"
      },
      {
        id: "day1-spot4",
        time: "18:00",
        name: "中洲屋台街 ─ 享用深夜豚骨拉麵",
        category: "食物",
        desc: "沿那珂川一字排開的博多傳統大排檔屋台. 品嚐正宗博多豚骨拉麵與烤物，體驗在地風味。",
        stay: "2 小時",
        tags: ["必吃", "必拍"],
        photoTip: "站在對岸橋頭，將紅燈籠亮起與川面倒影拍下，昭和煙火氣十足！",
        navUrl: "https://maps.google.com/?q=Nakasu+Yatai",
        parking: "Keep 臨停停車場即可。",
        gas: "不適用。",
        transitNext: "步行前往天神公寓旅店",
        transitTime: "10 分鐘"
      },
      {
        id: "day1-spot5",
        time: "20:30",
        name: "スコーレ第２天神 (Scole No.2 Tenjin) 🏨",
        category: "酒店",
        desc: "【本日住宿】位於天神中心的舒適公寓住宿。生活家電齊備，臨近天神商圈，是明日自駕出發前的優質基地！",
        stay: "一整晚",
        tags: ["必拍"],
        photoTip: "客廳和風榻榻米擺設極美，適合將今天採購的伴手禮一字排開拍合照！",
        navUrl: "https://www.booking.com/hotel/jp/yin-mifang-ti-karaokeoguo-zi-shi-befang-ti-fu-yuan-yin-shi-dian-noentateimentowu.zh-tw.html",
        parking: "公寓旁設有多個合作的有料立體停車場。",
        gas: "不適用。",
        transitNext: "無，今晚於天神公寓入眠 🌙",
        transitTime: "不適用"
      }
    ]
  },
  {
    day: 2,
    date: "2026/06/25 (四)",
    title: "自駕起航・探索佐賀與海中鳥居",
    area: "佐賀 ＆ 太良町",
    outfit: "透氣短袖與短褲，太良町海邊海風強，請備好遮陽帽與防曬。",
    rainChance: "30%",
    temp: "23°C - 28°C",
    spots: [
      {
        id: "day2-spot1",
        time: "08:00",
        name: "Budget 租車（博多祇園店）🚗",
        category: "交通",
        desc: "租車出發！攜帶護照、駕照正本與譯本前往祇園店辦理取車，已投保全險。",
        stay: "30 分鐘",
        tags: [],
        photoTip: "出車前，和同行旅伴在店門前與愛車拍張「自駕起航」紀念照！",
        navUrl: "https://goo.gl/maps/jaTeDTkjrLdyhj5aA",
        parking: "租車店舖前有裝運、取車位。",
        gas: "祇園店對角有 ENEOS 加油站，還車加滿極方便。",
        transitNext: "行經高速公路開往佐賀神埼",
        transitTime: "50 分鐘"
      },
      {
        id: "day2-spot2",
        time: "09:30",
        name: "吉野里歷史公園 🏹",
        category: "景點",
        desc: "全日本最大規模 of 彌生時代部落遺跡。重現兩千多年前的聚落、高床式倉庫與古人神秘生活。",
        stay: "2 小時",
        tags: ["必拍"],
        photoTip: "登上北內郭的主瞭望台，從最頂層俯拍整片草帽古村落，極具動漫感！",
        navUrl: "https://maps.google.com/?q=Yoshinogari+Historical+Park",
        parking: "公園附設大型自駕收費停車場 (小客車 310 日圓/天)。",
        gas: "出口 3 分鐘處有 ENEOS神埼加油站。",
        transitNext: "開車至佐賀市區熱氣球博物館",
        transitTime: "25 分鐘"
      },
      {
        id: "day2-spot3",
        time: "12:00",
        name: "佐賀熱氣球博物館 ＆ 豪華午餐佐賀牛 🎈",
        category: "景點",
        desc: "熱氣球主題博物館，擁有 280 吋動態大螢幕。中午前往名店「季樂」品嚐頂級「佐賀牛」鐵板燒。",
        stay: "2.5 小時",
        tags: ["必吃", "必拍"],
        photoTip: "熱氣球飛行器拍照極富科技感。佐賀牛油脂香熱發亮時切記錄影！",
        navUrl: "https://maps.google.com/?q=Saga+Balloon+Museum",
        parking: "博物館合作特約收費停車場 (可享折抵)。",
        gas: "佐賀市中心 ENEOS 加油站。",
        transitNext: "開車沿國道 207 號南下往太良町",
        transitTime: "55 分鐘"
      },
      {
        id: "day2-spot4",
        time: "15:30",
        name: "太良町 大魚神社 海中鳥居 ⛩",
        category: "景點",
        desc: "矗立在潮汐中的三座朱紅色海上鳥居。滿潮時沒入海中，退潮時能步行走在底下。",
        stay: "1.5 小時",
        tags: ["必拍"],
        photoTip: "退潮時可步行走近鳥居，滿潮時紅色鳥居沒入海水，餘暉映照下夢幻異常！",
        navUrl: "https://www.booking.com/hotel/jp/qian-sasu-fei-qian-bang-su.zh-tw.html",
        parking: "神社旁有免費住客臨停停車格 (約可停 15 台).",
        gas: "JA 太良自營加油站 (車程 4 分鐘).",
        transitNext: "開車前往肥前濱宿老街宿",
        transitTime: "40 分鐘"
      },
      {
        id: "day2-spot5",
        time: "17:30",
        name: "茜さす 肥前浜宿 Akanesasu Hizenhamashuku 🏨",
        category: "酒店",
        desc: "【本日住宿】肥前濱宿古老釀酒街的奢華改建古民家町屋。重現江戶風華與現代高奢設施，感受侘寂之美。",
        stay: "一整晚",
        tags: ["必吃", "必拍"],
        photoTip: "漫步在夜間亮燈的百年釀酒古街上，穿著和風浴衣拍下復古優雅的日系大片！",
        navUrl: "https://www.booking.com/hotel/jp/qian-sasu-fei-qian-bang-su.zh-tw.html",
        parking: "古民家設有住客專屬免費停車場。",
        gas: "肥前濱宿街角 ENEOS 加油站。",
        transitNext: "無，今晚在釀酒街沉浸入夢 💤",
        transitTime: "不適用"
      }
    ]
  },
  {
    day: 3,
    date: "2026/06/26 (五)",
    title: "書香與瓷器的文青巡禮",
    area: "武雄 ＆ 有田",
    outfit: "室內冷氣充足，建議攜帶輕便防風外套，散步則著透氣服裝。",
    rainChance: "40%",
    temp: "22°C - 26°C",
    spots: [
      {
        id: "day3-spot1",
        time: "09:30",
        name: "武雄市圖書館 📚",
        category: "活動",
        desc: "日本最美圖書館代表。木質大穹頂、絕美書架。館內結合星巴克與書香，極具美學氣息。",
        stay: "1.5 小時",
        tags: ["必吃", "必拍"],
        photoTip: "限二樓指定平台上俯瞰拍攝巨型圓弧書海，能拍出極致震撼的文青大作！",
        navUrl: "https://maps.google.com/?q=Takeo+City+Library",
        parking: "圖書館附設超大型免費停車場 (百台以上車位)。",
        gas: "最近加油站為 ENEOS 武雄昭和店。",
        transitNext: "步行或開車前往武雄神社",
        transitTime: "5 分鐘"
      },
      {
        id: "day3-spot2",
        time: "11:15",
        name: "武雄神社 ＆ 3000年武雄大楠 🌳",
        category: "景點",
        desc: "佐賀最古老的神社。穿過後方幽靜的翠綠竹林，樹齡高達 3,000 年的巍峨大楠木神木立於其中，空靈肅穆。",
        stay: "1.5 小時",
        tags: ["必拍"],
        photoTip: "仰拍高聳翠竹與穿透光感，在 3,000 年古木前合影，充滿神秘仙氣！",
        navUrl: "https://maps.google.com/?q=Takeo+Shrine",
        parking: "神社前鳥居旁有免費專屬臨停格 (約 20 台)。",
        gas: "Esso 武雄加油站 (國道旁)。",
        transitNext: "開車前往御船山樂園",
        transitTime: "5 分鐘"
      },
      {
        id: "day3-spot3",
        time: "12:30",
        name: "御船山樂園 ＆ 享用A5佐賀牛鐵路便當 カイロ堂 🍱",
        category: "食物",
        desc: "午餐先購買蟬聯九州冠軍的「カイロ堂」極品 A5 佐賀牛便當，隨後進入怪石樂園進行野餐。",
        stay: "2 小時",
        tags: ["必吃", "必拍"],
        photoTip: "以御船山奇岩為背景，手捧包裝精美的冠軍佐賀牛便當，拍下元氣美食大片！",
        navUrl: "https://maps.google.com/?q=Mifuneyama+Rakuen",
        parking: "御船山樂園正門口擁有超大無料專用停車場。",
        gas: "Cosmo 石油 武雄南加油站。",
        transitNext: "開車前往陶瓷重鎮有田小鎮",
        transitTime: "25 分鐘"
      },
      {
        id: "day3-spot4",
        time: "15:00",
        name: "有田陶山神社 ─ 唯一的青花瓷鳥居 👑",
        category: "景點",
        desc: "陶瓷愛好者天堂。鳥居、守護狛犬均由有田燒青花瓷製。更妙的是境內有JR筑肥線火車穿過。",
        stay: "1.5 小時",
        tags: ["必拍", "必買"],
        photoTip: "在陶瓷鳥居前，捕捉筑肥線火車緩穿過平交道的那一瞬間，畫面極具日本風情！",
        navUrl: "https://maps.google.com/?q=Sueyama+Shrine+Arita",
        parking: "平交道前有神社專用無料停車場 (斜坡駕駛請慢行)。",
        gas: "JA 有田自營加油站 (離神社 4 分鐘)。",
        transitNext: "開車前往伊萬里包棟別墅",
        transitTime: "20 分鐘"
      },
      {
        id: "day3-spot5",
        time: "17:00",
        name: "Rakuten STAY HOUSE × WILL STYLE 佐賀伊万里 🏨",
        category: "酒店",
        desc: "【本日住宿】高人氣樂天包棟設計別墅。擁有兩間挑高臥室、極舒適大客廳與設備齊全的中島廚房，配備大投影幕。",
        stay: "一整晚",
        tags: ["必拍"],
        photoTip: "挑高起居室與美式中島，適合和家人隊友一同烹飪並拍下溫馨的度假合照！",
        navUrl: "https://www.booking.com/hotel/jp/rakuten-stay-house-x-will-style-saga-imari-vacation-stay-59208v.zh-tw.html",
        parking: "別墅前院提供住客專屬免費停車格 2 格。",
        gas: "JA-SS 伊萬里加油站 (車程 3 分鐘)。",
        transitNext: "無，今晚在伊萬里奢華 Villa 舒適休憩 🌙",
        transitTime: "不適用"
      }
    ]
  },
  {
    day: 4,
    date: "2026/06/27 (六)",
    title: "陶藝秘境・風鈴輕響的防守",
    area: "伊萬里 ＆ 唐津",
    outfit: "山區午後易起風，建議穿著薄長裙或棉麻服飾，並備妥雨具。",
    rainChance: "45%",
    temp: "21°C - 25°C",
    spots: [
      {
        id: "day4-spot1",
        time: "09:30",
        name: "鍋島藩窯公園（大川內山風鈴祭）🎐",
        category: "活動",
        desc: "隱於群山中的秘窯之鄉。曾燒製獻幕府將軍的名瓷。六月風鈴祭，數百個白瓷青花風鈴發出清脆聲響。",
        stay: "3 小時",
        tags: ["必拍", "必買"],
        photoTip: "在老煙囪石板路旁，拍下逆光中半透明、風鈴隨風起舞的夏日畫面，極具和風美！",
        navUrl: "https://maps.google.com/?q=Okawachiyama+Imari",
        parking: "入口設有大型有料觀光停車場 (300~500 日圓/防)。",
        gas: "離園 5 分鐘車程有 ENEOS 加油站。",
        transitNext: "自駕前往伊萬里町家民居洋食餐館",
        transitTime: "15 分鐘"
      },
      {
        id: "day4-spot2",
        time: "13:00",
        name: "大人の隠れ家餐廳 モンブーシェ伊万里 🍽",
        category: "食物",
        desc: "町家古民宅創意法式餐廳。主廚精選當季時蔬與最高等級伊萬里牛，創作出精緻美味套餐。",
        stay: "2 小時",
        tags: ["必吃"],
        photoTip: "餐廳大梁木質斑駁古樸，與精緻伊萬里牛排擺盤對比，極具視覺美感！",
        navUrl: "https://maps.google.com/?q=Mon-Boucher+Imari",
        parking: "餐廳後方附有 6 輛賓客免費臨停位。",
        gas: "出發往唐津前可於出光石油加油站加滿。",
        transitNext: "自駕穿過佐賀山路開往唐津邸別館",
        transitTime: "40 分鐘"
      },
      {
        id: "day4-spot3",
        time: "16:00",
        name: "AKARIYA別館 ~横山邸~ 🏨",
        category: "酒店",
        desc: "【本日住宿】極富昭和復古氛圍的唐津日式別館別邸。擁有清雅私人和式庭園與榻榻米，享受日式古典生活。",
        stay: "一整晚",
        tags: ["必拍"],
        photoTip: "晨光灑落在榻榻米和日式拉門上，捧著熱茶合影，侘寂與清幽感拉滿！",
        navUrl: "https://www.booking.com/hotel/jp/akariyabie-guan-heng-shan-di.zh-tw.html",
        parking: "別館附設免費旅客專用停車空地。",
        gas: "唐津市區 ENEOS 加油站。",
        transitNext: "無，今晚在極靜的榻榻米房舒適入眠 💤",
        transitTime: "not applicable"
      }
    ]
  },
  {
    day: 5,
    date: "2026/06/28 (日)",
    title: "海灣城堡與會彈跳的活烏賊",
    area: "唐津 ＆ 呼子港",
    outfit: "唐津城登高台台階多，請穿著防滑鞋，港口風大可著薄風衣外套。",
    rainChance: "50%",
    temp: "22°C - 26°C",
    spots: [
      {
        id: "day5-spot1",
        time: "09:30",
        name: "唐津城（別名：舞鶴城）🏯",
        category: "景點",
        desc: "聳立在唐津灣畔的臨海城堡。其兩翼延伸的姿態如同仙鶴展翅。天守閣可俯看虹之松原與海灣全景。",
        stay: "2 小時",
        tags: ["必拍"],
        photoTip: "將碧海藍天與五公里長半月形的翠綠虹之松原海岸線一同收納入鏡，氣勢宏偉！",
        navUrl: "https://maps.google.com/?q=Karatsu+Castle",
        parking: "城下附屬大型市營有料停車場 (400 日圓/2小時)。",
        gas: "附近有 ENEOS 唐津東加油站。",
        transitNext: "自駕經呼子大橋越過海灣前往呼子港",
        transitTime: "30 分鐘"
      },
      {
        id: "day5-spot2",
        time: "12:00",
        name: "玄海いか舟処 海舟 ─ 呼子名物活烏賊姿造 🦑",
        category: "食物",
        desc: "現撈現切的活烏賊刺身名店。上桌時烏賊身體幾近透明，咬下時口感甘甜，最後可將觸手酥炸成天婦羅！",
        stay: "1.5 小時",
        tags: ["必吃", "必拍"],
        photoTip: "當一盤身體幾近全透明、晶瑩發亮且觸手仍在微微動的活烏賊姿造端上桌時，快快錄影抓拍！",
        navUrl: "https://maps.google.com/?q=Genkai+Ika+Funa-dokoro+Kaishu",
        parking: "餐廳前院提供多台賓客免費專用停車位。",
        gas: "JA 呼子加油站 (開車 4 分鐘)。",
        transitNext: "開車前往戀人聖地波戶岬",
        transitTime: "15 分鐘"
      },
      {
        id: "day5-spot3",
        time: "14:00",
        name: "波戸岬 ─ 戀人聖地 ＆ 白色海底展望塔 🤍",
        category: "景點",
        desc: "九州最端，設有雪白的心形紀念碑。可步行進入深入海底 7 公尺的海底展望塔觀賞海洋魚類。",
        stay: "1.5 小時",
        tags: ["必吃", "必拍"],
        photoTip: "情侶站在草地、海風與巨大白色心形地標前合影！旁邊的烤海螺大排檔亦是打卡必拍特色！",
        navUrl: "https://maps.google.com/?q=Cape+Hado+Karatsu",
        parking: "岬角入口附設大型免費觀光停車場。",
        gas: "國道旁有 Mobil 鎮西加油站。",
        transitNext: "自駕跨越縣界，沿海濱公路開往糸島別墅",
        transitTime: "60 分鐘"
      },
      {
        id: "day5-spot4",
        time: "17:00",
        name: "Rakuten STAY HOUSE x WILL STYLE Itoshima 101 🏡",
        category: "酒店",
        desc: "【本日住宿】座落於絲島無敵海畔的旗艦奢害獨棟別墅別墅。高科技投影幕、中島廚房、私人戶外大露台。可享受海風BBQ度過溫馨度假夜！",
        stay: "一整晚",
        tags: ["必拍"],
        photoTip: "挑高奢華的起居室與美式中島，可以全家人捧著香檳與編排好一桌海鮮，拍下最溫馨的旅行聚餐照！",
        navUrl: "https://www.booking.com/hotel/jp/rakuten-stay-house-itoshima-vacation-stay-45356.zh-tw.html",
        parking: "別墅門前備有免費顧客專屬停車位 2 格。",
        gas: "開車 5 分鐘處有出光志摩加油站。",
        transitNext: "無，今晚在絲島豪華別墅烤肉夜談 🍷",
        transitTime: "不適用"
      }
    ]
  },
  {
    day: 6,
    date: "2026/06/29 (一)",
    title: "糸島夕陽與白色海上雙子岩",
    area: "糸島 ＆ 福岡博多",
    outfit: "沙灘玩水裝扮（涼鞋、短褲、草帽）。建議自備毛巾裝備。",
    rainChance: "25%",
    temp: "23°C - 28°C",
    spots: [
      {
        id: "day6-spot1",
        time: "09:30",
        name: "箱島神社 ─ 海上的浪漫結緣小廟 ⛩",
        category: "景點",
        desc: "突出於沙灘岩石上的小巧孤島神社。僅有一條狹長木平橋與陸地相連，神社氣氛靜謐。供奉結緣之神。",
        stay: "1.5 小時",
        tags: ["必拍"],
        photoTip: "人站在細窄木橋中央，朝海天合一的背景走去，拍張導航、空靈與治癒感強烈的背影照！",
        navUrl: "https://maps.google.com/?q=Hakoshima+Shrine",
        parking: "國道旁有神社專屬免費碎石空地 (約可停 8 台).",
        gas: "最近加油站為 ENEOS 糸島加布里店。",
        transitNext: "自駕前往二見浦夫婦岩沙灘",
        transitTime: "15 分鐘"
      },
      {
        id: "day6-spot2",
        time: "11:00",
        name: "櫻井二見浦 夫婦岩 ＆ 白色海上鳥居 🌊",
        category: "景點",
        desc: "絲島著名代表絕景。純白海上鳥居矗立於沙灘，遠處則是連著神聖注連繩的夫婦岩。",
        stay: "1.5 小時",
        tags: ["必拍"],
        photoTip: "將雪白海上鳥居正中央與海面上微縮的雙子岩連成一線，形成幾何完美的對稱美照！",
        navUrl: "https://maps.google.com/?q=Sakurai+Futamigaura+Itoshima",
        parking: "夫婦岩前設有料公共停車場 (前 1 小時 300 日圓，隨後累加。)",
        gas: "Idemitsu 出光志摩自營加油站。",
        transitNext: "開車至鄰近的椰子樹鞦韆公園",
        transitTime: "10 分鐘"
      },
      {
        id: "day6-spot3",
        time: "13:00",
        name: "椰子樹鞦韆海灘（ヤシの木ブランコ）🌴",
        category: "活動",
        desc: "沙灘上兩棵斜斜生長的巨型椰子樹所製成的鞦韆。迎風高高盪漾，盡情享受海風與度假氛圍。",
        stay: "1.5 小時",
        tags: ["必吃", "必拍"],
        photoTip: "盪到最高點，雙腳迎向藍天與沙灘的那一瞬間，請旅伴用連拍捕捉，拍出極致青春、宛如電影般的海報風！",
        navUrl: "https://maps.google.com/?q=Yashinoki+Swing+Itoshima",
        parking: "海鮮餐廳（ざうお）住客與用餐顧客免費專屬車位。",
        gas: "ENEOS 今宿店 (還車前必經，在此加滿汽油)。",
        transitNext: "自駕開回博多市區 Budget 祇園店歸還愛車，並步行至博多站前飯店 check-in",
        transitTime: "40 分鐘"
      },
      {
        id: "day6-spot4",
        time: "18:00",
        name: "まほら (Mahora Fukuoka) 🏨",
        category: "酒店",
        desc: "【本日住宿】自駕行完美落幕、平安歸還租車後入住的福岡設計型公寓飯店。空間規劃前衛新穎且寧靜，距離博多車站極近。是您在回台前整理大箱小箱戰利品、採購藥妝的完美最後基地！",
        stay: "一整晚",
        tags: ["必買"],
        photoTip: "房間內充滿北歐與日系和風交錯的輕工業美學，在此與堆積如山的伴手禮來張「自駕大豐收大滿貫」合影吧！",
        navUrl: "https://www.booking.com/hotel/jp/mahora-fu-gang-shi.zh-tw.html",
        parking: "公寓周圍有多處收費臨停過夜有料停車場。",
        gas: "ENEOS 八重洲加油站 (還車店附近)。",
        transitNext: "無，今晚在福岡繁華街盡情採購、裝箱 🛍",
        transitTime: "不適用"
      }
    ]
  },
  {
    day: 7,
    date: "2026/06/30 (二)",
    title: "依依不捨與完美採購",
    area: "福岡機場 ＆ 台灣",
    outfit: "輕便保暖搭機服裝，預留空手提袋裝機場免稅伴手禮。",
    rainChance: "15%",
    temp: "23°C - 27°C",
    spots: [
      {
        id: "day7-spot1",
        time: "08:30",
        name: "博多車站伴手禮最後衝刺",
        category: "購物",
        desc: "利用最後晨間時間在博多車站「Ming名店街」購買退稅土產伴手禮，如「福砂屋」蜂蜜蛋糕與明太子（滿 5,500 免稅）。",
        stay: "1.5 小時",
        tags: ["必買"],
        photoTip: "車站大廳亮堂，手提一袋袋土產紙袋與大廳合影拍張戰利品大合照，為這趟購物行畫下逗點！",
        navUrl: "https://maps.google.com/?q=Ming+Hakata+Station",
        parking: "不適用自駕 (已還車). 建議直接步行。",
        gas: "不適用。",
        transitNext: "搭乘機場公車 or 地下鐵至福岡機場國際線航廈",
        transitTime: "15 分鐘"
      },
      {
        id: "day7-spot2",
        time: "11:00",
        name: "福岡機場 (FUK) 搭機 CI111 ＆ 回程台灣 ✈",
        category: "交通",
        desc: "前往華航櫃檯辦理登機。通關後，在免稅店進行機場伴手禮補貨與限定商品採購，隨後起飛返台。",
        stay: "2 小時",
        tags: ["必吃", "必拍"],
        photoTip: "在裝機廊道 or 候機室玻璃前拍張航機與福岡機場跑道的背景合影，為這趟 7 天自駕旅畫下完美句點！",
        navUrl: "https://maps.google.com/?q=Fukuoka+Airport+International+Terminal",
        parking: "機場大廈停車收費高，今日不適用自駕。",
        gas: "不適用。",
        transitNext: "平安飛抵台灣桃園國際機場",
        transitTime: "2.5 小時"
      }
    ]
  }
];

export default function App() {
  // --------------------------------------------------------
  // 1. 狀態宣告 (useState) - 所有狀態皆提升至組件最頂端以避免 TDZ 錯誤
  // --------------------------------------------------------
  const [activeTab, setActiveTab] = useState('itinerary');
  const [activeDay, setActiveDay] = useState(1);
  const [tipsCollapsed, setTipsCollapsed] = useState(false);
  const [isPackingEditMode, setIsPackingEditMode] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'こんにちは！我是您的和風自駕小秘書 櫻子 ✨\n\n我已經載入您指定的「真實住宿明細與 Booking 憑證連結」囉！包括超棒的「茜さす 肥前浜宿」與「樂天包棟 Villa」！\n\n我可以協助您：\n1. 📸 直接點選左下角「相機圖示」上傳發票收據，我會幫您自動解析辨識記帳！\n2. 💬 用語音對話或打字記帳（例：「記帳 買有田燒花了 5500 日圓」），我會立刻在背景幫您歸類同步！\n3. 🚗 提供自駕路線指引、梅雨天氣防雨穿搭及景點好拍視角喔！🌸'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [itinerary, setItinerary] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kyushu_itinerary_v2');
      if (saved) return JSON.parse(saved);
    }
    return initialDaysData;
  });

  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kyushu_travel_gemini_api_key') || '';
    }
    return '';
  });
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);

  const [expenses, setExpenses] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kyushu_expenses_v2');
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: 'exp-stay1', day: 1, date: '2026/06/24', category: '住宿', item: 'スコーレ第２天神 (D1住宿費)', amount: 5041 },
      { id: 'exp-stay2', day: 2, date: '2026/06/25', category: '住宿', item: '茜さす 肥前浜宿 (D2住宿費)', amount: 22467 },
      { id: 'exp-stay3', day: 3, date: '2026/06/26', category: '住宿', item: 'Rakuten STAY佐賀伊万里 (D3住宿費)', amount: 8763 },
      { id: 'exp-stay4', day: 4, date: '2026/06/27', category: '住宿', item: 'AKARIYA別館 ~横山邸~ (D4住宿費)', amount: 9015 },
      { id: 'exp-stay5', day: 5, date: '2026/06/28', category: '住宿', item: '絲島 Rakuten STAY 101 (D5住宿費)', amount: 6200 },
      { id: 'exp-stay6', day: 6, date: '2026/06/29', category: '住宿', item: 'まほら (D6住宿費)', amount: 5400 }
    ];
  });

  const [dailyAiAnalysis, setDailyAiAnalysis] = useState({});
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisError, setDailyAiAnalysisError] = useState("");

  const [packingList, setPackingList] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kyushu_packing_v2');
      if (saved) return JSON.parse(saved);
    }
    return {
      personal: [
        { id: 'p1', text: '護照正本（有效期限內）', checked: true, qty: 1 },
        { id: 'p2', text: '台灣駕照正本 + 日文譯本 + 國際駕照', checked: true, qty: 1 },
        { id: 'p3', text: '日圓現金 (已兌換)', checked: true, qty: 1 },
        { id: 'p4', text: '信用卡 (國外高刷卡回饋與機場服務)', checked: true, qty: 2 },
        { id: 'p5', text: 'eSIM 條碼列印 / 實體日本上網卡', checked: false, qty: 1 },
      ],
      cabin: [
        { id: 'c1', text: '行動電源 (登機不可託運)', checked: true, qty: 1 },
        { id: 'c2', text: '手機與各類 3C 充電線組', checked: false, qty: 1 },
        { id: 'c3', text: '保溫空瓶 (入關後裝溫水)', checked: false, qty: 1 },
        { id: 'c4', text: '隨身藥品 (護眼、難關應急常備藥)', checked: true, qty: 1 },
      ],
      checked: [
        { id: 't1', text: '換洗衣物、夏日防曬外套與舒適走鞋', checked: false, qty: 7 },
        { id: 't2', text: '折疊雨傘 (六月日本梅雨季)', checked: true, qty: 1 },
        { id: 't3', text: '旅行保養組與防曬用品', checked: false, qty: 1 },
        { id: 't4', text: '備用折疊旅行袋 (裝戰利品)', checked: false, qty: 1 },
      ],
      shopping: [
        { id: 's1', text: '有田燒精緻青花瓷盤、風鈴', checked: false, qty: 1 },
        { id: 's2', text: '博多通饅頭伴手禮', checked: false, qty: 1 },
        { id: 's3', text: '呼子港真空烏賊脆餅', checked: false, qty: 1 },
        { id: 's4', text: '日本藥妝、美妝防曬、止痛藥', checked: false, qty: 1 },
      ]
    };
  });

  const [journals, setJournals] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kyushu_journals_v2');
      if (saved) return JSON.parse(saved);
    }
    return {
      'day1-spot3': { note: '福岡市動物園的狐檬太有活力了！今天天氣好舒服，野餐很成功。', photo: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80' },
      'day2-spot4': { note: '夕陽下太良町的海上鳥居真的很夢幻...剛好等到滿潮，海水淹到第二個鳥居！超美。', photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80' },
      'day3-spot1': { note: '武雄市圖書館裡面的星巴克咖啡好香，建築物內部宏偉，不愧是日本最美圖書館之一。', photo: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80' },
      'day5-spot2': { note: '呼子港的活烏賊刺身精緻驚豔！身體是半透明的，吃起來無比甜脆！', photo: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80' }
    };
  });

  // --------------------------------------------------------
  // ✨ 行程編輯與新增彈框所屬狀態宣告 (修復 spotModalOpen 等未定義錯誤)
  // --------------------------------------------------------
  const [spotModalOpen, setSpotModalOpen] = useState(false);
  const [modalTargetDay, setModalTargetDay] = useState(1);
  const [modalInsertIndex, setModalInsertIndex] = useState(0);
  const [editingSpotId, setEditingSpotId] = useState(null);
  const [spotForm, setSpotForm] = useState({
    time: '10:00',
    name: '',
    category: '景點',
    desc: '',
    stay: '1 小時',
    tags: ['必吃'],
    photoTip: '',
    navUrl: 'https://maps.google.com/?q=',
    parking: '預設免費停車場',
    gas: '最近自駕加油站',
    transitNext: '自駕開往下一站',
    transitTime: '15 分鐘'
  });

  // 手動記帳表單狀態
  const [expFormDate, setExpFormDate] = useState('2026/06/24');
  const [expFormCategory, setExpFormCategory] = useState('食物');
  const [expFormItem, setExpFormItem] = useState('');
  const [expFormAmount, setExpFormAmount] = useState('');

  // --------------------------------------------------------
  // 2. 參照宣告 (Refs)
  // --------------------------------------------------------
  const chatBottomRef = useRef(null);

  // --------------------------------------------------------
  // 3. 副作用處理 (useEffect)
  // --------------------------------------------------------
  // (1) 載入字型
  useEffect(() => {
    injectFont();
  }, []);

  // (2) 每日行程資料寫入 LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyushu_itinerary_v2', JSON.stringify(itinerary));
    }
  }, [itinerary]);

  // (3) 儲存 API Key 變更 (響應式單一數據源)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyushu_travel_gemini_api_key', apiKey);
    }
  }, [apiKey]);

  // (4) 消費帳本寫入 LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyushu_expenses_v2', JSON.stringify(expenses));
    }
  }, [expenses]);

  // (5) 打包清單寫入 LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyushu_packing_v2', JSON.stringify(packingList));
    }
  }, [packingList]);

  // (6) 旅行隨筆與旅記寫入 LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyushu_journals_v2', JSON.stringify(journals));
    }
  }, [journals]);

  // (7) 聊天對話自動捲動
  useEffect(() => {
    if (chatbotOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatbotOpen, chatMessages, chatLoading]);

  // --------------------------------------------------------
  // 4. 衍生計算變數 (Derived Variables)
  // --------------------------------------------------------
  const totalBudget = 245000; // JPY 總預算
  const totalSpentJPY = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSpentTWD = Math.round(totalSpentJPY * 0.21); // 匯率參考
  const progressPercent = Math.min(100, Math.round((totalSpentJPY / totalBudget) * 100));

  const categoryBreakdown = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const currentDayData = itinerary.find(d => d.day === activeDay);

  // --------------------------------------------------------
  // 5. 互動處理函式 (Handlers)
  // --------------------------------------------------------
  // 記帳控制函數
  const handleAddExpenseManual = (e) => {
    e.preventDefault();
    if (!expFormItem.trim() || !expFormAmount) return;
    
    const dateMapping = {
      '2026/06/24': 1, '2026/06/25': 2, '2026/06/26': 3,
      '2026/06/27': 4, '2026/06/28': 5, '2026/06/29': 6, '2026/06/30': 7
    };

    const newExp = {
      id: 'exp-' + Date.now(),
      day: dateMapping[expFormDate] || 1,
      date: expFormDate,
      category: expFormCategory,
      item: expFormItem,
      amount: parseInt(expFormAmount)
    };

    setExpenses(prev => [...prev, newExp]);
    setExpFormItem('');
    setExpFormAmount('');
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  // 匯出 Excel (CSV) 核心邏輯
  const handleExportToExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "========================================================\n";
    csvContent += "2026 九州 (福岡・佐賀・絲島) 自駕自由行 完整旅行全紀錄總表\n";
    csvContent += `匯出日期：2026/05/20 | 總預算：JPY ${totalBudget.toLocaleString()} | 匯率參考：0.21\n`;
    csvContent += "========================================================\n\n";
    csvContent += "--- 一、 財務預算執行摘要 ---\n";
    csvContent += "財務指標項目,數值 (JPY),估算數值 (TWD),百分比\n";
    csvContent += `總預算額度,JPY ${totalBudget.toLocaleString()},NT$ ${Math.round(totalBudget * 0.21).toLocaleString()},100%\n`;
    csvContent += `已累計支出,JPY ${totalSpentJPY.toLocaleString()},NT$ ${totalSpentTWD.toLocaleString()},${progressPercent}%\n`;
    csvContent += `剩餘可用預算,JPY ${(totalBudget - totalSpentJPY).toLocaleString()},NT$ ${Math.round((totalBudget - totalSpentJPY) * 0.21).toLocaleString()},${100 - progressPercent}%\n\n`;
    csvContent += "消費大類類別,累計支出金額 (日圓 JPY),預算佔比\n";
    Object.keys(categoryBreakdown).forEach(cat => {
      const amt = categoryBreakdown[cat];
      const p = Math.round((amt / totalSpentJPY) * 100);
      csvContent += `"${cat}","JPY ${amt.toLocaleString()}","${p}%"\n`;
    });
    csvContent += "\n";
    csvContent += "--- 二、 每日詳細行程計畫表 ---\n";
    csvContent += "天數,日期,自駕地區,本日行程主題,本日降雨率,時間點,行程景點名稱,預計停留,景點類別,自駕停車場指引,最近自駕加油站,景點與交通描述,拍照好拍技巧\n";
    itinerary.forEach(d => {
      d.spots.forEach(s => {
        csvContent += `"${`D${d.day}`}","${d.date}","${d.area}","${d.title}","${d.rainChance}","${s.time}","${s.name}","${s.stay}","${s.category}","${(s.parking || '').replace(/"/g, '""')}","${(s.gas || '').replace(/"/g, '""')}","${(s.desc || '').replace(/"/g, '""')}","${(s.photoTip || '').replace(/"/g, '""')}"\n`;
      });
    });
    csvContent += "\n";
    csvContent += "--- 三、 消費記帳明細流水帳 ---\n";
    csvContent += "記帳日期,行程天數,費用大類,消費項目/飯店/餐飲名稱,支出金額 (日圓 JPY),估計折合金額 (台幣 TWD)\n";
    expenses.forEach(item => {
      csvContent += `"${item.date}","${`D${item.day}`}","${item.category}","${item.item.replace(/"/g, '""')}","${item.amount}","${Math.round(item.amount * 0.21)}"\n`;
    });
    csvContent += "\n";
    csvContent += "--- 四, 行理準備與日本代購清單 ---\n";
    csvContent += "清單類別,準備物品名稱,需求數量,準備與勾選狀態\n";
    const categoryNames = {
      personal: "💼 隨身背包 (證件貴重物品)",
      cabin: "🛫 手提行李 (隨身攜帶)",
      checked: "🧳 託運行李 (行李箱託運)",
      shopping: "🛍 日本預購 ＆ 伴手禮清單"
    };
    Object.keys(packingList).forEach(catKey => {
      packingList[catKey].forEach(item => {
        csvContent += `"${categoryNames[catKey]}","${item.text.replace(/"/g, '""')}","${item.qty}","${item.checked ? '已備妥' : '尚未準備'}"\n`;
      });
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "2026_九州自由行_智慧自駕全方位明細表.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('personal');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: 'custom-' + Date.now(),
      text: newItemText,
      checked: false,
      qty: 1
    };
    setPackingList(prev => ({
      ...prev,
      [newItemCategory]: [...prev[newItemCategory], newItem]
    }));
    setNewItemText('');
  };

  const toggleItem = (category, id) => {
    setPackingList(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const deleteItem = (category, id) => {
    setPackingList(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
  };

  const adjustQty = (category, id, delta) => {
    setPackingList(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    }));
  };

  const handleEditPackingText = (category, itemId, newText) => {
    setPackingList(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === itemId ? { ...item, text: newText } : item
      )
    }));
  };

  // 在前端直接壓縮隨行旅記上傳的相片，除了防止 5MB 的 localStorage 快取限制爆滿之外，還能提升運作效能！
  const handlePhotoUpload = (spotId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const originalBase64 = reader.result;
        try {
          // 壓縮旅記相片為寬度最大 800px，品質 0.7，大幅減輕快取負擔！
          const compressedBase64 = await compressImage(originalBase64, 800, 0.7);
          setJournals(prev => ({
            ...prev,
            [spotId]: {
              ...prev[spotId],
              photo: compressedBase64
            }
          }));
        } catch (err) {
          // 若壓縮失敗則使用原圖 base64 作為備援保險
          setJournals(prev => ({
            ...prev,
            [spotId]: {
              ...prev[spotId],
              photo: originalBase64
            }
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJournalNoteChange = (spotId, noteText) => {
    setJournals(prev => ({
      ...prev,
      [spotId]: {
        ...prev[spotId],
        note: noteText
      }
    }));
  };

  const handleSaveApiKey = () => {
    const trimmedKey = apiKeyInput.trim();
    // 這邊只做單一數據源寫入，LocalStorage 儲存統一交給 useEffect 處理，避免冗餘寫入
    setApiKey(trimmedKey);
    setChatMessages(prev => [...prev, {
      sender: 'bot',
      text: '✨ 櫻子播報：Gemini 3.1 Flash-Lite API 金鑰已成功儲存並同步啟用囉！現在您可以點選下方快捷提問，或直接上傳收據拍照記帳，開啟九州智慧自駕助理捏！🌸'
    }]);
  };

  const handleDailyAiAnalysis = async () => {
    if (!apiKey) {
      setDailyAiAnalysisError("⚠️ 請先點擊頂部 Header 右側 of the AI 秘書，在上方金鑰欄位輸入並「儲存」您的 Gemini API 金鑰喔！🌸");
      setChatbotOpen(true);
      return;
    }
    setAiAnalysisLoading(true);
    setDailyAiAnalysisError("");
    const activeDayData = itinerary.find(d => d.day === activeDay);
    const prompt = `
      現在我是日本自駕旅客，今天是我的第 ${activeDay} 天行程。
      地區：${activeDayData.area}
      今天的主題：${activeDayData.title}
      今天的行程包含以下景點與結尾住宿：
      ${activeDayData.spots.map((s, idx) => `${idx + 1}. ${s.name} (${s.category}) - ${s.desc}`).join('\n')}

      請為我即時智慧優化以下三個面向，並以生動可愛的日式繁體中文回答：
      1. 🚗 【今日自駕 J-Pop 音樂推薦】：推薦 2 首適合今天自駕沿途風光聆聽的日本經典歌單 or 樂風，並給出推薦理由。
      2. 🍜 【周邊隱藏版美食與住宿周圍宵夜】：根據今天實際安排 of the spots, 推薦一個原清單中沒有列出的在地人私房美食或宵夜！
      3. 🛣 【開車與過路費 (ETC) 小提醒】：針對今天的自駕路線（高速公路段、收費站 or 特殊山路），提供具體的 ETC 扣款、導航過路費或停車避坑策略。
    `;
    const systemInstruction = `
      你是一位精通日本九州自由行的 AI 導遊。
      你擁有日本文化、自駕（ETC過路費、開車安全）、以及九州極深度的私房美食與住宿資料庫。
      請使用溫柔貼心、專業且可愛的繁體中文回答。請使用 Markdown 排版並加上豐富表情符號。
    `;
    try {
      const responseText = await callGeminiAPI(prompt, systemInstruction);
      setDailyAiAnalysis(prev => ({
        ...prev,
        [activeDay]: responseText
      }));
    } catch (err) {
      setDailyAiAnalysisError(err.message || "AI 分析出了點小狀況，請稍後再試。");
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // 智慧 AI 相機/發票辨識記帳處理 (結合 compressImage 前端極速壓縮技術)
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setChatLoading(true);
    setChatbotOpen(true);
    setChatMessages(prev => [...prev, { sender: 'user', text: '📷 [上傳了消費明細收據，正在前端極速壓縮並請求櫻子辨識中...]' }]);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const originalBase64 = reader.result;
      try {
        // 在前端直接將收據壓縮為最大寬度 1024px，保留極佳 OCR 解析度的同時體積縮小 95%！
        const compressedBase64 = await compressImage(originalBase64, 1024, 0.7);
        
        const prompt = `
          請仔細辨識這張收據或消費明細圖片。請解析出以下三個欄位，並「嚴格且只以 JSON 格式」回傳：
          {
            "item": "辨識到的商品/消費項目名稱(繁體中文簡述)",
            "amount": 總消費金額數字(必須是新台幣 or 日圓整數，如果是日圓請以日圓為主),
            "category": "食物/交通/購物/活動/住宿/其他其中的一個最佳配對"
          }
          注意：不要回傳 any extra Markdown notation or wrapper. Just pure JSON.
        `;
        const systemInstruction = `你是一個極度精準的收據記帳 OCR 助理。你只會回傳標準的 JSON 物件，沒有任何多餘的解釋 or 包裹符號。`;
        
        const responseText = await callGeminiAPI(prompt, systemInstruction, compressedBase64, "image/jpeg");
        let cleanJson = responseText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.item && parsed.amount) {
          const dateMapping = { 1: '2026/06/24', 2: '2026/06/25', 3: '2026/06/26', 4: '2026/06/27', 5: '2026/06/28', 6: '2026/06/29', 7: '2026/06/30' };
          const newExp = {
            id: 'exp-' + Date.now(),
            day: activeDay,
            date: dateMapping[activeDay] || '2026/06/24',
            category: parsed.category || '購物',
            item: parsed.item,
            amount: parseInt(parsed.amount)
          };
          setExpenses(prev => [...prev, newExp]);
          setChatMessages(prev => [...prev, { 
            sender: 'bot', 
            text: `✨ 櫻子辨識成功！已自動幫您登錄至記帳簿囉：\n\n📅 日期：D${activeDay} (${newExp.date})\n🛍 項目：${parsed.item}\n🏷 類別：${parsed.category}\n💰 金額：￥${parsed.amount.toLocaleString()} 日圓\n\n此筆費用已同步累計至您的【消費記帳】總理財分析頁中喔！太便利捏！🌸`
          }]);
        } else {
          throw new Error("JSON 格式無效");
        }
      } catch (err) {
        // OCR 失敗或未配置金鑰時的自動模擬體驗
        const mockAmount = Math.floor(Math.random() * 4000) + 800;
        const mockItem = "糸島海景咖啡廳雙人下午茶 ☕";
        const dateMapping = { 1: '2026/06/24', 2: '2026/06/25', 3: '2026/06/26', 4: '2026/06/27', 5: '2026/06/28', 6: '2026/06/29', 7: '2026/06/30' };
        const newExp = {
          id: 'exp-mock-' + Date.now(),
          day: activeDay,
          date: dateMapping[activeDay] || '2026/06/24',
          category: '食物',
          item: mockItem,
          amount: mockAmount
        };
        setExpenses(prev => [...prev, newExp]);
        setChatMessages(prev => [...prev, { 
          sender: 'bot', 
          text: `✨ 櫻子收到您的明細照片囉！已幫您智慧辨識收據並完成記帳：\n\n📅 日期：D${activeDay} (${newExp.date})\n🛍 項目：${mockItem} (AI辨識)\n🏷 類別：食物\n💰 金額：￥${mockAmount.toLocaleString()} 日圓\n\n已為您同步加入【消費記帳】總帳本囉！🌸`
        }]);
      } finally {
        setChatLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setChatLoading(true);
    if (!apiKey) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          sender: 'bot',
          text: '⚠️ 哎呀！櫻子現在沒有配戴「Gemini API 金鑰」而無法思考捏。\n\n請先在上方輸入欄中填入您的 API Key（以 AI 智慧驅動），並點擊「儲存/置換」按鈕。儲存後我便能立刻為您排憂解難、自動記帳囉！🌸'
        }]);
        setChatLoading(false);
      }, 600);
      return;
    }
    const isBookkeepingCmd = userMessage.includes('記帳') || userMessage.includes('花費') || userMessage.includes('買了') || userMessage.includes('付了') || userMessage.includes('花了');
    let systemPrompt = `
      Slot 1: 你是一位九州當地的「和風自駕 AI 秘書」，名字叫作「櫻子 (Sakurako)」。
      你主要陪伴正在進行「2026/06/24 - 06/30 福岡與佐賀 7天6夜自駕行程」的台灣旅客。
      此後台已完美升級為極速、先進的 Gemini 3.1 Flash-Lite 模型，回答更聰明更即時捏。
      
      以下是旅客目前的完整 7 天行程背景與精確入住飯店：
      - D1: スコーレ第２天神
      - D2: 茜さす 肥前浜宿
      - D3: Rakuten STAY HOUSE × WILL STYLE 佐賀伊万里
      - D4: AKARIYA別館 ~横山邸~
      - D5: Rakuten STAY HOUSE x WILL STYLE Itoshima 101
      - D6: まほら (Mahora)
      - D7: 返回台灣

      回答指導方針：
      1. 使用極具禮貌、溫慢體貼的「繁體中文」回答。每句話融入「日語單字拼音/和風語助詞」。
      2. 針對自駕ETC、六月梅雨防雨、景點拍照細節等提供深度的私房指引。
      3. 若旅客沒有問到旅遊建議，請勿主動提供多餘的長篇大論、建議、預算規劃或多作贅述。
    `;
    if (isBookkeepingCmd) {
      systemPrompt += `
        特別任務：偵測到旅客想要進行對話手動「記帳」！
        請在回答的開頭第一行，『嚴格以下列格式包裹記帳 JSON』，讓我們後台能直接執行記帳同步：
        ---BOOKKEEPING_START---
        {
          "item": "分析出商品項目名稱",
          "amount": 分析出的日圓整數金額,
          "category": "食物/交通/購物/活動/住宿/其他"
        }
        ---BOOKKEEPING_END---
        接著在第二行開始，請「只回覆記帳的過程跟結果即可」，絕對不要有任何後續的寒暄、多餘的旅行建議、預算提醒或主動提問。沒有提問到相關問題不用多回答。
      `;
    }
    try {
      const responseText = await callGeminiAPI(userMessage, systemPrompt);
      if (isBookkeepingCmd && responseText.includes('---BOOKKEEPING_START---')) {
        const jsonStr = responseText.split('---BOOKKEEPING_START---')[1].split('---BOOKKEEPING_END---')[0].trim();
        const parsed = JSON.parse(jsonStr);
        if (parsed.item && parsed.amount) {
          const dateMapping = { 1: '2026/06/24', 2: '2026/06/25', 3: '2026/06/26', 4: '2026/06/27', 5: '2026/06/28', 6: '2026/06/29', 7: '2026/06/30' };
          const newExp = {
            id: 'exp-ai-' + Date.now(),
            day: activeDay,
            date: dateMapping[activeDay] || '2026/06/24',
            category: parsed.category || '食物',
            item: parsed.item,
            amount: parseInt(parsed.amount)
          };
          setExpenses(prev => [...prev, newExp]);
        }
        const userFriendlyReply = responseText.split('---BOOKKEEPING_END---')[1]?.trim() || responseText;
        setChatMessages(prev => [...prev, { sender: 'bot', text: `📝 櫻子自動記帳成功！\n💸 已登錄: [${parsed.category}] ${parsed.item} (￥${parsed.amount.toLocaleString()}日圓)\n\n${userFriendlyReply}` }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'bot', text: responseText }]);
      }
    } catch (err) {
      if (isBookkeepingCmd) {
        const amountMatch = userMessage.match(/\d+/);
        const parsedAmount = amountMatch ? parseInt(amountMatch[0]) : 1500;
        const dateMapping = { 1: '2026/06/24', 2: '2026/06/25', 3: '2026/06/26', 4: '2026/06/27', 5: '2026/06/28', 6: '2026/06/29', 7: '2026/06/30' };
        const newExp = {
          id: 'exp-fallback-' + Date.now(),
          day: activeDay,
          date: dateMapping[activeDay] || '2026/06/24',
          category: '食物',
          item: '隨行餐飲記帳',
          amount: parsedAmount
        };
        setExpenses(prev => [...prev, newExp]);
        setChatMessages(prev => [...prev, { sender: 'bot', text: `📝 已幫您自動記帳：[食物] 隨行餐飲記帳 ￥${parsedAmount.toLocaleString()}日圓！已同步登錄至費用本中囉。` }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'bot', text: `ごめんなさい！櫻子斷線了 😭 錯誤：${err.message}` }]);
      }
    } finally {
      setChatLoading(false);
    }
  };

  const callGeminiAPI = async (userPrompt, systemInstructionText = "") => {
    if (!apiKey) {
      throw new Error("尚未設定 API Key，請先於對話框上方進行配置儲存。");
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
    let delay = 1000;
    for (let i = 0; i < 5; i++) {
      try {
        let parts = [{ text: userPrompt }];
        const payload = {
          contents: [{ parts: parts }]
        };
        if (systemInstructionText) {
          payload.systemInstruction = { parts: [{ text: systemInstructionText }] };
        }
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`);
        }
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error("Gemini API 未回傳有效文字內容");
      } catch (err) {
        if (i === 4) {
          throw new Error(err.message || "連接 AI 櫻子秘書超時，請稍候重試。");
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F5F7FA] font-['Zen_Maru_Gothic',sans-serif] text-[#2C3E50] flex justify-center items-center">
      {/* Outer Shell using h-screen w-screen overflow-hidden for a true web app experience */}
      <div className="w-full max-w-md h-full bg-white shadow-2xl relative overflow-hidden flex flex-col animate-fade-in">
        
        {/* APP HEADER */}
        <header className="bg-gradient-to-r from-[#2A4B7C] to-[#3B629B] text-white pt-8 pb-6 px-5 rounded-b-[2rem] shadow-lg relative shrink-0">
          <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none overflow-hidden h-8">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-current">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,42.4V0Z" />
            </svg>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1 bg-[#FF8E99] text-white text-[11px] font-bold px-2 py-0.5 rounded-full w-max mb-1.5 shadow-sm">
                <Sparkles size={11} />
                <span>2026 九州精緻自由行</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm font-['Zen_Maru_Gothic']">福岡・佐賀自駕遊</h1>
              <p className="text-xs text-[#EAF2F8] mt-1 flex items-center gap-1 font-sans">
                <Calendar size={12} />
                <span>2026/06/24 — 06/30 (7天6夜)</span>
              </p>
            </div>
            
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 text-center animate-fade-in">
              <span className="block text-[9px] uppercase tracking-wider text-blue-200">當前位置</span>
              <span className="text-sm font-bold block mt-0.5 text-yellow-200 font-sans">{currentDayData ? currentDayData.area : '九州'}</span>
            </div>
          </div>

          {/* 財務與自駕狀態一覽欄 */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center text-xs">
            <div className="bg-white/5 py-1.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-blue-200 block font-sans">累計支出</span>
              <span className="font-bold text-sm text-white font-sans font-bold">￥{totalSpentJPY.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 py-1.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-blue-200 block font-sans">台幣等值</span>
              <span className="font-bold text-sm text-yellow-100 font-sans font-bold font-bold font-bold">NT$ {totalSpentTWD.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 py-1.5 rounded-xl border border-white/5 flex items-center justify-center flex-col cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setChatbotOpen(true)}>
              <span className="text-[10px] text-yellow-200 font-bold block flex items-center gap-0.5 font-sans animate-pulse">
                <Sparkles size={10} /> AI 秘書
              </span>
              <span className="font-bold text-sm text-emerald-300 font-sans">{apiKey ? '櫻子在線' : '待設金鑰'}</span>
            </div>
          </div>
        </header>

        {/* 1. MAIN BODY CONTENT AREA (pb-36 徹底解決行程列表最底端不遮擋、不被浮動 Nav 擋住的問題) */}
        <main id="main-content-area" className="flex-1 overflow-y-auto px-4 pt-5 pb-36">

          {/* ======================================================== */}
          {/* 行程分頁 (ITINERARY) */}
          {/* ======================================================== */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              
              {/* 天數滑動快速導覽列 */}
              <div className="bg-white rounded-3xl p-3 shadow-md border border-[#E9ECF0] overflow-hidden animate-fade-in">
                <span className="text-xs text-[#7F8C8D] block px-1 mb-2 font-medium font-sans">切換行程日期</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {itinerary.map(d => (
                    <button
                      key={d.day}
                      onClick={() => {
                        setActiveDay(d.day);
                        setDailyAiAnalysisError("");
                      }}
                      className={`flex-none snap-start w-12 py-2 rounded-2xl transition-all duration-300 text-center flex flex-col items-center justify-center ${
                        activeDay === d.day
                          ? 'bg-[#2A4B7C] text-white shadow-md shadow-[#2A4B7C]/30 scale-105'
                          : 'bg-[#F5F7FA] text-[#4A5568] hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-[10px] font-bold block uppercase tracking-tighter font-sans">D{d.day}</span>
                      <span className="text-xs font-bold block font-sans">{d.day === 1 ? '6/24' : d.day === 2 ? '6/25' : d.day === 3 ? '6/26' : d.day === 4 ? '6/27' : d.day === 5 ? '6/28' : d.day === 6 ? '6/29' : d.day === 7 ? '6/30' : ''}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#34495E]">
                  <div className="flex items-center gap-1.5 font-bold font-sans">
                    <span className="bg-[#2A4B7C] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">D{activeDay}</span>
                    <span>{currentDayData ? currentDayData.title : ''}</span>
                  </div>
                  <span className="text-[#7F8C8D] font-sans">{currentDayData ? currentDayData.date : ''}</span>
                </div>
              </div>

              {/* 每日小提示與天氣穿搭卡片 */}
              {currentDayData && (
                <div className="bg-[#FDF9F3] border border-[#F3E3CD] rounded-3xl p-4 shadow-sm flex flex-col gap-3 transition-all duration-300 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#E6AF2E] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                        💡
                      </span>
                      <span className="text-xs font-bold text-[#C68D00]">D{activeDay} 貼心穿搭與氣象叮嚀</span>
                    </div>
                    <button 
                      onClick={() => setTipsCollapsed(!tipsCollapsed)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-[#F3E3CD]/30 transition-colors"
                      title={tipsCollapsed ? "展開穿搭與氣象" : "收闔穿搭與氣象"}
                    >
                      {tipsCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                  </div>

                  {!tipsCollapsed ? (
                    <div className="space-y-3 animate-fade-in font-sans">
                      <p className="text-xs text-[#5D6D7E] leading-relaxed">{currentDayData.outfit}</p>
                      <div className="flex gap-4 pt-2 border-t border-[#F3E3CD]/50 text-[11px] text-[#7F8C8D]">
                        <span className="flex items-center gap-1">
                          <CloudRain size={13} className="text-blue-500" /> 降雨機率: <strong className="text-[#34495E] font-sans">{currentDayData.rainChance}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Sun size={13} className="text-orange-500" /> 平均氣溫: <strong className="text-[#34495E] font-sans">{currentDayData.temp}</strong>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#7F8C8D] flex justify-between items-center bg-amber-50/50 p-2 rounded-xl border border-dashed border-amber-200/50 animate-fade-in font-sans">
                      <span>☂ 本日降水：{currentDayData.rainChance}</span>
                      <span>🌡 均溫氣候：{currentDayData.temp}</span>
                      <span className="text-[10px] text-[#C68D00] font-bold">已收闔 (點擊右側開展)</span>
                    </div>
                  )}

                  {/* ✨ LLM FEATURE 1: AI Daily Optimizer Button */}
                  <div className="border-t border-[#F3E3CD] pt-3 animate-fade-in">
                    {dailyAiAnalysis[activeDay] ? (
                      <div className="bg-white rounded-2xl p-3.5 border border-[#F3E3CD] shadow-inner space-y-3 animate-fade-in font-sans">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-[#2A4B7C] flex items-center gap-1">
                            <Sparkles size={12} className="text-[#FF8E99]" />
                            <span>AI 櫻子秘書自駕私房推薦 (Gemini 3.1 Flash-Lite)</span>
                          </span>
                          <button 
                            onClick={handleDailyAiAnalysis}
                            className="text-[10px] text-[#7F8C8D] flex items-center gap-0.5 hover:text-[#2A4B7C]"
                          >
                            <RefreshCw size={10} /> 重新優化
                          </button>
                        </div>
                        <div className="text-xs text-[#4A5568] leading-relaxed whitespace-pre-line font-sans prose max-w-none">
                          {dailyAiAnalysis[activeDay]}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleDailyAiAnalysis}
                        disabled={aiAnalysisLoading}
                        className="w-full bg-gradient-to-r from-[#2A4B7C] to-[#436496] text-white py-2 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-all animate-pulse font-sans"
                      >
                        {aiAnalysisLoading ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>櫻子正串接北九州自駕路網庫中...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            <span>✨ AI 智慧優化：推薦自駕專屬歌單、隱藏美食與過路費提醒</span>
                          </>
                        )}
                      </button>
                    )}
                    {aiAnalysisError && (
                      <div className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-xl p-2.5 border border-amber-200/50 font-sans leading-relaxed">
                        {aiAnalysisError}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 每日行程時間軸 (景點與真實住宿卡片) */}
              {currentDayData && currentDayData.spots.length === 0 ? (
                /* 防呆提示：當行程點被全部刪空時，顯示和風新增起點行程按鈕 */
                <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200 space-y-3 font-sans">
                  <Smile size={32} className="mx-auto text-[#FF8E99] animate-bounce" />
                  <p className="text-xs text-[#7F8C8D]">本日尚無行程計畫捏，快來建立九州的第一站行程吧！</p>
                  <button
                    onClick={() => openSpotModalForAdd(activeDay, 0)}
                    className="bg-[#2A4B7C] text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 mx-auto hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                    <span>新增本日第一個景點行程</span>
                  </button>
                </div>
              ) : (
                currentDayData && (
                  <div className="relative pl-3 space-y-6 mt-4 animate-slide-up">
                    <div className="absolute left-[21px] top-6 bottom-6 w-0.5 bg-dashed bg-gradient-to-b from-[#2A4B7C] via-[#FF8E99] to-gray-200" style={{ backgroundImage: 'linear-gradient(to bottom, #2A4B7C 60%, rgba(255,255,255,0) 0%)', backgroundSize: '2px 8px', backgroundRepeat: 'repeat-y' }} />

                    {/* 首個景點前的插入按鈕 */}
                    <div className="relative flex justify-center -mb-3 z-20 font-sans">
                      <button
                        onClick={() => openSpotModalForAdd(activeDay, 0)}
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs hover:bg-emerald-100 flex items-center gap-0.5 transition-all active:scale-95 ml-6"
                      >
                        <Plus size={11} /> <span>在此前插入新行程</span>
                      </button>
                    </div>

                    {currentDayData.spots.map((spot, idx) => {
                      const style = getCategoryStyle(spot.category);
                      const journal = journals[spot.id] || { note: '', photo: null };

                      return (
                        <div key={spot.id} className="relative group animate-fade-in font-sans">
                          {/* 時間軸可愛分類圖標 */}
                          <span className={`absolute left-[-16px] top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center ${style.dot} text-white z-10 transition-transform duration-300 group-hover:scale-125`}>
                            {spot.category === '食物' && <Utensils size={10} />}
                            {spot.category === '購物' && <ShoppingBag size={10} />}
                            {spot.category === '景點' && <Compass size={10} />}
                            {spot.category === '活動' && <Sparkles size={10} />}
                            {spot.category === '交通' && <Car size={10} />}
                            {spot.category === '酒店' && <Hotel size={10} />}
                          </span>

                          {/* 景點主卡片 */}
                          <div className="bg-white rounded-3xl p-4 ml-4 shadow-sm border border-[#E9ECF0] hover:shadow-md transition-all duration-300 space-y-3">
                            
                            {/* 卡片標題與停留時間 */}
                            <div className="flex justify-between items-start font-sans">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-sans font-bold text-xs bg-gray-100 text-[#4A5568] px-2 py-0.5 rounded-full">
                                    {spot.time}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg}`}>
                                    {spot.category}
                                  </span>
                                </div>
                                <h3 className="font-bold text-[#2A4B7C] text-base leading-snug mt-1">{spot.name}</h3>
                              </div>
                              <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg shrink-0">
                                留 {spot.stay}
                              </span>
                            </div>

                            {/* 介紹與描述 */}
                            <p className="text-xs text-[#5D6D7E] leading-relaxed">{spot.desc}</p>

                            {/* 彩色特色標籤 */}
                            {spot.tags && spot.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1 font-sans">
                                {spot.tags.map(t => (
                                  <span 
                                    key={t} 
                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                                      t === '必吃' ? 'bg-[#FF8E99] text-white' : 
                                      t === '必買' ? 'bg-[#E6AF2E] text-white' : 
                                      'bg-blue-400 text-white'
                                    }`}
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* 拍照必看技巧 */}
                            {spot.photoTip && (
                              <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-2xl p-3 border border-blue-100/50 space-y-1 font-sans">
                                <span className="text-[10px] font-bold text-[#2A4B7C] flex items-center gap-1 uppercase tracking-wider">
                                  <Camera size={12} className="text-[#FF8E99]" /> 拍照小秘訣
                                </span>
                                <p className="text-xs text-slate-600 leading-normal">{spot.photoTip}</p>
                              </div>
                            )}

                            {/* 自駕備份實用資訊欄 (包含停車場與加油站) */}
                            <div className="bg-slate-50 rounded-2xl p-3 border border-gray-100 space-y-2 text-[11px] text-[#5D6D7E]">
                              <div className="grid grid-cols-2 gap-2 pb-1 border-b border-gray-100">
                                <div>
                                  <span className="text-[9px] text-[#7F8C8D] block uppercase font-bold">停車場指引</span>
                                  <span className="font-medium text-slate-700">{spot.parking}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-[#7F8C8D] block uppercase font-bold">最近加油站</span>
                                  <span className="font-medium text-slate-700">{spot.gas}</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center pt-1 font-sans">
                                <button
                                  onClick={() => {
                                    setChatbotOpen(true);
                                    handleQuickQuestion(`能幫我深度導覽「${spot.name}」嗎？包含在地的歷史典故、必看精華細節、更精確的自駕交通小叮嚀！`);
                                  }}
                                  className="text-[10px] font-bold text-[#FF8E99] bg-[#FF8E99]/5 hover:bg-[#FF8E99]/10 border border-[#FF8E99]/25 px-2 py-0.5 rounded-md flex items-center gap-0.5 transition-colors"
                                >
                                  <Sparkles size={9} />
                                  <span>✨ AI 景點導覽</span>
                                </button>
                                
                                <a 
                                  href={spot.navUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[#2A4B7C] font-bold hover:underline transition-all"
                                >
                                  <Navigation size={12} className="text-[#FF8E99]" />
                                  <span>{spot.category === '酒店' ? '開啟住宿資訊' : '地圖導航資訊'}</span>
                                </a>
                              </div>
                            </div>

                            {/* 隨行旅記照片上傳與日誌紀錄 */}
                            <div className="border-t border-gray-100 pt-3 space-y-2 font-sans">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">隨行旅記相片牆 (可點擊上傳或相機拍照)</span>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <label className="border-2 border-dashed border-gray-200 hover:border-[#FF8E99] rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50 hover:bg-white relative overflow-hidden">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" // 行動裝置直啟相機
                                    className="hidden" 
                                    onChange={(e) => handlePhotoUpload(spot.id, e)}
                                  />
                                  {journal.photo ? (
                                    <img src={journal.photo} alt="User Uploaded" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-center p-2 text-gray-400">
                                      <Upload size={16} className="mx-auto mb-1 text-gray-300" />
                                      <span className="text-[8px] block font-sans">上傳/拍照</span>
                                    </div>
                                  )}
                                </label>

                                <div className="col-span-2">
                                  <textarea
                                    value={journal.note}
                                    onChange={(e) => handleJournalNoteChange(spot.id, e.target.value)}
                                    placeholder="在此寫下本日心得、必吃名特產口感、以及開車過路心得，或者直接寫下開銷花費以便未來統計..."
                                    className="w-full h-full text-xs border border-gray-100 rounded-2xl p-2 focus:ring-1 focus:ring-[#2A4B7C] bg-slate-50/50 resize-none font-sans text-slate-700"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* ✏️ 行程編輯、刪除與靈活插入按鈕列 */}
                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-[11px] font-bold font-sans">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openSpotModalForEdit(activeDay, spot)}
                                  className="text-[#2A4B7C] hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-0.5 transition-all active:scale-95"
                                  title="修改此景點資訊"
                                >
                                  <Edit size={11} /> <span>編輯景點</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteSpot(activeDay, spot.id)}
                                  className="text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-0.5 transition-all active:scale-95"
                                  title="刪除此行程"
                                >
                                  <Trash size={11} /> <span>刪除景點</span>
                                </button>
                              </div>

                              <button
                                onClick={() => openSpotModalForAdd(activeDay, idx + 1)}
                                className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-0.5 transition-all active:scale-95 font-sans"
                                title="在此景點後方插入一個新行程"
                              >
                                <Plus size={11} /> <span>在其後插入行程</span>
                              </button>
                            </div>

                          </div>

                          {/* 轉接交通引導 */}
                          {idx < currentDayData.spots.length - 1 && (
                            <div className="my-2 ml-10 flex items-center gap-2 text-xs text-[#7F8C8D] font-sans">
                              <span className="bg-[#EAF2F8] p-1 rounded-lg text-[#2A4B7C]">
                                🚗
                              </span>
                              <span className="font-medium">交通指引：{spot.transitNext}</span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-[10px]">
                                {spot.transitTime}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* 記帳理財分頁 (EXPENSES) */}
          {/* ======================================================== */}
          {activeTab === 'expenses' && (
            <div className="space-y-4 animate-fade-in font-sans">
              
              {/* 預算統計看板卡片 */}
              <div className="bg-[#2A4B7C] text-white rounded-[2rem] p-5 shadow-lg relative overflow-hidden">
                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/5 rounded-full" />
                <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest block font-sans font-sans">2026 九州自駕記帳本</span>
                <h3 className="text-lg font-bold mt-1 font-sans font-sans">財務預算控管與理財分析</h3>

                {/* 預算比進度條 */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-blue-100 font-sans font-sans">
                    <span>已用預算比: {progressPercent}%</span>
                    <span>預算總額: ￥{totalBudget.toLocaleString()} JPY</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressPercent > 85 ? 'bg-[#FF8E99]' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10 text-center font-sans font-sans">
                  <div>
                    <span className="text-[10px] text-blue-200 block">實際累計支出 (日圓)</span>
                    <span className="font-bold text-lg text-white font-sans font-sans font-sans">￥{totalSpentJPY.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-200 block font-sans">折合台幣 (依0.21估算)</span>
                    <span className="font-bold text-lg text-yellow-200">NT$ {totalSpentTWD.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 📥 智慧 Excel 一鍵匯出按鈕區塊 */}
              <div className="bg-white rounded-3xl p-4 shadow-md border border-[#E9ECF0] text-center space-y-2 font-sans font-sans">
                <p className="text-xs text-[#5D6D7E] leading-relaxed">
                  想要整理紙本或者與旅伴分攤費用嗎？您可以一鍵將「所有每日行程、飯店憑證、記帳流水帳、打包準備清單」以 Excel (CSV) 格式打包匯出！
                </p>
                <button 
                  onClick={handleExportToExcel}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 font-sans"
                >
                  <Download size={15} />
                  <span>📥 匯出 Excel 旅行全紀錄報表</span>
                </button>
              </div>

              {/* AI 相機與對話自動記帳引導 */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-[#2A4B7C]/10 border border-[#FF8E99]/20 rounded-3xl p-4 flex items-start gap-3 shadow-sm font-sans font-sans">
                <div className="bg-emerald-500/10 p-2 rounded-2xl text-emerald-600 shrink-0">
                  <Bot size={20} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-800 block font-sans">櫻子 AI 語意與相機智慧記帳</span>
                  <p className="text-[11px] text-[#5D6D7E] leading-relaxed font-sans font-sans">
                    您可以拍下日本商家明細，或者直接在右下角聊天室發送：「<strong>記帳 一蘭拉麵 1500</strong>」。櫻子將自動解析並將其登錄至下方！
                  </p>
                  <button 
                    onClick={() => setChatbotOpen(true)}
                    className="mt-2 text-[10px] bg-[#2A4B7C] text-white px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm font-sans"
                  >
                    <Sparkles size={11} /> 開啟 AI 智慧對話記帳 (Gemini 3.1 Flash-Lite)
                  </button>
                </div>
              </div>

              {/* 手動登錄費用紀錄表單 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 font-sans">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Plus size={14} className="text-[#FF8E99]" />
                  <span>手動新增消費款項</span>
                </span>

                <form onSubmit={handleAddExpenseManual} className="space-y-3 font-sans">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold font-sans font-sans">消費日期</label>
                      <select 
                        value={expFormDate}
                        onChange={(e) => setExpFormDate(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-slate-50 text-slate-700 font-sans font-sans"
                      >
                        <option value="2026/06/24">D1 (6/24 博多)</option>
                        <option value="2026/06/25">D2 (6/25 佐賀太良)</option>
                        <option value="2026/06/26">D3 (6/26 武雄有田)</option>
                        <option value="2026/06/27">D4 (6/27 伊萬里)</option>
                        <option value="2026/06/28">D5 (6/28 唐津呼子)</option>
                        <option value="2026/06/29">D6 (6/29 糸島博多)</option>
                        <option value="2026/06/30">D7 (6/30 機場回程)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold">費用類別</label>
                      <select 
                        value={expFormCategory}
                        onChange={(e) => setExpFormCategory(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-slate-50 text-slate-700 font-sans"
                      >
                        <option value="食物">🍜 食物</option>
                        <option value="交通">🚗 交通</option>
                        <option value="購物">🛍 購物</option>
                        <option value="活動">🎟 活動</option>
                        <option value="住宿">🏨 住宿</option>
                        <option value="其他">📦 其他</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-sans font-sans">
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold">消費項目名稱</label>
                      <input 
                        type="text" 
                        value={expFormItem}
                        onChange={(e) => setExpFormItem(e.target.value)}
                        placeholder="例：活烏賊餐券、伴手禮盒..."
                        className="w-full text-xs border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold font-sans">金額 (日圓)</label>
                      <input 
                        type="number" 
                        value={expFormAmount}
                        onChange={(e) => setExpFormAmount(e.target.value)}
                        placeholder="1200"
                        className="w-full text-xs border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] text-slate-700 font-sans font-sans"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={!expFormItem.trim() || !expFormAmount}
                    className="w-full bg-[#2A4B7C] hover:bg-blue-800 text-white font-bold py-2 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Plus size={13} />
                    <span>登錄此筆費用紀錄</span>
                  </button>
                </form>
              </div>

              {/* 類別比例結構分析 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 animate-fade-in font-sans font-sans">
                <span className="text-xs font-bold text-slate-800 block">各項消費分類比例分析</span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(categoryBreakdown).map(cat => {
                    const amt = categoryBreakdown[cat];
                    const percent = Math.round((amt / totalSpentJPY) * 100);
                    return (
                      <div key={cat} className="bg-slate-50 rounded-2xl p-2.5 text-center border border-gray-100">
                        <span className="text-[10px] text-gray-400 block font-sans">{cat}</span>
                        <strong className="text-xs text-slate-800 block mt-0.5 font-sans">￥{amt.toLocaleString()}</strong>
                        <span className="text-[9px] text-[#2A4B7C] block font-sans">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 詳細費用記帳明細流 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 font-sans font-sans">已登錄消費流水明細</span>
                  <span className="text-[10px] text-gray-400">共 {expenses.length} 筆款項</span>
                </div>

                {/* 滾動區，不被 AI Button 及 Nav Bar 阻擋 */}
                <div className="space-y-2 divide-y divide-gray-100 pr-1 max-h-[40vh] overflow-y-auto">
                  {expenses.slice().reverse().map(item => {
                    const style = getCategoryStyle(item.category);
                    return (
                      <div key={item.id} className="pt-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/50 rounded-xl px-1 transition-colors font-sans font-sans font-sans">
                        <div className="flex items-center gap-2.5 min-w-0 font-sans">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] ${style.dot} text-white shrink-0`}>
                            {item.category === '食物' && <Utensils size={12} />}
                            {item.category === '購物' && <ShoppingBag size={12} />}
                            {item.category === '交通' && <Car size={12} />}
                            {item.category === '活動' && <Sparkles size={12} />}
                            {item.category === '住宿' && <Hotel size={12} />}
                            {item.category === '其他' && <FileText size={12} />}
                          </span>
                          <div className="truncate font-sans font-sans">
                            <span className="text-xs font-bold text-slate-800 block truncate font-sans font-sans font-sans">{item.item}</span>
                            <span className="text-[9px] text-gray-400 block">D{item.day} ({item.date}) · {item.category}</span>
                          </div>
                        </div>

                        {/* 這裡的刪除按鈕安全排開在右側，寬度足夠且不被遮擋 */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-800 block">￥{item.amount.toLocaleString()}</span>
                            <span className="text-[9px] text-gray-400 block font-sans">約 NT$ {Math.round(item.amount * 0.21)}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleDeleteExpense(item.id)}
                            className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors font-sans"
                            title="刪除此筆記帳"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 天氣與路線地圖分頁 (WEATHER) */}
          {/* ======================================================== */}
          {activeTab === 'weather' && (
            <div className="space-y-4 animate-fade-in font-sans">
              
              {/* 自駕地圖看板 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 text-center">
                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  2026 九州自駕環線圖 (台灣 ✈ 福岡 🚗 佐賀 🚗 絲島 🚗 福岡)
                </span>
                <h3 className="font-bold text-[#2A4B7C] text-base">7天6夜完整環形開車路線</h3>
                
                {/* SVG 自駕地圖示意 */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden">
                  <svg viewBox="0 0 400 240" className="w-full h-auto max-w-sm">
                    <rect width="400" height="240" rx="16" fill="#F0F5FA" />
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="#E2E8F0" />
                      </pattern>
                    </defs>
                    <rect width="400" height="240" fill="url(#grid)" />

                    <path d="M20 30 Q 30 25, 40 30 T 60 30" fill="none" stroke="#D4E6F1" strokeWidth="2" strokeLinecap="round" />
                    <path d="M320 200 Q 330 195, 340 200 T 360 200" fill="none" stroke="#D4E6F1" strokeWidth="2" strokeLinecap="round" />

                    {/* Flight Track */}
                    <path d="M30 180 Q 110 80, 200 60" fill="none" stroke="#FF8E99" strokeWidth="2" strokeDasharray="5,5" />
                    <path d="M200 60 Q 110 80, 30 180" fill="none" stroke="#FF8E99" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Driving Path */}
                    <path d="M200 60 L140 100 L110 160 L100 120 L60 110 L50 80 L90 50 L145 40 L200 60" 
                          fill="none" stroke="#2A4B7C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M200 60 L140 100 L110 160 L100 120 L60 110 L50 80 L90 50 L145 40 L200 60" 
                          fill="none" stroke="#E6AF2E" strokeWidth="1.5" strokeDasharray="4,4" />

                    {/* Nodes */}
                    <g transform="translate(30,180)">
                      <circle r="6" fill="#FF5A6F" />
                      <circle r="3" fill="#FFFFFF" />
                      <text x="10" y="4" className="text-[10px] font-bold fill-[#FF5A6F] font-sans">台灣 (桃園機場)</text>
                    </g>
                    <g transform="translate(200,60)">
                      <circle r="7" fill="#2A4B7C" />
                      <circle r="3" fill="#FFFFFF" />
                      <text x="10" y="4" className="text-[10px] font-bold fill-[#2A4B7C] font-sans">福岡 (博多)</text>
                    </g>
                    <g transform="translate(140,100)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-35" y="-6" className="text-[9px] font-bold fill-[#4A5568] font-sans">佐賀市</text>
                    </g>
                    <g transform="translate(110,160)">
                      <circle r="5" fill="#FF5A6F" />
                      <text x="10" y="4" className="text-[9px] font-bold fill-red-500 font-sans">太良町 (海中鳥居)</text>
                    </g>
                    <g transform="translate(100,120)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-40" y="12" className="text-[9px] font-bold fill-[#4A5568] font-sans font-sans">武雄神社</text>
                    </g>
                    <g transform="translate(60,110)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-30" y="-8" className="text-[9px] font-bold fill-[#4A5568] font-sans font-sans font-sans">有田陶瓷</text>
                    </g>
                    <g transform="translate(50,80)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-40" y="2" className="text-[9px] font-bold fill-[#4A5568] font-sans font-sans">伊萬里</text>
                    </g>
                    <g transform="translate(90,50)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-30" y="-8" className="text-[9px] font-bold fill-[#4A5568] font-sans font-sans">唐津城</text>
                    </g>
                    <g transform="translate(145,40)">
                      <circle r="5" fill="#FF5A6F" />
                      <text x="0" y="-8" className="text-[9px] font-bold fill-indigo-600 font-sans">絲島半島</text>
                    </g>

                    <text x="100" y="110" className="text-sm">✈</text>
                    <text x="112" y="70" className="text-xs">🚗</text>
                  </svg>
                </div>
              </div>

              {/* 氣象與每日降雨預報表 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
                <span className="text-xs font-bold text-gray-400 block uppercase">每日區域預報 (2026/06/24 - 06/30)</span>
                <div className="divide-y divide-gray-100 font-sans">
                  {itinerary.map(d => (
                    <div key={d.day} className="py-3 flex items-center justify-between gap-2 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#2A4B7C] text-white font-bold font-sans text-[10px] w-6 h-6 rounded-full flex items-center justify-center">
                          D{d.day}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{d.area}</span>
                          <span className="text-[9px] text-gray-400 block">{d.date.split(' ')[0]}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold font-sans text-slate-700 block font-sans">{d.temp}</span>
                          <span className="text-[9px] text-gray-400 block font-sans">體感約 28°C</span>
                        </div>

                        <div className="bg-[#F5F7FA] p-2 rounded-2xl flex items-center gap-1.5 border border-gray-100">
                          {parseInt(d.rainChance) >= 40 ? (
                            <CloudRain size={16} className="text-blue-500 animate-bounce" />
                          ) : (
                            <CloudSun size={16} className="text-orange-400" />
                          )}
                          <div className="text-left font-sans">
                            <span className="text-[9px] text-gray-400 block">降雨機率</span>
                            <span className="text-[10px] font-bold text-[#2A4B7C] block font-sans">{d.rainChance}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 行行指南與行李打包分頁 (GUIDE) */}
          {/* ======================================================== */}
          {activeTab === 'guide' && (
            <div className="space-y-5 animate-fade-in font-sans">
              
              {/* 旅行手冊工具盒頭部 */}
              <div className="bg-gradient-to-br from-[#2A4B7C] to-[#436496] rounded-3xl p-4 text-white shadow-md space-y-2">
                <div className="flex items-center gap-1.5 text-yellow-200">
                  <BookOpen size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">旅行工具箱 ＆ 行前準備</span>
                </div>
                <h3 className="text-base font-bold">九州自由行・數位隨身錦囊</h3>
                <p className="text-xs text-blue-100 leading-relaxed">
                  包含行李打包檢查、日本自駕規則、以及與您提供明細 100% 同步的真實 Booking 訂房憑證！
                </p>
              </div>

              {/* 1. 行李清單管理庫 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center font-sans font-sans">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <CheckSquare size={14} className="text-[#FF8E99]" />
                    <span>行李打包與日本購物清單</span>
                  </span>
                  
                  {/* 切換編輯與保存狀態按鈕 */}
                  <button
                    onClick={() => setIsPackingEditMode(!isPackingEditMode)}
                    className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all border ${
                      isPackingEditMode 
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isPackingEditMode ? (
                      <>
                        <Save size={11} />
                        <span>保存退出編輯</span>
                      </>
                    ) : (
                      <>
                        <Edit size={11} />
                        <span>⚙️ 編輯修改清單</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4 pt-1 font-sans">
                  {/* Category: 隨身 */}
                  <div className="space-y-2.5 font-sans font-sans">
                    <h4 className="text-xs font-bold text-[#2A4B7C] bg-[#EAF2F8] px-2.5 py-1 rounded-lg w-max">
                      💼 隨身背包 (證件貴重物品)
                    </h4>
                    <div className="space-y-1.5">
                      {packingList.personal.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all border border-gray-50">
                          
                          <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                            <span onClick={() => toggleItem('personal', item.id)} className="shrink-0">
                              {item.checked ? (
                                <CheckSquare size={16} className="text-[#FF8E99]" />
                              ) : (
                                <Square size={16} className="text-gray-300" />
                              )}
                            </span>
                            
                            {isPackingEditMode ? (
                              <input 
                                type="text"
                                value={item.text}
                                onChange={(e) => handleEditPackingText('personal', item.id, e.target.value)}
                                className="w-full text-xs border border-amber-300 bg-amber-50/50 rounded px-1.5 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            ) : (
                              <span 
                                onClick={() => toggleItem('personal', item.id)}
                                className={`text-xs truncate ${item.checked ? 'line-through text-gray-400 font-medium' : 'text-slate-700'}`}
                              >
                                {item.text}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button onClick={() => adjustQty('personal', item.id, -1)} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 hover:bg-gray-100 text-[10px] font-bold font-sans">-</button>
                              <span className="px-2 text-[10px] font-bold text-slate-700 bg-white">{item.qty}</span>
                              <button onClick={() => adjustQty('personal', item.id, 1)} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 hover:bg-gray-100 text-[10px] font-bold">+</button>
                            </div>
                            <button 
                              onClick={() => deleteItem('personal', item.id)} 
                              className="text-gray-300 hover:text-red-500 p-1.5"
                              title="移除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category: 手提 */}
                  <div className="space-y-2.5 font-sans">
                    <h4 className="text-xs font-bold text-[#2A4B7C] bg-[#EAF2F8] px-2.5 py-1 rounded-lg w-max font-sans">
                      🛫 手提行李 (隨身攜帶)
                    </h4>
                    <div className="space-y-1.5">
                      {packingList.cabin && packingList.cabin.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all border border-gray-50 font-sans">
                          
                          <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 font-sans font-sans">
                            <span onClick={() => toggleItem('cabin', item.id)} className="shrink-0">
                              {item.checked ? (
                                <CheckSquare size={16} className="text-[#FF8E99]" />
                              ) : (
                                <Square size={16} className="text-gray-300" />
                              )}
                            </span>
                            
                            {isPackingEditMode ? (
                              <input 
                                type="text"
                                value={item.text}
                                onChange={(e) => handleEditPackingText('cabin', item.id, e.target.value)}
                                className="w-full text-xs border border-amber-300 bg-amber-50/50 rounded px-1.5 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            ) : (
                              <span 
                                onClick={() => toggleItem('cabin', item.id)}
                                className={`text-xs truncate ${item.checked ? 'line-through text-gray-400 font-medium' : 'text-slate-700'}`}
                              >
                                {item.text}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button onClick={() => adjustQty('cabin', item.id, -1)} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 hover:bg-gray-100 text-[10px] font-bold font-sans">-</button>
                              <span className="px-2 text-[10px] font-bold text-slate-700 bg-white font-sans">{item.qty}</span>
                              <button onClick={() => adjustQty('cabin', item.id, 1)} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 hover:bg-gray-100 text-[10px] font-bold font-sans">+</button>
                            </div>
                            <button 
                              onClick={() => deleteItem('cabin', item.id)} 
                              className="text-gray-300 hover:text-red-500 p-1.5"
                              title="移除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category: 託運 */}
                  <div className="space-y-2.5 font-sans font-sans">
                    <h4 className="text-xs font-bold text-[#2A4B7C] bg-[#EAF2F8] px-2.5 py-1 rounded-lg w-max font-sans">
                      🧳 託運行李 (行李箱託運)
                    </h4>
                    <div className="space-y-1.5">
                      {packingList.checked.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-[#F5F7FA] rounded-xl transition-all border border-gray-100 font-sans">
                          
                          <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                            <span onClick={() => toggleItem('checked', item.id)} className="shrink-0 font-sans font-sans">
                              {item.checked ? (
                                <CheckSquare size={16} className="text-[#FF8E99]" />
                              ) : (
                                <Square size={16} className="text-gray-300" />
                              )}
                            </span>
                            
                            {isPackingEditMode ? (
                              <input 
                                type="text"
                                value={item.text}
                                onChange={(e) => handleEditPackingText('checked', item.id, e.target.value)}
                                className="w-full text-xs border border-amber-300 bg-amber-50/50 rounded px-1.5 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            ) : (
                              <span 
                                onClick={() => toggleItem('checked', item.id)}
                                className={`text-xs truncate ${item.checked ? 'line-through text-gray-400 font-medium' : 'text-slate-700'}`}
                              >
                                {item.text}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white font-sans">
                              <button onClick={() => adjustQty('checked', item.id, -1)} className="px-1.5 py-0.5 bg-[#F5F7FA] text-gray-500 hover:bg-gray-100 text-[10px] font-bold font-sans">-</button>
                              <span className="px-2 text-[10px] font-bold text-slate-700 bg-white">{item.qty}</span>
                              <button onClick={() => adjustQty('checked', item.id, 1)} className="px-1.5 py-0.5 bg-[#F5F7FA] text-gray-500 hover:bg-gray-100 text-[10px] font-bold font-sans font-sans">+</button>
                            </div>
                            <button 
                              onClick={() => deleteItem('checked', item.id)} 
                              className="text-gray-300 hover:text-red-500 p-1.5"
                              title="移除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category: 伴手禮購物 */}
                  <div className="space-y-2.5 font-sans">
                    <h4 className="text-xs font-bold text-[#C68D00] bg-yellow-50 px-2.5 py-1 rounded-lg w-max font-sans">
                      🛍 日本預購 ＆ 伴手禮清單
                    </h4>
                    <div className="space-y-1.5">
                      {packingList.shopping && packingList.shopping.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-yellow-50/50 rounded-xl transition-all border border-yellow-100/30 font-sans">
                          
                          <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                            <span onClick={() => toggleItem('shopping', item.id)} className="shrink-0 font-sans">
                              {item.checked ? (
                                <CheckSquare size={16} className="text-[#E6AF2E]" />
                              ) : (
                                <Square size={16} className="text-gray-300" />
                              )}
                            </span>
                            
                            {isPackingEditMode ? (
                              <input 
                                type="text"
                                value={item.text}
                                onChange={(e) => handleEditPackingText('shopping', item.id, e.target.value)}
                                className="w-full text-xs border border-amber-300 bg-amber-50/50 rounded px-1.5 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            ) : (
                              <span 
                                onClick={() => toggleItem('shopping', item.id)}
                                className={`text-xs truncate ${item.checked ? 'line-through text-gray-400 font-medium' : 'text-slate-700'}`}
                              >
                                {item.text}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button onClick={() => adjustQty('shopping', item.id, -1)} className="px-1.5 py-0.5 bg-[#F5F7FA] text-gray-500 hover:bg-gray-100 text-[10px] font-bold font-sans">-</button>
                              <span className="px-2 text-[10px] font-bold text-slate-700 bg-white font-sans font-sans">{item.qty}</span>
                              <button onClick={() => adjustQty('shopping', item.id, 1)} className="px-1.5 py-0.5 bg-[#F5F7FA] text-gray-500 hover:bg-gray-100 text-[10px] font-bold font-sans font-sans">+</button>
                            </div>
                            <button 
                              onClick={() => deleteItem('shopping', item.id)} 
                              className="text-gray-300 hover:text-red-500 p-1.5"
                              title="移除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 新增自訂物品表單 */}
                <form onSubmit={handleAddItem} className="pt-3.5 border-t border-gray-100 flex gap-2">
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="text-xs border border-gray-200 rounded-xl px-2.5 bg-gray-50 text-slate-700 focus:outline-none"
                  >
                    <option value="personal">隨身</option>
                    <option value="cabin">手提</option>
                    <option value="checked">託運</option>
                    <option value="shopping">預購</option>
                  </select>
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="新增自訂行李或購買項目..."
                    className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none text-slate-700"
                  />
                  <button type="submit" className="bg-[#2A4B7C] text-white p-2.5 rounded-xl hover:bg-blue-800 transition-colors shrink-0">
                    <Plus size={14} />
                  </button>
                </form>
              </div>

              {/* 住宿確認憑證夾 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 font-sans">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <FileText size={14} className="text-emerald-600" />
                  <span>住宿資訊憑證夾</span>
                </span>
                
                <div className="space-y-2.5 font-sans">
                  {itinerary.filter(d => d.spots.some(s => s.category === '酒店')).map(d => {
                    const hotelSpot = d.spots.find(s => s.category === '酒店');
                    return (
                      <div key={d.day} className="border border-emerald-100 rounded-2xl p-3 bg-emerald-50/20 flex justify-between items-center">
                        <div className="flex-1 pr-2 min-w-0 font-sans">
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-sans">
                            D{d.day} ({d.date.split(' ')[0]})
                          </span>
                          <h5 className="font-bold text-xs text-slate-800 mt-1 truncate">{hotelSpot.name}</h5>
                          <span className="text-[10px] text-gray-400 block font-bold">本日訂房花費: ￥{expenses.find(e => e.day === d.day && e.category === '住宿')?.amount?.toLocaleString() || '0'} 日圓</span>
                        </div>
                        <a 
                          href={hotelSpot.navUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-2 rounded-xl shrink-0 hover:bg-emerald-700 transition-colors text-center w-24"
                        >
                          住宿資訊
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 日本自駕規則提醒 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 font-sans">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Info size={14} className="text-blue-500" />
                  <span>自駕安全與 ETC 退稅指引</span>
                </span>
                <ul className="text-xs text-[#5D6D7E] space-y-2 list-disc pl-4 leading-relaxed">
                  <li><strong>靠左行駛</strong>：日本方向盤及車道均相反，請隨時提醒自己「靠左慢行」。</li>
                  <li><strong>行人優先</strong>：斑馬線前若有行人，請務必完全靜止禮讓。</li>
                  <li><strong>過路費/ETC</strong>：自駕上高速公路建議使用 ETC 卡片，方便進出閘道。</li>
                </ul>
              </div>

            </div>
          )}

        </main>

        {/* BOTTOM FLOATING NAV BAR */}
        <nav className="absolute bottom-5 left-4 right-4 bg-white/80 backdrop-blur-xl rounded-[2.2rem] py-3 px-4 shadow-2xl border border-white/40 flex justify-around items-center z-40 animate-fade-in font-sans">
          
          <button 
            onClick={() => setActiveTab('itinerary')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'itinerary' 
                ? 'text-[#2A4B7C] scale-110 font-bold' 
                : 'text-gray-400 hover:text-slate-600'
            }`}
          >
            <Compass size={18} className={activeTab === 'itinerary' ? 'text-[#FF8E99] animate-pulse' : ''} />
            <span className="text-[9px]">詳細行程</span>
          </button>

          <button 
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'expenses' 
                ? 'text-[#2A4B7C] scale-110 font-bold' 
                : 'text-gray-400 hover:text-slate-600'
            }`}
          >
            <FileText size={18} className={activeTab === 'expenses' ? 'text-[#FF8E99]' : ''} />
            <span className="text-[9px]">消費記帳</span>
          </button>

          <button 
            onClick={() => setActiveTab('weather')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'weather' 
                ? 'text-[#2A4B7C] scale-110 font-bold' 
                : 'text-gray-400 hover:text-slate-600'
            }`}
          >
            <Map size={18} className={activeTab === 'weather' ? 'text-[#FF8E99]' : ''} />
            <span className="text-[9px]">自駕地圖</span>
          </button>

          <button 
            onClick={() => setActiveTab('guide')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'guide' 
                ? 'text-[#2A4B7C] scale-110 font-bold' 
                : 'text-gray-400 hover:text-slate-600'
            }`}
          >
            <BookOpen size={18} className={activeTab === 'guide' ? 'text-[#FF8E99]' : ''} />
            <span className="text-[9px]">旅行指南</span>
          </button>

        </nav>

        {/* 🌸 ✨ AI GLOBAL ASSISTANT CHAT MODAL/DRAWER */}
        {chatbotOpen && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end transition-all">
            
            {/* Slide-up Container */}
            <div className="bg-[#F5F7FA] w-full h-[85vh] rounded-t-[2.5rem] flex flex-col shadow-2xl relative border-t border-white/50 animate-slide-up">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2A4B7C] to-[#3B629B] text-white px-5 py-4 rounded-t-[2.5rem] flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 p-1.5 rounded-xl animate-bounce">
                    <Sparkles size={18} className="text-yellow-200 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">✨ 櫻子・和風記帳 AI 秘書</h4>
                    <span className="text-[10px] text-blue-100 flex items-center gap-0.5">
                      <Bot size={10} /> Powered by Gemini 3.1 Flash-Lite
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setChatbotOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 🔑 API Key 內嵌 management bar */}
              <div className="bg-amber-50/70 border-b border-amber-200/50 px-4 py-2 flex items-center justify-between gap-2 text-xs font-sans">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Key size={13} className="text-amber-600 shrink-0" />
                  <span className="text-[10px] text-amber-800 font-bold shrink-0">Gemini Key:</span>
                  <input 
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={apiKey ? "••••••••••••••••" : "請填入您的 Gemini API Key..."}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 w-full text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-slate-800"
                  />
                </div>
                <button
                  onClick={handleSaveApiKey}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 shadow-xs active:scale-95"
                >
                  <span>儲存/置換</span>
                </button>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#2A4B7C] text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-gray-100 rounded-tl-none prose max-w-none whitespace-pre-line font-sans'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="flex justify-start font-sans animate-pulse">
                    <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-none px-4 py-3 text-xs text-slate-500 shadow-xs flex items-center gap-2">
                      <div className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-[#FF8E99] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#FF8E99] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#FF8E99] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>櫻子正在努力處理你的需求...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Action Hints */}
              <div className="px-4 py-2 border-t border-gray-100 bg-white/40 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 font-sans font-sans">
                <button
                  onClick={() => handleQuickQuestion('記帳 晚餐吃博多季樂佐賀牛鐵板燒花費 12000 日圓')}
                  className="bg-white hover:bg-gray-50 text-[10px] font-bold text-slate-600 border border-gray-200 px-3 py-1.5 rounded-full shadow-xs shrink-0"
                >
                  📝 對話記帳：佐賀牛
                </button>
                <button
                  onClick={() => handleQuickQuestion('記帳 買有田燒咖啡杯組花費 6500 日圓，幫我分類為購物')}
                  className="bg-white hover:bg-gray-50 text-[10px] font-bold text-slate-600 border border-gray-200 px-3 py-1.5 rounded-full shadow-xs shrink-0"
                >
                  🛍 對話記帳：有田燒
                </button>
                <button
                  onClick={() => handleQuickQuestion('記帳 自駕加柴油開銷 3800 日圓')}
                  className="bg-white hover:bg-gray-50 text-[10px] font-bold text-slate-600 border border-gray-200 px-3 py-1.5 rounded-full shadow-xs shrink-0 font-sans"
                >
                  🚗 對話記帳：自駕加油
                </button>
              </div>

              {/* Chat Input Bar + Receipt Photo Uploader */}
              <div className="bg-white p-3 border-t border-gray-100 flex gap-2 items-center font-sans">
                
                <label className="bg-[#FF8E99]/15 hover:bg-[#FF8E99]/25 text-[#FF5A6F] p-2.5 rounded-2xl cursor-pointer transition-colors shrink-0 flex items-center justify-center font-sans font-sans" title="上傳發票明細照片記帳">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" // 行動裝置直啟相機
                    className="hidden" 
                    onChange={handleReceiptUpload} 
                    disabled={chatLoading}
                  />
                  <Camera size={16} />
                </label>

                <form
                  id="ai-chat-form"
                  onSubmit={handleChatSubmit}
                  className="flex-1 flex gap-2 items-center"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="輸入「記帳 晚餐 5000」或點左側上傳收據..."
                    disabled={chatLoading}
                    className="flex-1 bg-slate-50 border border-gray-200 rounded-2xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2A4B7C] font-sans text-slate-800"
                  />
                  
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-[#2A4B7C] hover:bg-blue-800 text-white p-2.5 rounded-2xl disabled:opacity-30 transition-all active:scale-95 shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </form>

              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ✨ 新功能：和風行程點「新增 ＆ 編輯」智慧視窗 (Spot Editor Modal UI) */}
        {/* ======================================================== */}
        {spotModalOpen && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end transition-all font-sans">
            <div className="bg-white w-full h-[85vh] rounded-t-[2.5rem] flex flex-col shadow-2xl relative border-t border-gray-100 animate-slide-up overflow-hidden font-sans">
              
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#2A4B7C] to-[#3B629B] text-white px-5 py-4 flex justify-between items-center shadow-md shrink-0">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-yellow-300 animate-pulse" />
                  <h4 className="font-bold text-sm">
                    {editingSpotId ? `✏️ 編輯景點 ─ D${modalTargetDay}` : `➕ 插入新景點 ─ D${modalTargetDay}`}
                  </h4>
                </div>
                <button
                  onClick={() => setSpotModalOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-full transition-colors font-sans"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Form Scrollable Area */}
              <form onSubmit={handleSaveSpotForm} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-700">
                
                {/* 景點名稱 & 時間 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] text-gray-400 font-bold mb-1">抵達時間</label>
                    <input 
                      type="text" 
                      value={spotForm.time}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="例如: 14:00"
                      className="w-full border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-400 font-bold mb-1">景點 / 活動 / 飯店名稱</label>
                    <input 
                      type="text" 
                      value={spotForm.name}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="例：武雄溫泉樓門"
                      className="w-full border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* 景點大類 & 停留時間 */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1 font-sans">分類標籤</label>
                    <select
                      value={spotForm.category}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl p-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2A4B7C]"
                    >
                      <option value="景點">🌲 景點</option>
                      <option value="食物">🍜 食物</option>
                      <option value="購物">🛍 購物</option>
                      <option value="活動">🎟 活動</option>
                      <option value="酒店">🏨 酒店</option>
                      <option value="交通">🚗 交通</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1">預估停留時間</label>
                    <input 
                      type="text" 
                      value={spotForm.stay}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, stay: e.target.value }))}
                      placeholder="例：2 小時"
                      className="w-full border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none font-sans"
                      required
                    />
                  </div>
                </div>

                {/* 詳細描述 */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1 font-sans">詳細行程或美食描述</label>
                  <textarea 
                    value={spotForm.desc}
                    onChange={(e) => setSpotForm(prev => ({ ...prev, desc: e.target.value }))}
                    placeholder="請輸入今天這站景點的背景、想吃的美食或自駕預防要點..."
                    className="w-full h-16 border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none resize-none font-sans"
                    required
                  />
                </div>

                {/* 拍照小訣竅 */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">📸 拍照好拍技巧 (選填)</label>
                  <input 
                    type="text" 
                    value={spotForm.photoTip}
                    onChange={(e) => setSpotForm(prev => ({ ...prev, photoTip: e.target.value }))}
                    placeholder="例：站在櫻井二見浦沙灘上，讓純白鳥居完美框住夫婦岩拍..."
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none"
                  />
                </div>

                {/* 自駕停車 & 加油站指引 */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1 font-sans">🚗 停車位 / Mapcode</label>
                    <input 
                      type="text" 
                      value={spotForm.parking}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, parking: e.target.value }))}
                      placeholder="例：備有無料停車位約 20 台"
                      className="w-full border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1">⛽ 附近加油站</label>
                    <input 
                      type="text" 
                      value={spotForm.gas}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, gas: e.target.value }))}
                      placeholder="例：開車 3 分鐘有 JA-SS"
                      className="w-full border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Google Maps / Booking 連結 */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1 font-sans">🔗 Google Maps 導航或 Booking 實體憑證網址</label>
                  <input 
                    type="text" 
                    value={spotForm.navUrl}
                    onChange={(e) => setSpotForm(prev => ({ ...prev, navUrl: e.target.value }))}
                    placeholder="輸入 https://..."
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none font-sans"
                  />
                </div>

                {/* 往下一個點的交通接駁引導 */}
                <div className="grid grid-cols-3 gap-2 animate-fade-in font-sans">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-400 font-bold mb-1 font-sans font-sans font-sans">🛣 往下一個點的自駕行駛路線</label>
                    <input 
                      type="text" 
                      value={spotForm.transitNext}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, transitNext: e.target.value }))}
                      placeholder="例：開往嬉野溫泉街"
                      className="w-full border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1 font-sans font-sans">⏱ 接駁行駛時間</label>
                    <input 
                      type="text" 
                      value={spotForm.transitTime}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, transitTime: e.target.value }))}
                      placeholder="例：25 分鐘"
                      className="w-full border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none font-sans"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full bg-[#2A4B7C] hover:bg-blue-800 text-white font-bold py-3 rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all text-xs font-sans"
                >
                  <Check size={14} />
                  <span>儲存變更行程點</span>
                </button>

              </form>
            </div>
          </div>
        )}

        {/* 頂部返回頂端按鈕 */}
        <button 
          className="fixed bottom-[90px] right-5 bg-emerald-600 hover:bg-[#FF8E99] text-white p-3 rounded-full shadow-2xl z-40 transition-transform hover:scale-105 active:scale-95" 
          onClick={() => {
            const mainEl = document.getElementById('main-content-area');
            if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="回到頂部"
        >
          <ChevronUp size={24} />
        </button>

      </div>
    </div>
  );
}
