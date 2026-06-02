import { useState, useEffect, useRef } from 'react';
import './App.css';
import * as db from './services/dbService';
import {
  HomeIcon,
  HeartIcon,
  ChatIcon,
  UserIcon,
  PlusIcon,
  SearchIcon,
  ArrowLeftIcon,
  CameraIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  LogOutIcon,
  TrashIcon
} from './components/Icons';

function App() {
  // DB Initialization
  useEffect(() => {
    db.initDB();
  }, []);

  // Application States
  const [currentUser, setCurrentUser] = useState(db.getCurrentUser());
  const [currentView, setCurrentView] = useState(currentUser ? 'home' : 'login');
  
  // Navigation stack helper (for easy back navigation)
  const [viewHistory, setViewHistory] = useState(['home']);

  // Listing page states
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [feedType, setFeedType] = useState('give'); // 'give' (나눠요) or 'receive' (구해요)

  // Detail page states
  const [activeItemId, setActiveItemId] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Chat page states
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoomKey, setActiveRoomKey] = useState(null);
  const [chatInput, setChatInput] = useState('');
  
  // User profile page states
  const [profileUserEmail, setProfileUserEmail] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', nickname: '', parish: '', address: '', contact: '' });

  // Registration states
  const [newItemForm, setNewItemForm] = useState({
    type: 'give', // 'give' or 'receive'
    title: '',
    category: '교구/완구',
    description: '',
    tradeLocation: '',
    images: []
  });

  // Auth states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    name: '',
    nickname: '',
    parish: '1교구',
    address: '',
    contact: '',
    isVerified: false
  });
  const [authError, setAuthError] = useState('');

  const chatEndRef = useRef(null);

  // Load items from local storage whenever view changes or on init
  useEffect(() => {
    if (currentUser) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setItems(db.getItems());
      setChatRooms(db.getChatRoomsForUser(currentUser.email));
    }
  }, [currentView, currentUser]);

  // Scroll to bottom of chat when messages or active room changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoomKey, chatRooms]);

  // Navigation Logic
  const navigateTo = (view) => {
    setViewHistory(prev => [...prev, view]);
    setCurrentView(view);
  };

  const navigateBack = () => {
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop(); // Remove current
      const prevView = newHistory[newHistory.length - 1];
      setViewHistory(newHistory);
      setCurrentView(prevView);
    } else {
      navigateTo('home');
    }
    // Clean up temporary states
    setIsEditingProfile(false);
  };

  // Auth Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    try {
      const user = db.login(loginForm.email, loginForm.password);
      setCurrentUser(user);
      setLoginForm({ email: '', password: '' });
      setAuthError('');
      setViewHistory(['home']);
      setCurrentView('home');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    try {
      const newUser = db.createUser(signupForm);
      db.setCurrentUser(newUser);
      setCurrentUser(newUser);
      setSignupForm({
        email: '',
        password: '',
        name: '',
        nickname: '',
        parish: '1교구',
        address: '',
        contact: '',
        isVerified: false
      });
      setAuthError('');
      setViewHistory(['home']);
      setCurrentView('home');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    setCurrentView('login');
    setViewHistory(['login']);
  };

  // Profile Edit Handlers
  const startEditingProfile = () => {
    setEditForm({
      name: currentUser.name,
      nickname: currentUser.nickname || '',
      parish: currentUser.parish,
      address: currentUser.address,
      contact: currentUser.contact
    });
    setIsEditingProfile(true);
  };

  const saveProfile = (e) => {
    e.preventDefault();
    try {
      const updated = db.updateUser(currentUser.email, editForm);
      setCurrentUser(updated);
      setIsEditingProfile(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Item Registration Handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - newItemForm.images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemForm(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setNewItemForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleRegisterItem = (e) => {
    e.preventDefault();
    if (!newItemForm.title.trim() || !newItemForm.description.trim() || !newItemForm.tradeLocation.trim()) {
      alert('물건 이름, 설명, 희망거래장소를 모두 작성해주세요.');
      return;
    }

    try {
      db.createItem(newItemForm);
      setNewItemForm({
        type: 'give',
        title: '',
        category: '교구/완구',
        description: '',
        tradeLocation: '',
        images: []
      });
      navigateTo('home');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('정말 이 물건 나눔글을 삭제하시겠습니까?')) {
      db.deleteItem(itemId);
      setItems(db.getItems());
      navigateBack();
    }
  };

  // Favorite handler
  const handleToggleFav = (itemId, e) => {
    if (e) e.stopPropagation();
    db.toggleFavorite(currentUser.email, itemId);
    // Trigger render update
    setItems(db.getItems());
  };

  // Chat initiation / routing
  const handleStartChat = (item) => {
    if (item.sellerId === currentUser.email) {
      alert('본인이 등록한 물건입니다.');
      return;
    }
    const room = db.getOrCreateChatRoom(item.id, currentUser.email);
    setActiveRoomKey(room.roomKey);
    navigateTo('chat-room');
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const room = chatRooms.find(r => r.roomKey === activeRoomKey) || 
                 db.getOrCreateChatRoom(activeItemId, currentUser.email);

    db.sendMessage(room.itemId, room.buyerId, room.sellerId, currentUser.email, chatInput);
    setChatInput('');
    // Refresh rooms
    setChatRooms(db.getChatRoomsForUser(currentUser.email));
  };

  // Relative Time Helper
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString();
  };

  // Filtering Logic
  const filteredItems = items.filter(item => {
    const matchesFeedType = (item.type || 'give') === feedType;
    const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFeedType && matchesCategory && matchesSearch;
  });

  const categories = ['전체', '교구/완구', '아동 도서', '유아용품', '가구/식기', '기타'];

  // Detail Item Reference
  const activeItem = items.find(i => i.id === activeItemId);

  // Active chat room details
  const activeChatRoom = chatRooms.find(r => r.roomKey === activeRoomKey) || 
                         (activeItemId ? db.getOrCreateChatRoom(activeItemId, currentUser?.email) : null);

  return (
    <div className="app-container">
      {/* 1. AUTHENTICATION PAGES */}
      {currentView === 'login' && (
        <div className="app-content auth-screen animate-fade-in">
          <div className="auth-header">
            <div className="auth-logo" style={{ overflow: 'hidden', padding: '6px', backgroundColor: '#ffffff' }}>
              <img src="/favicon.ico" alt="동숭교회 나눔터 로고" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 className="auth-title">동숭교회 나눔터</h1>
            <p className="auth-subtitle">우리 교구 이웃들과 함께하는 따뜻한 나눔</p>
          </div>
          <div className="auth-card">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">이메일 주소</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="name@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">비밀번호</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="비밀번호를 입력하세요"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required 
                />
              </div>
              {authError && <p style={{ color: 'var(--danger)', fontSize: '12px', marginBottom: '16px' }}>{authError}</p>}
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>로그인</button>
            </form>
          </div>
          <div className="auth-footer">
            계정이 없으신가요? 
            <span className="auth-link" onClick={() => navigateTo('signup')}>회원가입하기</span>
          </div>
        </div>
      )}

      {currentView === 'signup' && (
        <div className="app-content auth-screen animate-fade-in" style={{ paddingBottom: '30px' }}>
          <div className="auth-header" style={{ marginBottom: '20px' }}>
            <h1 className="auth-title">이웃 등록하기</h1>
            <p className="auth-subtitle">계정을 생성하여 나눔을 시작해보세요</p>
          </div>
          <div className="auth-card" style={{ padding: '20px' }}>
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">이메일 주소</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="name@example.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">비밀번호</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="6자 이상 비밀번호"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">이름</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="실명을 입력하세요"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">별명 (닉네임)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="별명을 입력하세요"
                  value={signupForm.nickname}
                  onChange={(e) => setSignupForm({...signupForm, nickname: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">소속 교구</label>
                <select 
                  className="form-input"
                  value={signupForm.parish}
                  onChange={(e) => setSignupForm({...signupForm, parish: e.target.value})}
                >
                  <option value="1교구">1교구</option>
                  <option value="2교구">2교구</option>
                  <option value="3교구">3교구</option>
                  <option value="4교구">4교구</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">연락처 및 교인인증</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="010-XXXX-XXXX"
                    value={signupForm.contact}
                    onChange={(e) => setSignupForm({...signupForm, contact: e.target.value})}
                    required 
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: 'auto', whiteSpace: 'nowrap', padding: '0 16px', borderRadius: 'var(--border-radius-md)' }}
                    onClick={() => {
                      if (!signupForm.contact.trim()) {
                        alert('전화번호를 먼저 입력해 주세요.');
                        return;
                      }
                      setSignupForm({...signupForm, isVerified: true});
                      alert('동숭교회 교인인증이 완료되었습니다.');
                    }}
                    disabled={signupForm.isVerified}
                  >
                    {signupForm.isVerified ? '인증됨 ✓' : '교인인증'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">거래 희망 주소</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: 서울시 마포구 합정동"
                  value={signupForm.address}
                  onChange={(e) => setSignupForm({...signupForm, address: e.target.value})}
                  required 
                />
              </div>
              {authError && <p style={{ color: 'var(--danger)', fontSize: '12px', marginBottom: '16px' }}>{authError}</p>}
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>이웃 등록 완료</button>
            </form>
          </div>
          <div className="auth-footer">
            이미 계정이 있으신가요? 
            <span className="auth-link" onClick={() => navigateTo('login')}>로그인하기</span>
          </div>
        </div>
      )}

      {/* 2. REGULAR APP TEMPLATE (With Header and Tab bar) */}
      {currentUser && currentView !== 'login' && currentView !== 'signup' && (
        <>
          {/* DYNAMIC HEADER */}
          <header className="app-header">
            {['item-detail', 'register-item', 'chat-room', 'user-profile'].includes(currentView) ? (
              <button className="btn-icon" onClick={navigateBack} title="뒤로 가기">
                <ArrowLeftIcon />
              </button>
            ) : (
              <div className="header-title" style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/favicon.ico" alt="" style={{ width: '22px', height: '22px', marginRight: '6px', objectFit: 'contain' }} /> 동숭교회 나눔터
              </div>
            )}

            {currentView === 'home' && (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', backgroundColor: 'var(--primary-light)', padding: '4px 8px', borderRadius: '12px' }}>
                {currentUser.parish}
              </span>
            )}

            {currentView === 'item-detail' && (
              <div style={{ fontSize: '15px', fontWeight: '700' }}>나눔 상세 정보</div>
            )}

            {currentView === 'register-item' && (
              <div style={{ fontSize: '15px', fontWeight: '700' }}>나눔 물건 등록</div>
            )}

            {currentView === 'chat-room' && activeChatRoom && (
              <div style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {activeChatRoom.counterpartName}
                {db.getUser(activeChatRoom.counterpartEmail)?.isVerified && <span className="verified-badge">교인인증</span>}
                <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '4px' }}>({activeChatRoom.counterpartParish})</span>
              </div>
            )}

            {currentView === 'wishlist' && <div style={{ fontSize: '16px', fontWeight: '700' }}>찜바구니</div>}
            {currentView === 'chats' && <div style={{ fontSize: '16px', fontWeight: '700' }}>채팅 메시지</div>}
            {currentView === 'mypage' && (
              <div style={{ fontSize: '16px', fontWeight: '700', display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>마이 페이지</span>
                <button className="btn-icon" onClick={handleLogout} title="로그아웃" style={{ color: 'var(--danger)' }}>
                  <LogOutIcon style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
            )}
            {currentView === 'user-profile' && <div style={{ fontSize: '15px', fontWeight: '700' }}>이웃 프로필</div>}

            {/* Home button on the right for sub-views */}
            {['item-detail', 'register-item', 'chat-room', 'user-profile'].includes(currentView) && (
              <button 
                className="btn-icon" 
                onClick={() => {
                  setViewHistory(['home']);
                  setCurrentView('home');
                }} 
                title="홈으로 가기"
              >
                <HomeIcon active={false} style={{ width: '20px', height: '20px' }} />
              </button>
            )}
          </header>

          {/* DYNAMIC VIEW CONTENT */}
          <main className="app-content animate-fade-in">
            {/* VIEW A: HOME / LISTINGS */}
            {currentView === 'home' && (
              <div className="animate-slide-up">
                {/* Search Bar */}
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <SearchIcon className="search-input-icon" />
                    <input 
                      type="text" 
                      className="search-field" 
                      placeholder={feedType === 'give' ? "나누고 싶은 물건을 검색하세요..." : "필요한 물건을 검색하세요..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Feed Type Selector */}
                <div className="feed-type-tabs">
                  <button 
                    type="button"
                    className={`feed-type-tab ${feedType === 'give' ? 'active' : ''}`}
                    onClick={() => { setFeedType('give'); setSelectedCategory('전체'); }}
                  >
                    🤝 나눠요 (드림)
                  </button>
                  <button 
                    type="button"
                    className={`feed-type-tab ${feedType === 'receive' ? 'active' : ''}`}
                    onClick={() => { setFeedType('receive'); setSelectedCategory('전체'); }}
                  >
                    🔍 구해요 (필요)
                  </button>
                </div>

                {/* Categories Tab bar */}
                <div className="categories-bar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Items Grid */}
                {filteredItems.length > 0 ? (
                  <div className="items-grid">
                    {filteredItems.map(item => {
                      const isFav = db.isFavorite(currentUser.email, item.id);
                      return (
                        <div 
                          key={item.id} 
                          className="item-card" 
                          onClick={() => {
                            setActiveItemId(item.id);
                            setCarouselIndex(0);
                            navigateTo('item-detail');
                          }}
                        >
                          <div className="item-card-img-wrapper">
                            {item.images && item.images.length > 0 ? (
                              <img 
                                src={item.images[0]} 
                                alt={item.title} 
                                className="item-card-img" 
                              />
                            ) : (
                              <div className="item-card-placeholder">
                                <span style={{ fontSize: '32px' }}>🙋🏻‍♀️</span>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', marginTop: '6px' }}>구해요 (위시리스트)</span>
                              </div>
                            )}
                            <div className="item-card-badge" style={{ backgroundColor: item.type === 'receive' ? 'var(--accent)' : 'var(--primary)' }}>
                              {item.type === 'receive' ? '구해요' : item.category}
                            </div>
                            <button 
                              className="item-card-fav"
                              onClick={(e) => handleToggleFav(item.id, e)}
                            >
                              <HeartIcon fill={isFav} style={{ width: '16px', height: '16px' }} />
                            </button>
                          </div>
                          <div className="item-card-info">
                            <h3 className="item-card-title">{item.title}</h3>
                            <div className="item-card-parish">
                              <MapPinIcon style={{ width: '11px', height: '11px' }} />
                              {item.sellerParish} • {item.sellerName}
                              {db.getUser(item.sellerId)?.isVerified && <span className="verified-badge">교인인증</span>}
                            </div>
                            <div className="item-card-footer">
                              <span className="item-card-status" style={{ backgroundColor: item.type === 'receive' ? 'var(--accent-light)' : 'var(--primary-light)', color: item.type === 'receive' ? 'var(--accent)' : 'var(--primary)' }}>
                                {item.type === 'receive' ? '필요해요' : '무료 나눔'}
                              </span>
                              <span className="item-card-time">{getRelativeTime(item.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                    등록된 {feedType === 'give' ? '나눔' : '필요'} 물건이 없습니다.
                  </div>
                )}

                {/* Floating Action Button (FAB) */}
                <button className="fab" onClick={() => navigateTo('register-item')} title="물건 등록">
                  <PlusIcon style={{ width: '28px', height: '28px' }} />
                </button>
              </div>
            )}

            {/* VIEW B: WISHLIST */}
            {currentView === 'wishlist' && (
              <div className="animate-slide-up">
                {items.filter(item => db.isFavorite(currentUser.email, item.id)).length > 0 ? (
                  <div className="items-grid">
                    {items.filter(item => db.isFavorite(currentUser.email, item.id)).map(item => (
                      <div 
                        key={item.id} 
                        className="item-card" 
                        onClick={() => {
                          setActiveItemId(item.id);
                          setCarouselIndex(0);
                          navigateTo('item-detail');
                        }}
                      >
                        <div className="item-card-img-wrapper">
                          <img 
                            src={item.images[0] || '/mock_item_blocks.png'} 
                            alt={item.title} 
                            className="item-card-img" 
                          />
                          <div className="item-card-badge">{item.category}</div>
                          <button 
                            className="item-card-fav"
                            onClick={(e) => handleToggleFav(item.id, e)}
                          >
                            <HeartIcon fill={true} style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                        <div className="item-card-info">
                          <h3 className="item-card-title">{item.title}</h3>
                          <div className="item-card-parish">
                            <MapPinIcon style={{ width: '11px', height: '11px' }} />
                            {item.sellerParish} • {item.sellerName}
                          </div>
                          <div className="item-card-footer">
                            <span className="item-card-status">무료 나눔</span>
                            <span className="item-card-time">{getRelativeTime(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>❤️</div>
                    <p style={{ fontWeight: '500', marginBottom: '4px' }}>찜바구니가 비어 있습니다</p>
                    <p style={{ fontSize: '13px' }}>마음에 드는 이웃의 나눔 물건에 하트를 눌러보세요.</p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW C: CHATS ROOMS LIST */}
            {currentView === 'chats' && (
              <div className="animate-slide-up chat-list">
                {chatRooms.length > 0 ? (
                  chatRooms.map(room => (
                    <div 
                      key={room.roomKey} 
                      className="chat-list-row"
                      onClick={() => {
                        setActiveRoomKey(room.roomKey);
                        navigateTo('chat-room');
                      }}
                    >
                      <div className="chat-list-avatar">
                        {room.counterpartName.substring(0, 1)}
                      </div>
                      <div className="chat-list-info">
                        <div className="chat-list-name-time">
                          <span className="chat-list-name">
                            {room.counterpartName}
                            {db.getUser(room.counterpartEmail)?.isVerified && <span className="verified-badge" style={{ fontSize: '9px', padding: '1px 4px' }}>교인인증</span>}
                            <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '6px' }}>{room.counterpartParish}</span>
                          </span>
                          <span className="chat-list-time">{getRelativeTime(room.lastMessageTime)}</span>
                        </div>
                        <p className="chat-list-preview">{room.lastMessage || '대화방이 개설되었습니다.'}</p>
                        <span className="chat-list-item-title">나눔: {room.itemTitle}</span>
                      </div>
                      <img src={room.itemImage || '/mock_item_blocks.png'} alt="" className="chat-list-img" />
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                    <p style={{ fontWeight: '500', marginBottom: '4px' }}>진행 중인 채팅이 없습니다</p>
                    <p style={{ fontSize: '13px' }}>나눔 상품 상세 페이지에서 '채팅하기'를 누르면 대화가 시작됩니다.</p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW D: MY PAGE */}
            {currentView === 'mypage' && (
              <div className="animate-slide-up">
                {/* Profile display */}
                <div className="profile-card">
                  <div className="profile-avatar-large">
                    {currentUser.name.substring(0, 1)}
                  </div>
                  <div className="profile-meta-info">
                    <span className="profile-meta-name" style={{ display: 'flex', alignItems: 'center' }}>
                      {currentUser.name}
                      {currentUser.isVerified && <span className="verified-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}>교인인증</span>}
                    </span>
                    <span className="profile-meta-parish">{currentUser.parish} 소속 이웃</span>
                  </div>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={saveProfile} className="profile-details-list animate-fade-in" style={{ gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label className="form-label">이름</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label className="form-label">별명</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editForm.nickname}
                        onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label className="form-label">교구</label>
                      <select 
                        className="form-input"
                        value={editForm.parish}
                        onChange={(e) => setEditForm({...editForm, parish: e.target.value})}
                      >
                        <option value="1교구">1교구</option>
                        <option value="2교구">2교구</option>
                        <option value="3교구">3교구</option>
                        <option value="4교구">4교구</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label className="form-label">거래 주소</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label">연락처</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editForm.contact}
                        onChange={(e) => setEditForm({...editForm, contact: e.target.value})}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '8px' }}>저장</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setIsEditingProfile(false)} style={{ flex: 1, padding: '8px' }}>취소</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="profile-details-list">
                      <div className="profile-detail-row">
                        <UserIcon className="profile-detail-icon" />
                        <div className="profile-detail-label-val">
                          <span className="profile-detail-label">별명</span>
                          <span className="profile-detail-val">{currentUser.nickname || '없음'}</span>
                        </div>
                      </div>
                      <div className="profile-detail-row">
                        <MailIcon className="profile-detail-icon" />
                        <div className="profile-detail-label-val">
                          <span className="profile-detail-label">이메일 주소</span>
                          <span className="profile-detail-val">{currentUser.email}</span>
                        </div>
                      </div>
                      <div className="profile-detail-row">
                        <MapPinIcon className="profile-detail-icon" />
                        <div className="profile-detail-label-val">
                          <span className="profile-detail-label">소속 교구</span>
                          <span className="profile-detail-val">{currentUser.parish}</span>
                        </div>
                      </div>
                      <div className="profile-detail-row">
                        <MapPinIcon className="profile-detail-icon" style={{ opacity: 0.5 }} />
                        <div className="profile-detail-label-val">
                          <span className="profile-detail-label">거래 희망 주소</span>
                          <span className="profile-detail-val">{currentUser.address}</span>
                        </div>
                      </div>
                      <div className="profile-detail-row">
                        <PhoneIcon className="profile-detail-icon" />
                        <div className="profile-detail-label-val">
                          <span className="profile-detail-label">연락처</span>
                          <span className="profile-detail-val">{currentUser.contact}</span>
                        </div>
                      </div>
                      <button className="btn btn-secondary" onClick={startEditingProfile} style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '10px', marginTop: '4px' }}>
                        내 정보 수정하기
                      </button>
                    </div>

                    <div className="profile-section-title">
                      <span>내 나눔 등록 물건</span>
                    </div>

                    {items.filter(i => i.sellerId === currentUser.email).length > 0 ? (
                      <div className="items-grid">
                        {items.filter(i => i.sellerId === currentUser.email).map(item => (
                          <div 
                            key={item.id} 
                            className="item-card" 
                            onClick={() => {
                              setActiveItemId(item.id);
                              setCarouselIndex(0);
                              navigateTo('item-detail');
                            }}
                          >
                            <div className="item-card-img-wrapper">
                              <img 
                                src={item.images[0] || '/mock_item_blocks.png'} 
                                alt={item.title} 
                                className="item-card-img" 
                              />
                            </div>
                            <div className="item-card-info">
                              <h3 className="item-card-title">{item.title}</h3>
                              <div className="item-card-footer">
                                <span className="item-card-status">무료 나눔</span>
                                <span className="item-card-time">{getRelativeTime(item.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="profile-empty-state">
                        아직 등록한 물건이 없습니다.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* VIEW E: ITEM REGISTER PAGE */}
            {currentView === 'register-item' && (
              <form onSubmit={handleRegisterItem} className="animate-slide-up" style={{ paddingBottom: '40px' }}>
                <div className="form-group">
                  <label className="form-label">등록 구분</label>
                  <div className="feed-type-tabs" style={{ marginBottom: '0' }}>
                    <button 
                      type="button"
                      className={`feed-type-tab ${newItemForm.type === 'give' ? 'active' : ''}`}
                      onClick={() => setNewItemForm({...newItemForm, type: 'give'})}
                    >
                      🤝 나눠요 (드림)
                    </button>
                    <button 
                      type="button"
                      className={`feed-type-tab ${newItemForm.type === 'receive' ? 'active' : ''}`}
                      onClick={() => setNewItemForm({...newItemForm, type: 'receive'})}
                    >
                      🔍 구해요 (필요)
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    물건 사진 등록 {newItemForm.type === 'receive' ? '(선택사항, 최대 5장)' : '(최대 5장)'}
                  </label>
                  <div className="photo-upload-container">
                    {/* Add Photo Button (only if < 5) */}
                    {newItemForm.images.length < 5 && (
                      <label className="photo-slot">
                        <CameraIcon style={{ width: '24px', height: '24px' }} />
                        <span>{newItemForm.images.length}/5</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleImageUpload} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    )}
                    
                    {/* Thumbnails */}
                    {newItemForm.images.map((img, index) => (
                      <div key={index} className="uploaded-photo-slot">
                        <img src={img} alt={`Upload ${index}`} />
                        <button 
                          type="button" 
                          className="remove-photo-btn"
                          onClick={() => handleRemoveImage(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">물건 이름</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={newItemForm.type === 'receive' ? "예: 아기 보행기 구합니다!" : "예: 리안 아기 유모차 드림합니다"}
                    value={newItemForm.title}
                    onChange={(e) => setNewItemForm({...newItemForm, title: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">카테고리</label>
                  <select 
                    className="form-input"
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({...newItemForm, category: e.target.value})}
                  >
                    <option value="교구/완구">교구/완구</option>
                    <option value="아동 도서">아동 도서</option>
                    <option value="유아용품">유아용품</option>
                    <option value="가구/식기">가구/식기</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">희망 거래 장소</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 동숭교회 로비 앞, 혜화역 2번 출구"
                    value={newItemForm.tradeLocation}
                    onChange={(e) => setNewItemForm({...newItemForm, tradeLocation: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">설명</label>
                  <textarea 
                    className="form-input" 
                    rows="6"
                    placeholder={newItemForm.type === 'receive' ? "구하는 물건의 모델명, 원하는 상태, 대여 혹은 양도 등 희망 거래 방식 등을 구체적으로 남겨주세요." : "물건의 상태, 사용 기간, 거래 방법(예: 비대면 문고리 거래) 등을 구체적으로 남겨주세요."}
                    style={{ resize: 'none', lineHeight: '1.5' }}
                    value={newItemForm.description}
                    onChange={(e) => setNewItemForm({...newItemForm, description: e.target.value})}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                  {newItemForm.type === 'receive' ? '위시리스트 등록 완료' : '나눔 글 등록 완료'}
                </button>
              </form>
            )}

            {/* VIEW F: ITEM DETAILS */}
            {currentView === 'item-detail' && activeItem && (
              <div className="animate-slide-up" style={{ paddingBottom: '80px' }}>
                {/* Image Slider */}
                <div className="detail-carousel">
                  <div 
                    className="carousel-track"
                    style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                  >
                    {activeItem.images && activeItem.images.length > 0 ? (
                      activeItem.images.map((img, idx) => (
                        <div key={idx} className="carousel-slide">
                          <img src={img} alt={`${activeItem.title} ${idx + 1}`} />
                        </div>
                      ))
                    ) : (
                      <div className="carousel-slide" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-light)', height: '100%', padding: '20px', textAlign: 'center' }}>
                        <span style={{ fontSize: '64px', marginBottom: '12px' }}>🙋🏻‍♀️</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>이웃의 도움이 필요한 물건입니다</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>사진은 참고용으로 생략되었습니다.</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Indicators */}
                  {activeItem.images && activeItem.images.length > 1 && (
                    <div className="carousel-indicators">
                      {activeItem.images.map((_, idx) => (
                        <button 
                          key={idx}
                          className={`carousel-dot ${carouselIndex === idx ? 'active' : ''}`}
                          onClick={() => setCarouselIndex(idx)}
                        ></button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Header item info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: activeItem.type === 'receive' ? 'var(--accent)' : 'var(--primary)', fontWeight: '600', backgroundColor: activeItem.type === 'receive' ? 'var(--accent-light)' : 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                    {activeItem.type === 'receive' ? '구해요 • ' : ''}{activeItem.category}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{getRelativeTime(activeItem.createdAt)}</span>
                </div>

                <h1 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: '700' }}>{activeItem.title}</h1>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <MapPinIcon style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
                  <span><strong>희망 거래 장소:</strong> {activeItem.tradeLocation || '교구 내 직거래'}</span>
                </div>

                {/* Seller Profile click to seller page */}
                <div className="seller-profile-bar">
                  <div 
                    className="seller-avatar-info"
                    onClick={() => {
                      setProfileUserEmail(activeItem.sellerId);
                      navigateTo('user-profile');
                    }}
                  >
                    <div className="avatar-circle">
                      {activeItem.sellerName.substring(0, 1)}
                    </div>
                    <div>
                      <div className="seller-name" style={{ display: 'flex', alignItems: 'center' }}>
                        {activeItem.sellerName}
                        {db.getUser(activeItem.sellerId)?.isVerified && <span className="verified-badge">교인인증</span>}
                      </div>
                      <div className="seller-parish">{activeItem.sellerParish} 소속 이웃</div>
                    </div>
                  </div>
                  
                  {activeItem.sellerId === currentUser.email && (
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDeleteItem(activeItem.id)}
                      style={{ color: 'var(--danger)' }}
                      title="삭제"
                    >
                      <TrashIcon style={{ width: '20px', height: '20px' }} />
                    </button>
                  )}
                </div>

                {/* Product Description */}
                <div style={{ padding: '4px 0 20px 0' }}>
                  <p style={{ fontSize: '15px', color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                    {activeItem.description}
                  </p>
                </div>

                {/* Bottom Sticky Action Bar */}
                <div className="detail-bottom-actions">
                  <button 
                    className={`detail-fav-btn ${db.isFavorite(currentUser.email, activeItem.id) ? 'active' : ''}`}
                    onClick={() => handleToggleFav(activeItem.id)}
                  >
                    <HeartIcon fill={db.isFavorite(currentUser.email, activeItem.id)} />
                  </button>
                  
                  {activeItem.sellerId === currentUser.email ? (
                    <button className="btn btn-secondary" style={{ flex: 1, cursor: 'default' }} disabled>
                      {activeItem.type === 'receive' ? '내가 올린 위시리스트' : '내가 올린 나눔 상품'}
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleStartChat(activeItem)}>
                      {activeItem.type === 'receive' ? '나눔 제안하기' : '이웃과 채팅하기'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* VIEW G: 1:1 CHAT ROOM */}
            {currentView === 'chat-room' && activeChatRoom && (
              <div className="chat-room-container animate-fade-in">
                {/* Sticky product context header inside chat */}
                <div 
                  className="chat-item-header"
                  onClick={() => {
                    const item = items.find(i => i.id === activeChatRoom.itemId);
                    if (item) {
                      setActiveItemId(item.id);
                      setCarouselIndex(0);
                      navigateTo('item-detail');
                    } else {
                      alert('삭제된 상품입니다.');
                    }
                  }}
                >
                  <img src={activeChatRoom.itemImage || '/mock_item_blocks.png'} alt="" className="chat-item-thumb" />
                  <div className="chat-item-title-status">
                    <span className="chat-item-title">{activeChatRoom.itemTitle}</span>
                    <span className="chat-item-status">무료 나눔 물건 보기 〉</span>
                  </div>
                </div>

                {/* Message list */}
                <div className="chat-messages-scroll">
                  {activeChatRoom.messages && activeChatRoom.messages.length > 0 ? (
                    activeChatRoom.messages.map(msg => {
                      const isMe = msg.senderId === currentUser.email;
                      return (
                        <div key={msg.id} className={`message-bubble-wrapper ${isMe ? 'me' : 'other'}`}>
                          {!isMe && <span className="message-sender-name">{activeChatRoom.counterpartName}</span>}
                          <div className="message-bubble-row">
                            <div className="message-bubble">{msg.content}</div>
                            <span className="message-time">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                      채팅방이 생성되었습니다. 정중하고 따뜻한 메시지로 대화를 시작해 보세요!
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendChatMessage} className="chat-input-bar">
                  <input 
                    type="text" 
                    className="chat-input-field" 
                    placeholder="메시지를 입력하세요..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="chat-send-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </form>
              </div>
            )}

            {/* VIEW H: OTHER USER PROFILE PAGE */}
            {currentView === 'user-profile' && profileUserEmail && (
              <div className="animate-slide-up">
                {(() => {
                  const pUser = db.getUser(profileUserEmail);
                  if (!pUser) return <p>사용자를 찾을 수 없습니다.</p>;
                  return (
                    <>
                      <div className="profile-card">
                        <div className="profile-avatar-large">
                          {pUser.name.substring(0, 1)}
                        </div>
                        <div className="profile-meta-info">
                          <span className="profile-meta-name" style={{ display: 'flex', alignItems: 'center' }}>
                            {pUser.name}
                            {pUser.isVerified && <span className="verified-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}>교인인증</span>}
                          </span>
                          <span className="profile-meta-parish">{pUser.parish} 소속 이웃</span>
                        </div>
                      </div>

                      <div className="profile-details-list">
                        <div className="profile-detail-row">
                          <MapPinIcon className="profile-detail-icon" />
                          <div className="profile-detail-label-val">
                            <span className="profile-detail-label">거래 희망 주소</span>
                            <span className="profile-detail-val">{pUser.address}</span>
                          </div>
                        </div>
                        <div className="profile-detail-row">
                          <PhoneIcon className="profile-detail-icon" />
                          <div className="profile-detail-label-val">
                            <span className="profile-detail-label">연락처</span>
                            <span className="profile-detail-val">{pUser.contact}</span>
                          </div>
                        </div>
                        <div className="profile-detail-row">
                          <MailIcon className="profile-detail-icon" />
                          <div className="profile-detail-label-val">
                            <span className="profile-detail-label">이메일 주소</span>
                            <span className="profile-detail-val">{pUser.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="profile-section-title">
                        <span>{pUser.name} 님이 등록한 물건 목록</span>
                      </div>

                      {items.filter(i => i.sellerId === pUser.email).length > 0 ? (
                        <div className="items-grid">
                          {items.filter(i => i.sellerId === pUser.email).map(item => (
                            <div 
                              key={item.id} 
                              className="item-card" 
                              onClick={() => {
                                setActiveItemId(item.id);
                                setCarouselIndex(0);
                                navigateTo('item-detail');
                              }}
                            >
                              <div className="item-card-img-wrapper">
                                <img 
                                  src={item.images[0] || '/mock_item_blocks.png'} 
                                  alt={item.title} 
                                  className="item-card-img" 
                                />
                              </div>
                              <div className="item-card-info">
                                <h3 className="item-card-title">{item.title}</h3>
                                <div className="item-card-footer">
                                  <span className="item-card-status">무료 나눔</span>
                                  <span className="item-card-time">{getRelativeTime(item.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="profile-empty-state">
                          등록된 물건이 없습니다.
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </main>

          {/* BOTTOM TAB BAR (Hidden in sub-views like register, details, and active chatroom for native immersion) */}
          {!['register-item', 'item-detail', 'chat-room', 'user-profile'].includes(currentView) && (
            <nav className="bottom-tabbar animate-fade-in">
              <button 
                className={`tab-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => {
                  setViewHistory(['home']);
                  setCurrentView('home');
                }}
              >
                <HomeIcon active={currentView === 'home'} />
                <span>나눔 홈</span>
              </button>

              <button 
                className={`tab-item ${currentView === 'wishlist' ? 'active' : ''}`}
                onClick={() => {
                  setViewHistory(['home']); // Ensure going back goes home
                  navigateTo('wishlist');
                }}
              >
                <HeartIcon active={currentView === 'wishlist'} />
                <span>찜바구니</span>
              </button>

              <button 
                className={`tab-item ${currentView === 'chats' ? 'active' : ''}`}
                onClick={() => {
                  setViewHistory(['home']);
                  navigateTo('chats');
                }}
              >
                <ChatIcon active={currentView === 'chats'} />
                <span>채팅 목록</span>
              </button>

              <button 
                className={`tab-item ${currentView === 'mypage' ? 'active' : ''}`}
                onClick={() => {
                  setViewHistory(['home']);
                  navigateTo('mypage');
                }}
              >
                <UserIcon active={currentView === 'mypage'} />
                <span>내 정보</span>
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default App;
