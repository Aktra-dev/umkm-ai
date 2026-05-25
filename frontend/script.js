const API_URL = "https://umkm-ai-production.up.railway.app";

// ======================
// NAVIGATION
// ======================
function showSection(id, btn) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.classList.remove("active");
  });

  if (btn) btn.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ======================
// DARK MODE
// ======================
function toggleDark() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");

  html.setAttribute(
    "data-theme",
    current === "dark" ? "light" : "dark"
  );
}

// ======================
// MOBILE MENU
// ======================
function toggleMobileMenu() {
  document.getElementById("mobileMenu")
    .classList.toggle("open");
}

// ======================
// TOAST
// ======================
function showToast(text) {
  const toast = document.getElementById("toast");

  toast.innerText = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ======================
// COPY RESULT
// ======================
function copyResult(id) {
  const text = document.getElementById(id).innerText;

  navigator.clipboard.writeText(text);

  showToast("Berhasil dicopy");
}

// ======================
// DOWNLOAD RESULT
// ======================
function downloadResult(id, filename) {
  const text = document.getElementById(id).innerText;

  const blob = new Blob([text], {
    type: "text/plain"
  });

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = `${filename}.txt`;

  a.click();
}

// ======================
// RESULT UI
// ======================
function setLoading(outputId, resultId) {
  document.getElementById(resultId)
    .classList.remove("hidden");

  document.getElementById(outputId).innerHTML = `
    <div class="skeleton"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>
  `;
}

function setResult(outputId, text) {
  document.getElementById(outputId).innerText = text;
}
// ======================
// HISTORY
// ======================
function saveHistory(type, preview) {
  const history = JSON.parse(localStorage.getItem('umkm_history') || '[]');
  
  history.unshift({
    type,
    preview: preview.substring(0, 80) + '...',
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  });

  // Simpan max 10 riwayat
  if (history.length > 10) history.pop();

  localStorage.setItem('umkm_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('umkm_history') || '[]');
  const list = document.getElementById('historyList');

  if (history.length === 0) {
    list.innerHTML = '<div class="history-empty">Belum ada riwayat. Mulai generate sekarang!</div>';
    return;
  }

  list.innerHTML = history.map(item => `
    <div class="history-item">
      <span class="history-type">${item.type}</span>
      <span class="history-preview">${item.preview}</span>
      <span class="history-time">${item.time}</span>
    </div>
  `).join('');
}

// Load history saat halaman dibuka
renderHistory();
// ======================
// GENERATE DESKRIPSI
// ======================
async function generateDeskripsi() {

  const nama = document.getElementById("dp-nama").value;
  const kategori = document.getElementById("dp-kategori").value;
  const keunggulan = document.getElementById("dp-keunggulan").value;

  if (!nama || !kategori || !keunggulan) {
    showToast("Isi semua field wajib");
    return;
  }

  setLoading("dp-output", "dp-result");

  try {

    const res = await fetch(`${API_URL}/api/deskripsi-produk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nama_produk: nama,
        kategori,
        keunggulan
      })
    });

    const data = await res.json();

    setResult("dp-output", data.hasil);
    saveHistory("Deskripsi", data.hasil);

  } catch (err) {

    setResult("dp-output", "Terjadi error");
  }
}

// ======================
// GENERATE PROMOSI
// ======================
async function generatePromosi() {

  const nama = document.getElementById("sp-nama").value;
  const target = document.getElementById("sp-target").value;
  const budget = document.getElementById("sp-budget").value;

  setLoading("sp-output", "sp-result");

  try {

    const res = await fetch(`${API_URL}/api/strategi-promosi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nama_produk: nama,
        target_pasar: target,
        budget
      })
    });

    const data = await res.json();

    setResult("sp-output", data.hasil);

  } catch (err) {

    setResult("sp-output", "Terjadi error");
  }
}

// ======================
// GENERATE HARGA
// ======================
async function generateHarga() {

  const nama = document.getElementById("ah-nama").value;
  const modal = document.getElementById("ah-modal").value;
  const kompetitor = document.getElementById("ah-kompetitor").value;

  setLoading("ah-output", "ah-result");

  try {

    const res = await fetch(`${API_URL}/api/analisis-harga`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nama_produk: nama,
        modal,
        harga_kompetitor: kompetitor
      })
    });

    const data = await res.json();

    setResult("ah-output", data.hasil);

  } catch (err) {

    setResult("ah-output", "Terjadi error");
  }
}

