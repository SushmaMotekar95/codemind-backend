# Use Node.js as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy all application files into the container
COPY . .

# Expose the application port
EXPOSE 3000

# Specify the entry point for the application
CMD ["node", "app.js"]