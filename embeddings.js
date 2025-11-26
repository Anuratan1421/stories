#!/usr/bin/env node
import "dotenv/config";
import fs from "fs";
import path from "path";

import { PineconeStore } from "@langchain/pinecone";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";

// CONFIG
const STORIES_DIR = "./stories";

async function main() {
  console.log("📚 Reading stories from folder...");

  const files = fs.readdirSync(STORIES_DIR);
  const documents = [];

  for (const file of files) {
    const fullPath = path.join(STORIES_DIR, file);
    const content = fs.readFileSync(fullPath, "utf8");

    documents.push(
      new Document({
        pageContent: content,
        metadata: { title: path.parse(file).name },
      })
    );
  }

  // Connect to Pinecone
  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

  // Mistral embeddings
  const embeddings = new MistralAIEmbeddings({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-embed",
  });

  console.log("🧠 Creating embeddings and storing in Pinecone...");
  await PineconeStore.fromDocuments(documents, embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  console.log("🎉 All stories uploaded successfully into Pinecone (no namespace)!");
}

main().catch(console.error);
