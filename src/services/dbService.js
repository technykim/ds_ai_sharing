// LocalStorage Mock Database Service for DS-AI-secondhandmarket

const KEYS = {
  USERS: 'market_users',
  ITEMS: 'market_items',
  FAVORITES: 'market_favorites',
  CHATS: 'market_chats',
  CURRENT_USER: 'market_current_user',
  GATHERINGS: 'market_gatherings',
  GATHERING_MEMBERS: 'market_gathering_members',
  GATHERING_NOTICES: 'market_gathering_notices',
  GATHERING_EVENTS: 'market_gathering_events',
  GATHERING_REVIEWS: 'market_gathering_reviews',
  GATHERING_CHATS: 'market_gathering_chats'
};

const INITIAL_USERS = [
  {
    email: 'user1@example.com',
    password: 'password123',
    name: '김사랑',
    nickname: '사랑지기',
    parish: '1교구',
    address: '서울시 강남구 역삼동 123-45',
    contact: '010-1234-5678',
    isVerified: true,
    status: 'approved',
    recommenderType: '구역담당목회자',
    recommenderDetail: ''
  },
  {
    email: 'user2@example.com',
    password: 'password123',
    name: '박소망',
    nickname: '소망나누미',
    parish: '2교구',
    address: '서울시 마포구 합정동 98-7',
    contact: '010-8765-4321',
    isVerified: true,
    status: 'approved',
    recommenderType: '구역장',
    recommenderDetail: ''
  },
  {
    email: 'user3@example.com',
    password: 'password123',
    name: '이믿음',
    nickname: '믿음가득',
    parish: '3교구',
    address: '서울시 성동구 성수동 45-6',
    contact: '010-5678-1234',
    isVerified: true,
    status: 'approved',
    recommenderType: '기존가입자',
    recommenderDetail: '사랑지기'
  }
];

