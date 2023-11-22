# ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

from PIL import Image
import requests
import feedparser
import random
import json
import os
import io

API_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"
headers = {"Authorization": "Bearer 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"}

def get_rss_titles(url):
    titles = []
    feed = feedparser.parse(url)
    for entry in feed.entries:
        titles.append(entry.title)
    return titles

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.content

def generate_image(prompt):
    image_bytes = query({"inputs": prompt})
    image = Image.open(io.BytesIO(image_bytes))
    return image

url = "https://www.cbc.ca/webfeed/rss/rss-canada-britishcolumbia"
rss_titles = get_rss_titles(url)
random_titles = random.sample(rss_titles, 4)

dir_path = "results"
os.makedirs(dir_path, exist_ok=True)
image_path = dir_path + "/image.png"
data_path = dir_path + "/titles.json"

try:
    image = generate_image(random_titles[0])
    image.save(image_path)
except FileNotFoundError as e:
    print(e)

data = {"titles": random_titles}
with open(data_path, "w") as f:
    json.dump(data, f)
