# 📚 Story Character Search

A powerful Node.js application that uses **AI embeddings** and **vector search** to find and extract character information from stories. The system stores stories in Pinecone vector database and leverages Mistral AI for intelligent character matching and information extraction.




## ✨ Features

- 📚 **Multi-Story Loading** - Automatically loads all story files from a directory
- 🧠 **AI-Powered Embeddings** - Creates semantic embeddings using Mistral AI
- 🔍 **Smart Character Search** - Finds characters with partial name matching
- 💬 **Interactive Confirmation** - Prompts user for ambiguous matches
- 📊 **Detailed Extraction** - Returns character summaries, relationships, and types
- 🛡️ **Robust Error Handling** - Gracefully handles edge cases

## 🎯 Edge Cases Handled

This application intelligently handles various scenarios:

✅ **Partial Name Matching** - Search "mart" to find "Martyana" or "Maritana"  
✅ **Multiple Matches** - Shows all candidates and prompts for confirmation  
✅ **Character Not Found** - Clear feedback when no matches exist  
✅ **Misspelled Names** - Fuzzy matching finds similar character names  
✅ **Ambiguous Input** - Interactive yes/no confirmation for best match  
✅ **Empty Results** - Handles cases when database has no stories loaded

### Example: Finding a Character

```bash
$ node index.js "martyano"
🔍 Searching for character: martyano
📚 Checking 5 story segments...
  ✓ Found match candidate: "Matryona" from "sorrow"
  ✓ Found match candidate: "Maritana" from "a-mother"

🎯 Potential best match: Matryona
❓ Did you mean **Matryona**? (yes/no): yes

{
  "name": "Matryona",
  "storyTitle": "sorrow",
  "summary": "Matryona is Grigory Petrov's aging wife...",
  "relations": [
    { "name": "Grigory Petrov", "relation": "husband" },
    { "name": "Pavel Ivanitch", "relation": "doctor" }
  ],
  "characterType": "Supporting"
}
```

