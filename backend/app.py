from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["https://aktra-dev.github.io", "http://127.0.0.1:5500", "http://localhost:5500"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

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
# AUTH
# =========================
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email dan password wajib diisi"}), 400

    try:
        res = supabase.auth.sign_up({"email": email, "password": password})
        return jsonify({"message": "Registrasi berhasil, cek email untuk verifikasi"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email dan password wajib diisi"}), 400

    try:
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return jsonify({
            "access_token": res.session.access_token,
            "user": {"email": res.user.email, "id": str(res.user.id)}
        })
    except Exception as e:
        return jsonify({"error": "Email atau password salah"}), 401

# =========================
# MIDDLEWARE CEK TOKEN
# =========================
def get_user_from_token():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        user = supabase.auth.get_user(token)
        return user
    except:
        return None

# =========================
# API AI
# =========================
@app.route("/api/deskripsi-produk", methods=["POST"])
def deskripsi_produk():
    if not get_user_from_token():
        return jsonify({"error": "Unauthorized"}), 401

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
    if not get_user_from_token():
        return jsonify({"error": "Unauthorized"}), 401

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
    if not get_user_from_token():
        return jsonify({"error": "Unauthorized"}), 401

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
    if not get_user_from_token():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    hasil = tanya_ai(data.get("pesan"))
    return jsonify({"hasil": hasil})

if __name__ == "__main__":
    app.run(debug=True, port=5000)