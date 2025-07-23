# python -m venv .venv
# .venv/Scripts/activate
# pip install -r requirements.txt
# uvicorn app.main:app --reload


from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

from app.routes import v1_router
from app.core import database, config
from app.core import vectordb

# Load environment variables
load_dotenv(override=True)

def custom_generate_unique_id(route: APIRouter) -> str:
    return f'{route.tags[0]}-{route.name}'

@asynccontextmanager
async def lifespan(app: FastAPI):
    database.create_db_and_tables()
    
    # Forces collection to initialize
    try:
        _ = vectordb.essay_collection.count()
        print("[ChromaDB] Essay collection loaded successfully.")
    except Exception as e:
        print("[ChromaDB] Initialization failed:", str(e))

    yield

app = FastAPI(
    title="CULI API",
    description="This is an APIs for CULI",
    version="1.0.0",
    contact={
        "name": "",
    },
    license_info={},
    lifespan=lifespan,
    generate_unique_id_function=custom_generate_unique_id,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.settings.all_cors_origins,
    # allow_origin_regex='https?://.*',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/', summary='Root Endpoint', tags=['Root'])
def root():
    """
    Root endpoint of the API. Use this to check if the API is up and running.
    """
    return {'details': 'This is the root. Check /docs for interactive documentation.'}


app.include_router(v1_router.router, prefix='/api/v1')