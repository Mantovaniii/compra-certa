'use strict';

// Catálogo de demonstração. Preços são inteiros em centavos e massas em kg ou L.
const products = {
  arroz:  { name: 'Arroz Branco Tipo 1', short: 'Arroz', pack: '1 kg', size: 1, unit: 'kg' },
  feijao: { name: 'Feijão Carioca Tipo 1', short: 'Feijão', pack: '1 kg', size: 1, unit: 'kg' },
  leite:  { name: 'Leite Integral UHT', short: 'Leite', pack: '1 L', size: 1, unit: 'L' },
  tomate: { name: 'Tomate Italiano', short: 'Tomate', pack: '1 kg', size: 1, unit: 'kg' },
  cafe:   { name: 'Café Torrado e Moído Tradicional', short: 'Café', pack: '500 g', size: .5, unit: 'kg' },
  oleo:   { name: 'Óleo de Soja Refinado', short: 'Óleo', pack: '900 ml', size: .9, unit: 'L' },
  pao:    { name: 'Pão de Forma Tradicional', short: 'Pão', pack: '500 g', size: .5, unit: 'kg' },
  maca:   { name: 'Maçã Nacional Gala', short: 'Maçã', pack: '1 kg', size: 1, unit: 'kg' },
  batata: { name: 'Batata Lavada', short: 'Batata', pack: '1 kg', size: 1, unit: 'kg' }
};

const stores = {
  bairro: { name: 'Mercado Bairro', address: 'Rua Miguel Petroni, 1200 - Santa Felícia', km: 1.2, min: 8, open: true },
  economia: { name: 'Hipermercado Economia', address: 'Avenida São Carlos, 2800 - Centro', km: 3.4, min: 18, open: true },
  hortifruti: { name: 'Hortifrúti e Mercearia São Carlos', address: 'Rua XV de Novembro, 850 - Centro', km: 2.1, min: 12, open: true }
};

const productDetails = {
  arroz: ['Grãos e cereais', 'Arroz branco polido de grão longo, indicado para o preparo diário e acompanhamentos.'],
  feijao: ['Leguminosas', 'Feijão carioca seco, de grão claro rajado, para caldos, saladas e refeições do dia a dia.'],
  leite: ['Laticínios', 'Leite integral tratado por processo UHT. Depois de aberto, mantenha sob refrigeração conforme o rótulo.'],
  tomate: ['Hortifruti', 'Tomate de formato alongado e polpa firme, adequado para saladas e molhos.'],
  cafe: ['Bebidas', 'Café tradicional torrado e moído para preparo em coador. Conserve em recipiente fechado após abrir.'],
  oleo: ['Óleos de cozinha', 'Óleo vegetal refinado de soja para refogados, massas e outros preparos culinários.'],
  pao: ['Padaria', 'Pão de forma fatiado, indicado para sanduíches e torradas. Consulte os ingredientes da oferta para restrições alimentares.'],
  maca: ['Hortifruti', 'Maçã Gala nacional, de sabor doce e textura crocante, para consumo fresco ou receitas.'],
  batata: ['Hortifruti', 'Batata lavada para assar, cozinhar ou preparar purês. Conserve em local fresco e protegido da luz.']
};

const storeDetails = {
  bairro: ['Seg. a sáb., 8h–20h · Dom., 8h–13h', 'Recebe embalagens secas de papel e plástico no ponto de coleta da entrada.', 'Dinheiro, Pix, débito e crédito'],
  economia: ['Seg. a sáb., 8h–22h · Dom., 9h–18h', 'Recebe óleo de cozinha usado em garrafa fechada no balcão de atendimento.', 'Dinheiro, Pix, débito, crédito e vale-alimentação'],
  hortifruti: ['Seg. a sáb., 7h–19h · Dom., 8h–12h', 'Separa resíduos orgânicos para compostagem e recebe de volta caixas reutilizáveis.', 'Dinheiro, Pix e débito']
};

const originProfiles = {
  'centro': {},
  'santa felicia': { bairro: [0.6, 4], economia: [4.5, 23], hortifruti: [3.2, 17] },
  'vila prado': { bairro: [4.8, 24], economia: [2.4, 13], hortifruti: [1.8, 10] },
  ufscar: { bairro: [5.2, 16], economia: [3.6, 12], hortifruti: [4.1, 14] }
};
const destinationAliases = { casa: 'santa felicia', trabalho: 'vila prado' };
const interstore = {
  'bairro/economia': [3.2, 17],
  'bairro/hortifruti': [2.4, 13],
  'economia/hortifruti': [1.5, 8]
};

const sustainability = {
  organic: ['Orgânico certificado', 'Produção orgânica com laudo no catálogo simulado.'],
  vegan: ['Vegano', 'Produzido sem insumos de origem animal, conforme ficha do fornecedor.'],
  local: ['Produtor local', 'Origem na agricultura familiar de São Carlos ou da região.'],
  recyclable: ['Embalagem reciclável / Biodegradável', 'Embalagem com material reciclável ou biodegradável identificado pelo fornecedor.'],
  pesticideFree: ['Sem agrotóxicos', 'Cultivo sem uso de agrotóxicos declarado pelo fornecedor.']
};
const attributes = Object.fromEntries(Object.entries(sustainability).map(([key, [label]]) => [key, label]));
const defaults = { radius: 5, open: true, onlyFav: false, near: true,
  organic: false, vegan: false, local: false, recyclable: false, pesticideFree: false };
const filterLabels = {
  open: 'Apenas lojas abertas', onlyFav: 'Apenas lojas favoritas', near: 'Incluir ofertas com validade próxima',
  ...attributes
};
const priorities = {
  cost: 'Menor custo total (produtos + combustível)',
  distance: 'Mais próximo (menor distância)',
  origin: 'Maior comprovação de origem sustentável'
};
const storageKey = 'compra-certa-pacote-3';

function migrateStorage(store, suffix = '') {
  const oldKey = 'cesta-clara-pacote-3' + suffix;
  const newKey = storageKey + suffix;
  try {
    const storage = globalThis[store];
    const saved = storage.getItem(oldKey);
    if (saved === null) return;
    if (storage.getItem(newKey) === null) storage.setItem(newKey, saved);
    storage.removeItem(oldKey);
  } catch {
    // O navegador pode bloquear o armazenamento.
  }
}

function readLocal(store, key) {
  try {
    return JSON.parse(globalThis[store].getItem(key));
  } catch {
    return null;
  }
}

function writeLocal(store, key, value) {
  try {
    if (value === null) globalThis[store].removeItem(key);
    else globalThis[store].setItem(key, JSON.stringify(value));
  } catch {
    // A sessão em memória também funciona quando file:// ou o navegador bloqueia armazenamento.
  }
}

migrateStorage('sessionStorage');
for (const suffix of ['-dark', '-favorites', '-reading']) {
  migrateStorage('localStorage', suffix);
}

const previous = readLocal('sessionStorage', storageKey);
const state = {
  list: previous?.list ?? { arroz: 1, leite: 1, tomate: 1 },
  origin: previous?.origin ?? 'Centro, São Carlos',
  sameDestination: previous?.sameDestination ?? true,
  destination: previous?.destination ?? '',
  dark: readLocal('localStorage', storageKey + '-dark') === true,
  shoppingDate: previous?.shoppingDate ?? '',
  filters: { ...defaults, ...previous?.filters },
  favorites: new Set(readLocal('localStorage', storageKey + '-favorites') ?? []),
  reading: readLocal('localStorage', storageKey + '-reading') === true,
  priority: previous?.priority ?? 'cost',
  mode: previous?.mode ?? 'car',
  consumption: previous ? previous.consumption : 10,
  fuel: previous ? previous.fuel : 6,
  selected: previous?.selected ?? null,
  saved: previous?.saved ?? null,
  reports: previous?.reports ?? [],
  demoTime: previous?.demoTime ?? Date.now()
};

function persist() {
  const { favorites, reading, dark, ...session } = state;
  writeLocal('sessionStorage', storageKey, session);
}

const dayMs = 86400000;
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const shoppingDateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' });
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const money = value => value === null ? 'Não estimado' : currencyFormatter.format(value / 100);
const km = value => numberFormatter.format(value) + ' km';
const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const shops = Object.keys(stores);

function localDay(time) {
  const date = new Date(time);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / dayMs;
}