const INITIAL_ITEMS = [
  {
    id: 'item-1',
    title: '원목 원구 및 쌓기 블록 교구',
    sellerId: 'user2@example.com',
    sellerName: '박소망',
    sellerParish: '2교구',
    description: '아이들이 정말 좋아했던 숲소리 원목 교구 블록 세트입니다. 모서리 전부 둥글게 마감되어 있고 천연 원목이라 구강기 아이들이 만져도 안전합니다. 몇 개 분실된 블록이 있어서 무료 나눔합니다. 박스도 함께 드려요.',
    images: ['/mock_item_blocks.png'],
    category: '교구/완구',
    tradeLocation: '교회 로비 앞',
    type: 'give',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 'item-2',
    title: '세계 명작 동화 그림책 15권 세트',
    sellerId: 'user3@example.com',
    sellerName: '이믿음',
    sellerParish: '3교구',
    description: '상태 아주 깨끗한 그림책들입니다. 찢어지거나 낙서된 부분 전혀 없고 책기둥 색바램도 없습니다. 연령대는 4~7세 추천하며 일괄 드림합니다.',
    images: ['/mock_item_books.png'],
    category: '아동 도서',
    tradeLocation: '혜화역 2번 출구',
    type: 'give',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'item-3',
    title: '리안 스핀 유모차 (보조 시트 포함)',
    sellerId: 'user2@example.com',
    sellerName: '박소망',
    sellerParish: '2교구',
    description: '디럭스 유모차입니다. 흔들림이 적어 신생아 태우기 정말 좋고 바퀴 마모 상태도 양호합니다. 사용감은 조금 있으나 매우 튼튼해서 세컨용으로 쓰셔도 좋습니다. 깔끔하게 세탁 완료했습니다.',
    images: ['/mock_item_stroller.png'],
    category: '유아용품',
    tradeLocation: '교회 지하 주차장',
    type: 'give',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },
  {
    id: 'item-4',
    title: '이케아 아기 원목 식탁 의자',
    sellerId: 'user1@example.com',
    sellerName: '김사랑',
    sellerParish: '1교구',
    description: '원목 하이체어입니다. 식판 분리 세척 가능해서 청결하게 쓰기 좋고 튼튼합니다. 아이가 커서 내놓습니다. 직접 가지러 오셔야 할 것 같아요! (역삼역 근처)',
    images: ['/mock_item_highchair.png'],
    category: '가구/식기',
    tradeLocation: '역삼역 3번 출구 근처',
    type: 'give',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'item-5',
    title: '아기 보행기 구합니다!',
    sellerId: 'user1@example.com',
    sellerName: '김사랑',
    sellerParish: '1교구',
    description: '아이가 이제 기어 다니기 시작해서 보행기를 태워보려고 합니다. 한두 달만 쓰고 다시 나눔해드리거나 사례하겠습니다. 드림해주실 분 계시면 연락 부탁드립니다! 소정의 선물로 커피 쿠폰 드릴게요.',
    images: [],
    category: '유아용품',
    tradeLocation: '교회 로비 앞',
    type: 'receive',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  },
  {
    id: 'item-6',
    title: '초등 저학년용 영어 동화책 구해요',
    sellerId: 'user2@example.com',
    sellerName: '박소망',
    sellerParish: '2교구',
    description: '아이가 영어 글자를 읽기 시작해서 저학년 수준의 쉽고 재미있는 영어 동화책 세트 구합니다. 다 읽고 방치 중인 책이나 낱권도 환영합니다. 나눔해주시면 정말 감사하겠습니다.',
    images: [],
    category: '아동 도서',
    tradeLocation: '혜화역 2번 출구 앞',
    type: 'receive',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
  },
  {
    id: 'item-7',
    title: '성경책 나눔 합니다',
    sellerId: 'user1@example.com',
    sellerName: '김사랑',
    sellerParish: '1교구',
    description: '새 성경책을 선물 받게 되어 기존에 보던 성경책을 깨끗하게 나눔합니다. 가죽 커버 상태 좋고 낙서나 밑줄 거의 없습니다. 필요하신 분 가져가세요. 예배 시간 전후로 교회 로비에서 전달 가능합니다.',
    images: ['/mock_item_bible.png'],
    category: '기타',
    tradeLocation: '교회 로비 앞',
    type: 'give',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString() // 40 mins ago
  },
  {
    id: 'item-8',
    title: '십자가 목걸이 나눔 합니다',
    sellerId: 'user3@example.com',
    sellerName: '이믿음',
    sellerParish: '3교구',
    description: '은으로 된 십자가 목걸이입니다. 최근에 은 세척을 마쳐서 새것처럼 깨끗하고 반짝입니다. 작은 선물 상자도 함께 나눔해 드려요. 유용하게 착용하실 분 연락주세요.',
    images: ['/mock_item_necklace.png'],
    category: '기타',
    tradeLocation: '교회 지하 주차장',
    type: 'give',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() // 20 mins ago
  }
];

const INITIAL_CHATS = [
  {
    id: 'chat-1',
    itemId: 'item-1',
    buyerId: 'user1@example.com',
    sellerId: 'user2@example.com',
    senderId: 'user1@example.com',
    content: '안녕하세요! 원목 블록 교구 나눔 신청하고 싶어서 연락드렸습니다. 혹시 나눔 완료되었나요?',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 mins ago
  },
  {
    id: 'chat-2',
    itemId: 'item-1',
    buyerId: 'user1@example.com',
    sellerId: 'user2@example.com',
    senderId: 'user2@example.com',
    content: '안녕하세요 김사랑님! 아직 예약 가능합니다. 주말이나 평일 저녁 중에 언제 편하신가요?',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() // 25 mins ago
  }
];

