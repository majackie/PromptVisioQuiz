# ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment


from flask import Flask, jsonify, send_file
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import torch
import feedparser
import random
import json
import os

app = Flask(__name__)
CORS(app)


def get_rss_titles(url):
    titles = []
    feed = feedparser.parse(url)
    for entry in feed.entries:
        titles.append(entry.title)
    return titles


def generate_image(prompt):
    model_id = "runwayml/stable-diffusion-v1-5"
    pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float32)
    pipe = pipe.to("cuda")
    image = pipe(prompt).images[0]
    return image


@app.route("/generate", methods=["GET"])
def generate():
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
        return jsonify({"error": str(e)}), 500

    data = {"titles": random_titles}
    with open(data_path, "w") as f:
        json.dump(data, f)

    return jsonify({"message": "Image generated and titles saved."}), 200


@app.route("/titles", methods=["GET"])
def get_titles():
    data_path = "results/titles.json"
    with open(data_path, "r") as f:
        data = json.load(f)
    return jsonify(data)


@app.route("/image", methods=["GET"])
def get_image():
    image_path = "results/image.png"
    return send_file(image_path, mimetype="image/png")


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=778, debug=True)
