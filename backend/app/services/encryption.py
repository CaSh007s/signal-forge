import os
from cryptography.fernet import Fernet

_ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
_fernet = None

if _ENCRYPTION_KEY:
    try:
        _fernet = Fernet(_ENCRYPTION_KEY.encode('utf-8'))
    except Exception as e:
        print(f"⚠️ Warning: ENCRYPTION_KEY is invalid. Encryption/decryption will fail. Error: {e}")

def encrypt_key(raw_key: str) -> str:
    if not _fernet:
        raise ValueError("Encryption securely disabled: ENCRYPTION_KEY not configured.")
    return _fernet.encrypt(raw_key.encode('utf-8')).decode('utf-8')

def decrypt_key(encrypted_key: str) -> str:
    if not _fernet:
        raise ValueError("Encryption securely disabled: ENCRYPTION_KEY not configured.")
    return _fernet.decrypt(encrypted_key.encode('utf-8')).decode('utf-8')