const INITIAL_GATHERINGS = [
  {
    id: 'moim-1',
    title: '금요 저녁 중보기도 모임',
    category: '기도모임',
    shortDesc: '매주 금요예배 후 함께 모여 교구와 개인 기도제목을 나누는 기도모임입니다.',
    longDesc: '주님의 은혜 안에 함께 기도하며 서로의 짐을 나누는 중보기도 모임입니다.\n\n- 모임 시간: 매주 금요일 저녁 8:30\n- 모임 장소: 교회 소예배실 2관\n- 대상: 기도에 관심 있는 모든 교구원',
    images: ['/mock_item_bible.png'],
    leaderId: 'user1@example.com',
    leaderName: '김사랑',
    leaderParish: '1교구',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'moim-2',
    title: '주말 풋살 운동모임',
    category: '운동모임',
    shortDesc: '토요일 아침 건강하게 땀 흘리며 친교를 나누는 풋살 소모임입니다.',
    longDesc: '남녀노소 누구나 즐겁게 풋살을 하며 체력을 다지고 친교하는 스포츠 모임입니다.\n\n- 모임 시간: 매월 둘째/넷째 토요일 오전 7:00\n- 장소: 근처 풋살구장\n- 초보자도 환영합니다!',
    images: ['/mock_item_blocks.png'],
    leaderId: 'user2@example.com',
    leaderName: '박소망',
    leaderParish: '2교구',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'moim-3',
    title: '신약 성경 통독 및 묵상 모임',
    category: '성경공부모임',
    shortDesc: '하루 3장씩 성경을 읽고 묵상 나눔을 함께하는 모임입니다.',
    longDesc: '말씀 안에서 매일 삶의 은혜를 발견하고 서로의 묵상을 나누는 성경통독 모임입니다.\n\n- 주중 매일 카톡 묵상 나눔\n- 주일 2부 예배 후 30분 모임',
    images: ['/mock_item_books.png'],
    leaderId: 'user3@example.com',
    leaderName: '이믿음',
    leaderParish: '3교구',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_GATHERING_MEMBERS = [
  { gatheringId: 'moim-1', userEmail: 'user1@example.com', userName: '김사랑', userParish: '1교구', status: 'approved', joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { gatheringId: 'moim-1', userEmail: 'user2@example.com', userName: '박소망', userParish: '2교구', status: 'approved', joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { gatheringId: 'moim-1', userEmail: 'user3@example.com', userName: '이믿음', userParish: '3교구', status: 'pending', joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },

  { gatheringId: 'moim-2', userEmail: 'user2@example.com', userName: '박소망', userParish: '2교구', status: 'approved', joinedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { gatheringId: 'moim-2', userEmail: 'user1@example.com', userName: '김사랑', userParish: '1교구', status: 'approved', joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },

  { gatheringId: 'moim-3', userEmail: 'user3@example.com', userName: '이믿음', userParish: '3교구', status: 'approved', joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { gatheringId: 'moim-3', userEmail: 'user2@example.com', userName: '박소망', userParish: '2교구', status: 'approved', joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const INITIAL_GATHERING_NOTICES = [
  { id: 'gn-1', gatheringId: 'moim-1', authorId: 'user1@example.com', authorName: '김사랑', content: '이번 주 금요기도회는 8시 30분에 소예배실 2관에서 모입니다. 기도제목을 미리 묵상해 오세요.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'gn-2', gatheringId: 'moim-2', authorId: 'user2@example.com', authorName: '박소망', content: '이번 주 토요일 풋살 모임 장소 및 풋살화 지참 안내드립니다.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const INITIAL_GATHERING_EVENTS = [
  { id: 'ge-1', gatheringId: 'moim-1', title: '9월 정기 금요기도회', date: '2026-09-11', time: '20:30', location: '소예배실 2관', description: '교구 중보기도 및 합심기도' },
  { id: 'ge-2', gatheringId: 'moim-2', title: '9월 풋살 정기전', date: '2026-09-12', time: '07:00', location: '근처 풋살구장', description: '친목 풋살 경기' },
  { id: 'ge-3', gatheringId: 'moim-3', title: '마가복음 통독 모임', date: '2026-09-13', time: '11:30', location: '비전홀 3층', description: '마가복음 1-5장 묵상 나눔' }
];

const INITIAL_GATHERING_REVIEWS = [
  { id: 'gr-1', gatheringId: 'moim-1', authorId: 'user2@example.com', authorName: '박소망', content: '함께 뜨겁게 기도할 수 있어서 정말 은혜롭고 감사한 시간이었습니다!', rating: 5, images: [], createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'gr-2', gatheringId: 'moim-2', authorId: 'user1@example.com', authorName: '김사랑', content: '오랜만에 상쾌하게 땀 흘리며 교제하니 기분도 밝아지네요. 다들 수고하셨습니다!', rating: 5, images: ['/mock_item_blocks.png'], createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
];

const INITIAL_GATHERING_CHATS = [
  { id: 'gc-1', gatheringId: 'moim-1', senderId: 'user1@example.com', senderName: '김사랑', content: '안녕하세요 기도모임 이웃 여러분! 이번 주 금요일에 뵙겠습니다.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'gc-2', gatheringId: 'moim-1', senderId: 'user2@example.com', senderName: '박소망', content: '네 리더님! 기도로 준비하겠습니다.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const DB_VERSION_KEY = 'market_db_version';
const CURRENT_DB_VERSION = 'v7_recommender_approval';

// Helper to initialize DB
export const initDB = () => {
  const storedVersion = localStorage.getItem(DB_VERSION_KEY);
  if (storedVersion !== CURRENT_DB_VERSION) {
    // Force reset local storage keys to apply new database schema
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.ITEMS);
    localStorage.removeItem(KEYS.FAVORITES);
    localStorage.removeItem(KEYS.CHATS);
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem(KEYS.GATHERINGS);
    localStorage.removeItem(KEYS.GATHERING_MEMBERS);
    localStorage.removeItem(KEYS.GATHERING_NOTICES);
    localStorage.removeItem(KEYS.GATHERING_EVENTS);
    localStorage.removeItem(KEYS.GATHERING_REVIEWS);
    localStorage.removeItem(KEYS.GATHERING_CHATS);
    localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
  }

  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.ITEMS)) {
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  }
  if (!localStorage.getItem(KEYS.FAVORITES)) {
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify({}));
  }
  if (!localStorage.getItem(KEYS.CHATS)) {
    localStorage.setItem(KEYS.CHATS, JSON.stringify(INITIAL_CHATS));
  }
  if (!localStorage.getItem(KEYS.GATHERINGS)) {
    localStorage.setItem(KEYS.GATHERINGS, JSON.stringify(INITIAL_GATHERINGS));
  }
  if (!localStorage.getItem(KEYS.GATHERING_MEMBERS)) {
    localStorage.setItem(KEYS.GATHERING_MEMBERS, JSON.stringify(INITIAL_GATHERING_MEMBERS));
  }
  if (!localStorage.getItem(KEYS.GATHERING_NOTICES)) {
    localStorage.setItem(KEYS.GATHERING_NOTICES, JSON.stringify(INITIAL_GATHERING_NOTICES));
  }
  if (!localStorage.getItem(KEYS.GATHERING_EVENTS)) {
    localStorage.setItem(KEYS.GATHERING_EVENTS, JSON.stringify(INITIAL_GATHERING_EVENTS));
  }
  if (!localStorage.getItem(KEYS.GATHERING_REVIEWS)) {
    localStorage.setItem(KEYS.GATHERING_REVIEWS, JSON.stringify(INITIAL_GATHERING_REVIEWS));
  }
  if (!localStorage.getItem(KEYS.GATHERING_CHATS)) {
    localStorage.setItem(KEYS.GATHERING_CHATS, JSON.stringify(INITIAL_GATHERING_CHATS));
  }
  // Auto-login user1 by default to make testing painless
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  }
};

// USER APIS
export const getUsers = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.USERS));
};

export const getUser = (email) => {
  const users = getUsers();
  return users.find(u => u.email === email);
};

export const createUser = (user) => {
  const users = getUsers();
  if (users.some(u => u.email === user.email)) {
    throw new Error('이미 등록된 이메일 주소입니다.');
  }
  const newUser = {
    ...user,
    status: 'pending' // New registered users start as pending approval!
  };
  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const updateUser = (email, updatedData) => {
  const users = getUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) throw new Error('사용자를 찾을 수 없습니다.');
  
  users[idx] = { ...users[idx], ...updatedData };
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  
  // If editing current user, update current user info too
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email === email) {
    setCurrentUser(users[idx]);
  }
  return users[idx];
};

export const getCurrentUser = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.CURRENT_USER));
};

export const setCurrentUser = (user) => {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

export const login = (email, password) => {
  const user = getUser(email);
  if (!user || user.password !== password) {
    throw new Error('이메일 혹은 비밀번호가 틀렸습니다.');
  }
  if (user.status === 'pending') {
    throw new Error('가입 승인 대기 중입니다. 추천인(구역장/목회자)의 승인 후 로그인이 가능합니다.');
  }
  setCurrentUser(user);
  return user;
};

export const getPendingUsers = () => {
  const users = getUsers();
  return users.filter(u => u.status === 'pending');
};

export const approveUser = (email) => {
  const users = getUsers();
  const target = users.find(u => u.email === email);
  if (target) {
    target.status = 'approved';
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }
  return target;
};

export const rejectUser = (email) => {
  let users = getUsers();
  users = users.filter(u => u.email !== email);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

// ITEM APIS
export const getItems = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.ITEMS));
};

