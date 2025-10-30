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
CORS(app, resources={r"/api/*": {"origins": "*"}})  # ✅ Autoriser tous les appels frontend
jwt = JWTManager(app)

# ===========================
# =======   MODELS   ========
# ===========================

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
    cart_items =_
