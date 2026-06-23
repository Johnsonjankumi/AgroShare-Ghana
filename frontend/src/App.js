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
    farmerId: 'Farmer ID',
    equipmentId: 'Equipment ID',
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
    howStep4: '4. Pay securely using Paystack, Mobile Money, or Credit Card.',
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
    subscriptionFarmerId: 'Farmer ID for subscription',
    ownerActivity: 'Owner activity feed',
    noActivity: 'No activity yet.',
    subscriptions: 'Subscriptions',
    paymentEvents: 'Payments',
    mapTitle: 'Farmer Locations Map',
    mapSubtitle: 'See where registered farmers are located across Ghana.',
    useMyLocation: 'Use my location',
    locationSet: 'Location saved',
    password: 'Password (min. 6 characters)',
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
    farmerId: 'Afuwfoɔ ID',
    equipmentId: 'Akode ID',
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
    howStep4: '4. Tua sika a ɛdi dwuma deɛ wɔde Paystack, Mobile Money, anaa Credit Card.',
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
    subscriptionFarmerId: 'Afuwfo ID ma subscription',
    ownerActivity: 'Wura adwuma amanneɛbɔ',
    noActivity: 'Amanneɛbɔ biara nni hɔ.',
    subscriptions: 'Subscriptions',
    paymentEvents: 'Payments',
    mapTitle: 'Afuwfoɔ Beae Map',
    mapSubtitle: 'Hwɛ beae a afuwfoɔ wɔ Ghana nyinaa mu.',
    useMyLocation: 'Fa me beae',
    locationSet: 'Beae akyerɛ',
    password: 'Gyinae (nsɛm 6 a ɛdɔɔso)',
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
  const [form, setForm] = useState({ name: '', phone: '', district: 'Greater Accra', password: '', latitude: null, longitude: null });
  const [equipmentForm, setEquipmentForm] = useState({ owner_name: '', type: '', category: 'other', district: 'Greater Accra', price_per_day: '', description: '' });
  const [bookingForm, setBookingForm] = useState({ farmer_id: '', equipment_id: '', rental_date: '', district: 'Greater Accra' });
  const [poolForm, setPoolForm] = useState({ farmer_id: '', equipment_id: '', rental_date: '', district: 'Greater Accra' });
  const [paymentForm, setPaymentForm] = useState({ booking_id: '', mobile_number: '', method: 'paystack' });
  const [subscriptionForm, setSubscriptionForm] = useState({ farmer_id: '', mobile_number: '' });
  const [ussdForm, setUssdForm] = useState({ session_id: localStorage.getItem('ussdSession') || '', phone_number: '', input_text: '' });
  const [notice, setNotice] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingForm, setRatingForm] = useState({ farmer_id: '', rater_name: '', rating: 5, review: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const t = key => translations[lang][key] || key;

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
    const res = await fetch(`${API_BASE}/farmers/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { showNotice('error', data.detail || 'Failed to register farmer.'); return; }
    setFarmers(f => [...f, data]);
    setBookingForm(b => ({ ...b, farmer_id: data.id }));
    setSubscriptionForm(s => ({ ...s, farmer_id: String(data.id), mobile_number: data.phone }));
    setForm({ name: '', phone: '', district: 'Greater Accra', password: '', latitude: null, longitude: null });
    showNotice('success', `✅ Farmer "${data.name}" registered! Your Farmer ID is ${data.id}. It has been sent to the booking and subscription forms.`);
  };

  const submitEquipment = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/equipment/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...equipmentForm, price_per_day: Number(equipmentForm.price_per_day) }),
    });
    const data = await res.json();
    if (!res.ok) { showNotice('error', data.detail || 'Failed to add equipment listing.'); return; }
    setEquipment(eq => [...eq, data]);
    setEquipmentForm({ owner_name: '', type: '', category: 'other', district, price_per_day: '', description: '' });
    showNotice('success', `✅ Equipment listed! Equipment ID is ${data.id}.`);
  };

  const submitBooking = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/bookings/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookingForm),
    });
    const data = await res.json();
    if (!res.ok) { showNotice('error', data.detail || 'Failed to create booking.'); return; }
    setBookingForm({ farmer_id: '', equipment_id: '', rental_date: '', district: 'Greater Accra' });
    showNotice('success', `✅ Booking created! Booking ID is ${data.id}.`);
  };

  const submitPool = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/pools/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(poolForm),
    });
    const data = await res.json();
    if (!res.ok) { showNotice('error', data.detail || 'Failed to create pool.'); return; }
    setRentalPools(p => { const ex = p.find(x => x.id === data.id); return ex ? p.map(x => x.id === data.id ? data : x) : [...p, data]; });
    setPoolForm({ farmer_id: '', equipment_id: '', rental_date: '', district: 'Greater Accra' });
    showNotice('success', `✅ Rental pool created! Pool ID is ${data.id}.`);
  };

  const submitPayment = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/payments/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(paymentForm),
    });
    const data = await res.json();
    if (!res.ok) { showNotice('error', data.detail || 'Unable to create payment. Check the booking ID and try again.'); return; }
    setPayments(p => [...p, data]);
    setPaymentForm({ booking_id: '', mobile_number: '', method: 'paystack' });
    refreshOwnerActivity();
    showNotice('success', `✅ Payment of GHS ${Number(data.amount).toFixed(2)} created! Reference: ${data.reference}`);
  };

  const submitSubscription = async plan => {
    if (!subscriptionForm.farmer_id || !subscriptionForm.mobile_number) {
      showNotice('error', 'Enter Farmer ID and mobile number before subscribing.');
      return;
    }

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
      showNotice('error', data.detail || 'Failed to create subscription.');
      return;
    }

    setSubscriptions(s => [data, ...s]);
    refreshOwnerActivity();
    showNotice('success', `✅ ${plan} subscription paid. Reference: ${data.reference}`);
  };

  const releasePayment = async paymentId => {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/release`, { method: 'POST' });
    const updated = await res.json();
    if (!res.ok) { showNotice('error', updated.detail || 'Unable to release payment.'); return; }
    setPayments(p => p.map(x => x.id === updated.id ? updated : x));
    refreshOwnerActivity();
    showNotice('success', '✅ Payment completed and released successfully!');
  };

  const sendUssd = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/ussd/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ussdForm),
    });
    const data = await res.json();
    localStorage.setItem('ussdSession', data.session_id);
    localStorage.setItem('ussdResponse', JSON.stringify(data));
    setUssdResponse(data);
    setUssdForm(f => ({ ...f, session_id: data.session_id }));
    showNotice('success', '✅ USSD request sent.');
  };

  const uploadEquipmentPhoto = async equipmentId => {
    if (!photoFile) { showNotice('error', 'Please select a photo first.'); return; }
    const formData = new FormData();
    formData.append('file', photoFile);
    const res = await fetch(`${API_BASE}/equipment/upload/${equipmentId}`, { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) { showNotice('error', data.detail || 'Failed to upload photo.'); return; }
    setPhotoFile(null);
    showNotice('success', '✅ Photo uploaded successfully!');
    fetch(`${API_BASE}/equipment/`).then(r => r.json()).then(setEquipment).catch(() => {});
  };

  const submitRating = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/ratings/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ratingForm, rating: Number(ratingForm.rating) }),
    });
    const data = await res.json();
    if (!res.ok) { showNotice('error', data.detail || 'Failed to submit rating.'); return; }
    setRatings(r => [...r, data]);
    setRatingForm({ farmer_id: '', rater_name: '', rating: 5, review: '' });
    showNotice('success', '✅ Rating submitted successfully!');
  };

  const fetchFarmerRatings = async farmerId => {
    if (!farmerId) return;
    const res = await fetch(`${API_BASE}/ratings/farmer/${farmerId}`);
    if (res.ok) { const data = await res.json(); setRatings(data); }
  };

  const card = { padding: 18, border: '1px solid #ddd', borderRadius: 12, background: 'rgba(255,255,255,0.97)' };

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
          <label style={{ margin: 0 }}>
            {t('language')}:<br />
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ marginTop: 4, width: 'auto' }}>
              <option value="en">English</option>
              <option value="twi">Twi</option>
            </select>
          </label>
        </div>
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
            <div className="price">GHS 80</div>
            <div className="period">/ per month — cancel anytime</div>
            <ul style={{ textAlign: 'left', paddingLeft: 18, color: '#333', fontSize: '0.88rem', marginBottom: 16 }}>
              <li>✅ List unlimited equipment</li>
              <li>✅ Receive bookings &amp; rental requests</li>
              <li>✅ Secure escrow payments (your money is protected)</li>
              <li>✅ SMS &amp; app alerts when someone books your tool</li>
              <li>✅ Verified seller badge (builds trust with buyers)</li>
              <li>✅ Access to all renters across Ghana</li>
            </ul>
            <button type="button" onClick={() => submitSubscription('monthly')}>{t('subscribe')}</button>
          </div>
          <div className="pricing-card featured">
            <div style={{ fontWeight: 700 }}>
              {t('yearly')} <span style={{ background: '#1769aa', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem' }}>{t('save')}</span>
            </div>
            <div className="price">GHS 800</div>
            <div className="period">/ GHS 80/mo × 10 months (2 months free)</div>
            <ul style={{ textAlign: 'left', paddingLeft: 18, color: '#333', fontSize: '0.88rem', marginBottom: 16 }}>
              <li>✅ Everything in Monthly</li>
              <li>⭐ Top of search results (get seen first)</li>
              <li>⭐ Gold verified badge on your listings</li>
              <li>⭐ Priority customer support (fast response)</li>
              <li>⭐ Early access to new features</li>
              <li>⭐ Free business profile page for your farm</li>
              <li>🎁 2 months completely free</li>
            </ul>
            <button type="button" onClick={() => submitSubscription('yearly')}>{t('subscribe')}</button>
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
            <label>{t('farmerName')}<br /><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></label>
            <label>{t('phone')}<br /><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required /></label>
            <label>{t('password')}<br /><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></label>
            <label>{t('district')}<br />
              <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>📍 Location (optional)</div>
              <button type="button" onClick={getMyLocation} style={{ background: '#2e7d32', marginBottom: 4 }}>{t('useMyLocation')}</button>
              {form.latitude && <small style={{ display: 'block', color: '#2e7d32' }}>✅ {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</small>}
            </div>
            <button type="submit" style={{ background: '#2e7d32' }}>{t('registerFarmer')}</button>
          </form>
        </div>

        <div style={card}>
          <h2>🚜 {t('listEquipment')}</h2>
          <form onSubmit={submitEquipment}>
            <label>{t('ownerName')}<br /><input value={equipmentForm.owner_name} onChange={e => setEquipmentForm(f => ({ ...f, owner_name: e.target.value }))} required /></label>
            <label>{t('equipmentType')}<br /><input value={equipmentForm.type} onChange={e => setEquipmentForm(f => ({ ...f, type: e.target.value }))} required /></label>
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
            <label>{t('pricePerDay')} (GHS)<br /><input type="number" min="0" step="0.01" value={equipmentForm.price_per_day} onChange={e => setEquipmentForm(f => ({ ...f, price_per_day: e.target.value }))} required /></label>
            <label>{t('description')}<br /><textarea rows={2} value={equipmentForm.description} onChange={e => setEquipmentForm(f => ({ ...f, description: e.target.value }))} /></label>
            <button type="submit">{t('addListing')}</button>
          </form>
        </div>
      </div>

      {/* ── Available Equipment & Rental Pools ── */}
      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div style={card}>
          <h2>📋 {t('availableEquipment')}</h2>
          {equipment.length > 0 ? equipment.map(item => (
            <div key={item.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
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
              <div style={{ fontWeight: 700, color: '#1769aa' }}>GHS {Number(item.price_per_day ?? 0).toFixed(2)} / day</div>
              {item.description && <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.description}</div>}
              <label style={{ marginTop: 8, fontSize: '0.85rem' }}>📷 {t('uploadPhoto')}:
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{ marginTop: 4 }} />
              </label>
              {photoFile && <button type="button" onClick={() => uploadEquipmentPhoto(item.id)} style={{ background: '#555', marginTop: 4 }}>{t('uploadPhoto')}</button>}
            </div>
          )) : <p style={{ color: '#888' }}>{t('noEquipment')}</p>}
        </div>

        <div style={card}>
          <h2>🤝 {t('rentalPools')}</h2>
          <p style={{ marginTop: 0, color: '#555', fontSize: '0.88rem' }}>ℹ️ {t('poolHelp')}</p>
          {rentalPools.length > 0 ? rentalPools.map(pool => (
            <div key={pool.id} style={{ marginBottom: 10, padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafafa' }}>
              <div><strong>Pool #{pool.id}</strong> — <span style={{ color: pool.status === 'ready' ? '#2e7d32' : '#888' }}>{t(pool.status)}</span></div>
              <div style={{ fontSize: '0.86rem', color: '#555' }}>📍 {pool.district} · 📅 {pool.rental_date}</div>
              <div style={{ fontSize: '0.86rem' }}>Equipment: {pool.equipment_id} · Farmers: {Array.isArray(pool.farmer_ids) ? pool.farmer_ids.join(', ') : pool.farmer_ids}</div>
            </div>
          )) : <p style={{ color: '#888' }}>{t('noPools')}</p>}
        </div>
      </div>

      {/* ── Create Pool, Create Booking, Payments ── */}
      <div className="grid-3" style={{ marginBottom: 14 }}>
        <div style={card}>
          <h2>🤝 {t('createPool')}</h2>
          <form onSubmit={submitPool}>
            <label>{t('farmerId')}<br /><input type="number" value={poolForm.farmer_id} onChange={e => setPoolForm(f => ({ ...f, farmer_id: Number(e.target.value) }))} required /></label>
            <label>{t('equipmentId')}<br /><input type="number" value={poolForm.equipment_id} onChange={e => setPoolForm(f => ({ ...f, equipment_id: Number(e.target.value) }))} required /></label>
            <label>{t('rentalDate')}<br /><input type="date" value={poolForm.rental_date} onChange={e => setPoolForm(f => ({ ...f, rental_date: e.target.value }))} required /></label>
            <label>{t('district')}<br />
              <select value={poolForm.district} onChange={e => setPoolForm(f => ({ ...f, district: e.target.value }))}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <button type="submit">{t('createPool')}</button>
          </form>
        </div>

        <div style={card}>
          <h2>📅 {t('createBooking')}</h2>
          <form onSubmit={submitBooking}>
            <label>{t('farmerId')}<br /><input type="number" value={bookingForm.farmer_id} onChange={e => setBookingForm(f => ({ ...f, farmer_id: Number(e.target.value) }))} required /></label>
            <label>{t('equipmentId')}<br /><input type="number" value={bookingForm.equipment_id} onChange={e => setBookingForm(f => ({ ...f, equipment_id: Number(e.target.value) }))} required /></label>
            <label>{t('rentalDate')}<br /><input type="date" value={bookingForm.rental_date} onChange={e => setBookingForm(f => ({ ...f, rental_date: e.target.value }))} required /></label>
            <label>{t('district')}<br />
              <select value={bookingForm.district} onChange={e => setBookingForm(f => ({ ...f, district: e.target.value }))}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <button type="submit">{t('bookEquipment')}</button>
          </form>
        </div>

        <div style={card}>
          <h2>💳 {t('payments')}</h2>
          <form onSubmit={submitPayment}>
            <label>Booking ID<br /><input type="number" value={paymentForm.booking_id} onChange={e => setPaymentForm(f => ({ ...f, booking_id: Number(e.target.value) }))} required /></label>
            <label>{t('mobileNumber')}<br /><input value={paymentForm.mobile_number} onChange={e => setPaymentForm(f => ({ ...f, mobile_number: e.target.value }))} required /></label>
            <label>Payment method<br />
              <select value={paymentForm.method} onChange={e => setPaymentForm(f => ({ ...f, method: e.target.value }))}>
                <option value="paystack">Paystack</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </label>
            <button type="submit">{t('payNow')}</button>
          </form>
          <div style={{ marginTop: 12 }}>
            {payments.length > 0 ? payments.map(payment => (
              <div key={payment.id} style={{ marginBottom: 10, padding: 10, border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafafa', fontSize: '0.88rem' }}>
                <div><strong>GHS {Number(payment.amount ?? 0).toFixed(2)}</strong> · {payment.status}</div>
                <div style={{ color: '#777', wordBreak: 'break-all' }}>{payment.reference}</div>
                {payment.status === 'held' && (
                  <button type="button" onClick={() => releasePayment(payment.id)} style={{ marginTop: 6, background: '#2e7d32' }}>✅ {t('complete')}</button>
                )}
              </div>
            )) : <p style={{ color: '#888' }}>{t('noPayments')}</p>}
          </div>
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
            <label>{t('farmerId')}<br />
              <input type="number" value={ratingForm.farmer_id}
                onChange={e => { const id = Number(e.target.value); setRatingForm(r => ({ ...r, farmer_id: id })); fetchFarmerRatings(id); }}
                required />
            </label>
            <label>Your name<br /><input value={ratingForm.rater_name} onChange={e => setRatingForm(r => ({ ...r, rater_name: e.target.value }))} required /></label>
            <label>{t('yourRating')}<br />
              <select value={ratingForm.rating} onChange={e => setRatingForm(r => ({ ...r, rating: Number(e.target.value) }))}>
                <option value="1">⭐ 1 — Poor</option>
                <option value="2">⭐⭐ 2 — Fair</option>
                <option value="3">⭐⭐⭐ 3 — Good</option>
                <option value="4">⭐⭐⭐⭐ 4 — Very Good</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 — Excellent</option>
              </select>
            </label>
            <label>{t('yourReview')}<br /><textarea rows={3} value={ratingForm.review} onChange={e => setRatingForm(r => ({ ...r, review: e.target.value }))} required /></label>
            <button type="submit">{t('submitRating')}</button>
          </form>
          <div>
            <h3 style={{ marginTop: 0 }}>Farmer reviews</h3>
            {ratings.length > 0 ? ratings.map(rating => (
              <div key={rating.id} style={{ padding: 12, marginBottom: 10, border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafafa' }}>
                <div><strong>{rating.rater_name}</strong> — {'⭐'.repeat(rating.rating)}</div>
                <div style={{ fontSize: '0.88rem', color: '#555' }}>{rating.review}</div>
              </div>
            )) : <p style={{ color: '#888' }}>{t('noRatings')}</p>}
          </div>
        </div>
      </section>

      {/* ── USSD Interface ── */}
      <section style={{ marginBottom: 14, background: 'rgba(255,255,255,0.97)', borderRadius: 14, padding: 16, border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>📟 {t('ussdTitle')}</h2>
        <form onSubmit={sendUssd} style={{ maxWidth: 480 }}>
          <label>{t('ussdSession')}<br /><input value={ussdForm.session_id} onChange={e => setUssdForm(f => ({ ...f, session_id: e.target.value }))} placeholder="optional" /></label>
          <label>{t('ussdPhone')}<br /><input value={ussdForm.phone_number} onChange={e => setUssdForm(f => ({ ...f, phone_number: e.target.value }))} required /></label>
          <label>{t('ussdInput')}<br /><input value={ussdForm.input_text} onChange={e => setUssdForm(f => ({ ...f, input_text: e.target.value }))} required /></label>
          <button type="submit">{t('sendUssd')}</button>
        </form>
        {ussdResponse && (
          <div style={{ marginTop: 12, padding: 12, border: '1px solid #ccc', borderRadius: 10, background: '#f5f5f5', maxWidth: 480 }}>
            <strong>{t('ussdResponse')}:</strong>
            <div>{ussdResponse.message}</div>
            <div style={{ fontSize: '0.85rem', color: '#777' }}>Session: {ussdResponse.session_id}</div>
          </div>
        )}
      </section>

      <footer style={{ textAlign: 'center', padding: '14px 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>
        © 2026 AgroShare Ghana · Empowering Ghanaian Farmers
      </footer>
    </div>
  );
}

export default App;
