import { PineconeClient } from "@pinecone-database/pinecone";
import dotenv from 'dotenv';
dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENV;

const pinecone = new PineconeClient();
await pinecone.init({
    environment: PINECONE_ENVIRONMENT,
    apiKey: PINECONE_API_KEY,
});

if (!pinecone) throw Error("Pinecone client failed to initialize");

console.log("Pinecone client initialized");

export default pinecone;