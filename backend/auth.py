from flask import request, jsonify
from functools import wraps
import jwt
import datetime

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, 'votre_secret_key', algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        
        try:
            token = token.split(' ')[1]  # Enlever "Bearer "
            data = jwt.decode(token, 'votre_secret_key', algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'error': 'Token invalide'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated