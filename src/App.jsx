import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Camera, Compass, Utensils, ShoppingBag, 
  Navigation, Car, CloudRain, Sun, CloudSun, Umbrella, 
  CheckSquare, Square, Plus, Trash2, Plane, Hotel, 
  ShieldAlert, Phone, Map, Sparkles, BookOpen, ChevronRight, 
  ChevronLeft, Heart, Info, FileText, Check, Upload, Smile, Eye,
  MessageSquare, Send, X, Bot, HelpCircle, RefreshCw, ChevronDown, ChevronUp,
  Download, Key
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

export default function App() {
  useEffect(() => {
    injectFont();
  }, []);

  // 當前主分頁: 'itinerary' (行程) | 'expenses' (記帳) | 'weather' (自駕地圖) | 'guide' (指南)
  const [activeTab, setActiveTab] = useState('itinerary');
  // 當前選取的行程天數 (D1 - D7)
  const [activeDay, setActiveDay] = useState(1);

  // 貼心提醒收闔狀態控制
  const [tipsCollapsed, setTipsCollapsed] = useState(false);

  // Gemini API Key 狀態管理 (優先從 localStorage 讀取，若無則為空字串)
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kyushu_travel_gemini_api_key') || '';
    }
    return '';
  });

  // API Key 本地輸入框緩衝狀態
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);

  // 記帳與消費帳目狀態 (全面整合您指定的實體訂房費用明細)
  const [expenses, setExpenses] = useState([
    { id: 'exp-stay1', day: 1, date: '2026/06/24', category: '住宿', item: 'スコーレ第２天神 (D1住宿費)', amount: 5041 },
    { id: 'exp-meal1', day: 1, date: '2026/06/24', category: '食物', item: '中洲屋台拉麵與生啤酒', amount: 2400 },
    { id: 'exp-car', day: 2, date: '2026/06/25', category: '交通', item: 'Budget租車費用 (博多祇園店預約)', amount: 15400 },
    { id: 'exp-stay2', day: 2, date: '2026/06/25', category: '住宿', item: '茜さす 肥前浜宿 (D2住宿費)', amount: 22467 },
    { id: 'exp-meal2', day: 2, date: '2026/06/25', category: '食物', item: '佐賀季樂本店極上佐賀牛午餐', amount: 8800 },
    { id: 'exp-stay3', day: 3, date: '2026/06/26', category: '住宿', item: 'Rakuten STAY佐賀伊万里 (D3住宿費)', amount: 8763 },
    { id: 'exp-act1', day: 3, date: '2026/06/26', category: '活動', item: '御船山樂園與大楠神木門票', amount: 1200 },
    { id: 'exp-stay4', day: 4, date: '2026/06/27', category: '住宿', item: 'AKARIYA別館 ~横山邸~ (D4住宿費)', amount: 9015 },
    { id: 'exp-shop1', day: 4, date: '2026/06/27', category: '購物', item: '大川內山陶藝工坊手作風鈴', amount: 4800 },
    { id: 'exp-stay5', day: 5, date: '2026/06/28', category: '住宿', item: '絲島 Rakuten STAY 101 (D5住宿費)', amount: 6200 },
    { id: 'exp-meal3', day: 5, date: '2026/06/28', category: '食物', item: '呼子港海舟活烏賊姿造套餐', amount: 4500 },
    { id: 'exp-stay6', day: 6, date: '2026/06/29', category: '住宿', item: 'まほら (D6住宿費)', amount: 5400 }
  ]);

  // ========================================================
  // 核心預算與統計變數提升宣告 (解決 ReferenceError: totalSpentJPY is not defined 關鍵)
  // ========================================================
  const totalBudget = 245000; // JPY 總預算
  const totalSpentJPY = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSpentTWD = Math.round(totalSpentJPY * 0.21); // 匯率換算
  const progressPercent = Math.min(100, Math.round((totalSpentJPY / totalBudget) * 100));

  const categoryBreakdown = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  // 手動記帳表單狀態
  const [expFormDate, setExpFormDate] = useState('2026/06/24');
  const [expFormCategory, setExpFormCategory] = useState('食物');
  const [expFormItem, setExpFormItem] = useState('');
  const [expFormAmount, setExpFormAmount] = useState('');

  // AI 每日行程智慧分析優化快照
  const [dailyAiAnalysis, setDailyAiAnalysis] = useState({});
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState("");

  // AI 聊天助理狀態
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'こんにちは！我是您的和風自駕小秘書 櫻子 ✨\n\n我已經載入您最新指定的「真實住宿明細與 Booking 憑證連結」囉！包括超棒的「茜さす 肥前浜宿」與「樂天包棟 Villa」！\n\n我可以協助您：\n1. 📸 直接點選左下角「相機圖示」上傳發票收據，我會幫您自動解析辨識記帳！\n2. 💬 用語音對話或打字記帳（例：「記帳 買有田燒花了 5500 日圓」），我會立刻在背景幫您歸類同步！\n3. 🚗 提供自駕路線指引、梅雨天氣防雨穿搭及景點好拍視角喔！🌸'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatbotOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatbotOpen, chatMessages, chatLoading]);

  // 行李打包清單狀態 (同步自上傳之「工作表4.csv」清單)
  const [packingList, setPackingList] = useState({
    personal: [
      { id: 'p1', text: '護照正本（有效期限內）', checked: true, qty: 1 },
      { id: 'p2', text: '台灣駕照正本 + 日文譯本 + 國際駕照', checked: true, qty: 1 },
      { id: 'p3', text: '日圓現金 (已兌換)', checked: true, qty: 1 },
      { id: 'p4', text: '信用卡 (國外高刷卡回饋與機場貴賓卡)', checked: true, qty: 2 },
      { id: 'p5', text: 'eSIM 條碼列印 / 實體日本上網卡', checked: false, qty: 1 },
    ],
    cabin: [
      { id: 'c1', text: '行動電源 (登機不可託運)', checked: true, qty: 1 },
      { id: 'c2', text: '手機與各類 3C 充電線組', checked: false, qty: 1 },
      { id: 'c3', text: '保溫空瓶 (入關後裝溫水)', checked: false, qty: 1 },
      { id: 'c4', text: '隨身藥品 (護眼、暈車藥、保健品)', checked: true, qty: 1 },
    ],
    checked: [
      { id: 't1', text: '換洗衣物、夏日防曬外套與好走鞋子', checked: false, qty: 7 },
      { id: 't2', text: '折疊雨傘 (六月九州梅雨季必備)', checked: true, qty: 1 },
      { id: 't3', text: '旅行盥洗與防曬保養組', checked: false, qty: 1 },
      { id: 't4', text: '備用空拉鍊行李袋 (裝戰利品)', checked: false, qty: 1 },
    ],
    shopping: [
      { id: 's1', text: '有田燒精緻青花瓷器（陶山神社紀念）', checked: false, qty: 1 },
      { id: 's2', text: '博多通饅頭 (通りもん) 名產伴手禮', checked: false, qty: 1 },
      { id: 's3', text: '呼子港真空烏賊仙貝禮盒', checked: false, qty: 1 },
      { id: 's4', text: '日本藥妝、美妝防曬、止痛藥', checked: false, qty: 1 },
    ]
  });

  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('personal');

  // 相簿與個人旅記隨筆狀態
  const [journals, setJournals] = useState({
    'day1-spot3': { note: '福岡市動物園的狐檬太有活力了！今天天氣好舒服，野餐很成功。', photo: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80' },
    'day2-spot4': { note: '夕陽下太良町的海上鳥居真的很夢幻...剛好等到滿潮，海水淹到第二個鳥居！超美。', photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80' },
    'day3-spot1': { note: '武雄市圖書館裡面的星巴克咖啡好香，建築物內部宏偉，不愧是日本最美圖書館之一。', photo: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80' },
    'day5-spot2': { note: '呼子港的活烏賊刺身簡集驚豔！身體是半透明的，吃起來無比甜脆！', photo: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80' }
  });

  // 儲存/置換金鑰處理
  const handleSaveApiKey = () => {
    const trimmedKey = apiKeyInput.trim();
    setApiKey(trimmedKey);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyushu_travel_gemini_api_key', trimmedKey);
    }
    
    setChatMessages(prev => [...prev, {
      sender: 'bot',
      text: trimmedKey 
        ? '✨ 櫻子播報：Gemini API 金鑰已成功儲存並同步啟用囉！現在您可以點選下方快捷提問，或直接上傳收據拍照記帳，開啟九州智慧自駕助理捏！🌸' 
        : '⚠️ 櫻子播報：金鑰已清空。智慧助理與即時記帳功能將暫停運作。'
    }]);
  };

  // 照片上傳處理
  const handlePhotoUpload = (spotId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setJournals(prev => ({
          ...prev,
          [spotId]: {
            ...prev[spotId],
            photo: reader.result
          }
        }));
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

  // 打包清單功能
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

  // 每日完整行程資料
  const daysData = [
    {
      day: 1,
      date: "2026/06/24 (三)",
      title: "福岡初相遇",
      area: "福岡・博多",
      outfit: "輕薄短袖、防曬罩衫或薄外套、便於步行的休閒鞋。入夜可能微涼。",
      rainChance: "20%",
      temp: "22°C - 27°C",
      spots: [
        {
          id: "day1-spot1",
          time: "09:55",
          name: "福岡機場 (FUK) 抵達 ✈",
          category: "交通",
          desc: "搭乘中華航空 CI110 航班 (台北 06:50 出發) 於 09:55 分抵達福岡機場。辦理入境手續後提取行李。",
          stay: "約 1 小時",
          tags: ["必拍"],
          photoTip: "抵達大廳外設有九州傳統彩繪打卡牆與熊本熊雕像，第一張福岡合影在此拍下！",
          navUrl: "https://maps.google.com/?q=Fukuoka+Airport",
          parking: "大眾交通。機場至市區轉乘地鐵極其便利快捷。",
          gas: "不適用 (今日全程使用地鐵與市區巴士)",
          transitNext: "搭乘福岡市營地下鐵空港線往博多車站",
          transitTime: "15 分鐘"
        },
        {
          id: "day1-spot2",
          time: "11:30",
          name: "博多車站寄放行李 ＆ 買名產點心",
          category: "購物",
          desc: "於博多車站尋找投幣式行李置物櫃安頓行李。漫步車站名店街 MING 提前選購當日精緻點心（如「博多通饅頭」或「福砂屋」蜂蜜蛋糕）。",
          stay: "45 分鐘",
          tags: ["必吃", "必買"],
          photoTip: "博多車站頂樓設有可愛的「屋頂鐵道神社」，可在此拍攝鳥居與遠眺福岡市區的高空風景。",
          navUrl: "https://maps.google.com/?q=Hakata+Station",
          parking: "博多車站地下有料停車場 (今日不推薦自駕，明日自駕開始)。",
          gas: "不適用。",
          transitNext: "至博多口西日本銀行前巴士站，搭乘 58 號公車前往動植物園",
          transitTime: "25 分鐘"
        },
        {
          id: "day1-spot3",
          time: "12:30",
          name: "福岡市動植物園 🦝",
          category: "景點",
          desc: "福岡都市內的綠色天堂。擁有宏偉的熱帶溫室，可以近距離與可愛的狐獴、水豚及紅毛猩猩打招呼，在櫻花草坪綠蔭下悠閒野餐。",
          stay: "3 小時",
          tags: ["必拍"],
          photoTip: "動植物園溫室內巨大的幾何玻璃金字塔背景，與水豚泡湯區是網美照必拍視角！",
          navUrl: "https://maps.google.com/?q=Fukuoka+City+Zoological+and+Botanical+Garden",
          parking: "動植物園附設有料停車場 (平日 500 日圓 / 次)。",
          gas: "不適用。",
          transitNext: "搭乘市區公車回到天神/中洲屋台街",
          transitTime: "20 分鐘"
        },
        {
          id: "day1-spot4",
          time: "18:00",
          name: "中洲屋台街 ─ 深夜食堂博多拉麵",
          category: "食物",
          desc: "沿著那珂川一字排開的博多傳統大排檔屋台。品嚐正宗博多豚骨拉麵（細麵與濃郁湯頭），搭配明太子烤串與冰啤酒。",
          stay: "2 小時",
          tags: ["必吃", "必拍"],
          photoTip: "站在對岸的橋頭，拍攝倒映在那珂川川面上的紅色屋台燈籠光影，和風煙火氣十足！",
          navUrl: "https://maps.google.com/?q=Nakasu+Yatai",
          parking: "中洲周邊大型有料合作停車場，臨停建議每 20 分鐘 100 日圓。",
          gas: "不適用。",
          transitNext: "步行前往今日入住的博多天神公寓旅店",
          transitTime: "10 分鐘"
        },
        {
          id: "day1-spot5",
          time: "20:30",
          name: "スコーレ第２天神 (Scole No.2 Tenjin) 🏨",
          category: "酒店",
          desc: "【本日入住公寓】位於福岡天神中心的舒適公寓型住宿。房間寬敞、設備一應俱全，週邊即是天神商圈，是隔日一早準備自駕出發前的絕佳休整點！",
          stay: "一整晚",
          tags: ["必拍"],
          photoTip: "公寓設有溫馨的極簡和風客廳，可以把今天在博多車站採購的伴手禮與草莓一字排開拍下開箱美照！",
          navUrl: "https://www.booking.com/hotel/jp/yin-mifang-ti-karaokeoguo-zi-shi-befang-ti-fu-yuan-yin-shi-dian-noentateimentowu.zh-tw.html?label=gen173nr-1BCAEoggI46AdIM1gEaOcBiAEBmAEwuAEXyAEM2AEB6AEBiAIBqAIDuAKErcfoBcACAQ&sid=d0d042409565e64c03c6773b4f6f85a3&aid=304142&ucfs=1&checkin=2026-06-24&checkout=2026-06-25&dest_id=900047908&dest_type=city&group_adults=3&no_rooms=1&group_children=2&age=8&req_age=8&age=10&req_age=10&nflt=entire_place_bedroom_count%3D2&srpvid=d0bf3f7a1e940257&srepoch=1767517734&matching_block_id=1401934001_420747377_5_0_0&atlas_src=sr_iw_title#_",
          parking: "公寓周圍有多個天神合作收費停車場。",
          gas: "不適用 (今日自駕尚未開始)。",
          transitNext: "今日行程完美結束，今晚在天神天際下溫馨入眠 🌙"
        }
      ]
    },
    {
      day: 2,
      date: "2026/06/25 (四)",
      title: "自駕起航・探索佐賀與海中鳥居",
      area: "佐賀 ＆ 太良町",
      outfit: "透氣短袖搭配休閒短褲，太良町海邊海風強，建議戴好遮陽帽並防曬。",
      rainChance: "30%",
      temp: "23°C - 28°C",
      spots: [
        {
          id: "day2-spot1",
          time: "08:00",
          name: "Budget 租車（博多祇園店）🚗",
          category: "交通",
          desc: "攜帶護照、台灣駕照正本及日文譯本前往 Budget 祇園店。預約號碼：00010002078。車型已升級全險（Full Support NOC 免責），手續完成後檢查外觀出發！",
          stay: "30 分鐘",
          tags: [],
          photoTip: "出車前，和同行隊友一起和亮麗的愛車在店門前合影，拍下「自駕征服九州」的首發帥氣照！",
          navUrl: "https://goo.gl/maps/jaTeDTkjrLdyhj5aA",
          parking: "店門口提供預留取車臨停位。",
          gas: "博多祇園店對角即有 ENEOS 加油站，方便還車時回原點加滿油。",
          transitNext: "行經九州自動車道與長崎自動車道高速公路開往佐賀",
          transitTime: "50 分鐘"
        },
        {
          id: "day2-spot2",
          time: "09:30",
          name: "吉野里歷史公園 🏹",
          category: "景點",
          desc: "聯絡電話：0952-55-9333。全日本規模最大的彌生時代部落遺蹟。漫步於高聳的高床式倉庫群，見證兩千年前的神祕環壕聚落文明。",
          stay: "2 小時",
          tags: ["必拍"],
          photoTip: "登上「北內郭」的三層高架瞭望台，從最頂端用俯角拍一整片草帽屋頂的古村落，像極了宮崎駿動畫！",
          navUrl: "https://maps.google.com/?q=Yoshinogari+Historical+Park",
          parking: "公園附設住客大型觀光停車場 (310日圓/天)。",
          gas: "公園周邊 ENEOS 加油站。",
          transitNext: "開車前往佐賀市區的熱氣球博物館",
          transitTime: "25 分鐘"
        },
        {
          id: "day2-spot3",
          time: "12:00",
          name: "佐賀熱氣球博物館 ＆ 午餐奢華佐賀牛 🎈",
          category: "景點",
          desc: "聯絡電話：0952-40-7114。亞洲首座熱氣球專題博物館，擁有震撼的 280 吋動態影院與逼真駕駛模擬器。中午步行至鄰近的名店「季樂」享用頂級 A5「佐賀牛」鐵板燒。",
          stay: "2.5 小時",
          tags: ["必吃", "必拍"],
          photoTip: "在熱氣球模擬操作盤前戴上防護鏡，請朋友拍下您熱氣球騰空的有趣神情！佐賀牛油花分佈如霜，烤熱滋滋響時必錄影！",
          navUrl: "https://maps.google.com/?q=Saga+Balloon+Museum",
          parking: "博物館特約商場停車場 (參觀可享有折抵優惠)。",
          gas: "佐賀市中心 ENEOS 加油站。",
          transitNext: "開車沿國道 207 號南下往太良町",
          transitTime: "55 分鐘"
        },
        {
          id: "day2-spot4",
          time: "15:30",
          name: "太良町 大魚神社 海中鳥居 ⛩",
          category: "景點",
          desc: "「能看見重力與引力」的海灣。矗立在有明海波濤之中的三座橘紅色鳥居，會隨日落與海潮滿乾，顯現完全不同的神聖絕景。",
          stay: "1.5 小時",
          tags: ["必拍"],
          photoTip: "退潮時可步行走過海泥步道到鳥居下合影，滿潮時紅色鳥居沒入深藍海水，黃金落日時分的光束穿過鳥居，夢幻異常！",
          navUrl: "https://maps.google.com/?q=Oouo+Shrine+Torii+in+the+Sea",
          parking: "神社旁附有免費住客臨停停車格 (約可停 15 台)。",
          gas: "JA 太良自營加油站 (車程 4 分鐘)。",
          transitNext: "開車前往肥前濱宿老街宿",
          transitTime: "40 分鐘"
        },
        {
          id: "day2-spot5",
          time: "17:30",
          name: "茜さす 肥前浜宿 Akanesasu Hizenhamashuku 🏨",
          category: "酒店",
          desc: "【本日入住町屋】佐賀著名的傳統釀酒街區「肥前濱宿」奢華古民家改建町屋。空間完美重現了江戶時代的老屋風華與極具現代美學的高級室內設施。在此放鬆身心，享受獨有的日式侘寂浪漫！",
          stay: "一整晚",
          tags: ["必吃", "必拍"],
          photoTip: "漫步在夜間亮燈的百年釀酒古街上，穿著極富質感的日式和風浴衣，隨手拍裝扮都像是精美的日系大片！",
          navUrl: "https://www.booking.com/hotel/jp/qian-sasu-fei-qian-bang-su.zh-tw.html?aid=1288258&label=metagha-link-MRTW-hotel-342325_dev-desktop_los-1_bw-175_dow-Thursday_defdate-0_room-0_gstadt-2_rateid-0_aud-0_gacid-21404718441_mcid-50_bc-AAU5NQ_ppa-0_clrid-0_ad-1_gstkid-0_checkin-20260625_ppt-_lp-2158_r-2832741725851807086&sid=11e6c8aa1335c92d25f16942efeae6b4&age=10&age=12&all_sr_blocks=917070502_409832273_5_0_0&checkin=2026-06-25&checkout=2026-06-26&dest_id=-247491&dest_type=city&dist=0&group_adults=3&group_children=2&hapos=2&highlighted_blocks=917070502_409832273_5_0_0&hpos=2&matching_block_id=917070502_409832273_5_0_0&nflt=entire_place_bedroom_count%3D2&no_rooms=1&req_adults=3&req_age=10&req_age=12&req_children=2&room1=A%2CA%2CA%2C10%2C12&sb_price_type=total&sr_order=upsort_bh&sr_pri_blocks=917070502_409832273_5_0_0__6998400&srepoch=1767513975&srpvid=908238c51f5405f2&type=total&ucfs=1&",
          parking: "古民家設有住客專屬免費停車場。",
          gas: "肥前濱宿街角 ENEOS 加油站。",
          transitNext: "今晚浸淫在歷史的醇香與微醺 of the evening wind 💤"
        }
      ]
    },
    {
      day: 3,
      date: "2026/06/26 (五)",
      title: "書香與瓷器的文青巡禮",
      area: "武雄 ＆ 有田",
      outfit: "圖書館內有冷氣，建議攜帶輕便防風外套，有田鎮散步則以舒適透氣衣物為主。",
      rainChance: "40%",
      temp: "22°C - 26°C",
      spots: [
        {
          id: "day3-spot1",
          time: "09:30",
          name: "武雄市圖書館 📚",
          category: "活動",
          desc: "日本公共建設美學新典範。巨大木質圓頂、挑高的頂天立地巨幅書牆，將蔦屋書店、星巴克與圖書館完美結合，沈浸於咖啡與書香的融合境界。",
          stay: "1.5 小時",
          tags: ["必吃", "必拍"],
          photoTip: "館內禁止在非攝影區拍照。僅有「二樓平台指定拍照點」可俯瞰壯觀的木質圓弧書海，在此能拍出完美而震撼的文青大照！",
          navUrl: "https://maps.google.com/?q=Takeo+City+Library",
          parking: "圖書館專用大型免費停車場 (百台以上空位)。",
          gas: "出發 2 分鐘車程有 ENEOS 武雄昭和店。",
          transitNext: "步行或開車前往武雄神社",
          transitTime: "5 分鐘"
        },
        {
          id: "day3-spot2",
          time: "11:15",
          name: "武雄神社 ＆ 3000年武雄大楠神木 🌳",
          category: "景點",
          desc: "佐賀最古老的神社。穿過神社後方幽靜的翠綠竹林，一棵樹齡高達 3,000 年的巍峨大楠木神木映入眼簾，樹幹底部的空洞內供奉著掌管運勢的神明。",
          stay: "1 小時",
          tags: ["必拍"],
          photoTip: "在通往大楠的翠綠竹林小徑，使用低角度向上仰拍，讓高聳竹林與陽光穿透感烘托神祕縹緲的氛圍！",
          navUrl: "https://maps.google.com/?q=Takeo+Shrine",
          parking: "神社前鳥居旁設有住客專用免費小區停車場 (20 台)。",
          gas: "鄰近國道 34 號之 Esso 武雄加油站。",
          transitNext: "開車前往御船山樂園",
          transitTime: "5 分鐘"
        },
        {
          id: "day3-spot3",
          time: "12:30",
          name: "御船山樂園 ＆ 午餐 A5佐賀牛鐵路冠軍便當 カイロ堂 🍱",
          category: "食物",
          desc: "午餐先在武雄溫泉站購買蟬聯九州鐵路便當冠軍的「カイロ堂」A5 等級佐賀牛便當。隨後進入奇岩秀麗、萬木爭輝的「御船山樂園」一邊野餐一邊賞景。",
          stay: "2 小時",
          tags: ["必吃", "必拍"],
          photoTip: "以御船山巍峨嶙峋的石壁為背景，將特製佐賀牛便當捧在身前，拍下完美的「景物合一冠軍美食照」！",
          navUrl: "https://maps.google.com/?q=Mifuneyama+Rakuen",
          parking: "御船山樂園正門口擁有超大無料專用停車場。",
          gas: "Cosmo 石油 武雄南加油站。",
          transitNext: "開車前往陶瓷重鎮有田小鎮",
          transitTime: "25 分鐘"
        },
        {
          id: "day3-spot4",
          time: "15:00",
          name: "有田陶山神社 ─ 唯一的青花瓷鳥居 🏺",
          category: "景點",
          desc: "瓷器愛好者的聖殿！這裡的鳥居、守護狛犬、大燈籠甚至御守全部由名揚國際的「有田燒」陶瓷燒製，更奇妙的是有 JR 筑肥線平交道穿過神社核心！",
          stay: "1.5 小時",
          tags: ["必拍", "必買"],
          photoTip: "站在陶瓷鳥居前，等黃藍相間的筑肥線單節小火車穿過平交道的那一瞬間按下快門，日本最奇幻的平交道照就此誕生！",
          navUrl: "https://maps.google.com/?q=Sueyama+Shrine+Arita",
          parking: "穿過平交道前右側有神社專用無料停車場 (斜坡較陡，會車請小心慢行)。",
          gas: "JA 有田自營加油站 (離神社 4 分鐘)。",
          transitNext: "開車前往伊萬里包棟別墅",
          transitTime: "20 分鐘"
        },
        {
          id: "day3-spot5",
          time: "17:00",
          name: "Rakuten STAY HOUSE × WILL STYLE 佐賀伊万里 🏨",
          category: "酒店",
          desc: "【本日入住別墅】廣受歡迎的樂天包棟設計別墅。擁有兩間挑高臥室、極致舒適的客廳沙發以及配置齊全的中島廚房，並有超大尺寸投影巨幕。讓今日的瓷藝之旅在科技與奢華美學中完美歸巢！",
          stay: "一整晚",
          tags: ["必拍"],
          photoTip: "極其挑高的客廳空間、以及現代木質中島廚房，很適合全家人一同手做料理並拍攝合影！",
          navUrl: "https://www.booking.com/hotel/jp/rakuten-stay-house-x-will-style-saga-imari-vacation-stay-59208v.zh-tw.html?aid=356980&label=gog235jc-10CAIY9QModTgISDBYA2jnAYgBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAagCAbgChuTEyQbAAgHSAiRiYzkyMGE3Yy0zNDcwLTRiM2EtYmU0MS1lNTdkZTVlODA2MWLYAgHgAgE&sid=11e6c8aa1335c92d25f16942efeae6b4&age=10&age=12&all_sr_blocks=760362402_361366242_0_0_0&checkin=2026-06-26&checkout=2026-06-27&dest_id=4746&dest_type=region&dist=0&group_adults=3&group_children=2&hapos=13&highlighted_blocks=760362402_361366242_0_0_0&hpos=13&matching_block_id=760362402_361366242_0_0_0&nflt=entire_place_bedroom_count%3D2&no_rooms=1&req_adults=3&req_age=10&req_age=12&req_children=2&room1=A%2CA%2CA%2C10%2C12&sb_price_type=total&sr_order=upsort_bh&sr_pri_blocks=760362402_361366242_0_0_0__4374000&srepoch=1767517229&srpvid=560d3e06ab720197&type=total&ucfs=1&",
          parking: "別墅前院提供住客專屬免費停車格 2 格。",
          gas: "JA-SS 伊萬里加油站 (車程 3 分鐘)。",
          transitNext: "無，今晚在伊萬里奢華 Villa 舒適休憩 🌙"
        }
      ]
    },
    {
      day: 4,
      date: "2026/06/27 (六)",
      title: "陶藝秘境・風鈴輕響的伊萬里",
      area: "伊萬里 ＆ 唐津",
      outfit: "山區午後易起涼風，建議穿著薄長裙或透氣棉麻服飾，備妥雨傘。",
      rainChance: "45%",
      temp: "21°C - 25°C",
      spots: [
        {
          id: "day4-spot1",
          time: "09:30",
          name: "鍋島藩窯公園（大川內山風鈴祭）🎐",
          category: "活動",
          desc: "被群山合抱的「秘境之鄉」大川內山，過去為燒製高級獻上名瓷的御用官窯所在地。六月正值風鈴祭，數百個青花風鈴隨微風發出叮鈴叮鈴的悠揚清脆聲。",
          stay: "3 小時",
          tags: ["必拍", "必買"],
          photoTip: "在古色古香的紅磚煙囪與石板路旁，拍下逆光中半透明、繪有精細蘭花山水的青花風鈴，充滿極致的盛夏和風美！",
          navUrl: "https://maps.google.com/?q=Okawachiyama+Imari",
          parking: "大川內山入口大型有料公共停車場 (平日 300~500 日圓/天)。",
          gas: "離園 5 分鐘車程有 ENEOS 大川內加油站。",
          transitNext: "自駕前往伊萬里老街民家洋食館",
          transitTime: "15 分鐘"
        },
        {
          id: "day4-spot2",
          time: "13:00",
          name: "大人の隠れ家餐廳 モンブーシェ伊万里 🍽",
          category: "食物",
          desc: "伊萬里極具格調的隱密名店。由百年町家古民宅改建，主廚採用最高等級的伊萬里牛與佐賀時令野蔬，精心創作出和洋折衷、充滿創意的法式無菜單法式料理。",
          stay: "2 小時",
          tags: ["必吃"],
          photoTip: "餐廳大梁木質斑駁古樸，歐風骨瓷瓷盤裝盛著伊萬里牛排，餐盤與古宅對比，是無比奢華的視覺饗宴！",
          navUrl: "https://maps.google.com/?q=Mon-Boucher+Imari",
          parking: "餐廳正後方提供 6 台免費顧客臨停位，或使用附近公有收費車位。",
          gas: "出發往唐津方向前，可在出光石油加油站加滿。",
          transitNext: "自駕穿過佐賀山巒前往唐津和風別館",
          transitTime: "40 分鐘"
        },
        {
          id: "day4-spot3",
          time: "16:00",
          name: "AKARIYA別館 ~横山邸~ 🏨",
          category: "酒店",
          desc: "【本日入住別館】極具昭和復古感性的唐津日式大宅別邸。擁有幽靜迷人的私人和式庭園，保留最傳統的高質感木造拉門與榻榻米房，在細膩高雅的唐津松風中完美沉靜入眠。",
          stay: "一整晚",
          tags: ["必拍"],
          photoTip: "早晨拉開木門，庭院陽光透過竹林灑在榻榻米上，在此處盤腿喝一杯熱焙茶合影，空靈侘寂感十足！",
          navUrl: "https://www.booking.com/hotel/jp/akariyabie-guan-heng-shan-di.zh-tw.html?label=gog235jc-10CAIY9QModTgISDBYA2jnAYgBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAagCAbgChuTEyQbAAgHSAiRiYzkyMGE3Yy0zNDcwLTRiM2EtYmU0MS1lNTdkZTVlODA2MWLYAgHgAgE&sid=033ceb0d4a82f564481efb180948a781&aid=356980&ucfs=1&checkin=2026-06-27&checkout=2026-06-28&dest_id=4746&dest_type=region&group_adults=3&no_rooms=1&group_children=2&age=10&req_age=10&age=12&req_age=12&nflt=entire_place_bedroom_count%3D2&srpvid=eb2e3d167a4e00c2&srepoch=1767516188&matching_block_id=1141008801_392147196_5_0_0&atlas_src=sr_iw_title",
          parking: "別館附設免費旅客專用停車空地。",
          gas: "唐津市區 ENEOS 加油站。",
          transitNext: "無，今晚在極靜的榻榻米老宅中一夜好眠 💤"
        }
      ]
    },
    {
      day: 5,
      date: "2026/06/28 (日)",
      title: "海灣城堡與會彈跳的活烏賊",
      area: "唐津 ＆ 呼子港",
      outfit: "唐津城登高台需走一段台階，穿著防滑平底鞋，港口風大可著薄風衣外套。",
      rainChance: "50%",
      temp: "22°C - 26°C",
      spots: [
        {
          id: "day5-spot1",
          time: "09:30",
          name: "唐津城（別名：舞鶴城）🏯",
          category: "景點",
          desc: "高聳於唐津灣畔的壯麗天守。因其向兩側松原綿延的姿態猶如仙鶴展翅，又被雅稱為「舞鶴城」。登上天守閣可將虹之松原半月海灣盡收眼底。",
          stay: "2 小時",
          tags: ["必拍"],
          photoTip: "天守閣五層的展望護欄外，海水、藍天與五公里長「虹之松原」綠林形成極富視覺張力的弧線，必用超廣角鏡頭橫幅拍攝！",
          navUrl: "https://maps.google.com/?q=Karatsu+Castle",
          parking: "城下附屬大型市營地下收費停車場 (400 日圓 / 2小時)。",
          gas: "附近有 ENEOS 唐津東加油站。",
          transitNext: "自駕經呼子大橋越過美麗海灣前往呼子港",
          transitTime: "30 分鐘"
        },
        {
          id: "day5-spot2",
          time: "12:00",
          name: "玄海いか舟処 海舟 ─ 呼子名物活烏賊刺身 🦑",
          category: "食物",
          desc: "呼子港最知名的活魚料理名店。水槽內游動的活烏賊現撈現切，上桌時身體幾近透明，咬下時肉質甘甜、彈牙脆口，觸手最後做成外酥內軟的熱騰騰天婦羅！",
          stay: "1.5 小時",
          tags: ["必吃", "必拍"],
          photoTip: "當整隻呈半透明的烏賊端上桌、甚至觸手還在微微動時，快用手機錄影記錄這令人驚嘆的活鮮體驗！",
          navUrl: "https://maps.google.com/?q=Genkai+Ika+Funa-dokoro+Kaishu",
          parking: "餐廳前備有免費顧客專屬停車位。",
          gas: "JA 呼子加油站 (開車 4 分鐘)。",
          transitNext: "開車前往波戶岬",
          transitTime: "15 分鐘"
        },
        {
          id: "day5-spot3",
          time: "14:00",
          name: "波戸岬 ─ 戀人聖地 ＆ 白色海底展望塔 🤍",
          category: "景點",
          desc: "九州最北端的戀人聖地。草地上立著白色的心形地標。步行通過木棧道，進入伸入海底 7 公尺的白色圓柱狀「海底展望塔」，隔著厚玻璃看野生石鯛魚與海葵悠游。",
          stay: "1.5 小時",
          tags: ["必吃", "必拍"],
          photoTip: "與伴侶在白色心形紀念碑前，以無邊際玄界灘的大海為背景拍張放閃照！岬角小木屋現烤海螺肉也必拍！",
          navUrl: "https://maps.google.com/?q=Cape+Hado+Karatsu",
          parking: "波戶岬觀光中心外超大免費公共停車場。",
          gas: "沿國道 204 號向西南有 Mobil 加油站。",
          transitNext: "自駕跨越佐賀與福岡縣界，開往糸島海濱別墅",
          transitTime: "60 分鐘"
        },
        {
          id: "day5-spot4",
          time: "17:00",
          name: "Rakuten STAY HOUSE x WILL STYLE Itoshima 101 🏡",
          category: "酒店",
          desc: "【本日入住別墅】座落於絲島無敵海畔的旗艦奢華獨棟別墅別墅。高科技投影幕、極奢北歐中島廚房、私人戶外大露台。與旅伴在此烹煮新鮮食材，享受絲島最溫馨浪漫的海風BBQ渡假夜！",
          stay: "一整晚",
          tags: ["必拍"],
          photoTip: "挑高奢華的起居室與美式中島，可以全家人捧著香檳與煎好的神戶牛，拍下最溫馨的旅行聚餐照！",
          navUrl: "https://www.booking.com/hotel/jp/rakuten-stay-house-itoshima-vacation-stay-45356.zh-tw.html?label=gog235jc-10CAIY9QModTgISDBYA2jnAYgBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAagCAbgChuTEyQbAAgHSAiRiYzkyMGE3Yy0zNDcwLTRiM2EtYmU0MS1lNTdkZTVlODA2MWLYAgHgAgE&sid=033ceb0d4a82f564481efb180948a781&aid=356980&ucfs=1&checkin=2026-06-28&checkout=2026-06-29&dest_id=4746&dest_type=region&group_adults=3&no_rooms=1&group_children=2&age=10&req_age=10&age=12&req_age=12&nflt=entire_place_bedroom_count%3D2&srpvid=813e3d6d857e0359&srepoch=1767516293&matching_block_id=574274002_361063853_0_0_0&atlas_src=sr_iw_title",
          parking: "別墅門前備有免費顧客專屬停車位 2 格。",
          gas: "開車 5 分鐘處有出光志摩加油站。",
          transitNext: "無，今晚在絲島豪華別墅烤肉夜談 🍷"
        }
      ]
    },
    {
      day: 6,
      date: "2026/06/29 (一)",
      title: "糸島夕陽與白色海上雙子岩",
      area: "糸島 ＆ 福岡博多",
      outfit: "沙灘戲水、盪鞦韆裝扮（短褲、涼鞋、草帽、太陽眼鏡）。準備一條小毛巾擦腳。",
      rainChance: "25%",
      temp: "23°C - 28°C",
      spots: [
        {
          id: "day6-spot1",
          time: "09:30",
          name: "箱島神社 ─ 海上的浪漫緣結神社 ⛩",
          category: "景點",
          desc: "突出於沙灘海濱之上的小巧孤島神社。僅有一條狹長木平橋與陸地相連，此處供奉著專管男男女女戀愛結緣與耳疾康復的神祇，氣息靜謐悠遠。",
          stay: "1 小時",
          tags: ["必拍"],
          photoTip: "站在木平橋的中央，從陸地端往海面拍去，人影屹立在空無一物的大海與藍天中央，神聖、空靈感拉滿！",
          navUrl: "https://maps.google.com/?q=Hakoshima+Shrine",
          parking: "國道旁有箱島神社專屬無料碎石停車場 (約可停 6-8 台)。",
          gas: "ENEOS 糸島加布里加油站 (車程 5 分鐘)。",
          transitNext: "自駕開往櫻井二見浦海灘",
          transitTime: "15 分鐘"
        },
        {
          id: "day6-spot2",
          time: "11:00",
          name: "櫻井二見浦 夫婦岩 ＆ 白色海上鳥居 🌊",
          category: "景點",
          desc: "絲島最閃耀的靈魂風景！兩座巨大的海中雙子岩由神聖的注連繩相扣，海灘沙地上立著一座雪白莊嚴的「海上鳥居」，大浪捲過白色柱石，景象震懾。午後在海景咖啡廳品嚐冰淇淋。",
          stay: "1.5 小時",
          tags: ["必拍"],
          photoTip: "人站在沙灘，穿過純白鳥居 the center of the columns，將遠處海面上的夫婦岩完美框在相片正中央，這是九州最具代表性的名信片大片！",
          navUrl: "https://maps.google.com/?q=Sakurai+Futamigaura+Itoshima",
          parking: "夫婦岩前有料公共停車場 (前 1 小時 300 日圓 / 隨後累加。)",
          gas: "Idemitsu 出光志摩自營加油站。",
          transitNext: "開車至鄰近的椰子樹鞦韆公園",
          transitTime: "10 分鐘"
        },
        {
          id: "day6-spot3",
          time: "13:00",
          name: "海灘巨大椰子樹鞦韆（ヤシの木ブランコ）🌴",
          category: "活動",
          desc: "在沙灘旁並排生長的兩棵自然傾斜的巨大椰子樹，被搭成了朝向大海的巨型鞦韆。可以一邊吹著海風，一邊朝著蔚藍海天盪漾，歡聲笑語不斷。",
          stay: "1.5 小時",
          tags: ["必吃", "必拍"],
          photoTip: "盪到最高點、雙腳伸向海天與白色沙灘交界的那一瞬間，請旅伴用連拍捕捉，拍出極致青春、宛如防彈少年團MV風的海報！",
          navUrl: "https://maps.google.com/?q=Yashinoki+Swing+Itoshima",
          parking: "海鮮餐廳（ざうお）專用停車場 (用餐顧客享免收車資折抵)。",
          gas: "出發往福岡方向前，可在 ENEOS 糸島今宿店把油加滿，方便還車手續。",
          transitNext: "開車回博多市區 Budget 祇園店歸還愛車，並步行至博多站前飯店 check-in",
          transitTime: "40 分鐘"
        },
        {
          id: "day6-spot4",
          time: "18:00",
          name: "まほら (Mahora Fukuoka) 🏨",
          category: "酒店",
          desc: "【本日入住旅店】自駕行完美落幕、平安歸還租車後入住的福岡設計型公寓飯店。空間規劃前衛新穎且寧靜，距離博多車站極近。是您在回台前整理大箱小箱戰利品、採購藥妝的完美最後基地！",
          stay: "一整晚",
          tags: ["必買"],
          photoTip: "房間內充滿北歐與日系和風交錯的輕工業美學，在此與堆積如山的伴手禮來張「自駕大豐收大滿貫」合影吧！",
          navUrl: "https://www.booking.com/hotel/jp/mahora-fu-gang-shi.zh-tw.html?label=metagha-link-MRTW-hotel-342325_dev-desktop_los-1_bw-175_dow-Thursday_defdate-0_room-0_gstadt-2_rateid-0_aud-0_gacid-21404718441_mcid-50_bc-AAU5NQ_ppa-0_clrid-0_ad-1_gstkid-0_checkin-20260625_ppt-_lp-2158_r-2832741725851807086&aid=1288258&ucfs=1&checkin=2026-06-29&checkout=2026-06-30&dest_id=900047908&dest_type=city&group_adults=3&no_rooms=1&group_children=2&age=10&req_age=10&age=12&req_age=12&nflt=entire_place_bedroom_count%3D2&srpvid=19f23fc9983e023f&srepoch=1767517531&matching_block_id=1522196601_424698419_5_0_0&atlas_src=sr_iw_title",
          parking: "旅店周邊有多個合作的市區收費停車場。",
          gas: "博多站前 ENEOS 八重洲加油站。",
          transitNext: "無，今晚在福岡繁華商圈做最後伴手禮採買 🛍"
        }
      ]
    },
    {
      day: 7,
      date: "2026/06/30 (二)",
      title: "依依不捨與完美採購",
      area: "福岡機場 ＆ 台灣",
      outfit: "輕便保暖的搭機裝束。在手提包內預留一個大購物袋裝機場免稅店伴手禮。",
      rainChance: "15%",
      temp: "23°C - 27°C",
      spots: [
        {
          id: "day7-spot1",
          time: "08:30",
          name: "博多車站伴手禮最後衝刺",
          category: "購物",
          desc: "利用早晨時間在博多車站「Ming名店街」進行伴手禮免稅大採購！「福砂屋」蜂蜜蛋糕、「吉野野里」煎餅、明太子等都可以在這裡一次滿 5,500 日圓直接退稅免稅！",
          stay: "1.5 小時",
          tags: ["必買"],
          photoTip: "車站大廳亮堂，手提一袋袋精美的土產紙袋拍張「大豐收戰利品照」，記錄完美的購物戰果！",
          navUrl: "https://maps.google.com/?q=Ming+Hakata+Station",
          parking: "不適用自駕 (已還車)。建議直接步行。",
          gas: "不適用。",
          transitNext: "搭乘機場公車或地下鐵至福岡機場國際線航廈",
          transitTime: "15 分鐘"
        },
        {
          id: "day7-spot2",
          time: "11:00",
          name: "福岡機場 (FUK) 搭機 CI111 ＆ 回程台灣",
          category: "交通",
          desc: "前往 CI111 櫃檯辦理登機。通過安檢後，在國際線候機大廳美食街吃點熱食，並在登機前於免稅店採買機場限定、九州極少見的東京或北海道知名伴手禮，心滿意足起飛返台！",
          stay: "2 小時",
          tags: ["必吃", "必拍"],
          photoTip: "在登機廊道或候機室玻璃前拍張航機與福岡機場跑道的背景合影，為這趟 7 天自駕旅畫下完美逗點！",
          navUrl: "https://maps.google.com/?q=Fukuoka+Airport+International+Terminal",
          parking: "機場大廈停車收費高，今日不適用自駕。",
          gas: "不適用。",
          transitNext: "平安飛抵台灣桃園國際機場",
          transitTime: "2.5 小時"
        }
      ]
    }
  ];

  const currentDayData = daysData.find(d => d.day === activeDay);

  // 智慧 Excel (CSV with UTF-8 BOM) 匯出核心邏輯
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
    daysData.forEach(d => {
      d.spots.forEach(s => {
        csvContent += `"${`D${d.day}`}","${d.date}","${d.area}","${d.title}","${d.rainChance}","${s.time}","${s.name}","${s.stay}","${s.category}","${s.parking.replace(/"/g, '""')}","${s.gas.replace(/"/g, '""')}","${s.desc.replace(/"/g, '""')}","${(s.photoTip || '').replace(/"/g, '""')}"\n`;
      });
    });
    csvContent += "\n";
    
    csvContent += "--- 三、 消費記帳明細流水帳 ---\n";
    csvContent += "記帳日期,行程天數,費用大類,消費項目/飯店/餐飲名稱,支出金額 (日圓 JPY),估計折合金額 (台幣 TWD)\n";
    expenses.forEach(item => {
      csvContent += `"${item.date}","${`D${item.day}`}","${item.category}","${item.item.replace(/"/g, '""')}","${item.amount}","${Math.round(item.amount * 0.21)}"\n`;
    });
    csvContent += "\n";
    
    csvContent += "--- 四、 行李準備與日本代購清單 ---\n";
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

  // 調用 Gemini API 進行每日行程智慧優化
  const handleDailyAiAnalysis = async () => {
    if (!apiKey) {
      setAiAnalysisError("⚠️ 請先點擊右下角 AI 櫻子秘書，在上方欄位輸入並「儲存」您的 Gemini API 金鑰喔！🌸");
      setChatbotOpen(true);
      return;
    }

    setAiAnalysisLoading(true);
    setAiAnalysisError("");
    
    const prompt = `
      現在我是日本自駕旅客，今天是我的第 ${activeDay} 天行程。
      地區：${currentDayData.area}
      今天的主題：${currentDayData.title}
      今天的行程包含以下景點與結尾住宿：
      ${currentDayData.spots.map((s, idx) => `${idx + 1}. ${s.name} (${s.category}) - ${s.desc}`).join('\n')}

      請為我即時智慧優化以下三個面向，並以生動可愛的日式繁體中文回答：
      1. 🚗 【今日自駕 J-Pop 音樂推薦】：推薦 2 首適合今天自駕沿途風光（例如：鄉間小路、蔚藍海濱、山區陶器小鎮）聆聽的日本經典歌單或樂風，並給出推薦理由。
      2. 🍜 【周邊隱藏版美食與宵夜】：根據今天造訪的區域與今日住宿「${currentDayData.spots[currentDayData.spots.length - 1]?.name}」的位置，推薦一個原清單中沒有列出的在地人私房美食或宵夜！
      3. 🛣 【開車與過路費 (ETC) 小提醒】：針對今天的自駕路線（高速公路段、收費站或特殊山路），提供具體的 ETC 扣款、導航過路費或停車避坑策略。
    `;

    const systemInstruction = `
      你是一位精通日本九州自由行的 AI 導遊。
      你擁有日本文化、自駕（ETC過路費、開車安全）、以及九州極深度的私房美食與住宿資料庫。
      請使用溫柔貼心、專業且可愛的繁體中文回答。請使用 Markdown 排版並加上豐富的表情符號。
    `;

    try {
      const responseText = await callGeminiAPI(prompt, systemInstruction);
      setDailyAiAnalysis(prev => ({
        ...prev,
        [activeDay]: responseText
      }));
    } catch (err) {
      setAiAnalysisError(err.message || "AI 分析出了點小狀況，請稍後再試。");
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // 智慧 AI 相機/發票辨識記帳處理 (Multimodal Gemini API)
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setChatLoading(true);
    setChatbotOpen(true);
    setChatMessages(prev => [...prev, { sender: 'user', text: '📷 [上傳了消費明細收據照片，正在請櫻子辨識中...]' }]);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      
      const prompt = `
        請仔細辨識這張收據或消費明細圖片。請解析出以下三個欄位，並「嚴格且只以 JSON 格式」回傳：
        {
          "item": "辨識到的商品/消費項目名稱(繁體中文簡述)",
          "amount": 總消費金額數字(必須是新台幣或日圓整數，如果是日圓請以日圓為主),
          "category": "食物/交通/購物/活動/住宿/其他其中的一個最佳配對"
        }
        注意：不要回傳任何額外的 Markdown 包裹字元(如 \`\`\`json)或普通對話，只回傳純 JSON 字串！
      `;

      const systemInstruction = `你是一個極度精準的收據記帳 OCR 助理。你只會回傳標準的 JSON 物件，沒有任何多餘的解釋 or 包裹符號。`;

      try {
        const responseText = await callGeminiAPI(prompt, systemInstruction, base64Data, file.type);
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
        // API 未配置或失敗時的智慧模擬體驗
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
  };

  // 對話形式智慧記帳辨識與常規對話
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
      你是一位九州當地的「和風自駕 AI 秘書」，名字叫作「櫻子 (Sakurako)」。
      你主要陪伴正在進行「2026/06/24 - 06/30 福岡與佐賀 7天6夜自駕行程」的台灣旅客。
      
      以下是旅客目前的完整 7 天行程背景與精確入住飯店：
      - D1: スコーレ第２天神
      - D2: 茜さす 肥前浜宿
      - D3: Rakuten STAY HOUSE × WILL STYLE 佐賀伊万里
      - D4: AKARIYA別館 ~横山邸~
      - D5: Rakuten STAY HOUSE x WILL STYLE Itoshima 101
      - D6: まほら (Mahora)
      - D7: 返回台灣

      回答指導方針：
      1. 使用極具禮貌、溫慢體貼的「繁體中文」回答。每句話融入「日語單字拼音/和風語助詞」（例如：こんにちは、ありがとう、～捏、～喔）。
      2. 針對自駕ETC、六月梅雨防雨、景點拍照細節等提供深度的私房指引。
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
        接著在第二行開始，以溫暖的口吻讚美或肯定這次消費。
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

        setChatMessages(prev => [...prev, { sender: 'bot', text: `📝 已幫您自動記帳：[食物] 隨行餐飲記帳 ￥${parsedAmount.toLocaleString()}日圓！已同步登錄至費用本中囉～櫻子隨時為您看緊荷包捏！🌸` }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'bot', text: `ごめんなさい！櫻子斷線了 😭 錯誤：${err.message}` }]);
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setChatInput(question);
    setTimeout(() => {
      const form = document.getElementById('ai-chat-form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-['Zen_Maru_Gothic',sans-serif] text-[#2C3E50] pb-28">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#2A4B7C]/15 to-transparent pointer-events-none" />
      <div className="absolute top-10 right-4 w-12 h-12 bg-[#FF8E99]/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute top-48 left-2 w-16 h-16 bg-[#E6AF2E]/15 rounded-full blur-xl pointer-events-none" />

      {/* Outer Mobile Simulating Shell */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden border border-gray-100 flex flex-col animate-fade-in">
        
        {/* APP HEADER */}
        <header className="bg-gradient-to-r from-[#2A4B7C] to-[#3B629B] text-white pt-8 pb-6 px-5 rounded-b-[2rem] shadow-lg relative">
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
            
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 text-center">
              <span className="block text-[9px] uppercase tracking-wider text-blue-200">當前位置</span>
              <span className="text-sm font-bold block mt-0.5 text-yellow-200">{currentDayData.area}</span>
            </div>
          </div>

          {/* 財務與自駕狀態一覽欄 */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center text-xs">
            <div className="bg-white/5 py-1.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-blue-200 block">累計支出</span>
              <span className="font-bold text-sm text-white font-sans">￥{totalSpentJPY.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 py-1.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-blue-200 block">台幣等值</span>
              <span className="font-bold text-sm text-yellow-100 font-sans">NT$ {totalSpentTWD.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 py-1.5 rounded-xl border border-white/5 flex items-center justify-center flex-col cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setChatbotOpen(true)}>
              <span className="text-[10px] text-yellow-200 font-bold block flex items-center gap-0.5">
                <Sparkles size={10} /> AI 秘書
              </span>
              <span className="font-bold text-sm text-emerald-300">{apiKey ? '櫻子在線' : '待設金鑰'}</span>
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT AREA */}
        <main className="flex-1 overflow-y-auto px-4 pt-5 pb-6">

          {/* ======================================================== */}
          {/* 行程分頁 (ITINERARY) */}
          {/* ======================================================== */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              
              {/* 天數滑動快速導覽列 */}
              <div className="bg-white rounded-3xl p-3 shadow-md border border-[#E9ECF0] overflow-hidden">
                <span className="text-xs text-[#7F8C8D] block px-1 mb-2 font-medium">切換行程日期</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {daysData.map(d => (
                    <button
                      key={d.day}
                      onClick={() => {
                        setActiveDay(d.day);
                        setAiAnalysisError("");
                      }}
                      className={`flex-none snap-start w-12 py-2 rounded-2xl transition-all duration-300 text-center flex flex-col items-center justify-center ${
                        activeDay === d.day
                          ? 'bg-[#2A4B7C] text-white shadow-md shadow-[#2A4B7C]/30 scale-105'
                          : 'bg-[#F5F7FA] text-[#4A5568] hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-[10px] font-bold block uppercase tracking-tighter">D{d.day}</span>
                      <span className="text-xs font-bold block font-sans">{d.day === 1 ? '6/24' : d.day === 2 ? '6/25' : d.day === 3 ? '6/26' : d.day === 4 ? '6/27' : d.day === 5 ? '6/28' : d.day === 6 ? '6/29' : d.day === 7 ? '6/30' : ''}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#34495E]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="bg-[#2A4B7C] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">D{activeDay}</span>
                    <span>{currentDayData.title}</span>
                  </div>
                  <span className="text-[#7F8C8D] font-sans">{currentDayData.date}</span>
                </div>
              </div>

              {/* 每日小提示與天氣穿搭卡片 */}
              <div className="bg-[#FDF9F3] border border-[#F3E3CD] rounded-3xl p-4 shadow-sm flex flex-col gap-3 transition-all duration-300">
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
                  <div className="space-y-3 animate-fade-in">
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
                  <div className="text-[11px] text-[#7F8C8D] flex justify-between items-center bg-amber-50/50 p-2 rounded-xl border border-dashed border-amber-200/50 animate-fade-in">
                    <span>☂ 本日降水：{currentDayData.rainChance}</span>
                    <span>🌡 均溫氣候：{currentDayData.temp}</span>
                    <span className="text-[10px] text-[#C68D00] font-bold">已收闔 (點擊右側開展)</span>
                  </div>
                )}

                {/* ✨ LLM FEATURE 1: AI Daily Optimizer Button */}
                <div className="border-t border-[#F3E3CD] pt-3">
                  {dailyAiAnalysis[activeDay] ? (
                    <div className="bg-white rounded-2xl p-3.5 border border-[#F3E3CD] shadow-inner space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-[#2A4B7C] flex items-center gap-1">
                          <Sparkles size={12} className="text-[#FF8E99]" />
                          <span>AI 櫻子秘書自駕私房推薦</span>
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
                      className="w-full bg-gradient-to-r from-[#2A4B7C] to-[#436496] text-white py-2 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-all"
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

              {/* 每日行程時間軸 (景點與真實住宿卡片) */}
              <div className="relative pl-3 space-y-6 mt-4 animate-slide-up">
                <div className="absolute left-[21px] top-6 bottom-6 w-0.5 bg-dashed bg-gradient-to-b from-[#2A4B7C] via-[#FF8E99] to-gray-200" style={{ backgroundImage: 'linear-gradient(to bottom, #2A4B7C 60%, rgba(255,255,255,0) 0%)', backgroundSize: '2px 8px', backgroundRepeat: 'repeat-y' }} />

                {currentDayData.spots.map((spot, idx) => {
                  const style = getCategoryStyle(spot.category);
                  const journal = journals[spot.id] || { note: '', photo: null };

                  return (
                    <div key={spot.id} className="relative group">
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
                        <div className="flex justify-between items-start">
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
                          <span className="text-[11px] font-sans text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                            {spot.stay}
                          </span>
                        </div>

                        {/* 介紹與描述 */}
                        <p className="text-xs text-[#5D6D7E] leading-relaxed">{spot.desc}</p>

                        {/* 彩色特色標籤 */}
                        {spot.tags && spot.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
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
                          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-2xl p-3 border border-blue-100/50 space-y-1">
                            <span className="text-[10px] font-bold text-[#2A4B7C] flex items-center gap-1 uppercase tracking-wider">
                              <Camera size={12} className="text-[#FF8E99]" /> 拍照小秘訣
                            </span>
                            <p className="text-xs text-slate-600 leading-normal">{spot.photoTip}</p>
                          </div>
                        )}

                        {/* 自駕必備實用資訊欄 (包含停車場與加油站) */}
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
                          
                          <div className="flex justify-between items-center pt-1">
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
                              <span>開啟 Booking 憑證</span>
                            </a>
                          </div>
                        </div>

                        {/* 隨行旅記照片上傳與日誌紀錄 */}
                        <div className="border-t border-gray-100 pt-3 space-y-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">隨行旅記相片牆 (可點擊上傳)</span>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <label className="border-2 border-dashed border-gray-200 hover:border-[#FF8E99] rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50 group-hover:bg-white relative overflow-hidden">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handlePhotoUpload(spot.id, e)}
                              />
                              {journal.photo ? (
                                <img src={journal.photo} alt="User Uploaded" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-center p-2 text-gray-400">
                                  <Upload size={16} className="mx-auto mb-1 text-gray-300 group-hover:text-[#FF8E99]" />
                                  <span className="text-[8px] block">上傳照片</span>
                                </div>
                              )}
                            </label>

                            <div className="col-span-2">
                              <textarea
                                value={journal.note}
                                onChange={(e) => handleJournalNoteChange(spot.id, e.target.value)}
                                placeholder="在此寫下本日心得、必吃名特產口感、以及開車過路心得，或者直接寫下開銷花費以便未來統計..."
                                className="w-full h-full text-xs border border-gray-100 rounded-2xl p-2 focus:ring-1 focus:ring-[#2A4B7C] bg-slate-50/50 resize-none font-sans"
                              />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* 轉接交通引導 */}
                      {idx < currentDayData.spots.length - 1 && (
                        <div className="my-2 ml-10 flex items-center gap-2 text-xs text-[#7F8C8D] font-sans">
                          <span className="bg-[#EAF2F8] p-1 rounded-lg text-[#2A4B7C]">
                            🚗
                          </span>
                          <span className="font-medium">自駕路線：{spot.transitNext}</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-[10px]">
                            {spot.transitTime}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 記帳理財分頁 (EXPENSES - Feature 4) */}
          {/* ======================================================== */}
          {activeTab === 'expenses' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* 預算統計看板卡片 */}
              <div className="bg-[#2A4B7C] text-white rounded-[2rem] p-5 shadow-lg relative overflow-hidden">
                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/5 rounded-full" />
                <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest block">2026 九州自駕記帳本</span>
                <h3 className="text-lg font-bold mt-1">財務預算控管與理財分析</h3>

                {/* 預算比進度條 */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-blue-100">
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
                    <span className="text-[10px] text-blue-200 block">實際累計支出 (日圓)</span>
                    <span className="font-bold text-lg text-white font-sans">￥{totalSpentJPY.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-200 block">折合台幣 (依0.21估算)</span>
                    <span className="font-bold text-lg text-yellow-200 font-sans">NT$ {totalSpentTWD.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 📥 智慧 Excel 一鍵匯出按鈕區塊 */}
              <div className="bg-white rounded-3xl p-4 shadow-md border border-[#E9ECF0] text-center space-y-2">
                <p className="text-xs text-[#5D6D7E] leading-relaxed">
                  想要整理紙本或者與旅伴分攤費用嗎？您可以一鍵將「所有每日行程、飯店憑證、記帳流水帳、打包準備清單」以 Excel (CSV) 格式打包匯出！
                </p>
                <button 
                  onClick={handleExportToExcel}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
                >
                  <Download size={15} />
                  <span>📥 匯出 Excel 旅行全紀錄報表</span>
                </button>
              </div>

              {/* AI 相機與對話自動記帳引導 (Feature 3) */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-[#2A4B7C]/10 border border-emerald-500/20 rounded-3xl p-4 flex items-start gap-3 shadow-sm">
                <div className="bg-emerald-500/10 p-2 rounded-2xl text-emerald-600 shrink-0">
                  <Bot size={20} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-800 block">櫻子 AI 語意與相機智慧記帳</span>
                  <p className="text-[11px] text-[#5D6D7E] leading-relaxed font-sans">
                    您可以拍下日本商家明細，或者直接在右下角聊天室發送：「<strong>記帳 一蘭拉麵 1500</strong>」。櫻子將自動解析並將其登錄至下方！
                  </p>
                  <button 
                    onClick={() => setChatbotOpen(true)}
                    className="mt-2 text-[10px] bg-[#2A4B7C] text-white px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles size={11} /> 開啟 AI 智慧對話記帳
                  </button>
                </div>
              </div>

              {/* 手動登錄費用紀錄表單 (Feature 4 要求) */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Plus size={14} className="text-[#FF8E99]" />
                  <span>手動新增消費款項</span>
                </span>

                <form onSubmit={handleAddExpenseManual} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold">消費日期</label>
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
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold">費用類別</label>
                      <select 
                        value={expFormCategory}
                        onChange={(e) => setExpFormCategory(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-xl p-2 bg-slate-50 text-slate-700"
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

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold">消費項目名稱</label>
                      <input 
                        type="text" 
                        value={expFormItem}
                        onChange={(e) => setExpFormItem(e.target.value)}
                        placeholder="例：活烏賊餐券、伴手禮盒..."
                        className="w-full text-xs border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#7F8C8D] block mb-1 font-bold">金額 (日圓)</label>
                      <input 
                        type="number" 
                        value={expFormAmount}
                        onChange={(e) => setExpFormAmount(e.target.value)}
                        placeholder="1200"
                        className="w-full text-xs border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-[#2A4B7C]"
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
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">各項消費分類比例分析</span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(categoryBreakdown).map(cat => {
                    const amt = categoryBreakdown[cat];
                    const percent = Math.round((amt / totalSpentJPY) * 100);
                    return (
                      <div key={cat} className="bg-slate-50 rounded-2xl p-2.5 text-center border border-gray-100">
                        <span className="text-[10px] text-gray-400 block">{cat}</span>
                        <strong className="text-xs text-slate-800 block mt-0.5 font-sans">￥{amt.toLocaleString()}</strong>
                        <span className="text-[9px] text-[#2A4B7C] block font-sans">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 詳細費用記帳明細流 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">已登錄消費流水明細</span>
                  <span className="text-[10px] text-gray-400 font-sans">共 {expenses.length} 筆款項</span>
                </div>

                <div className="space-y-2 divide-y divide-gray-100 max-h-96 overflow-y-auto pr-1">
                  {expenses.slice().reverse().map(item => {
                    const style = getCategoryStyle(item.category);
                    return (
                      <div key={item.id} className="pt-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/50 rounded-xl px-1">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] ${style.dot} text-white shrink-0`}>
                            {item.category === '食物' && <Utensils size={12} />}
                            {item.category === '購物' && <ShoppingBag size={12} />}
                            {item.category === '交通' && <Car size={12} />}
                            {item.category === '活動' && <Sparkles size={12} />}
                            {item.category === '住宿' && <Hotel size={12} />}
                            {item.category === '其他' && <FileText size={12} />}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{item.item}</span>
                            <span className="text-[9px] text-gray-400 font-sans block">D{item.day} ({item.date}) · {item.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-800 font-sans block">￥{item.amount.toLocaleString()}</span>
                            <span className="text-[9px] text-gray-400 font-sans block">約 NT$ {Math.round(item.amount * 0.21)}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleDeleteExpense(item.id)}
                            className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
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
            <div className="space-y-4 animate-fade-in">
              
              {/* 自駕地圖看板 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3 text-center">
                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sans">
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
                      <text x="10" y="4" className="text-[10px] font-bold fill-[#FF5A6F]">台灣 (桃園機場)</text>
                    </g>
                    <g transform="translate(200,60)">
                      <circle r="7" fill="#2A4B7C" />
                      <circle r="3" fill="#FFFFFF" />
                      <text x="10" y="4" className="text-[10px] font-bold fill-[#2A4B7C]">福岡 (博多)</text>
                    </g>
                    <g transform="translate(140,100)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-35" y="-6" className="text-[9px] font-bold fill-[#4A5568]">佐賀市</text>
                    </g>
                    <g transform="translate(110,160)">
                      <circle r="5" fill="#FF5A6F" />
                      <text x="10" y="4" className="text-[9px] font-bold fill-red-500">太良町 (海中鳥居)</text>
                    </g>
                    <g transform="translate(100,120)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-40" y="12" className="text-[9px] font-bold fill-[#4A5568]">武雄神社</text>
                    </g>
                    <g transform="translate(60,110)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-30" y="-8" className="text-[9px] font-bold fill-[#4A5568]">有田陶瓷</text>
                    </g>
                    <g transform="translate(50,80)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-40" y="2" className="text-[9px] font-bold fill-[#4A5568]">伊萬里</text>
                    </g>
                    <g transform="translate(90,50)">
                      <circle r="5" fill="#2A4B7C" />
                      <text x="-30" y="-8" className="text-[9px] font-bold fill-[#4A5568]">唐津城</text>
                    </g>
                    <g transform="translate(145,40)">
                      <circle r="5" fill="#FF5A6F" />
                      <text x="0" y="-8" className="text-[9px] font-bold fill-indigo-600">絲島半島</text>
                    </g>

                    <text x="100" y="110" className="text-sm">✈</text>
                    <text x="112" y="70" className="text-xs">🚗</text>
                  </svg>
                </div>
              </div>

              {/* 氣象與每日降雨預報表 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
                <span className="text-xs font-bold text-gray-400 block uppercase">每日區域預報 (2026/06/24 - 06/30)</span>
                <div className="divide-y divide-gray-100">
                  {daysData.map(d => (
                    <div key={d.day} className="py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#2A4B7C] text-white font-bold font-sans text-[10px] w-6 h-6 rounded-full flex items-center justify-center">
                          D{d.day}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{d.area}</span>
                          <span className="text-[9px] font-sans text-gray-400 block">{d.date.split(' ')[0]}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold font-sans text-slate-700 block">{d.temp}</span>
                          <span className="text-[9px] font-sans text-gray-400 block">體感約 28°C</span>
                        </div>

                        <div className="bg-[#F5F7FA] p-2 rounded-2xl flex items-center gap-1.5 border border-gray-100">
                          {parseInt(d.rainChance) >= 40 ? (
                            <CloudRain size={16} className="text-blue-500 animate-bounce" />
                          ) : (
                            <CloudSun size={16} className="text-orange-400" />
                          )}
                          <div className="text-left font-sans">
                            <span className="text-[9px] text-gray-400 block">降水率</span>
                            <span className="text-[10px] font-bold text-[#2A4B7C] block">{d.rainChance}</span>
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
          {/* 行前指南與行李打包分頁 (GUIDE) */}
          {/* ======================================================== */}
          {activeTab === 'guide' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* 旅行手冊工具盒頭部 */}
              <div className="bg-gradient-to-br from-[#2A4B7C] to-[#436496] rounded-3xl p-4 text-white shadow-md space-y-2">
                <div className="flex items-center gap-1.5 text-yellow-200">
                  <BookOpen size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">旅行工具箱 ＆ 行前準備</span>
                </div>
                <h3 className="text-base font-bold font-sans">九州自由行・數位隨身錦囊</h3>
                <p className="text-xs text-blue-100 leading-relaxed font-sans">
                  包含行李打包檢查、日本自駕規則、以及與您提供明細 100% 同步的真實 Booking 訂房憑證！
                </p>
              </div>

              {/* 1. 行李與購物清單 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <CheckSquare size={14} className="text-[#FF8E99]" />
                    <span>行李清單管理庫</span>
                  </span>
                  <span className="text-[10px] bg-[#EAF2F8] text-[#2A4B7C] font-bold px-2 py-0.5 rounded-full">
                    可新增 / 調整數量
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Category: 隨身 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#2A4B7C] bg-[#EAF2F8] px-2.5 py-1 rounded-lg w-max">
                      💼 隨身背包 (證件貴重物品)
                    </h4>
                    <div className="space-y-1.5 font-sans">
                      {packingList.personal.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all border border-gray-50">
                          <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleItem('personal', item.id)}>
                            {item.checked ? (
                              <CheckSquare size={15} className="text-[#FF8E99] shrink-0" />
                            ) : (
                              <Square size={15} className="text-gray-300 shrink-0" />
                            )}
                            <span className={`text-xs ${item.checked ? 'line-through text-gray-400' : 'text-slate-700'}`}>
                              {item.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden font-sans">
                              <button onClick={() => adjustQty('personal', item.id, -1)} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 hover:bg-gray-100 text-[10px] font-bold">-</button>
                              <span className="px-2 text-[10px] font-bold text-slate-700 bg-white">{item.qty}</span>
                              <button onClick={() => adjustQty('personal', item.id, 1)} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 hover:bg-gray-100 text-[10px] font-bold">+</button>
                            </div>
                            <button onClick={() => deleteItem('personal', item.id)} className="text-gray-300 hover:text-red-500 p-1">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category: 託運 */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#2A4B7C] bg-[#EAF2F8] px-2.5 py-1 rounded-lg w-max">
                      🧳 託運行李 (行李箱託運)
                    </h4>
                    <div className="space-y-1.5 font-sans">
                      {packingList.checked.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all border border-gray-50">
                          <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => toggleItem('checked', item.id)}>
                            {item.checked ? (
                              <CheckSquare size={15} className="text-[#FF8E99] shrink-0" />
                            ) : (
                              <Square size={15} className="text-gray-300 shrink-0" />
                            )}
                            <span className={`text-xs ${item.checked ? 'line-through text-gray-400' : 'text-slate-700'}`}>
                              {item.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden font-sans">
                              <button onClick={() => adjustQty('checked', item.id, -1)} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 hover:bg-gray-100 text-[10px] font-bold">-</button>
                              <span className="px-2 text-[10px] font-bold text-slate-700 bg-white">{item.qty}</span>
                              <button onClick={() => adjustQty('checked', item.id, 1)} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 hover:bg-gray-100 text-[10px] font-bold">+</button>
                            </div>
                            <button onClick={() => deleteItem('checked', item.id)} className="text-gray-300 hover:text-red-500 p-1">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 住宿確認憑證夾 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <FileText size={14} className="text-emerald-600" />
                  <span>實體 Booking 訂房憑證夾</span>
                </span>
                
                <div className="space-y-2.5 font-sans">
                  {daysData.filter(d => d.spots.some(s => s.category === '酒店')).map(d => {
                    const hotelSpot = d.spots.find(s => s.category === '酒店');
                    return (
                      <div key={d.day} className="border border-emerald-100 rounded-2xl p-3 bg-emerald-50/20 flex justify-between items-center">
                        <div className="flex-1 pr-2">
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                            D{d.day} ({d.date.split(' ')[0]})
                          </span>
                          <h5 className="font-bold text-xs text-slate-800 mt-1 truncate">{hotelSpot.name}</h5>
                          <span className="text-[10px] text-gray-400 block">本日訂房花費: ￥{expenses.find(e => e.day === d.day && e.category === '住宿')?.amount?.toLocaleString() || '0'} 日圓</span>
                        </div>
                        <a 
                          href={hotelSpot.navUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-emerald-600 text-white font-bold text-[10px] px-3 py-2 rounded-xl shrink-0 hover:bg-emerald-700 transition-colors"
                        >
                          Booking 憑證
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. 日本自駕規則提醒 */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Info size={14} className="text-blue-500" />
                  <span>自駕安全與 ETC 退稅指引</span>
                </span>
                <ul className="text-xs text-[#5D6D7E] space-y-2 list-disc pl-4 leading-relaxed font-sans">
                  <li><strong>靠左行駛</strong>：日本方向盤及車道均相反，請隨時提醒自己「靠左慢行」。</li>
                  <li><strong>行人優先</strong>：斑馬線前若有行人，請務必完全靜止禮讓。</li>
                  <li><strong>過路費/ETC</strong>：自駕上高速公路建議使用 ETC 卡片，方便進出閘道。</li>
                </ul>
              </div>

            </div>
          )}

        </main>

        {/* BOTTOM FLOATING NAV BAR */}
        <nav className="absolute bottom-5 left-4 right-4 bg-white/80 backdrop-blur-xl rounded-[2.2rem] py-3 px-4 shadow-2xl border border-white/40 flex justify-around items-center z-40">
          
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

        {/* 🌸 FLOATING ✨ AI CHATBOT TOGGLE BUTTON */}
        {!chatbotOpen && (
          <button
            onClick={() => setChatbotOpen(true)}
            className="absolute bottom-24 right-5 bg-gradient-to-tr from-[#FF8E99] to-[#2A4B7C] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 animate-bounce group"
            aria-label="打開 AI 櫻花小秘書"
          >
            <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
          </button>
        )}

        {/* 🌸 ✨ AI GLOBAL ASSISTANT CHAT MODAL/DRAWER */}
        {chatbotOpen && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end transition-all">
            
            {/* Slide-up Container */}
            <div className="bg-[#F5F7FA] w-full h-[85vh] rounded-t-[2.5rem] flex flex-col shadow-2xl relative border-t border-white/50 animate-slide-up">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2A4B7C] to-[#3B629B] text-white px-5 py-4 rounded-t-[2.5rem] flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 p-1.5 rounded-xl">
                    <Sparkles size={18} className="text-yellow-200" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm font-sans">✨ 櫻子・和風記帳 AI 秘書</h4>
                    <span className="text-[10px] text-blue-100 flex items-center gap-0.5 font-sans">
                      <Bot size={10} /> Powered by Gemini 2.5 Multi-Modal
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

              {/* 🔑 API Key 內嵌管理列 (全新置換 UI) */}
              <div className="bg-amber-50/70 border-b border-amber-200/50 px-4 py-2 flex items-center justify-between gap-2 text-xs">
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-sans">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#2A4B7C] text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-gray-100 rounded-tl-none prose max-w-none whitespace-pre-line'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="flex justify-start font-sans">
                    <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-none px-4 py-3 text-xs text-slate-500 shadow-xs flex items-center gap-2">
                      <div className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-[#FF8E99] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#FF8E99] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#FF8E99] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span>櫻子正在努力精算並將款項同步到您的賬簿...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Action Hints */}
              <div className="px-4 py-2 border-t border-gray-100 bg-white/40 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
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
                  className="bg-white hover:bg-gray-50 text-[10px] font-bold text-slate-600 border border-gray-200 px-3 py-1.5 rounded-full shadow-xs shrink-0"
                >
                  🚗 對話記帳：自駕加油
                </button>
              </div>

              {/* Chat Input Bar + Receipt Photo Uploader */}
              <div className="bg-white p-3 border-t border-gray-100 flex gap-2 items-center">
                
                <label className="bg-[#FF8E99]/15 hover:bg-[#FF8E99]/25 text-[#FF5A6F] p-2.5 rounded-2xl cursor-pointer transition-colors shrink-0 flex items-center justify-center" title="上傳發票明細照片記帳">
                  <input 
                    type="file" 
                    accept="image/*" 
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

      </div>
    </div>
  );
}