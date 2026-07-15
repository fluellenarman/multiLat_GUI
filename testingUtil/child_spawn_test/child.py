import sys, json
import time

def processData(data):
    return data.upper()

# Read from stdin line by line
for line in sys.stdin:
    received = line.strip()
    # print(f"Child received: {received}", flush=True)
    
    # Process the data (example: convert to uppercase)
    processed = processData(received)
    
    # Send response back to parent
    print(f"Child processed: {processed}", flush=True)