export const getItem = (id) => {
  const items = getItems();
  return items.find(i => i.id === id);
};

export const createItem = (itemData) => {
  const items = getItems();
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('로그인이 필요합니다.');

  const newItem = {
    id: `item-${Date.now()}`,
    sellerId: currentUser.email,
    sellerName: currentUser.name,
    sellerParish: currentUser.parish,
    createdAt: new Date().toISOString(),
    images: itemData.images || [],
    ...itemData
  };

  items.unshift(newItem); // New items at the top
  localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
  return newItem;
};

export const deleteItem = (id) => {
  let items = getItems();
  items = items.filter(i => i.id !== id);
  localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
};

// FAVORITE APIS
export const getFavorites = (email) => {
  initDB();
  const favs = JSON.parse(localStorage.getItem(KEYS.FAVORITES));
  return favs[email] || [];
};

export const toggleFavorite = (email, itemId) => {
  initDB();
  const favs = JSON.parse(localStorage.getItem(KEYS.FAVORITES));
  if (!favs[email]) favs[email] = [];
  
  const index = favs[email].indexOf(itemId);
  if (index === -1) {
    favs[email].push(itemId);
  } else {
    favs[email].splice(index, 1);
  }
  
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
  return favs[email];
};

export const isFavorite = (email, itemId) => {
  const favs = getFavorites(email);
  return favs.includes(itemId);
};

