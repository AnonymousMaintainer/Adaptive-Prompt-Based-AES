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
