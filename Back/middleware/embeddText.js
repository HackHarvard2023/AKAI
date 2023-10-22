

import axios from 'axios';
const API_KEY = process.env.OPENAI_API_KEY;

export const embeddText = async (query) => {
    if (!API_KEY) {
        console.log("No API key found");
        return false;
    }
    const response = await axios.post(
        "https://api.openai.com/v1/embeddings", 
        {
        "model": "text-embedding-ada-002",
        "input": query,
    },
    {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    console.log("Text embedding generated");
    return await response.data.data[0].embedding;
}
