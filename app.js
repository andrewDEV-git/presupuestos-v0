const products = [
  { brand: 'Schneider', name: 'Interruptor automático Acti9 iK60N', meta: '1P+N · 16A · Curva C', price: 8.95, distance: 1.4, store: 'OBRAMAT', storeStatus: 'Abierto hasta las 21:00', art: 'A9' },
  { brand: 'Legrand', name: 'Caja de mecanismos universal', meta: 'Empotrar · 1 elemento', price: 1.85, distance: 2.1, store: 'Leroy Merlin', storeStatus: 'Abierto hasta las 22:00', art: 'L' },
  { brand: 'Simon', name: 'Base de enchufe Simon 27', meta: 'Blanco · 16A · 2P+T', price: 4.20, distance: 0.8, store: 'Electro Stocks', storeStatus: 'Abierto hasta las 19:30', art: 'S' },
  { brand: 'ABB', name: 'Diferencial bipolar FH202', meta: '40A · 30mA · Tipo AC', price: 38.60, distance: 3.6, store: 'Saltoki', storeStatus: 'Abre mañana a las 07:30', art: 'ABB' },
  { brand: 'Philips', name: 'Downlight LED empotrable', meta: '12W · 1.050 lm · 4000K', price: 13.90, distance: 1.9, store: 'Leroy Merlin', storeStatus: 'Abierto hasta las 22:00', art: 'LED' },
  { brand: 'Schneider', name: 'Cable flexible H07V-K', meta: '1 x 2,5 mm² · Azul · 100 m', price: 42.50, distance: 4.2, store: 'Sonepar', storeStatus: 'Abierto hasta las 18:00', art: '2.5' },
  { brand: 'Legrand', name: 'Cuadro de distribución Practibox', meta: 'Empotrar · 24 módulos · IP40', price: 32.75, distance: 2.1, store: 'Leroy Merlin', storeStatus: 'Abierto hasta las 22:00', art: '24' },
  { brand: 'Schneider', name: 'Protector contra sobretensiones', meta: '1P+N · 20kA · Acti9', price: 46.90, distance: 1.4, store: 'OBRAMAT', storeStatus: 'Abierto hasta las 21:00', art: 'SPD' },
  { brand: 'Simon', name: 'Interruptor unipolar Simon 27', meta: '10AX · Blanco · Empotrar', price: 3.65, distance: 0.8, store: 'Electro Stocks', storeStatus: 'Abierto hasta las 19:30', art: 'I' },
  { brand: 'General', name: 'Tubo corrugado libre de halógenos', meta: '25 mm · 100 m · Gris', price: 28.40, distance: 2.7, store: 'BAUHAUS', storeStatus: 'Abierto hasta las 21:00', art: '25' },
  { brand: 'General', name: 'Caja de registro estanca', meta: '100 x 100 x 55 mm · IP55', price: 2.95, distance: 3.6, store: 'Saltoki', storeStatus: 'Abre mañana a las 07:30', art: 'IP' },
  { brand: 'Philips', name: 'Bombilla LED E27', meta: '10,5W · 1055 lm · 3000K', price: 3.49, distance: 1.9, store: 'Leroy Merlin', storeStatus: 'Abierto hasta las 22:00', art: 'E27' },
  { brand: 'General', name: 'Bridas nylon profesionales', meta: '4,8 x 300 mm · Bolsa 100 uds.', price: 6.80, distance: 1.4, store: 'OBRAMAT', storeStatus: 'Abierto hasta las 21:00', art: 'ZIP' },
];

products.push(...(window.catalogExtras || []));
products.forEach((product) => { product.category = product.category || 'Selección destacada'; });

const productGrid = document.querySelector('#product-grid');
const searchInput = document.querySelector('#search-input');
const resultCount = document.querySelector('#result-count');
const brandButtons = [...document.querySelectorAll('.brand-chip')];
const sortSelect = document.querySelector('#sort-select');
let activeBrand = 'all';
let activeCategory = 'all';
let budget = [];

