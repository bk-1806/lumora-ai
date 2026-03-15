from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    GROQ_API_KEY: str
    PORT: int = 8000

    class Config:
        env_file = ".env"

try:
    settings = Settings()
except Exception as e:
    print(f"Failed to load settings: {e}")
    # Fallback to avoid breaking at compile time if .env missing during testing
    import os
    class DummySettings:
        SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
        SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
        GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
        PORT = int(os.environ.get("PORT", "8000"))
    settings = DummySettings()
