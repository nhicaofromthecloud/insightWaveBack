import random
from datetime import datetime, timedelta
import csv

# Read the mock reviews
with open('data/mockReviewNegative.txt', 'r', encoding='utf-8') as f:
    negative_reviews = f.readlines()

with open('data/mockReviewPositive.txt', 'r', encoding='utf-8') as f:
    positive_reviews = f.readlines()

# Read emails
with open('data/emails.txt', 'r') as f:
    emails = f.readlines()
    emails = [email.strip() for email in emails]

# Sample 150 reviews from each category
sampled_negative = random.sample(negative_reviews, 150)
sampled_positive = random.sample(positive_reviews, 150)

# Combine and shuffle reviews
all_reviews = sampled_negative + sampled_positive
random.shuffle(all_reviews)

# Generate random dates between Jan 1, 2024 and Nov 15, 2024
start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 11, 15)
date_range = (end_date - start_date).days

# Create review objects
reviews = []
for i, review in enumerate(all_reviews):
    random_days = random.randint(0, date_range)
    random_hour = random.randint(0, 23)
    random_minute = random.randint(0, 59)
    random_second = random.randint(0, 59)
    
    review_date = start_date + timedelta(days=random_days)
    review_date = review_date.replace(hour=random_hour, minute=random_minute, second=random_second)
    
    reviews.append({
        'id': i + 1,
        'email': random.choice(emails),
        'review': review.strip(),
        'date': review_date.strftime('%Y-%m-%d %H:%M:%S')
    })

# Sort reviews by date
reviews.sort(key=lambda x: x['date'])

# Save to CSV file
with open('data/generated_reviews.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['id', 'email', 'review', 'date'])
    writer.writeheader()
    writer.writerows(reviews)