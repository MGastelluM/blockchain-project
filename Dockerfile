# Use an official Node.js Alpine image as a base
FROM node:18
# Set the working directory in the container
#RUN apk add --no-cache python3 py3-pip make g++
# Set the working directory in the container
WORKDIR /.

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY tsconfig*.json ./

# Copy the entire project to the working directory
COPY . .
# Install project dependencies
RUN npm install

# Expose the port your app runs on
EXPOSE 3000:10000

# Command to run your TypeScript application using ts-node
CMD ["sh", "-c", "npm start $node_name"]


