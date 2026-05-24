from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def tanya_ai(prompt):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "Kamu adalah asisten AI untuk pelaku UMKM Indonesia. Berikan saran yang praktis, singkat, dan mudah dipahami dalam Bahasa Indonesia."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    return response.choices[0].message.content

# =========================
# FRONTEND ROUTE
# =========================
@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/style.css")
def style():
    return send_from_directory(".", "style.css")

@app.route("/script.js")
def script():
    return send_from_directory(".", "script.js")

# =========================
# API
# =========================
@app.route("/api/deskripsi-produk", methods=["POST"])
def deskripsi_produk():
    data = request.json

    prompt = f"""
    Buatkan deskripsi produk:
    Nama: {data.get('nama_produk')}
    Kategori: {data.get('kategori')}
    Keunggulan: {data.get('keunggulan')}

    Buat versi pendek dan panjang.
    """

    hasil = tanya_ai(prompt)
    return jsonify({"hasil": hasil})

@app.route("/api/strategi-promosi", methods=["POST"])
def strategi_promosi():
    data = request.json

    prompt = f"""
    Produk: {data.get('nama_produk')}
    Target pasar: {data.get('target_pasar')}
    Budget: {data.get('budget')}

    Berikan strategi promosi untuk Instagram, TikTok, dan WhatsApp.
    """

    hasil = tanya_ai(prompt)
    return jsonify({"hasil": hasil})

@app.route("/api/analisis-harga", methods=["POST"])
def analisis_harga():
    data = request.json

    prompt = f"""
    Produk: {data.get('nama_produk')}
    Modal: Rp {data.get('modal')}
    Harga kompetitor: Rp {data.get('harga_kompetitor')}

    Berikan rekomendasi harga jual dan margin keuntungan.
    """

    hasil = tanya_ai(prompt)
    return jsonify({"hasil": hasil})

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json

    hasil = tanya_ai(data.get("pesan"))
    return jsonify({"hasil": hasil})

if __name__ == "__main__":
    app.run(debug=True, port=5000)