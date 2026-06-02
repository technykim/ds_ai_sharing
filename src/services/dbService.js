// LocalStorage Mock Database Service for DS-AI-secondhandmarket

const KEYS = {
  USERS: 'market_users',
  ITEMS: 'market_items',
  FAVORITES: 'market_favorites',
  CHATS: 'market_chats',
  CURRENT_USER: 'market_current_user'
};

const INITIAL_USERS = [
  {
    email: 'user1@example.com',
    password: 'password123',
    name: '김사랑',
    nickname: '사랑지기',
    parish: '1교구',
    address: '서울시 강남구 역삼동 123-45',
    contact: '010-1234-5678'
  },
  {
    email: 'user2@example.com',
    password: 'password123',
    name: '박소망',
    nickname: '소망나누미',
    parish: '2교구',
    address: '서울시 마포구 합정동 98-7',
    contact: '010-8765-4321'
  },
  {
    email: 'user3@example.com',
    password: 'password123',
    name: '이믿음',
    nickname: '믿음가득',
    parish: '3교구',
    address: '서울시 성동구 성수동 45-6',
    contact: '010-5678-1234'
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
    tradeLocation: '동숭교회 로비 앞',
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
    tradeLocation: '동숭교회 지하 주차장',
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
    tradeLocation: '동숭교회 로비 앞',
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

const DB_VERSION_KEY = 'market_db_version';
const CURRENT_DB_VERSION = 'v3_wishlist';

// Helper to initialize DB
export const initDB = () => {
  const storedVersion = localStorage.getItem(DB_VERSION_KEY);
  if (storedVersion !== CURRENT_DB_VERSION) {
    // Force reset local storage keys to apply new database schema (nicknames, numeric parishes, tradeLocation)
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.ITEMS);
    localStorage.removeItem(KEYS.FAVORITES);
    localStorage.removeItem(KEYS.CHATS);
    localStorage.removeItem(KEYS.CURRENT_USER);
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
  users.push(user);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  return user;
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
  setCurrentUser(user);
  return user;
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
  const buyer = users.find(u => u.email === buyerId);
  
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
