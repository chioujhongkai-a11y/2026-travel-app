import React, { useState, useEffect } from 'react';
import { 
  Calendar, Compass, Utensils, ShoppingBag, Navigation, Car, 
  CloudRain, Sun, CloudSun, CheckSquare, Square, Plus, Trash2, 
  Hotel, Map, Sparkles, BookOpen, Info, FileText, Check, 
  Smile, X, ChevronDown, ChevronUp, Download, Edit, Save, MapPin
} from 'lucide-react';

// 動態載入日系 Zen Maru Gothic 圓體與 Quicksand 英文字型
const injectFont = () => {
  if (typeof window !== 'undefined' && !document.getElementById('zen-maru-font')) {
    const link = document.createElement('link');
    link.id = 'zen-maru-font';
    link.rel = 'stylesheet'; // 修正屬性拼寫錯誤 link.relative -> link.rel
    link.href = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&family=Quicksand:wght@500;700&display=swap';
    document.head.appendChild(link);
  }
};

// 安全獲取 LocalStorage 資料的輔助工具
const getLocalStorageItem = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

// 安全且不碰撞的 ID 產生器 (防止使用者快速點擊或批次處理時 React Key 衝突)
const generateUniqueId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Fukuoka+Airport",
        transitNext: "搭乘地下鐵空港線往博多車站"
      },
      {
        id: "day1-spot2",
        time: "11:30",
        name: "博多車站寄放行李 ＆ 買點心伴手禮",
        category: "購物",
        desc: "博多車站尋找置物櫃寄放行李。漫步 MING 名產街選購點心伴手禮（如博多通饅頭 or 福砂屋）。",
        stay: "45 分鐘",
        tags: ["必吃", "必買"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Hakata+Station",
        transitNext: "博多口西日本銀行前搭 58 號公車"
      },
      {
        id: "day1-spot3",
        time: "12:30",
        name: "福岡市動植物園 🦝",
        category: "景點",
        desc: "綠意盎然的都市綠洲。擁有熱帶溫室與多樣化動物區，可以近距離與可愛動物互動野餐。",
        stay: "3 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Fukuoka+City+Zoological+and+Botanical+Garden",
        transitNext: "搭乘公車回到博多友都八喜"
      },
      {
        id: "day1-spot4",
        time: "18:00",
        name: "LOPIA 博多友都八喜店 (Yodobashi) 🛒",
        category: "購物",
        desc: "前往博多車站旁的 Yodobashi 地下LOPIA超人氣超市，採購今晚美味晚餐、各類日系熟食熟肉、水果與隔日自駕路上享用的豐富早餐。這裡有多樣平價的高品質熟食可供選擇！",
        stay: "1.5 小時",
        tags: ["必吃", "必買"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=LOPIA+Yodobashi+Hakata",
        transitNext: "提著滿載物資步行前往天神飯店"
      },
      {
        id: "day1-spot5",
        time: "20:30",
        name: "スコーレ第２天神 (Scole No.2 Tenjin) 🏨",
        category: "酒店",
        desc: "【本日住宿】位於天神中心的舒適公寓住宿。生活家電齊備，臨近天神商圈，是明日自駕出發前的優質基地！",
        stay: "一整晚",
        tags: [],
        navUrl: "https://www.booking.com/hotel/jp/yin-mifang-ti-karaokeoguo-zi-shi-befang-ti-fu-yuan-yin-shi-dian-noentateimentowu.zh-tw.html",
        transitNext: "無，今晚於天神公寓入眠 🌙"
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
        navUrl: "https://goo.gl/maps/jaTeDTkjrLdyhj5aA",
        transitNext: "行經高速公路開往佐賀神埼"
      },
      {
        id: "day2-spot2",
        time: "09:30",
        name: "吉野里歷史公園 🏹",
        category: "景點",
        desc: "全日本最大規模的彌生時代部落遺跡。重現兩千多年前的聚落、高床式倉庫與古人神秘生活。",
        stay: "2 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Yoshinogari+Historical+Park",
        transitNext: "開車至佐賀市區參觀熱氣球與本丸"
      },
      {
        id: "day2-spot3",
        time: "11:00",
        name: "佐賀熱氣球博物館 ＆ 佐賀城本丸歷史館 🎈🏯",
        category: "景點",
        desc: "參觀熱氣球主題博物館，擁有 280 吋動態大螢幕與飛行模擬體驗。接著造訪佐賀城本丸歷史館，參觀日本最大規模的木造復原建築，深度感受佐賀藩的歷史底蘊與幕末領先日本的科學發展成果。不在此安排佐賀牛大餐說明。",
        stay: "2.5 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Saga+Balloon+Museum",
        transitNext: "開車前往祐德稻荷神社"
      },
      {
        id: "day2-spot4",
        time: "15:30",
        name: "祐德稻荷神社 ⛩",
        category: "景點",
        desc: "日本三大稻荷神社之一。依山麓而建的巍峨紅色本殿壯麗無比，擁有宛如清水寺的木造高架舞台。漫步參拜，登上御本殿祈福。",
        stay: "1.5 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Yutoku+Inari+Shrine",
        transitNext: "開車沿國道 207 號南下往太良町大魚神社"
      },
      {
        id: "day2-spot5",
        time: "17:00",
        name: "太良町 大魚神社 海中鳥居 ⛩",
        category: "景點",
        desc: "矗立在潮汐中的三座朱紅色海上鳥居。滿潮時沒入海中，退潮時能步行走在底下。",
        stay: "1.5 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Oouo+Shrine+Torii+in+the+Sea",
        transitNext: "開車前往肥前濱宿老街住宿"
      },
      {
        id: "day2-spot6",
        time: "18:30",
        name: "茜さす 肥前浜宿 Akanesasu Hizenhamashuku 🏨",
        category: "酒店",
        desc: "【本日住宿】肥前濱宿古老釀酒街的奢華改建古民家町屋。重現江戶風華與現代高奢設施，感受侘寂之美。",
        stay: "一整晚",
        tags: [],
        navUrl: "https://www.booking.com/hotel/jp/qian-sasu-fei-qian-bang-su.zh-tw.html",
        transitNext: "無，今晚在釀酒街沉浸入夢 💤"
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
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Takeo+City+Library",
        transitNext: "步行或開車前往武雄神社"
      },
      {
        id: "day3-spot2",
        time: "11:15",
        name: "武雄神社 ＆ 3000年武雄大楠 🌳",
        category: "景點",
        desc: "佐賀最古老的神社。穿過後方幽靜的翠綠竹林，樹齡高達 3,000 年的巍峨大楠木神木立於其中，空靈肅穆。",
        stay: "1.5 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Takeo+Shrine",
        transitNext: "開車前往御船山樂園"
      },
      {
        id: "day3-spot3",
        time: "12:30",
        name: "御船山樂園 ＆ 享用A5佐賀牛鐵路便當 カイロ堂 🍱",
        category: "食物",
        desc: "午餐先購買蟬聯九州冠軍的「カイロ堂」極品 A5 佐賀牛便當，隨後進入怪石樂園進行野餐。",
        stay: "2 小時",
        tags: ["必吃", "必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Mifuneyama+Rakuen",
        transitNext: "開車前往陶瓷重鎮有田小鎮"
      },
      {
        id: "day3-spot4",
        time: "15:00",
        name: "有田陶山神社 ─ 唯一的青花瓷鳥居 🏺",
        category: "景點",
        desc: "陶瓷愛好者天堂，鳥居、守護狛犬均由有田燒青花瓷製，更妙的是境內有 JR 筑肥線火車穿過。",
        stay: "1.5 小時",
        tags: ["必拍", "必買"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Sueyama+Shrine+Arita",
        transitNext: "開車前往伊萬里包棟別墅"
      },
      {
        id: "day3-spot5",
        time: "17:00",
        name: "Rakuten STAY HOUSE × WILL STYLE 佐賀伊万里 🏨",
        category: "酒店",
        desc: "【本日住宿】高人氣樂天包棟設計別墅。擁有兩間挑高臥室、極舒適大客廳與設備齊全的現代廚房，配備大投影幕。",
        stay: "一整晚",
        tags: [],
        navUrl: "https://www.booking.com/hotel/jp/rakuten-stay-house-x-will-style-saga-imari-vacation-stay-59208v.zh-tw.html",
        transitNext: "無，今晚在伊萬里奢華 Villa 舒適休憩 🌙"
      }
    ]
  },
  {
    day: 4,
    date: "2026/06/27 (六)",
    title: "陶藝秘境・風鈴輕響的防守",
    area: "伊萬里 ＆ 唐津",
    outfit: "山區午後易起風，建議穿著薄長裙 or 棉麻服飾，並備妥雨具。",
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
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Okawachiyama+Imari",
        transitNext: "自駕前往伊萬里夢Misaki公園"
      },
      {
        id: "day4-spot2",
        time: "13:00",
        name: "伊萬里夢Misaki公園 (Imari Yume Misaki Park) 🌳",
        category: "景點",
        desc: "坐落於伊萬里灣旁的廣闊海濱公園。擁有大片翠綠草坪、多功能遊樂設施與美麗的海灣風光，是自駕途中的絕佳休憩點。",
        stay: "1.5 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Imari+Yume+Misaki+Park",
        transitNext: "開車沿著玄海海岸線前往竹ノ島"
      },
      {
        id: "day4-spot3",
        time: "15:00",
        name: "玄海国定公園 竹ノ島 (Takenoshima) 🌊",
        category: "景點",
        desc: "漫步於玄海國定公園的竹之島地區，欣賞壯麗的奇岩異石玄武岩海岸線與清澈見底的海水，遠眺外海群島，感受大自然的鬼斧神工。",
        stay: "1.5 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Takenoshima+Karatsu",
        transitNext: "自駕前往唐津日式別館 check-in"
      },
      {
        id: "day4-spot4",
        time: "17:00",
        name: "AKARIYA別館 ~横山邸~ 🏨",
        category: "酒店",
        desc: "【本日住宿】極富昭和復古氛圍的唐津日式別館。擁有清雅私人日式庭園與榻榻米，享受日式古典生活。",
        stay: "一整晚",
        tags: [],
        navUrl: "https://www.booking.com/hotel/jp/akariyabie-guan-heng-shan-di.zh-tw.html",
        transitNext: "無，今晚於唐津古民家沉浸入夢 💤"
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
        name: "波戸岬 ─ 戀人聖地 ＆ 白色海底展望塔 🤍",
        category: "景點",
        desc: "開車前往九州最西北端。設有雪白的心形紀念碑。步行進入伸入海底 7 公尺的白色海底展望塔，透過厚玻璃觀看真鯛魚在野生海水中成群悠游。",
        stay: "1.5 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Cape+Hado+Karatsu",
        transitNext: "開車往東邊前往呼子港"
      },
      {
        id: "day5-spot2",
        time: "11:30",
        name: "呼子港 ─ 享用現撈活烏賊姿造 🦑",
        category: "食物",
        desc: "抵達呼子港。在著名老店品嚐現撈現切的活烏賊刺身名店（如「海舟」或「河太郎」）。上桌時烏賊身體幾近透明，咬下時口感甘甜清脆，最後可將觸手酥炸成天婦羅！",
        stay: "2 小時",
        tags: ["必吃", "必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Yobuko+Port",
        transitNext: "自駕沿唐津灣返回唐津城"
      },
      {
        id: "day5-spot3",
        time: "14:00",
        name: "唐津城（別名：舞鶴城）🏯",
        category: "景點",
        desc: "聳立在唐津灣畔的臨海城堡。其兩翼延伸的姿態如同仙鶴展翅。登上天守閣，可俯看虹之松原與海灣全景。",
        stay: "1.5 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Karatsu+Castle",
        transitNext: "自駕前往虹之松原與鏡山觀景台"
      },
      {
        id: "day5-spot4",
        time: "16:00",
        name: "虹之松原 ＆ 鏡山觀景台 🌲⛰️",
        category: "景點",
        desc: "開車穿過連綿 5 公里的翠綠松林密道「虹之松原」海岸線，隨後盤旋開上鏡山觀景台，從絕頂高台上居高臨下，將半月形松林與蔚藍唐津灣海岸盡收底眼。",
        stay: "1.5 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Kagamiyama+Observatory",
        transitNext: "自駕跨越縣界前往糸島海畔別墅"
      },
      {
        id: "day5-spot5",
        time: "18:00",
        name: "Rakuten STAY HOUSE x WILL STYLE Itoshima 101 🏡",
        category: "酒店",
        desc: "【本日住宿】座落於糸島無敵海畔的旗艦奢華獨棟別墅。高科技投影幕、中島廚房、私人戶外大露台。可享受海風 BBQ 度過溫馨度假夜！",
        stay: "一整晚",
        tags: [],
        navUrl: "https://www.booking.com/hotel/jp/rakuten-stay-house-itoshima-vacation-stay-45356.zh-tw.html",
        transitNext: "無，今晚在糸島豪華別墅烤肉夜談 🍷"
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
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Hakoshima+Shrine",
        transitNext: "自駕前往二見浦夫婦岩沙灘"
      },
      {
        id: "day6-spot2",
        time: "11:00",
        name: "櫻井二見浦 夫婦岩 ＆ 白色海上鳥居 🌊",
        category: "景點",
        desc: "糸島最著名的風景。純白海上鳥居矗立於沙灘，遠處則是連著神聖注連繩的夫婦岩。",
        stay: "1.5 小時",
        tags: ["必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Sakurai+Futamigaura+Itoshima",
        transitNext: "開車至鄰近的椰子樹鞦韆公園"
      },
      {
        id: "day6-spot3",
        time: "13:00",
        name: "椰子樹鞦韆海灘（ヤシの木ブランコ）🌴",
        category: "活動",
        desc: "沙灘上兩棵斜斜生長的巨型椰子樹所製成的鞦韆，迎風高高盪漾。",
        stay: "1.5 小時",
        tags: ["必吃", "必拍"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Yashinoki+Swing+Itoshima",
        transitNext: "自駕開回博多市區 Budget 祇園店歸還愛車，並步行至博多站前飯店 check-in"
      },
      {
        id: "day6-spot4",
        time: "18:00",
        name: "まほら (Mahora Fukuoka) 🏨",
        category: "酒店",
        desc: "【本日住宿】自駕行完美落幕、平安歸還租車後入住的福岡設計型公寓飯店. 空間規劃前衛新穎且靜謐，距離博多車站極近。是您在回台前整理大箱小箱戰利品、採購藥妝的完美最後基地！",
        stay: "一整晚",
        tags: ["必買"],
        navUrl: "https://www.booking.com/hotel/jp/mahora-fu-gang-shi.zh-tw.html",
        transitNext: "無，今晚在福岡繁華街盡情採購、裝箱 🛍"
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
        id: "day7-spot2",
        time: "09:30",
        name: "福岡機場 (FUK) 搭機 CI111 ＆ 回程台灣 ✈",
        category: "交通",
        desc: "前往華航櫃檯辦理登機。通關後，在免稅店進行機場伴手禮補貨與限定商品採購，隨後起飛返台。",
        stay: "2 小時",
        tags: ["必買"],
        navUrl: "https://www.google.com/maps/dir/?api=1&destination=Fukuoka+Airport+International+Terminal",
        transitNext: "平安飛抵台灣桃園國際機場"
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

  // 景點專屬消費輸入狀態：格式為 { [spotId]: { item: '拉麵', category: '食物', amount: '1200' } }
  const [spotExpenseInputs, setSpotExpenseInputs] = useState({});

  const [itinerary, setItinerary] = useState(() => getLocalStorageItem('kyushu_itinerary_v2', initialDaysData));

  const [expenses, setExpenses] = useState(() => {
    // 預設將實體訂房費用與對應行程中的「酒店景點」進行 spotId 連結綁定，展現高度無縫整合
    // D2 酒店為 day2-spot6，D4 酒店為 day4-spot4，D5 酒店為 day5-spot5
    const defaultExpenses = [
      { id: 'exp-stay1', day: 1, date: '2026/06/24', category: '住宿', item: 'スコーレ第２天神 (D1住宿費)', amount: 5041, spotId: 'day1-spot5', spotName: 'スコーレ第２天神 (Scole No.2 Tenjin) 🏨' },
      { id: 'exp-stay2', day: 2, date: '2026/06/25', category: '住宿', item: '茜さす 肥前浜宿 (D2住宿費)', amount: 22467, spotId: 'day2-spot6', spotName: '茜さす 肥前浜宿 Akanesasu Hizenhamashuku 🏨' },
      { id: 'exp-stay3', day: 3, date: '2026/06/26', category: '住宿', item: 'Rakuten STAY佐賀伊万里 (D3住宿費)', amount: 8763, spotId: 'day3-spot5', spotName: 'Rakuten STAY HOUSE × WILL STYLE 佐賀伊万里 🏨' },
      { id: 'exp-stay4', day: 4, date: '2026/06/27', category: '住宿', item: 'AKARIYA別館 ~横山邸~ (D4住宿費)', amount: 9015, spotId: 'day4-spot4', spotName: 'AKARIYA別館 ~横山邸~ 🏨' },
      { id: 'exp-stay5', day: 5, date: '2026/06/28', category: '住宿', item: '絲島 Rakuten STAY 101 (D5住宿費)', amount: 6200, spotId: 'day5-spot5', spotName: 'Rakuten STAY HOUSE x WILL STYLE Itoshima 101 🏡' },
      { id: 'exp-stay6', day: 6, date: '2026/06/29', category: '住宿', item: 'まほら (D6住宿費)', amount: 5400, spotId: 'day6-spot4', spotName: 'まほら (Mahora Fukuoka) 🏨' }
    ];
    return getLocalStorageItem('kyushu_expenses_v2', defaultExpenses);
  });

  const [packingList, setPackingList] = useState(() => {
    // 套用使用者所提供的真實行李打包清單與結構，全數調整為 checked: false 確保不用示範打勾
    const defaultPacking = {
      personal: [
        { id: 'p1', text: '個人身分證件 (護照、身分證、簽證、國際駕照)', checked: false },
        { id: 'p2', text: '登機證 (紙本機票或電子機票)', checked: false },
        { id: 'p3', text: '現金 (當地貨幣、少量台幣、VISA功能提款卡)', checked: false },
        { id: 'p4', text: '信用卡 (國外刷卡回饋高或有附加機場服務、國外服務的信用卡)', checked: false },
        { id: 'p5', text: '手機 / 充電線', checked: false },
        { id: 'p6', text: '交通卡', checked: false },
        { id: 'p7', text: '網卡 (上網卡、事先列印的eSIM QRcode)', checked: false },
        { id: 'p8', text: '住宿、交通預約證明 (可以存在手機內，或列印出來備用以防萬一)', checked: false },
        { id: 'p9', text: '空的水瓶 (可依照自己習慣改成好攜帶的保溫瓶、環保杯等)', checked: false },
        { id: 'p10', text: '好寫的原子筆 (建議為快乾不易掉色、暈染的油性原子筆)', checked: false },
        { id: 'p11', text: '清潔用品 (衛生紙 / 女性衛生用品 / 手帕 or 小毛巾)', checked: false },
        { id: 'p12', text: '護手霜、潤唇膏 (機艙很乾燥，隨時可以補充讓搭飛機過程中舒適)', checked: false },
        { id: 'p13', text: '鑰匙 (家裡的、汽機車的)', checked: false },
        { id: 'p14', text: '小型收納袋 (可以存放SIM卡、當地收據、各類預約證明)', checked: false },
        { id: 'p15', text: '電子用品 (筆記型電腦、手機跟手錶充電線、充電頭*2)', checked: false }
      ],
      checked: [
        { id: 't1', text: '兩個大行李箱 (備用收納袋)', checked: false },
        { id: 't2', text: '衣物類 (三套衣物_Curt)', checked: false },
        { id: 't3', text: '衣物類 (三套衣物_Ting)', checked: false },
        { id: 't4', text: '衣物類 (三套衣物_Elio)', checked: false },
        { id: 't5', text: '衣物類 (三套衣物_Elia)', checked: false },
        { id: 't6', text: '配件類 (飾品、太陽眼鏡、帽子)', checked: false },
        { id: 't7', text: '日用品 (摺疊傘)', checked: false },
        { id: 't8', text: '藥品 (腸胃藥、感冒藥、暈車藥、蚊蟲藥、攜帶型急救包、個人常備藥)', checked: false },
        { id: 't9', text: '保養化妝品 (化妝水、潤膚用品、防曬乳、粉底、口紅等)', checked: false },
        { id: 't10', text: '盥洗用品 (卸妝乳、洗面乳、牙膏、牙刷)', checked: false },
        { id: 't11', text: '收納用品 (可收納衣服的購物袋)', checked: false },
        { id: 't12', text: '文件 (影本護照)', checked: false }
      ]
    };
    return getLocalStorageItem('kyushu_packing_v2', defaultPacking);
  });

  // --------------------------------------------------------
  // ✨ 行程編輯與新增彈框所屬狀態宣告
  // --------------------------------------------------------
  const [spotModalOpen, setSpotModalOpen] = useState(false);
  const [modalTargetDay, setModalTargetDay] = useState(1);
  const [modalInsertIndex, setModalInsertIndex] = useState(0);
  const [editingSpotId, setEditingSpotId] = useState(null);
  
  // 停留時間的小時與分鐘狀態 (預設值 1 小時 0 分鐘)
  const [stayHours, setStayHours] = useState(1);
  const [stayMinutes, setStayMinutes] = useState(0);

  const [spotForm, setSpotForm] = useState({
    time: '10:00',
    name: '',
    category: '景點',
    desc: '',
    stay: '1 小時',
    tags: [],
    photoTip: '',
    navUrl: 'https://maps.google.com/?q=',
    transitNext: ''
  });

  // 手動記帳表單狀態
  const [expFormDate, setExpFormDate] = useState('2026/06/24');
  const [expFormCategory, setExpFormCategory] = useState('食物');
  const [expFormItem, setExpFormItem] = useState('');
  const [expFormAmount, setExpFormAmount] = useState('');

  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('personal');

  // 客製化防阻擋提示及刪除確認彈窗 (完美避開 iframe 內的阻擋限制)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ dayNum: null, spotId: null, spotName: '' });
  const [alertMessage, setAlertMessage] = useState('');

  // --------------------------------------------------------
  // 3. 副作用處理 (useEffect) ── 全功能 LocalStorage 持久防震盪同步
  // --------------------------------------------------------
  useEffect(() => {
    injectFont();
  }, []);

  // 使用防震盪效能優化 (500ms debounce)，防止輸入文字時高頻讀寫 localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kyushu_itinerary_v2', JSON.stringify(itinerary));
    }, 500);
    return () => clearTimeout(timer);
  }, [itinerary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kyushu_expenses_v2', JSON.stringify(expenses));
    }, 500);
    return () => clearTimeout(timer);
  }, [expenses]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('kyushu_packing_v2', JSON.stringify(packingList));
    }, 500);
    return () => clearTimeout(timer);
  }, [packingList]);

  // --------------------------------------------------------
  // 4. 衍生計算變數 (Derived Variables)
  // --------------------------------------------------------
  const totalBudget = 245000; // JPY 總預算
  
  // 型態安全保護，使用 parseFloat 並加入 isNaN 防禦，防止非預期格式導致總支出顯示為 NaN 而崩潰
  const totalSpentJPY = expenses.reduce((sum, item) => {
    const amt = parseFloat(item?.amount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);
  const totalSpentTWD = Math.round(totalSpentJPY * 0.21); // 匯率參考
  const progressPercent = Math.min(100, Math.round((totalSpentJPY / totalBudget) * 100));

  const categoryBreakdown = expenses.reduce((acc, curr) => {
    if (curr) {
      const amt = parseFloat(curr.amount);
      const safeAmt = isNaN(amt) ? 0 : amt;
      acc[curr.category] = (acc[curr.category] || 0) + safeAmt;
    }
    return acc;
  }, {});

  const currentDayData = itinerary.find(d => d.day === activeDay);

  // --------------------------------------------------------
  // 5. 實用輔助工具函式
  // --------------------------------------------------------
  // 估算時間加 30 分鐘工具，防禦性無效時間格式的預設回傳值與預設時間「08:00」完全對齊
  const addMinutesToTime = (timeStr, minsToAdd) => {
    if (!timeStr || !timeStr.includes(':')) return '08:00';
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '08:00';
    let newMins = minutes + minsToAdd;
    let newHours = hours + Math.floor(newMins / 60);
    newMins = newMins % 60;
    newHours = newHours % 24;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  // 解析停留時間字串轉為選單狀態
  const parseStayTime = (stayStr) => {
    let h = 1;
    let m = 0;
    if (stayStr) {
      const hourMatch = stayStr.match(/(\d+)\s*小時/);
      const minMatch = stayStr.match(/(\d+)\s*分鐘/);
      if (hourMatch) h = parseInt(hourMatch[1]);
      else if (stayStr.includes("分鐘") && !stayStr.includes("小時")) h = 0;
      if (minMatch) m = parseInt(minMatch[1]);
    }
    return { h, m };
  };

  // --------------------------------------------------------
  // 6. 互動處理函式 (Handlers)
  // --------------------------------------------------------
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem = {
      id: generateUniqueId('packing'), // 修復客製化行李 ID 碰撞風險
      text: newItemText,
      checked: false
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

  const handleEditPackingText = (category, itemId, newText) => {
    setPackingList(prev => {
      const updatedList = prev[category].map(item => 
        item.id === itemId ? { ...item, text: newText } : item
      );
      return {
        ...prev,
        [category]: updatedList
      };
    });
  };

  // 在此前插入新行程：預設時間強制設定為 08:00
  const openSpotModalForAdd = (dayNum, insertIndex, defaultTime = '08:00') => {
    setModalTargetDay(dayNum);
    setModalInsertIndex(insertIndex);
    setEditingSpotId(null);
    setStayHours(1);
    setStayMinutes(0);
    setSpotForm({
      time: defaultTime,
      name: '',
      category: '景點',
      desc: '',
      stay: '1 小時',
      tags: [],
      photoTip: '',
      navUrl: 'https://maps.google.com/?q=',
      transitNext: ''
    });
    setSpotModalOpen(true);
  };

  const openSpotModalForEdit = (dayNum, spot) => {
    setModalTargetDay(dayNum);
    setEditingSpotId(spot.id);
    const { h, m } = parseStayTime(spot.stay);
    setStayHours(h);
    setStayMinutes(m);
    setSpotForm({
      time: spot.time || '10:00',
      name: spot.name || '',
      category: spot.category || '景點',
      desc: spot.desc || '',
      stay: spot.stay || '1 小時',
      tags: spot.tags || [],
      photoTip: spot.photoTip || '',
      navUrl: spot.navUrl || 'https://maps.google.com/?q=',
      transitNext: spot.transitNext || ''
    });
    setSpotModalOpen(true);
  };

  const handleSaveSpotForm = (e) => {
    e.preventDefault();
    
    // 智慧組合停留時間字串
    let stayStr = '';
    if (stayHours === 0 && stayMinutes === 0) {
      stayStr = '30 分鐘'; 
    } else {
      stayStr = stayHours > 0 
        ? `${stayHours} 小時${stayMinutes > 0 ? ` ${stayMinutes} 分鐘` : ''}` 
        : `${stayMinutes} 分鐘`;
    }

    const finalForm = {
      ...spotForm,
      stay: stayStr
    };

    setItinerary(prev => {
      return prev.map(d => {
        if (d.day !== modalTargetDay) return d;
        let newSpots = [...d.spots];

        if (editingSpotId) {
          newSpots = newSpots.map(s => s.id === editingSpotId ? { ...s, ...finalForm } : s);
        } else {
          const newSpot = {
            id: generateUniqueId('spot'), // 修復客製化景點 ID 碰撞風險
            ...finalForm
          };
          newSpots.splice(modalInsertIndex, 0, newSpot);
        }
        return { ...d, spots: newSpots };
      });
    });
    setSpotModalOpen(false);
  };

  // 自訂安全刪除確認機制 (取代受限的 window.confirm())
  const initiateDeleteSpot = (dayNum, spotId, spotName) => {
    setDeleteTarget({ dayNum, spotId, spotName });
    setDeleteConfirmOpen(true);
  };

  // 刪除景點時連同消費紀錄頁面相關花費一併移除
  const confirmDeleteSpot = () => {
    const { dayNum, spotId } = deleteTarget;
    // 1. 刪除景點
    setItinerary(prev => {
      return prev.map(d => {
        if (d.day !== dayNum) return d;
        return {
          ...d,
          spots: d.spots.filter(s => s.id !== spotId)
        };
      });
    });
    // 2. 聯動移除關聯的所有花費紀錄
    setExpenses(prev => prev.filter(e => e.spotId !== spotId));

    setDeleteConfirmOpen(false);
    setDeleteTarget({ dayNum: null, spotId: null, spotName: '' });
  };

  // 獨立/一般消費記帳登錄 (修復手動記帳 Bug：改為透過動態比對 itinerary 的日期進行精確歸類)
  const handleAddExpenseManual = (e) => {
    e.preventDefault();
    if (!expFormItem.trim() || !expFormAmount) return;
    
    const foundDay = itinerary.find(d => d.date.includes(expFormDate));
    const dayNum = foundDay ? foundDay.day : 1;

    const newExp = {
      id: generateUniqueId('exp'), // 修復客製化記帳 ID 碰撞風險
      day: dayNum,
      date: expFormDate,
      category: expFormCategory,
      item: expFormItem,
      amount: parseInt(expFormAmount, 10) || 0
    };

    setExpenses(prev => [...prev, newExp]);
    setExpFormItem('');
    setExpFormAmount('');
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  // 處理景點內嵌專屬消費輸入更動與新增機制
  const handleSpotInputChange = (spotId, field, value) => {
    setSpotExpenseInputs(prev => ({
      ...prev,
      [spotId]: {
        ...(prev[spotId] || { item: '', category: '食物', amount: '' }),
        [field]: value
      }
    }));
  };

  const handleSpotExpenseAddLocal = (spot, dayNum, dateStr) => {
    const input = spotExpenseInputs[spot.id] || {};
    const itemName = input.item || '';
    const amount = input.amount || '';
    const category = input.category || '食物';

    if (!itemName.trim() || !amount) {
      setAlertMessage("請輸入消費項目名稱與金額！");
      return;
    }

    const newExp = {
      id: generateUniqueId('exp'), // 修復客製化內嵌記帳 ID 碰撞風險
      day: dayNum,
      date: dateStr.split(' ')[0], // 去除星期備註
      category: category,
      item: itemName,
      amount: parseInt(amount, 10) || 0,
      spotId: spot.id,
      spotName: spot.name
    };

    setExpenses(prev => [...prev, newExp]);

    // 清空當前景點輸入框
    setSpotExpenseInputs(prev => ({
      ...prev,
      [spot.id]: { item: '', category: '食物', amount: '' }
    }));
  };

  // 匯出 Excel (CSV) 完整資料全紀錄
  const handleExportToExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "========================================================\n";
    csvContent += "2026 九州 (福岡・佐賀・糸島) 自駕自由行 完整旅行全紀錄總表\n";
    csvContent += `"匯出日期：2026/05/20 | 總預算：JPY ${totalBudget.toLocaleString()} | 匯率參考：0.21"\n`; // 加引號避免標題中的逗號破壞CSV
    csvContent += "========================================================\n\n";
    csvContent += "--- 一、 財務預算執行摘要 ---\n";
    csvContent += "財務指標項目,數值 (JPY),估算數值 (TWD),百分比\n";
    csvContent += `"總預算額度","JPY ${totalBudget.toLocaleString()}","NT$ ${Math.round(totalBudget * 0.21).toLocaleString()}","100%"\n`; // 已修正：加雙引號包裹以防數值帶千分位逗號造成截斷
    csvContent += `"已累計支出","JPY ${totalSpentJPY.toLocaleString()}","NT$ ${totalSpentTWD.toLocaleString()}","${progressPercent}%"\n`; // 已修正
    csvContent += `"剩餘可用預算","JPY ${(totalBudget - totalSpentJPY).toLocaleString()}","NT$ ${Math.round((totalBudget - totalSpentJPY) * 0.21).toLocaleString()}","${100 - progressPercent}%"\n\n`; // 已修正
    csvContent += "消費大類類別,累計支出金額 (日圓 JPY),預算佔比\n";
    Object.keys(categoryBreakdown).forEach(cat => {
      const amt = categoryBreakdown[cat];
      const p = Math.round((amt / totalSpentJPY) * 100);
      csvContent += `"${cat}","JPY ${amt.toLocaleString()}","${p}%"\n`;
    });
    csvContent += "\n";
    csvContent += "--- 二、 每日詳細行程計畫表 ---\n";
    csvContent += "天數,日期,自駕地區,本日行程主題,本日降雨率,時間點,行程景點名稱,預計停留,景點類別,景點與交通描述,拍照好拍技巧\n";
    itinerary.forEach(d => {
      d.spots.forEach(s => {
        csvContent += `"${`D${d.day}`}","${d.date}","${d.area}","${d.title}","${d.rainChance}","${s.time}","${s.name}","${s.stay}","${s.category}","${(s.desc || '').replace(/"/g, '""')}","${(s.photoTip || '').replace(/"/g, '""')}"\n`;
      });
    });
    csvContent += "\n";
    csvContent += "--- 三, 消費記帳明細流水帳 ---\n";
    csvContent += "記帳日期,行程天數,費用大類,消費項目/飯店/餐飲名稱,支出金額 (日圓 JPY),估計折合金額 (台幣 TWD),景點綁定狀態\n";
    expenses.forEach(item => {
      csvContent += `"${item.date}","${`D${item.day}`}","${item.category}","${item.item.replace(/"/g, '""')}","${item.amount}","${Math.round(item.amount * 0.21)}","${item.spotName ? `📍 ${item.spotName}` : '獨立消費'}"\n`;
    });
    csvContent += "\n";
    csvContent += "--- 四, 行理準備與日本代購清單 ---\n";
    csvContent += "清單類別,物理準備項目,準備與勾選狀態\n";
    const categoryNames = {
      personal: "💼 隨身行李 (證件、貴重與隨身物品)",
      checked: "🧳 託運行李 (大行李箱與個人裝備)"
    };
    Object.keys(packingList).forEach(catKey => {
      packingList[catKey].forEach(item => {
        csvContent += `"${categoryNames[catKey]}","${item.text.replace(/"/g, '""')}","${item.checked ? '已備妥' : '尚未準備'}"\n`;
      });
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "2026_九州自由行_財務自駕環線數據庫.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-dvh w-screen overflow-hidden bg-[#F5F7FA] font-['Zen_Maru_Gothic',sans-serif] text-[#2C3E50] flex justify-center items-center" style={{ height: '100dvh' }}>
      {/* Outer Shell using h-dvh w-screen overflow-hidden for a true mobile web app experience */}
      <div className="w-full max-w-md h-full bg-white shadow-2xl relative overflow-hidden flex flex-col animate-fade-in" style={{ height: '100dvh' }}>
        
        {/* APP HEADER */}
        <header className="bg-gradient-to-r from-[#2A4B7C] to-[#3B629B] text-white pt-4 pb-3.5 px-4 rounded-b-2xl shadow-md relative shrink-0">
          <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none overflow-hidden h-6">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-current">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,42.4V0Z" />
            </svg>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-1 bg-[#FF8E99] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full w-max mb-1 shadow-sm">
                <Sparkles size={9} />
                <span>2026 九州自由行</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-sm font-['Zen_Maru_Gothic']">2026 九州自由行</h1>
              <p className="text-[10px] text-[#EAF2F8] mt-0.5 flex items-center gap-1 font-sans">
                <Calendar size={10} />
                <span>06/24 — 06/30 (7天6夜)</span>
              </p>
            </div>
            
            <div className="bg-white/10 px-2 py-1 rounded-xl backdrop-blur-md border border-white/20 text-center">
              <span className="block text-[8px] uppercase tracking-wider text-blue-200">當前位置</span>
              <span className="text-sm font-bold block text-yellow-200 font-sans">{currentDayData ? currentDayData.area : '九州'}</span>
            </div>
          </div>

          {/* 財務與自駕狀態一覽欄 */}
          <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2.5 border-t border-white/10 text-center text-[10px]">
            <div className="bg-white/5 py-1 rounded-lg border border-white/5">
              <span className="text-[8px] text-blue-200 block">累計支出</span>
              <span className="font-bold text-sm text-white">￥{totalSpentJPY.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 py-1 rounded-lg border border-white/5">
              <span className="text-[10px] text-blue-200 block font-sans">台幣等值</span>
              <span className="font-bold text-sm text-yellow-100 font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold">NT$ {totalSpentTWD.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 py-1 rounded-lg border border-white/5">
              <span className="text-[8px] text-blue-200 block">剩餘預算</span>
              <span className="font-bold text-xs text-emerald-300 font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold font-bold">￥{(totalBudget - totalSpentJPY).toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* 1. MAIN BODY CONTENT AREA (pb-28 徹底解決行程列表最底端不遮擋、不被浮動 Nav 擋住的問題) */}
        <main id="main-content-area" className="flex-1 overflow-y-auto px-4 pt-4 pb-28">

          {/* ======================================================== */}
          {/* 行程分頁 (ITINERARY) */}
          {/* ======================================================== */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              
              {/* 天數滑動快速導練列 */}
              <div className="bg-white rounded-3xl p-3 shadow-md border border-[#E9ECF0] overflow-hidden animate-fade-in">
                <span className="text-xs text-[#7F8C8D] block px-1 mb-2 font-medium font-sans">切換行程日期</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {itinerary.map(d => (
                    <button
                      key={d.day}
                      onClick={() => setActiveDay(d.day)}
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
                <div className="bg-[#FDF9F3] border border-[#F3E3CD] rounded-3xl p-4 shadow-sm flex flex-col gap-3 transition-all duration-300 font-sans font-sans font-sans">
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
                </div>
              )}

              {/* 每日行程時間軸 */}
              {currentDayData && currentDayData.spots.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200 space-y-3 font-sans">
                  <Smile size={32} className="mx-auto text-[#FF8E99] animate-bounce" />
                  <p className="text-xs text-[#7F8C8D]">本日尚無行程計畫捏，快來建立九州的第一站行程吧！</p>
                  <button
                    onClick={() => openSpotModalForAdd(activeDay, 0, '08:00')}
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

                    {/* 首個景點前的插入按鈕：在此前插入預設為 08:00 */}
                    <div className="relative flex justify-center -mb-3 z-20 font-sans">
                      <button
                        onClick={() => openSpotModalForAdd(activeDay, 0, '08:00')}
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs hover:bg-emerald-100 flex items-center gap-0.5 transition-all active:scale-95 ml-6"
                      >
                        <Plus size={11} /> <span>在此前插入新行程</span>
                      </button>
                    </div>

                    {currentDayData.spots.map((spot, idx) => {
                      const style = getCategoryStyle(spot.category);
                      // 獲取該景點已綁定的所有記帳紀錄
                      const spotExpensesList = expenses.filter(e => e.spotId === spot.id);
                      // 計算其後行程的預設時間 (前一行程抵達時間加30分鐘)
                      const defTimeForNext = addMinutesToTime(spot.time, 30);

                      return (
                        <div key={spot.id} className="relative group animate-fade-in font-sans">
                          {/* 時間軸分類圖標 */}
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
                            {spot.desc && <p className="text-xs text-[#5D6D7E] leading-relaxed">{spot.desc}</p>}

                            {/* 特色標籤 */}
                            {spot.tags && spot.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1 font-sans">
                                {spot.tags.map(t => (
                                  <span 
                                    key={t} 
                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                                      t === '必吃' ? 'bg-[#FF8E99]/10 text-[#FF5A6F] border border-[#FF8E99]/30' : 
                                      t === '必拍' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
                                      t === '必買' ? 'bg-amber-50 text-[#C68D00] border border-[#E6AF2E]/30' :
                                      'bg-slate-50 text-slate-500 border border-slate-200'
                                    }`}
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* 實用連結與操作欄 */}
                            {spot.navUrl && spot.navUrl !== 'https://maps.google.com/?q=' && (
                              <div className="bg-slate-50 rounded-2xl p-3 border border-gray-100 flex justify-between items-center text-[11px] text-[#5D6D7E]">
                                <span className="text-gray-400 font-sans">
                                  🕒 預估停留: {spot.stay}
                                </span>
                                <a 
                                  href={spot.navUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[#2A4B7C] font-bold hover:underline transition-all"
                                >
                                  <Navigation size={12} className="text-[#FF8E99]" />
                                  <span>{spot.category === '酒店' ? '住宿資訊' : 'Google Map導航'}</span>
                                </a>
                              </div>
                            )}

                            {/* 💳 景點專屬消費記錄區 */}
                            <div className="border-t border-gray-100 pt-3 space-y-3 font-sans">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                  <ShoppingBag size={13} className="text-[#3B629B]" />
                                  <span>📍 景點消費紀錄</span>
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  自動彙整至消費流水帳
                                </span>
                              </div>

                              {/* 列表：顯示該景點已有的開銷 */}
                              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                {spotExpensesList.length === 0 ? (
                                  <p className="text-[11px] text-gray-400 italic py-1">此景點暫無登錄消費，請在下方新增。</p>
                                ) : (
                                  spotExpensesList.map(e => (
                                    <div key={e.id} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl border border-gray-100/50">
                                      <div className="flex items-center gap-1.5 min-w-0 font-sans font-sans font-sans font-sans">
                                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md shrink-0">
                                          {e.category}
                                        </span>
                                        <span className="font-medium text-slate-700 truncate">{e.item}</span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <span className="font-bold text-slate-800">￥{e.amount.toLocaleString()}</span>
                                        <button 
                                          onClick={() => handleDeleteExpense(e.id)}
                                          className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* 快速新增此景點的消費項目 */}
                              <div className="bg-slate-50/50 p-2.5 rounded-2xl border border-dashed border-gray-200 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="項目 (如：特產、門票、午餐)"
                                    value={spotExpenseInputs[spot.id]?.item || ''}
                                    onChange={(e) => handleSpotInputChange(spot.id, 'item', e.target.value)}
                                    className="text-[11px] border border-gray-200 rounded-xl p-1.5 focus:outline-none bg-white text-slate-700"
                                  />
                                  <input 
                                    type="number" 
                                    placeholder="金額 (日圓 JPY)"
                                    value={spotExpenseInputs[spot.id]?.amount || ''}
                                    onChange={(e) => handleSpotInputChange(spot.id, 'amount', e.target.value)}
                                    className="text-[11px] border border-gray-200 rounded-xl p-1.5 focus:outline-none bg-white text-slate-700"
                                  />
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                  <select
                                    value={spotExpenseInputs[spot.id]?.category || '食物'}
                                    onChange={(e) => handleSpotInputChange(spot.id, 'category', e.target.value)}
                                    className="text-[11px] border border-gray-200 rounded-xl p-1.5 bg-white text-slate-700 focus:outline-none"
                                  >
                                    <option value="食物">🍜 食物</option>
                                    <option value="購物">🛍 購物</option>
                                    <option value="交通">🚗 交通</option>
                                    <option value="活動">🎟 活動</option>
                                    <option value="住宿">🏨 住宿</option>
                                    <option value="其他">📦 其他</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleSpotExpenseAddLocal(spot, currentDayData.day, currentDayData.date)}
                                    className="bg-[#2A4B7C] hover:bg-blue-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-0.5 shrink-0"
                                  >
                                    <Plus size={11} />
                                    <span>登錄花費</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* ✏️ 行程編輯與管理 (呼叫客製彈窗與傳遞加時時間) */}
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
                                  onClick={() => {
                                    // 確保帶入有提示警報的花費聯動移除確認視窗
                                    initiateDeleteSpot(activeDay, spot.id, spot.name);
                                  }}
                                  className="text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-0.5 transition-all active:scale-95"
                                  title="刪除此行程"
                                >
                                  <Trash2 size={11} /> <span>刪除景點</span>
                                </button>
                              </div>

                              <button
                                onClick={() => openSpotModalForAdd(activeDay, idx + 1, defTimeForNext)}
                                className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-0.5 transition-all active:scale-95"
                                title="在此景點後方插入一個新行程"
                              >
                                <Plus size={11} /> <span>在其後插入行程</span>
                              </button>
                            </div>

                          </div>

                          {/* 轉接交通方式 */}
                          {idx < currentDayData.spots.length - 1 && spot.transitNext && (
                            <div className="my-2 ml-10 flex items-center gap-2 text-xs text-[#7F8C8D] font-sans font-sans font-sans font-sans font-sans font-sans font-sans">
                              <span className="bg-[#EAF2F8] p-1 rounded-lg text-[#2A4B7C]">
                                🚗
                              </span>
                              <span className="font-medium">交通方式：{spot.transitNext}</span>
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
          {/* 記帳理財總覽分頁 (EXPENSES) */}
          {/* ======================================================== */}
          {activeTab === 'expenses' && (
            <div className="space-y-4 animate-fade-in font-sans">
              
              {/* 預算統計看板卡片 */}
              <div className="bg-[#2A4B7C] text-white rounded-[2rem] p-5 shadow-lg relative overflow-hidden">
                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/5 rounded-full" />
                <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest block font-sans">2026 九州自由行記帳本</span>
                <h3 className="text-lg font-bold mt-1 font-sans font-sans font-sans font-sans font-sans">財務預算控管與理財分析</h3>

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

                <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10 text-center">
                  <div>
                    <span className="text-[10px] text-blue-200 block font-sans font-sans font-sans font-sans font-sans">實際累計支出 (日圓)</span>
                    <span className="font-bold text-lg text-white font-sans font-sans font-sans font-sans font-sans font-sans font-sans">￥{totalSpentJPY.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-200 block font-sans font-sans font-sans">折合台幣 (依0.21估算)</span>
                    <span className="font-bold text-lg text-yellow-200">NT$ {totalSpentTWD.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 📥 智慧 Excel 一鍵匯出按鈕區塊 */}
              <div className="bg-white rounded-3xl p-4 shadow-md border border-[#E9ECF0] text-center space-y-2 font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">
                <p className="text-xs text-[#5D6D7E] leading-relaxed font-sans font-sans font-sans font-sans">
                  想要整理紙本或者與旅伴分攤費用嗎？您可以一鍵將「所有每日行程、住宿資訊、記帳流水帳、打包準備清單」以 Excel (CSV) 格式打包匯出！
                </p>
                <button 
                  onClick={handleExportToExcel}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 font-sans font-sans"
                >
                  <Download size={15} />
                  <span>📥 匯出 Excel 旅行全紀錄報表</span>
                </button>
              </div>

              {/* 手動獨立登錄費用紀錄表單 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 font-sans font-sans font-sans font-sans font-sans">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">
                  <Plus size={14} className="text-[#FF8E99]" />
                  <span>新增常規獨立花費 (如：ETC儲值、免稅採購)</span>
                </span>

                <form onSubmit={handleAddExpenseManual} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">消費日期</label>
                      <select 
                        value={expFormDate}
                        onChange={(e) => setExpFormDate(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-slate-50 text-slate-700"
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
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold font-sans font-sans font-sans font-sans">費用類別</label>
                      <select 
                        value={expFormCategory}
                        onChange={(e) => setExpFormCategory(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-slate-50 text-slate-700 font-sans"
                      >
                        <option value="食物">🍜 食物</option>
                        <option value="購物">🛍 購物</option>
                        <option value="交通">🚗 交通</option>
                        <option value="活動">🎟 活動</option>
                        <option value="住宿">🏨 住宿</option>
                        <option value="其他">📦 其他</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">消費項目名稱</label>
                      <input 
                        type="text" 
                        value={expFormItem}
                        onChange={(e) => setExpFormItem(e.target.value)}
                        placeholder="例：自駕油錢、免稅藥妝..."
                        className="w-full text-xs border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] text-slate-700 font-sans font-sans font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold">金額 (日圓)</label>
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
                    className="w-full bg-[#2A4B7C] hover:bg-blue-800 text-white p-2 px-3 py-2 rounded-xl hover:bg-[#1E3A5F] font-bold text-xs transition-all flex items-center justify-center gap-1 font-sans font-sans font-sans font-sans font-sans"
                  >
                    <Plus size={13} />
                    <span>登錄常規消費</span>
                  </button>
                </form>
              </div>

              {/* 類別比例結構分析 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 animate-fade-in font-sans font-sans font-sans font-sans font-sans font-sans">
                <span className="text-xs font-bold text-slate-800 block font-sans font-sans">各項消費分類比例分析</span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(categoryBreakdown).map(cat => {
                    const amt = categoryBreakdown[cat];
                    const percent = Math.round((amt / totalSpentJPY) * 100);
                    return (
                      <div key={cat} className="bg-slate-50 rounded-2xl p-2.5 text-center border border-gray-100 font-sans font-sans font-sans font-sans font-sans font-sans">
                        <span className="text-[10px] text-gray-400 block font-sans font-sans font-sans">{cat}</span>
                        <strong className="text-xs text-slate-800 block mt-0.5 font-sans font-sans font-sans font-sans font-sans">￥{amt.toLocaleString()}</strong>
                        <span className="text-[9px] text-[#2A4B7C] block font-sans font-sans font-sans">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 詳細費用記帳明細流 (完美整合景點與一般記帳) */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">
                <div className="flex justify-between items-center font-sans font-sans font-sans">
                  <span className="text-xs font-bold text-slate-800 font-sans font-sans">已登錄消費流水明細</span>
                  <span className="text-[10px] text-gray-400">共 {expenses.length} 筆款項</span>
                </div>

                <div className="space-y-2 divide-y divide-gray-100 pr-1 max-h-[40vh] overflow-y-auto font-sans font-sans font-sans font-sans font-sans">
                  {expenses.slice().reverse().map(item => {
                    const style = getCategoryStyle(item.category);
                    return (
                      <div key={item.id} className="pt-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/50 rounded-xl px-1 transition-colors font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">
                        <div className="flex items-center gap-2.5 min-w-0 font-sans">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] ${style.dot} text-white shrink-0`}>
                            {item.category === '食物' && <Utensils size={12} />}
                            {item.category === '購物' && <ShoppingBag size={12} />}
                            {item.category === '交通' && <Car size={12} />}
                            {item.category === '活動' && <Sparkles size={12} />}
                            {item.category === '住宿' && <Hotel size={12} />}
                            {item.category === '其他' && <FileText size={12} />}
                          </span>
                          <div className="truncate font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">
                            <span className="text-xs font-bold text-slate-800 block truncate font-sans font-sans font-sans font-sans font-sans font-sans font-sans">{item.item}</span>
                            
                            {/* 顯示景點裝載狀態 */}
                            {item.spotName ? (
                              <span className="text-[10px] text-blue-600 font-bold block mt-0.5 font-sans font-sans font-sans font-sans font-sans">
                                📍 於: {item.spotName}
                              </span>
                            ) : (
                              <span className="text-[9px] text-gray-400 block mt-0.5">D{item.day} ({item.date}) · 一般記帳</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 font-sans">
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-800 block font-sans">￥{item.amount.toLocaleString()}</span>
                            <span className="text-[9px] text-gray-400 block font-sans font-sans font-sans">約 NT$ {Math.round(item.amount * 0.21)}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleDeleteExpense(item.id)}
                            className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
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
                  2026 九州自駕環線圖 (台灣 ✈ 福岡 🚗 佐賀 🚗 糸島 🚗 福岡)
                </span>
                <h3 className="font-bold text-[#2A4B7C] text-base font-sans">7天6夜完整環形開車路線</h3>
                
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

                    {/* Nodes (更正糸島的字以及將糸島、太良町的紅點更換為景點對齊之深藍色，保留飛航粉紅色) */}
                    <g transform="translate(30,180)">
                      <circle r="6" fill="#FF5A6F" />
                      <circle r="3" fill="#FFFFFF" />
                      <text x="10" y="4" className="text-[10px] font-bold fill-[#FF5A6F] font-sans">台灣 (桃園機場)</text>
                    </g>
                    <g transform="translate(200,60)">
                      <circle r="7" fill="#2A4B7C" />
                      <circle r="3" fill="#FFFFFF" />
                      <text x="10" y="4" className="text-[10px] font-bold fill-[#2A4B7C] font-sans font-sans">福岡 (博多)</text>
                    </g>
                    <g transform="translate(140,100)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-35" y="-6" className="text-[9px] font-bold fill-[#4A5568] font-sans">佐賀市</text>
                    </g>
                    <g transform="translate(110,160)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="10" y="4" className="text-[9px] font-bold fill-[#4A5568] font-sans font-sans">太良町 (海中鳥居)</text>
                    </g>
                    <g transform="translate(100,120)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-40" y="12" className="text-[9px] font-bold fill-[#4A5568] font-sans font-sans font-sans font-sans">武雄神社</text>
                    </g>
                    <g transform="translate(60,110)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-30" y="-8" className="text-[9px] font-bold fill-[#4A5568] font-sans">有田陶瓷</text>
                    </g>
                    <g transform="translate(50,80)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-40" y="2" className="text-[9px] font-bold fill-[#4A5568] font-sans">伊萬里</text>
                    </g>
                    <g transform="translate(90,50)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-30" y="-8" className="text-[9px] font-bold fill-[#4A5568] font-sans font-sans">唐津城</text>
                    </g>
                    <g transform="translate(145,40)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="0" y="-8" className="text-[9px] font-bold fill-[#4A5568] font-sans font-sans font-sans font-sans">糸島半島</text>
                    </g>

                    <text x="100" y="110" className="text-sm">✈</text>
                    <text x="112" y="70" className="text-xs">🚗</text>
                  </svg>
                </div>
              </div>

              {/* 氣象與每日降雨預報表 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 font-sans">
                <span className="text-xs font-bold text-gray-400 block uppercase font-sans">每日區域預報 (2026/06/24 - 06/30)</span>
                <div className="divide-y divide-gray-100 font-sans font-sans font-sans">
                  {itinerary.map(d => (
                    <div key={d.day} className="py-3 flex items-center justify-between gap-2 animate-fade-in font-sans font-sans font-sans">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#2A4B7C] text-white font-bold font-sans text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-sans font-sans font-sans">
                          D{d.day}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block font-sans font-sans">{d.area}</span>
                          <span className="text-[9px] text-gray-400 block font-sans font-sans font-sans">{d.date.split(' ')[0]}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-sans font-sans font-sans">
                          <span className="text-xs font-bold font-sans text-slate-700 block">{d.temp}</span>
                          <span className="text-[9px] text-gray-400 block font-sans font-sans font-sans font-sans">體感約 28°C</span>
                        </div>

                        <div className="bg-[#F5F7FA] p-2 rounded-2xl flex items-center gap-1.5 border border-gray-100">
                          {parseInt(d.rainChance) >= 40 ? (
                            <CloudRain size={16} className="text-blue-500 animate-bounce" />
                          ) : (
                            <CloudSun size={16} className="text-orange-400" />
                          )}
                          <div className="text-left font-sans font-sans">
                            <span className="text-[9px] text-gray-400 block font-sans font-sans font-sans font-sans">降雨機率</span>
                            <span className="text-[10px] font-bold text-[#2A4B7C] block font-sans font-sans">{d.rainChance}</span>
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
          {/* 旅行指南與行李打包分頁 (GUIDE) */}
          {/* ======================================================== */}
          {activeTab === 'guide' && (
            <div className="space-y-5 animate-fade-in font-sans font-sans">
              
              {/* 旅行手冊工具盒頭部 */}
              <div className="bg-gradient-to-br from-[#2A4B7C] to-[#436496] rounded-3xl p-4 text-white shadow-md space-y-2">
                <div className="flex items-center gap-1.5 text-yellow-200">
                  <BookOpen size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider font-sans font-sans">旅行工具箱 ＆ 行前準備</span>
                </div>
                <h3 className="text-base font-bold font-sans">九州自由行・數位隨身錦囊</h3>
                <p className="text-xs text-blue-100 leading-relaxed font-sans">
                  包含行李打包檢查、日本自駕規則、以及住宿資訊！
                </p>
              </div>

              {/* 1. 行李清單管理庫 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center font-sans font-sans font-sans">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <CheckSquare size={14} className="text-[#FF8E99]" />
                    <span>行李打包與準備清單</span>
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
                  {/* Category: 隨身行李 */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-[#2A4B7C] bg-[#EAF2F8] px-2.5 py-1 rounded-lg w-max font-sans font-sans font-sans font-sans">
                      💼 隨身行李 (證件、貴重與隨身物品)
                    </h4>
                    <div className="space-y-1.5 font-sans font-sans">
                      {packingList.personal.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all border border-gray-100 font-sans font-sans font-sans font-sans font-sans font-sans">
                          
                          <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 font-sans font-sans font-sans font-sans font-sans font-sans font-sans">
                            <span onClick={() => toggleItem('personal', item.id)} className="shrink-0 font-sans">
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
                                className="w-full text-xs border border-amber-300 bg-amber-50/50 rounded px-1.5 py-0.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans font-sans font-sans"
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

                          <div className="flex items-center shrink-0">
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

                  {/* Category: 託運行李 */}
                  <div className="space-y-2.5 font-sans font-sans font-sans font-sans">
                    <h4 className="text-xs font-bold text-[#C68D00] bg-yellow-50 px-2.5 py-1 rounded-lg w-max font-sans">
                      🧳 託運行李 (大行李箱與個人裝備)
                    </h4>
                    <div className="space-y-1.5 font-sans">
                      {packingList.checked.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-[#F5F7FA] rounded-xl transition-all border border-gray-100 font-sans font-sans font-sans">
                          
                          <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 font-sans font-sans font-sans font-sans font-sans font-sans">
                            <span onClick={() => toggleItem('checked', item.id)} className="shrink-0 font-sans font-sans font-sans font-sans">
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

                          <div className="flex items-center shrink-0 font-sans">
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
                </div>

                {/* 新增自訂物品表單 */}
                <form onSubmit={handleAddItem} className="pt-3.5 border-t border-gray-100 flex gap-2">
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="text-xs border border-gray-200 rounded-xl px-2.5 bg-gray-50 text-slate-700 focus:outline-none font-sans font-sans font-sans font-sans"
                  >
                    <option value="personal">隨身</option>
                    <option value="checked">託運</option>
                  </select>
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="新增自訂行李或清單項目..."
                    className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none text-slate-700 font-sans"
                  />
                  <button type="submit" className="bg-[#2A4B7C] text-white p-2.5 rounded-xl hover:bg-blue-800 transition-colors font-sans">
                    <Plus size={14} />
                  </button>
                </form>
              </div>

              {/* 住宿確認 ── 已更正為「住宿資訊」 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 font-sans">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <FileText size={14} className="text-emerald-600" />
                  <span>住宿資訊</span>
                </span>
                
                <div className="space-y-2.5 font-sans font-sans">
                  {itinerary.filter(d => d.spots.some(s => s.category === '酒店')).map(d => {
                    const hotelSpot = d.spots.find(s => s.category === '酒店');
                    return (
                      <div key={d.day} className="border border-emerald-100 rounded-2xl p-3 bg-emerald-50/20 flex justify-between items-center">
                        <div className="flex-1 pr-2 min-w-0 font-sans">
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-sans">
                            D{d.day} ({d.date.split(' ')[0]})
                          </span>
                          <h5 className="font-bold text-xs text-slate-800 mt-1 truncate">{hotelSpot.name}</h5>
                          <span className="text-[10px] text-gray-400 block font-bold font-sans">本日訂房花費: ￥{expenses.find(e => e.day === d.day && e.category === '住宿')?.amount?.toLocaleString() || '0'} 日圓</span>
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
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 font-sans">
                  <Info size={14} className="text-blue-500" />
                  <span>自駕安全與 ETC 退稅指引</span>
                </span>
                <ul className="text-xs text-[#5D6D7E] space-y-2 list-disc pl-4 leading-relaxed font-sans font-sans">
                  <li><strong>靠左行駛</strong>：日本方向盤及車道均相反，請隨時提醒自己「靠左慢行」。</li>
                  <li><strong>行人優先</strong>：斑白線前若有行人，請務必完全靜止禮讓。</li>
                  <li><strong>過路費/ETC</strong>：自駕上高速公路建議使用 ETC 卡片，方便進出閘道。</li>
                </ul>
              </div>

            </div>
          )}

        </main>

        {/* BOTTOM FLOATING NAV BAR */}
        <nav className="absolute bottom-3 left-4 right-4 bg-white/80 backdrop-blur-xl rounded-2xl py-2 px-3 shadow-xl border border-white/40 flex justify-around items-center z-40 animate-fade-in font-sans">
          
          <button 
            onClick={() => setActiveTab('itinerary')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all ${
              activeTab === 'itinerary' 
                ? 'text-[#2A4B7C] scale-105 font-bold' 
                : 'text-gray-400 hover:text-slate-600'
            }`}
          >
            <Compass size={16} className={activeTab === 'itinerary' ? 'text-[#FF8E99] animate-pulse' : ''} />
            <span className="text-[8px]">詳細行程</span>
          </button>

          <button 
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all ${
              activeTab === 'expenses' 
                ? 'text-[#2A4B7C] scale-105 font-bold' 
                : 'text-gray-400 hover:text-slate-600'
            }`}
          >
            <FileText size={16} className={activeTab === 'expenses' ? 'text-[#FF8E99]' : ''} />
            <span className="text-[8px]">消費記帳</span>
          </button>

          <button 
            onClick={() => setActiveTab('weather')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all ${
              activeTab === 'weather' 
                ? 'text-[#2A4B7C] scale-105 font-bold' 
                : 'text-gray-400 hover:text-slate-600'
            }`}
          >
            <Map size={16} className={activeTab === 'weather' ? 'text-[#FF8E99]' : ''} />
            <span className="text-[8px]">自駕地圖</span>
          </button>

          <button 
            onClick={() => setActiveTab('guide')}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all ${
              activeTab === 'guide' 
                ? 'text-[#2A4B7C] scale-105 font-bold' 
                : 'text-gray-400 hover:text-slate-600'
            }`}
          >
            <BookOpen size={16} className={activeTab === 'guide' ? 'text-[#FF8E99]' : ''} />
            <span className="text-[8px]">旅行指南</span>
          </button>

        </nav>

        {/* ======================================================== */}
        {/* ✨ 和風行程點「新增 ＆ 編輯」智慧視窗 (Spot Editor Modal UI) */}
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
              <form onSubmit={handleSaveSpotForm} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-700 font-sans font-sans">
                
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

                {/* Google Map 導航按鈕 (新更動優化) */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">🔗 Google Map導航</label>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (!spotForm.name.trim()) {
                          setAlertMessage("請先輸入景點或飯店名稱以自動產生導航連結！");
                          return;
                        }
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(spotForm.name)}`;
                        setSpotForm(prev => ({ ...prev, navUrl: url }));
                        setAlertMessage(`已成功為「${spotForm.name}」設定從您出發時的 Google Map 當下定位導航路線！`);
                      }}
                      className="bg-blue-50 text-[#2A4B7C] hover:bg-blue-100 border border-blue-200 text-[11px] font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <MapPin size={14} className="text-[#FF8E99]" />
                      <span>設定目前位置到此景點的導航按鈕</span>
                    </button>
                    {spotForm.navUrl && spotForm.navUrl.startsWith("https://www.google.com/maps/dir/") && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-fade-in font-sans">
                        <Check size={14} /> 已自動產生導航
                      </span>
                    )}
                  </div>
                </div>

                {/* 景點大類 & 停留時間 (改為雙下拉選單格式) */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1 font-sans font-sans font-sans">分類標籤</label>
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
                    <label className="block text-[10px] text-gray-400 font-bold mb-1">預估停留 (小時)</label>
                    <select
                      value={stayHours}
                      onChange={(e) => setStayHours(parseInt(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl p-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2A4B7C]"
                    >
                      {[...Array(13).keys()].map(h => (
                        <option key={h} value={h}>{h} 小時</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1 font-sans">預估停留 (分鐘)</label>
                    <select
                      value={stayMinutes}
                      onChange={(e) => setStayMinutes(parseInt(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl p-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2A4B7C] font-sans"
                    >
                      <option value={0}>0 分鐘</option>
                      <option value={30}>30 分鐘</option>
                    </select>
                  </div>
                </div>

                {/* 標記特殊標籤 (自選標記 必吃、必拍 與 必買) -> 更名為 景點標籤 */}
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[10px] text-gray-400 font-bold">景點標籤</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const hasTag = spotForm.tags?.includes('必吃');
                        const nextTags = hasTag 
                          ? (spotForm.tags || []).filter(t => t !== '必吃')
                          : [...(spotForm.tags || []), '必吃'];
                        setSpotForm(prev => ({ ...prev, tags: nextTags }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                        spotForm.tags?.includes('必吃')
                          ? 'bg-[#FF8E99]/20 text-[#FF5A6F] border-[#FF8E99]'
                          : 'bg-slate-50 text-slate-500 border-gray-200 hover:bg-slate-100'
                      }`}
                    >
                      🍜 必吃
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const hasTag = spotForm.tags?.includes('必拍');
                        const nextTags = hasTag 
                          ? (spotForm.tags || []).filter(t => t !== '必拍')
                          : [...(spotForm.tags || []), '必拍'];
                        setSpotForm(prev => ({ ...prev, tags: nextTags }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                        spotForm.tags?.includes('必拍')
                          ? 'bg-blue-100 text-blue-600 border-blue-300'
                          : 'bg-slate-50 text-slate-500 border-gray-200 hover:bg-slate-100'
                      }`}
                    >
                      📸 必拍
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const hasTag = spotForm.tags?.includes('必買');
                        const nextTags = hasTag 
                          ? (spotForm.tags || []).filter(t => t !== '必買')
                          : [...(spotForm.tags || []), '必買'];
                        setSpotForm(prev => ({ ...prev, tags: nextTags }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                        spotForm.tags?.includes('必買')
                          ? 'bg-amber-100 text-amber-600 border-amber-300'
                          : 'bg-slate-50 text-slate-500 border-gray-200 hover:bg-slate-100'
                      }`}
                    >
                      🛍️ 必買
                    </button>
                  </div>
                </div>

                {/* 詳細描述 (選填) -> 更名為行程備註 */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">行程備註(選填)</label>
                  <textarea 
                    value={spotForm.desc}
                    onChange={(e) => setSpotForm(prev => ({ ...prev, desc: e.target.value }))}
                    placeholder="請輸入今天這站景點的背景、想吃的美食或自駕預防要點...（選填）"
                    className="w-full h-16 border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none resize-none font-sans"
                  />
                </div>

                {/* 往下一個點的交通方式 (選填) */}
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1 font-sans">🛣 往下一個點的交通方式 (選填)</label>
                  <input 
                    type="text" 
                    value={spotForm.transitNext}
                    onChange={(e) => setSpotForm(prev => ({ ...prev, transitNext: e.target.value }))}
                    placeholder="例：自駕開往御船山樂園"
                    className="w-full border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C] focus:outline-none"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full bg-[#2A4B7C] hover:bg-blue-800 text-white p-3 rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all text-xs"
                >
                  <Check size={14} />
                  <span>儲存變更行程點</span>
                </button>

              </form>
            </div>
          </div>
        )}

        {/* ✨ 客製化聯動刪除與移除警告確認彈窗 (Custom Delete Confirmation Modal) */}
        {deleteConfirmOpen && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-up space-y-4 text-center font-sans">
              <div className="bg-red-50 text-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1 font-sans font-sans">
                <h4 className="font-bold text-base text-slate-800 font-sans">確定刪除景點？</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  您即將從行程中刪除「<span className="font-semibold text-red-500">{deleteTarget.spotName}</span>」。此動作無法復原。
                </p>
                <div className="bg-red-50 text-red-700 text-[11px] p-2.5 rounded-xl border border-red-200/50 font-semibold mt-2 leading-relaxed">
                  ⚠️ 警告：刪除該景點時，該景點底下關聯的所有記帳消費花費，也將一併從消費紀錄頁面中移除！
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteSpot}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-red-500/20"
                >
                  確認刪除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✨ 客製化防空值警告彈窗 (Custom Alert Dialog) */}
        {alertMessage && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans font-sans">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-up space-y-4 text-center font-sans">
              <div className="bg-amber-50 text-amber-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <Info size={24} />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {alertMessage}
              </p>
              <button
                type="button"
                onClick={() => setAlertMessage('')}
                className="w-full py-2.5 bg-[#2A4B7C] hover:bg-blue-800 text-white text-xs font-bold rounded-2xl transition-all shadow-md"
              >
                確 定
              </button>
            </div>
          </div>
        )}

        {/* 返回頂端按鈕 */}
        <button 
          className="fixed bottom-[90px] right-5 bg-emerald-600 hover:bg-[#FF8E99] text-white p-3 rounded-full shadow-2xl z-40 transition-transform hover:scale-105 active:scale-95 animate-fade-in" 
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
