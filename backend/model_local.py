# ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

# Import necessary modules
from diffusers import StableDiffusionPipeline
import torch
import feedparser
import random
import json
import os


# Function to get titles from RSS feed
def get_rss_titles(url):
    titles = []
    feed = feedparser.parse(url)
    for entry in feed.entries:
        titles.append(entry.title)
    return titles


# Function to generate an image from a prompt using a pretrained model
def generate_image(prompt):
    model_id = "runwayml/stable-diffusion-v1-5"
    pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    pipe = pipe.to("cuda")
    image = pipe(prompt).images[0]
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
