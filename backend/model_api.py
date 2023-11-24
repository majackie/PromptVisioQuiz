# ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

# Import necessary modules
from PIL import Image
import requests
import feedparser
import random
import json
import os
import io

# Define API URL and headers
API_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"
headers = {"Authorization": "Bearer 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"}


# Function to get titles from RSS feed
def get_rss_titles(url):
    titles = []
    feed = feedparser.parse(url)
    for entry in feed.entries:
        titles.append(entry.title)
    return titles


# Function to send a POST request to the API
def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.content


# Function to generate an image from a prompt
def generate_image(prompt):
    image_bytes = query({"inputs": prompt})
    image = Image.open(io.BytesIO(image_bytes))
    return image


# Define RSS feed URL
url = "https://www.cbc.ca/webfeed/rss/rss-canada-britishcolumbia"
# Get titles from RSS feed
rss_titles = get_rss_titles(url)
# Select 4 random titles
random_titles = random.sample(rss_titles, 4)

# Define directory path for results
dir_path = "results"
# Create directory if it doesn't exist
os.makedirs(dir_path, exist_ok=True)
# Define paths for image and data files
image_path = dir_path + "/image.png"
data_path = dir_path + "/titles.json"

# Try to generate an image and save it
try:
    image = generate_image(random_titles[0])
    image.save(image_path)
except FileNotFoundError as e:
    print(e)

# Save titles to a JSON file
data = {"titles": random_titles}
with open(data_path, "w") as f:
    json.dump(data, f)