const categoryFilter = document.querySelector('#category-filter');
const categoryNames = ['Todas', 'Selección destacada', ...(window.catalogCategories || []).map((category) => category.name)];
categoryFilter.innerHTML = categoryNames.map((category, index) => `<button type="button" class="${index === 0 ? 'active' : ''}" data-category="${index === 0 ? 'all' : category}">${category}</button>`).join('');

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = products.filter((product) => {
    const matchesBrand = activeBrand === 'all' || product.brand === activeBrand;
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = [product.brand, product.name, product.meta].join(' ').toLowerCase().includes(query);
    return matchesBrand && matchesCategory && matchesSearch;
  });

  if (sortSelect.value === 'distance') visible = [...visible].sort((a, b) => a.distance - b.distance);
  if (sortSelect.value === 'price') visible = [...visible].sort((a, b) => a.price - b.price);
  resultCount.textContent = `${visible.length} ${visible.length === 1 ? 'producto' : 'productos'}`;
  productGrid.innerHTML = visible.length ? visible.map((product) => `
    <article class="product-card">
      <div class="product-image"><img src="${productImageUrl(product)}" alt="Imagen orientativa de ${product.name}" loading="lazy" onerror="this.hidden=true" /><span class="fallback-art">${product.art}</span></div>
      <div class="product-content"><div class="product-brand">${product.brand}</div><div class="product-name">${product.name}</div><div class="product-meta">${product.meta}</div>
        <div class="store-line"><span class="open-dot"></span><div><strong>${product.store}</strong><small>${product.distance.toFixed(1).replace('.', ',')} km · ${product.storeStatus}</small></div><a class="product-link" href="${productUrl(product)}" target="_blank" rel="noopener noreferrer">Ver referencia ↗</a></div>
        <div class="product-bottom"><div class="product-price">${product.price.toFixed(2).replace('.', ',')} EUR <small>/ ud.</small></div><button class="add-product" data-product="${product.name}" aria-label="Añadir ${product.name} al presupuesto" type="button">+</button></div>
      </div>
    </article>`).join('') : '<p class="empty-results">No hemos encontrado materiales con esa búsqueda.</p>';
  document.querySelectorAll('.add-product').forEach((button) => button.addEventListener('click', () => addToBudget(button.dataset.product)));
}

function productImageUrl(product) {
  const categoryTerms = {
    'Herramientas manuales': 'electrician,hand-tools',
    'Instrumentos de medición': 'multimeter,electrical-testing',
    'Cable eléctrico': 'electrical,cable,wires',
    'Tubos y canalizaciones': 'cable,conduit,construction',
    'Mecanismos eléctricos': 'electrical,switch,outlet',
    'Cuadros y protecciones': 'electrical,panel,circuit-breaker',
    'Iluminación': 'led,lighting,electrician',
    'Herramientas eléctricas': 'power-tools,drill',
    'EPIs y seguridad': 'safety,work,electrician',
    'Domótica': 'smart-home,technology',
    'Fotovoltaica': 'solar-panels,energy',
    'Vehículo eléctrico': 'electric-car,charging',
    'Telecomunicaciones y redes': 'network,cables,technology',
    'Automatización eléctrica': 'industrial,control,electrical',
    'Fijación y organización': 'cable-management,tools',
    'Consumibles': 'workshop,tools,materials'
  };
  const terms = categoryTerms[product.category] || 'electrician,electrical,tools';
  const lock = Math.abs([...product.name].reduce((total, character) => total + character.charCodeAt(0), 0));
  return `https://loremflickr.com/480/320/${terms}?lock=${lock}`;
}

function productUrl(product) {
  const query = encodeURIComponent(product.name);
  const storeUrls = {
    'Leroy Merlin': `https://www.leroymerlin.es/buscador?q=${query}`,
    OBRAMAT: `https://www.obramat.es/buscar?text=${query}`,
    BAUHAUS: `https://www.bauhaus.es/buscar?text=${query}`,
    Rexel: `https://www.rexel.es/search?text=${query}`,
    Saltoki: `https://www.saltoki.com/buscador?query=${query}`
  };
  return storeUrls[product.store] || `https://www.google.com/search?q=${encodeURIComponent(`${product.name} ${product.store}`)}`;
}

function addToBudget(name) {
  const product = products.find((item) => item.name === name);
  budget.push(product);
  document.querySelector('#budget-count').textContent = budget.length;
  renderBudgetItems();
  updateTotal();
  syncBudgetToGithub();
  const toast = document.querySelector('#toast');
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}

