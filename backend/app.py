from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SECRET_KEY'] = 'votre_secret_super_securise'
app.config['JWT_SECRET_KEY'] = 'votre_jwt_secret'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///artgens.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)
jwt = JWTManager(app)

# Modèles
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

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

artwork_categories = db.Table('artwork_categories',
    db.Column('artwork_id', db.Integer, db.ForeignKey('artwork.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('category.id'), primary_key=True)
)

class Artwork(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(200))
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    artist_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    categories = db.relationship('Category', secondary=artwork_categories, backref='artworks')
    likes = db.relationship('Like', backref='artwork', lazy=True)

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    artwork_id = db.Column(db.Integer, db.ForeignKey('artwork.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Fonction d'initialisation de la base de données
def init_db():
    with app.app_context():
        try:
            # Créer toutes les tables
            db.create_all()
            print("✅ Tables créées avec succès!")
            
            # Créer des catégories par défaut
            if not Category.query.first():
                categories = ['Peinture', 'Portrait', 'Artisanat', 'Poterie', 'Sculpture', 'Photographie']
                for cat_name in categories:
                    db.session.add(Category(name=cat_name))
                db.session.commit()
                print("✅ Catégories créées!")
            
            # Créer un utilisateur de test si aucun n'existe
            if not User.query.first():
                user = User(
                    username='artistedemo',
                    email='artiste@demo.com',
                    is_artist=True,
                    bio='Artiste haïtien passionné'
                )
                user.set_password('demo123')
                db.session.add(user)
                db.session.commit()
                print("✅ Utilisateur de test créé!")
                
        except Exception as e:
            print(f"❌ Erreur lors de l'initialisation: {e}")
            # En cas d'erreur, on drop et recrée tout
            db.drop_all()
            db.create_all()
            print("✅ Base de données réinitialisée!")

# Routes d'authentification
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email déjà utilisé'}), 400
        
        user = User(
            username=data['username'],
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
        return jsonify({'error': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
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
            })
        
        return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Routes artworks
@app.route('/api/artworks', methods=['GET'])
def get_artworks():
    try:
        artworks = Artwork.query.filter_by(is_available=True).all()
        
        result = []
        for art in artworks:
            result.append({
                'id': art.id,
                'title': art.title,
                'description': art.description,
                'price': art.price,
                'image_url': art.image_url,
                'artist_name': art.artist.username,
                'artist_id': art.artist.id,
                'likes_count': len(art.likes),
                'created_at': art.created_at.isoformat() if art.created_at else None
            })
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/artworks', methods=['POST'])
@jwt_required()
def create_artwork():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_artist:
            return jsonify({'error': 'Accès non autorisé'}), 403
        
        data = request.get_json()
        artwork = Artwork(
            title=data['title'],
            description=data.get('description', ''),
            price=float(data['price']),
            image_url=data.get('image_url', ''),
            artist_id=current_user_id
        )
        
        db.session.add(artwork)
        db.session.commit()
        
        return jsonify({
            'message': 'Œuvre créée avec succès',
            'artwork': {
                'id': artwork.id,
                'title': artwork.title,
                'price': artwork.price
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/artworks/<int:artwork_id>', methods=['GET'])
def get_artwork(artwork_id):
    try:
        artwork = Artwork.query.get_or_404(artwork_id)
        
        return jsonify({
            'id': artwork.id,
            'title': artwork.title,
            'description': artwork.description,
            'price': artwork.price,
            'image_url': artwork.image_url,
            'is_available': artwork.is_available,
            'artist_name': artwork.artist.username,
            'artist_bio': artwork.artist.bio,
            'likes_count': len(artwork.likes),
            'created_at': artwork.created_at.isoformat() if artwork.created_at else None
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/api/artworks/<int:artwork_id>', methods=['PUT'])
@jwt_required()
def update_artwork(artwork_id):
    try:
        current_user_id = get_jwt_identity()
        artwork = Artwork.query.get_or_404(artwork_id)
        
        if artwork.artist_id != current_user_id:
            return jsonify({'error': 'Accès non autorisé'}), 403
        
        data = request.get_json()
        artwork.title = data.get('title', artwork.title)
        artwork.description = data.get('description', artwork.description)
        artwork.price = data.get('price', artwork.price)
        artwork.image_url = data.get('image_url', artwork.image_url)
        
        db.session.commit()
        
        return jsonify({'message': 'Œuvre mise à jour avec succès'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/artworks/<int:artwork_id>', methods=['DELETE'])
@jwt_required()
def delete_artwork(artwork_id):
    try:
        current_user_id = get_jwt_identity()
        artwork = Artwork.query.get_or_404(artwork_id)
        
        if artwork.artist_id != current_user_id:
            return jsonify({'error': 'Accès non autorisé'}), 403
        
        db.session.delete(artwork)
        db.session.commit()
        
        return jsonify({'message': 'Œuvre supprimée avec succès'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Routes likes
@app.route('/api/artworks/<int:artwork_id>/like', methods=['POST'])
@jwt_required()
def like_artwork(artwork_id):
    try:
        current_user_id = get_jwt_identity()
        
        existing_like = Like.query.filter_by(
            user_id=current_user_id, 
            artwork_id=artwork_id
        ).first()
        
        if existing_like:
            db.session.delete(existing_like)
            db.session.commit()
            return jsonify({'message': 'Like retiré', 'liked': False})
        
        like = Like(user_id=current_user_id, artwork_id=artwork_id)
        db.session.add(like)
        db.session.commit()
        
        return jsonify({'message': 'Like ajouté', 'liked': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Routes utilisateur
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_artist': user.is_artist,
            'bio': user.bio,
            'created_at': user.created_at.isoformat() if user.created_at else None
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/artist/artworks', methods=['GET'])
@jwt_required()
def get_artist_artworks():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user.is_artist:
            return jsonify({'error': 'Accès non autorisé'}), 403
        
        artworks = Artwork.query.filter_by(artist_id=current_user_id).all()
        
        stats = {
            'total': len(artworks),
            'sold': len([a for a in artworks if not a.is_available]),
            'available': len([a for a in artworks if a.is_available]),
            'revenue': 0
        }
        
        artworks_data = []
        for art in artworks:
            artworks_data.append({
                'id': art.id,
                'title': art.title,
                'price': art.price,
                'image_url': art.image_url,
                'is_available': art.is_available,
                'likes_count': len(art.likes),
                'created_at': art.created_at.isoformat() if art.created_at else None
            })
        
        return jsonify({
            'artworks': artworks_data,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route de test
@app.route('/')
def home():
    return jsonify({
        'message': 'Bienvenue sur ArtGens.HT API',
        'version': '1.0',
        'endpoints': {
            'artworks': '/api/artworks',
            'register': '/api/register',
            'login': '/api/login'
        }
    })

@app.route('/api/test-data', methods=['POST'])
def create_test_data():
    """Route pour créer des données de test"""
    try:
        # Créer un artiste de test
        artist = User(
            username='testartist',
            email='test@artiste.com',
            is_artist=True,
            bio='Artiste de test haïtien'
        )
        artist.set_password('test123')
        db.session.add(artist)
        db.session.commit()
        
        # Créer quelques œuvres de test
        artworks_data = [
            {
                'title': 'Paysage Tropical',
                'description': 'Une magnifique peinture représentant les paysages d\'Haïti',
                'price': 250.00,
                'image_url': 'https://picsum.photos/400/300?random=1',
                'artist_id': artist.id
            },
            {
                'title': 'Portrait Traditionnel',
                'description': 'Portrait inspiré de la culture haïtienne',
                'price': 180.00,
                'image_url': 'https://picsum.photos/400/300?random=2',
                'artist_id': artist.id
            },
            {
                'title': 'Sculpture en Bois',
                'description': 'Sculpture artisanale en bois précieux',
                'price': 350.00,
                'image_url': 'https://picsum.photos/400/300?random=3',
                'artist_id': artist.id
            }
        ]
        
        for art_data in artworks_data:
            artwork = Artwork(**art_data)
            db.session.add(artwork)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Données de test créées avec succès',
            'artist_id': artist.id,
            'artworks_created': len(artworks_data)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-db', methods=['POST'])
def reset_database():
    """Route pour réinitialiser la base de données (à utiliser avec précaution)"""
    try:
        db.drop_all()
        db.create_all()
        init_db()
        return jsonify({'message': 'Base de données réinitialisée avec succès'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialiser la base de données au démarrage
    init_db()
    print("🚀 Serveur ArtGens.HT démarré sur http://localhost:5555")
    app.run(debug=True, port=5555)