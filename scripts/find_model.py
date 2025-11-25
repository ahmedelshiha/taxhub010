
import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if re.search(r'model\s+Task\s*\{', line):
        print(f"Found Task at line {i+1}: {line.strip()}")
        # Print next few lines to check for @@ignore
        for j in range(1, 20):
            if i+j < len(lines):
                print(f"  {lines[i+j].strip()}")
    if re.search(r'model\s+TaskComment\s*\{', line):
        print(f"Found TaskComment at line {i+1}: {line.strip()}")
