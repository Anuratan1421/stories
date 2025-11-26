# Story Character Search

A Node.js application that uses AI embeddings and vector search to find and extract character information from stories. The system stores stories in Pinecone vector database and uses Mistral AI for intelligent character matching and information extraction.

## Features

- 📚 Loads multiple story files from a directory
- 🧠 Creates embeddings using Mistral AI
- 🔍 Performs intelligent character search with partial name matching
- 💬 Interactive confirmation for ambiguous matches
- 📊 Extracts detailed character information including relationships and summaries

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Pinecone account (free tier available)
- Mistral AI API key



## Setup Instructions

### 1. Clone/Create Project

```bash
mkdir story-character-search
cd story-character-search
```

### 2. Install Dependencies

```bash
npm init -y
npm install dotenv @pinecone-database/pinecone @langchain/pinecone @langchain/mistralai @langchain/core
or
Check for package.json in github and command npm install
```

### 3. Get API Keys

#### Pinecone API Key:
1. Go to [pinecone.io](https://www.pinecone.io/)
2. Sign up for a free account
3. Create a new project
4. Create a new index with these settings:
   - **Name**: `stories` (or your preferred name)
   - **Dimensions**: `1024` (for mistral-embed model)
   - **Metric**: `cosine`
   - **Cloud**: `aws` (or your preference)
   - **Region**: `us-east-1` (or your preference)
5. Copy your API key from the dashboard

#### Mistral AI API Key:
1. Go to [console.mistral.ai](https://console.mistral.ai/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=stories
MISTRAL_API_KEY=your_mistral_api_key_here
```

### 5. Add Story Files

Create a `stories` folder and add your story text files:

```bash
mkdir stories
```

Add your story files (`.txt` format) to the `stories` folder. Based on your structure:
- `a-mother.txt`
- `sorrow.txt`
- `the-lantern-keeper.txt`
- `the-poor-relation.txt`
- `the-schoolmistress.txt`

### 6. Update package.json

Add the following to enable ES modules:

```json
{
  "type": "module",
  "scripts": {
    "embed": "node embeddings.js",
    "search": "node index.js"
  }
}
```

## Usage

### Step 1: Upload Stories to Pinecone

Run the embeddings script to process and upload all stories:

```bash
npm run embed
```

Or directly:

```bash
node embeddings.js
```

**Expected output:**
```
📚 Reading stories from folder...
🧠 Creating embeddings and storing in Pinecone...
🎉 All stories uploaded successfully into Pinecone (no namespace)!
```

**Note:** This only needs to be done once, or whenever you add/update stories.

### Step 2: Search for Characters

Search for a character by name:

```bash
npm run search "Character Name"
```

Or directly:

```bash
node index.js "Christian"
node index.js "christ"  # Partial match works too
```

**Example output:**
```
🔍 Searching for character: christ
📚 Checking 5 stories...
  ✓ Found "Christian" in "the-pilgrims-progress"
  ✓ Found "Christiana" in "the-pilgrims-progress-part-2"

💡 Found 2 possible matches:
  1. Christian (in "the-pilgrims-progress")
  2. Christiana (in "the-pilgrims-progress-part-2")

🎯 Best match: Christian
❓ Did you mean **Christian** ? (yes/no): yes

{
  "name": "Christian",
  "storyTitle": "the-pilgrims-progress",
  "summary": "A pilgrim who journeys from the City of Destruction...",
  "relations": ["Evangelist", "Faithful", "Hopeful"],
  "characterType": "protagonist"
}
```

## Project Structure

```
story-character-search/
├── stories/                  # Story text files
│   ├── a-mother.txt
│   ├── sorrow.txt
│   └── ...
├── .env                      # Environment variables (create this)
├── embeddings.js            # Script to upload stories to Pinecone
├── index.js                 # Main character search script
├── package.json             # Node.js dependencies
└── README.md               # This file
```

## How It Works

1. **Embedding Process** (`embeddings.js`):
   - Reads all `.txt` files from the `stories` folder
   - Creates vector embeddings using Mistral's `mistral-embed` model
   - Stores embeddings in Pinecone with metadata (story title)

2. **Search Process** (`index.js`):
   - Takes character name as input
   - Performs similarity search in Pinecone (retrieves top 5 stories)
   - Uses Mistral AI to check each story for character matches
   - Handles partial name matching (e.g., "christ" finds "Christian")
   - Prompts user confirmation for ambiguous matches
   - Extracts detailed character information using LLM

## Troubleshooting

### "No stories found in database"
- Run `npm run embed` first to upload stories
- Check that your Pinecone index name in `.env` matches the actual index

### "Invalid API key" errors
- Verify your API keys in `.env` are correct
- Make sure there are no spaces or quotes around the keys

### Dimension mismatch errors
- Ensure your Pinecone index is configured with `1024` dimensions
- This matches the Mistral `mistral-embed` model output

### Module not found errors
- Run `npm install` to ensure all dependencies are installed
- Check that `"type": "module"` is in your `package.json`

### Stories not being read
- Verify the `stories` folder exists
- Check that story files are `.txt` format
- Ensure files have content and are UTF-8 encoded

## Cost Considerations

- **Pinecone**: Free tier includes 1 index with up to 100,000 vectors
- **Mistral AI**: Pay-as-you-go pricing
  - `mistral-embed`: ~$0.0001 per 1K tokens
  - `mistral-large-latest`: ~$0.008 per 1K tokens


### Use Different Mistral Models

Replace `mistral-large-latest` with:
- `mistral-small-latest` (faster, cheaper)
- `mistral-medium-latest` (balanced)
Or 
OpenAI embeddings, google-embeddings

