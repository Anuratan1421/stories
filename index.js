#!/usr/bin/env node
import "dotenv/config";
import readline from "readline";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { MistralAIEmbeddings, ChatMistralAI } from "@langchain/mistralai";

const INDEX_NAME = process.env.PINECONE_INDEX;

function askUser(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => {
    rl.close();
    resolve(ans.trim().toLowerCase());
  }));
}

async function getCharacterInfo(characterName) {
  console.log(`🔍 Searching for character: ${characterName}`);

  const pinecone = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY });
  const pineconeIndex = pinecone.Index(INDEX_NAME);

  const embeddings = new MistralAIEmbeddings({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-embed",
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });

  // Get ALL 5 stories
  const results = await vectorStore.similaritySearch(characterName, 5);

  if (!results.length) {
    return { error: "No stories found in database." };
  }

  const chat = new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-large-latest",
    temperature: 0.1,
  });

  // STEP 1: Check each story for character matches
  console.log(`📚 Checking ${results.length} stories...`);
  
  const characterMatches = [];

  for (const result of results) {
    const storyText = result.pageContent;
    const storyTitle = result.metadata?.title || "Unknown";

    // Ask LLM if this story contains the character (or similar name)
    const checkPrompt = `
Does this story contain a character whose name matches or partially matches "${characterName}"?

Consider:
- Exact matches
- Partial matches (e.g., "christ" matches "Christiana", "Christian", "Christopher")
- Case-insensitive matching

Story:
${storyText}

Respond with ONLY a JSON object:
{
  "hasMatch": true or false,
  "characterName": "exact name from story" or null,
  "confidence": "high" or "medium" or "low"
}`;

    const checkResponse = await chat.invoke(checkPrompt);
    
    try {
      const cleaned = checkResponse.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const match = JSON.parse(cleaned);
      
      if (match.hasMatch && match.characterName) {
        characterMatches.push({
          characterName: match.characterName,
          storyTitle: storyTitle,
          storyText: storyText,
          confidence: match.confidence
        });
        console.log(`  ✓ Found "${match.characterName}" in "${storyTitle}"`);
      }
    } catch (e) {
      // Skip parsing errors
    }
  }

  if (characterMatches.length === 0) {
    return { error: "The input character name is not found in any story." };
  }

  // STEP 2: Pick the best match
  let selectedMatch;
  
  if (characterMatches.length === 1) {
    selectedMatch = characterMatches[0];
  } else {
    // Multiple matches - pick the one with highest confidence or closest name match
    console.log(`\n💡 Found ${characterMatches.length} possible matches:`);
    characterMatches.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.characterName} (in "${m.storyTitle}")`);
    });
    
    // Pick best match based on string similarity
    selectedMatch = characterMatches.reduce((best, current) => {
      const bestScore = getMatchScore(characterName, best.characterName);
      const currentScore = getMatchScore(characterName, current.characterName);
      return currentScore > bestScore ? current : best;
    });
  }

  console.log(`\n🎯 Best match: ${selectedMatch.characterName}`);

  // STEP 3: Confirm with user if not exact match
  const inputLower = characterName.toLowerCase();
  const selectedLower = selectedMatch.characterName.toLowerCase();
  
  if (inputLower !== selectedLower) {
    const answer = await askUser(`❓ Did you mean **${selectedMatch.characterName}** ? (yes/no): `);
    if (answer !== "yes") {
      return { error: "Character not found." };
    }
  }

  // STEP 4: Extract full character details
  const detailPrompt = `
Extract character details ONLY based on the story text below.
Return VALID JSON ONLY in this exact format:

{
  "name": "",
  "storyTitle": "",
  "summary": "",
  "relations": [],
  "characterType": ""
}

Character: "${selectedMatch.characterName}"
Story title: "${selectedMatch.storyTitle}"

Story Text:
${selectedMatch.storyText}

JSON response:`;

  const detailResponse = await chat.invoke(detailPrompt);

  const cleaned = detailResponse.content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

// Helper function to calculate string similarity
function getMatchScore(search, target) {
  const searchLower = search.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // Exact match
  if (searchLower === targetLower) return 100;
  
  // Target starts with search term
  if (targetLower.startsWith(searchLower)) return 90;
  
  // Target contains search term
  if (targetLower.includes(searchLower)) return 80;
  
  // Search term contains target (less likely but possible)
  if (searchLower.includes(targetLower)) return 70;
  
  // Levenshtein-like simple scoring
  let matches = 0;
  for (let i = 0; i < searchLower.length; i++) {
    if (targetLower.includes(searchLower[i])) matches++;
  }
  return (matches / searchLower.length) * 60;
}

// CLI
const input = process.argv[2];
if (!input) {
  console.log("Usage: node index.js \"Character Name\"");
  process.exit(1);
}

getCharacterInfo(input)
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(err => console.error("❌ Error:", err));