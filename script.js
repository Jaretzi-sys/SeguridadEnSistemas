// ─── STATE ───────────────────────────────────────────────
let currentMethod = 'cesar';
let shiftN = 3;
let charset = '';

const CHARSETS = {
  alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  alphanum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  printable: (()=>{
    let s='';
    for(let i=32;i<127;i++) s+=String.fromCharCode(i);
    return s;
  })()
};

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setCharset('alpha');
});

// ─── METHOD ───────────────────────────────────────────────
function setMethod(m) {
  currentMethod = m;
  document.getElementById('btn-cesar').classList.toggle('active', m==='cesar');
  document.getElementById('btn-atbash').classList.toggle('active', m==='atbash');
  document.getElementById('cesar-config').classList.toggle('visible', m==='cesar');
  document.getElementById('cesar-config').style.display = m==='cesar' ? 'block' : 'none';
  document.getElementById('atbash-info').style.display = m==='atbash' ? 'block' : 'none';
}

function updateShift(v) {
  shiftN = parseInt(v);
  document.getElementById('shift-display').textContent = v;
}

// ─── CHARSET ──────────────────────────────────────────────
function setCharset(type) {
  ['alpha','alphanum','printable','custom'].forEach(t => {
    document.getElementById('cs-'+t).classList.toggle('active', t===type);
  });
  document.getElementById('custom-charset-row').style.display = type==='custom' ? 'block' : 'none';
  if(type !== 'custom') {
    charset = CHARSETS[type];
  } else {
    charset = document.getElementById('custom-charset-input').value || CHARSETS.alpha;
  }
  renderCharsetPreview();
}

function updateCustomCharset() {
  charset = document.getElementById('custom-charset-input').value || CHARSETS.alpha;
  // Remove duplicates
  charset = [...new Set(charset.split(''))].join('');
  renderCharsetPreview();
}

function renderCharsetPreview() {
  const el = document.getElementById('charset-preview');
  const unique = [...new Set(charset.split(''))].join('');
  charset = unique;
  el.innerHTML = 'Conjunto (' + unique.length + ' chars): ' +
    unique.split('').map(c => `<span>${c==' '?'·':c}</span>`).join('');
}

// ─── CIPHER ALGORITHMS ────────────────────────────────────
function cesarEncrypt(text, shift, cs) {
  const n = cs.length;
  if(n === 0) return text;
  shift = ((shift % n) + n) % n;
  return text.split('').map(ch => {
    const idx = cs.indexOf(ch);
    if(idx === -1) return ch; // not in charset → keep as-is
    return cs[(idx + shift) % n];
  }).join('');
}

function cesarDecrypt(text, shift, cs) {
  return cesarEncrypt(text, -shift, cs);
}

function atbashCipher(text, cs) {
  const n = cs.length;
  if(n === 0) return text;
  return text.split('').map(ch => {
    const idx = cs.indexOf(ch);
    if(idx === -1) return ch;
    return cs[n - 1 - idx];
  }).join('');
}

// ─── PROCESS ──────────────────────────────────────────────
function process(mode) {
  const input = document.getElementById('input-text').value;
  if(!input.trim()) { showOutput(''); return; }

  let result;
  if(currentMethod === 'cesar') {
    result = mode === 'encrypt'
      ? cesarEncrypt(input, shiftN, charset)
      : cesarDecrypt(input, shiftN, charset);
  } else {
    // Atbash is its own inverse
    result = atbashCipher(input, charset);
  }
  showOutput(result);
}

function showOutput(text) {
  const box = document.getElementById('output-box');
  const ph = document.getElementById('output-placeholder');
  const cp = document.getElementById('copy-btn');
  if(!text) {
    ph.style.display = 'inline';
    cp.style.display = 'none';
    box.childNodes[0] && (box.childNodes[0].textContent = '');
    return;
  }
  ph.style.display = 'none';
  cp.style.display = 'block';
  // set text node
  let tn = box.querySelector('#result-text');
  if(!tn) {
    tn = document.createElement('span');
    tn.id = 'result-text';
    box.insertBefore(tn, box.firstChild);
  }
  tn.textContent = text;
}

function copyOutput() {
  const tn = document.getElementById('result-text');
  if(!tn) return;
  navigator.clipboard.writeText(tn.textContent).then(()=>{
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✓ COPIADO';
    setTimeout(()=>btn.textContent='COPIAR', 1500);
  });
}