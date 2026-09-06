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
  TrashIcon,
  UsersIcon,
  XIcon,
  GiftIcon
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
  const [myPageTab, setMyPageTab] = useState('wishlist'); // 'wishlist' or 'myitems'

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
    isVerified: false,
    recommenderType: '구역담당목회자',
    recommenderDetail: ''
  });
  const [authError, setAuthError] = useState('');
  const [showUserApprovalModal, setShowUserApprovalModal] = useState(false);
  const [pendingUsersList, setPendingUsersList] = useState([]);

  // Service Switcher State
  const [mainServiceTab, setMainServiceTab] = useState('nanum'); // 'nanum' or 'moim'

  // Gathering States
  const [gatherings, setGatherings] = useState([]);
  const [moimCategory, setMoimCategory] = useState('전체');
  const [activeMoimId, setActiveMoimId] = useState(null);
  const [moimSubTab, setMoimSubTab] = useState('info'); // 'info', 'notice', 'calendar', 'chat', 'review'
  
  // Gathering Registration Form State
  const [newMoimForm, setNewMoimForm] = useState({
    title: '',
    category: '기도모임',
    shortDesc: '',
    longDesc: '',
    images: []
  });

  // Gathering Sub-features States
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    location: '',
    description: ''
  });
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    content: '',
    rating: 5,
    images: []
  });
  const [moimChatInput, setMoimChatInput] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const chatEndRef = useRef(null);
  const moimChatEndRef = useRef(null);

  // Load items & gatherings from local storage whenever view changes or on init
  useEffect(() => {
    if (currentUser) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setItems(db.getItems());
      setChatRooms(db.getChatRoomsForUser(currentUser.email));
      setGatherings(db.getGatherings());
    }
  }, [currentView, currentUser, mainServiceTab]);

  // Scroll to bottom of chat when messages or active room changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoomKey, chatRooms]);

  const navigateTo = (view) => {
    if (view === 'wishlist') {
      setMyPageTab('wishlist');
      setViewHistory(prev => [...prev, 'mypage']);
      setCurrentView('mypage');
      return;
    }
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
    if (!signupForm.recommenderDetail.trim()) {
      setAuthError('추천인의 이름을 입력해 주세요.');
      return;
    }
    try {
      db.createUser(signupForm);
      alert('회원가입 신청이 완료되었습니다!\n추천인(구역장/목회자)의 승인 완료 후 로그인하실 수 있습니다.');
      setSignupForm({
        email: '',
        password: '',
        name: '',
        nickname: '',
        parish: '1교구',
        address: '',
        contact: '',
        isVerified: false,
        recommenderType: '구역담당목회자',
        recommenderDetail: ''
      });
      setAuthError('가입 승인 대기 중입니다. 추천인(구역장/목회자)의 승인 후 로그인이 가능합니다.');
      navigateTo('login');
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
      alert('물건 이름, 설명, 희망거래시간장소를 모두 작성해주세요.');
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

  // Gathering Handlers
  const handleMoimImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    if (newMoimForm.images.length + files.length > 5) {
      alert('이미지는 최대 5장까지 업로드할 수 있습니다.');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMoimForm(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReviewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReviewForm(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateMoim = (e) => {
    e.preventDefault();
    if (!newMoimForm.title.trim() || !newMoimForm.shortDesc.trim() || !newMoimForm.longDesc.trim()) {
      alert('모임 이름과 설명을 입력해주세요.');
      return;
    }
    const created = db.createGathering({
      ...newMoimForm,
      leaderId: currentUser.email,
      leaderName: currentUser.name,
      leaderParish: currentUser.parish
    });
    setGatherings(db.getGatherings());
    setActiveMoimId(created.id);
    setMoimSubTab('info');
    setNewMoimForm({ title: '', category: '기도모임', shortDesc: '', longDesc: '', images: [] });
    navigateTo('moim-detail');
  };

  const handleApplyMoim = (moimId) => {
    db.applyGatheringMember(moimId, currentUser);
    setGatherings(db.getGatherings());
    alert('모임 참여 신청이 완료되었습니다. 모임장의 승인을 기다려주세요.');
  };

  const handleLeaveMoim = (moimId) => {
    if (window.confirm('정말로 모임에서 탈퇴하시겠습니까?')) {
      db.leaveGathering(moimId, currentUser.email);
      setGatherings(db.getGatherings());
      alert('모임에서 탈퇴되었습니다.');
    }
  };

  const handleApproveMember = (moimId, userEmail) => {
    db.approveGatheringMember(moimId, userEmail);
    setGatherings(db.getGatherings());
  };

  const handleRejectMember = (moimId, userEmail) => {
    db.rejectGatheringMember(moimId, userEmail);
    setGatherings(db.getGatherings());
  };

  const handleAddNotice = (moimId, e) => {
    e.preventDefault();
    if (!newNoticeContent.trim()) return;
    db.addGatheringNotice(moimId, currentUser.email, currentUser.name, newNoticeContent);
    setNewNoticeContent('');
    setGatherings(db.getGatherings());
  };

  const handleAddEvent = (moimId, e) => {
    e.preventDefault();
    if (!newEventForm.title.trim() || !newEventForm.date) return;
    db.addGatheringEvent(moimId, newEventForm.title, newEventForm.date, newEventForm.time, newEventForm.location, newEventForm.description);
    setNewEventForm({ title: '', date: new Date().toISOString().split('T')[0], time: '19:00', location: '', description: '' });
    setShowAddEventModal(false);
    setGatherings(db.getGatherings());
  };

  const handleAddReview = (moimId, e) => {
    e.preventDefault();
    if (!newReviewForm.content.trim()) return;
    db.addGatheringReview(moimId, currentUser.email, currentUser.name, newReviewForm.content, newReviewForm.images, newReviewForm.rating);
    setNewReviewForm({ content: '', rating: 5, images: [] });
    setGatherings(db.getGatherings());
  };

  const handleSendMoimChat = (moimId, e) => {
    e.preventDefault();
    if (!moimChatInput.trim()) return;
    db.sendGatheringMessage(moimId, currentUser.email, currentUser.name, moimChatInput);
    setMoimChatInput('');
    setGatherings(db.getGatherings());
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
              <img src="/favicon.ico" alt="당근교회지 로고" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 className="auth-title">당근교회지</h1>
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
              {authError && (
                <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(224, 93, 93, 0.3)', borderRadius: 'var(--border-radius-sm)', padding: '10px 12px', fontSize: '13px', marginBottom: '16px', lineHeight: '1.4' }}>
                  ⚠️ {authError}
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>로그인</button>
            </form>
          </div>
          <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              계정이 없으신가요? 
              <span className="auth-link" onClick={() => navigateTo('signup')}>회원가입하기</span>
            </div>
            
            {/* Pastor / Leader Mock User Approval Button */}
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                const pending = db.getPendingUsers();
                setPendingUsersList(pending);
                setShowUserApprovalModal(true);
              }}
              style={{ fontSize: '12px', padding: '8px 12px', marginTop: '8px', border: '1px dashed var(--accent)', color: 'var(--accent-hover)' }}
            >
              🔔 목회자/구역장 회원 가입 승인 관리 {db.getPendingUsers().length > 0 && `(${db.getPendingUsers().length}건 대기)`}
            </button>
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
                      alert('교인인증이 완료되었습니다.');
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

              <div className="form-group">
                <label className="form-label">추천인 구분</label>
                <select 
                  className="form-input"
                  value={signupForm.recommenderType}
                  onChange={(e) => setSignupForm({...signupForm, recommenderType: e.target.value})}
                >
                  <option value="구역담당목회자">구역담당목회자</option>
                  <option value="구역장">구역장</option>
                  <option value="남여선교회장">남여선교회장</option>
                  <option value="기존가입자">기존가입자</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">추천인 이름</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="추천해주신 분의 이름을 입력하세요"
                  value={signupForm.recommenderDetail}
                  onChange={(e) => setSignupForm({...signupForm, recommenderDetail: e.target.value})}
                  required 
                />
              </div>

              {authError && <p style={{ color: 'var(--danger)', fontSize: '12px', marginBottom: '16px' }}>{authError}</p>}
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>이웃 등록 신청</button>
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
            {['item-detail', 'register-item', 'chat-room', 'user-profile', 'create-moim', 'moim-detail'].includes(currentView) ? (
              <button className="btn-icon" onClick={navigateBack} title="뒤로 가기">
                <ArrowLeftIcon />
              </button>
            ) : (
              <div className="header-title" style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/favicon.ico" alt="" style={{ width: '22px', height: '22px', marginRight: '6px', objectFit: 'contain' }} /> 당근교회지
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

            {currentView === 'create-moim' && (
              <div style={{ fontSize: '15px', fontWeight: '700' }}>새 소모임 개설</div>
            )}

            {currentView === 'moim-detail' && (
              <div style={{ fontSize: '15px', fontWeight: '700' }}>소모임 상세 정보</div>
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
            {['item-detail', 'register-item', 'chat-room', 'user-profile', 'create-moim', 'moim-detail'].includes(currentView) && (
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
            {currentView === 'home' && (
              <div className="animate-slide-up">
                {/* Service Title Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '2px 0' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {mainServiceTab === 'nanum' ? '🎁 물건 나눔' : '👥 소모임'}
                  </h2>
                </div>

                {/* SERVICE 1: NANUM MARKETPLACE */}
                {mainServiceTab === 'nanum' && (
                  <>
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

                    {/* Search Result Feedback Bar */}
                    {searchQuery.trim() !== '' && (
                      <div className="search-result-bar animate-fade-in">
                        <span>🔍 "{searchQuery}" 검색 결과 ({filteredItems.length}건)</span>
                        <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="검색 초기화">✕</button>
                      </div>
                    )}

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

                    {/* Floating Action Button (FAB) for Item */}
                    <button className="fab" onClick={() => navigateTo('register-item')} title="물건 등록">
                      <PlusIcon style={{ width: '28px', height: '28px' }} />
                    </button>
                  </>
                )}

                {/* SERVICE 2: GATHERINGS (소모임) */}
                {mainServiceTab === 'moim' && (
                  <div>
                    {/* Moim Search Bar */}
                    <div className="search-container">
                      <div className="search-input-wrapper">
                        <SearchIcon className="search-input-icon" />
                        <input 
                          type="text" 
                          className="search-field" 
                          placeholder="소모임 이름을 검색해보세요..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Search Result Feedback Bar for Moim */}
                    {searchQuery.trim() !== '' && (() => {
                      const count = gatherings.filter(g => {
                        const matchesCategory = moimCategory === '전체' || g.category === moimCategory;
                        const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchesCategory && matchesSearch;
                      }).length;

                      return (
                        <div className="search-result-bar animate-fade-in">
                          <span>🔍 "{searchQuery}" 소모임 검색 결과 ({count}건)</span>
                          <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="검색 초기화">✕</button>
                        </div>
                      );
                    })()}

                    {/* Moim Categories Bar */}
                    <div className="categories-bar">
                      {['전체', '기도모임', '운동모임', '취미모임', '성경공부모임', '기타'].map(cat => (
                        <button
                          key={cat}
                          className={`category-tab ${moimCategory === cat ? 'active' : ''}`}
                          onClick={() => setMoimCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Create Moim Top Action Button */}
                    <div style={{ marginBottom: '16px' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigateTo('create-moim')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <PlusIcon style={{ width: '18px', height: '18px' }} /> 새로운 소모임 개설하기
                      </button>
                    </div>

                    {/* Moim Cards List */}
                    {(() => {
                      const filteredMoims = gatherings.filter(g => {
                        const matchesCategory = moimCategory === '전체' || g.category === moimCategory;
                        const matchesSearch = searchQuery === '' || 
                          g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchesCategory && matchesSearch;
                      });

                      if (filteredMoims.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                            <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
                            <p style={{ fontWeight: '500', marginBottom: '4px' }}>등록된 소모임이 없습니다</p>
                            <p style={{ fontSize: '13px' }}>상단의 '새로운 소모임 개설하기' 버튼을 눌러 첫 모임을 만들어보세요!</p>
                          </div>
                        );
                      }

                      return (
                        <div className="moim-list">
                          {filteredMoims.map(moim => {
                            const members = db.getGatheringMembers(moim.id);
                            const approvedMembers = members.filter(m => m.status === 'approved');
                            const leaderUser = db.getUser(moim.leaderId);

                            return (
                              <div 
                                key={moim.id} 
                                className="moim-card"
                                onClick={() => {
                                  setActiveMoimId(moim.id);
                                  setMoimSubTab('info');
                                  navigateTo('moim-detail');
                                }}
                              >
                                <img 
                                  src={moim.images && moim.images.length > 0 ? moim.images[0] : '/mock_item_books.png'} 
                                  alt="" 
                                  className="moim-card-img" 
                                />
                                <div className="moim-card-body">
                                  <span className="moim-card-category">{moim.category}</span>
                                  <h3 className="moim-card-title">{moim.title}</h3>
                                  <p className="moim-card-desc">{moim.shortDesc}</p>
                                  <div className="moim-card-meta">
                                    <span>
                                      리더: {moim.leaderName}
                                      {leaderUser?.isVerified && <span className="verified-badge">교인인증</span>}
                                    </span>
                                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                      👥 {approvedMembers.length}명 참여 중
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
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

                    {/* Sub-tab selection inside My Page */}
                    <div className="service-switcher-bar" style={{ marginTop: '16px', marginBottom: '16px' }}>
                      <button 
                        type="button"
                        className={`service-switcher-btn ${myPageTab === 'wishlist' ? 'active' : ''}`}
                        onClick={() => setMyPageTab('wishlist')}
                      >
                        ❤️ 찜바구니 ({items.filter(item => db.isFavorite(currentUser.email, item.id)).length})
                      </button>
                      <button 
                        type="button"
                        className={`service-switcher-btn ${myPageTab === 'myitems' ? 'active' : ''}`}
                        onClick={() => setMyPageTab('myitems')}
                      >
                        🎁 내 등록 물건 ({items.filter(i => i.sellerId === currentUser.email).length})
                      </button>
                    </div>

                    {/* Tab 1: Wishlist */}
                    {myPageTab === 'wishlist' && (
                      <div className="animate-fade-in">
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
                          <div className="profile-empty-state" style={{ textAlign: 'center', padding: '30px 10px' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>❤️</div>
                            <p style={{ fontWeight: '600', marginBottom: '4px' }}>찜바구니가 비어 있습니다</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>마음에 드는 이웃의 나눔 물건에 하트를 눌러보세요.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: My Uploaded Items */}
                    {myPageTab === 'myitems' && (
                      <div className="animate-fade-in">
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
                  <label className="form-label">희망거래시간장소</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 2부예배 후 교회 앞마당"
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
                  <span><strong>희망거래시간장소:</strong> {activeItem.tradeLocation || '교구 내 직거래'}</span>
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

            {/* VIEW I: CREATE GATHERING */}
            {currentView === 'create-moim' && (
              <div className="animate-slide-up">
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>새 소모임 개설</h2>
                  <form onSubmit={handleCreateMoim}>
                    <div className="form-group">
                      <label className="form-label">모임 이름</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: 금요 저녁 중보기도 모임"
                        value={newMoimForm.title}
                        onChange={(e) => setNewMoimForm({...newMoimForm, title: e.target.value})}
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">카테고리</label>
                      <select 
                        className="form-input"
                        value={newMoimForm.category}
                        onChange={(e) => setNewMoimForm({...newMoimForm, category: e.target.value})}
                      >
                        <option value="기도모임">기도모임</option>
                        <option value="운동모임">운동모임</option>
                        <option value="취미모임">취미모임</option>
                        <option value="성경공부모임">성경공부모임</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">간단한 모임 소개 (한 줄)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="예: 매주 금요일 밤 함께 기도하는 소모임입니다."
                        value={newMoimForm.shortDesc}
                        onChange={(e) => setNewMoimForm({...newMoimForm, shortDesc: e.target.value})}
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">상세 모임 소개</label>
                      <textarea 
                        className="form-input" 
                        rows="5"
                        placeholder="모임 목적, 시간, 장소, 대상 등 자세한 안내를 적어주세요."
                        value={newMoimForm.longDesc}
                        onChange={(e) => setNewMoimForm({...newMoimForm, longDesc: e.target.value})}
                        required 
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">모임 사진 첨부 (최대 5장)</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        <label style={{ 
                          width: '70px', 
                          height: '70px', 
                          border: '2px dashed var(--border-color)', 
                          borderRadius: 'var(--border-radius-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'var(--text-tertiary)'
                        }}>
                          <CameraIcon style={{ width: '20px', height: '20px' }} />
                          <span style={{ fontSize: '10px', marginTop: '2px' }}>{newMoimForm.images.length}/5</span>
                          <input type="file" accept="image/*" multiple onChange={handleMoimImageUpload} style={{ display: 'none' }} />
                        </label>

                        {newMoimForm.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '70px', height: '70px' }}>
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)' }} />
                            <button 
                              type="button"
                              onClick={() => setNewMoimForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                              style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                background: 'var(--danger)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
                      소모임 등록 완료
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* VIEW J: GATHERING DETAIL */}
            {currentView === 'moim-detail' && activeMoimId && (() => {
              const moim = db.getGathering(activeMoimId);
              if (!moim) return <p>모임을 찾을 수 없습니다.</p>;

              const members = db.getGatheringMembers(moim.id);
              const approvedMembers = members.filter(m => m.status === 'approved');
              const pendingMembers = members.filter(m => m.status === 'pending');
              const myMemberInfo = members.find(m => m.userEmail === currentUser.email);
              const isLeader = moim.leaderId === currentUser.email;
              const isApprovedMember = myMemberInfo && myMemberInfo.status === 'approved';
              const isPendingMember = myMemberInfo && myMemberInfo.status === 'pending';

              const notices = db.getGatheringNotices(moim.id);
              const events = db.getGatheringEvents(moim.id);
              const reviews = db.getGatheringReviews(moim.id);
              const messages = db.getGatheringMessages(moim.id);

              return (
                <div className="animate-slide-up">
                  {/* Moim Header Card */}
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                      <img 
                        src={moim.images && moim.images.length > 0 ? moim.images[0] : '/mock_item_books.png'} 
                        alt="" 
                        style={{ width: '70px', height: '70px', borderRadius: 'var(--border-radius-sm)', objectFit: 'cover' }} 
                      />
                      <div>
                        <span className="moim-card-category">{moim.category}</span>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '4px 0' }}>{moim.title}</h2>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          리더: {moim.leaderName} ({moim.leaderParish})
                          {db.getUser(moim.leaderId)?.isVerified && <span className="verified-badge">교인인증</span>}
                        </div>
                      </div>
                    </div>

                    {/* Action Header Button */}
                    {isLeader ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setShowApprovalModal(true)}
                          style={{ position: 'relative' }}
                        >
                          📋 승인 관리 {pendingMembers.length > 0 && <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '11px', marginLeft: '4px' }}>{pendingMembers.length}</span>}
                        </button>
                      </div>
                    ) : isApprovedMember ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--primary-light)', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>✓ 모임 참여 중 ({approvedMembers.length}명)</span>
                        <button 
                          className="btn-secondary"
                          onClick={() => handleLeaveMoim(moim.id)}
                          style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', color: 'var(--danger)', border: '1px solid var(--danger-light)' }}
                        >
                          모임 탈퇴
                        </button>
                      </div>
                    ) : isPendingMember ? (
                      <button className="btn btn-secondary" disabled>
                        ⏳ 가입 승인 대기 중...
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handleApplyMoim(moim.id)}>
                        ✋ 모임 참여 신청하기
                      </button>
                    )}
                  </div>

                  {/* Subtab Navigation */}
                  <div className="subtab-bar">
                    <button className={`subtab-btn ${moimSubTab === 'info' ? 'active' : ''}`} onClick={() => setMoimSubTab('info')}>ℹ️ 정보</button>
                    <button className={`subtab-btn ${moimSubTab === 'notice' ? 'active' : ''}`} onClick={() => setMoimSubTab('notice')}>📢 공지</button>
                    <button className={`subtab-btn ${moimSubTab === 'calendar' ? 'active' : ''}`} onClick={() => setMoimSubTab('calendar')}>📅 캘린더</button>
                    <button className={`subtab-btn ${moimSubTab === 'chat' ? 'active' : ''}`} onClick={() => setMoimSubTab('chat')}>💬 채팅</button>
                    <button className={`subtab-btn ${moimSubTab === 'review' ? 'active' : ''}`} onClick={() => setMoimSubTab('review')}>✍️ 후기</button>
                  </div>

                  {/* SUBTAB 1: INFO */}
                  {moimSubTab === 'info' && (
                    <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>모임 소개</h3>
                      <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '20px' }}>{moim.longDesc}</p>

                      {moim.images && moim.images.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px' }}>
                          {moim.images.map((img, i) => (
                            <img key={i} src={img} alt="" style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                          ))}
                        </div>
                      )}

                      <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>참여 멤버 ({approvedMembers.length}명)</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {approvedMembers.map(m => (
                          <div key={m.userEmail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '13px' }}>{m.userName.substring(0, 1)}</div>
                              <div>
                                <span style={{ fontSize: '13px', fontWeight: '600' }}>{m.userName}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px' }}>({m.userParish})</span>
                                {db.getUser(m.userEmail)?.isVerified && <span className="verified-badge">교인인증</span>}
                              </div>
                            </div>
                            {m.userEmail === moim.leaderId && <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>모임장</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: NOTICES */}
                  {moimSubTab === 'notice' && (
                    <div className="animate-fade-in">
                      {isLeader && (
                        <form onSubmit={(e) => handleAddNotice(moim.id, e)} style={{ backgroundColor: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                          <label className="form-label">새 공지사항 등록 (모임장)</label>
                          <textarea 
                            className="form-input" 
                            rows="3" 
                            placeholder="모임원들에게 전달할 주요 공지 내용을 작성하세요."
                            value={newNoticeContent}
                            onChange={(e) => setNewNoticeContent(e.target.value)}
                            required
                          />
                          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', padding: '8px 16px' }}>공지 작성 완료</button>
                        </form>
                      )}

                      {notices.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>등록된 공지사항이 없습니다.</div>
                      ) : (
                        notices.map(n => (
                          <div key={n.id} className="notice-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>📢 {n.authorName} 모임장</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{n.createdAt.split('T')[0]}</span>
                            </div>
                            <p style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{n.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* SUBTAB 3: CALENDAR & EVENTS */}
                  {moimSubTab === 'calendar' && (
                    <div className="animate-fade-in">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700' }}>📅 모임 일정 캘린더</h3>
                        {isApprovedMember && (
                          <button className="btn btn-primary" style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }} onClick={() => setShowAddEventModal(true)}>
                            + 일정 추가
                          </button>
                        )}
                      </div>

                      {events.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>예정된 일정이 없습니다.</div>
                      ) : (
                        events.map(ev => (
                          <div key={ev.id} className="event-card">
                            <div className="event-date-badge">
                              <div style={{ fontSize: '12px' }}>{ev.date.substring(5, 7)}월</div>
                              <div style={{ fontSize: '18px' }}>{ev.date.substring(8, 10)}일</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{ev.title}</h4>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span>⏰ {ev.time}</span>
                                <span>📍 {ev.location}</span>
                              </div>
                              {ev.description && <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{ev.description}</p>}
                            </div>
                          </div>
                        ))
                      )}

                      {/* Modal to add event */}
                      {showAddEventModal && (
                        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '400px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>새 일정 등록</h3>
                            <form onSubmit={(e) => handleAddEvent(moim.id, e)}>
                              <div className="form-group">
                                <label className="form-label">일정 제목</label>
                                <input type="text" className="form-input" required value={newEventForm.title} onChange={e => setNewEventForm({...newEventForm, title: e.target.value})} placeholder="예: 9월 정기 기도회" />
                              </div>
                              <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                  <label className="form-label">날짜</label>
                                  <input type="date" className="form-input" required value={newEventForm.date} onChange={e => setNewEventForm({...newEventForm, date: e.target.value})} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label className="form-label">시간</label>
                                  <input type="time" className="form-input" required value={newEventForm.time} onChange={e => setNewEventForm({...newEventForm, time: e.target.value})} />
                                </div>
                              </div>
                              <div className="form-group">
                                <label className="form-label">장소</label>
                                <input type="text" className="form-input" value={newEventForm.location} onChange={e => setNewEventForm({...newEventForm, location: e.target.value})} placeholder="예: 교회 소예배실 2관" />
                              </div>
                              <div className="form-group">
                                <label className="form-label">상세 메모</label>
                                <input type="text" className="form-input" value={newEventForm.description} onChange={e => setNewEventForm({...newEventForm, description: e.target.value})} placeholder="준비물 등 메모" />
                              </div>
                              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEventModal(false)}>취소</button>
                                <button type="submit" className="btn btn-primary">등록</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB 4: GROUP CHATROOM */}
                  {moimSubTab === 'chat' && (
                    <div className="animate-fade-in">
                      {!isApprovedMember ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
                          <p style={{ fontWeight: '600' }}>모임원 전용 채팅방입니다</p>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>모임 참여 신청 후 모임장의 승인이 완료되면 대화에 참여하실 수 있습니다.</p>
                        </div>
                      ) : (
                        <div className="chat-room-container" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
                          <div className="chat-messages-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                            {messages.length === 0 ? (
                              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px' }}>모임 대화방이 개설되었습니다. 인사를 나누보세요!</div>
                            ) : (
                              messages.map(msg => {
                                const isMine = msg.senderId === currentUser.email;
                                return (
                                  <div key={msg.id} className={`message-bubble-wrapper ${isMine ? 'me' : 'other'}`}>
                                    {!isMine && <span className="message-sender-name">{msg.senderName}</span>}
                                    <div className="message-bubble-row">
                                      <div className="message-bubble">{msg.content}</div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            <div ref={moimChatEndRef} />
                          </div>
                          <form onSubmit={(e) => handleSendMoimChat(moim.id, e)} className="chat-input-bar">
                            <input 
                              type="text" 
                              className="chat-input-field" 
                              placeholder="모임원들에게 메시지 보내기..."
                              value={moimChatInput}
                              onChange={(e) => setMoimChatInput(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0 16px' }}>전송</button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB 5: REVIEWS */}
                  {moimSubTab === 'review' && (
                    <div className="animate-fade-in">
                      {isApprovedMember && (
                        <form onSubmit={(e) => handleAddReview(moim.id, e)} style={{ backgroundColor: 'var(--bg-primary)', padding: '14px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                          <label className="form-label">모임 후기 작성</label>
                          <textarea 
                            className="form-input" 
                            rows="3" 
                            placeholder="모임 참여 소감과 은혜로운 이야기를 남겨주세요."
                            value={newReviewForm.content}
                            onChange={(e) => setNewReviewForm({...newReviewForm, content: e.target.value})}
                            required
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary)', cursor: 'pointer' }}>
                              <CameraIcon style={{ width: '16px', height: '16px' }} /> 사진 첨부
                              <input type="file" accept="image/*" multiple onChange={handleReviewImageUpload} style={{ display: 'none' }} />
                            </label>
                            {newReviewForm.images.length > 0 && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{newReviewForm.images.length}장 첨부됨</span>}
                            <button type="submit" className="btn btn-primary" style={{ width: 'auto', marginLeft: 'auto', padding: '6px 14px', fontSize: '12px' }}>후기 등록</button>
                          </div>
                        </form>
                      )}

                      {reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>등록된 후기가 없습니다. 첫 후기를 작성해보세요!</div>
                      ) : (
                        reviews.map(r => (
                          <div key={r.id} className="review-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '700' }}>{r.authorName}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{r.createdAt.split('T')[0]}</span>
                            </div>
                            <p style={{ fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-line', marginBottom: '8px' }}>{r.content}</p>
                            {r.images && r.images.length > 0 && (
                              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                                {r.images.map((img, idx) => (
                                  <img key={idx} src={img} alt="" style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover' }} />
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* APPROVAL MODAL FOR LEADER */}
                  {showApprovalModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>모임 가입 신청 관리 ({pendingMembers.length}건)</h3>
                          <button className="btn-icon" onClick={() => setShowApprovalModal(false)}><XIcon style={{ width: '20px', height: '20px' }} /></button>
                        </div>

                        {pendingMembers.length === 0 ? (
                          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px' }}>대기 중인 가입 신청이 없습니다.</p>
                        ) : (
                          pendingMembers.map(pm => (
                            <div key={pm.userEmail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                              <div>
                                <span style={{ fontSize: '14px', fontWeight: '700' }}>{pm.userName}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '4px' }}>({pm.userParish})</span>
                                {db.getUser(pm.userEmail)?.isVerified && <span className="verified-badge">교인인증</span>}
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="btn btn-primary" style={{ width: 'auto', padding: '4px 10px', fontSize: '12px' }} onClick={() => handleApproveMember(moim.id, pm.userEmail)}>승인</button>
                                <button className="btn btn-secondary" style={{ width: 'auto', padding: '4px 10px', fontSize: '12px', color: 'var(--danger)' }} onClick={() => handleRejectMember(moim.id, pm.userEmail)}>거절</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </main>

          {/* BOTTOM TAB BAR (Hidden in sub-views like register, details, and active chatroom for native immersion) */}
          {!['register-item', 'item-detail', 'chat-room', 'user-profile', 'create-moim', 'moim-detail'].includes(currentView) && (
            <nav className="bottom-tabbar animate-fade-in">
              <button 
                className={`tab-item ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => {
                  setViewHistory(['home']);
                  setCurrentView('home');
                }}
              >
                <HomeIcon active={currentView === 'home'} />
                <span>홈</span>
              </button>

              <button 
                className={`tab-item ${currentView === 'home' && mainServiceTab === 'nanum' ? 'active' : ''}`}
                onClick={() => {
                  setMainServiceTab('nanum');
                  setViewHistory(['home']);
                  setCurrentView('home');
                }}
              >
                <GiftIcon style={{ width: '22px', height: '22px', marginBottom: '4px' }} />
                <span>물건나눔</span>
              </button>

              <button 
                className={`tab-item ${currentView === 'home' && mainServiceTab === 'moim' ? 'active' : ''}`}
                onClick={() => {
                  setMainServiceTab('moim');
                  setViewHistory(['home']);
                  setCurrentView('home');
                }}
              >
                <UsersIcon style={{ width: '22px', height: '22px', marginBottom: '4px' }} />
                <span>소모임</span>
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

      {/* 3. USER APPROVAL MANAGEMENT MODAL FOR LEADERS/ADMINS */}
      {showUserApprovalModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '420px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>🔔 신규 가입 승인 관리 ({pendingUsersList.length}건)</h3>
              <button className="btn-icon" onClick={() => setShowUserApprovalModal(false)}><XIcon style={{ width: '20px', height: '20px' }} /></button>
            </div>

            {pendingUsersList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-tertiary)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                <p style={{ fontWeight: '600' }}>대기 중인 신규 회원 가입 신청이 없습니다.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingUsersList.map(pUser => (
                  <div key={pUser.email} style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: '700' }}>{pUser.name} ({pUser.nickname})</span>
                        <span className="pending-badge" style={{ marginLeft: '6px' }}>승인대기</span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{pUser.parish}</span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
                      <div>📧 이메일: {pUser.email}</div>
                      <div>📞 연락처: {pUser.contact}</div>
                      <div>🤝 추천인: <strong>{pUser.recommenderType}</strong> {pUser.recommenderDetail && `(${pUser.recommenderDetail})`}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '12px', flex: 1 }}
                        onClick={() => {
                          db.approveUser(pUser.email);
                          setPendingUsersList(db.getPendingUsers());
                          alert(`${pUser.name} 님의 가입이 승인되었습니다.`);
                        }}
                      >
                        정식 회원 승인
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px', flex: 1, color: 'var(--danger)' }}
                        onClick={() => {
                          if (window.confirm(`${pUser.name} 님의 가입 신청을 거절하시겠습니까?`)) {
                            db.rejectUser(pUser.email);
                            setPendingUsersList(db.getPendingUsers());
                          }
                        }}
                      >
                        거절
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
