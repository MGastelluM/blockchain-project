# Use the official Node.js image as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Build your TypeScript code
RUN npm run build

# Expose the port your application is running on
EXPOSE 3000

# Command to run your application
CMD [ "npm", "start" ]