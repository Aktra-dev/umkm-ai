from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "OPTIONS"])

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

@app.route("/api/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email dan password wajib diisi"}), 400
    try:
        res = supabase.auth.sign_up({"email": email, "password": password})
        return jsonify({"message": "Registrasi berhasil"})
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
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return jsonify({
            "access_token": res.session.access_token,
            "user": {"email": res.user.email, "id": str(res.user.id)}
        })
    except Exception as e:
        return jsonify({"error": "Email atau password salah"}), 401

def get_user_from_token():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        return supabase.auth.get_user(token)
    except:
        return None

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