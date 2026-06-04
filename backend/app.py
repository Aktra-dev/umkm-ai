from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from supabase import create_client
from dotenv import load_dotenv
import os
import bcrypt
import jwt
import datetime

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "OPTIONS"])

JWT_SECRET = os.getenv("JWT_SECRET", "umkm-ai-secret-key-2024")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return response

def tanya_ai(prompt):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Kamu adalah asisten AI untuk pelaku UMKM Indonesia. Berikan saran yang praktis, singkat, dan mudah dipahami dalam Bahasa Indonesia."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

def get_user_from_token():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except:
        return None

# =========================
# AUTH
# =========================
@app.route("/api/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email dan password wajib diisi"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password minimal 6 karakter"}), 400

    try:
        # Cek email sudah ada
        existing = supabase.table("users").select("id").eq("email", email).execute()
        if existing.data:
            return jsonify({"error": "Email sudah terdaftar"}), 400

        # Hash password
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        # Simpan ke database
        supabase.table("users").insert({
            "email": email,
            "password_hash": password_hash
        }).execute()

        return jsonify({"message": "Registrasi berhasil! Silakan login."})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email dan password wajib diisi"}), 400

    try:
        # Cari user
        result = supabase.table("users").select("*").eq("email", email).execute()
        if not result.data:
            return jsonify({"error": "Email atau password salah"}), 401

        user = result.data[0]

        # Cek password
        if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return jsonify({"error": "Email atau password salah"}), 401

        # Buat JWT token
        payload = {
            "user_id": user["id"],
            "email": user["email"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

        return jsonify({
            "access_token": token,
            "user": {"email": user["email"], "id": str(user["id"])}
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 401

# =========================
# API AI
# =========================
@app.route("/api/deskripsi-produk", methods=["POST", "OPTIONS"])
def deskripsi_produk():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    if not get_user_from_token():
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    prompt = f"Buatkan deskripsi produk:\nNama: {data.get('nama_produk')}\nKategori: {data.get('kategori')}\nKeunggulan: {data.get('keunggulan')}\nBuat versi pendek dan panjang."
    return jsonify({"hasil": tanya_ai(prompt)})

@app.route("/api/strategi-promosi", methods=["POST", "OPTIONS"])
def strategi_promosi():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    if not get_user_from_token():
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    prompt = f"Produk: {data.get('nama_produk')}\nTarget pasar: {data.get('target_pasar')}\nBudget: {data.get('budget')}\nBerikan strategi promosi untuk Instagram, TikTok, dan WhatsApp."
    return jsonify({"hasil": tanya_ai(prompt)})

@app.route("/api/analisis-harga", methods=["POST", "OPTIONS"])
def analisis_harga():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    if not get_user_from_token():
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    prompt = f"Produk: {data.get('nama_produk')}\nModal: Rp {data.get('modal')}\nHarga kompetitor: Rp {data.get('harga_kompetitor')}\nBerikan rekomendasi harga jual dan margin keuntungan."
    return jsonify({"hasil": tanya_ai(prompt)})

@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    if not get_user_from_token():
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    return jsonify({"hasil": tanya_ai(data.get("pesan"))})

if __name__ == "__main__":
    app.run(debug=True, port=5000)