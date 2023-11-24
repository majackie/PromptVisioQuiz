from flask import Flask
import subprocess

app = Flask(__name__)

@app.route('/model')
def generate():
    subprocess.call(['python', 'model_local.py'])
    return {"message": "model_local.py successful"}, 200

if __name__ == '__main__':
    app.run(port=5000)