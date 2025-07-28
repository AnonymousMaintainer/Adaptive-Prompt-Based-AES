from chromadb import PersistentClient
from chromadb.utils import embedding_functions
from sentence_transformers import SentenceTransformer
from typing import Literal

class LocalEmbeddingFunction:
    def __init__(self, model_path_or_name: str):
        self.model = SentenceTransformer(model_path_or_name)

    def embed_documents(self, texts):
        return self.model.encode(texts, convert_to_tensor=False).tolist()

    def embed_query(self, text):
        return self.model.encode([text], convert_to_tensor=False)[0].tolist()


def get_embedding_function(source: Literal["local", "huggingface"], model_path_or_name: str):
    if source == "huggingface":
        return embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=model_path_or_name
        )
    elif source == "local":
        return LocalEmbeddingFunction(model_path_or_name)
    else:
        raise ValueError("Invalid source for embedding function")


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


# Initialize ChromaDB client with persistence
chroma_client = PersistentClient(path="app/chroma_store")

# Setup embedding function
embedding_fn = get_embedding_function(
    source="huggingface",
    model_path_or_name="all-MiniLM-L6-v2",
)

# Load or create collection
essay_collection = chroma_client.get_or_create_collection(
    name="essays",
    embedding_function=embedding_fn,
    metadata={"hnsw:space": "cosine"}
)
