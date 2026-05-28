const API_URL = "https://umkm-ai-production.up.railway.app";

// ======================
// NAVIGATION
// ======================
function showSection(id, btn) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });

  const target = document.getElementById(id);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.classList.remove("active");
  });

  if (btn) {
    btn.classList.add("active");
  }

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
  const menu = document.getElementById("mobileMenu");

  if (menu) {
    menu.classList.toggle("open");
  }
}

// ======================
// TOAST
// ======================
function showToast(text) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.innerText = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ======================
// ESCAPE HTML
// ======================
function escapeHTML(str) {
  if (!str) return "";

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ======================
// COPY RESULT
// ======================
async function copyResult(id) {
  const el = document.getElementById(id);

  if (!el) return;

  const text = el.innerText;

  try {
    await navigator.clipboard?.writeText(text);
    showToast("Berhasil dicopy");
  } catch {
    showToast("Gagal copy");
  }
}

// ======================
// DOWNLOAD RESULT
// ======================
function downloadResult(id, filename) {
  const el = document.getElementById(id);

  if (!el) return;

  const text = el.innerText;

  const blob = new Blob([text], {
    type: "text/plain"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = `${filename}.txt`;

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

// ======================
// RESULT UI
// ======================
function setLoading(outputId, resultId) {
  const result = document.getElementById(resultId);
  const output = document.getElementById(outputId);

  if (!result || !output) return;

  result.classList.remove("hidden");

  output.innerHTML = `
    <div class="skeleton"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>
  `;
}

function setResult(outputId, text) {
  const output = document.getElementById(outputId);

  if (!output) return;

  const safe = escapeHTML(text);

  const html = safe
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  output.innerHTML = html;
}

// ======================
// HISTORY
// ======================
function saveHistory(type, preview) {
  const history = JSON.parse(
    localStorage.getItem("umkm_history") || "[]"
  );

  history.unshift({
    type,
    full: preview,
    preview:
      preview.length > 80
        ? preview.substring(0, 80) + "..."
        : preview,
    time: new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  // max 10
  if (history.length > 10) {
    history.pop();
  }

  localStorage.setItem(
    "umkm_history",
    JSON.stringify(history)
  );

  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(
    localStorage.getItem("umkm_history") || "[]"
  );

  const list = document.getElementById("historyList");

  if (!list) return;

  if (history.length === 0) {
    list.innerHTML = `
      <div class="history-empty">
        Belum ada riwayat. Mulai generate sekarang!
      </div>
    `;
    return;
  }

  list.innerHTML = history.map((item, index) => `
    <div
      class="history-item"
      onclick="lihatHistory(${index})"
      style="cursor:pointer"
    >
      <span class="history-type">${item.type}</span>
      <span class="history-preview">${escapeHTML(item.preview)}</span>
      <span class="history-time">${item.time}</span>
    </div>
  `).join("");
}

function lihatHistory(index) {
  const history = JSON.parse(
    localStorage.getItem("umkm_history") || "[]"
  );

  const item = history[index];

  if (!item) return;

  const map = {
    Deskripsi: "deskripsi",
    Promosi: "promosi",
    Harga: "harga",
    Konten: "konten"
  };

  const outputMap = {
    Deskripsi: "dp-output",
    Promosi: "sp-output",
    Harga: "ah-output",
    Konten: "ik-output"
  };

  const resultMap = {
    Deskripsi: "dp-result",
    Promosi: "sp-result",
    Harga: "ah-result",
    Konten: "ik-result"
  };

  const section = map[item.type];
  const outputId = outputMap[item.type];
  const resultId = resultMap[item.type];

  if (!section) return;

  showSection(
    section,
    document.querySelector(`[data-section=${section}]`)
  );

  setTimeout(() => {
    const result = document.getElementById(resultId);

    if (result) {
      result.classList.remove("hidden");
    }

    setResult(outputId, item.full);
  }, 100);
}

// ======================
// API HELPER
// ======================
async function postData(endpoint, body) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("API Error");
  }

  return await res.json();
}

// ======================
// GENERATE DESKRIPSI
// ======================
async function generateDeskripsi() {
  const nama = document.getElementById("dp-nama")?.value;
  const kategori = document.getElementById("dp-kategori")?.value;
  const keunggulan = document.getElementById("dp-keunggulan")?.value;

  if (!nama || !kategori || !keunggulan) {
    showToast("Isi semua field wajib");
    return;
  }

  setLoading("dp-output", "dp-result");

  try {
    const data = await postData(
      "/api/deskripsi-produk",
      {
        nama_produk: nama,
        kategori,
        keunggulan
      }
    );

    setResult("dp-output", data.hasil);

    saveHistory(
      "Deskripsi",
      data.hasil
    );

  } catch {
    setResult(
      "dp-output",
      "Terjadi error"
    );
  }
}

// ======================
// GENERATE PROMOSI
// ======================
async function generatePromosi() {
  const nama = document.getElementById("sp-nama")?.value;
  const target = document.getElementById("sp-target")?.value;
  const budget = document.getElementById("sp-budget")?.value;

  if (!nama || !target || !budget) {
    showToast("Isi semua field wajib");
    return;
  }

  setLoading("sp-output", "sp-result");

  try {
    const data = await postData(
      "/api/strategi-promosi",
      {
        nama_produk: nama,
        target_pasar: target,
        budget
      }
    );

    setResult("sp-output", data.hasil);

    saveHistory(
      "Promosi",
      data.hasil
    );

  } catch {
    setResult(
      "sp-output",
      "Terjadi error"
    );
  }
}

// ======================
// GENERATE HARGA
// ======================
async function generateHarga() {
  const nama = document.getElementById("ah-nama")?.value;
  const modal = document.getElementById("ah-modal")?.value;
  const kompetitor = document.getElementById("ah-kompetitor")?.value;

  if (!nama || !modal || !kompetitor) {
    showToast("Isi semua field wajib");
    return;
  }

  setLoading("ah-output", "ah-result");

  try {
    const data = await postData(
      "/api/analisis-harga",
      {
        nama_produk: nama,
        modal,
        harga_kompetitor: kompetitor
      }
    );

    setResult("ah-output", data.hasil);

    saveHistory(
      "Harga",
      data.hasil
    );

  } catch {
    setResult(
      "ah-output",
      "Terjadi error"
    );
  }
}

// ======================
// GENERATE KONTEN
// ======================
async function generateKonten() {
  const nama =
    document.getElementById("ik-nama")?.value;

  const platform =
    document.getElementById("ik-platform")?.value;

  const tone =
    document.getElementById("ik-tone")?.value;

  const audiens =
    document.getElementById("ik-audiens")?.value;

  if (!nama || !platform) {
    showToast("Isi field wajib");
    return;
  }

  setLoading("ik-output", "ik-result");

  try {
    const data = await postData(
      "/api/chat",
      {
        pesan:
          `Buatkan ide konten dan caption untuk produk "${nama}" di platform ${platform}. Tone: ${tone || "santai"}. Target audiens: ${audiens || "umum"}. Sertakan caption, hashtag, dan 3 ide konten kreatif.`
      }
    );

    setResult("ik-output", data.hasil);

    saveHistory(
      "Konten",
      data.hasil
    );

  } catch {
    setResult(
      "ik-output",
      "Terjadi error. Pastikan backend berjalan."
    );
  }
}

// ======================
// CHAT AI
// ======================
async function kirimChat() {
  const input =
    document.getElementById("chatInput");

  if (!input) return;

  const pesan = input.value.trim();

  if (!pesan) return;

  const chat =
    document.getElementById("chatMessages");

  if (!chat) return;

  // USER
  chat.innerHTML += `
    <div class="chat-bubble user">
      <div class="bubble-icon">👤</div>
      <div class="bubble-text">
        ${escapeHTML(pesan)}
      </div>
    </div>
  `;

  input.value = "";

  // LOADING
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
    const data = await postData(
      "/api/chat",
      { pesan }
    );

    document.getElementById(
      "typingBubble"
    )?.remove();

    chat.innerHTML += `
      <div class="chat-bubble ai">
        <div class="bubble-icon">⬡</div>
        <div class="bubble-text">
          ${escapeHTML(data.hasil).replace(/\n/g, "<br>")}
        </div>
      </div>
    `;

    chat.scrollTop = chat.scrollHeight;

  } catch {

    document.getElementById(
      "typingBubble"
    )?.remove();

    chat.innerHTML += `
      <div class="chat-bubble ai">
        <div class="bubble-icon">⚠</div>
        <div class="bubble-text">
          Terjadi error
        </div>
      </div>
    `;
  }
}

// ======================
// RESET FORM
// ======================
function resetForm(type) {
  const fields = {
    deskripsi: [
      "dp-nama",
      "dp-kategori",
      "dp-keunggulan",
      "dp-target",
      "dp-harga"
    ],

    promosi: [
      "sp-nama",
      "sp-target",
      "sp-budget",
      "sp-platform"
    ],

    harga: [
      "ah-nama",
      "ah-modal",
      "ah-kompetitor",
      "ah-keterangan"
    ],

    konten: [
      "ik-nama",
      "ik-platform",
      "ik-tone",
      "ik-audiens"
    ]
  };

  fields[type]?.forEach(id => {
    const el = document.getElementById(id);

    if (el) {
      el.value = "";
    }
  });

  const resultMap = {
    deskripsi: "dp-result",
    promosi: "sp-result",
    harga: "ah-result",
    konten: "ik-result"
  };

  const result =
    document.getElementById(resultMap[type]);

  if (result) {
    result.classList.add("hidden");
  }

  showToast("Form direset");
}

// ======================
// RANDOM EXAMPLE
// ======================
function randomExample(type) {
  const examples = {
    deskripsi: {
      "dp-nama": "Keripik Tempe Pedas",
      "dp-kategori": "Makanan Ringan",
      "dp-keunggulan":
        "Renyah, pedas level 1-5, tanpa pengawet, kemasan premium",
      "dp-target":
        "Mahasiswa, anak muda",
      "dp-harga":
        "Rp 15.000"
    },

    promosi: {
      "sp-nama":
        "Keripik Tempe Pedas",
      "sp-target":
        "Mahasiswa usia 18-25 tahun",
      "sp-budget":
        "Rp 500.000/bulan",
      "sp-platform":
        "Instagram, TikTok"
    },

    harga: {
      "ah-nama":
        "Keripik Tempe Pedas",
      "ah-modal":
        "5000",
      "ah-kompetitor":
        "12000",
      "ah-keterangan":
        "Produk premium, kemasan menarik"
    },

    konten: {
      "ik-nama":
        "Keripik Tempe Pedas",
      "ik-platform":
        "Instagram, TikTok",
      "ik-tone":
        "Santai dan lucu",
      "ik-audiens":
        "Anak muda 18-25 tahun"
    }
  };

  const data = examples[type];

  if (!data) return;

  Object.entries(data).forEach(([id, val]) => {
    const el = document.getElementById(id);

    if (el) {
      el.value = val;
    }
  });

  showToast("Contoh berhasil diisi");
}

// ======================
// CLEAR HISTORY
// ======================
function clearHistory() {
  localStorage.removeItem("umkm_history");

  const historyList =
    document.getElementById("historyList");

  if (historyList) {
    historyList.innerHTML = `
      <div class="history-empty">
        Belum ada riwayat. Mulai generate sekarang!
      </div>
    `;
  }

  showToast("Riwayat dihapus");
}

// ======================
// NAVBAR SCROLL
// ======================
const navbar =
  document.getElementById("navbar");

const backToTop =
  document.getElementById("backToTop");

window.addEventListener("scroll", () => {

  if (navbar) {
    navbar.classList.toggle(
      "scrolled",
      window.scrollY > 10
    );
  }

  if (backToTop) {
    backToTop.classList.toggle(
      "show",
      window.scrollY > 300
    );
  }
});

// ======================
// ANIMATED COUNTER
// ======================
function animateCounter(el, target) {
  let current = 0;

  const step = Math.ceil(target / 60);

  const timer = setInterval(() => {

    current = Math.min(
      current + step,
      target
    );

    el.textContent = current;

    if (current >= target) {
      clearInterval(timer);
    }

  }, 16);
}

document.querySelectorAll(".stat-value")
  .forEach(el => {

    const target = parseInt(
      el.dataset.target
    );

    if (!isNaN(target)) {
      animateCounter(el, target);
    }
  });

// ======================
// INIT
// ======================
renderHistory();