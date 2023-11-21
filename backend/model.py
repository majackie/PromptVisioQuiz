# ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

from diffusers import StableDiffusionPipeline
import torch
import feedparser
import random
import json

def get_rss_titles(url):
    titles = []
    feed = feedparser.parse(url)
    for entry in feed.entries:
        titles.append(entry.title)
    return titles

def generate_image(prompt):
    model_id = "runwayml/stable-diffusion-v1-5"
    pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    pipe = pipe.to("cuda")
    image = pipe(prompt).images[0]
    return image

url = "https://www.cbc.ca/webfeed/rss/rss-canada-britishcolumbia"
rss_titles = get_rss_titles(url)
random_titles = random.sample(rss_titles, 4)

image_path = "images/result.png"
image = generate_image(random_titles[0])
image.save(image_path)

data = {
    "titles": random_titles,
    "image_path": image_path
}
with open('data.json', 'w') as f:
    json.dump(data, f)