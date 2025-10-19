import cloudinary
import cloudinary.uploader
import cloudinary.api

# Configuration Cloudinary (remplacer avec vos vraies clés)
cloudinary.config(
    cloud_name = "dvpkiqqqk",
    api_key = "123456789012345",
    api_secret = "votre_api_secret_cloudinary"
)

def upload_image(file):
    try:
        result = cloudinary.uploader.upload(file)
        return result['secure_url']
    except Exception as e:
        raise Exception(f"Erreur upload Cloudinary: {str(e)}")