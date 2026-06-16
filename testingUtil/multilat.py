import localization as lx

# Create a 3D project
P = lx.Project(mode="3D", solver="LSE")

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

ranging = [
    23.53720459187964,
    25.826343140289914,
    24.596747752497688,
    21.470910553583888
]

multilatSolver(anchorNames, anchorLocation, ranging)