function renderBudgetItems() {
  document.querySelector('#budget-items').innerHTML = budget.map((item) => `<div class="budget-item"><strong>${item.name}</strong><b>${item.price.toFixed(2).replace('.', ',')} EUR</b><span>${item.brand || 'Añadido por ti'} · ${item.store || 'Tienda no indicada'}${item.meta ? ` · ${item.meta}` : ''}</span>${item.store ? `<a href="${productUrl(item)}" target="_blank" rel="noopener noreferrer">Ver producto ↗</a>` : ''}</div>`).join('');
}

function addManualProduct() {
  const nameInput = document.querySelector('#manual-product-name');
  const storeInput = document.querySelector('#manual-product-store');
  const priceInput = document.querySelector('#manual-product-price');
  const name = nameInput.value.trim();
  const store = storeInput.value.trim();
  const price = Number(priceInput.value);
  if (!name || !store || !Number.isFinite(price) || price < 0) {
    nameInput.focus();
    return;
  }
  budget.push({ name, store, price, brand: 'Producto manual', meta: 'Precio añadido por ti' });
  document.querySelector('#budget-count').textContent = budget.length;
  renderBudgetItems();
  updateTotal();
  syncBudgetToGithub();
  nameInput.value = '';
  storeInput.value = '';
  priceInput.value = '';
  const toast = document.querySelector('#toast');
  toast.textContent = 'Producto añadido al presupuesto';
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}

brandButtons.forEach((button) => button.addEventListener('click', () => {
  activeBrand = button.dataset.brand;
  brandButtons.forEach((item) => item.classList.toggle('active', item === button));
  renderProducts();
}));
categoryFilter.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
  activeCategory = button.dataset.category;
  categoryFilter.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
  renderProducts();
}));
searchInput.addEventListener('input', renderProducts);
document.querySelector('#search-form').addEventListener('submit', (event) => { event.preventDefault(); document.querySelector('#catalog').scrollIntoView({ behavior: 'smooth' }); });
sortSelect.addEventListener('change', renderProducts);

function updateTotal() {
  const materials = budget.reduce((total, item) => total + item.price, 0);
  const extras = ['labor-cost', 'transport-cost', 'other-cost'].reduce((total, id) => total + (Number(document.querySelector(`#${id}`).value) || 0), 0);
  document.querySelector('#budget-total').textContent = `${(materials + extras).toFixed(2).replace('.', ',')} EUR`;
}

async function syncBudgetToGithub() {
  const email = JSON.parse(localStorage.getItem('voltio_account') || 'null')?.email;
  if (!email) return;
  try {
    const response = await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, budget, extras: { labor: document.querySelector('#labor-cost').value, transport: document.querySelector('#transport-cost').value, other: document.querySelector('#other-cost').value } }) });
    if (response.ok) document.querySelector('.account-sync').innerHTML = '<span>●</span> Presupuesto sincronizado en GitHub';
  } catch {
    // El modo local continúa funcionando si todavía no se ha iniciado el servidor.
  }
}

['labor-cost', 'transport-cost', 'other-cost'].forEach((id) => document.querySelector(`#${id}`).addEventListener('input', () => { updateTotal(); syncBudgetToGithub(); }));

function changeLocation() {
  const location = window.prompt('¿Cuál es el código postal o ciudad de tu obra?', '28001 Madrid');
  if (location) {
    document.querySelectorAll('.location strong').forEach((element) => { element.textContent = location; });
    document.querySelector('.location-bar strong').textContent = `Tiendas alrededor de ${location}`;
  }
}

document.querySelector('#location-button').addEventListener('click', changeLocation);
document.querySelector('#change-location').addEventListener('click', changeLocation);
document.querySelector('#add-manual-product').addEventListener('click', addManualProduct);

const accountModal = document.querySelector('#account-modal');
const accountForm = document.querySelector('#account-form');
let accountMode = 'register';

function hashPassword(password) {
  if (window.crypto?.subtle) {
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)).then((buffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join(''));
  }
  return Promise.resolve(window.btoa(password));
}

function updateAccountLabel() {
  const account = JSON.parse(localStorage.getItem('voltio_account') || 'null');
  const session = localStorage.getItem('voltio_session');
  document.querySelector('#account-greeting').textContent = session && account ? `Hola, ${account.name.split(' ')[0]}` : 'Hola, profesional';
  document.querySelector('#account-label').textContent = session && account ? 'Mi perfil' : 'Mi cuenta';
}