function relativeDate(days) {
  const date = new Date(state.demoTime);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

// Colunas na ordem Mercado Bairro, Hipermercado Economia e Hortifrúti e Mercearia São Carlos.
const prices = {
  arroz: [749, 649, 829], feijao: [799, 699, 849], leite: [559, 439, 599],
  tomate: [799, 899, 549], cafe: [2690, 2390, 2840], oleo: [749, 649, null],
  pao: [899, 1099, 799], maca: [999, 1099, 699], batata: [699, 799, 499]
};
const lotDays = {
  arroz: [210, 170, 140], feijao: [130, 115, 180], leite: [60, 2, 45],
  tomate: [6, 8, 1], cafe: [120, 200, 150], oleo: [250, 220, null],
  pao: [2, 7, 5], maca: [10, 9, null], batata: [8, 11, 7]
};

function makeOffer(store, product, index, price) {
  const evidence = {};
  const updated = state.demoTime - (product === 'batata' && store === 'hortifruti' ? 29 : 2 + index) * 3600000;
  const expires = lotDays[product][index];
  if (!['leite', 'pao'].includes(product) || (product === 'pao' && store === 'hortifruti')) {
    evidence.vegan = { kind: 'Declarado pelo fornecedor', source: 'Ficha de ingredientes da loja', date: relativeDate(-3) };
  }
  if ((store === 'hortifruti' && ['tomate', 'maca', 'batata'].includes(product)) ||
      (store === 'bairro' && product === 'tomate') || (store === 'economia' && product === 'cafe')) {
    evidence.organic = { kind: 'Documento informado', source: 'Laudo simulado ORG-' + product.toUpperCase(), date: relativeDate(-9), documented: true };
  }
  if ((store === 'hortifruti' && ['tomate', 'maca', 'batata', 'pao'].includes(product)) ||
      (store === 'bairro' && ['tomate', 'batata'].includes(product))) {
    evidence.local = { kind: 'Documento informado', source: 'Nota de origem simulada · São Carlos, SP', date: relativeDate(-6), documented: true };
  }
  if (['leite', 'oleo', 'cafe'].includes(product) || (store === 'hortifruti' && product === 'maca')) {
    evidence.recyclable = { kind: 'Declarado pelo fornecedor', source: 'Ficha simulada da embalagem', date: relativeDate(-4) };
  }
  if ((store === 'hortifruti' && ['tomate', 'batata'].includes(product)) || (store === 'bairro' && product === 'batata')) {
    evidence.pesticideFree = { kind: 'Declarado pelo produtor', source: 'Ficha simulada de cultivo', date: relativeDate(-5) };
  }
  return {
    store, product, price, evidence, updated, expires: expires === null ? null : relativeDate(expires),
    regular: expires !== null && expires <= 3 ? price + 150 : null,
    source: 'Encarte simulado de ' + stores[store].name
  };
}

const offers = Object.entries(prices).flatMap(([product, values]) =>
  values.flatMap((price, index) => price === null ? [] : [makeOffer(shops[index], product, index, price)])
);
function todayInputValue() {
  const today = new Date();
  return [today.getFullYear(), today.getMonth() + 1, today.getDate()]
    .map(value => String(value).padStart(2, '0')).join('-');
}

function shoppingDay() {
  return Math.max(localDay(Date.now()), state.shoppingDate ? Date.parse(state.shoppingDate) / dayMs : 0);
}

const daysLeft = offer => offer.expires === null ? null : localDay(offer.expires) - shoppingDay();
const isNear = offer => daysLeft(offer) !== null && daysLeft(offer) >= 0 && daysLeft(offer) <= 3;
const isStale = offer => Date.now() - offer.updated > dayMs;
const pricePerUnit = offer => offer.price / products[offer.product].size;

function profileKey(place) {
  const name = normalize(place.split(',')[0]);
  return Object.hasOwn(originProfiles, name) ? name : null;
}

function destinationProfileKey() {
  if (state.sameDestination) return profileKey(state.origin);
  const name = normalize(state.destination.split(',')[0]);
  return profileKey(state.destination) ?? (Object.hasOwn(destinationAliases, name) ? destinationAliases[name] : null);
}

function destinationName() {
  return state.sameDestination ? state.origin : state.destination || 'Destino a informar';
}

function storeLeg(storeId, profile = profileKey(state.origin)) {
  const store = stores[storeId];
  return originProfiles[profile]?.[storeId] ?? [store.km, store.min];
}

function eligibleStore(id) {
  return storeLeg(id)[0] <= state.filters.radius &&
    (!state.filters.open || stores[id].open) &&
    (!state.filters.onlyFav || state.favorites.has(id));
}

function eligibleOffer(offer) {
  const remaining = daysLeft(offer);
  return (remaining === null || remaining >= 0) &&
    (state.filters.near || !isNear(offer)) &&
    Object.keys(attributes).every(key => !state.filters[key] || offer.evidence[key]);
}

function trip(ids) {
  if (!ids.length) return { km: 0, minutes: 0, legs: [] };
  const legs = [storeLeg(ids[0])];
  ids.slice(1).forEach((id, index) => legs.push(interstore[[ids[index], id].sort().join('/')]));
  legs.push(storeLeg(ids.at(-1), destinationProfileKey()));
  const distance = legs.reduce((sum, [length]) => sum + length, 0);
  const minutes = state.mode === 'walk' ? Math.round(distance / 4 * 60) : legs.reduce((sum, [, time]) => sum + time, 0);
  return { km: distance, minutes, legs };
}

function travelCost(distance) {
  if (state.mode === 'walk') return 0;
  if (state.consumption === null || state.fuel === null) return null;
  const estimate = distance / state.consumption * state.fuel * 100;
  return Number.isFinite(estimate) && estimate <= Number.MAX_SAFE_INTEGER - 1000000 ? estimate : null;
}

function makePlan(id, ids, items, keys) {
  const route = trip(ids);
  const subtotal = items.reduce((sum, offer) => sum + offer.price * state.list[offer.product], 0);
  const travel = travelCost(route.km);
  const missing = keys.filter(key => !items.some(offer => offer.product === key));
  return {
    id, stores: ids, items, subtotal, travel, ...route, missing,
    name: id === 'split' ? 'Dividir lista entre mercados' : stores[id].name,
    total: travel === null ? null : subtotal + travel,
    complete: missing.length === 0,
    stale: items.some(isStale),
    evidence: items.reduce((sum, offer) => sum + Object.values(offer.evidence).filter(value => value.documented).length, 0)
  };
}

function buildPlans() {
  const keys = Object.keys(state.list);
  if (!keys.length) return [];
  const allowed = shops.filter(eligibleStore);
  const available = offers.filter(offer => keys.includes(offer.product) && eligibleOffer(offer));
  const plans = allowed.map(id => makePlan(id, [id], available.filter(offer => offer.store === id), keys));
  const pairs = [];
  for (const [index, first] of allowed.entries()) {
    for (const second of allowed.slice(index + 1)) {
      const rank = (a, b) => a.price - b.price || Number(isStale(a)) - Number(isStale(b));
      const items = keys.map(key => available.filter(offer =>
        offer.product === key && [first, second].includes(offer.store)).sort(rank)[0]).filter(Boolean);
      const used = [...new Set(items.map(offer => offer.store))].sort((a, b) => storeLeg(a)[0] - storeLeg(b)[0]);
      if (used.length === 2) pairs.push(makePlan('split', used, items, keys));
    }
  }
  pairs.sort((a, b) => a.missing.length - b.missing.length || a.subtotal - b.subtotal ||
    Number(a.stale) - Number(b.stale) || a.km - b.km);
  if (pairs.length) plans.push(pairs[0]);
  return plans;
}

function sortByTotal(a, b) {
  if (a.total === null || b.total === null) return Number(a.total === null) - Number(b.total === null);
  return Math.round(a.total) - Math.round(b.total);
}

function sortedPlans() {
  return buildPlans().sort((a, b) =>
    a.missing.length - b.missing.length ||
    (state.priority === 'distance' ? a.km - b.km : 0) ||
    (state.priority === 'origin' ? b.evidence - a.evidence : 0) ||
    sortByTotal(a, b) || a.stores.length - b.stores.length || a.km - b.km);
}

function referencePlan() {
  const keys = Object.keys(state.list);
  const items = offers.filter(offer => offer.store === 'bairro' && keys.includes(offer.product) && eligibleOffer(offer));
  return makePlan('bairro', ['bairro'], items, keys);
}

const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const totalUnits = () => Object.values(state.list).reduce((sum, quantity) => sum + quantity, 0);
const types = () => Object.keys(state.list).length;
const offerLink = offer => '#produto/' + offer.product + '/' + offer.store;
const packPrice = offer => money(pricePerUnit(offer)) + '/' + products[offer.product].unit;

function heading(title, description, count = '') {
  return `<div class="hero"><div><h1 tabindex="-1">${title}</h1><p>${description}</p></div>${count}</div>`;
}

function sectionTitle(id, label, icon) {
  return `<div class="section-title"><span class="section-icon" aria-hidden="true">${icon}</span><h2 id="${id}">${label}</h2></div>`;
}

function filter(key) {
  return `<label class="check"><input type="checkbox" data-filter="${key}" ${state.filters[key] ? 'checked' : ''}>${filterLabels[key]}</label>`;
}

function sustainabilityFilters() {
  return `<fieldset class="sustain-filters"><legend>Sustentabilidade</legend>
    <p class="hint">As ofertas precisam atender a todos os selos selecionados.</p>
    ${Object.keys(attributes).map(key => `<label class="check">
      <input type="checkbox" data-filter="${key}" ${state.filters[key] ? 'checked' : ''}>${sustainabilityBadge(key)}
    </label>`).join('')}
  </fieldset>`;
}

function sustainabilityBadge(key, evidence) {
  const [label, description] = sustainability[key];
  const explanation = evidence ? description + ' ' + evidence.kind + '. ' + evidence.source + '.' : description;
  return `<span class="badge sustainability badge-${key}" title="${escape(explanation)}">${label}</span>`;
}

function offerBadges(offer) {
  return Object.entries(offer.evidence).map(([key, evidence]) => sustainabilityBadge(key, evidence)).join('');
}

const placeNames = ['Centro, São Carlos', 'Santa Felícia, São Carlos', 'Vila Prado, São Carlos', 'UFSCar'];

function placeOptions(id, aliases = []) {
  return `<datalist id="${id}">${[...aliases, ...placeNames].map(name => `<option value="${name}">`).join('')}</datalist>`;
}

const mapPlaces = {
  centro: [426, 303], 'santa felicia': [96, 135], 'vila prado': [290, 376], ufscar: [595, 70]
};
const mapStores = {
  bairro: [160, 188], economia: [461, 210], hortifruti: [357, 255]
};
const mapRoads = [
  ['R. Miguel Petroni', 'M-20 166 Q99 125 169 183 T288 215', 71, 158, 12],
  ['Av. Trabalhador São-Carlense', 'M-24 291 Q113 249 219 225 T456 178 Q539 167 709 188', 236, 213, -13],
  ['Av. São Carlos', 'M519 -10 L486 112 469 188 446 265 417 359 394 435', 484, 153, -73],
  ['R. XV de Novembro', 'M139 267 L311 250 446 265 686 311', 510, 271, 10],
  ['Av. Com. Alfredo Maffei', 'M-20 354 Q169 306 271 337 T704 375', 75, 330, -8],
  ['Rod. Washington Luís', 'M355 -10 Q472 77 704 117', 440, 49, 19]
];

function mapBackground() {
  const grid = [
    'M-12 110 Q107 64 197 116 T361 174', 'M-8 219 Q107 174 188 227', 'M-10 250 Q83 211 170 250',
    'M49 54 Q77 142 96 247', 'M104 51 Q128 142 140 235', 'M199 69 Q200 147 228 213',
    'M228 71 Q245 143 267 196', 'M312 108 L337 186 311 250 298 325 271 420',
    'M373 120 L395 181 368 247 354 348 337 420', 'M425 115 L434 173 410 253 388 354',
    'M528 161 L511 239 483 366 472 428', 'M575 181 L555 257 529 379 513 432',
    'M625 181 L607 271 586 385 566 428', 'M672 188 L656 286 642 391',
    'M213 293 L315 284 448 303 689 344', 'M301 221 L450 224 678 264',
    'M479 142 Q555 112 692 146', 'M550 38 Q569 117 612 179', 'M635 45 L664 176',
    'M170 270 L200 325 186 425', 'M230 251 L248 327 219 424', 'M37 304 L72 423',
    'M79 373 Q153 345 241 366 T484 401', 'M96 401 Q174 373 246 397'
  ];
  return `<g aria-hidden="true">
    <rect width="680" height="420" class="map-ground"/>
    <path class="map-park" d="M0 0H321L361 64 177 110 65 71 0 88Z M530 0H680V100L613 90 572 67Z M224 119L321 121 342 180 273 201Z M0 307L103 282 181 313 138 338 0 365Z"/>
    <path class="map-water" d="M-10 306 Q104 260 220 236 T469 189 Q551 179 691 199"/>
    ${grid.map(path => `<path class="map-minor" d="${path}"/>`).join('')}
    ${mapRoads.map(([, path]) => `<path class="map-road-edge" d="${path}"/><path class="map-road" d="${path}"/>`).join('')}
    <text class="map-district" x="52" y="97">SANTA FELÍCIA</text>
    <text class="map-district" x="557" y="39">UFSCAR</text>
    <text class="map-district" x="252" y="158">USP</text>
    <text class="map-district" x="489" y="328">CENTRO</text>
    <text class="map-district" x="198" y="391">VILA PRADO</text>
    ${mapRoads.map(([name, , x, y, angle]) =>
      `<text class="map-road-label" x="${x}" y="${y}" transform="rotate(${angle} ${x} ${y})">${name}</text>`).join('')}
    <path class="map-north" d="M644 38l7-14 7 14-7-4Z"/>
    <text class="map-road-label" x="647" y="20">N</text>
  </g>`;
}

function mapRoutes(plan, start, finish) {
  const stops = [start, ...plan.stores.map(id => mapStores[id]), finish];
  return stops.slice(1).map(([x2, y2], index) => {
    const [x1, y1] = stops[index];
    const length = Math.hypot(x2 - x1, y2 - y1);
    const dx = (x2 - x1) / length;
    const dy = (y2 - y1) / length;
    const xMid = (x1 + x2) / 2 - dy * 24;
    const yMid = (y1 + y2) / 2 + dx * 24;
    const path = `M${x1 + dx * 9} ${y1 + dy * 9} Q${xMid - dx * 20} ${yMid - dy * 20} ${xMid} ${yMid} Q${xMid + dx * 20} ${yMid + dy * 20} ${x2 - dx * 13} ${y2 - dy * 13}`;
    return `<path class="map-route" marker-mid="url(#route-arrow)" d="${path}"/><text class="map-leg-label" x="${xMid - dy * 14}" y="${yMid + dx * 14}" text-anchor="middle">${km(plan.legs[index][0])}</text>`;
  }).join('');
}

function mapPin(id, items, selected, plan) {
  const store = stores[id];
  const [x, y] = mapStores[id];
  const storeOffers = items.filter(item => item.store === id);
  const offer = !plan && storeOffers.length === 1 ? storeOffers[0] : null;
  const shortNames = { bairro: 'Mercado Bairro', economia: 'Hiper Economia', hortifruti: 'Hortifrúti' };
  const label = store.name + ' · ' + (store.open ? 'Aberta na consulta' : 'Fechada na consulta') +
    ' · ' + km(storeLeg(id)[0]) + ' da origem' + (offer ? ' · ' + money(offer.price) : '');
  return `<a href="#map-selection" data-map-store="${id}" class="map-pin ${selected === id ? 'pin-selected' : ''}" aria-label="${label}">
    <g transform="translate(${x} ${y})">
      <rect class="pin-hit" x="-13" y="-29" width="149" height="54" rx="10"/>
      <rect class="pin-label" x="14" y="-26" width="119" height="49" rx="8"/>
      <path class="pin-shape" d="M0 4C-4-2-12-9-12-17a12 12 0 0 1 24 0C12-9 4-2 0 4Z"/>
      <circle cx="0" cy="-17" r="4" class="${store.open ? 'pin-open' : 'pin-closed'}"/>
      <text x="22" y="-11">${shortNames[id]}</text>
      <text x="22" y="3" class="pin-price">${offer ? money(offer.price) + ' · ' : ''}${km(storeLeg(id)[0])}</text>
      <text x="22" y="16" class="pin-status">${store.open ? 'Aberta' : 'Fechada'}</text>
    </g>
  </a>`;
}

function mapSelection(id, items) {
  if (!id) return '<p class="hint">As ofertas disponíveis aparecem como marcadores no mapa.</p>';
  const store = stores[id];
  return `<strong>${store.name}</strong>
    <span class="hint">${store.address} · ${store.open ? 'Aberta na consulta' : 'Fechada na consulta'} · ${km(storeLeg(id)[0])} da origem</span>
    <ul class="map-offers">${items.filter(offer => offer.store === id).map(offer =>
      `<li><a href="${offerLink(offer)}">${products[offer.product].short}</a> · ${money(offer.price)} por embalagem · ${packPrice(offer)}</li>`).join('')}</ul>`;
}

function cityMap(items, ids, plan) {
  const selected = ids.includes(mapStore) ? mapStore : ids[0];
  const start = mapPlaces[profileKey(state.origin)] ?? mapPlaces.centro;
  const profile = destinationProfileKey();
  const arrival = mapPlaces[profile] ?? mapPlaces.centro;
  const sharedPoint = start === arrival;
  const finish = !state.sameDestination && sharedPoint ? [arrival[0] + 12, arrival[1] - 12] : arrival;
  return `<div class="city-map">
    <svg class="city-svg" viewBox="0 0 680 420" role="group" aria-label="Mapa esquemático de São Carlos com mercados interativos">
      <defs><marker id="route-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.6" markerHeight="2.6" orient="auto"><path d="M0 0L10 5 0 10Z" class="map-north"/></marker></defs>
      ${mapBackground()}
      ${plan ? mapRoutes(plan, start, finish) : ''}
      <g class="map-endpoint" transform="translate(${start.join(' ')})">
        <circle r="8"/><text x="12" y="16">${plan && state.sameDestination ? 'Origem / chegada' : 'Origem'}</text>
      </g>
      ${plan && !state.sameDestination ? `<g class="map-endpoint map-arrival" transform="translate(${finish.join(' ')})">
        <rect x="-7" y="-7" width="14" height="14" rx="2"/><text x="11" y="${sharedPoint ? -8 : 19}">${profile ? 'Chegada' : 'Chegada aprox.'}</text></g>` : ''}
      ${ids.map(id => mapPin(id, items, selected, plan)).join('')}
    </svg>
    ${ids.length ? `<div class="quick map-controls" role="group" aria-label="Selecionar loja no mapa">
      ${ids.map(id => `<button type="button" data-map-choice="${id}" aria-controls="map-selection" aria-pressed="${id === selected}">${stores[id].name}</button>`).join('')}
    </div>` : ''}
    <div id="map-selection" class="map-selection" aria-live="polite">${mapSelection(selected, items)}</div>
    <p class="hint map-caption">Mapa esquemático de São Carlos · Distâncias e posições das lojas simuladas</p>
  </div>`;
}

const homeCategories = {
  all: ['Todas as categorias'],
  produce: ['Hortifrúti', ['tomate', 'maca', 'batata']],
  pantry: ['Mercearia', ['arroz', 'feijao', 'oleo', 'cafe']],
  bakery: ['Padaria & Laticínios', ['pao', 'leite']]
};
const homeFilterLabels = {
  sustainable: ['🌱', 'Sustentáveis'],
  near: ['⚡', 'Validade Próxima'],
  distance: ['📍', 'Mais Próximos'],
  price: ['💲', 'Menor Preço'],
  open: ['🏪', 'Apenas Lojas Abertas']
};
const homeOrders = {
  distance: (a, b) => storeLeg(a.store)[0] - storeLeg(b.store)[0],
  price: (a, b) => a.price - b.price
};
const homeFilters = new Set();
let homeCategory = 'all';
let homeProduct = '';
let homeQuery = '';
let homeTerm = '';
let homeOrder = '';
let homeAdded = null;
let mapStore = null;

function homeOffers() {
  const catalog = homeTerm ? matches(homeTerm) : Object.keys(products);
  const category = homeCategories[homeCategory][1] ?? catalog;
  const result = offers.filter(offer => {
    const remaining = daysLeft(offer);
    return catalog.includes(offer.product) && category.includes(offer.product) &&
      (remaining === null || remaining >= 0) &&
      (!homeFilters.has('sustainable') || ['organic', 'vegan', 'local'].some(key => offer.evidence[key])) &&
      (!homeFilters.has('near') || (isNear(offer) && offer.regular > offer.price)) &&
      (!homeFilters.has('open') || stores[offer.store].open);
  });
  if (homeOrder) result.sort(homeOrders[homeOrder]);
  return result;
}

function visibleHomeOffers(available) {
  return homeProduct ? available.filter(offer => offer.product === homeProduct) : available;
}

function homeCard(offer) {
  const store = stores[offer.store];
  const product = products[offer.product];
  const id = offer.product + '/' + offer.store;
  const added = homeAdded === id;
  const near = isNear(offer);
  const quantity = state.list[offer.product] ?? 0;
  return `<article class="home-offer">
    <div class="home-offer-top">
      <div><h3><a href="${offerLink(offer)}" aria-label="${product.name} em ${store.name}">${product.name}</a></h3>
        <p>${store.name}</p>
        <p class="hint">${km(storeLeg(offer.store)[0])} da origem · ${store.open ? 'Aberta na consulta' : 'Fechada na consulta'}</p></div>
      <div class="home-price"><strong>${money(offer.price)}</strong><span class="hint">${product.pack} · ${packPrice(offer)}</span></div>
    </div>
    ${near && offer.regular > offer.price ? `<p class="hint">Preço regular de ${money(offer.regular)} por embalagem</p>` : ''}
    <div class="badges">${near ? validity(offer) : ''}${offerBadges(offer)}</div>
    <button type="button" data-home-add="${id}" ${added ? 'data-added' : ''} ${quantity >= 20 ? 'disabled' : ''}>
      ${added ? '✓ Adicionado · ' + quantity + ' na lista' : quantity >= 20 ? 'Limite de 20 na lista' : 'Adicionar à lista de compras'}
    </button>
  </article>`;
}

function homeOption(attribute, key, label, pressed, icon = '') {
  return `<button type="button" data-home-${attribute}="${key}" aria-pressed="${pressed}" aria-controls="home-results">
    ${icon ? `<span aria-hidden="true">${icon}</span> ` : ''}${escape(label)}</button>`;
}

function homeScreen() {
  const available = homeOffers();
  const availableProducts = [...new Set(available.map(offer => offer.product))];
  if (homeProduct && !availableProducts.includes(homeProduct)) availableProducts.push(homeProduct);
  const results = visibleHomeOffers(available);
  const storeIds = [...new Set(results.map(offer => offer.store))];
  const title = homeProduct ? products[homeProduct].name :
    homeCategory === 'all' ? 'Ofertas de produtos' : homeCategories[homeCategory][0];
  return `<section class="home-hero" aria-labelledby="home-title">
    <h1 tabindex="-1" id="home-title">Encontre bons preços<br>perto de você.</h1>
    <p>Compare ofertas em São Carlos e monte sua lista de compras.</p>
    <form id="home-search" class="home-search">
      <label class="sr-only" for="home-query">Buscar produto</label>
      <input type="search" id="home-query" list="home-catalog" value="${escape(homeQuery)}" placeholder="Qual produto você procura?" autocomplete="off">
      <datalist id="home-catalog">${Object.values(products).map(product => `<option value="${product.short}">${product.name}</option>`).join('')}</datalist>
      <button class="primary">Buscar</button>
    </form>
    <div class="home-controls">
      <div class="home-control-group" role="group" aria-labelledby="home-categories-label">
        <p id="home-categories-label">Categorias</p>
        <div class="quick">${Object.entries(homeCategories).map(([key, [label]]) =>
          homeOption('category', key, label, homeCategory === key)).join('')}</div>
      </div>
      <div class="home-control-group" role="group" aria-labelledby="home-filters-label">
        <p id="home-filters-label">Filtros de produtos</p>
        <div class="quick">${Object.entries(homeFilterLabels).map(([key, [icon, label]]) =>
          homeOption('filter', key, label, homeFilters.has(key) || homeOrder === key, icon)).join('')}</div>
      </div>
    </div>
  </section>
  <section class="home-results" id="home-results" aria-labelledby="home-results-title">
    <div class="home-results-top">
      <div><h2 id="home-results-title" tabindex="-1">${escape(title)}</h2>
        <p class="hint" id="home-results-count">${homeTerm ? `Busca por “${escape(homeTerm)}” · ` : ''}${results.length} ${results.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'}</p></div>
    </div>
    ${availableProducts.length > 1 || homeProduct ? `<div class="quick home-products" role="group" aria-label="Selecionar produto">
      ${homeOption('product', 'all', 'Todos os produtos', !homeProduct)}
      ${availableProducts.map(id => homeOption('product', id, products[id].short, homeProduct === id)).join('')}
    </div>` : ''}
    <div class="layout home-layout">
      <div class="home-offers">${results.length ? results.map(homeCard).join('') : '<p class="notice">Nenhuma oferta encontrada. Tente outro termo, categoria ou filtro.</p>'}</div>
      <section class="panel map-panel" aria-labelledby="home-map-title">
        <h3 id="home-map-title">Mercados no mapa</h3>
        <p class="hint">Origem: ${escape(state.origin)} · <a href="#lista">Alterar origem</a></p>
        ${cityMap(results, storeIds)}
      </section>
    </div>
  </section>`;
}

function updateHome(focus) {
  homeAdded = null;
  mapStore = null;
  update('');
  ($(focus) ?? $('#home-results-title')).focus({ preventScroll: true });
  announce($('#home-results-count').textContent);
}

function submitHomeSearch() {
  homeTerm = homeQuery = $('#home-query').value.trim();
  homeProduct = '';
  updateHome('#home-query');
}

function listScreen() {
  const units = totalUnits();
  const entries = Object.entries(state.list);
  const count = `<div class="hero-count"><strong>${units}</strong><span>${units === 1 ? 'embalagem' : 'embalagens'} na lista</span></div>`;
  return heading('Minha lista', 'Monte sua cesta e compare os preços considerando o custo do caminho.', count) + `
    <div class="layout">
      <section class="panel" aria-labelledby="products-title">
        ${sectionTitle('products-title', 'Produtos da lista', '☷')}
        <form id="add-form" class="field">
          <label for="search">Buscar produto</label>
          <div class="search-row">
            <div class="search-wrap">
              <input id="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="suggestions"
                aria-describedby="search-help search-error" autocomplete="off" placeholder="Ex.: arroz, leite">
              <div id="suggestions" class="search-menu" role="listbox" aria-label="Sugestões de produtos" hidden></div>
            </div>
            <button class="button primary">Adicionar</button>
          </div>
          <p id="search-help" class="hint">Separe os nomes por vírgulas para adicionar vários produtos.</p>
          <p id="search-error" class="error" role="alert" hidden></p>
        </form>
        <div class="quick">
          <span class="hint">Adicionar rápido</span>
          ${['feijao', 'cafe', 'oleo', 'pao', 'maca', 'batata'].map(id =>
            `<button data-add="${id}" aria-label="Adicionar ${products[id].short}">${products[id].short}</button>`).join('')}
        </div>
        ${entries.length ? `<ul class="items">${entries.map(([id, quantity]) => `
          <li class="item">
            <div class="item-info"><strong>${products[id].name}</strong><span class="hint">Embalagem de ${products[id].pack}</span></div>
            <div class="quantity" role="group" aria-label="Quantidade de ${products[id].name}">
              <button data-qty="${id}" data-delta="-1" aria-label="Diminuir quantidade de ${products[id].name}" aria-disabled="${quantity <= 1}" title="Mínimo de 1 embalagem">−</button>
              <span aria-label="${quantity} embalagens">${quantity}</span>
              <button data-qty="${id}" data-delta="1" aria-label="Aumentar quantidade de ${products[id].name}" aria-disabled="${quantity >= 20}" title="Máximo de 20 embalagens">+</button>
            </div>
            <button class="remove" data-remove="${id}" aria-label="Remover ${products[id].name}">Remover</button>
          </li>`).join('')}</ul>` : '<p class="notice">Sua lista está vazia. Busque um produto para começar.</p>'}
        <div class="summary-actions"><button class="danger" id="clear" ${entries.length ? '' : 'disabled'}>Limpar lista</button></div>
      </section>
      <aside class="panel" aria-labelledby="settings-title">
        ${sectionTitle('settings-title', 'Parâmetros da busca', '⌖')}
        <div class="field">
          <label for="origin">Origem da viagem</label>
          <input id="origin" list="origins" value="${escape(state.origin)}" aria-describedby="origin-info">
          ${placeOptions('origins')}
          <p class="hint" id="origin-info">${originHint()}</p>
          <button id="locate">Usar localização do dispositivo</button>
        </div>
        <div class="field">
          <label for="radius">Raio de distância</label>
          <select id="radius" aria-describedby="radius-help">
            ${[1, 3, 5, 10].map(value => `<option value="${value}" ${value === state.filters.radius ? 'selected' : ''}>Até ${value} km</option>`).join('')}
          </select>
          <p class="hint" id="radius-help">Da origem até cada loja. Configure o destino final na tela de rota.</p>
        </div>
        <div class="field">
          <label for="shopping-date">Data da compra</label>
          <input type="date" id="shopping-date" min="${todayInputValue()}" value="${escape(state.shoppingDate || todayInputValue())}" aria-describedby="date-help">
          <p class="hint" id="date-help">Usada para conferir a validade dos lotes.</p>
        </div>
        <fieldset><legend>Disponibilidade e lotes</legend>${['open', 'onlyFav', 'near'].map(filter).join('')}</fieldset>
        ${sustainabilityFilters()}
        <div class="summary-actions stack">
          <p class="hint">${types()} ${types() === 1 ? 'tipo de produto' : 'tipos de produto'} · ${units} ${units === 1 ? 'embalagem' : 'embalagens'}</p>
          <button class="button primary wide" id="compare" ${units ? '' : 'disabled'}>Comparar minha cesta (${units} ${units === 1 ? 'item' : 'itens'}) <span aria-hidden="true">→</span></button>
        </div>
      </aside>
    </div>`;
}

function originHint() {
  return profileKey(state.origin) ? 'Sugestões com distâncias simuladas: Centro, Santa Felícia, Vila Prado e UFSCar.' :
    'Para esta origem, a demonstração usa as distâncias simuladas do Centro.';
}

function costs(plan) {
  return `<dl class="costs">
    <div><dt>Subtotal dos produtos</dt><dd>${money(plan.subtotal)}</dd></div>
    <div><dt>Deslocamento estimado</dt><dd>${money(plan.travel)}</dd></div>
    <div class="total"><dt>${plan.complete ? 'Custo total estimado' : 'Total parcial estimado'}</dt><dd>${money(plan.total)}</dd></div>
  </dl>`;
}

function savings(plan, reference) {
  if (!plan.complete || !reference.complete || plan.total === null || reference.total === null) return '';
  const difference = Math.round(reference.total) - Math.round(plan.total);
  const label = difference === 0 ? 'Mesmo custo da referência' :
    (difference > 0 ? 'Economia líquida de ' : 'Custo adicional de ') + money(Math.abs(difference));
  return `<p class="notice ${difference > 0 ? 'success' : difference < 0 ? 'negative' : ''}"><strong>${label}</strong><br>
    <span class="hint">Em relação ao Mercado Bairro, com deslocamento.</span></p>`;
}

function validity(offer) {
  const days = daysLeft(offer);
  if (days === null) return '<span class="badge">Validade não informada</span>';
  const date = dateFormatter.format(offer.expires);
  const expired = localDay(offer.expires) < localDay(Date.now());
  const label = expired ? 'Vencido em ' + date : days < 0 ? 'Vence antes da compra: ' + date :
    days === 0 ? 'Atenção: vence ' + (shoppingDay() === localDay(Date.now()) ? 'hoje' : 'no dia da compra') + ', ' + date :
    days <= 3 ? 'Atenção: vence em ' + date + ' (' + days + (days === 1 ? ' dia)' : ' dias)') :
      'Válido até ' + date;
  return `<span class="badge ${days <= 3 ? 'warning' : ''}">${label}</span>`;
}

function updateTime(offer) {
  return `<span class="hint">Atualizado em ${timeFormatter.format(offer.updated)} · ${offer.source}</span>
    ${isStale(offer) ? '<span class="badge warning">Preço informado há mais de 24 h</span>' : ''}`;
}

function offerRow(offer, showStore = false) {
  const product = products[offer.product];
  return `<li class="offer-row">
    <strong>${state.list[offer.product]} × ${product.name} (${product.pack})</strong>
    <span class="hint">${showStore ? stores[offer.store].name + ' · ' : ''}${money(offer.price)} por embalagem · ${packPrice(offer)}</span>
    <div class="badges">${validity(offer)}${offerBadges(offer)}</div>
    ${updateTime(offer)}
    <a href="${offerLink(offer)}" aria-label="Detalhes da oferta de ${product.name} em ${stores[offer.store].name}">Detalhes da oferta</a>
  </li>`;
}

function planCard(plan, reference, best) {
  const selected = state.selected === plan.id;
  const store = stores[plan.id];
  const favorite = state.favorites.has(plan.id);
  return `<article class="panel ${selected ? 'selected' : ''}" aria-labelledby="plan-${plan.id}">
    <div class="card-top">
      <h2 id="plan-${plan.id}">${plan.name}</h2>
      ${store ? `<button class="favorite" data-favorite="${plan.id}" aria-pressed="${favorite}" aria-label="Favoritar ${store.name}"><span aria-hidden="true">${favorite ? '★' : '☆'}</span></button>` : ''}
    </div>
    <p class="hint">${store ? (store.open ? 'Aberta na consulta' : 'Fechada na consulta') + ' · ' + km(storeLeg(plan.id)[0]) + ' da origem' :
      plan.stores.map(id => stores[id].name).join(' + ')}</p>
    <div class="badges">
      <span class="badge ${plan.complete ? 'success' : 'warning'}">${plan.items.length}/${types()} itens disponíveis</span>
      ${best === plan.id ? '<span class="badge success">Menor custo estimado</span>' : ''}
      ${selected ? '<span class="badge">Plano selecionado</span>' : ''}
    </div>
    ${plan.missing.length ? `<p class="hint">Faltam ${plan.missing.map(id => products[id].short).join(', ')}.</p>` : ''}
    ${costs(plan)}
    <p class="hint">Percurso total de ${km(plan.km)} · ${plan.minutes} min · ${plan.evidence} evidências documentadas</p>
    ${savings(plan, reference)}
    ${plan.items.length ? `<details data-offers="${plan.id}"><summary>Produtos e ofertas (${plan.items.length})</summary>
      <ul class="offer-list">${plan.items.map(offer => offerRow(offer, !store)).join('')}</ul></details>` : '<p class="hint">Nenhuma oferta corresponde aos filtros atuais.</p>'}
    <div class="actions">
      <button data-select="${plan.id}" aria-pressed="${selected}" ${plan.complete ? '' : 'disabled'}>${selected ? 'Plano selecionado' : 'Selecionar este plano'}</button>
      <button class="primary" data-route="${plan.id}" ${plan.complete ? '' : 'disabled'}>Ver rota e resumo</button>
    </div>
  </article>`;
}

function travelAssumptions() {
  if (state.mode === 'walk') return 'Caminhada estimada a 4 km/h, com custo monetário de R$ 0,00.';
  if (state.consumption === null || state.fuel === null) return 'Consumo ou preço do combustível pendente na tela de rota.';
  return 'Consumo de ' + numberFormatter.format(state.consumption) + ' km/L · Combustível a ' + money(state.fuel * 100) + '/L.';
}

function comparisonScreen() {
  const plans = sortedPlans();
  const best = plans.filter(plan => plan.complete && !plan.stale && plan.total !== null)
    .sort((a, b) => sortByTotal(a, b) || a.stores.length - b.stores.length || a.km - b.km)[0]?.id;
  const reference = referencePlan();
  const filters = Object.keys(filterLabels).filter(key => state.filters[key]).map(key => filterLabels[key]);
  return heading('Comparação de cestas', 'Compare cobertura, preço e deslocamento antes de escolher onde comprar.') + `
    <div class="toolbar">
      <div class="field"><label for="priority">Prioridade da ordenação</label><select id="priority">
        ${Object.entries(priorities).map(([key, value]) => `<option value="${key}" ${key === state.priority ? 'selected' : ''}>${value}</option>`).join('')}
      </select></div>
      <a class="button" href="#lista">Editar lista e filtros</a>
    </div>
    <div class="results-context stack">
      <p class="hint">Origem: ${escape(state.origin)} · Destino final: ${escape(destinationName())} · Raio: ${state.filters.radius} km · ${state.mode === 'car' ? 'Carro' : 'A pé'} · Compra em ${shoppingDateFormatter.format(shoppingDay() * dayMs)} · Consulta das lojas em ${timeFormatter.format(state.demoTime)}.</p>
      <p class="hint">${filters.length ? filters.join(' · ') : 'Sem filtros adicionais'}${state.filters.near ? '' : ' · Validade próxima excluída'}.</p>
      <p class="hint">${reference.complete ? 'Referência de custo: Mercado Bairro.' : 'Referência indisponível: o Mercado Bairro não cobre a cesta para os filtros de oferta.'}
        ${travelAssumptions()}
      </p>
      ${state.priority === 'origin' ? '<p class="notice">A ordem considera a quantidade de atributos com documento informado. Declarações são exibidas nos detalhes.</p>' : ''}
      ${!types() ? '<p class="notice">Sua lista está vazia. Adicione produtos para comparar.</p>' : ''}
      ${types() && !plans.some(plan => plan.complete) ? '<div class="notice stack"><p>Nenhum plano completo atende aos filtros. Aumente o raio ou revise as preferências.</p><button id="reset-filters">Restaurar filtros padrão</button></div>' : ''}
    </div>
    <div class="cards">${plans.map(plan => planCard(plan, reference, best)).join('')}</div>`;
}

const periods = { 7: '7 dias', 30: '30 dias (1 mês)', 90: '90 dias (3 meses)' };
const historyDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
let historyPeriod = 30;

function priceHistory(offer, days) {
  const seed = Object.keys(products).indexOf(offer.product) * 5 + shops.indexOf(offer.store) * 3;
  return Array.from({ length: days }, (_, index) => {
    const ago = days - 1 - index;
    const promotion = .09 * Math.exp(-((ago - (45 + seed % 18)) ** 2) / 20);
    const trend = .055 + Math.sin((ago + seed) / 4) * .024 + Math.cos((ago + 2 * seed) / 8) * .017 - promotion;
    const price = ago === 0 ? offer.price : Math.round(offer.price * (1 + trend));
    return { date: relativeDate(-ago), price };
  });
}

function historyChart(offer) {
  const history = priceHistory(offer, historyPeriod);
  const prices = history.map(point => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const average = prices.reduce((sum, price) => sum + price, 0) / history.length;
  const difference = Math.round((offer.price / average - 1) * 100);
  const badge = difference === 0 ? 'Na média' : Math.abs(difference) + '% ' + (difference < 0 ? 'abaixo' : 'acima') + ' da média';
  const range = max - min;
  const lower = Math.max(0, min - Math.max(1, Math.ceil(range * .22)));
  const upper = max + Math.max(1, Math.ceil(range * .22));
  const y = price => 168 - (price - lower) / (upper - lower) * 142;
  const points = history.map((point, index) => ({
    ...point, x: 82 + index / (history.length - 1) * 472, y: y(point.price)
  }));
  const last = points.at(-1);
  const line = points.map((point, index) => (index ? 'L' : 'M') + point.x + ' ' + point.y).join(' ');
  const axis = [upper, (lower + upper) / 2, lower];
  return `<div class="history-stats">
    <div><span class="hint">Menor no período</span><strong>${money(min)}</strong></div>
    <div><span class="hint">Média no período</span><strong>${money(average)}</strong></div>
    <div><span class="hint">Preço atual</span><strong>${money(offer.price)}</strong><span class="badge ${difference < 0 ? 'success' : ''}">${badge}</span></div>
  </div>
  <svg class="history-svg" viewBox="0 0 580 210" role="img" aria-label="Histórico simulado de ${historyPeriod} dias. Use o controle abaixo para consultar valores diários.">
    ${axis.map(value => `<path class="chart-grid" d="M80 ${y(value)}H556"/><text x="73" y="${y(value) + 4}" text-anchor="end">${money(value)}</text>`).join('')}
    <path class="chart-area" d="${line} L554 168 H82Z"/>
    <path class="chart-average" d="M82 ${y(average)}H554"/>
    <path class="chart-line" d="${line}"/>
    ${points.filter((_, index) => index === 0 || index === Math.floor(points.length / 2) || index === points.length - 1)
      .map((point, index) => `<text x="${point.x}" y="194" text-anchor="${['start', 'middle', 'end'][index]}">${historyDate.format(point.date)}</text>`).join('')}
    <circle id="chart-marker" class="chart-marker" cx="${last.x}" cy="${last.y}" r="5"/>
    ${points.map((point, index) => `<rect class="chart-target" data-chart-point="${index}" data-x="${point.x}" data-y="${point.y}" data-label="${dateFormatter.format(point.date)} · ${money(point.price)}" x="${point.x - 236 / (points.length - 1)}" y="17" width="${472 / (points.length - 1)}" height="156"/>`).join('')}
  </svg>
  <div class="chart-inspect">
    <label for="history-day">Consultar preço por dia</label>
    <input id="history-day" type="range" min="0" max="${points.length - 1}" value="${points.length - 1}" aria-valuetext="${dateFormatter.format(last.date)} · ${money(last.price)}">
    <output id="history-value" for="history-day">${dateFormatter.format(last.date)} · ${money(last.price)}</output>
  </div>`;
}

function inspectHistory(index) {
  const point = document.querySelector(`[data-chart-point="${index}"]`);
  if (!point) return;
  const input = $('#history-day');
  input.value = index;
  input.setAttribute('aria-valuetext', point.dataset.label);
  $('#history-value').value = point.dataset.label;
  const marker = $('#chart-marker');
  marker.setAttribute('cx', point.dataset.x);
  marker.setAttribute('cy', point.dataset.y);
}

function productScreen(offer) {
  if (!offer) return heading('Oferta indisponível', 'O catálogo não tem uma oferta para este endereço.') +
    '<a class="button" href="#comparar">Voltar para Comparação</a>';
  const product = products[offer.product];
  const store = stores[offer.store];
  const [category, description] = productDetails[offer.product];
  const [hours, disposal, payments] = storeDetails[offer.store];
  const alternatives = shops.filter(id => id !== offer.store);
  return heading(product.name, 'Oferta de ' + store.name) + `
    <div class="layout">
      <article class="panel" aria-labelledby="product-offer">
        ${sectionTitle('product-offer', 'Detalhes da oferta', '▤')}
        <p><strong class="price">${money(offer.price)}</strong> <span class="muted">por embalagem de ${product.pack}</span><br>
          <span class="hint">${packPrice(offer)}</span></p>
        ${offer.regular !== null ? `<p class="hint">Desconto simulado deste lote. Preço regular de ${money(offer.regular)}.</p>` : ''}
        <p>${description}</p><p class="hint">Categoria: ${category} · Embalagem: ${product.pack}</p>
        <div class="badges">${validity(offer)}${offerBadges(offer)}</div>
        ${isNear(offer) ? '<p class="notice warning">Este lote vence em até 3 dias a partir da data de compra. Confira a data na embalagem e planeje o uso.</p>' : ''}
        <p>${updateTime(offer)}</p>
        <button id="report" class="button">Reportar divergência de preço ou validade</button>
        <p id="report-feedback" class="notice success" hidden>Relato recebido nesta sessão de demonstração.</p>
        <section class="store-details" aria-labelledby="store-title">
          <h3 id="store-title">${store.name}</h3>
          <p class="hint">${store.address} · ${km(storeLeg(offer.store)[0])} da origem · ${store.open ? 'Aberta na consulta' : 'Fechada na consulta'}</p>
          <dl>
            <div><dt>Horário de funcionamento</dt><dd>${hours}</dd></div>
            <div><dt>Descarte e sustentabilidade</dt><dd>${disposal}</dd></div>
            <div><dt>Formas de pagamento</dt><dd>${payments}</dd></div>
          </dl>
        </section>
      </article>
      <section class="panel" aria-labelledby="evidence-title">
        ${sectionTitle('evidence-title', 'Procedência do produto', '✓')}
        <ul class="evidence">${Object.entries(attributes).map(([key, label]) => {
          const item = offer.evidence[key];
          return `<li><strong>${label}</strong><br>${item
            ? `<span class="badge">${item.kind}</span><br><span class="hint">${item.source} · ${dateFormatter.format(item.date)}</span>`
            : '<span class="hint">Não informado pela loja</span>'}</li>`;
        }).join('')}</ul>
        <h3>Preços nas outras lojas</h3>
        <ul class="offer-list">${alternatives.map(id => {
          const other = offers.find(item => item.product === offer.product && item.store === id);
          return `<li class="offer-row comparison-price">${other
            ? `<a href="${offerLink(other)}">${stores[id].name}</a><strong>${money(other.price)}</strong>${validity(other)}`
            : `<span>${stores[id].name}</span><span class="hint">Sem oferta cadastrada</span>`}</li>`;
        }).join('')}</ul>
      </section>
    </div>
    <section class="panel history-panel" aria-labelledby="history-title">
      <div class="history-header">
        <div><h2 id="history-title">Histórico de preços</h2><p class="hint">Preços simulados por embalagem nesta loja.</p></div>
        <div class="quick home-filters" role="group" aria-label="Período do histórico">${Object.entries(periods).map(([days, label]) =>
          `<button type="button" data-period="${days}" aria-pressed="${Number(days) === historyPeriod}">${label}</button>`).join('')}</div>
      </div>
      <div id="history-chart">${historyChart(offer)}</div>
    </section>
    <div class="back-row actions"><a class="button" href="#inicio">← Voltar para Busca</a><a class="button" href="#comparar">Voltar para Comparação</a></div>`;
}

function routePlan() {
  return buildPlans().find(plan => plan.id === state.selected && plan.complete);
}

function routeCosts(plan) {
  return costs(plan) + savings(plan, referencePlan()) + (plan.total === null
    ? '<p class="notice warning">Preencha consumo e preço com valores válidos para estimar o total de carro.</p>' : '');
}

function destinationHint() {
  if (!state.destination) return 'Informe o destino final. Enquanto o campo estiver vazio, a estimativa usa o Centro.';
  const profile = destinationProfileKey();
  const alias = normalize(state.destination.split(',')[0]);
  if (Object.hasOwn(destinationAliases, alias)) return 'Referência simulada: ' + placeNames.find(name => profileKey(name) === profile) + '.';
  return profile ? 'Local de chegada no mapa esquemático de São Carlos.' : 'Destino fora do catálogo. A distância final usa o Centro como referência aproximada.';
}

function destinationSettings() {
  return `<fieldset class="destination-settings"><legend>Destino da rota</legend>
    <label class="check"><input id="same-destination" type="checkbox" ${state.sameDestination ? 'checked' : ''}> O destino final é o mesmo que o ponto de partida</label>
    <div class="field" id="destination-fields" ${state.sameDestination ? 'hidden' : ''}>
      <label for="destination">Destino final</label>
      <input id="destination" list="destinations" maxlength="100" value="${escape(state.destination)}" placeholder="Ex.: Casa, Trabalho, UFSCar" aria-describedby="destination-info">
      ${placeOptions('destinations', ['Casa', 'Trabalho'])}
      <p class="hint" id="destination-info">${state.sameDestination ? '' : destinationHint()}</p>
    </div>
  </fieldset>`;
}

function routeMetrics(plan) {
  return km(plan.km) + ' no total · ' + plan.minutes + ' min · ' + (state.mode === 'car' ? 'Carro' : 'A pé');
}

function routeStops(plan) {
  const stops = [
    ['Saída', state.origin],
    ...plan.stores.map((id, index) => ['Parada ' + (index + 1), stores[id].name, stores[id].address]),
    [state.sameDestination ? 'Retorno à origem' : 'Destino final', destinationName()]
  ];
  return stops.map(([label, name, address], index) => `<li>
    <span class="stop" aria-hidden="true">${index === 0 ? '⌂' : index === stops.length - 1 ? '✓' : index}</span>
    <div><span class="hint">${label}${index ? ' · ' + km(plan.legs[index - 1][0]) : ''}</span><br><strong>${escape(name)}</strong>${address ? `<br><span class="hint">${address}</span>` : ''}</div>
  </li>`).join('');
}

function canConfirm(plan) {
  return plan.total !== null && (state.sameDestination || Boolean(state.destination));
}

function routeScreen(plan) {
  if (!plan) return heading('Rota e resumo', 'Escolha um plano completo na comparação para ver o percurso.') +
    `<section class="panel stack">${destinationSettings()}
      <div class="actions"><a class="button primary" href="#comparar">Abrir comparação</a><a class="button" href="#lista">Voltar e editar lista</a></div>
    </section>`;
  const alerts = plan.items.filter(offer => isNear(offer) || isStale(offer) || offer.expires === null);
  return heading('Rota e resumo do planejamento', plan.name) + `
    <div id="saved-plan" class="notice success results-context" ${state.saved ? '' : 'hidden'}><strong>✓ Planejamento confirmado!</strong> Sua lista ficou salva nesta sessão.</div>
    <div class="layout">
      <div class="stack">
        <section class="panel" aria-labelledby="route-title">
          ${sectionTitle('route-title', 'Percurso estimado', '⌖')}
          <p class="muted" id="route-metrics">${routeMetrics(plan)}</p>
          <div id="route-map">${cityMap(plan.items, plan.stores, plan)}</div>
          <ol class="timeline">${routeStops(plan)}</ol>
          <p class="hint">Tempos simulados sem trânsito. A caminhada considera 4 km/h.</p>
        </section>
        <section class="panel" aria-labelledby="shop-list">
          ${sectionTitle('shop-list', 'Compras por loja', '☷')}
          ${plan.stores.map(id => `<section class="stack"><h3>${stores[id].name}</h3>
            <ul class="offer-list">${plan.items.filter(offer => offer.store === id).map(offer => `<li class="offer-row comparison-price">
              <span>${state.list[offer.product]} × ${products[offer.product].name} (${products[offer.product].pack})</span>
              <strong>${money(offer.price * state.list[offer.product])}</strong>
            </li>`).join('')}</ul></section>`).join('')}
          ${alerts.length ? `<div class="notice warning"><strong>Confira estes lotes antes de sair</strong>
            <ul>${alerts.map(offer => `<li>${products[offer.product].short} · ${stores[offer.store].name}<br>${validity(offer)}
              ${isStale(offer) ? '<span class="badge warning">Preço informado há mais de 24 h</span>' : ''}</li>`).join('')}</ul></div>` : ''}
        </section>
      </div>
      <aside class="panel" aria-labelledby="travel-title">
        ${sectionTitle('travel-title', 'Estimativa de deslocamento', '↔')}
        ${destinationSettings()}
        <form id="estimate" class="stack">
          <div class="field"><label for="mode">Meio de transporte</label><select id="mode">
            <option value="car" ${state.mode === 'car' ? 'selected' : ''}>Carro</option>
            <option value="walk" ${state.mode === 'walk' ? 'selected' : ''}>A pé</option>
          </select></div>
          <div id="car-fields" class="stack" ${state.mode === 'walk' ? 'hidden' : ''}>
            <div class="field"><label for="consumption">Consumo (km/L)</label><input type="number" id="consumption" required min="0.1" max="1000" step="any" inputmode="decimal" value="${state.consumption ?? ''}"></div>
            <div class="field"><label for="fuel">Preço do combustível (R$/L)</label><input type="number" id="fuel" required min="0.01" max="1000" step="any" inputmode="decimal" value="${state.fuel ?? ''}"></div>
          </div>
        </form>
        <p class="hint" id="cost-formula">${state.mode === 'car' ? 'Distância total ÷ consumo × preço por litro.' : 'Caminhada com custo monetário de R$ 0,00.'}</p>
        <div id="route-costs" class="stack">${routeCosts(plan)}</div>
        <div class="summary-actions stack">
          <button class="button wide" id="copy">Copiar lista para WhatsApp / Área de transferência</button>
          <p class="notice success" id="copy-feedback" hidden>Lista copiada. Você pode colar no WhatsApp.</p>
          <div class="field" id="copy-fallback" hidden><label for="copy-text">Texto da lista para copiar</label><textarea id="copy-text" rows="5" readonly></textarea></div>
          <button class="button primary wide" id="save" ${canConfirm(plan) ? '' : 'disabled'}>Confirmar planejamento</button>
          <a class="button wide" href="#lista">Voltar e editar lista</a>
        </div>
      </aside>
    </div>`;
}

const expandedPlans = new Set();
let comparisonReturn = null;
let undoAction = null;
let undoTimer;
let statusFrame;
let cursor = -1;
let suggestions = [];
let reportOffer;
const dialogTriggers = new WeakMap();

function announce(message) {
  cancelAnimationFrame(statusFrame);
  $('#status').textContent = '';
  statusFrame = requestAnimationFrame(() => { $('#status').textContent = message; });
}

function locationPage() {
  const [page, product, store] = location.hash.slice(1).split('/');
  if (page === 'produto') return {
    page, offer: offers.find(item => item.product === product && (!store || item.store === store))
  };
  return { page: ['lista', 'comparar', 'rota'].includes(page) ? page : 'inicio' };
}

function render({ focus = false } = {}) {
  const { page, offer } = locationPage();
  cursor = -1;
  suggestions = [];
  const screens = { inicio: homeScreen, lista: listScreen, comparar: comparisonScreen,
    produto: () => productScreen(offer), rota: () => routeScreen(routePlan()) };
  $('#screen').innerHTML = screens[page]();
  const title = $('#screen h1');
  document.title = title.textContent + ' | Compra Certa';
  document.querySelectorAll('.site-nav a').forEach(link => {
    const active = link.hash === '#' + (page === 'produto' ? (comparisonReturn ? 'comparar' : 'inicio') : page);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (page === 'comparar') {
    document.querySelectorAll('[data-offers]').forEach(detail => { detail.open = expandedPlans.has(detail.dataset.offers); });
  }
  if (focus) {
    const previous = page === 'comparar' && comparisonReturn
      ? document.querySelector(`[data-offers="${comparisonReturn.id}"] a[href="${comparisonReturn.link}"]`) : null;
    if (previous) {
      previous.closest('details').open = true;
      previous.focus();
    }
    else {
      title.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
    if (page === 'comparar' || page === 'inicio') comparisonReturn = null;
  }
}

function navigate(page) {
  if (location.hash === '#' + page) render({ focus: true });
  else location.hash = page;
}

function update(message, selector) {
  persist();
  render();
  if (selector) {
    const target = $(selector);
    (target && !target.disabled ? target : $('#screen h1')).focus({ preventScroll: true });
  }
  if (message) announce(message);
}

function changeList(message, selector, preserveDraft = true) {
  const draft = preserveDraft ? $('#search')?.value : '';
  state.saved = null;
  update(message, selector);
  if (draft) $('#search').value = draft;
}

let undoFallback;

function setUndo(message, action, fallback) {
  undoAction = action;
  undoFallback = fallback;
  $('#undo-text').textContent = message;
  $('#undo-region').hidden = false;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(clearUndo, 12000);
}

function clearUndo() {
  clearTimeout(undoTimer);
  undoAction = null;
  if (document.activeElement === $('#undo')) ($(undoFallback) ?? $('#screen h1')).focus();
  $('#undo-region').hidden = true;
}

function matches(term) {
  const query = normalize(term);
  return query ? Object.keys(products).filter(id => normalize(products[id].name).includes(query)) : [];
}

function closeSuggestions() {
  const input = $('#search');
  if (!input) return;
  $('#suggestions').hidden = true;
  input.setAttribute('aria-expanded', 'false');
  input.removeAttribute('aria-activedescendant');
  cursor = -1;
}

function showSuggestions() {
  const input = $('#search');
  suggestions = matches(input.value.split(',').at(-1));
  closeSuggestions();
  if (!suggestions.length) return;
  $('#suggestions').innerHTML = suggestions.map(id => `<div id="suggest-${id}" role="option"
    data-suggest="${id}" aria-selected="false">${products[id].name} · ${products[id].pack}</div>`).join('');
  $('#suggestions').hidden = false;
  input.setAttribute('aria-expanded', 'true');
}

function readSearch() {
  const value = $('#search').value;
  const terms = value.split(',').map(term => term.trim()).filter(Boolean);
  const ids = [];
  for (const term of terms) {
    const candidates = matches(term);
    if (candidates.length !== 1) {
      showSearchError(candidates.length ? `“${term}” tem mais de uma opção. Escolha uma sugestão com a embalagem.` :
        `Não encontramos “${term}”. Confira o nome ou use um atalho.`);
      return;
    }
    ids.push(candidates[0]);
  }
  if (!ids.length) showSearchError('Digite o nome de um produto para adicionar.');
  else addProducts(ids, '#search');
}

function showSearchError(message) {
  const error = $('#search-error');
  error.hidden = false;
  error.textContent = message;
  $('#search').setAttribute('aria-invalid', 'true');
  $('#search').focus();
}

function addProducts(ids, selector) {
  const next = { ...state.list };
  for (const id of ids) {
    next[id] = (next[id] ?? 0) + 1;
    if (next[id] > 20) {
      const message = 'O limite de ' + products[id].short + ' é de 20 embalagens.';
      if (selector === '#search') showSearchError(message);
      else {
        const error = $('#search-error');
        error.hidden = false;
        error.textContent = message;
      }
      return;
    }
  }
  state.list = next;
  changeList(ids.length === 1 ? products[ids[0]].name + ' adicionado à lista.' : 'Produtos adicionados à lista.', selector, selector !== '#search');
}

function chooseSuggestion(id) {
  const input = $('#search');
  const prefix = input.value.split(',').slice(0, -1);
  if (prefix.length) {
    input.value = [...prefix.map(term => term.trim()), products[id].name].join(', ');
    closeSuggestions();
    input.focus();
  } else {
    addProducts([id], '#search');
  }
}

function searchKey(event) {
  const input = event.target;
  if (event.key === 'Escape') {
    if (input.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      closeSuggestions();
    }
    return;
  }
  if (event.key === 'Enter' && cursor >= 0) {
    event.preventDefault();
    chooseSuggestion(suggestions[cursor]);
    return;
  }
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  if (input.getAttribute('aria-expanded') === 'false') showSuggestions();
  if (!suggestions.length) return;
  event.preventDefault();
  const step = event.key === 'ArrowDown' ? 1 : -1;
  cursor = cursor < 0 && step < 0 ? suggestions.length - 1 : (cursor + step + suggestions.length) % suggestions.length;
  const selected = 'suggest-' + suggestions[cursor];
  input.setAttribute('aria-activedescendant', selected);
  $('#suggestions').querySelectorAll('[role="option"]').forEach(option => {
    option.setAttribute('aria-selected', option.id === selected);
    if (option.id === selected) option.scrollIntoView({ block: 'nearest' });
  });
}

function changeOrigin() {
  const input = $('#origin');
  if (!input) return;
  const origin = input.value.trim() || 'Centro, São Carlos';
  input.value = origin;
  if (origin === state.origin) return;
  state.origin = origin;
  state.saved = null;
  $('#origin-info').textContent = originHint();
  persist();
  announce('Origem atualizada. ' + originHint());
}

function locate() {
  const button = $('#locate');
  const initialOrigin = state.origin;
  if (!navigator.geolocation) {
    $('#origin-info').textContent = 'Localização indisponível. Informe seu bairro no campo de origem.';
    announce($('#origin-info').textContent);
    return;
  }
  button.disabled = true;
  $('#origin-info').textContent = 'Consultando localização do dispositivo…';
  announce($('#origin-info').textContent);
  const finish = message => {
    if (!button.isConnected) return;
    button.disabled = false;
    $('#origin-info').textContent = message;
    announce(message);
  };
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    if (!button.isConnected || initialOrigin !== state.origin) {
      if (button.isConnected) button.disabled = false;
      return;
    }
    // Coordenadas aproximadas para escolher um perfil da demonstração; nenhuma coordenada é gravada.
    const anchors = [
      ['Centro, São Carlos', -22.018, -47.891],
      ['Santa Felícia, São Carlos', -21.992, -47.926],
      ['Vila Prado, São Carlos', -22.029, -47.906]
    ];
    const distance = ([, lat, lon]) => Math.hypot(lat - coords.latitude, (lon - coords.longitude) * .93);
    const closest = anchors.sort((a, b) => distance(a) - distance(b))[0];
    if (distance(closest) > .07) {
      finish('A localização está fora da área simulada. Informe um bairro de São Carlos.');
      return;
    }
    $('#origin').value = closest[0];
    changeOrigin();
    finish('Origem aproximada da demonstração: ' + closest[0] + '.');
  }, () => finish('Não foi possível usar a localização. Informe seu bairro no campo de origem.'), { timeout: 7000 });
}

function showDialog(selector, trigger) {
  const dialog = $(selector);
  dialogTriggers.set(dialog, trigger);
  dialog.returnValue = '';
  dialog.showModal();
  dialog.querySelector('button[value="cancel"], #report-type').focus();
}

function showReport(trigger) {
  reportOffer = locationPage().offer;
  $('#report-form').reset();
  $('#report-offer').textContent = products[reportOffer.product].name + ' · ' + stores[reportOffer.store].name;
  editReport(false);
  showDialog('#report-dialog', trigger);
}

function editReport(focus = true) {
  $('#report-fields').hidden = false;
  $('#report-summary').hidden = true;
  $('#report-edit').hidden = true;
  $('#report-error').hidden = true;
  $('#report-next').textContent = 'Revisar relato';
  if (focus) $('#report-type').focus();
}

function submitReport() {
  const type = $('#report-type').value;
  const note = $('#report-note').value.trim();
  if (!note) {
    const error = $('#report-error');
    error.textContent = 'Descreva brevemente a divergência.';
    error.hidden = false;
    $('#report-note').focus();
    return;
  }
  if ($('#report-summary').hidden) {
    $('#report-preview').textContent = type + ' — ' + note;
    $('#report-fields').hidden = true;
    $('#report-summary').hidden = false;
    $('#report-edit').hidden = false;
    $('#report-error').hidden = true;
    $('#report-next').textContent = 'Enviar relato simulado';
    $('#report-review-title').focus();
    return;
  }
  state.reports.push({ product: reportOffer.product, store: reportOffer.store, type, note, date: Date.now() });
  persist();
  $('#report-dialog').close();
  $('#report-feedback').hidden = false;
  announce('Relato recebido nesta sessão de demonstração.');
}

function setEstimate(event) {
  const input = event.target;
  const field = input.id;
  state[field] = input.validity.valid && Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : null;
  input.setAttribute('aria-invalid', String(state[field] === null));
  state.saved = null;
  persist();
  const plan = routePlan();
  if (!plan) return;
  $('#saved-plan').hidden = true;
  $('#route-costs').innerHTML = routeCosts(plan);
  $('#save').disabled = !canConfirm(plan);
  announce('Custo total estimado: ' + money(plan.total) + '.');
}

function changeDestination(input) {
  if (input.id === 'same-destination') {
    state.sameDestination = input.checked;
    $('#destination-fields').hidden = input.checked;
    if (!input.checked) $('#destination').focus();
  } else {
    const destination = input.value.trim();
    if (destination === state.destination) return;
    state.destination = destination;
  }
  $('#destination-info').textContent = state.sameDestination ? '' : destinationHint();
  state.saved = null;
  persist();
  const plan = routePlan();
  if (!plan) return;
  $('#saved-plan').hidden = true;
  $('#route-metrics').textContent = routeMetrics(plan);
  $('#route-map').innerHTML = cityMap(plan.items, plan.stores, plan);
  $('.timeline').innerHTML = routeStops(plan);
  $('#route-costs').innerHTML = routeCosts(plan);
  $('#save').disabled = !canConfirm(plan);
  announce('Percurso atualizado. ' + routeMetrics(plan) + '.');
}

function shopText(plan) {
  const groups = plan.stores.map(id => {
    const rows = plan.items.filter(offer => offer.store === id).map(offer => {
      const product = products[offer.product];
      return '• ' + state.list[offer.product] + ' × ' + product.name + ' (' + product.pack + ')';
    });
    return [stores[id].name, stores[id].address, ...rows].join('\n');
  });
  return ['Compra Certa — Lista de compras', ...groups,
    'Origem: ' + state.origin + '\nDestino final: ' + destinationName() + '\nPercurso: ' + km(plan.km),
    'Total estimado: ' + money(plan.total)].join('\n\n');
}

async function copyPlan() {
  const plan = routePlan();
  if (!plan) return;
  const text = shopText(plan);
  try {
    await navigator.clipboard.writeText(text);
    announce('Lista copiada. Você pode colar no WhatsApp.');
    if ($('#copy-feedback')) $('#copy-feedback').hidden = false;
  } catch {
    const fallback = $('#copy-fallback');
    if (!fallback) return;
    fallback.hidden = false;
    const box = $('#copy-text');
    box.value = text;
    box.focus();
    box.select();
    announce('Texto selecionado. Use o comando Copiar do seu dispositivo.');
  }
}

function adjustQuantity(id, delta, button) {
  if (button.getAttribute('aria-disabled') === 'true') return;
  state.list[id] += Number(delta);
  changeList(products[id].short + ': ' + state.list[id] + ' na lista.', `[data-qty="${id}"][data-delta="${delta}"]`);
}

function removeItem(id) {
  const quantity = state.list[id];
  const entries = Object.entries(state.list);
  const index = entries.findIndex(([key]) => key === id);
  const next = entries[index + 1]?.[0] ?? entries[index - 1]?.[0];
  delete state.list[id];
  const fallback = next ? `[data-remove="${next}"]` : '#search';
  setUndo(products[id].short + ' removido da lista.', () => {
    const restored = Object.entries(state.list);
    const existing = restored.findIndex(([key]) => key === id);
    if (existing >= 0) restored.splice(existing, 1);
    restored.splice(index, 0, [id, Math.max(quantity, state.list[id] ?? 0)]);
    state.list = Object.fromEntries(restored);
    changeList('Item restaurado.', `[data-remove="${id}"]`);
  }, fallback);
  changeList(products[id].short + ' removido da lista. A ação Desfazer está disponível por 12 segundos.', '#undo');
}

function favoriteStore(id) {
  const exists = state.favorites.has(id);
  if (exists) state.favorites.delete(id);
  else state.favorites.add(id);
  function saveFavorites() {
    writeLocal('localStorage', storageKey + '-favorites', [...state.favorites]);
    if (state.filters.onlyFav) state.saved = null;
  }
  saveFavorites();
  if (exists) setUndo('Loja removida dos favoritos.', () => {
    state.favorites.add(id);
    saveFavorites();
    update('Favorito restaurado.', `[data-favorite="${id}"]`);
  }, '#priority');
  update(exists ? 'Loja removida dos favoritos. Você pode desfazer.' : 'Loja adicionada aos favoritos.', exists ? '#undo' : `[data-favorite="${id}"]`);
}

function selectPlan(id, route) {
  const plan = buildPlans().find(item => item.id === id && item.complete);
  if (!plan) return;
  if (state.selected !== id) state.saved = null;
  state.selected = id;
  persist();
  if (route) navigate('rota');
  else update('Plano selecionado: ' + plan.name + '.', `[data-select="${id}"]`);
}

function confirmPlan() {
  const plan = routePlan();
  if (!plan || !canConfirm(plan)) return;
  state.saved = {
    id: plan.id, stores: plan.stores, list: { ...state.list }, total: Math.round(plan.total),
    origin: state.origin, destination: destinationName(), shoppingDate: state.shoppingDate || todayInputValue(), mode: state.mode, date: Date.now()
  };
  persist();
  $('#saved-plan').hidden = false;
  announce('Planejamento confirmado e salvo nesta sessão.');
}

function confirmClear(trigger) {
  const data = trigger.id === 'clear-data';
  $('#confirm-title').textContent = data ? 'Limpar os dados do protótipo?' : 'Limpar toda a lista?';
  $('#confirm-text').textContent = data ? 'Lista, preferências, favoritos, relatos e planejamento desta sessão serão apagados.' :
    'Todos os itens da lista serão removidos.';
  const accept = $('#confirm-dialog .danger-fill');
  accept.value = data ? 'reset' : 'clear';
  accept.textContent = data ? 'Limpar dados' : 'Limpar lista';
  showDialog('#confirm-dialog', trigger);
}

function closeConfirm() {
  const dialog = $('#confirm-dialog');
  if (dialog.returnValue === 'reset') {
    writeLocal('sessionStorage', storageKey, null);
    writeLocal('localStorage', storageKey + '-favorites', null);
    writeLocal('localStorage', storageKey + '-reading', null);
    writeLocal('localStorage', storageKey + '-dark', null);
    history.replaceState(null, '', '#inicio');
    location.reload();
    return;
  }
  if (dialog.returnValue === 'clear') {
    clearUndo();
    state.list = {};
    state.selected = null;
    changeList('Lista limpa.', '#search', false);
    return;
  }
  dialogTriggers.get(dialog)?.focus();
}

function screenClick(event) {
  const mapControl = event.target.closest('[data-map-store], [data-map-choice]');
  if (mapControl) {
    event.preventDefault();
    mapStore = mapControl.dataset.mapStore ?? mapControl.dataset.mapChoice;
    const items = locationPage().page === 'rota' ? routePlan()?.items ?? [] : visibleHomeOffers(homeOffers());
    document.querySelectorAll('[data-map-store]').forEach(marker => marker.classList.toggle('pin-selected', marker.dataset.mapStore === mapStore));
    document.querySelectorAll('[data-map-choice]').forEach(button => button.setAttribute('aria-pressed', button.dataset.mapChoice === mapStore));
    $('#map-selection').innerHTML = mapSelection(mapStore, items);
    return;
  }
  const point = event.target.closest('[data-chart-point]');
  if (point) return inspectHistory(point.dataset.chartPoint);
  const suggestion = event.target.closest('[data-suggest]');
  if (suggestion) return chooseSuggestion(suggestion.dataset.suggest);
  const link = event.target.closest('a[href^="#produto/"]');
  const details = link?.closest('[data-offers]');
  if (details) comparisonReturn = { id: details.dataset.offers, link: link.hash };
  const button = event.target.closest('button');
  if (!button) return;
  const { homeCategory: category, homeProduct: product, homeFilter: filter, homeAdd, period } = button.dataset;
  if (category) {
    homeCategory = category;
    homeProduct = '';
    return updateHome(`[data-home-category="${category}"]`);
  }
  if (product) {
    homeProduct = product === 'all' ? '' : product;
    return updateHome(`[data-home-product="${product}"]`);
  }
  if (filter) {
    if (Object.hasOwn(homeOrders, filter)) homeOrder = homeOrder === filter ? '' : filter;
    else if (homeFilters.has(filter)) homeFilters.delete(filter);
    else homeFilters.add(filter);
    return updateHome(`[data-home-filter="${filter}"]`);
  }
  if (homeAdd) {
    homeAdded = homeAdd;
    return addProducts([homeAdd.split('/')[0]], `[data-home-add="${homeAdd}"]`);
  }
  if (period) {
    historyPeriod = Number(period);
    $('#history-chart').innerHTML = historyChart(locationPage().offer);
    document.querySelectorAll('[data-period]').forEach(control => control.setAttribute('aria-pressed', control === button));
    return announce('Histórico de ' + historyPeriod + ' dias atualizado.');
  }
  const { add, qty, delta, remove, favorite, select, route } = button.dataset;
  if (add) return addProducts([add], `[data-add="${add}"]`);
  if (qty) return adjustQuantity(qty, delta, button);
  if (remove) return removeItem(remove);
  if (favorite) return favoriteStore(favorite);
  if (select || route) return selectPlan(select || route, Boolean(route));
  switch (button.id) {
    case 'compare': navigate('comparar'); break;
    case 'clear': confirmClear(button); break;
    case 'locate': locate(); break;
    case 'report': showReport(button); break;
    case 'copy': copyPlan(); break;
    case 'save': confirmPlan(); break;
    case 'reset-filters':
      state.filters = { ...defaults };
      state.saved = null;
      update('Filtros padrão restaurados.', '#priority');
      break;
  }
}

function screenChange(event) {
  const { id, dataset, value, checked } = event.target;
  if (id === 'same-destination' || id === 'destination') return changeDestination(event.target);
  if (id === 'origin') return changeOrigin();
  if (id === 'shopping-date') {
    const input = event.target;
    if (value && !input.validity.valid) {
      input.value = state.shoppingDate || todayInputValue();
      announce('Escolha a data de hoje ou uma data futura.');
      return;
    }
    state.shoppingDate = value;
    if (!value) input.value = todayInputValue();
    state.saved = null;
    persist();
    announce('Data da compra atualizada. A comparação vai usar a validade nessa data.');
    return;
  }
  if (id === 'priority') {
    state.priority = value;
    return update('Comparação ordenada por: ' + priorities[value] + '.', '#priority');
  }
  if (id === 'mode') {
    state.mode = value;
    state.saved = null;
    return update('Transporte atualizado. Custo total estimado: ' + money(routePlan()?.total ?? null) + '.', '#mode');
  }
  if (id === 'radius' || dataset.filter) {
    if (id === 'radius') state.filters.radius = Number(value);
    else state.filters[dataset.filter] = checked;
    state.saved = null;
    persist();
    announce('Preferências de busca atualizadas.');
  }
}

function toggleReading() {
  state.reading = !state.reading;
  applyReading();
  writeLocal('localStorage', storageKey + '-reading', state.reading);
  announce(state.reading ? 'Leitura ampliada ativada.' : 'Leitura padrão ativada.');
}

function applyReading() {
  document.documentElement.classList.toggle('reading', state.reading);
  $('#reading').setAttribute('aria-pressed', state.reading);
}

function applyTheme() {
  document.documentElement.classList.toggle('dark', state.dark);
  $('#theme').textContent = state.dark ? 'Modo Claro' : 'Modo Escuro';
  $('meta[name="theme-color"]').content = state.dark ? '#121b16' : '#166534';
}

function alignNavigation() {
  const nav = $('.site-nav');
  if (matchMedia('(max-width: 639px)').matches) {
    if ($('.site-footer').nextElementSibling !== nav) $('.site-footer').after(nav);
  } else if ($('#conteudo').previousElementSibling !== nav) {
    $('#conteudo').before(nav);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const screen = $('#screen');
  screen.addEventListener('click', screenClick);
  screen.addEventListener('change', screenChange);
  screen.addEventListener('input', event => {
    if (event.target.id === 'search') {
      $('#search-error').hidden = true;
      event.target.removeAttribute('aria-invalid');
      showSuggestions();
    }
    if (event.target.id === 'home-query') homeQuery = event.target.value;
    if (event.target.id === 'history-day') inspectHistory(event.target.value);
    if (event.target.id === 'destination') changeDestination(event.target);
    if (['consumption', 'fuel'].includes(event.target.id)) setEstimate(event);
  });
  screen.addEventListener('keydown', event => { if (event.target.id === 'search') searchKey(event); });
  screen.addEventListener('pointerdown', event => { if (event.target.closest('[data-suggest]')) event.preventDefault(); });
  screen.addEventListener('focusout', event => { if (event.target.id === 'search') closeSuggestions(); });
  screen.addEventListener('submit', event => {
    event.preventDefault();
    if (event.target.id === 'add-form') readSearch();
    if (event.target.id === 'home-search') submitHomeSearch();
  });
  screen.addEventListener('toggle', event => {
    const id = event.target.dataset.offers;
    if (!id || !event.target.isConnected) return;
    if (event.target.open) expandedPlans.add(id);
    else expandedPlans.delete(id);
  }, true);
  $('.skip').addEventListener('click', event => {
    event.preventDefault();
    $('#conteudo').focus();
  });
  $('#reading').addEventListener('click', toggleReading);
  $('#theme').addEventListener('click', () => {
    state.dark = !state.dark;
    applyTheme();
    writeLocal('localStorage', storageKey + '-dark', state.dark);
    announce(state.dark ? 'Modo escuro ativado.' : 'Modo claro ativado.');
  });
  $('#undo').addEventListener('click', () => {
    const action = undoAction;
    clearUndo();
    action?.();
  });
  $('#clear-data').addEventListener('click', event => confirmClear(event.currentTarget));
  $('#confirm-dialog').addEventListener('close', closeConfirm);
  $('#report-dialog').addEventListener('close', event => dialogTriggers.get(event.target)?.focus());
  $('#report-cancel').addEventListener('click', () => $('#report-dialog').close());
  $('#report-edit').addEventListener('click', () => editReport());
  $('#report-form').addEventListener('submit', event => {
    event.preventDefault();
    submitReport();
  });
  window.addEventListener('hashchange', () => {
    document.querySelector('dialog[open]')?.close();
    homeAdded = null;
    mapStore = null;
    render({ focus: true });
  });
  matchMedia('(max-width: 639px)').addEventListener('change', alignNavigation);
  alignNavigation();
  applyReading();
  applyTheme();
  if (!location.hash) history.replaceState(null, '', '#inicio');
  persist();
  render();
});