// CHAT APIS
export const getChats = () => {
  initDB();
  return JSON.parse(localStorage.getItem(KEYS.CHATS));
};

// Group chat messages into room representations
export const getChatRoomsForUser = (email) => {
  const chats = getChats();
  const items = getItems();
  const users = getUsers();
  
  // Rooms are unique combinations of (itemId, buyerId)
  const roomMap = {};
  
  chats.forEach(msg => {
    // Only message lists involving current user
    if (msg.buyerId === email || msg.sellerId === email) {
      const roomKey = `${msg.itemId}_${msg.buyerId}`;
      if (!roomMap[roomKey]) {
        const item = items.find(i => i.id === msg.itemId) || { title: '삭제된 상품', images: [] };
        const counterpartEmail = msg.buyerId === email ? msg.sellerId : msg.buyerId;
        const counterpart = users.find(u => u.email === counterpartEmail) || { name: '알 수 없음', parish: '알 수 없음' };
        
        roomMap[roomKey] = {
          roomKey,
          itemId: msg.itemId,
          buyerId: msg.buyerId,
          sellerId: msg.sellerId,
          itemTitle: item.title,
          itemImage: item.images[0] || '',
          counterpartName: counterpart.name,
          counterpartParish: counterpart.parish,
          counterpartEmail: counterpart.email,
          lastMessage: '',
          lastMessageTime: '',
          messages: []
        };
      }
      
      roomMap[roomKey].messages.push(msg);
    }
  });

  // Sort messages in each room and set lastMessage info
  const rooms = Object.values(roomMap).map(room => {
    room.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    if (room.messages.length > 0) {
      const lastMsg = room.messages[room.messages.length - 1];
      room.lastMessage = lastMsg.content;
      room.lastMessageTime = lastMsg.timestamp;
    }
    return room;
  });

  // Sort rooms by latest message time
  return rooms.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
};

