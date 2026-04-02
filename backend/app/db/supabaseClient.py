from supabase import create_client, Client
from app.config import settings

_db_client = None

def get_supabase() -> Client:
    global _db_client
    if _db_client is not None:
        return _db_client
        
    url = settings.SUPABASE_URL or ""
    key = settings.SUPABASE_KEY or ""
    
    # Reject mock/publishable keys that won't work for server-side writes
    if not key or key.startswith("sb_publishable_"):
        print("CRITICAL: SUPABASE_KEY is missing or is a mock publishable key.")
        print("Set SUPABASE_KEY to your Supabase SERVICE ROLE key in Render environment variables.")
        raise ValueError("SUPABASE_KEY must be the service role key, not the anon/publishable key.")
    
    if not url or not key:
        print(f"CRITICAL: Supabase credentials missing. URL=['{url}'], Key Length={len(key) if key else 0}")
        raise ValueError("Supabase credentials not found in environment variables.")
    
    try:
        # Standardize URL (remove trailing slashes or spaces)
        url = url.strip().rstrip("/")
        print(f"Initializing Supabase client. URL: {url[:30]}..., Key starts with: {key[:15]}...")
        _db_client = create_client(url, key)
        print("Supabase client initialized successfully.")
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
except Exception as e:
    db_client = None
    print(f"Warning: db_client initialized to None. Reason: {e}")
    print("Check your SUPABASE_URL and SUPABASE_KEY environment variables on Render.")
