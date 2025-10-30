import os
import sys
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

# --- App config ---
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'votre_secret_super_securise')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'votre_jwt_secret')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# SQLite file path - Render's working dir should contain the DB file path relative to this file
db_path = os.environ.get('DATABASE_URL', 'sqlite:///artgens.db')
app.config['SQLALCHEMY_DATABASE_URI'] = db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Extensions ---
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)
jwt = JWTManager(app)

# --- Models ---
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


# --- Helpers for DB init / seeding ---
def init_db():
    """Utilisé localement si nécessaire pour créer tables et seed minimal."""
    with app.app_context():
        db.create_all()
        seed_default_data()


def seed_default_data():
    """Ajoute catégories et utilisateur demo si manquant."""
    with app.app_context():
        try:
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

            if User.query.count() == 0:
                user = User(
                    username='artistedemo',
                    email='artiste@demo.com',
                    is_artist=True,
                    bio='Artiste haïtien passionné'
                )
                user.set_password('demo123')
                db.session.add(user)
                db.session.commit()
                print("✅ Utilisateur demo ajouté.")
        except Exception as e:
            db.session.rollback()
            print("⚠️ Erreur lors du seed :", e)


# --- Auto-migration (Alémbic) pour Render ---
def auto_migrate():
    """Lance flask-migrate/upgrade pour appliquer les migrations (si configurées)."""
    from flask_migrate import upgrade
    with app.app_context():
        try:
            upgrade()
            print("✅ Base de données mise à jour avec succès (Render).")
        except Exception as e:
            print("⚠️ Erreur lors de la migration de la base :", e)


# --- ROUTES ---
@app.route('/')
def home():
    return jsonify({
        "message": "✅ Serveur ArtGens.HT en ligne sur Render",
        "status": "success"
    }), 200


@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{'id': c.id, 'name': c.name} for c in categories]), 200


@app.route('/api/render-test', methods=['GET'])
def render_test():
    """Route spéciale pour tester Render"""
    try:
        user_count = User.query.count()
        category_count = Category.query.count()
        return jsonify({
            "status": "✅ OK",
            "message": "Déploiement Render opérationnel",
            "users_in_db": user_count,
            "categories_in_db": category_count
        }), 200
    except Exception as e:
        return jsonify({
            "status": "❌ ERROR",
            "message": "Le serveur est actif mais la base pose problème",
            "error": str(e)
        }), 500


# --- Démarrage : migrations + seed puis run ---
env = os.environ.get('FLASK_ENV', 'production')

try:
    auto_migrate()
except Exception as e:
    print("⚠️ auto_migrate failed:", e)

try:
    seed_default_data()
except Exception as e:
    print("⚠️ seed_default_data failed:", e)

# --- Exécution compatible Render ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5555))
    print(f"🚀 Serveur ArtGens.HT démarré sur 0.0.0.0:{port}")
    app.run(debug=(env != 'production'), host='0.0.0.0', port=port)

# ✅ Autoriser les appels API depuis ton site React (GitHub Pages)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SECRET_KEY'] = 'votre_secret_super_securise'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///artgens.db'
