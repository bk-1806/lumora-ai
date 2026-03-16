from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    # Required settings
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    GROQ_API_KEY: str = ""
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Diagnostic logging (obfuscated for security)
def _log_env_status():
    print("--- Environment Configuration Check ---")
    vars_to_check = ["SUPABASE_URL", "SUPABASE_KEY", "GROQ_API_KEY"]
    for var in vars_to_check:
        val = str(getattr(settings, var, ""))
        if not val:
            print(f"❌ {var} is MISSING or EMPTY")
        elif len(val) < 5:
            print(f"⚠️ {var} is suspiciously short: {val}")
        else:
            # Safe masking
            masked = f"{val[:10]}...{val[-4:]}" if len(val) > 15 else "***"
            print(f"✅ {var} is set: {masked}")
    print("---------------------------------------")

try:
    _log_env_status()
except Exception as e:
    print(f"Diagnostic error: {e}")
