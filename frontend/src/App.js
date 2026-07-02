import { useEffect, useState, useRef } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

const DISTRICTS = [
  'Ahafo','Ashanti','Bono','Bono East','Central','Eastern',
  'Greater Accra','North East','Northern','Oti','Savanna',
  'Upper East','Upper West','Volta','Western','Western North',
];

const translations = {
  en: {
    title: 'AgroShare Ghana',
    subtitle: 'Fractional equipment rental and logistics for Ghanaian farmers.',
    districtFilter: 'Filter by district',
    loadEquipment: 'Load equipment',
    registerFarmer: 'Register farmer',
    listEquipment: 'List equipment',
    createBooking: 'Create booking',
    createPool: 'Create rental pool',
    farmerName: 'Name',
    phone: 'Phone',
    district: 'District',
    ownerName: 'Owner name',
    equipmentType: 'Type',
    pricePerDay: 'Price per day',
    description: 'Description',
    addListing: 'Add listing',
    farmerId: 'Farmer number',
    equipmentId: 'Equipment number',
    rentalDate: 'Rental date',
    bookEquipment: 'Book equipment',
    poolStatus: 'Pool status',
    availableEquipment: 'Available equipment',
    rentalPools: 'Active rental pools',
    payments: 'Payments',
    payNow: 'Pay now',
    paymentReference: 'Payment reference',
    mobileNumber: 'Mobile number',
    paymentStatus: 'Payment status',
    howItWorks: 'How it Works',
    howStep1: '1. Register as a farmer with your name, phone, and district.',
    howStep2: '2. List your equipment or browse equipment from other farmers.',
    howStep3: '3. Book equipment you need or create a rental pool to share costs with others.',
    howStep4: '4. Contact the seller, book equipment, and arrange pickup or return details directly.',
    ussdTitle: 'USSD interface',
    ussdPhone: 'Phone number',
    ussdSession: 'Session ID',
    ussdInput: 'USSD input',
    sendUssd: 'Send USSD',
    ussdResponse: 'Response',
    poolHelp: 'A pool becomes ready once 3 farmers join.',
    noEquipment: 'No equipment found.',
    noPools: 'No rental pools for this district.',
    noPayments: 'No payments created yet.',
    language: 'Language',
    ready: 'Ready',
    pending: 'Pending',
    complete: 'Complete',
    equipmentCategory: 'Equipment category',
    uploadPhoto: 'Upload photo',
    ratings: 'Ratings & Reviews',
    submitRating: 'Submit rating',
    yourRating: 'Your rating (1-5 stars)',
    yourReview: 'Your review',
    noRatings: 'No ratings yet.',
    pricingTitle: 'Subscription Plans',
    pricingSubtitle: 'Unlock full access to AgroShare Ghana',
    monthly: 'Monthly',
    yearly: 'Yearly',
    save: 'Save 17%',
    subscribe: 'Subscribe now',
    subscriptionFarmerId: 'Your farmer number',
    ownerActivity: 'Owner activity feed',
    noActivity: 'No activity yet.',
    subscriptions: 'Subscriptions',
    paymentEvents: 'Payments',
    mapTitle: 'Farmer Locations Map',
    mapSubtitle: 'See where registered farmers are located across Ghana.',
    useMyLocation: 'Use my location',
    locationSet: 'Location saved',
    password: 'Password (min. 6 characters)',
    loading: 'loading',
    searchEquipment: 'Search Equipment',
    searchPlaceholder: 'Search by type, owner, or description',
    filterCategory: 'Filter by Category',
    filterPrice: 'Filter by Price',
    priceMin: 'Price Min (GHS)',
    priceMax: 'Price Max (GHS)',
    found: 'Found',
    equipment: 'equipment',
    noMatches: 'No equipment matches your filters. Try adjusting your search.',
    favorites: 'Your Favorite Equipment',
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
    favoritesDescription: 'Equipment you\'ve bookmarked for quick access',
    ratingsAverage: 'Average Rating',
    basedOn: 'Based on',
    reviews: 'reviews',
    filterByRating: 'Filter by minimum rating',
    allRatings: 'All ratings',
    review: 'review',
    noReviewsMatch: 'No reviews match the selected filter.',
    adminPanel: 'Admin Dashboard',
    adminPassword: 'Admin Password',
    adminLogin: 'Admin Login',
    adminLogout: 'Logout',
    adminDashboard: 'Dashboard',
    dashboardStats: 'Platform Statistics',
    totalFarmers: 'Total Farmers',
    totalEquipment: 'Total Equipment',
    totalBookings: 'Total Bookings',
    totalPayments: 'Total Payments',
    totalRevenue: 'Total Revenue (GHS)',
    completedPayments: 'Completed Payments',
    pendingBookings: 'Pending Bookings',
    averagePrice: 'Avg Equipment Price (GHS)',
    bookingManagement: 'Booking Management',
    paymentManagement: 'Payment Management',
    disputeResolution: 'Dispute Resolution',
    filterBookings: 'Filter Bookings',
    filterPayments: 'Filter Payments',
    bookingId: 'Booking number',
    status: 'Status',
    amount: 'Amount',
    method: 'Method',
    processRefund: 'Process Refund',
    refundReason: 'Refund Reason',
    noBookings: 'No bookings found.',
    noPayments: 'No payments found.',
    all: 'All',
  },
  twi: {
    title: 'AgroShare Ghana',
    subtitle: 'Adwuma mmɔden akode nkitahodie ne ntwatoso ma Ghanafoɔ afuwfoɔ.',
    districtFilter: 'Fa wʼapɔw mu ɛwɔ mantam',
    loadEquipment: 'Fa akode no so',
    registerFarmer: 'Kyerɛw afuwfoɔ',
    listEquipment: 'Kyerɛw akode',
    createBooking: 'Yɛ bere a wɔbɛfa akode no',
    createPool: 'Bɔ nkɔmɔ akyirikyiri',
    farmerName: 'Din',
    phone: 'Mfonini',
    district: 'Mantam',
    ownerName: 'Awurade din',
    equipmentType: 'Akode ho',
    pricePerDay: 'Boɔ da biara',
    description: 'Nkyerɛmu',
    addListing: 'Fa kyerɛw nsɛm',
    farmerId: 'Afuwfoɔ nɔma',
    equipmentId: 'Akode nɔma',
    rentalDate: 'Bere a wɔbɛfa no',
    bookEquipment: 'Bɔ akode no',
    poolStatus: 'Pool status',
    availableEquipment: 'Akode a wɔwɔ hɔ',
    rentalPools: 'Nkɔmɔ akyirikyiri a ɛwɔ hɔ',
    payments: 'Sika bobɔ',
    payNow: 'Tua seisei',
    paymentReference: 'Akyɛde nsɛm',
    mobileNumber: 'Mɔbil nɔma',
    paymentStatus: 'Sika status',
    howItWorks: 'Nea ɛyɛ sɛn',
    howStep1: '1. Kyerɛw ɔko wɔ din, fɔn, ne mantam mu.',
    howStep2: '2. Kyerɛw akode anaa hwɛ akode a afuwfoɔ foforɔ wɔ.',
    howStep3: '3. Fa akode a wopɛ anaa bɔ nkɔmɔ pool sɛ wobebu sika mu.',
    howStep4: '4. Frɛ ɔwura no, bɔ akode no, na yɛ nhyehyɛe a wɔde bɛfa anaa de bɛsan de no.',
    ussdTitle: 'USSD interface',
    ussdPhone: 'Fɔn nɔma',
    ussdSession: 'Session ID',
    ussdInput: 'USSD input',
    sendUssd: 'Som USSD',
    ussdResponse: 'Ahoɔden',
    poolHelp: 'Pool no bɛyɛ ready bere a afuwfoɔ mmiɛnsa bɛka ho.',
    noEquipment: 'Akode biara nni hɔ.',
    noPools: 'Nkɔmɔ pool biara nni mantam yi mu.',
    noPayments: 'Sika bobɔ biara nni hɔ.',
    language: 'Kasa',
    ready: 'Wɔpɛ',
    pending: 'Wɔretwɛn',
    complete: 'Wie',
    equipmentCategory: 'Akode no din',
    uploadPhoto: 'Fa sini no so',
    ratings: 'Dɔm ne Nkyerɛmu',
    submitRating: 'Tu dɔm no',
    yourRating: 'Wʼakɔmmɔ (1-5 stars)',
    yourReview: 'Wʼakɔmmɔ nsɛm',
    noRatings: 'Dɔm biara nni hɔ.',
    pricingTitle: 'Nkorɔfo Aboɔden',
    pricingSubtitle: 'Fa AgroShare Ghana nyinaa mu',
    monthly: 'Bosome biara',
    yearly: 'Afe biara',
    save: 'Gye 17%',
    subscribe: 'Bɔ ho',
    subscriptionFarmerId: 'Wo afuwfoɔ nɔma',
    ownerActivity: 'Wura adwuma amanneɛbɔ',
    noActivity: 'Amanneɛbɔ biara nni hɔ.',
    subscriptions: 'Subscriptions',
    paymentEvents: 'Payments',
    mapTitle: 'Afuwfoɔ Beae Map',
    mapSubtitle: 'Hwɛ beae a afuwfoɔ wɔ Ghana nyinaa mu.',
    useMyLocation: 'Fa me beae',
    locationSet: 'Beae akyerɛ',
    password: 'Gyinae (nsɛm 6 a ɛdɔɔso)',
    loading: 'adwuma a ɛyɛ',
    searchEquipment: 'Hwɛ Akode',
    searchPlaceholder: 'Hwɛ wɔ sɛn, onini, anaa nkyerɛmu mu',
    filterCategory: 'Fa wɔ sɛn mu',
    filterPrice: 'Fa boɔ mu',
    priceMin: 'Boɔ kɛkɛ (GHS)',
    priceMax: 'Boɔ kɛse (GHS)',
    found: 'Ahwehwɛ',
    equipment: 'akode',
    noMatches: 'Akode biara nni wɔ wʼahwehwɛ mu. Prɔ sɛ wobɔ wo ahwehwɛ no mu.',
    favorites: 'Akode a wopɛ (Favorites)',
    addToFavorites: 'Ka fa favorites so',
    removeFromFavorites: 'Pam fii favorites so',
    favoritesDescription: 'Akode a wokyerɛw ama wo din se woacɔ so',
    ratingsAverage: 'Dɔm Duru',
    basedOn: 'Sɛ ɛse',
    reviews: 'nkyerɛmu',
    filterByRating: 'Fa wɔ dɔm kɛse mu',
    allRatings: 'Dɔm nyinaa',
    review: 'nkyerɛmu',
    noReviewsMatch: 'Nkyerɛmu biara nni wɔ wʼakɔnnɔ no mu. Prɔ sɛ wobɔ wo akɔnnɔ no mu.',
    adminPanel: 'Sikabɔfo Dashboard',
    adminPassword: 'Sikabɔfo Gyinae',
    adminLogin: 'Sikabɔfo Login',
    adminLogout: 'Tui Ɔman',
    adminDashboard: 'Dashboard',
    dashboardStats: 'Platform Tidings',
    totalFarmers: 'Afuwfoɔ Sum',
    totalEquipment: 'Akode Sum',
    totalBookings: 'Bere Sum',
    totalPayments: 'Sika bobɔ Sum',
    totalRevenue: 'Sika Sum (GHS)',
    completedPayments: 'Sika bobɔ a wie',
    pendingBookings: 'Bere a wɔretwɛn',
    averagePrice: 'Akode Boɔ Duru (GHS)',
    bookingManagement: 'Bere Susufa',
    paymentManagement: 'Sika bobɔ Susufa',
    disputeResolution: 'Asɛm Pagyefo',
    filterBookings: 'Fa wɔ Bere mu',
    filterPayments: 'Fa wɔ Sika bobɔ mu',
    bookingId: 'Bere nɔma',
    status: 'Status',
    amount: 'Sika',
    method: 'Akwan',
    processRefund: 'Fa Sika Pam',
    refundReason: 'Ntwam',
    noBookings: 'Bere biara nni hɔ.',
    noPayments: 'Sika bobɔ biara nni hɔ.',
    all: 'Nyinaa',
  },
};

