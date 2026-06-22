import { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

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
    paystack: 'Paystack',
    mobileMoney: 'Mobile Money',
    paymentStatus: 'Payment status',
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
    paystack: 'Paystack',
    mobileMoney: 'Mobile Money',
    paymentStatus: 'Sika status',
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
  },
};

function App() {
  const [lang, setLang] = useState('en');
  const [farmers, setFarmers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [rentalPools, setRentalPools] = useState([]);
  const [payments, setPayments] = useState([]);
  const [ussdResponse, setUssdResponse] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ussdResponse'));
    } catch {
      return null;
    }
  });
  const [district, setDistrict] = useState('Greater Accra');
  const [form, setForm] = useState({ name: '', phone: '', district: 'Greater Accra' });
  const [equipmentForm, setEquipmentForm] = useState({ owner_name: '', type: '', district: 'Greater Accra', price_per_day: '', description: '' });
  const [bookingForm, setBookingForm] = useState({ farmer_id: '', equipment_id: '', rental_date: '', district: 'Greater Accra' });
  const [poolForm, setPoolForm] = useState({ farmer_id: '', equipment_id: '', rental_date: '', district: 'Greater Accra' });
  const [paymentForm, setPaymentForm] = useState({ booking_id: '', mobile_number: '', method: 'paystack' });
  const [ussdForm, setUssdForm] = useState({ session_id: localStorage.getItem('ussdSession') || '', phone_number: '', input_text: '' });
  const [notice, setNotice] = useState(null);

  const t = key => translations[lang][key] || key;

  const showNotice = (type, text) => {
    setNotice({ type, text });
  };

  useEffect(() => {
    fetch(`${API_BASE}/farmers/`).then(res => res.json()).then(setFarmers);
    fetch(`${API_BASE}/equipment/`).then(res => res.json()).then(setEquipment);
    fetch(`${API_BASE}/pools/`).then(res => res.json()).then(setRentalPools);
    fetch(`${API_BASE}/payments/`).then(res => res.json()).then(setPayments);
  }, []);

  const loadDistrict = () => {
    fetch(`${API_BASE}/equipment/?district=${encodeURIComponent(district)}`)
      .then(res => res.json())
      .then(setEquipment);

    fetch(`${API_BASE}/pools/?district=${encodeURIComponent(district)}`)
      .then(res => res.json())
      .then(setRentalPools);
  };

  const submitFarmer = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/farmers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.detail || data.error || 'Failed to register farmer.');
      return;
    }
    setFarmers([...farmers, data]);
    setForm({ name: '', phone: '', district });
    showNotice('success', 'Farmer registered successfully.');
  };

  const submitEquipment = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/equipment/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...equipmentForm, price_per_day: Number(equipmentForm.price_per_day) }),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.detail || data.error || 'Failed to add equipment listing.');
      return;
    }
    setEquipment([...equipment, data]);
    setEquipmentForm({ owner_name: '', type: '', district, price_per_day: '', description: '' });
    showNotice('success', 'Equipment listing added successfully.');
  };

  const submitBooking = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/bookings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingForm),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.detail || data.error || 'Failed to create booking.');
      return;
    }
    showNotice('success', `${t('createBooking')} ID ${data.id}`);
  };

  const submitPool = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/pools/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poolForm),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.detail || data.error || 'Failed to create pool.');
      return;
    }
    const exists = rentalPools.find(pool => pool.id === data.id);
    if (exists) {
      setRentalPools(rentalPools.map(pool => (pool.id === data.id ? data : pool)));
    } else {
      setRentalPools([...rentalPools, data]);
    }
    setPoolForm({ farmer_id: '', equipment_id: '', rental_date: '', district });
    showNotice('success', 'Rental pool created successfully.');
  };

  const submitPayment = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/payments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentForm),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice('error', data.detail || data.error || 'Unable to create payment. Check the booking ID and try again.');
      return;
    }
    setPayments([...payments, data]);
    setPaymentForm({ booking_id: '', mobile_number: '', method: 'paystack' });
    showNotice('success', 'Payment created successfully.');
  };

  const releasePayment = async paymentId => {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/release`, {
      method: 'POST',
    });
    const updated = await res.json();
    if (!res.ok) {
      showNotice('error', updated.detail || updated.error || 'Unable to complete payment release.');
      return;
    }
    setPayments(payments.map(payment => (payment.id === updated.id ? updated : payment)));
    showNotice('success', 'Payment completed successfully.');
  };

  const sendUssd = async e => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/ussd/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ussdForm),
    });
    const data = await res.json();
    localStorage.setItem('ussdSession', data.session_id);
    localStorage.setItem('ussdResponse', JSON.stringify(data));
    setUssdResponse(data);
    setUssdForm({ ...ussdForm, session_id: data.session_id });
    showNotice('success', 'USSD request sent successfully.');
  };

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        padding: 24,
        maxWidth: 960,
        margin: '0 auto',
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(14, 40, 18, 0.35), rgba(14, 40, 18, 0.35)), url(${process.env.PUBLIC_URL}/farm-background.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
      }}
    >
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1>{t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          <div>
            <label>
              {t('language')}:<br />
              <select value={lang} onChange={e => setLang(e.target.value)} style={{ marginTop: 8 }}>
                <option value="en">English</option>
                <option value="twi">Twi</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      <section style={{ marginBottom: 24 }}>
        {notice && (
          <div
            style={{
              marginBottom: 18,
              padding: 14,
              borderRadius: 10,
              border: notice.type === 'success' ? '1px solid #b8e5c8' : '1px solid #f2b8b5',
              background: notice.type === 'success' ? '#e6ffed' : '#ffecec',
              color: notice.type === 'success' ? '#1a6a30' : '#8c1d18',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
            }}
          >
            {notice.text}
          </div>
        )}
        <label>
          {t('districtFilter')}:
          <select value={district} onChange={e => setDistrict(e.target.value)} style={{ marginLeft: 8 }}>
            <option>Ahafo</option>
            <option>Ashanti</option>
            <option>Bono</option>
            <option>Bono East</option>
            <option>Central</option>
            <option>Eastern</option>
            <option>Greater Accra</option>
            <option>North East</option>
            <option>Northern</option>
            <option>Oti</option>
            <option>Savanna</option>
            <option>Upper East</option>
            <option>Upper West</option>
            <option>Volta</option>
            <option>Western</option>
            <option>Western North</option>
          </select>
        </label>
        <button onClick={loadDistrict} style={{ marginLeft: 12 }}>{t('loadEquipment')}</button>
      </section>

      <section style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>{t('registerFarmer')}</h2>
          <form onSubmit={submitFarmer}>
            <label>{t('farmerName')}<br /><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
            <label>{t('phone')}<br /><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></label>
            <label>{t('district')}<br /><input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} required /></label>
            <button type="submit">{t('registerFarmer')}</button>
          </form>
        </div>

        <div style={{ padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>{t('listEquipment')}</h2>
          <form onSubmit={submitEquipment}>
            <label>{t('ownerName')}<br /><input value={equipmentForm.owner_name} onChange={e => setEquipmentForm({ ...equipmentForm, owner_name: e.target.value })} required /></label>
            <label>{t('equipmentType')}<br /><input value={equipmentForm.type} onChange={e => setEquipmentForm({ ...equipmentForm, type: e.target.value })} required /></label>
            <label>{t('district')}<br /><input value={equipmentForm.district} onChange={e => setEquipmentForm({ ...equipmentForm, district: e.target.value })} required /></label>
            <label>{t('pricePerDay')}<br /><input type="number" value={equipmentForm.price_per_day} onChange={e => setEquipmentForm({ ...equipmentForm, price_per_day: e.target.value })} required /></label>
            <label>{t('description')}<br /><textarea value={equipmentForm.description} onChange={e => setEquipmentForm({ ...equipmentForm, description: e.target.value })} /></label>
            <button type="submit">{t('addListing')}</button>
          </form>
        </div>
      </section>

      <section style={{ marginTop: 24, display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>{t('availableEquipment')}</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {equipment.length > 0 ? equipment.map(item => (
              <div key={item.id} style={{ padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
                <strong>{item.type}</strong> — {item.district}
                <div>{t('ownerName')}: {item.owner_name}</div>
                <div>GHS {Number(item.price_per_day ?? 0).toFixed(2)} / day</div>
                <div>{item.description}</div>
              </div>
            )) : <div>{t('noEquipment')}</div>}
          </div>
        </div>

        <div style={{ padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>{t('rentalPools')}</h2>
          <p style={{ marginTop: 0, color: '#555' }}>{t('poolHelp')}</p>
          <div style={{ display: 'grid', gap: 12 }}>
            {rentalPools.length > 0 ? rentalPools.map(pool => (
              <div key={pool.id} style={{ padding: 14, border: '1px solid #ddd', borderRadius: 10, background: '#fafafa' }}>
                <div><strong>Pool #{pool.id}</strong></div>
                <div>{t('district')}: {pool.district}</div>
                <div>{t('equipmentId')}: {pool.equipment_id}</div>
                <div>{t('farmerId')}: {pool.farmer_ids.join(', ')}</div>
                <div>{t('rentalDate')}: {pool.rental_date}</div>
                <div>{t('poolStatus')}: {t(pool.status)}</div>
              </div>
            )) : <div>{t('noPools')}</div>}
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24, display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div style={{ padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>{t('createPool')}</h2>
          <form onSubmit={submitPool} style={{ display: 'grid', gap: 12 }}>
            <label>{t('farmerId')}<br /><input value={poolForm.farmer_id} onChange={e => setPoolForm({ ...poolForm, farmer_id: Number(e.target.value) })} required /></label>
            <label>{t('equipmentId')}<br /><input value={poolForm.equipment_id} onChange={e => setPoolForm({ ...poolForm, equipment_id: Number(e.target.value) })} required /></label>
            <label>{t('rentalDate')}<br /><input type="date" value={poolForm.rental_date} onChange={e => setPoolForm({ ...poolForm, rental_date: e.target.value })} required /></label>
            <label>{t('district')}<br /><input value={poolForm.district} onChange={e => setPoolForm({ ...poolForm, district: e.target.value })} required /></label>
            <button type="submit">{t('createPool')}</button>
          </form>
        </div>

        <div style={{ padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>{t('createBooking')}</h2>
          <form onSubmit={submitBooking} style={{ display: 'grid', gap: 12 }}>
            <label>{t('farmerId')}<br /><input value={bookingForm.farmer_id} onChange={e => setBookingForm({ ...bookingForm, farmer_id: Number(e.target.value) })} required /></label>
            <label>{t('equipmentId')}<br /><input value={bookingForm.equipment_id} onChange={e => setBookingForm({ ...bookingForm, equipment_id: Number(e.target.value) })} required /></label>
            <label>{t('rentalDate')}<br /><input type="date" value={bookingForm.rental_date} onChange={e => setBookingForm({ ...bookingForm, rental_date: e.target.value })} required /></label>
            <label>{t('district')}<br /><input value={bookingForm.district} onChange={e => setBookingForm({ ...bookingForm, district: e.target.value })} required /></label>
            <button type="submit">{t('bookEquipment')}</button>
          </form>
        </div>

        <div style={{ padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>{t('payments')}</h2>
          <form onSubmit={submitPayment} style={{ display: 'grid', gap: 12 }}>
            <label>{t('farmerId')}<br /><input value={paymentForm.booking_id} onChange={e => setPaymentForm({ ...paymentForm, booking_id: Number(e.target.value) })} required /></label>
            <label>{t('mobileNumber')}<br /><input value={paymentForm.mobile_number} onChange={e => setPaymentForm({ ...paymentForm, mobile_number: e.target.value })} required /></label>
            <label>{t('mobileMoney')} / {t('paystack')}<br />
              <select value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                <option value="paystack">Paystack</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </label>
            <button type="submit">{t('payNow')}</button>
          </form>
          <div style={{ marginTop: 16 }}>
            {payments.length > 0 ? payments.map(payment => (
              <div key={payment.id} style={{ marginBottom: 12, padding: 12, border: '1px solid #ddd', borderRadius: 10, background: '#fafafa' }}>
                <div>{t('paymentReference')}: {payment.reference}</div>
                <div>{t('paymentStatus')}: {payment.status}</div>
                <div>GHS {Number(payment.amount ?? 0).toFixed(2)}</div>
                {payment.status === 'held' && (
                  <button type="button" onClick={() => releasePayment(payment.id)} style={{ marginTop: 8 }}>{t('complete')}</button>
                )}
              </div>
            )) : <div>{t('noPayments')}</div>}
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24, padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
        <h2>{t('ussdTitle')}</h2>
        <form onSubmit={sendUssd} style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
          <label>{t('ussdSession')}<br /><input value={ussdForm.session_id} onChange={e => setUssdForm({ ...ussdForm, session_id: e.target.value })} placeholder="optional" /></label>
          <label>{t('ussdPhone')}<br /><input value={ussdForm.phone_number} onChange={e => setUssdForm({ ...ussdForm, phone_number: e.target.value })} required /></label>
          <label>{t('ussdInput')}<br /><input value={ussdForm.input_text} onChange={e => setUssdForm({ ...ussdForm, input_text: e.target.value })} required /></label>
          <button type="submit">{t('sendUssd')}</button>
        </form>
        {ussdResponse && (
          <div style={{ marginTop: 16, padding: 12, border: '1px solid #ccc', borderRadius: 10, background: '#f5f5f5' }}>
            <div><strong>{t('ussdResponse')}:</strong></div>
            <div>{ussdResponse.message}</div>
            <div>{t('ussdSession')}: {ussdResponse.session_id}</div>
          </div>
        )}
      </section>

      <section style={{ marginTop: 24, display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>{t('createPool')}</h2>
          <form onSubmit={submitPool} style={{ display: 'grid', gap: 12 }}>
            <label>{t('farmerId')}<br /><input value={poolForm.farmer_id} onChange={e => setPoolForm({ ...poolForm, farmer_id: Number(e.target.value) })} required /></label>
            <label>{t('equipmentId')}<br /><input value={poolForm.equipment_id} onChange={e => setPoolForm({ ...poolForm, equipment_id: Number(e.target.value) })} required /></label>
            <label>{t('rentalDate')}<br /><input type="date" value={poolForm.rental_date} onChange={e => setPoolForm({ ...poolForm, rental_date: e.target.value })} required /></label>
            <label>{t('district')}<br /><input value={poolForm.district} onChange={e => setPoolForm({ ...poolForm, district: e.target.value })} required /></label>
            <button type="submit">{t('createPool')}</button>
          </form>
        </div>

        <div style={{ padding: 18, border: '1px solid #ddd', borderRadius: 10 }}>
          <h2>{t('createBooking')}</h2>
          <form onSubmit={submitBooking} style={{ display: 'grid', gap: 12 }}>
            <label>{t('farmerId')}<br /><input value={bookingForm.farmer_id} onChange={e => setBookingForm({ ...bookingForm, farmer_id: Number(e.target.value) })} required /></label>
            <label>{t('equipmentId')}<br /><input value={bookingForm.equipment_id} onChange={e => setBookingForm({ ...bookingForm, equipment_id: Number(e.target.value) })} required /></label>
            <label>{t('rentalDate')}<br /><input type="date" value={bookingForm.rental_date} onChange={e => setBookingForm({ ...bookingForm, rental_date: e.target.value })} required /></label>
            <label>{t('district')}<br /><input value={bookingForm.district} onChange={e => setBookingForm({ ...bookingForm, district: e.target.value })} required /></label>
            <button type="submit">{t('bookEquipment')}</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default App;
