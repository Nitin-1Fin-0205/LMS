# ---- Base Node Image ----
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Optional: Debug file existence
RUN ls -l src/models/ && cat src/models/customerModel.js

# Build the app
RUN npm run build

# Start with preview
CMD ["npm", "run", "preview"]

