# UMKM AI Assistant 🚀

Platform AI modern untuk membantu pelaku UMKM Indonesia berkembang dengan teknologi kecerdasan buatan.

## 👥 Tim Pengembang

| Nama | Role |
|------|------|
| Akbar Saputra | Backend Developer & AI Integration |
| Galih Adhi Rahmadhani | Frontend Developer & UI/UX |

## 📌 Deskripsi Project

UMKM AI Assistant adalah aplikasi web yang memanfaatkan AI (Groq API) untuk membantu pelaku UMKM dalam:
- Generate deskripsi produk yang menarik
- Menyusun strategi promosi di media sosial
- Menganalisis harga jual yang optimal
- Generate ide konten dan caption
- Konsultasi bisnis via AI Chat

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Python, Flask |
| AI Provider | Groq API (llama-3.1-8b-instant) |
| Deployment | Render (backend), GitHub Pages (frontend) |

## 🚀 Cara Menjalankan

### 1. Clone Repository
```bash
git clone https://github.com/Aktra-dev/umkm-ai.git
cd umkm-ai
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-cors groq python-dotenv
```

### 3. Buat file `.env` di folder `backend`
GROQ_API_KEY=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
### 4. Jalankan Backend
```bash
python app.py
```

### 5. Jalankan Frontend
Buka `frontend/index.html` dengan Live Server di VS Code.

## ✨ Fitur

- **Deskripsi Produk** — Generate deskripsi produk otomatis dengan AI
- **Strategi Promosi** — Saran promosi untuk Instagram, TikTok, WhatsApp
- **Analisis Harga** — Rekomendasi harga jual berdasarkan modal & kompetitor
- **Ide Konten** — Caption, hashtag, dan ide konten sosial media
- **AI Chat** — Tanya jawab bebas seputar bisnis UMKM
- **Dark Mode** — Tampilan gelap/terang
- **Riwayat Generate** — Tersimpan otomatis di browser

## 📁 Struktur Project
umkm-ai/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
## 🔗 Link

- GitHub: https://github.com/Aktra-dev/umkm-ai
- Demo: (link deploy menyusul)