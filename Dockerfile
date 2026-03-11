FROM node:22-bullseye-slim

# Install necessary dependencies, including binwalk and strings
RUN apt-get update && apt-get install -y \
    binwalk \
    binutils \
    && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy application source code
COPY . .

# Build the Next.js application
#RUN npm run build

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["npm", "start"]
