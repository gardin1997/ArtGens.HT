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


# --- Routes (extraits) ---
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Champs requis manquants'}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email déjà utilisé'}), 400

        user = User(
            username=data.get('username', data['email'].split('@')[0]),
            email=data['email'],
            is_artist=data.get('is_artist', False),
            bio=data.get('bio', '')
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=user.id)
        return jsonify({
            'token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_artist': user.is_artist,
                'bio': user.bio
            }
        }), 201
    except Exception as e:
        print("🔥 Erreur dans /api/register :", e)
        return jsonify({'error': str(e)}), 400


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Champs requis manquants'}), 400

        user = User.query.filter_by(email=data['email']).first()

        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id)
            return jsonify({
                'token': access_token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_artist': user.is_artist,
                    'bio': user.bio
                }
            }), 200

        return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

    except Exception as e:
        print("🔥 Erreur dans /api/login :", e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/artworks', methods=['GET'])
def get_artworks():
    artworks = Artwork.query.all()
    result = [{
        'id': art.id,
        'title': art.title,
        'description': art.description,
        'price': art.price,
        'image_url': art.image_url,
        'artist_name': art.artist.username if art.artist else None,
        'artist_id': art.artist.id if art.artist else None,
        'likes_count': len(art.likes),
        'created_at': art.created_at.isoformat()
    } for art in artworks]
    return jsonify(result), 200

# (les autres routes restent inchangées — tu peux réutiliser le reste de ton code tel quel)


# --- Démarrage : migrations + seed puis run ---
if __name__ == '__main__':
    # Si on est en production (Render), on laisse Alembic gérer les migrations via auto_migrate
    env = os.environ.get('FLASK_ENV', 'production')
    try:
        # Appliquer migrations (ne fera rien s'il n'y a pas de migrations)
        auto_migrate()
    except Exception as e:
        print("⚠️ auto_migrate failed:", e)

    # Seed initial data si nécessaire
    try:
        seed_default_data()
    except Exception as e:
        print("⚠️ seed_default_data failed:", e)

    # Port compatible Render (Render fournit la variable PORT)
    port = int(os.environ.get('PORT', 5555))
    print(f"🚀 Serveur ArtGens.HT démarré sur 0.0.0.0:{port}")
    app.run(debug=(env != 'production'), host='0.0.0.0', port=port)
