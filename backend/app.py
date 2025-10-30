import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

# -----------------------------
# ⚙️ CONFIGURATION DE L’APP
# -----------------------------
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'votre_secret_super_securise')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'votre_jwt_secret')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///artgens.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app, resources={r"/api/*": {"origins": "*"}})
jwt = JWTManager(app)

# -----------------------------
# 👥 MODÈLES
# -----------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    is_artist = db.Column(db.Boolean, default=False)
    bio = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    artworks = db.relationship('Artwork', backref='artist', lazy=True)
    likes = db.relationship('Like', backref='user', lazy=True)
    comments = db.relationship('Comment', backref='user', lazy=True)
    cart_items = db.relationship('Cart', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


artwork_categories = db.Table(
    'artwork_categories',
    db.Column('artwork_id', db.Integer, db.ForeignKey('artwork.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('category.id'), primary_key=True)
)


class Artwork(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(200))
    is_sold = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    artist_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    categories = db.relationship('Category', secondary=artwork_categories, backref='artworks')
    likes = db.relationship('Like', backref='artwork', lazy=True)
    comments = db.relationship('Comment', backref='artwork', lazy=True)
    in_carts = db.relationship('Cart', backref='artwork', lazy=True)


class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    artwork_id = db.Column(db.Integer, db.ForeignKey('artwork.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    artwork_id = db.Column(db.Integer, db.ForeignKey('artwork.id'), nullable=False)


class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    artwork_id = db.Column(db.Integer, db.ForeignKey('artwork.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# -----------------------------
# 🧱 INITIALISATION DE LA DB
# -----------------------------
def init_db():
    with app.app_context():
        db.create_all()
        seed_categories()
        seed_demo_user()


def seed_categories():
    if Category.query.count() == 0:
        default_categories = [
            Category(name="Peinture"),
            Category(name="Sculpture"),
            Category(name="Photographie"),
            Category(name="Art numérique"),
            Category(name="Portrait"),
            Category(name="Abstrait")
        ]
        db.session.add_all(default_categories)
        db.session.commit()
        print("✅ Catégories par défaut ajoutées.")


def seed_demo_user():
    if User.query.count() == 0:
        user = User(
            username="artistedemo",
            email="artiste@demo.com",
            is_artist=True,
            bio="Artiste haïtien passionné"
        )
        user.set_password("demo123")
        db.session.add(user)
        db.session.commit()
        print("✅ Utilisateur démo ajouté.")


# -----------------------------
# 🔐 AUTHENTIFICATION
# -----------------------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Champs requis manquants"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email déjà utilisé"}), 400

    user = User(
        username=data.get("username", data["email"].split("@")[0]),
        email=data["email"],
        is_artist=data.get("is_artist", False),
        bio=data.get("bio", "")
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=user.id)
    return jsonify({
        "token": access_token,
        "user": {
            "id": user.id, "username": user.username, "email": user.email,
            "is_artist": user.is_artist, "bio": user.bio
        }
    }), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Champs requis manquants"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if user and user.check_password(data["password"]):
        token = create_access_token(identity=user.id)
        return jsonify({
            "token": token,
            "user": {
                "id": user.id, "username": user.username, "email": user.email,
                "is_artist": user.is_artist, "bio": user.bio
            }
        }), 200

    return jsonify({"error": "Email ou mot de passe incorrect"}), 401


@app.route("/api/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Utilisateur non trouvé"}), 404
    return jsonify({
        "id": user.id, "username": user.username, "email": user.email,
        "is_artist": user.is_artist, "bio": user.bio
    }), 200


# -----------------------------
# 🎨 ARTWORKS
# -----------------------------
@app.route("/api/artworks", methods=["GET"])
def get_artworks():
    artworks = Artwork.query.all()
    return jsonify([{
        "id": a.id,
        "title": a.title,
        "description": a.description,
        "price": a.price,
        "image_url": a.image_url,
        "artist_name": a.artist.username,
        "likes_count": len(a.likes),
        "is_sold": a.is_sold
    } for a in artworks]), 200


@app.route("/api/artworks", methods=["POST"])
@jwt_required()
def create_artwork():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_artist:
        return jsonify({"error": "Accès refusé"}), 403

    data = request.get_json()
    artwork = Artwork(
        title=data["title"],
        description=data.get("description", ""),
        price=data["price"],
        image_url=data.get("image_url", ""),
        artist_id=user_id
    )
    db.session.add(artwork)
    db.session.commit()
    return jsonify({"message": "Œuvre créée avec succès"}), 201


# -----------------------------
# 🛒 PANIER / CHECKOUT
# -----------------------------
@app.route("/api/cart", methods=["GET"])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    items = Cart.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": c.id, "title": c.artwork.title, "price": c.artwork.price, "image_url": c.artwork.image_url
    } for c in items]), 200


@app.route("/api/cart", methods=["POST"])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json()
    artwork_id = data.get("artwork_id")
    if Cart.query.filter_by(user_id=user_id, artwork_id=artwork_id).first():
        return jsonify({"error": "Déjà dans le panier"}), 400
    db.session.add(Cart(user_id=user_id, artwork_id=artwork_id))
    db.session.commit()
    return jsonify({"message": "Ajoutée au panier"}), 201


@app.route("/api/cart/<int:item_id>", methods=["DELETE"])
@jwt_required()
def remove_from_cart(item_id):
    user_id = get_jwt_identity()
    item = Cart.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"error": "Article introuvable"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Supprimé du panier"}), 200


@app.route("/api/cart/checkout", methods=["POST"])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()
    items = Cart.query.filter_by(user_id=user_id).all()
    if not items:
        return jsonify({"error": "Panier vide"}), 400
    for item in items:
        item.artwork.is_sold = True
        db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Paiement réussi 🎉"}), 200


# -----------------------------
# 📊 CATÉGORIES
# -----------------------------
@app.route("/api/categories", methods=["GET"])
def get_categories():
    try:
        categories = Category.query.all()
        return jsonify([{"id": c.id, "name": c.name} for c in categories]), 200
    except Exception as e:
        print("❌ Erreur dans /api/categories :", e)
        return jsonify({"error": str(e)}), 500


# -----------------------------
# 🏠 ACCUEIL (Render)
# -----------------------------
@app.route('/')
def home():
    return jsonify({
        "message": "✅ Serveur ArtGens.HT est en ligne sur Render",
        "status": "success",
        "routes_disponibles": [
            "/api/register",
            "/api/login",
            "/api/me",
            "/api/artworks",
            "/api/categories",
            "/api/cart",
            "/api/cart/checkout"
        ]
    }), 200


# -----------------------------
# 🚀 DÉMARRAGE (Render)
# -----------------------------
if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5555))
    print(f"🚀 Serveur ArtGens.HT lancé sur http://0.0.0.0:{port}")
    app.run(debug=True, host="0.0.0.0", port=port)
