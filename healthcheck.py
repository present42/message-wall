# Health check endpoint
from http.server import HTTPServer, SimpleHTTPRequestHandler
import requests
import sys

def check_health():
    try:
        response = requests.get('http://localhost:3000/api/health', timeout=5)
        return response.status_code == 200
    except:
        return False

if __name__ == "__main__":
    if check_health():
        print("✅ Application is healthy")
        sys.exit(0)
    else:
        print("❌ Application health check failed")
        sys.exit(1)
