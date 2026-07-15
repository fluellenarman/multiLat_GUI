import localization as lx

# Create a 3D project
P = lx.Project(mode="3D", solver="LSE")

# process string into usable input for multilatSovler
def preProcess(received):
    # It's a string
    

# Multilat solver
def multilatSolver(anchorNames, anchorLocation, ranging):
    # Add anchors
    P.add_anchor(anchorNames[0], anchorLocation[0])
    P.add_anchor(anchorNames[1], anchorLocation[1])
    P.add_anchor(anchorNames[2], anchorLocation[2])
    P.add_anchor(anchorNames[3], anchorLocation[3])

    # Add target
    target, label = P.add_target()

    # Add range measurements
    target.add_measure(anchorNames[0], ranging[0])
    target.add_measure(anchorNames[1], ranging[1])
    target.add_measure(anchorNames[2], ranging[2])
    target.add_measure(anchorNames[3], ranging[3])

    # Solve
    P.solve()

    print(target.loc)

print("Starting multilateration test")

anchorNames = ["A0", "A1", "A2", "A3"]

anchorLocation = [
    (100, 50, 20),
    (130, 50, 20),
    (100, 80, 20),
    (100, 50, 50)
]

# Read from stdin line by line
for line in sys.stdin:
    received = line.strip()
    # print(f"Child received: {received}", flush=True)
    
    # Process the data (example: convert to uppercase)
    multilatSolver(anchorNames, anchorLocation, ranging)
    
    # Send response back to parent
