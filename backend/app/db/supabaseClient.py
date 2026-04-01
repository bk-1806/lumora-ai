from supabase import create_client, Client
from app.config import settings

_db_client = None

def get_supabase() -> Client:
    global _db_client
    if _db_client is not None:
        return _db_client
        
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY
    
    if not url or not key:
        print(f"CRITICAL: Supabase credentials missing. URL=['{url}'], Key Length={len(key) if key else 0}")
        raise ValueError("Supabase credentials not found in environment variables.")
    
    try:
        # Standardize URL (remove trailing slashes or spaces)
        url = url.strip().rstrip("/")
        _db_client = create_client(url, key)
        return _db_client
    except Exception as e:
        print(f"CRITICAL: Failed to initialize Supabase client with URL: '{url}'")
        print(f"Error detail: {e}")
        raise

# For backward compatibility with existing imports
# We attempt to initialize it here so it's available for non-lazy routers
# but catch the error so the import itself doesn't crash the uvicorn process
try:
    db_client = get_supabase()
except Exception:
    db_client = None
    print("Warning: db_client initialized to None due to invalid credentials. Check logs.")