function App() {
  const [lang, setLang] = useState('en');
  const [farmers, setFarmers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [rentalPools, setRentalPools] = useState([]);
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [ownerActivity, setOwnerActivity] = useState([]);
  const [ussdResponse, setUssdResponse] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ussdResponse')); } catch { return null; }
  });
  const [district, setDistrict] = useState('Greater Accra');
  const [form, setForm] = useState({ name: '', phone: '', district: 'Greater Accra', password: '', latitude: null, longitude: null, payout_account_type: 'mobile_money', payout_bank_code: 'MTN', payout_account_number: '' });
  const [equipmentForm, setEquipmentForm] = useState({ owner_name: '', owner_farmer_id: '', type: '', category: 'other', district: 'Greater Accra', price_per_day: '', description: '' });
  const [bookingForm, setBookingForm] = useState({ farmer_id: '', equipment_id: '', rental_date: '', district: 'Greater Accra' });
  const [poolForm, setPoolForm] = useState({ farmer_id: '', equipment_id: '', rental_date: '', district: 'Greater Accra' });
  const [retryReference, setRetryReference] = useState('');
  const [subscriptionForm, setSubscriptionForm] = useState({ farmer_id: '', mobile_number: '' });
  const [supportForm, setSupportForm] = useState({ farmer_name: '', phone: '', subject: '', message: '' });
  const [supportTickets, setSupportTickets] = useState([]);
  const [ussdForm, setUssdForm] = useState({ session_id: localStorage.getItem('ussdSession') || '', phone_number: '', input_text: '' });
  const [notice, setNotice] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingForm, setRatingForm] = useState({ farmer_id: '', rater_name: '', rating: 5, review: '' });
  const [photoFile, setPhotoFile] = useState(null);
  
  // Loading states for forms
  const [isLoadingFarmer, setIsLoadingFarmer] = useState(false);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [isLoadingRating, setIsLoadingRating] = useState(false);
  const [isLoadingUssd, setIsLoadingUssd] = useState(false);
  const [isLoadingPhotoUpload, setIsLoadingPhotoUpload] = useState(false);
  const [isLoadingRelease, setIsLoadingRelease] = useState(false);
  const [isLoadingRetry, setIsLoadingRetry] = useState(false);
  const [isLoadingSupport, setIsLoadingSupport] = useState(false);
  
  // Error states for forms
  const [farmerErrors, setFarmerErrors] = useState({});
  const [equipmentErrors, setEquipmentErrors] = useState({});
  const [bookingErrors, setBookingErrors] = useState({});
  const [poolErrors, setPoolErrors] = useState({});
  const [ratingErrors, setRatingErrors] = useState({});
  
  // Phase 3: Search & Filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favoriteEquipment')) || []);
  const [revealedSellerPhones, setRevealedSellerPhones] = useState({});
  const [chatByEquipment, setChatByEquipment] = useState({});
  const [chatDraftByEquipment, setChatDraftByEquipment] = useState({});
  const [chatOpenByEquipment, setChatOpenByEquipment] = useState({});
  const [chatLoadingByEquipment, setChatLoadingByEquipment] = useState({});
  const [chatSendingByEquipment, setChatSendingByEquipment] = useState({});
  
  // Phase 4: Ratings filter state
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  
  // Phase 5: Admin Dashboard states
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(localStorage.getItem('adminAuth') === 'true');
  const [adminBookingFilter, setAdminBookingFilter] = useState('all'); // all, pending, complete
  const [adminPaymentFilter, setAdminPaymentFilter] = useState('all'); // all, pending, complete, failed
  const [adminSelectedBooking, setAdminSelectedBooking] = useState(null);
  const [adminRefundForm, setAdminRefundForm] = useState({ booking_id: '', reason: '' });
  const [isAdminProcessingRefund, setIsAdminProcessingRefund] = useState(false);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const t = key => translations[lang][key] || key;

  const paymentStatusLabel = status => {
    if (status === 'held') return 'Pending verification';
    if (status === 'paid') return 'Paid (seller payout is manual)';
    if (status === 'released') return 'Released (auto payout)';
    return status;
  };

  const hasPaidListingAccess = farmerId => {
    const numericFarmerId = Number(farmerId);
    if (!Number.isInteger(numericFarmerId) || numericFarmerId <= 0) return false;
    return subscriptions.some(subscription => subscription.farmer_id === numericFarmerId && String(subscription.status).toLowerCase() === 'paid');
  };

  const getActiveSubscription = farmerId => {
    const numericFarmerId = Number(farmerId);
    if (!Number.isInteger(numericFarmerId) || numericFarmerId <= 0) return null;
    return subscriptions.find(subscription => subscription.farmer_id === numericFarmerId && String(subscription.status).toLowerCase() === 'paid') || null;
  };

  const getFarmerById = farmerId => farmers.find(farmer => farmer.id === Number(farmerId)) || null;

  const isVerifiedSeller = farmerId => Boolean(getActiveSubscription(farmerId));

  const getSellerRank = farmerId => {
    const subscription = getActiveSubscription(farmerId);
    if (!subscription) return 0;
    return String(subscription.plan).toLowerCase() === 'yearly' ? 2 : 1;
  };

  const getSellerLabel = farmerId => {
    const subscription = getActiveSubscription(farmerId);
    if (!subscription) return 'Standard seller';
    return String(subscription.plan).toLowerCase() === 'yearly' ? 'Gold verified seller' : 'Verified seller';
  };

  const getFarmerListings = farmerId => equipment.filter(item => Number(item.owner_farmer_id) === Number(farmerId));

  const getFarmerListingCount = farmerId => getFarmerListings(farmerId).length;

  const getGhanaRenterDirectory = () => [...farmers].sort((a, b) => a.district.localeCompare(b.district) || a.name.localeCompare(b.name));

  const getBusinessProfileFarmers = () => {
    const paidIds = [...new Set(subscriptions.filter(sub => String(sub.status).toLowerCase() === 'paid').map(sub => Number(sub.farmer_id)).filter(id => Number.isInteger(id) && id > 0))];
    return paidIds
      .map(farmerId => farmers.find(farmer => farmer.id === farmerId))
      .filter(Boolean)
      .sort((a, b) => getSellerRank(b.id) - getSellerRank(a.id) || a.name.localeCompare(b.name));
  };

  // Auto-dismiss notification after 5 seconds
  const showNotice = (type, text) => setNotice({ type, text });
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Load initial data
  useEffect(() => {
    fetch(`${API_BASE}/farmers/`).then(r => r.json()).then(setFarmers).catch(() => {});
    fetch(`${API_BASE}/equipment/`).then(r => r.json()).then(setEquipment).catch(() => {});
    fetch(`${API_BASE}/pools/`).then(r => r.json()).then(setRentalPools).catch(() => {});
    fetch(`${API_BASE}/payments/`).then(r => r.json()).then(setPayments).catch(() => {});
    fetch(`${API_BASE}/subscriptions/`).then(r => r.json()).then(setSubscriptions).catch(() => {});
    fetch(`${API_BASE}/subscriptions/owner/activity`).then(r => r.json()).then(setOwnerActivity).catch(() => {});
  }, []);

  const refreshOwnerActivity = () => {
    fetch(`${API_BASE}/subscriptions/`).then(r => r.json()).then(setSubscriptions).catch(() => {});
    fetch(`${API_BASE}/subscriptions/owner/activity`).then(r => r.json()).then(setOwnerActivity).catch(() => {});
  };

  useEffect(() => {
    const farmerId = Number(subscriptionForm.farmer_id);
    const subscription = getActiveSubscription(farmerId);

    if (!subscription || String(subscription.plan).toLowerCase() !== 'yearly') {
      setSupportTickets([]);
      return;
    }

    fetch(`${API_BASE}/support/farmer/${farmerId}`)
      .then(r => r.json())
      .then(data => setSupportTickets(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [subscriptionForm.farmer_id, subscriptions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trxref = params.get('trxref') || params.get('reference');
    if (!trxref || !trxref.startsWith('SUB-')) return;

    const verifySubscription = async () => {
      try {
        const res = await fetch(`${API_BASE}/subscriptions/verify/${encodeURIComponent(trxref)}`, { method: 'POST' });
        const data = await res.json();

        if (!res.ok) {
          showNotice('error', `❌ ${data.detail || 'Unable to verify subscription payment.'}`);
          return;
        }

        refreshOwnerActivity();
        showNotice('success', `✅ Subscription payment confirmed. Reference: ${data.reference}`);
      } catch (err) {
        showNotice('error', '❌ Unable to verify subscription payment right now.');
      } finally {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', cleanUrl);
      }
    };

    verifySubscription();
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const tryInit = () => {
      if (!window.L) { setTimeout(tryInit, 300); return; }
      const map = window.L.map(mapRef.current).setView([7.9465, -1.0232], 7);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      mapInstanceRef.current = map;
    };
    tryInit();
  }, []);

  // Add farmer markers whenever farmers list updates
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    farmers.forEach(farmer => {
      if (farmer.latitude && farmer.longitude) {
        const marker = window.L.marker([farmer.latitude, farmer.longitude])
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>${farmer.name}</b><br>📍 ${farmer.district}<br>📞 ${farmer.phone}`);
        markersRef.current.push(marker);
      }
    });
  }, [farmers]);

  const loadDistrict = () => {
    fetch(`${API_BASE}/equipment/?district=${encodeURIComponent(district)}`).then(r => r.json()).then(setEquipment).catch(() => {});
    fetch(`${API_BASE}/pools/?district=${encodeURIComponent(district)}`).then(r => r.json()).then(setRentalPools).catch(() => {});
  };

  // Phase 3: Apply search and filter logic
  useEffect(() => {
    let filtered = [...equipment];
    
    // Filter by search term (equipment type, owner name, or description)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.type?.toLowerCase().includes(search) ||
        item.owner_name?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by price range
    const min = priceMin ? parseFloat(priceMin) : 0;
    const max = priceMax ? parseFloat(priceMax) : Infinity;
    filtered = filtered.filter(item => {
      const price = parseFloat(item.price_per_day || 0);
      return price >= min && price <= max;
    });

    // Keep paid sellers at the top so verified listings surface first.
    filtered.sort((left, right) => {
      const rightRank = getSellerRank(right.owner_farmer_id);
      const leftRank = getSellerRank(left.owner_farmer_id);
      if (rightRank !== leftRank) return rightRank - leftRank;
      return (right.created_at || '').localeCompare(left.created_at || '');
    });
    
    setFilteredEquipment(filtered);
  }, [equipment, searchTerm, selectedCategory, priceMin, priceMax, subscriptions]);

  // Phase 3: Get autocomplete suggestions
  const getAutocompleteSuggestions = () => {
    const types = [...new Set(equipment.map(e => e.type).filter(Boolean))];
    const owners = [...new Set(equipment.map(e => e.owner_name).filter(Boolean))];
    return [...types, ...owners].filter(s => 
      s.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm.length > 0
    ).slice(0, 8);
  };

  // Phase 3: Toggle favorite equipment
  const toggleFavorite = (equipmentId) => {
    const newFavorites = favorites.includes(equipmentId)
      ? favorites.filter(id => id !== equipmentId)
      : [...favorites, equipmentId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteEquipment', JSON.stringify(newFavorites));
    showNotice('success', favorites.includes(equipmentId) ? '❤️ Removed from favorites' : '❤️ Added to favorites');
  };

  const maskPhone = phone => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 7) return phone || 'Not available';
    return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
  };

  const revealSellerPhone = async equipmentId => {
    if (revealedSellerPhones[equipmentId]) return;
    try {
      const res = await fetch(`${API_BASE}/equipment/${equipmentId}/seller-phone`);
      const data = await res.json();
      if (!res.ok) {
        showNotice('error', `❌ ${data.detail || 'Seller contact is not available right now.'}`);
        return;
      }
      setRevealedSellerPhones(prev => ({ ...prev, [equipmentId]: data.phone }));
      showNotice('success', '✅ Seller phone revealed. Call or message the seller directly.');
    } catch (err) {
      showNotice('error', '❌ Unable to load seller contact right now.');
    }
  };

  const ensureChatDraft = equipmentId => {
    if (chatDraftByEquipment[equipmentId]) return chatDraftByEquipment[equipmentId];
    return { sender_name: '', sender_phone: '', message: '' };
  };

  const loadEquipmentChat = async equipmentId => {
    setChatLoadingByEquipment(prev => ({ ...prev, [equipmentId]: true }));
    try {
      const res = await fetch(`${API_BASE}/chats/equipment/${equipmentId}`);
      const data = await res.json();
      if (!res.ok) {
        showNotice('error', `❌ ${data.detail || 'Unable to load chat messages.'}`);
        return;
      }
      setChatByEquipment(prev => ({ ...prev, [equipmentId]: data }));
    } catch (err) {
      showNotice('error', '❌ Unable to load chat messages.');
    } finally {
      setChatLoadingByEquipment(prev => ({ ...prev, [equipmentId]: false }));
    }
  };

  const toggleEquipmentChat = equipmentId => {
    const willOpen = !chatOpenByEquipment[equipmentId];
    setChatOpenByEquipment(prev => ({ ...prev, [equipmentId]: willOpen }));

    if (willOpen && !chatByEquipment[equipmentId]) {
      loadEquipmentChat(equipmentId);
    }
  };

  const submitEquipmentChatMessage = async equipmentId => {
    const draft = ensureChatDraft(equipmentId);
    if (!draft.sender_name.trim() || !draft.sender_phone.trim() || !draft.message.trim()) {
      showNotice('error', '❌ Enter your name, phone number, and message before sending chat.');
      return;
    }

    setChatSendingByEquipment(prev => ({ ...prev, [equipmentId]: true }));
    try {
      const res = await fetch(`${API_BASE}/chats/equipment/${equipmentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotice('error', `❌ ${data.detail || 'Unable to send chat message.'}`);
        return;
      }

      setChatByEquipment(prev => ({
        ...prev,
        [equipmentId]: [...(prev[equipmentId] || []), data],
      }));
      setChatDraftByEquipment(prev => ({
        ...prev,
        [equipmentId]: { ...draft, message: '' },
      }));
      showNotice('success', '✅ Chat message sent.');
    } catch (err) {
      showNotice('error', '❌ Unable to send chat message right now.');
    } finally {
      setChatSendingByEquipment(prev => ({ ...prev, [equipmentId]: false }));
    }
  };

  const getMyLocation = () => {
    if (!navigator.geolocation) { showNotice('error', 'Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        showNotice('success', `✅ ${t('locationSet')}: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => showNotice('error', 'Unable to get your location. Please enable location services.')
    );
  };

  const submitFarmer = async e => {
    e.preventDefault();
    setIsLoadingFarmer(true);
    setFarmerErrors({});
    try {
      const res = await fetch(`${API_BASE}/farmers/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.detail && typeof data.detail === 'string') {
          setFarmerErrors({ submit: data.detail });
        } else if (data.detail && Array.isArray(data.detail)) {
          const errors = {};
          data.detail.forEach(err => {
            if (err.loc && err.loc[1]) errors[err.loc[1]] = err.msg;
          });
          setFarmerErrors(errors.submit ? errors : { submit: 'Validation failed. Check your inputs.' });
        } else {
          setFarmerErrors({ submit: 'Failed to register farmer.' });
        }
        showNotice('error', `❌ ${Object.values(data.detail || { detail: 'Registration failed' })[0] || 'Failed to register farmer.'}`);
        return;
      }
      setFarmers(f => [...f, data]);
      setBookingForm(b => ({ ...b, farmer_id: data.id }));
      setSubscriptionForm(s => ({ ...s, farmer_id: String(data.id), mobile_number: data.phone }));
      setForm({ name: '', phone: '', district: 'Greater Accra', password: '', latitude: null, longitude: null, payout_account_type: 'mobile_money', payout_bank_code: 'MTN', payout_account_number: '' });
      setFarmerErrors({});
      showNotice('success', `✅ Farmer "${data.name}" registered! Farmer number: ${data.id}`);
    } catch (err) {
      setFarmerErrors({ submit: 'Network error. Please try again.' });
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingFarmer(false);
    }
  };

  const submitEquipment = async e => {
    e.preventDefault();
    if (!equipmentForm.owner_farmer_id) {
      setEquipmentErrors({ owner_farmer_id: 'Enter your farmer number after paying to unlock listings.' });
      showNotice('error', '❌ Pay the listing fee first, then enter your farmer number to unlock this form.');
      return;
    }

    if (!hasPaidListingAccess(equipmentForm.owner_farmer_id)) {
      setEquipmentErrors({ owner_farmer_id: 'No paid subscription found for this farmer number.' });
      showNotice('error', '❌ You need a paid subscription before listing equipment or uploading photos.');
      return;
    }

    setIsLoadingEquipment(true);
    setEquipmentErrors({});
    try {
      const res = await fetch(`${API_BASE}/equipment/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...equipmentForm,
          owner_farmer_id: equipmentForm.owner_farmer_id ? Number(equipmentForm.owner_farmer_id) : null,
          price_per_day: Number(equipmentForm.price_per_day),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEquipmentErrors({ submit: data.detail || 'Failed to add equipment listing.' });
        showNotice('error', `❌ ${data.detail || 'Failed to add equipment listing.'}`);
        return;
      }
      setEquipment(eq => [...eq, data]);
      setEquipmentForm({ owner_name: '', owner_farmer_id: '', type: '', category: 'other', district, price_per_day: '', description: '' });
      setEquipmentErrors({});
      showNotice('success', `✅ Equipment listed! Equipment number: ${data.id}`);
    } catch (err) {
      setEquipmentErrors({ submit: 'Network error. Please try again.' });
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingEquipment(false);
    }
  };

  const submitBooking = async e => {
    e.preventDefault();
    setIsLoadingBooking(true);
    setBookingErrors({});
    try {
      const res = await fetch(`${API_BASE}/bookings/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookingForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setBookingErrors({ submit: data.detail || 'Failed to create booking.' });
        showNotice('error', `❌ ${data.detail || 'Failed to create booking.'}`);
        return;
      }
      setBookingForm({ farmer_id: '', equipment_id: '', rental_date: '', district: 'Greater Accra' });
      setBookingErrors({});
      showNotice('success', `✅ Booking created! Booking number: ${data.id}`);
    } catch (err) {
      setBookingErrors({ submit: 'Network error. Please try again.' });
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingBooking(false);
    }
  };

  const submitPool = async e => {
    e.preventDefault();
    setIsLoadingPool(true);
    setPoolErrors({});
    try {
      const res = await fetch(`${API_BASE}/pools/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(poolForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setPoolErrors({ submit: data.detail || 'Failed to create pool.' });
        showNotice('error', `❌ ${data.detail || 'Failed to create pool.'}`);
        return;
      }
      setRentalPools(p => { const ex = p.find(x => x.id === data.id); return ex ? p.map(x => x.id === data.id ? data : x) : [...p, data]; });
      setPoolForm({ farmer_id: '', equipment_id: '', rental_date: '', district: 'Greater Accra' });
      setPoolErrors({});
      showNotice('success', `✅ Rental pool created! Pool number: ${data.id}`);
    } catch (err) {
      setPoolErrors({ submit: 'Network error. Please try again.' });
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingPool(false);
    }
  };

  const submitSubscription = async plan => {
    if (!subscriptionForm.farmer_id || !subscriptionForm.mobile_number) {
      showNotice('error', 'Enter your farmer number and mobile number before subscribing.');
      return;
    }

    setIsLoadingSubscription(true);
    try {
      const res = await fetch(`${API_BASE}/subscriptions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: Number(subscriptionForm.farmer_id),
          mobile_number: subscriptionForm.mobile_number,
          plan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotice('error', `❌ ${data.detail || 'Failed to create subscription.'}`);
        return;
      }

      setSubscriptions(s => [data, ...s]);
      refreshOwnerActivity();

      if (data.checkout_url) {
        showNotice('success', 'Redirecting to Paystack checkout for subscription...');
        window.location.assign(data.checkout_url);
        return;
      }

      if (String(data.status).toLowerCase() === 'paid') {
        setEquipmentForm(f => ({ ...f, owner_farmer_id: String(data.farmer_id) }));
        showNotice('success', `✅ ${plan} listing fee paid. Reference: ${data.reference}`);
      } else {
        showNotice('success', `✅ Subscription created. Complete payment to unlock listing. Reference: ${data.reference}`);
      }
    } catch (err) {
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const releasePayment = async paymentId => {
    setIsLoadingRelease(true);
    try {
      const res = await fetch(`${API_BASE}/payments/${paymentId}/release`, { method: 'POST' });
      const updated = await res.json();
      if (!res.ok) {
        showNotice('error', `❌ ${updated.detail || 'Unable to release payment.'}`);
        return;
      }
      setPayments(p => p.map(x => x.id === updated.id ? updated : x));
      refreshOwnerActivity();
      showNotice('success', '✅ Payment verified. Seller payout will be handled manually.');
    } catch (err) {
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingRelease(false);
    }
  };

  const retryHeldPaymentByReference = async () => {
    if (!retryReference.trim()) {
      showNotice('error', 'Enter a payment reference to retry.');
      return;
    }

    setIsLoadingRetry(true);
    try {
      const res = await fetch(`${API_BASE}/payments/retry/${encodeURIComponent(retryReference.trim())}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showNotice('error', `❌ ${data.detail || 'Unable to retry payment.'}`);
        return;
      }

      const refresh = await fetch(`${API_BASE}/payments/`);
      const refreshed = await refresh.json();
      setPayments(Array.isArray(refreshed) ? refreshed : []);
      refreshOwnerActivity();
      setRetryReference('');
      showNotice('success', `✅ ${data.detail}`);
    } catch (err) {
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingRetry(false);
    }
  };

  const submitPrioritySupportTicket = async () => {
    const farmerId = Number(subscriptionForm.farmer_id);
    const subscription = getActiveSubscription(farmerId);
    if (!subscription || String(subscription.plan).toLowerCase() !== 'yearly') {
      showNotice('error', 'Enter a paid yearly farmer number to unlock priority support.');
      return;
    }

    const farmer = getFarmerById(farmerId);
    const farmerName = (supportForm.farmer_name || farmer?.name || '').trim();
    const phone = (supportForm.phone || farmer?.phone || '').trim();
    const subject = supportForm.subject.trim();
    const message = supportForm.message.trim();

    if (!farmerName || !phone || !subject || !message) {
      showNotice('error', 'Fill in your name, phone, subject, and message before sending support.');
      return;
    }

    setIsLoadingSupport(true);
    try {
      const res = await fetch(`${API_BASE}/support/priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: farmerId,
          farmer_name: farmerName,
          phone,
          subject,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotice('error', `❌ ${data.detail || 'Unable to open support request.'}`);
        return;
      }

      setSupportTickets(tickets => [data, ...tickets].slice(0, 10));
      setSupportForm(form => ({ ...form, subject: '', message: '' }));
      showNotice('success', `✅ Priority support ticket opened. Ticket #${data.id}`);
    } catch (err) {
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingSupport(false);
    }
  };

  const sendUssd = async e => {
    e.preventDefault();
    setIsLoadingUssd(true);
    try {
      const res = await fetch(`${API_BASE}/ussd/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ussdForm),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotice('error', `❌ ${data.detail || 'Failed to send USSD request.'}`);
        return;
      }
      localStorage.setItem('ussdSession', data.session_id);
      localStorage.setItem('ussdResponse', JSON.stringify(data));
      setUssdResponse(data);
      setUssdForm(f => ({ ...f, session_id: data.session_id }));
      showNotice('success', '✅ USSD request sent.');
    } catch (err) {
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingUssd(false);
    }
  };

  const uploadEquipmentPhoto = async equipmentId => {
    if (!photoFile) {
      showNotice('error', 'Please select a photo first.');
      return;
    }
    setIsLoadingPhotoUpload(true);
    try {
      const formData = new FormData();
      formData.append('file', photoFile);
      const res = await fetch(`${API_BASE}/equipment/upload/${equipmentId}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        showNotice('error', `❌ ${data.detail || 'Failed to upload photo.'}`);
        return;
      }
      setPhotoFile(null);
      showNotice('success', '✅ Photo uploaded successfully!');
      fetch(`${API_BASE}/equipment/`).then(r => r.json()).then(setEquipment).catch(() => {});
    } catch (err) {
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingPhotoUpload(false);
    }
  };

  const equipmentListingUnlocked = hasPaidListingAccess(equipmentForm.owner_farmer_id);

  const submitRating = async e => {
    e.preventDefault();
    setIsLoadingRating(true);
    setRatingErrors({});
    try {
      const res = await fetch(`${API_BASE}/ratings/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ratingForm, rating: Number(ratingForm.rating) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRatingErrors({ submit: data.detail || 'Failed to submit rating.' });
        showNotice('error', `❌ ${data.detail || 'Failed to submit rating.'}`);
        return;
      }
      setRatings(r => [...r, data]);
      setRatingForm({ farmer_id: '', rater_name: '', rating: 5, review: '' });
      setRatingErrors({});
      showNotice('success', '✅ Rating submitted successfully!');
    } catch (err) {
      setRatingErrors({ submit: 'Network error. Please try again.' });
      showNotice('error', '❌ Network error. Please try again.');
    } finally {
      setIsLoadingRating(false);
    }
  };

  const fetchFarmerRatings = async farmerId => {
    if (!farmerId) return;
    const res = await fetch(`${API_BASE}/ratings/farmer/${farmerId}`);
    if (res.ok) { const data = await res.json(); setRatings(data); }
  };

  // Phase 4: Calculate average rating
  const calculateAverageRating = (ratingsList = ratings) => {
    if (ratingsList.length === 0) return 0;
    const sum = ratingsList.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / ratingsList.length).toFixed(1);
  };

  // Phase 4: Get rating distribution
  const getRatingDistribution = (ratingsList = ratings) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingsList.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
    });
    return distribution;
  };

  // Phase 4: Filter ratings by minimum stars
  const getFilteredRatings = (minStars = 0, ratingsList = ratings) => {
    if (minStars === 0) return ratingsList;
    return ratingsList.filter(r => r.rating >= minStars);
  };

  // Phase 4: Star display helper
  const renderStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '✨' : '');
  };

  // Phase 5: Admin Dashboard Functions
  const handleAdminLogin = (e) => {
    e.preventDefault();
    // Simple password check (in production, use proper authentication)
    if (adminPassword === 'agroadmin2024') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      setAdminPassword('');
      showNotice('success', '✅ Admin access granted!');
    } else {
      showNotice('error', '❌ Incorrect admin password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminAuth');
    setIsAdminView(false);
    showNotice('success', '✅ Logged out from admin panel');
  };

  // Phase 5: Calculate dashboard statistics
  const getDashboardStats = () => {
    const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingBookings = rentalPools.filter(p => p.status === 'pending').length;
    return {
      totalFarmers: farmers.length,
      totalEquipment: equipment.length,
      totalBookings: rentalPools.length,
      totalPayments: payments.length,
      totalRevenue: totalRevenue.toFixed(2),
      completedPayments,
      pendingBookings,
      averageEquipmentPrice: equipment.length > 0 ? (equipment.reduce((s, e) => s + (parseFloat(e.price_per_day) || 0), 0) / equipment.length).toFixed(2) : 0
    };
  };

  // Phase 5: Get filtered bookings for admin
  const getAdminFilteredBookings = () => {
    if (adminBookingFilter === 'all') return rentalPools;
    return rentalPools.filter(b => b.status === adminBookingFilter);
  };

  // Phase 5: Get filtered payments for admin
  const getAdminFilteredPayments = () => {
    if (adminPaymentFilter === 'all') return payments;
    return payments.filter(p => p.status === adminPaymentFilter);
  };

  // Phase 5: Process refund
  const processAdminRefund = async (e) => {
    e.preventDefault();
    if (!adminRefundForm.booking_id || !adminRefundForm.reason) {
      showNotice('error', '❌ Please fill all refund fields');
      return;
    }
    
    setIsAdminProcessingRefund(true);
    try {
      // Simulate refund processing
      const refundData = {
        booking_id: adminRefundForm.booking_id,
        reason: adminRefundForm.reason,
        processed_by: 'admin',
        processed_at: new Date().toISOString()
      };
      
      // In production, send to backend API
      showNotice('success', `✅ Refund processed for booking ${adminRefundForm.booking_id}`);
      setAdminRefundForm({ booking_id: '', reason: '' });
    } catch (err) {
      showNotice('error', '❌ Failed to process refund: ' + err.message);
    } finally {
      setIsAdminProcessingRefund(false);
    }
  };

  const card = { padding: 18, border: '1px solid #ddd', borderRadius: 12, background: 'rgba(255,255,255,0.97)' };
  const selectedPremiumFarmerId = Number(subscriptionForm.farmer_id);
  const selectedPremiumSubscription = getActiveSubscription(selectedPremiumFarmerId);
  const selectedPremiumFarmer = getFarmerById(selectedPremiumFarmerId);
  const premiumRenterDirectory = getGhanaRenterDirectory();
  const hasPremiumAccess = Boolean(selectedPremiumSubscription);
  const hasPrioritySupport = hasPremiumAccess && String(selectedPremiumSubscription.plan).toLowerCase() === 'yearly';

  return (
    <div
      className="app-wrapper"
      style={{
        fontFamily: 'sans-serif',
        padding: 16,
        maxWidth: 980,
        margin: '0 auto',
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(14,40,18,0.35),rgba(14,40,18,0.35)),url(${process.env.PUBLIC_URL}/farm-background.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ── Floating toast notification ── */}
      {notice && (
        <div className={`toast ${notice.type}`}>
          {notice.text}
          <span onClick={() => setNotice(null)} style={{ marginLeft: 12, cursor: 'pointer', fontWeight: 400 }}>✕</span>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
        <div className="header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ color: '#0d4a1f', marginBottom: 4, fontSize: '1.5rem' }}>🌾 {t('title')}</h1>
            <p style={{ margin: 0, color: '#444', fontSize: '0.9rem' }}>{t('subtitle')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ margin: 0 }}>
              {t('language')}:<br />
              <select value={lang} onChange={e => setLang(e.target.value)} style={{ marginTop: 4, width: 'auto' }}>
                <option value="en">English</option>
                <option value="twi">Twi</option>
              </select>
            </label>
            {/* Phase 5: Admin Access */}
            {isAdminAuthenticated ? (
              <button onClick={handleAdminLogout} style={{ padding: '8px 12px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                🔐 {t('adminLogout')}
              </button>
            ) : (
              <button onClick={() => setIsAdminView(!isAdminView)} style={{ padding: '8px 12px', background: '#1769aa', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
                🔐 {t('adminPanel')}
              </button>
            )}
          </div>
        </div>
        
        {/* Phase 5: Admin Login Form */}
        {isAdminView && !isAdminAuthenticated && (
          <form onSubmit={handleAdminLogin} style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <label style={{ flex: 1 }}>
                {t('adminPassword')}<br />
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  style={{ width: '100%', marginTop: 4 }}
                />
              </label>
              <button type="submit" style={{ padding: '8px 16px', background: '#1769aa', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                {t('adminLogin')}
              </button>
            </div>
          </form>
        )}
      </header>

      {/* ── How it Works ── */}
      <section style={{ marginBottom: 14, padding: 16, background: '#f0f7ff', border: '1px solid #b3d9ff', borderRadius: 14 }}>
        <h2 style={{ marginTop: 0, color: '#0052cc', fontSize: '1.1rem' }}>💡 {t('howItWorks')}</h2>
        <div style={{ display: 'grid', gap: 6, color: '#333', fontSize: '0.92rem' }}>
          <div>📋 {t('howStep1')}</div>
          <div>🔍 {t('howStep2')}</div>
          <div>📅 {t('howStep3')}</div>
          <div>💳 {t('howStep4')}</div>
        </div>
      </section>

      {/* ── Subscription Pricing ── */}
      <section style={{ marginBottom: 14, borderRadius: 14, padding: 16, background: 'rgba(255,255,255,0.97)', border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center', fontSize: '1.1rem' }}>💼 {t('pricingTitle')}</h2>
        <p style={{ textAlign: 'center', color: '#555', marginTop: 0, fontSize: '0.9rem' }}>{t('pricingSubtitle')}</p>
        <div style={{ maxWidth: 560, margin: '0 auto 12px auto' }}>
          <label>{t('subscriptionFarmerId')}<br />
            <input
              type="number"
              value={subscriptionForm.farmer_id}
              onChange={e => setSubscriptionForm(f => ({ ...f, farmer_id: e.target.value }))}
              placeholder="e.g. 1"
            />
          </label>
          <label>{t('mobileNumber')}<br />
            <input
              value={subscriptionForm.mobile_number}
              onChange={e => setSubscriptionForm(f => ({ ...f, mobile_number: e.target.value }))}
              placeholder="e.g. 0241234567"
            />
          </label>
        </div>
        <div className="grid-2" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="pricing-card">
            <div style={{ fontWeight: 700 }}>{t('monthly')}</div>
            <div className="price">GHS 200 / USD 20</div>
            <div className="period">/ per month — cancel anytime</div>
            <ul style={{ textAlign: 'left', paddingLeft: 18, color: '#333', fontSize: '0.88rem', marginBottom: 16 }}>
              <li>✅ List unlimited equipment</li>
              <li>✅ Receive bookings &amp; rental requests</li>
              <li>✅ Secure escrow payments (your money is protected)</li>
              <li>✅ SMS &amp; app alerts when someone books your tool</li>
              <li>✅ Verified seller badge (builds trust with buyers)</li>
              <li>✅ Access to all renters across Ghana</li>
            </ul>
            <button type="button" onClick={() => submitSubscription('monthly')} disabled={isLoadingSubscription} className={isLoadingSubscription ? 'loading' : ''}>
              {isLoadingSubscription ? <><span className="spinner"></span>({t('loading')})</> : <>{t('subscribe')}</> }
            </button>
          </div>
          <div className="pricing-card featured">
            <div style={{ fontWeight: 700 }}>
              {t('yearly')} <span style={{ background: '#1769aa', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem' }}>{t('save')}</span>
            </div>
            <div className="price">GHS 2,000 / USD 200</div>
            <div className="period">/ GHS 200/mo × 10 months (2 months free)</div>
            <ul style={{ textAlign: 'left', paddingLeft: 18, color: '#333', fontSize: '0.88rem', marginBottom: 16 }}>
              <li>✅ Everything in Monthly</li>
              <li>⭐ Top of search results (get seen first)</li>
              <li>⭐ Gold verified badge on your listings</li>
              <li>⭐ Priority customer support (fast response)</li>
              <li>⭐ Early access to new features</li>
              <li>⭐ Free business profile page for your farm</li>
              <li>🎁 2 months completely free</li>
            </ul>
            <button type="button" onClick={() => submitSubscription('yearly')} disabled={isLoadingSubscription} className={isLoadingSubscription ? 'loading' : ''}>
              {isLoadingSubscription ? <><span className="spinner"></span>({t('loading')})</> : <>{t('subscribe')}</> }
            </button>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>🔔 {t('ownerActivity')}</h2>
        <div style={{ fontSize: '0.88rem', color: '#666', marginBottom: 8 }}>
          {t('subscriptions')}: {subscriptions.length} | {t('paymentEvents')}: {payments.length}
        </div>
        {ownerActivity.length > 0 ? ownerActivity.map(item => (
          <div key={`${item.type}-${item.reference}`} style={{ border: '1px solid #ececec', borderRadius: 8, padding: 10, marginBottom: 8, background: '#fafafa' }}>
            <div style={{ fontWeight: 700 }}>
              {item.type === 'subscription' ? 'Subscription' : 'Payment'} | {item.reference}
            </div>
            <div style={{ fontSize: '0.86rem' }}>
              Amount: GHS {Number(item.amount || 0).toFixed(2)} | Status: {item.status}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#666' }}>
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        )) : <div style={{ color: '#777' }}>{t('noActivity')}</div>}
      </section>

      {/* ── District Filter ── */}
      <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 14, border: '1px solid #ddd' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
          <label style={{ margin: 0, flex: '1 1 200px' }}>
            {t('districtFilter')}:
            <select value={district} onChange={e => setDistrict(e.target.value)} style={{ display: 'block', marginTop: 4 }}>
              {DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </label>
          <button onClick={loadDistrict} style={{ flex: '0 0 auto', width: 'auto', padding: '10px 20px', marginTop: 4 }}>{t('loadEquipment')}</button>
        </div>
      </section>

      {/* ── Register Farmer & List Equipment ── */}
      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div style={card}>
          <h2>👤 {t('registerFarmer')}</h2>
          <form onSubmit={submitFarmer}>
            <label>{t('farmerName')}<span className="required-indicator">*</span><br /><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={farmerErrors.name ? 'error' : ''} /></label>
            {farmerErrors.name && <span className="error-message">{farmerErrors.name}</span>}
            
            <label>{t('phone')}<span className="required-indicator">*</span><br /><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required className={farmerErrors.phone ? 'error' : ''} /></label>
            {farmerErrors.phone && <span className="error-message">{farmerErrors.phone}</span>}
            
            <label>{t('password')}<span className="required-indicator">*</span><br /><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required className={farmerErrors.password ? 'error' : ''} /></label>
            {farmerErrors.password && <span className="error-message">{farmerErrors.password}</span>}
            
            <label>Payout account type<br />
              <select value={form.payout_account_type} onChange={e => setForm(f => ({ ...f, payout_account_type: e.target.value }))}>
                <option value="mobile_money">Mobile Money</option>
                <option value="nuban">Bank Account</option>
              </select>
            </label>
            
            <label>Payout network/bank code<br /><input value={form.payout_bank_code} onChange={e => setForm(f => ({ ...f, payout_bank_code: e.target.value }))} placeholder="e.g. MTN" className={farmerErrors.payout_bank_code ? 'error' : ''} /></label>
            {farmerErrors.payout_bank_code && <span className="error-message">{farmerErrors.payout_bank_code}</span>}
            
            <label>Mobile Money/Bank account number (where you receive money)<br /><input value={form.payout_account_number} onChange={e => setForm(f => ({ ...f, payout_account_number: e.target.value }))} placeholder="e.g. 0246326373" className={farmerErrors.payout_account_number ? 'error' : ''} /></label>
            {farmerErrors.payout_account_number && <span className="error-message">{farmerErrors.payout_account_number}</span>}
            
            <label>{t('district')}<br />
              <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>📍 Location (optional)</div>
              <button type="button" onClick={getMyLocation} disabled={isLoadingFarmer} style={{ background: '#2e7d32', marginBottom: 4 }}>{t('useMyLocation')}</button>
              {form.latitude && <small style={{ display: 'block', color: '#2e7d32' }}>✅ {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</small>}
            </div>
            
            {farmerErrors.submit && <span className="error-message">{farmerErrors.submit}</span>}
            
            <button type="submit" disabled={isLoadingFarmer} style={{ background: '#2e7d32' }} className={isLoadingFarmer ? 'loading' : ''}>
              {isLoadingFarmer ? (
                <><span className="spinner"></span>{t('registerFarmer')} ({t('loading')})</>
              ) : (
                t('registerFarmer')
              )}
            </button>
          </form>
        </div>

        <div style={card}>
          <h2>🚜 {t('listEquipment')}</h2>
          <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, border: '1px solid #d7c27a', background: equipmentListingUnlocked ? '#edf7ed' : '#fff7e6', color: '#3d3d3d', fontSize: '0.92rem' }}>
            {equipmentListingUnlocked
              ? `Paid access active for farmer number ${equipmentForm.owner_farmer_id}. You can list equipment and upload photos.`
              : 'Pay the listing fee first in the subscription section, then enter the same farmer number here to unlock this form and photo uploads.'}
          </div>
          <form onSubmit={submitEquipment}>
            <label>{t('ownerName')}<span className="required-indicator">*</span><br /><input value={equipmentForm.owner_name} onChange={e => setEquipmentForm(f => ({ ...f, owner_name: e.target.value }))} required className={equipmentErrors.owner_name ? 'error' : ''} /></label>
            {equipmentErrors.owner_name && <span className="error-message">{equipmentErrors.owner_name}</span>}
            
            <label>Your farmer number (from registration)<br /><input type="number" value={equipmentForm.owner_farmer_id} onChange={e => setEquipmentForm(f => ({ ...f, owner_farmer_id: e.target.value }))} placeholder="e.g. 1" className={equipmentErrors.owner_farmer_id ? 'error' : ''} /></label>
            {equipmentErrors.owner_farmer_id && <span className="error-message">{equipmentErrors.owner_farmer_id}</span>}

            <fieldset disabled={!equipmentListingUnlocked || isLoadingEquipment} style={{ border: 'none', padding: 0, margin: 0 }}>
            
            <label>{t('equipmentType')}<span className="required-indicator">*</span><br /><input value={equipmentForm.type} onChange={e => setEquipmentForm(f => ({ ...f, type: e.target.value }))} required className={equipmentErrors.type ? 'error' : ''} /></label>
            {equipmentErrors.type && <span className="error-message">{equipmentErrors.type}</span>}
            
            <label>{t('equipmentCategory')}<br />
              <select value={equipmentForm.category} onChange={e => setEquipmentForm(f => ({ ...f, category: e.target.value }))}>
                <option value="tractor">🚜 Tractor</option>
                <option value="plow">Plow</option>
                <option value="pump">💧 Pump</option>
                <option value="harvester">Harvester</option>
                <option value="sprayer">Sprayer</option>
                <option value="other">Other</option>
              </select>
            </label>
            
            <label>{t('district')}<br />
              <select value={equipmentForm.district} onChange={e => setEquipmentForm(f => ({ ...f, district: e.target.value }))}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            
            <label>{t('pricePerDay')} (GHS)<span className="required-indicator">*</span><br /><input type="number" min="0" step="0.01" value={equipmentForm.price_per_day} onChange={e => setEquipmentForm(f => ({ ...f, price_per_day: e.target.value }))} required className={equipmentErrors.price_per_day ? 'error' : ''} /></label>
            {equipmentErrors.price_per_day && <span className="error-message">{equipmentErrors.price_per_day}</span>}
            
            <label>{t('description')}<br /><textarea rows={2} value={equipmentForm.description} onChange={e => setEquipmentForm(f => ({ ...f, description: e.target.value }))} className={equipmentErrors.description ? 'error' : ''} /></label>
            {equipmentErrors.description && <span className="error-message">{equipmentErrors.description}</span>}
            
            {equipmentErrors.submit && <span className="error-message">{equipmentErrors.submit}</span>}
            
            <button type="submit" disabled={isLoadingEquipment} className={isLoadingEquipment ? 'loading' : ''}>
              {isLoadingEquipment ? (
                <><span className="spinner"></span>{t('addListing')} ({t('loading')})</>
              ) : (
                t('addListing')
              )}
            </button>
            </fieldset>
          </form>
        </div>
      </div>

      {/* ── Phase 3: Search & Filters ── */}
      <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>🔍 Search & Filter Equipment</h2>
        <div className="grid-2">
          <div>
            <label>Search by type, owner, or description<br />
              <input
                type="text"
                placeholder="e.g. Tractor, Pump, John..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setShowAutoComplete(e.target.value.length > 0); }}
                onBlur={() => setTimeout(() => setShowAutoComplete(false), 200)}
              />
              {showAutoComplete && getAutocompleteSuggestions().length > 0 && (
                <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto', zIndex: 100, position: 'relative' }}>
                  {getAutocompleteSuggestions().map((suggestion, idx) => (
                    <div
                      key={idx}
                      onClick={() => { setSearchTerm(suggestion); setShowAutoComplete(false); }}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', hover: { background: '#f5f5f5' } }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </label>
          </div>
          
          <div>
            <label>Category<br />
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="">All categories</option>
                <option value="tractor">🚜 Tractor</option>
                <option value="plow">Plow</option>
                <option value="pump">💧 Pump</option>
                <option value="harvester">Harvester</option>
                <option value="sprayer">Sprayer</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          
          <div>
            <label>Price Min (GHS)<br />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 50"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
              />
            </label>
          </div>
          
          <div>
            <label>Price Max (GHS)<br />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 500"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: '0.88rem', color: '#666' }}>
          🎯 Found {filteredEquipment.length} equipment{filteredEquipment.length !== equipment.length ? ` (filtered from ${equipment.length})` : ''}
        </div>
      </section>

      {/* ── Available Equipment & Rental Pools ── */}
      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div style={card}>
          <h2>📋 {t('availableEquipment')}</h2>
          {filteredEquipment.length > 0 ? filteredEquipment.map(item => {
            const canUploadPhoto = hasPaidListingAccess(item.owner_farmer_id);
            return (
            <div key={item.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eee', position: 'relative' }}>
              {/* Favorite button */}
              <button
                type="button"
                onClick={() => toggleFavorite(item.id)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0 4px',
                  color: favorites.includes(item.id) ? '#d32f2f' : '#ccc'
                }}
                title={favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.includes(item.id) ? '❤️' : '🤍'}
              </button>
              
              {item.photo_url && (
                <img
                  src={`${API_BASE.replace('/api', '')}${item.photo_url}`}
                  alt={item.type}
                  style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                />
              )}
              <div>
                <strong>{item.type}</strong>{' '}
                {item.category && <span style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: 4, padding: '2px 6px', fontSize: '0.78rem' }}>{item.category}</span>}
              </div>
                <div style={{ color: '#555', fontSize: '0.88rem' }}>📍 {item.district} · 👤 {item.owner_name}</div>
              {isVerifiedSeller(item.owner_farmer_id) && (
                <div style={{ marginTop: 6, display: 'inline-flex', gap: 6, alignItems: 'center', padding: '4px 8px', borderRadius: 999, background: getSellerRank(item.owner_farmer_id) === 2 ? '#fff3cd' : '#e8f5e9', color: getSellerRank(item.owner_farmer_id) === 2 ? '#8a5b00' : '#2e7d32', fontSize: '0.78rem', fontWeight: 700 }}>
                  {getSellerRank(item.owner_farmer_id) === 2 ? '⭐ Gold verified seller' : '✅ Verified seller'}
                </div>
              )}
              <div style={{ fontWeight: 700, color: '#1769aa' }}>GHS {Number(item.price_per_day ?? 0).toFixed(2)} / day</div>
              {item.description && <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.description}</div>}

              <div style={{ marginTop: 8, padding: 10, background: '#f6fbff', border: '1px solid #d6e8f7', borderRadius: 8 }}>
                <div style={{ fontSize: '0.84rem', color: '#0f4c75', marginBottom: 6 }}>
                  Seller contact: {revealedSellerPhones[item.id] || item.owner_phone_masked || 'Not available'}
                </div>
                {!revealedSellerPhones[item.id] && item.owner_phone_masked && (
                  <button
                    type="button"
                    onClick={() => revealSellerPhone(item.id)}
                    style={{ background: '#1769aa', fontSize: '0.82rem', padding: '8px 10px', width: 'auto' }}
                  >
                    Contact seller (show full number)
                  </button>
                )}
              </div>

              <div style={{ marginTop: 8, padding: 10, background: '#fafafa', border: '1px solid #ececec', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: '0.88rem' }}>Chat with seller</strong>
                  <button
                    type="button"
                    onClick={() => toggleEquipmentChat(item.id)}
                    style={{ width: 'auto', fontSize: '0.82rem', padding: '7px 10px', background: '#2e7d32' }}
                  >
                    {chatOpenByEquipment[item.id] ? 'Hide chat' : 'Open chat'}
                  </button>
                </div>

                {chatOpenByEquipment[item.id] && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid #e4e4e4', borderRadius: 6, padding: 8, background: 'white', marginBottom: 8 }}>
                      {chatLoadingByEquipment[item.id] ? (
                        <div style={{ fontSize: '0.82rem', color: '#777' }}>Loading chat...</div>
                      ) : (chatByEquipment[item.id] || []).length > 0 ? (
                        (chatByEquipment[item.id] || []).map(msg => (
                          <div key={msg.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ fontSize: '0.8rem', color: '#333' }}>
                              <strong>{msg.sender_name}</strong> · {maskPhone(msg.sender_phone)}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#555' }}>{msg.message}</div>
                            <div style={{ fontSize: '0.74rem', color: '#999' }}>{new Date(msg.created_at).toLocaleString()}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.82rem', color: '#777' }}>No chat yet. Start the conversation.</div>
                      )}
                    </div>

                    <input
                      placeholder="Your name"
                      value={ensureChatDraft(item.id).sender_name}
                      onChange={e => setChatDraftByEquipment(prev => ({
                        ...prev,
                        [item.id]: { ...ensureChatDraft(item.id), sender_name: e.target.value },
                      }))}
                      style={{ marginBottom: 6 }}
                    />
                    <input
                      placeholder="Your phone"
                      value={ensureChatDraft(item.id).sender_phone}
                      onChange={e => setChatDraftByEquipment(prev => ({
                        ...prev,
                        [item.id]: { ...ensureChatDraft(item.id), sender_phone: e.target.value },
                      }))}
                      style={{ marginBottom: 6 }}
                    />
                    <textarea
                      rows={2}
                      placeholder="Type your message"
                      value={ensureChatDraft(item.id).message}
                      onChange={e => setChatDraftByEquipment(prev => ({
                        ...prev,
                        [item.id]: { ...ensureChatDraft(item.id), message: e.target.value },
                      }))}
                      style={{ marginBottom: 6 }}
                    />
                    <button
                      type="button"
                      onClick={() => submitEquipmentChatMessage(item.id)}
                      disabled={chatSendingByEquipment[item.id]}
                      style={{ background: '#1769aa', fontSize: '0.84rem' }}
                      className={chatSendingByEquipment[item.id] ? 'loading' : ''}
                    >
                      {chatSendingByEquipment[item.id] ? <><span className="spinner"></span>(loading)</> : <>Send chat</>}
                    </button>
                  </div>
                )}
              </div>

              {canUploadPhoto ? (
                <>
                  <label style={{ marginTop: 8, fontSize: '0.85rem' }}>📷 {t('uploadPhoto')}:
                    <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{ marginTop: 4 }} disabled={isLoadingPhotoUpload} />
                  </label>
                  {photoFile && <button type="button" onClick={() => uploadEquipmentPhoto(item.id)} disabled={isLoadingPhotoUpload} style={{ background: '#555', marginTop: 4 }} className={isLoadingPhotoUpload ? 'loading' : ''}>
                    {isLoadingPhotoUpload ? <><span className="spinner"></span>({t('loading')})</> : <>{t('uploadPhoto')}</> }
                  </button>}
                </>
              ) : (
                <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#8a5b00', background: '#fff7e6', padding: 8, borderRadius: 6 }}>
                  Photo upload locked until the seller pays the listing fee.
                </div>
              )}
            </div>
          );}) : <p style={{ color: '#888' }}>{filteredEquipment.length === 0 && equipment.length > 0 ? '❌ No equipment matches your filters. Try adjusting your search.' : t('noEquipment')}</p>}
        </div>

        <div style={card}>
          <h2>🤝 {t('rentalPools')}</h2>
          <p style={{ marginTop: 0, color: '#555', fontSize: '0.88rem' }}>ℹ️ {t('poolHelp')}</p>
          {rentalPools.length > 0 ? rentalPools.map(pool => (
            <div key={pool.id} style={{ marginBottom: 10, padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafafa' }}>
              <div><strong>Pool #{pool.id}</strong> — <span style={{ color: pool.status === 'ready' ? '#2e7d32' : '#888' }}>{t(pool.status)}</span></div>
              <div style={{ fontSize: '0.86rem', color: '#555' }}>📍 {pool.district} · 📅 {pool.rental_date}</div>
              <div style={{ fontSize: '0.86rem' }}>Equipment number: {pool.equipment_id} · Farmers: {Array.isArray(pool.farmer_ids) ? pool.farmer_ids.join(', ') : pool.farmer_ids}</div>
            </div>
          )) : <p style={{ color: '#888' }}>{t('noPools')}</p>}
        </div>
      </div>

      {/* ── Phase 3: Favorites Section ── */}
      {favorites.length > 0 && (
        <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
          <h2 style={{ marginTop: 0 }}>❤️ Your Favorite Equipment ({favorites.length})</h2>
          <p style={{ marginTop: 0, color: '#555', fontSize: '0.88rem' }}>Equipment you've bookmarked for quick access</p>
          <div className="grid-2">
            {equipment.filter(item => favorites.includes(item.id)).map(item => (
              <div key={item.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 12, background: '#fff9f9', position: 'relative' }}>
                {item.photo_url && (
                  <img
                    src={`${API_BASE.replace('/api', '')}${item.photo_url}`}
                    alt={item.type}
                    style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
                  />
                )}
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.type}</div>
                {item.category && <span style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: 4, padding: '2px 6px', fontSize: '0.78rem' }}>{item.category}</span>}
                <div style={{ fontSize: '0.85rem', color: '#555', marginTop: 4 }}>📍 {item.district}</div>
                <div style={{ fontSize: '0.85rem', color: '#555' }}>👤 {item.owner_name}</div>
                <div style={{ fontWeight: 700, color: '#1769aa', marginTop: 4 }}>GHS {Number(item.price_per_day ?? 0).toFixed(2)} / day</div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(item.id)}
                  style={{
                    width: '100%',
                    marginTop: 8,
                    background: '#d32f2f',
                    color: 'white'
                  }}
                >
                  ❤️ Remove from favorites
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Free business profiles ── */}
      <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>🏪 Free business profile pages</h2>
        <p style={{ marginTop: 0, color: '#555', fontSize: '0.88rem' }}>Paid sellers get a simple public profile page with their contact, badge, and listings.</p>
        {getBusinessProfileFarmers().length > 0 ? (
          <div className="grid-2">
            {getBusinessProfileFarmers().map(farmer => {
              const listings = getFarmerListings(farmer.id);
              const subscription = getActiveSubscription(farmer.id);
              return (
                <div key={farmer.id} style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 14, background: subscription?.plan === 'yearly' ? '#fff8e1' : '#f7fbff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{farmer.name}</div>
                      <div style={{ fontSize: '0.86rem', color: '#555' }}>📍 {farmer.district}</div>
                      <div style={{ fontSize: '0.86rem', color: '#555' }}>📞 {maskPhone(farmer.phone)}</div>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 8px', borderRadius: 999, background: subscription?.plan === 'yearly' ? '#fff3cd' : '#e8f5e9', color: subscription?.plan === 'yearly' ? '#8a5b00' : '#2e7d32' }}>
                      {getSellerLabel(farmer.id)}
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: '0.86rem', color: '#333' }}>
                    <strong>{listings.length}</strong> equipment listing{listings.length === 1 ? '' : 's'}
                  </div>
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    {listings.slice(0, 3).map(item => (
                      <div key={item.id} style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.9)', border: '1px solid #ececec' }}>
                        <div style={{ fontWeight: 600 }}>{item.type}</div>
                        <div style={{ fontSize: '0.84rem', color: '#555' }}>GHS {Number(item.price_per_day ?? 0).toFixed(2)} / day · {item.district}</div>
                      </div>
                    ))}
                    {listings.length === 0 && <div style={{ fontSize: '0.84rem', color: '#777' }}>No listings yet.</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: '#777' }}>No paid seller profiles yet.</div>
        )}
      </section>

      {/* ── Premium seller access hub ── */}
      <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>⭐ Premium seller access</h2>
        <p style={{ marginTop: 0, color: '#555', fontSize: '0.88rem' }}>Enter the same farmer number you used for subscription to unlock the Ghana-wide renter directory. Yearly sellers also get priority support.</p>

        {!hasPremiumAccess ? (
          <div style={{ color: '#777' }}>Add a paid farmer number above to unlock this section.</div>
        ) : (
          <div className="grid-2">
            <div style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 14, background: '#f7fbff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>🌍 Ghana-wide renter directory</div>
                  <div style={{ fontSize: '0.86rem', color: '#555' }}>{premiumRenterDirectory.length} registered farmers available across all districts</div>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 8px', borderRadius: 999, background: '#e8f5e9', color: '#2e7d32' }}>
                  {getSellerLabel(selectedPremiumFarmerId)}
                </div>
              </div>

              <div style={{ marginTop: 10, display: 'grid', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {premiumRenterDirectory.slice(0, 12).map(farmer => (
                  <div key={farmer.id} style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.95)', border: '1px solid #ececec' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{farmer.name}</div>
                        <div style={{ fontSize: '0.84rem', color: '#555' }}>📍 {farmer.district}</div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#1769aa', fontWeight: 700 }}>{getFarmerListingCount(farmer.id)} listings</div>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#555', marginTop: 4 }}>📞 {maskPhone(farmer.phone)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 14, background: hasPrioritySupport ? '#fff8e1' : '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>🛟 Priority customer support</div>
                  <div style={{ fontSize: '0.86rem', color: '#555' }}>Yearly sellers get a priority inbox that stays with their farmer number.</div>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 8px', borderRadius: 999, background: hasPrioritySupport ? '#fff3cd' : '#eceff1', color: hasPrioritySupport ? '#8a5b00' : '#666' }}>
                  {hasPrioritySupport ? 'Priority unlocked' : 'Yearly only'}
                </div>
              </div>

              {hasPrioritySupport ? (
                <>
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    <label>
                      Farmer name<br />
                      <input value={supportForm.farmer_name || selectedPremiumFarmer?.name || ''} onChange={e => setSupportForm(f => ({ ...f, farmer_name: e.target.value }))} placeholder="Your name" />
                    </label>
                    <label>
                      Phone number<br />
                      <input value={supportForm.phone || selectedPremiumFarmer?.phone || ''} onChange={e => setSupportForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 0241234567" />
                    </label>
                    <label>
                      Subject<br />
                      <input value={supportForm.subject} onChange={e => setSupportForm(f => ({ ...f, subject: e.target.value }))} placeholder="Billing, listing, payout, or access issue" />
                    </label>
                    <label>
                      Message<br />
                      <textarea rows={4} value={supportForm.message} onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us what you need help with" />
                    </label>
                  </div>

                  <button type="button" onClick={submitPrioritySupportTicket} disabled={isLoadingSupport} className={isLoadingSupport ? 'loading' : ''} style={{ marginTop: 10 }}>
                    {isLoadingSupport ? <><span className="spinner"></span>(loading)</> : 'Send priority support request'}
                  </button>

                  <div style={{ marginTop: 14, borderTop: '1px solid #ececec', paddingTop: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent support tickets</div>
                    {supportTickets.length > 0 ? supportTickets.map(ticket => (
                      <div key={ticket.id} style={{ border: '1px solid #ececec', borderRadius: 8, padding: 10, marginBottom: 8, background: 'rgba(255,255,255,0.9)' }}>
                        <div style={{ fontWeight: 600 }}>{ticket.subject}</div>
                        <div style={{ fontSize: '0.84rem', color: '#555' }}>Status: {ticket.status} · Priority: {ticket.priority_level}</div>
                        <div style={{ fontSize: '0.82rem', color: '#777', marginTop: 4 }}>{ticket.message}</div>
                      </div>
                    )) : <div style={{ color: '#777', fontSize: '0.86rem' }}>No support requests yet.</div>}
                  </div>
                </>
              ) : (
                <div style={{ color: '#777', marginTop: 10 }}>Upgrade to yearly to unlock priority support and the support inbox.</div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Create Pool, Create Booking ── */}
      <div className="grid-3" style={{ marginBottom: 14 }}>
        <div style={card}>
          <h2>🤝 {t('createPool')}</h2>
          <form onSubmit={submitPool}>
            <label>{t('farmerId')}<span className="required-indicator">*</span><br /><input type="number" value={poolForm.farmer_id} onChange={e => setPoolForm(f => ({ ...f, farmer_id: Number(e.target.value) }))} required className={poolErrors.farmer_id ? 'error' : ''} /></label>
            {poolErrors.farmer_id && <span className="error-message">{poolErrors.farmer_id}</span>}
            
            <label>{t('equipmentId')}<span className="required-indicator">*</span><br /><input type="number" value={poolForm.equipment_id} onChange={e => setPoolForm(f => ({ ...f, equipment_id: Number(e.target.value) }))} required className={poolErrors.equipment_id ? 'error' : ''} /></label>
            {poolErrors.equipment_id && <span className="error-message">{poolErrors.equipment_id}</span>}
            
            <label>{t('rentalDate')}<span className="required-indicator">*</span><br /><input type="date" value={poolForm.rental_date} onChange={e => setPoolForm(f => ({ ...f, rental_date: e.target.value }))} required className={poolErrors.rental_date ? 'error' : ''} /></label>
            {poolErrors.rental_date && <span className="error-message">{poolErrors.rental_date}</span>}
            
            <label>{t('district')}<br />
              <select value={poolForm.district} onChange={e => setPoolForm(f => ({ ...f, district: e.target.value }))} className={poolErrors.district ? 'error' : ''}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            {poolErrors.district && <span className="error-message">{poolErrors.district}</span>}
            
            {poolErrors.submit && <span className="error-message">{poolErrors.submit}</span>}
            
            <button type="submit" disabled={isLoadingPool} className={isLoadingPool ? 'loading' : ''}>
              {isLoadingPool ? (
                <><span className="spinner"></span>{t('createPool')} ({t('loading')})</>
              ) : (
                t('createPool')
              )}
            </button>
          </form>
        </div>

        <div style={card}>
          <h2>📅 {t('createBooking')}</h2>
          <form onSubmit={submitBooking}>
            <label>{t('farmerId')}<span className="required-indicator">*</span><br /><input type="number" value={bookingForm.farmer_id} onChange={e => setBookingForm(f => ({ ...f, farmer_id: Number(e.target.value) }))} required className={bookingErrors.farmer_id ? 'error' : ''} /></label>
            {bookingErrors.farmer_id && <span className="error-message">{bookingErrors.farmer_id}</span>}
            
            <label>{t('equipmentId')}<span className="required-indicator">*</span><br /><input type="number" value={bookingForm.equipment_id} onChange={e => setBookingForm(f => ({ ...f, equipment_id: Number(e.target.value) }))} required className={bookingErrors.equipment_id ? 'error' : ''} /></label>
            {bookingErrors.equipment_id && <span className="error-message">{bookingErrors.equipment_id}</span>}
            
            <label>{t('rentalDate')}<span className="required-indicator">*</span><br /><input type="date" value={bookingForm.rental_date} onChange={e => setBookingForm(f => ({ ...f, rental_date: e.target.value }))} required className={bookingErrors.rental_date ? 'error' : ''} /></label>
            {bookingErrors.rental_date && <span className="error-message">{bookingErrors.rental_date}</span>}
            
            <label>{t('district')}<br />
              <select value={bookingForm.district} onChange={e => setBookingForm(f => ({ ...f, district: e.target.value }))}
                className={bookingErrors.district ? 'error' : ''}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            {bookingErrors.district && <span className="error-message">{bookingErrors.district}</span>}
            
            {bookingErrors.submit && <span className="error-message">{bookingErrors.submit}</span>}
            
            <button type="submit" disabled={isLoadingBooking} className={isLoadingBooking ? 'loading' : ''}>
              {isLoadingBooking ? (
                <><span className="spinner"></span>{t('bookEquipment')} ({t('loading')})</>
              ) : (
                t('bookEquipment')
              )}
            </button>
          </form>
        </div>

        
      </div>

      {/* ── Farmer Locations Map (OpenStreetMap / Leaflet) ── */}
      <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>🗺️ {t('mapTitle')}</h2>
        <p style={{ color: '#555', marginTop: 0, fontSize: '0.88rem' }}>{t('mapSubtitle')}</p>
        <div ref={mapRef} id="farmer-map" />
        <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 8, marginBottom: 0 }}>
          📍 Farmers registered with "Use my location" will appear as pins on the map.
        </p>
      </section>

      {/* ── Ratings & Reviews ── */}
      <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>⭐ {t('ratings')}</h2>
        <div className="grid-2">
          <form onSubmit={submitRating}>
            <label>{t('farmerId')}<span className="required-indicator">*</span><br />
              <input type="number" value={ratingForm.farmer_id}
                onChange={e => { const id = Number(e.target.value); setRatingForm(r => ({ ...r, farmer_id: id })); fetchFarmerRatings(id); }}
                required className={ratingErrors.farmer_id ? 'error' : ''} />
            </label>
            {ratingErrors.farmer_id && <span className="error-message">{ratingErrors.farmer_id}</span>}
            
            <label>Your name<span className="required-indicator">*</span><br /><input value={ratingForm.rater_name} onChange={e => setRatingForm(r => ({ ...r, rater_name: e.target.value }))} required className={ratingErrors.rater_name ? 'error' : ''} /></label>
            {ratingErrors.rater_name && <span className="error-message">{ratingErrors.rater_name}</span>}
            
            <label>{t('yourRating')}<br />
              <select value={ratingForm.rating} onChange={e => setRatingForm(r => ({ ...r, rating: Number(e.target.value) }))}>
                <option value="1">⭐ 1 — Poor</option>
                <option value="2">⭐⭐ 2 — Fair</option>
                <option value="3">⭐⭐⭐ 3 — Good</option>
                <option value="4">⭐⭐⭐⭐ 4 — Very Good</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 — Excellent</option>
              </select>
            </label>
            
            <label>{t('yourReview')}<span className="required-indicator">*</span><br /><textarea rows={3} value={ratingForm.review} onChange={e => setRatingForm(r => ({ ...r, review: e.target.value }))} required className={ratingErrors.review ? 'error' : ''} /></label>
            {ratingErrors.review && <span className="error-message">{ratingErrors.review}</span>}
            
            {ratingErrors.submit && <span className="error-message">{ratingErrors.submit}</span>}
            
            <button type="submit" disabled={isLoadingRating} className={isLoadingRating ? 'loading' : ''}>
              {isLoadingRating ? (
                <><span className="spinner"></span>{t('submitRating')} ({t('loading')})</>
              ) : (
                t('submitRating')
              )}
            </button>
          </form>
          <div>
            <h3 style={{ marginTop: 0 }}>📊 Farmer Reviews ({ratings.length})</h3>
            
            {ratings.length > 0 ? (
              <>
                {/* Phase 4: Average Rating Display */}
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1769aa', marginBottom: 4 }}>
                    {calculateAverageRating()} / 5.0 {renderStars(parseFloat(calculateAverageRating()))}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Based on {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}</div>
                </div>

                {/* Phase 4: Rating Distribution */}
                <div style={{ marginBottom: 12 }}>
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = getRatingDistribution()[stars];
                    const percentage = ratings.length > 0 ? Math.round((count / ratings.length) * 100) : 0;
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                        <div style={{ minWidth: 60, fontSize: '0.85rem' }}>{stars} ⭐</div>
                        <div style={{ flex: 1, background: '#e0e0e0', height: 20, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ background: '#1769aa', height: '100%', width: `${percentage}%`, transition: 'width 0.3s' }} />
                        </div>
                        <div style={{ minWidth: 50, fontSize: '0.8rem', color: '#666' }}>{count} ({percentage}%)</div>
                      </div>
                    );
                  })}
                </div>

                {/* Phase 4: Filter by Rating */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.85rem', color: '#555' }}>Filter by minimum rating:
                    <select value={minRatingFilter} onChange={e => setMinRatingFilter(Number(e.target.value))} style={{ display: 'block', marginTop: 6 }}>
                      <option value="0">All ratings</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5 stars</option>
                      <option value="4">⭐⭐⭐⭐ 4+ stars</option>
                      <option value="3">⭐⭐⭐ 3+ stars</option>
                      <option value="2">⭐⭐ 2+ stars</option>
                      <option value="1">⭐ 1+ stars</option>
                    </select>
                  </label>
                </div>

                {/* Phase 4: Reviews List */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e0e0e0' }}>
                  {getFilteredRatings(minRatingFilter).length > 0 ? getFilteredRatings(minRatingFilter).map(rating => (
                    <div key={rating.id} style={{ padding: 12, marginBottom: 10, border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <strong>{rating.rater_name}</strong>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1769aa' }}>{renderStars(rating.rating)}</div>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#555' }}>{rating.review}</div>
                      {rating.created_at && <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 6 }}>{new Date(rating.created_at).toLocaleDateString()}</div>}
                    </div>
                  )) : <p style={{ color: '#888', fontSize: '0.85rem' }}>No reviews match the selected filter.</p>}
                </div>
              </>
            ) : <p style={{ color: '#888' }}>{t('noRatings')}</p>}
          </div>
        </div>
      </section>

      {/* ── USSD Interface ── */}
      <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>📟 {t('ussdTitle')}</h2>
        <form onSubmit={sendUssd} style={{ maxWidth: 480 }}>
          <label>{t('ussdSession')}<br /><input value={ussdForm.session_id} onChange={e => setUssdForm(f => ({ ...f, session_id: e.target.value }))} placeholder="optional" disabled={isLoadingUssd} /></label>
          <label>{t('ussdPhone')}<br /><input value={ussdForm.phone_number} onChange={e => setUssdForm(f => ({ ...f, phone_number: e.target.value }))} required disabled={isLoadingUssd} /></label>
          <label>{t('ussdInput')}<br /><input value={ussdForm.input_text} onChange={e => setUssdForm(f => ({ ...f, input_text: e.target.value }))} required disabled={isLoadingUssd} /></label>
          <button type="submit" disabled={isLoadingUssd} className={isLoadingUssd ? 'loading' : ''}>
            {isLoadingUssd ? (
              <><span className="spinner"></span>{t('sendUssd')} ({t('loading')})</>
            ) : (
              t('sendUssd')
            )}
          </button>
        </form>
        {ussdResponse && (
          <div style={{ marginTop: 12, padding: 12, border: '1px solid #ccc', borderRadius: 10, background: '#f5f5f5', maxWidth: 480 }}>
            <strong>{t('ussdResponse')}:</strong>
            <div>{ussdResponse.message}</div>
            <div style={{ fontSize: '0.85rem', color: '#777' }}>Session: {ussdResponse.session_id}</div>
          </div>
        )}
      </section>

      {/* Phase 5: Admin Dashboard */}
      {isAdminAuthenticated && (
        <>
          {/* Admin Navigation Tabs */}
          <section style={{ marginBottom: 14, background: 'rgba(23, 105, 170, 0.1)', borderRadius: 14, padding: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setIsAdminView('dashboard')} style={{ padding: '8px 12px', background: isAdminView === 'dashboard' ? '#1769aa' : '#ddd', color: isAdminView === 'dashboard' ? 'white' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
                📊 {t('adminDashboard')}
              </button>
              <button onClick={() => setIsAdminView('bookings')} style={{ padding: '8px 12px', background: isAdminView === 'bookings' ? '#1769aa' : '#ddd', color: isAdminView === 'bookings' ? 'white' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
                📅 {t('bookingManagement')}
              </button>
              <button onClick={() => setIsAdminView('payments')} style={{ padding: '8px 12px', background: isAdminView === 'payments' ? '#1769aa' : '#ddd', color: isAdminView === 'payments' ? 'white' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
                💳 {t('paymentManagement')}
              </button>
              <button onClick={() => setIsAdminView('disputes')} style={{ padding: '8px 12px', background: isAdminView === 'disputes' ? '#1769aa' : '#ddd', color: isAdminView === 'disputes' ? 'white' : '#333', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
                ⚖️ {t('disputeResolution')}
              </button>
            </div>
          </section>

          {/* Dashboard View */}
          {isAdminView === 'dashboard' && (
            <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
              <h2 style={{ marginTop: 0 }}>📊 {t('dashboardStats')}</h2>
              {(() => {
                const stats = getDashboardStats();
                return (
                  <div className="grid-2">
                    <div style={{ padding: 16, background: '#e3f2fd', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1769aa' }}>{stats.totalFarmers}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{t('totalFarmers')}</div>
                    </div>
                    <div style={{ padding: 16, background: '#f3e5f5', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#7b1fa2' }}>{stats.totalEquipment}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{t('totalEquipment')}</div>
                    </div>
                    <div style={{ padding: 16, background: '#e8f5e9', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10a760' }}>{stats.totalBookings}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{t('totalBookings')}</div>
                    </div>
                    <div style={{ padding: 16, background: '#fff3e0', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f57c00' }}>{stats.totalPayments}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{t('totalPayments')}</div>
                    </div>
                    <div style={{ padding: 16, background: '#fce4ec', borderRadius: 8, textAlign: 'center', gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#c2185b' }}>GHS {stats.totalRevenue}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{t('totalRevenue')}</div>
                    </div>
                    <div style={{ padding: 16, background: '#e0f2f1', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00796b' }}>{stats.completedPayments}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{t('completedPayments')}</div>
                    </div>
                    <div style={{ padding: 16, background: '#ffebee', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d32f2f' }}>{stats.pendingBookings}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{t('pendingBookings')}</div>
                    </div>
                  </div>
                );
              })()}
            </section>
          )}

          {/* Bookings Management View */}
          {isAdminView === 'bookings' && (
            <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
              <h2 style={{ marginTop: 0 }}>📅 {t('bookingManagement')}</h2>
              <label style={{ marginBottom: 12, display: 'block' }}>
                {t('filterBookings')}:<br />
                <select value={adminBookingFilter} onChange={e => setAdminBookingFilter(e.target.value)} style={{ marginTop: 6 }}>
                  <option value="all">{t('all')}</option>
                  <option value="pending">{t('pending')}</option>
                  <option value="complete">{t('complete')}</option>
                </select>
              </label>
              <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 8, marginBottom: 12 }}>
                {getAdminFilteredBookings().length > 0 ? getAdminFilteredBookings().map(booking => (
                  <div key={booking.id} style={{ padding: 12, borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => setAdminSelectedBooking(booking)}>
                    <div style={{ fontWeight: 600 }}>Booking #{booking.id}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Equipment: {booking.equipment_id} | Status: {booking.status}</div>
                  </div>
                )) : <div style={{ padding: 12, textAlign: 'center', color: '#999' }}>{t('noBookings')}</div>}
              </div>
              {adminSelectedBooking && (
                <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                  <strong>Selected Booking Details:</strong>
                  <div style={{ fontSize: '0.85rem', marginTop: 8 }}>
                    <div>ID: {adminSelectedBooking.id}</div>
                    <div>Farmer: {adminSelectedBooking.farmer_id}</div>
                    <div>Equipment: {adminSelectedBooking.equipment_id}</div>
                    <div>Rental Date: {adminSelectedBooking.rental_date}</div>
                    <div>Status: {adminSelectedBooking.status}</div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Payments Management View */}
          {isAdminView === 'payments' && (
            <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
              <h2 style={{ marginTop: 0 }}>💳 {t('paymentManagement')}</h2>
              <label style={{ marginBottom: 12, display: 'block' }}>
                {t('filterPayments')}:<br />
                <select value={adminPaymentFilter} onChange={e => setAdminPaymentFilter(e.target.value)} style={{ marginTop: 6 }}>
                  <option value="all">{t('all')}</option>
                  <option value="pending">{t('pending')}</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </label>
              <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 8 }}>
                {getAdminFilteredPayments().length > 0 ? getAdminFilteredPayments().map(payment => (
                  <div key={payment.id} style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Ref: {payment.reference}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Amount: GHS {payment.amount} | Method: {payment.method}</div>
                    </div>
                    <div style={{ fontSize: '0.85rem', padding: '4px 8px', background: payment.status === 'completed' ? '#c8e6c9' : '#ffccbc', borderRadius: 4 }}>
                      {payment.status}
                    </div>
                  </div>
                )) : <div style={{ padding: 12, textAlign: 'center', color: '#999' }}>{t('noPayments')}</div>}
              </div>
            </section>
          )}

          {/* Dispute Resolution View */}
          {isAdminView === 'disputes' && (
            <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
              <h2 style={{ marginTop: 0 }}>⚖️ {t('disputeResolution')}</h2>
              <form onSubmit={processAdminRefund} style={{ maxWidth: 560 }}>
                <label>{t('bookingId')}<br /><input type="text" value={adminRefundForm.booking_id} onChange={e => setAdminRefundForm(f => ({ ...f, booking_id: e.target.value }))} required /></label>
                <label>{t('refundReason')}<br /><textarea rows={4} value={adminRefundForm.reason} onChange={e => setAdminRefundForm(f => ({ ...f, reason: e.target.value }))} required /></label>
                <button type="submit" disabled={isAdminProcessingRefund} style={{ marginTop: 12, padding: '10px 16px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: 6, cursor: isAdminProcessingRefund ? 'not-allowed' : 'pointer' }}>
                  {isAdminProcessingRefund ? 'Processing...' : '💰 ' + t('processRefund')}
                </button>
              </form>
            </section>
          )}
        </>
      )}

      <footer style={{ textAlign: 'center', padding: '14px 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>
        © 2026 AgroShare Ghana · Empowering Ghanaian Farmers
      </footer>
    </div>
  );
}

export default App;
