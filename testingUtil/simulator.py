import requests
import time

def generate_data(anchor):
    # Replace this with whatever data you're generating
    return anchor + " 1.50 0 B"

while True:
    data = generate_data("A")
    response = requests.post('http://localhost:3000/send', json={'data': data})
    data = generate_data("B")
    response = requests.post('http://localhost:3000/send', json={'data': data})
    data = generate_data("C")
    response = requests.post('http://localhost:3000/send', json={'data': data})
    data = generate_data("D")
    response = requests.post('http://localhost:3000/send', json={'data': data})
    print("Data sent");
    time.sleep(1);

