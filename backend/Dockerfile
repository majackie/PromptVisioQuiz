# Start with a base image that has Python 3.11.
FROM python:3.11

# Create app directory in the Docker image.
WORKDIR /usr/src/app

# Copy the Python requirements file.
COPY requirements.txt ./

# Install Python dependencies.
RUN pip install -r requirements.txt

# Install Node.js and npm.
RUN apt-get update && apt-get install -y nodejs npm

# Copy the Node.js package files and install Node.js dependencies.
COPY package*.json ./
RUN npm install

# Copy the rest of your application's code.
COPY . .

# Expose port 3000.
EXPOSE 3000

# Set the start command.
CMD [ "npm", "start" ]