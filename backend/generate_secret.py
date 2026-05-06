import secrets

def generate_secret():
    """Genera una clave aleatoria segura para JWT."""
    secret = secrets.token_hex(32)
    print("\n🔑 Tu nueva SECRET_KEY es:")
    print(f"{secret}")
    print("\nCopiá esta clave y pegala en tu archivo .env\n")

if __name__ == "__main__":
    generate_secret()
