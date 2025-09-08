import os
import io
import logging
import numpy as np
import requests
import torch
from PIL import Image
from flask import Flask, request, jsonify
from flask.cli import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from pgvector.sqlalchemy import Vector
from transformers import CLIPModel, CLIPProcessor
import faiss
from flask_cors import cross_origin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("SQL_URI")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

logger.info("[STARTUP] Loading CLIP model and processor...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
logger.info("[STARTUP] CLIP model loaded successfully")


class Post(db.Model):
    __tablename__ = "Post"
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, nullable=False)
    postName = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    postImageUrl = db.Column(db.String, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)
    updatedAt = db.Column(db.DateTime, nullable=False)
    embedding = db.Column(Vector(512), nullable=True)


@app.route("/add/<int:post_id>", methods=["POST"])
@cross_origin(origins=["http://localhost:3000", "http://localhost:3001", "http://frontend:3000"])
def add_image(post_id):
    logger.info(f"[ADD_EMBEDDING] Received request for post_id: {post_id}")
    
    data = request.json
    url = data["url"]
    logger.info(f"[ADD_EMBEDDING] Image URL: {url}")
    
    post = Post.query.get(post_id)

    if not post:
        logger.error(f"[ADD_EMBEDDING] Post {post_id} not found in database")
        return jsonify({"error": "Post not found"}), 404
    
    logger.info(f"[ADD_EMBEDDING] Found post {post_id}: {post.postName}")

    try:
        logger.info(f"[ADD_EMBEDDING] Downloading image from: {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        logger.info(f"[ADD_EMBEDDING] Processing image with CLIP model")
        image = Image.open(io.BytesIO(response.content)).convert("RGB")

        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            image_embedding = model.get_image_features(**inputs).squeeze().numpy()
        image_embedding = image_embedding.astype("float32")

        logger.info(f"[ADD_EMBEDDING] Generated embedding with shape: {image_embedding.shape}")
        
        post.embedding = image_embedding.tolist()
        db.session.commit()
        
        logger.info(f"[ADD_EMBEDDING] Successfully saved embedding for post {post_id}")
        return jsonify({"message": "Embedding added"}), 201
        
    except requests.RequestException as e:
        logger.error(f"[ADD_EMBEDDING] Failed to download image from {url}: {str(e)}")
        db.session.rollback()
        return jsonify({"error": f"Image download failed: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"[ADD_EMBEDDING] Unexpected error processing post {post_id}: {str(e)}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def normalize(x):
    return x / np.linalg.norm(x)


@app.route("/search", methods=["POST"])
@cross_origin(origins=["http://localhost:3000", "http://localhost:3001", "http://frontend:3000"])
def search():
    query = request.json.get("query", "")
    logger.info(f"[SEARCH] Received search query: {query}")

    inputs = processor(text=query, return_tensors="pt")
    with torch.no_grad():
        text_embedding = model.get_text_features(**inputs).squeeze().numpy()
    text_embedding = normalize(text_embedding.astype("float32"))

    posts = Post.query.filter(Post.embedding != None).all()
    embeddings = [normalize(np.array(post.embedding, dtype="float32")) for post in posts]
    image_data = [{"id": post.id, "postImageUrl": post.postImageUrl} for post in posts]

    if not embeddings:
        return jsonify([])

    index = faiss.IndexFlatIP(len(text_embedding))
    index.add(np.array(embeddings))

    k = min(5, len(embeddings))
    D, I = index.search(np.array([text_embedding]), k)

    threshold = 0.3
    filtered_results = []
    for score, idx in zip(D[0], I[0]):
        if score >= threshold:
            filtered_results.append(image_data[idx])

    return jsonify(filtered_results)


def init_db():
    """Initialize database tables and connection"""
    try:
        logger.info("[STARTUP] Testing database connection...")
        
        with app.app_context():
            db.engine.connect()
        logger.info("[STARTUP] Database connection successful")
        
        with app.app_context():
            db.create_all()
        logger.info("[STARTUP] Database tables initialized")
        
        with app.app_context():
            post_count = Post.query.count()
        logger.info(f"[STARTUP] Found {post_count} posts in database")
        
    except Exception as e:
        logger.error(f"[STARTUP] Database initialization failed: {str(e)}")
        raise


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    try:
        with app.app_context():
            db.engine.connect()
        return jsonify({"status": "healthy", "service": "cleverSearch"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5050, debug=True)
