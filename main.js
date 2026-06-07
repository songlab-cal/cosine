'use strict';

// ── VEP table data ─────────────────────────────────────────────────────────────

const ASSAYS = [
  'Koenig Exp(H)', 'Koenig Exp(L)', 'Adams',
  'Koenig Bind(H)', 'Koenig Bind(L)', 'Shaneh.119', 'Shaneh.120',
  'Petersen 319-345', 'Petersen 222-1C06'
];

const GROUPS = [
  { label: 'Expression',              cols: [0, 1, 2] },
  { label: 'Binding',                 cols: [3, 4, 5, 6] },
  { label: 'Binding · MAGMA-seq',     cols: [7, 8] },
];

const MODELS = [
  { name: 'AbLang-2',  data: [0.096, -0.127, -0.097, -0.090, -0.011,  0.253,  0.209,  0.199,  0.060] },
  { name: 'DASM',      data: [0.596,  0.474,  0.270,  0.415,  0.327,  0.450,  0.536,  0.395,  0.286] },
  { name: 'PRISM',     data: [0.069,  0.129,  0.297,  0.005,  0.061,  0.348,  0.286,  0.312, -0.073] },
  { name: 'ESM2-150M', data: [0.413,  0.485, -0.112,  0.112,  0.266,  0.236,  0.205,  0.250, -0.139] },
  { name: 'ESM2-650M', data: [0.326,  0.429,  0.124,  0.063,  0.265,  0.227,  0.360,  0.278,  0.013] },
  { name: 'ProGen2-S', data: [0.407,  0.513, -0.024,  0.098,  0.332,  0.119,  0.070,  0.329,  0.024] },
  { name: 'ProGen2-M', data: [0.392,  0.408,  0.231,  0.085,  0.235,  0.299,  0.319,  0.294,  0.036] },
  { name: 'CoSiNE',   data: [0.613,  0.508,  0.464,  0.456,  0.371,  0.498,  0.536,  0.504,  0.328] },
];

// ── Selection score chart data ────────────────────────────────────────────────

const SELECTION_ASSAYS = [
  'Koenig Exp(H)', 'Koenig Exp(L)', 'Adams',
  'Koenig Bind(H)', 'Koenig Bind(L)', 'Shaneh.119', 'Shaneh.120'
];

const SELECTION_DATA = {
  loglik:    [0.53, 0.45, 0.40, 0.34, 0.32, 0.46, 0.45],
  selection: [0.61, 0.51, 0.46, 0.46, 0.37, 0.50, 0.54],
};

// ── CDR optimization table data (Table 2) ─────────────────────────────────────
// "higher" = larger value is better; "lower" = smaller is better; "neutral" = unranked.

const CDR_COLUMNS = [
  { label: 'Unique',      arrow: '↑', dir: 'higher', digits: 3 },
  { label: 'Edist',       arrow: '',  dir: 'neutral', digits: 2 },
  { label: 'IntDiv',      arrow: '↑', dir: 'higher', digits: 2 },
  { label: 'OASis',       arrow: '↑', dir: 'higher', digits: 3 },
  { label: 'ΔBind Mean',  arrow: '↑', dir: 'higher', digits: 3 },
  { label: 'ΔBind Max',   arrow: '↑', dir: 'higher', digits: 3 },
  { label: 'N oracle',    arrow: '↓', dir: 'lower',  digits: 2 },
];