function openAccount() {
  const loggedIn = localStorage.getItem('voltio_session');
  accountMode = loggedIn ? 'profile' : 'register';
  accountForm.style.display = loggedIn ? 'none' : 'block';
  if (accountMode === 'profile') {
    const account = JSON.parse(localStorage.getItem('voltio_account') || '{}');
    document.querySelector('#account-title').textContent = `Hola, ${account.name || 'profesional'}`;
    document.querySelector('#account-copy').textContent = `${account.email || ''} · Tus presupuestos están listos para continuar.`;
    document.querySelector('#account-form').style.display = 'none';
    document.querySelector('#account-switch').textContent = 'Cerrar sesión';
  } else {
    document.querySelector('#account-title').textContent = 'Crea tu cuenta profesional';
    document.querySelector('#account-copy').textContent = 'Guarda tus presupuestos y vuelve a ellos desde cualquier dispositivo.';
    document.querySelector('#account-form').style.display = 'block';
    document.querySelector('#account-switch').textContent = 'Ya tengo una cuenta · Iniciar sesión';
    document.querySelector('#account-name-field').style.display = 'block';
    document.querySelector('#account-submit').innerHTML = 'Crear cuenta <span>→</span>';
  }
  accountModal.classList.add('open');
  accountModal.setAttribute('aria-hidden', 'false');
}

document.querySelector('#open-account').addEventListener('click', openAccount);
document.querySelector('#close-account').addEventListener('click', () => { accountModal.classList.remove('open'); accountModal.setAttribute('aria-hidden', 'true'); });
accountModal.addEventListener('click', (event) => { if (event.target === accountModal) document.querySelector('#close-account').click(); });
document.querySelector('#account-switch').addEventListener('click', () => {
  if (accountMode === 'profile') {
    localStorage.removeItem('voltio_session');
    accountModal.classList.remove('open');
    updateAccountLabel();
    return;
  }
  accountMode = accountMode === 'register' ? 'login' : 'register';
  document.querySelector('#account-title').textContent = accountMode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta profesional';
  document.querySelector('#account-copy').textContent = accountMode === 'login' ? 'Continúa con tus presupuestos guardados.' : 'Guarda tus presupuestos y vuelve a ellos desde cualquier dispositivo.';
  document.querySelector('#account-name-field').style.display = accountMode === 'login' ? 'none' : 'block';
  document.querySelector('#account-submit').innerHTML = accountMode === 'login' ? 'Iniciar sesión <span>→</span>' : 'Crear cuenta <span>→</span>';
  document.querySelector('#account-switch').textContent = accountMode === 'login' ? 'Crear una cuenta nueva' : 'Ya tengo una cuenta · Iniciar sesión';
});
accountForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.querySelector('#account-email').value.trim().toLowerCase();
  const passwordHash = await hashPassword(document.querySelector('#account-password').value);
  const savedAccount = JSON.parse(localStorage.getItem('voltio_account') || 'null');
  if (accountMode === 'register') {
    const name = document.querySelector('#account-name').value.trim();
    if (!name) return;
    localStorage.setItem('voltio_account', JSON.stringify({ name, email, passwordHash }));
    localStorage.setItem('voltio_session', email);
  } else if (savedAccount?.email === email && savedAccount.passwordHash === passwordHash) {
    localStorage.setItem('voltio_session', email);
  } else {
    document.querySelector('#account-copy').textContent = 'El correo o la contraseña no coinciden.';
    return;
  }
  accountModal.classList.remove('open');
  accountForm.reset();
  updateAccountLabel();
});

const drawer = document.querySelector('#budget-drawer');
const backdrop = document.querySelector('#drawer-backdrop');
function toggleDrawer(open) { drawer.classList.toggle('open', open); backdrop.classList.toggle('open', open); drawer.setAttribute('aria-hidden', String(!open)); }
document.querySelector('#open-budget').addEventListener('click', () => toggleDrawer(true));
document.querySelector('#close-budget').addEventListener('click', () => toggleDrawer(false));
backdrop.addEventListener('click', () => toggleDrawer(false));
updateAccountLabel();
renderProducts();