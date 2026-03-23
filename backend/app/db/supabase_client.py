"""
Lazy-initialized Supabase client.
Returns None safely if environment variables are missing (no crash on boot).
"""
import os

_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")

    if not url or not key:
        print("[supabase_client] WARNING: SUPABASE_URL or SUPABASE_KEY not set. Supabase features disabled.")
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(url, key)
        return _supabase_client
    except Exception as e:
        print(f"[supabase_client] ERROR: Failed to create Supabase client: {e}")
        return None