// ======================
// CHAT AI
// ======================
async function kirimChat() {

  const input = document.getElementById("chatInput");

  const pesan = input.value.trim();

  if (!pesan) return;

  const chat = document.getElementById("chatMessages");

  chat.innerHTML += `
    <div class="chat-bubble user">
      <div class="bubble-icon">👤</div>
      <div class="bubble-text">${pesan}</div>
    </div>
  `;

  input.value = "";

  chat.innerHTML += `
    <div class="chat-bubble ai" id="typingBubble">
      <div class="bubble-icon">⬡</div>
      <div class="bubble-text">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `;

  chat.scrollTop = chat.scrollHeight;

  try {

    const res = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pesan
      })
    });

    const data = await res.json();

    document.getElementById("typingBubble").remove();

    chat.innerHTML += `
      <div class="chat-bubble ai">
        <div class="bubble-icon">⬡</div>
        <div class="bubble-text">${data.hasil}</div>
      </div>
    `;

    chat.scrollTop = chat.scrollHeight;

  } catch (err) {

    document.getElementById("typingBubble").remove();

    chat.innerHTML += `
      <div class="chat-bubble ai">
        <div class="bubble-icon">⚠</div>
        <div class="bubble-text">Terjadi error</div>
      </div>
    `;
  }
}
// ======================
// RESET FORM
// ======================
function resetForm(type) {
  const fields = {
    deskripsi: ['dp-nama', 'dp-kategori', 'dp-keunggulan', 'dp-target', 'dp-harga'],
    promosi:   ['sp-nama', 'sp-target', 'sp-budget', 'sp-platform'],
    harga:     ['ah-nama', 'ah-modal', 'ah-kompetitor', 'ah-keterangan'],
    konten:    ['ik-nama', 'ik-platform', 'ik-tone', 'ik-audiens'],
  };

  fields[type].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const resultMap = {
    deskripsi: 'dp-result',
    promosi:   'sp-result',
    harga:     'ah-result',
    konten:    'ik-result',
  };

  document.getElementById(resultMap[type]).classList.add('hidden');
  showToast('Form direset');
}

// ======================
// RANDOM EXAMPLE
// ======================
function randomExample(type) {
  const examples = {
    deskripsi: {
      'dp-nama':      'Keripik Tempe Pedas',
      'dp-kategori':  'Makanan Ringan',
      'dp-keunggulan':'Renyah, pedas level 1-5, tanpa pengawet, kemasan premium',
      'dp-target':    'Mahasiswa, anak muda',
      'dp-harga':     'Rp 15.000',
    },
    promosi: {
      'sp-nama':     'Keripik Tempe Pedas',
      'sp-target':   'Mahasiswa usia 18-25 tahun',
      'sp-budget':   'Rp 500.000/bulan',
      'sp-platform': 'Instagram, TikTok',
    },
    harga: {
      'ah-nama':       'Keripik Tempe Pedas',
      'ah-modal':      '5000',
      'ah-kompetitor': '12000',
      'ah-keterangan': 'Produk premium, kemasan menarik',
    },
    konten: {
      'ik-nama':     'Keripik Tempe Pedas',
      'ik-platform': 'Instagram, TikTok',
      'ik-tone':     'Santai dan lucu',
      'ik-audiens':  'Anak muda 18-25 tahun',
    },
  };

  const data = examples[type];
  Object.entries(data).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  showToast('Contoh berhasil diisi');
}

// ======================
// GENERATE KONTEN
// ======================
async function generateKonten() {
  const nama     = document.getElementById('ik-nama').value;
  const platform = document.getElementById('ik-platform').value;
  const tone     = document.getElementById('ik-tone').value;
  const audiens  = document.getElementById('ik-audiens').value;

  if (!nama || !platform) { showToast('Isi field wajib'); return; }

  setLoading('ik-output', 'ik-result');

  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pesan: `Buatkan ide konten dan caption untuk produk "${nama}" di platform ${platform}. Tone: ${tone || 'santai'}. Target audiens: ${audiens || 'umum'}. Sertakan caption, hashtag, dan 3 ide konten kreatif.`
      })
    });
    const data = await res.json();
    setResult('ik-output', data.hasil);
  } catch {
    setResult('ik-output', 'Terjadi error. Pastikan backend berjalan.');
  }
}

// ======================
// CLEAR HISTORY
// ======================
function clearHistory() {
  localStorage.removeItem('umkm_history');
  document.getElementById('historyList').innerHTML =
    '<div class="history-empty">Belum ada riwayat. Mulai generate sekarang!</div>';
  showToast('Riwayat dihapus');
}

// ======================
// NAVBAR SCROLL
// ======================
window.addEventListener('scroll', () => {
  document.getElementById('navbar')
    .classList.toggle('scrolled', window.scrollY > 10);

  document.getElementById('backToTop')
    .classList.toggle('show', window.scrollY > 300);
});

// ======================
// ANIMATED COUNTER
// ======================
function animateCounter(el, target) {
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 16);
}

document.querySelectorAll('.stat-value').forEach(el => {
  animateCounter(el, parseInt(el.dataset.target));
});