const CDR_ROWS = [
  // referenceOnly = excluded from ranking (Greedy is the unbounded upper bound)
  { name: 'Greedy*',       referenceOnly: true,  data: [0.996, 5.00, 6.21, 0.807, 0.385, 0.466, 2756.00] },
  { name: 'Genetic Algo',  referenceOnly: false, data: [0.991, 4.47, 7.30, 0.789, 0.196, 0.363, 4.81] },
  { name: 'AbLang-1-PoE',  referenceOnly: false, data: [0.999, 4.97, 7.71, 0.849, 0.167, 0.390, 0.58] },
  { name: 'ESM2-PoE',      referenceOnly: false, data: [1.000, 4.98, 8.47, 0.802, 0.149, 0.355, 0.58] },
  { name: 'CoSiNE',        referenceOnly: false, data: [0.988, 4.56, 6.83, 0.822, 0.198, 0.395, 5.00] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNum(v, digits) {
  if (v === null || v === undefined || Number.isNaN(v)) return '';
  // For very large numbers (e.g. 2756), drop trailing zeros to keep things tight.
  if (Math.abs(v) >= 100) return Math.round(v).toString();
  return v.toFixed(digits);
}

// ── VEP table ─────────────────────────────────────────────────────────────────

function buildVEPTable() {
  const table = document.getElementById('vepTable');
  if (!table) return;

  // Per-column ranks (descending — higher is better)
  const colCount = ASSAYS.length;
  const colSorted = Array.from({ length: colCount }, (_, ci) =>
    MODELS.map(m => m.data[ci]).sort((a, b) => b - a)
  );
  const isBold = (ci, val) => val === colSorted[ci][0];
  const isUnderline = (ci, val) => {
    const top = colSorted[ci][0];
    if (val === top) return false;
    const second = colSorted[ci].find(v => v !== top);
    return val === second;
  };

  const groupStarts = new Set(GROUPS.map(g => g.cols[0]));

  // Header rows
  const thead = document.createElement('thead');

  const groupRow = document.createElement('tr');
  groupRow.className = 'group-header';
  groupRow.appendChild(document.createElement('th'));
  GROUPS.forEach(g => {
    const th = document.createElement('th');
    th.colSpan = g.cols.length;
    th.textContent = g.label;
    if (groupStarts.has(g.cols[0])) th.classList.add('group-start');
    groupRow.appendChild(th);
  });
  thead.appendChild(groupRow);

  const assayRow = document.createElement('tr');
  const modelTh = document.createElement('th');
  modelTh.textContent = 'Model';
  modelTh.style.textAlign = 'left';
  assayRow.appendChild(modelTh);
  ASSAYS.forEach((name, ci) => {
    const th = document.createElement('th');
    th.textContent = name;
    if (groupStarts.has(ci)) th.classList.add('group-start');
    assayRow.appendChild(th);
  });
  thead.appendChild(assayRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  MODELS.forEach(model => {
    const tr = document.createElement('tr');
    if (model.name === 'CoSiNE') tr.classList.add('cosine-row');

    const nameTd = document.createElement('td');
    nameTd.textContent = model.name;
    tr.appendChild(nameTd);

    model.data.forEach((val, ci) => {
      const td = document.createElement('td');
      if (groupStarts.has(ci)) td.classList.add('group-start');
      const formatted = val.toFixed(3);

      if (isBold(ci, val)) {
        const b = document.createElement('strong');
        b.textContent = formatted;
        td.appendChild(b);
      } else if (isUnderline(ci, val)) {
        const u = document.createElement('u');
        u.textContent = formatted;
        td.appendChild(u);
      } else {
        td.textContent = formatted;
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

// ── CDR optimization table ────────────────────────────────────────────────────

function buildCDRTable() {
  const table = document.getElementById('cdrTable');
  if (!table) return;

  // Ranks computed only over budget-constrained rows (skip referenceOnly).
  const rankableRows = CDR_ROWS.filter(r => !r.referenceOnly);
  const colCount = CDR_COLUMNS.length;
  const colSorted = Array.from({ length: colCount }, (_, ci) => {
    const dir = CDR_COLUMNS[ci].dir;
    if (dir === 'neutral') return [];
    const vals = rankableRows.map(r => r.data[ci]);
    return vals.sort((a, b) => (dir === 'higher' ? b - a : a - b));
  });

  const isBold = (ci, row, val) => {
    if (row.referenceOnly) return false;
    if (CDR_COLUMNS[ci].dir === 'neutral') return false;
    return val === colSorted[ci][0];
  };
  const isUnderline = (ci, row, val) => {
    if (row.referenceOnly) return false;
    if (CDR_COLUMNS[ci].dir === 'neutral') return false;
    const top = colSorted[ci][0];
    if (val === top) return false;
    const second = colSorted[ci].find(v => v !== top);
    return val === second;
  };

  // Header
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const methodTh = document.createElement('th');
  methodTh.textContent = 'Method';
  methodTh.style.textAlign = 'left';
  headRow.appendChild(methodTh);
  CDR_COLUMNS.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c.label + (c.arrow ? ' ' + c.arrow : '');
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  CDR_ROWS.forEach(row => {
    const tr = document.createElement('tr');
    if (row.name === 'CoSiNE') tr.classList.add('cosine-row');
    if (row.referenceOnly) tr.classList.add('reference-row');

    const nameTd = document.createElement('td');
    nameTd.textContent = row.name;
    tr.appendChild(nameTd);

    row.data.forEach((val, ci) => {
      const td = document.createElement('td');
      const formatted = formatNum(val, CDR_COLUMNS[ci].digits);

      if (isBold(ci, row, val)) {
        const b = document.createElement('strong');
        b.textContent = formatted;
        td.appendChild(b);
      } else if (isUnderline(ci, row, val)) {
        const u = document.createElement('u');
        u.textContent = formatted;
        td.appendChild(u);
      } else {
        td.textContent = formatted;
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

// ── Selection score chart ─────────────────────────────────────────────────────

function buildSelectionChart() {
  const canvas = document.getElementById('selectionChart');
  if (!canvas) return;

  const groupBandPlugin = {
    id: 'groupBand',
    afterDraw(chart) {
      const { ctx, scales: { x, y } } = chart;
      const bottom = y.bottom;
      const bandH = 5;
      const groups = [
        { label: 'Expression', from: 0, to: 2 },
        { label: 'Binding',    from: 3, to: 6 },
      ];
      ctx.save();
      groups.forEach(g => {
        const x0 = x.getPixelForValue(g.from) - x.width / (SELECTION_ASSAYS.length * 2);
        const x1 = x.getPixelForValue(g.to)   + x.width / (SELECTION_ASSAYS.length * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x0, bottom + 1, x1 - x0, bandH);

        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(g.label, (x0 + x1) / 2, bottom + bandH + 9);
      });
      ctx.restore();
    }
  };

  new Chart(canvas, {
    type: 'bar',
    plugins: [groupBandPlugin],
    data: {
      labels: SELECTION_ASSAYS,
      datasets: [
        {
          label: 'Log-likelihood',
          data: SELECTION_DATA.loglik,
          backgroundColor: '#C9D9D2',
          borderColor: '#9FBDB0',
          borderWidth: 1,
        },
        {
          label: 'Selection score',
          data: SELECTION_DATA.selection,
          backgroundColor: '#1D9E75',
          borderColor: '#1D9E75',
          borderWidth: 1,
        },
      ]
    },
    options: {
      responsive: true,
      layout: { padding: { bottom: 20 } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          min: 0, max: 0.7,
          title: { display: true, text: 'Spearman ρ', font: { size: 11 }, color: '#6b7280' },
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: { font: { size: 11 } },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label(ctx) { return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}`; } }
        }
      },
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  buildVEPTable();
  buildCDRTable();
  buildSelectionChart();
});
