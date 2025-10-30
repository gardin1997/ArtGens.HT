from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
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


def init_db():
    with app.app_context():
        db.create_all()

        if not Category.query.first():
            categories = ['Peinture', 'Portrait', 'Artisanat', 'Poterie', 'Sculpture', 'Photographie']
            for cat_name in categories:
                db.session.add(Category(name=cat_name))
            db.session.commit()

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


@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Champs requis manquants'}), 400

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
        'artist_name': art.artist.username,
        'artist_id': art.artist.id,
        'likes_count': len(art.likes),
        'created_at': art.created_at.isoformat()
    } for art in artworks]
    return jsonify(result), 200


@app.route('/api/artworks', methods=['POST'])
@jwt_required()
def create_artwork():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user or not user.is_artist:
            return jsonify({'error': 'Accès non autorisé'}), 403

        data = request.get_json()
        if not data.get('title') or not data.get('price'):
            return jsonify({'error': 'Titre et prix sont obligatoires'}), 400

        artwork = Artwork(
            title=data['title'],
            description=data.get('description', ''),
            price=float(data['price']),
            image_url=data.get('image_url', ''),
            artist_id=current_user_id
        )

        category_ids = data.get('category_ids', [])
        for cat_id in category_ids:
            category = Category.query.get(cat_id)
            if category:
                artwork.categories.append(category)

        db.session.add(artwork)
        db.session.commit()

        return jsonify({'message': 'Œuvre créée avec succès', 'artwork_id': artwork.id}), 201

    except Exception as e:
        print("🔥 Erreur ajout œuvre :", e)
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/artworks/<int:artwork_id>', methods=['GET'])
def get_artwork(artwork_id):
    artwork = Artwork.query.get_or_404(artwork_id)
    return jsonify({
        'id': artwork.id,
        'title': artwork.title,
        'description': artwork.description,
        'price': artwork.price,
        'image_url': artwork.image_url,
        'artist_name': artwork.artist.username,
        'artist_bio': artwork.artist.bio,
        'likes_count': len(artwork.likes),
        'created_at': artwork.created_at.isoformat()
    }), 200


@app.route('/api/artworks/<int:artwork_id>', methods=['PUT'])
@jwt_required()
def update_artwork(artwork_id):
    user_id = get_jwt_identity()
    artwork = Artwork.query.get_or_404(artwork_id)

    if artwork.artist_id != user_id:
        return jsonify({'error': 'Accès refusé : vous ne pouvez modifier que vos propres œuvres'}), 403

    data = request.get_json()
    try:
        artwork.title = data.get('title', artwork.title)
        artwork.description = data.get('description', artwork.description)
        artwork.price = float(data.get('price', artwork.price))
        artwork.image_url = data.get('image_url', artwork.image_url)
        db.session.commit()
        return jsonify({'message': 'Œuvre mise à jour avec succès'}), 200
    except Exception as e:
        db.session.rollback()
        print("Erreur mise à jour œuvre :", e)
        return jsonify({'error': str(e)}), 400



@app.route('/api/artworks/<int:artwork_id>', methods=['DELETE'])
@jwt_required()
def delete_artwork(artwork_id):
    user_id = get_jwt_identity()
    artwork = Artwork.query.get_or_404(artwork_id)

    
    if artwork.artist_id != user_id:
        return jsonify({'error': 'Accès refusé : vous ne pouvez supprimer que vos propres œuvres'}), 403

    try:
        
        Like.query.filter_by(artwork_id=artwork_id).delete()
        Comment.query.filter_by(artwork_id=artwork_id).delete()
        Cart.query.filter_by(artwork_id=artwork_id).delete()

        
        db.session.delete(artwork)
        db.session.commit()

        return jsonify({'message': 'Œuvre supprimée avec succès'}), 200
    except Exception as e:
        db.session.rollback()
        print("Erreur suppression œuvre :", e)
        return jsonify({'error': str(e)}), 400



@app.route('/api/artworks/<int:artwork_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(artwork_id):
    """Ajoute ou retire un like sur une œuvre."""
    user_id = get_jwt_identity()
    artwork = Artwork.query.get_or_404(artwork_id)

    existing_like = Like.query.filter_by(user_id=user_id, artwork_id=artwork_id).first()
    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({'liked': False, 'message': 'Like retiré'}), 200

    new_like = Like(user_id=user_id, artwork_id=artwork_id)
    db.session.add(new_like)
    db.session.commit()
    return jsonify({'liked': True, 'message': 'Like ajouté'}), 201


@app.route('/api/artworks/<int:artwork_id>/comments', methods=['GET'])
def get_comments(artwork_id):
    artwork = Artwork.query.get_or_404(artwork_id)
    comments = [{
        'id': c.id,
        'content': c.content,
        'author': c.user.username,
        'created_at': c.created_at.strftime('%Y-%m-%d %H:%M')
    } for c in artwork.comments]
    return jsonify(comments), 200


@app.route('/api/artworks/<int:artwork_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(artwork_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': 'Commentaire vide'}), 400

    artwork = Artwork.query.get_or_404(artwork_id)
    comment = Comment(content=content, user_id=user_id, artwork_id=artwork.id)
    db.session.add(comment)
    db.session.commit()

    return jsonify({
        'id': comment.id,
        'content': comment.content,
        'author': comment.user.username,
        'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M')
    }), 201


@app.route('/api/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    items = Cart.query.filter_by(user_id=user_id).all()
    result = [{
        'id': c.id,
        'artwork_id': c.artwork.id,
        'title': c.artwork.title,
        'price': c.artwork.price,
        'image_url': c.artwork.image_url
    } for c in items]
    return jsonify(result), 200


@app.route('/api/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json()
    artwork_id = data.get('artwork_id')

    artwork = Artwork.query.get(artwork_id)
    if not artwork:
        return jsonify({'error': 'Œuvre introuvable'}), 404
    if artwork.is_sold:
        return jsonify({'error': 'Œuvre déjà vendue'}), 400

    if Cart.query.filter_by(user_id=user_id, artwork_id=artwork_id).first():
        return jsonify({'error': 'Déjà dans le panier'}), 400

    cart_item = Cart(user_id=user_id, artwork_id=artwork_id)
    db.session.add(cart_item)
    db.session.commit()
    return jsonify({'message': 'Ajoutée au panier'}), 201



@app.route('/api/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    """Supprime un article spécifique du panier."""
    user_id = get_jwt_identity()
    item = Cart.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({'error': 'Article introuvable dans le panier'}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Article retiré du panier'}), 200


@app.route('/api/cart/checkout', methods=['POST'])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()
    items = Cart.query.filter_by(user_id=user_id).all()
    if not items:
        return jsonify({'error': 'Panier vide'}), 400

    for item in items:
        item.artwork.is_sold = True
        db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Paiement réussi 🎉'}), 200


@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{'id': c.id, 'name': c.name} for c in categories]), 200


@app.route('/api/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Renvoie les infos de l'utilisateur connecté (via token)."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_artist': user.is_artist,
        'bio': user.bio
    }), 200

# ✅ Créer automatiquement les tables sur Render
def auto_migrate():
    from flask_migrate import upgrade
    from flask import current_app
    with app.app_context():
        try:
            upgrade()
            print("✅ Base de données mise à jour avec succès (Render).")
        except Exception as e:
            print("⚠️ Erreur lors de la migration de la base :", e)

# Appel automatique au démarrage
auto_migrate()

if __name__ == '__main__':
    init_db()
    print("🚀 Serveur ArtGens.HT démarré sur http://localhost:5555")
    app.run(debug=True, port=5555)