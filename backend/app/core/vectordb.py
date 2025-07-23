import hashlib

from chromadb import Client, PersistentClient
from chromadb.config import Settings

from ..utils.embedding import get_embedding_function
from ..core.config import settings  # if your config class has model path info

# Initialize ChromaDB client with persistence
chroma_client = PersistentClient(path="app/chroma_store")

# Setup embedding function
embedding_fn = get_embedding_function(
    source="huggingface",
    model_path_or_name="all-mpnet-base-v2",
)

# Load or create collection
essay_collection = chroma_client.get_or_create_collection(
    name="essays",
    embedding_function=embedding_fn,
    metadata={"hnsw:space": "cosine"}
)

# Insert a document to Vectordb
def build_collection(exam_id: int, text: str, metadata: dict = None):
    essay_collection.add(
        documents=[text],
        ids=[str(exam_id)],
        metadatas=[metadata] if metadata else [None],
    )

# Retrieve similar documents
def get_similar_exams(query_text: str, n_results: int = 5):
    return essay_collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
