import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  LogIn,
  Map as MapIcon,
  MapPin,
  Package,
  Pill,
  Search,
  ShieldCheck,
  Store,
  RefreshCw
} from 'lucide-react';
import PharmacyMap from './PharmacyMap.jsx';
import { pharmacies as cataloguePharmacies, searchCatalogue } from './catalog.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Surat');
  const [items, setItems] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [tab, setTab] = useState('search');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('Checking API…');
  const [dbMode, setDbMode] = useState('memory');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('pharmacyToken') || '');
  const [pharmacyUser, setPharmacyUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pharmacyUser') || 'null');
    } catch {
      return null;
    }
  });
  const [loginForm, setLoginForm] = useState({ username: 'greencross', password: 'demo12345' });
  const [usingCatalogue, setUsingCatalogue] = useState(false);
  const [stockOverrides, setStockOverrides] = useState({});

  function showCatalogue(searchText = query, searchCity = city, overrides = stockOverrides) {
    setUsingCatalogue(true);
    setPharmacies(cataloguePharmacies);
    setDbMode('catalog');
    setApiStatus('Store stock loaded');
    setItems(searchCatalogue(searchText, searchCity, overrides));
  }

  async function loadInitial() {
    try {
      const [health, shops] = await Promise.all([fetch(`${API}/api/health`), fetch(`${API}/api/pharmacies`)]);
      if (!health.ok || !shops.ok) throw new Error('API request failed');
      const h = await health.json();
      setPharmacies(await shops.json());
      setDbMode(h.database || 'memory');
      setUsingCatalogue(false);
      if (h.database === 'postgresql') setApiStatus('API online · cloud PostgreSQL (RDS-ready)');
      else setApiStatus('API online · in-memory demo (set POSTGRES_URL for cloud DB)');
    } catch {
      showCatalogue();
    }
  }

  async function searchInventory(searchText = query, searchCity = city, overrides = stockOverrides) {
    setLoading(true);
    setNotice('');
    if (usingCatalogue) {
      setItems(searchCatalogue(searchText, searchCity, overrides));
      setLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (searchText.trim()) params.set('q', searchText.trim());
      const cityQuery = searchCity.trim();
      if (cityQuery && cityQuery.toLowerCase() !== 'all' && cityQuery.toLowerCase() !== 'all locations') {
        params.set('city', cityQuery);
      }
      const res = await fetch(`${API}/api/inventory/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        const local = searchCatalogue(searchText, searchCity, overrides);
        if (local.length) {
          showCatalogue(searchText, searchCity, overrides);
          return;
        }
      }
      setItems(rows);
    } catch {
      showCatalogue(searchText, searchCity, overrides);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitial();
    searchInventory('', 'Surat');
  }, []);

  const availableCount = useMemo(() => items.filter(x => x.quantity > 0).length, [items]);

  async function updateQuantity(item, delta) {
    const quantity = Math.max(0, item.quantity + delta);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch(`${API}/api/inventory/${item.inventoryId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ quantity })
      });
      if (!res.ok) throw new Error('Update failed');
      setNotice(`Stock updated for ${item.medicineName} at ${item.pharmacyName}.`);
      await searchInventory();
    } catch {
      const next = { ...stockOverrides, [item.inventoryId]: quantity };
      setStockOverrides(next);
      setUsingCatalogue(true);
      setItems(searchCatalogue(query, city, next));
      setNotice(`Stock updated for ${item.medicineName} at ${item.pharmacyName}.`);
    }
  }

  async function pharmacySignIn(e) {
    e.preventDefault();
    setNotice('');
    try {
      const res = await fetch(`${API}/api/pharmacy/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign-in failed');
      setAuthToken(data.token);
      setPharmacyUser(data.pharmacy);
      localStorage.setItem('pharmacyToken', data.token);
      localStorage.setItem('pharmacyUser', JSON.stringify(data.pharmacy));
      setNotice(`Signed in as ${data.pharmacy.name}. You can update your pharmacy stock.`);
    } catch (err) {
      setNotice(err.message || 'Sign-in failed');
    }
  }

  function pharmacySignOut() {
    setAuthToken('');
    setPharmacyUser(null);
    localStorage.removeItem('pharmacyToken');
    localStorage.removeItem('pharmacyUser');
    setNotice('Signed out.');
  }

  const staffItems = useMemo(() => {
    if (!pharmacyUser) return items;
    return items.filter(x => x.pharmacyId === pharmacyUser.id);
  }, [items, pharmacyUser]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Pill size={22} />
          </span>
          <span>
            medifind<span className="brand-dot">.</span>
            <small>MEDICINE AVAILABILITY FINDER</small>
          </span>
        </div>
        <div className="api-state">
          <span className={apiStatus.startsWith('API online') ? 'status-dot' : 'status-dot offline'}></span>
          {apiStatus}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span></span> Cloud-based medicine search
            </div>
            <h1>
              Find your medicine.
              <br />
              <em>Skip the pharmacy hunt.</em>
            </h1>
            <p>
              Search pharmacy inventory stored in a cloud database. Demo data only — always confirm stock with the
              pharmacy before visiting.
            </p>
            <div className="hero-points">
              <span>
                <CheckCircle2 size={16} /> Medicine search
              </span>
              <span>
                <MapPin size={16} /> Map &amp; inventory (VitaMap-inspired)
              </span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-circle circle-one"></div>
            <div className="art-circle circle-two"></div>
            <div className="medicine-box">
              <div className="box-cross">+</div>
              <b>
                MEDI<span>CARE</span>
              </b>
              <small>Everyday wellness</small>
              <div className="box-stripe"></div>
            </div>
            <div className="floating-pill">
              <Pill size={32} />
            </div>
            <div className="floating-check">
              <CheckCircle2 size={20} />
              <span>Stock finder</span>
            </div>
          </div>
        </section>

        <section className="search-panel">
          <div className="search-heading">
            <div>
              <span className="section-kicker">SEARCH INVENTORY</span>
              <h2>What are you looking for?</h2>
            </div>
            <span className="demo-tag">{dbMode === 'postgresql' ? 'CLOUD DB' : 'IN STOCK'}</span>
          </div>
          <form
            className="search-form"
            onSubmit={e => {
              e.preventDefault();
              searchInventory();
            }}
          >
            <label className="field medicine-field">
              <span>Medicine name or strength</span>
              <div>
                <Search size={19} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Try Paracetamol, Cetirizine…"
                />
              </div>
            </label>
            <label className="field">
              <span>City</span>
              <div>
                <MapPin size={19} />
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city" />
              </div>
            </label>
            <button className="search-button" type="submit">
              <Search size={18} /> Find medicine
            </button>
          </form>
          <div className="quick-search">
            <span>Popular searches</span>
            {['Paracetamol', 'Cetirizine', 'ORS', 'Ibuprofen'].map(s => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  searchInventory(s, city);
                }}
              >
                {s}
              </button>
            ))}
            <span>Locations</span>
            {['Surat', 'Ahmedabad', 'Mumbai', 'Delhi', 'All locations'].map(place => (
              <button
                key={place}
                onClick={() => {
                  const nextCity = place === 'All locations' ? '' : place;
                  setCity(nextCity);
                  searchInventory(query, nextCity);
                }}
              >
                {place}
              </button>
            ))}
          </div>
        </section>

        <div className="tabs">
          <button className={tab === 'search' ? 'active' : ''} onClick={() => setTab('search')}>
            <Search size={17} /> Search results
          </button>
          <button className={tab === 'map' ? 'active' : ''} onClick={() => setTab('map')}>
            <MapIcon size={17} /> Pharmacy map
          </button>
          <button className={tab === 'inventory' ? 'active' : ''} onClick={() => setTab('inventory')}>
            <Package size={17} /> Pharmacy inventory
          </button>
        </div>

        {notice && <div className="notice">{notice}</div>}

        {tab === 'search' ? (
          <section className="results-section">
            <div className="results-title">
              <div>
                <h2>Nearby availability</h2>
                <p>{city || 'All locations'} · store name shown on each card</p>
              </div>
              <button className="refresh" onClick={() => searchInventory()}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-icon teal">
                  <Store size={18} />
                </span>
                <div>
                  <strong>{new Set(items.map(x => x.pharmacyId)).size}</strong>
                  <small>Pharmacies found</small>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon green">
                  <CheckCircle2 size={18} />
                </span>
                <div>
                  <strong>{availableCount}</strong>
                  <small>Listings in stock</small>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon amber">
                  <Clock3 size={18} />
                </span>
                <div>
                  <strong>{dbMode === 'postgresql' ? 'Live' : 'Demo'}</strong>
                  <small>Database mode</small>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="empty">Searching inventory…</div>
            ) : items.length ? (
              <div className="results-grid">
                {items.map(item => (
                  <article className="pharmacy-card" key={item.inventoryId}>
                    <div className="card-top">
                      <div className="pharmacy-icon">
                        <Store size={21} />
                      </div>
                      <span className={item.quantity > 0 ? 'availability available' : 'availability unavailable'}>
                        {item.quantity > 0 ? 'Reported in stock' : 'Out of stock'}
                      </span>
                    </div>
                    <h3>{item.pharmacyName}</h3>
                    <p className="address">
                      <MapPin size={15} />
                      {item.address}, {item.city}
                    </p>
                    <div className="medicine-line">
                      <div>
                        <b>{item.medicineName}</b>
                        <small>
                          {item.strength} · {item.form}
                        </small>
                      </div>
                      <div className="quantity">
                        <strong>{item.quantity}</strong>
                        <small>units</small>
                      </div>
                    </div>
                    <div className="card-footer">
                      <span>
                        <Clock3 size={14} /> Updated {new Date(item.lastUpdated).toLocaleString()}
                      </span>
                      <span className="demo-label">{dbMode === 'postgresql' ? 'RDS' : 'SAMPLE'}</span>
                    </div>
                    <p className="confirm-note">Call pharmacy to confirm current stock before visiting.</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">
                <Search size={28} />
                <b>No matching records</b>
                <span>Try another medicine or city.</span>
              </div>
            )}
          </section>
        ) : tab === 'map' ? (
          <section className="results-section">
            <div className="results-title">
              <div>
                <h2>Pharmacy map</h2>
                <p>Interactive map (Leaflet), similar to VitaMap</p>
              </div>
            </div>
            <PharmacyMap pharmacies={pharmacies} highlightCity={city} />
          </section>
        ) : (
          <section className="results-section">
            <div className="results-title">
              <div>
                <h2>Inventory management</h2>
                <p>Pharmacy staff sign-in and stock updates</p>
              </div>
              <span className="demo-tag">STAFF</span>
            </div>

            <div className="auth-panel">
              {pharmacyUser ? (
                <div className="auth-row">
                  <span>
                    Signed in as <b>{pharmacyUser.name}</b> ({pharmacyUser.username})
                  </span>
                  <button type="button" className="refresh" onClick={pharmacySignOut}>
                    Sign out
                  </button>
                </div>
              ) : (
                <form className="auth-form" onSubmit={pharmacySignIn}>
                  <label className="field">
                    <span>Pharmacy username</span>
                    <div>
                      <LogIn size={17} />
                      <input
                        value={loginForm.username}
                        onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                        placeholder="greencross (demo)"
                      />
                    </div>
                  </label>
                  <label className="field">
                    <span>Password</span>
                    <div>
                      <ShieldCheck size={17} />
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="demo12345 when using PostgreSQL"
                      />
                    </div>
                  </label>
                  <button className="search-button" type="submit">
                    <LogIn size={16} /> Pharmacy sign in
                  </button>
                </form>
              )}
              {dbMode !== 'postgresql' && (
                <p className="auth-hint">
                  Pharmacy accounts work when <code>POSTGRES_URL</code> is configured (e.g. Amazon RDS). In-memory mode
                  allows demo stock edits without sign-in.
                </p>
              )}
            </div>

            <div className="inventory-list">
              {(pharmacyUser ? staffItems : items).map(item => (
                <div className="inventory-row" key={item.inventoryId}>
                  <div className="inventory-medicine">
                    <span className="inventory-pill">
                      <Pill size={19} />
                    </span>
                    <div>
                      <b>
                        {item.medicineName} · {item.strength}
                      </b>
                      <small>{item.pharmacyName}</small>
                    </div>
                  </div>
                  <div className="stock-control">
                    <button onClick={() => updateQuantity(item, -1)} aria-label="Decrease quantity">
                      −
                    </button>
                    <strong>{item.quantity}</strong>
                    <button onClick={() => updateQuantity(item, 1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                </div>
              ))}
              {!items.length && <div className="empty">Search for a medicine first to load inventory records.</div>}
            </div>
            <p className="security-note">
              <ShieldCheck size={16} /> Inspired by{' '}
              <a href="https://github.com/akasr/vitamap" target="_blank" rel="noreferrer">
                VitaMap
              </a>
              . Production deployments must use HTTPS, IAM least privilege, and authenticated inventory APIs.
            </p>
          </section>
        )}

        <section className="trust-strip">
          <div>
            <ShieldCheck size={21} />
            <span>
              <b>Privacy-conscious design</b>
              <small>No patient records are collected in this demo.</small>
            </span>
          </div>
          <div>
            <Activity size={21} />
            <span>
              <b>API → cloud database</b>
              <small>Backend queries PostgreSQL on Amazon RDS when configured.</small>
            </span>
          </div>
          <div>
            <ArrowUpRight size={21} />
            <span>
              <b>AWS-ready</b>
              <small>EC2, RDS, S3, IAM, and CloudWatch — see docs/AWS_DEPLOYMENT.md</small>
            </span>
          </div>
        </section>
        <footer>
          <div className="brand small-brand">
            <span className="brand-mark">
              <Pill size={18} />
            </span>
            <span>
              medifind<span className="brand-dot">.</span>
            </span>
          </div>
          <span>Academic prototype · Medicine Availability Finder · Not medical advice</span>
        </footer>
      </main>
    </div>
  );
}
export default App;
