import random
import os

# Lists for generating random parts of email addresses
first_names = ['john', 'emma', 'michael', 'sarah', 'david', 'lisa', 'james', 'emily', 'robert', 'olivia']
last_names = ['smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez', 'martinez']
domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com']

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Generate 100 unique email addresses
emails = set()
while len(emails) < 100:
    first = random.choice(first_names)
    last = random.choice(last_names)
    domain = random.choice(domains)
    
    # Different email patterns
    patterns = [
        f"{first}.{last}@{domain}",
        f"{first}{last}@{domain}",
        f"{first}{random.randint(1, 999)}@{domain}",
        f"{first[0]}{last}@{domain}",
        f"{first}.{last}{random.randint(1, 99)}@{domain}"
    ]
    
    emails.add(random.choice(patterns))

# Write emails to file
with open('data/emails.txt', 'w') as f:
    f.write('\n'.join(sorted(emails)))

print(f"Created {len(emails)} email addresses in data/emails.txt")