export const getOrCreateChatRoom = (itemId, buyerId) => {
  const rooms = getChatRoomsForUser(buyerId);
  const roomKey = `${itemId}_${buyerId}`;
  const existing = rooms.find(r => r.roomKey === roomKey);
  
  if (existing) return existing;
  
  // If not exists, return metadata to start it
  const item = getItem(itemId);
  if (!item) throw new Error('상품을 찾을 수 없습니다.');
  
  const users = getUsers();
  const seller = users.find(u => u.email === item.sellerId);
  
  return {
    roomKey,
    itemId,
    buyerId,
    sellerId: item.sellerId,
    itemTitle: item.title,
    itemImage: item.images[0] || '',
    counterpartName: seller.name,
    counterpartParish: seller.parish,
    counterpartEmail: seller.email,
    lastMessage: '',
    lastMessageTime: '',
    messages: []
  };
};

export const sendMessage = (itemId, buyerId, sellerId, senderId, content) => {
  const chats = getChats();
  const newMsg = {
    id: `msg-${Date.now()}`,
    itemId,
    buyerId,
    sellerId,
    senderId,
    content,
    timestamp: new Date().toISOString()
  };
  
  chats.push(newMsg);
  localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
  return newMsg;
};

// ================= GATHERING API FUNCTIONS =================

export const getGatherings = () => {
  const data = localStorage.getItem(KEYS.GATHERINGS);
  return data ? JSON.parse(data) : [];
};

export const getGathering = (id) => {
  const list = getGatherings();
  return list.find(g => g.id === id);
};

export const createGathering = (gatheringData) => {
  const gatherings = getGatherings();
  const newMoim = {
    id: `moim-${Date.now()}`,
    ...gatheringData,
    createdAt: new Date().toISOString()
  };
  gatherings.unshift(newMoim);
  localStorage.setItem(KEYS.GATHERINGS, JSON.stringify(gatherings));

  // Automatically add leader as approved member
  const members = getGatheringMembersAll();
  members.push({
    gatheringId: newMoim.id,
    userEmail: newMoim.leaderId,
    userName: newMoim.leaderName,
    userParish: newMoim.leaderParish,
    status: 'approved',
    joinedAt: new Date().toISOString()
  });
  localStorage.setItem(KEYS.GATHERING_MEMBERS, JSON.stringify(members));

  return newMoim;
};

export const getGatheringMembersAll = () => {
  const data = localStorage.getItem(KEYS.GATHERING_MEMBERS);
  return data ? JSON.parse(data) : [];
};

export const getGatheringMembers = (gatheringId) => {
  const all = getGatheringMembersAll();
  return all.filter(m => m.gatheringId === gatheringId);
};

export const applyGatheringMember = (gatheringId, user) => {
  const members = getGatheringMembersAll();
  const existing = members.find(m => m.gatheringId === gatheringId && m.userEmail === user.email);
  if (existing) return existing;

  const newMember = {
    gatheringId,
    userEmail: user.email,
    userName: user.name,
    userParish: user.parish,
    status: 'pending',
    joinedAt: new Date().toISOString()
  };
  members.push(newMember);
  localStorage.setItem(KEYS.GATHERING_MEMBERS, JSON.stringify(members));
  return newMember;
};

