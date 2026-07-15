# Test plan
# Parent spawns python child
# Parent feeds python child ranging data
# python child does multilat calculation.
# python child sends back calculation to JS parent.

## Worker pattern

import sys
import json
import localization as lx

# Multilat solver
P = lx.Project(mode="3D", solver="LSE")

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

    formattedData = {
        "id": 0,
        "x": target.loc.x,
        "y": target.loc.y,
        "z": target.loc.z
    }

    return formattedData

print("Python worker ready", flush=True)

anchorNames = ["A0", "A1", "A2", "A3"]

anchorLocation = [
    (100, 50, 20),
    (130, 50, 20),
    (100, 80, 20),
    (100, 50, 50)
]

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    ranging = json.loads(line)
    output = multilatSolver(anchorNames, anchorLocation, ranging)
    # Process the input
    result = json.dumps(output)
    # result = f"Processed: {output}"
    print(result, flush=True)  # flush=True is essential

print("child2.py END")