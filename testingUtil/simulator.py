import requests
import time

def generate_data():
    # Replace this with whatever data you're generating
    return "A 1.50 0 B"

while True:
    data = generate_data()
    response = requests.post('http://localhost:3000/send', json={'data': data})
    print("Data sent");
    time.sleep(1);