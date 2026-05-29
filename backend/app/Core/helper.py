import requests

def get_ngrok_url():
    try:
        response = requests.get("http://127.0.0.1:4040/api/tunnels")
        data = response.json()
        return data["tunnels"][0]["public_url"]
    except Exception:
        return None