export const approveGatheringMember = (gatheringId, userEmail) => {
  const members = getGatheringMembersAll();
  const target = members.find(m => m.gatheringId === gatheringId && m.userEmail === userEmail);
  if (target) {
    target.status = 'approved';
    localStorage.setItem(KEYS.GATHERING_MEMBERS, JSON.stringify(members));
  }
  return target;
};

export const rejectGatheringMember = (gatheringId, userEmail) => {
  let members = getGatheringMembersAll();
  members = members.filter(m => !(m.gatheringId === gatheringId && m.userEmail === userEmail));
  localStorage.setItem(KEYS.GATHERING_MEMBERS, JSON.stringify(members));
};

export const leaveGathering = (gatheringId, userEmail) => {
  let members = getGatheringMembersAll();
  members = members.filter(m => !(m.gatheringId === gatheringId && m.userEmail === userEmail));
  localStorage.setItem(KEYS.GATHERING_MEMBERS, JSON.stringify(members));
};

export const getGatheringNotices = (gatheringId) => {
  const data = localStorage.getItem(KEYS.GATHERING_NOTICES);
  const list = data ? JSON.parse(data) : [];
  return list.filter(n => n.gatheringId === gatheringId);
};

export const addGatheringNotice = (gatheringId, authorId, authorName, content) => {
  const data = localStorage.getItem(KEYS.GATHERING_NOTICES);
  const list = data ? JSON.parse(data) : [];
  const newNotice = {
    id: `gn-${Date.now()}`,
    gatheringId,
    authorId,
    authorName,
    content,
    createdAt: new Date().toISOString()
  };
  list.unshift(newNotice);
  localStorage.setItem(KEYS.GATHERING_NOTICES, JSON.stringify(list));
  return newNotice;
};

export const getGatheringEvents = (gatheringId) => {
  const data = localStorage.getItem(KEYS.GATHERING_EVENTS);
  const list = data ? JSON.parse(data) : [];
  return list.filter(e => e.gatheringId === gatheringId);
};

export const addGatheringEvent = (gatheringId, title, date, time, location, description) => {
  const data = localStorage.getItem(KEYS.GATHERING_EVENTS);
  const list = data ? JSON.parse(data) : [];
  const newEvent = {
    id: `ge-${Date.now()}`,
    gatheringId,
    title,
    date,
    time,
    location,
    description
  };
  list.push(newEvent);
  localStorage.setItem(KEYS.GATHERING_EVENTS, JSON.stringify(list));
  return newEvent;
};

export const getGatheringReviews = (gatheringId) => {
  const data = localStorage.getItem(KEYS.GATHERING_REVIEWS);
  const list = data ? JSON.parse(data) : [];
  return list.filter(r => r.gatheringId === gatheringId);
};

export const addGatheringReview = (gatheringId, authorId, authorName, content, images = [], rating = 5) => {
  const data = localStorage.getItem(KEYS.GATHERING_REVIEWS);
  const list = data ? JSON.parse(data) : [];
  const newReview = {
    id: `gr-${Date.now()}`,
    gatheringId,
    authorId,
    authorName,
    content,
    images,
    rating,
    createdAt: new Date().toISOString()
  };
  list.unshift(newReview);
  localStorage.setItem(KEYS.GATHERING_REVIEWS, JSON.stringify(list));
  return newReview;
};

export const getGatheringMessages = (gatheringId) => {
  const data = localStorage.getItem(KEYS.GATHERING_CHATS);
  const list = data ? JSON.parse(data) : [];
  return list.filter(c => c.gatheringId === gatheringId);
};

export const sendGatheringMessage = (gatheringId, senderId, senderName, content) => {
  const data = localStorage.getItem(KEYS.GATHERING_CHATS);
  const list = data ? JSON.parse(data) : [];
  const newMsg = {
    id: `gc-${Date.now()}`,
    gatheringId,
    senderId,
    senderName,
    content,
    timestamp: new Date().toISOString()
  };
  list.push(newMsg);
  localStorage.setItem(KEYS.GATHERING_CHATS, JSON.stringify(list));
  return newMsg;
};

