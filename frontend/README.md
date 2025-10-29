# 🎨 ArtGens.HT

**ArtGens.HT** est une plateforme numérique dédiée à la valorisation des artistes haïtiens.  
Elle permet aux artistes d’exposer, vendre et partager leurs œuvres tout en créant une communauté créative, moderne et inspirante.

---

##  Objectif

- Offrir un espace accessible et professionnel aux artistes haïtiens.  
- Connecter les **créateurs**, **collectionneurs** et **passionnés d’art**.  
- Intégrer l’art haïtien dans un environnement numérique moderne et fonctionnel.  
- Encourager la découverte et la promotion des talents locaux à travers une vitrine virtuelle.

---

##  Origine du projet

En Haïti, beaucoup d’artistes manquent d’une véritable présence numérique.  
Les plateformes internationales ne représentent pas toujours la richesse et la diversité de l’art haïtien.  

**ArtGens.HT** est né de cette observation :  
> “Créer un pont entre l’art haïtien et la technologie, pour faire rayonner nos artistes dans le monde entier.”

---

##  Fondateurs

- **Christie Roberte Martineau**  
- **Gardin Gervais**

---

##  Technologies utilisées

###  Frontend
- **React.js** (Hooks, Context API)
- **Axios** pour la communication avec le backend
- **Lucide Icons** pour une interface moderne et fluide
- **CSS personnalisé / Inline styling** pour un design simple et épuré

###  Backend
- **Flask** (Python)
- **Flask-JWT-Extended** pour l’authentification sécurisée
- **Flask-SQLAlchemy** pour la gestion de la base de données
- **SQLite** (en mode développement)
- **Flask-Migrate** pour la gestion des migrations
- **CORS activé** pour la communication entre frontend et backend

---

##  Structure du projet

ArtGens.HT-galerie-d-art/
│
├── backend/
│ ├── app.py # Point d’entrée du serveur Flask
│ ├── auth.py # Authentification utilisateur
│ ├── cloudinary_config.py # Configuration des images
│ ├── migrations/ # Fichiers de migration SQLAlchemy
│ ├── instance/ # Fichier de base de données locale
│ └── requirements.txt # Dépendances Python
│
├── frontend/
│ ├── public/
│ │ ├── index.html
│ │ ├── favicon.ico
│ │ └── manifest.json
│ │
│ ├── src/
│ │ ├── components/ # Navbar, Payment, etc.
│ │ ├── context/ # ArtworkContext.js (state global)
│ │ ├── pages/ # Pages : Home, Login, Register, Cart, etc.
│ │ ├── App.js
│ │ ├── index.js
│ │ └── index.css
│ │
│ └── package.json # Dépendances React
│
└── README.md # Documentation du projet

yaml
Copier le code

---

##  Installation et exécution

###  1. Cloner le projet

```bash
git clone https://github.com/votre-utilisateur/ArtGens.HT.git
cd ArtGens.HT-galerie-d-art
⚙️ 2. Configuration du backend (Flask)
bash
Copier le code
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
pip install -r requirements.txt
flask run --port=5555
➡️ Le backend sera accessible sur :
http://127.0.0.1:5555

💻 3. Configuration du frontend (React)
bash
Copier le code
cd ../frontend
npm install
npm start
➡️ Le frontend sera accessible sur :
http://localhost:3000

🔐 Authentification & Sécurité
Authentification basée sur JWT (JSON Web Token).

Les routes protégées du backend nécessitent un token d’accès valide.

Le token est automatiquement stocké dans le localStorage après connexion.

🛒 Fonctionnalités principales
Fonctionnalité	Description
👩‍🎨 Inscription / Connexion	Création de compte artiste ou acheteur
🎨 Ajout d’œuvres	Un artiste peut publier, modifier ou supprimer ses œuvres
❤️ Likes & Commentaires	Les utilisateurs peuvent aimer et commenter les œuvres
🛒 Panier et paiement	Gestion du panier avec achat simulé
💬 Espace communautaire	Interaction entre artistes et visiteurs
💾 Stockage sécurisé	Données persistantes via SQLite + SQLAlchemy

📷 Aperçu visuel
(Tu peux ajouter ici des captures d’écran de ton site, comme celles que tu as déjà faites.)

💡 Vision
Faire rayonner la créativité haïtienne en alliant art et technologie, et offrir aux artistes un espace professionnel, esthétique et durable pour exposer et vendre leurs œuvres.

🧑‍💻 Auteur principal
Gardin Gervais
Étudiant en Gestion des Affaires à l’Université Quisqueya
Passionné par la technologie, l’innovation et la créativité.

📜 Licence
Projet académique – Tous droits réservés © 2025
Développé dans le cadre d’un projet universitaire de gestion et de développement web.