## 🚀 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Pinecone account** ([free tier available](https://www.pinecone.io/))
- **Mistral AI API key** ([sign up here](https://console.mistral.ai/))

---

## 📦 Setup Instructions

### Step 1: Clone/Create Project

```bash
mkdir story-character-search
cd story-character-search
```

### Step 2: Install Dependencies

**Option A - Using package.json:**
```bash
npm install
```

**Option B - Manual installation:**
```bash
npm init -y
npm install dotenv @pinecone-database/pinecone @langchain/pinecone @langchain/mistralai @langchain/core
```

### Step 3: Get API Keys

#### 🔑 Pinecone API Key

1. Go to [pinecone.io](https://www.pinecone.io/)
2. Sign up for a **free account**
3. Create a new project
4. Create a new index with these **exact settings**:
   - **Name**: `stories`
   - **Dimensions**: `1024` (for mistral-embed model)
   - **Metric**: `cosine`
   - **Cloud**: `aws`
   - **Region**: `us-east-1`
5. Copy your **API key** from the dashboard

#### 🔑 Mistral AI API Key

1. Go to [console.mistral.ai](https://console.mistral.ai/)
2. Sign up for an account
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy and save the key securely

### Step 4: Configure Environment Variables

Create a **`.env`** file in the project root:

```env
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=stories
MISTRAL_API_KEY=your_mistral_api_key_here
```

⚠️ **Important:** Never commit your `.env` file to version control!

### Step 5: Add Story Files

Create a `stories` folder and add your `.txt` files:

```bash
mkdir stories
```

Add your story files:
```
stories/
├── a-mother.txt
├── sorrow.txt
├── the-lantern-keeper.txt
├── the-poor-relation.txt
└── the-schoolmistress.txt
```

### Step 6: Update package.json

Ensure your `package.json` includes:

```json
{
  "type": "module",
  "scripts": {
    "embed": "node embeddings.js",
    "search": "node index.js"
  }
}
```

---

## 🎮 Usage

### **Step 1: Upload Stories to Pinecone** (One-time setup)

Run the embeddings script to process and upload all stories:

```bash
npm run embed
```

**Expected output:**
```
📚 Reading stories from folder...
🧠 Creating embeddings and storing in Pinecone...
✅ Processed: a-mother.txt
✅ Processed: sorrow.txt
✅ Processed: the-lantern-keeper.txt
🎉 All stories uploaded successfully!
```

> **Note:** This only needs to be done **once**, or when you add/update stories.

---

### **Step 2: Search for Characters**

Search for any character by name (full or partial):

```bash
npm run search "Character Name"
```

**Examples:**

```bash
# Full name search
node index.js "Christian"

# Partial name search (fuzzy matching)
node index.js "christ"
node index.js "mart"

# Handles misspellings
node index.js "martyano"  # Finds "Matryona"
```

---

## 📊 Example Outputs

### ✅ Successful Match

```bash
$ node index.js "Matryona"
🔍 Searching for character: Matryona
📚 Checking 5 story segments...
  ✓ Found "Matryona" in "sorrow"

✨ Exact match found!

{
  "name": "Matryona",
  "storyTitle": "sorrow",
  "summary": "Matryona is Grigory Petrov's aging wife, enduring decades of poverty, abuse, and neglect.",
  "relations": [
    { "name": "Grigory Petrov", "relation": "husband" },
    { "name": "Pavel Ivanitch", "relation": "doctor" }
  ],
  "characterType": "Supporting"
}
```

### ⚠️ Multiple Matches

```bash
$ node index.js "christ"
🔍 Searching for character: christ
📚 Checking 5 stories...
  ✓ Found "Christian" in "the-pilgrims-progress"
  ✓ Found "Christiana" in "the-pilgrims-progress-part-2"

💡 Found 2 possible matches:
  1. Christian (in "the-pilgrims-progress")
  2. Christiana (in "the-pilgrims-progress-part-2")

🎯 Best match: Christian
❓ Did you mean **Christian**? (yes/no): yes

{
  "name": "Christian",
  "storyTitle": "the-pilgrims-progress",
  "summary": "A pilgrim on a spiritual journey...",
  "relations": ["Evangelist", "Faithful", "Hopeful"],
  "characterType": "protagonist"
}
```

### ❌ Character Not Found

```bash
$ node index.js "Gandalf"
🔍 Searching for character: Gandalf
📚 Checking 5 story segments...

❌ No character named "Gandalf" found in any story.

💡 Suggestions:
  - Check the spelling
  - Try a partial name (e.g., "Gand")
  - List available characters with: npm run search ""
```

---

## 🏗️ Project Structure

```
story-character-search/
├── stories/                  # 📁 Story text files (.txt)
│   ├── a-mother.txt
│   ├── sorrow.txt
│   ├── the-lantern-keeper.txt
│   ├── the-poor-relation.txt
│   └── the-schoolmistress.txt
├── .env                      # 🔐 Environment variables (create this)
├── .gitignore               # 🚫 Git ignore file
├── embeddings.js            # 📤 Script to upload stories
├── index.js                 # 🔍 Main character search script
├── package.json             # 📦 Dependencies & scripts
└── README.md               # 📖 This file
```

---

## 🔧 How It Works

### **1. Embedding Process** (`embeddings.js`)

1. Reads all `.txt` files from the `stories` folder
2. Splits large stories into manageable chunks
3. Creates vector embeddings using Mistral's **`mistral-embed`** model (1024 dimensions)
4. Stores embeddings in **Pinecone** with metadata (story title, chunk info)

### **2. Search Process** (`index.js`)

1. Takes character name as command-line input
2. Performs **similarity search** in Pinecone (retrieves top 5 relevant stories)
3. Uses **Mistral AI** (LLM) to intelligently check each story for character matches
4. Implements **partial name matching** (e.g., "mart" → "Martyana", "Maritana")
5. Shows all candidates if multiple matches found
6. Prompts **user confirmation** for ambiguous matches (best match suggestion)
7. Extracts **detailed character information** using structured LLM output

---

## 🐛 Troubleshooting

### ❌ "No stories found in database"

**Solution:**
- Run `npm run embed` first to upload stories
- Verify your Pinecone index name in `.env` matches the actual index
- Check that stories were uploaded successfully

### ❌ "Invalid API key" errors

**Solution:**
- Verify API keys in `.env` are correct (no extra spaces/quotes)
- Test keys independently on their respective platforms
- Regenerate keys if necessary

### ❌ Dimension mismatch errors

**Solution:**
- Ensure Pinecone index is configured with **`1024` dimensions**
- This matches Mistral's `mistral-embed` model output
- Recreate index if dimensions are incorrect

### ❌ Module not found errors

**Solution:**
```bash
npm install  # Reinstall all dependencies
```
- Verify `"type": "module"` is in `package.json`

### ❌ Stories not being read

**Solution:**
- Verify `stories` folder exists in project root
- Check files are `.txt` format
- Ensure files have content and are **UTF-8 encoded**
- Check file permissions

### ❌ Character search returns no results

**Solution:**
- Run `npm run embed` to ensure stories are uploaded
- Try partial name matching
- Check story files contain the character you're searching for
- Verify Pinecone index has vectors: check dashboard

---

## 💰 Cost Considerations

### **Pinecone** (Vector Database)
- **Free Tier**: 1 index, up to 100,000 vectors
- **Perfect for**: Small to medium story collections
- **Paid Tiers**: Start at $70/month for production use

### **Mistral AI** (Embeddings & LLM)
- **`mistral-embed`**: ~$0.0001 per 1K tokens (very cheap)
- **`mistral-large-latest`**: ~$0.008 per 1K tokens
- **Estimated cost for 5 stories**: < $0.10 for embedding + search

💡 **Tip:** Use `mistral-small-latest` for cheaper LLM calls during development.

---

## 🔄 Alternative Configurations

### Use Different Embedding Models

Replace Mistral embeddings with:

**OpenAI:**
```javascript
import { OpenAIEmbeddings } from "@langchain/openai";
const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small", // 1536 dimensions
});
```

**Google:**
```javascript
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001", // 768 dimensions
});
```

⚠️ **Remember:** Adjust Pinecone index dimensions to match your model!

### Use Different LLM Models

Replace `mistral-large-latest` with:
- **`mistral-small-latest`** - Faster, cheaper
- **`mistral-medium-latest`** - Balanced performance
- **OpenAI GPT-4** - Higher quality, more expensive

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



---

## 🎓 Learning Resources

- [Pinecone Documentation](https://docs.pinecone.io/)
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [LangChain Documentation](https://js.langchain.com/)
- [Vector Embeddings Guide](https://www.pinecone.io/learn/vector-embeddings/)

---

## 📧 Support

Having issues? Here's how to get help:

1. **Check Troubleshooting** section above
2. **Review example outputs** to compare with your results
3. **Open an issue** on GitHub with:
   - Your error message
   - Steps to reproduce
   - Environment details (Node version, OS)





