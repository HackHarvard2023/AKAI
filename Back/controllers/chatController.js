//import sintetize_response from '../middleware/sintetize_response.js';
import pinecone from '../middleware/connectToPineconeDB.js';
import { embeddText } from '../middleware/embeddText.js';
import { indexExistsInDB } from '../middleware/validateIndex.js';
import "../middleware/transactions.js";
import {db} from '../middleware/SQLconnection.js';

//import respuesta_estado_base from "../middleware/estadoBase.js";
import dotenv from 'dotenv';
dotenv.config();

import { Configuration, OpenAIApi } from "openai";
import e from 'cors';

const configuration = new Configuration({
    organization: "org-Y3isP71mB16xA5GCjJW1wjbW",
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function chat(req, res){
    console.log("Received request to chat.")
    const r = req.body;
    try {
        const messages = r.messages;
        const response = await generateQuery(messages);
        console.log("Response generated");
        console.log(response);

        let queryResponse = null;

        if (response.function_call){
            // Parse a json
            const temp = JSON.parse(response.function_call.arguments);
            console.log(temp);
            const queries = temp.queries;
            console.log("Queries received");
            console.log(response.function_call)
            console.log(queries);
            queryResponse = await query_db(queries);
            console.log("Query response generated");
            //console.log(queryResponse);
            // Add the query response to the messages, the content only (.metadata.content)
            let responseContent = "";
            const consultedIndexes = []
            for (let i = 0; i < queryResponse.length; i++) {
                responseContent += queryResponse[i].metadata.content + "\n";
                consultedIndexes.push({"idx":queryResponse[i].id, "score": queryResponse[i].score})
            }
            messages.push({ "role": "system", "content": "You are Aristoteles (Aristotle), you got access to very limited sources. DO NOT answer without a source, in that case say it was not found in the database. Given the sources you queried and an user query, answer accordingly. Use only the given information and quote page and document, do not make up anything and do not try answering from memory. Quote your sources as page and document instead of articles. You are Aristoteles (Aristotle), so answer in fisrt person. DO NOT talk about aristoteles in third person. Answer with I statements. Your sources are as follows: \n\n" + responseContent });
            console.log("Messages generated");

            // Use the response to generate a new message answering the user's question
            const finalResponse = await generateResponse(messages);
            res.status(200).send({message: "Successfully queried index.", response: finalResponse, consultedIndexes: consultedIndexes});
        }
        else {
            res.status(200).send({message: "Successfully queried index.", response: response, consultedIndexes: {}});
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).send({error: "Error retrieving index status."});
    }
}

async function query_db(query){
    const pineconeIndex = pinecone.Index("akai");
    const queryVector = await embeddText(query);
    console.log("Query vector generated");
    const queryRequest = {
    vector: await queryVector,
    topK: 10,
    includeValues: false,
    includeMetadata: true,
    indexname: "akai",
    };
    const queryResponse = await pineconeIndex.query({queryRequest});
    console.log("Query response generated");
    //console.log(queryResponse);
    
    // element.id is of the form "filename-pg-#", add 1 to the number to get the page number
    // Use regex to get the number and add 1
    for (let i = 0; i < queryResponse.matches.length; i++) {
        const element = queryResponse.matches[i];
        const regex = /pg-(\d+)/;
        const match = regex.exec(element.id);
        if (match) {
            element.id = element.id.replace(match[1], parseInt(match[1]) + 1);
        }
    }
    const filteredResponse = queryResponse.matches.filter((element) => element.score > 0.79);
    //const filteredResponse = queryResponse.matches;
    filteredResponse.forEach((element) => parseInt(element.id) + 1);
    // Add "Consultado de la constitución en la página " + element.id + 1 + " to the content of each element
    filteredResponse.forEach((element) => element.metadata.content = "Consultado en " + element.id + ". \n\n" + element.metadata.content);
    return filteredResponse;
}

async function generateQuery(in_messages){
    const messages = [
        { "role": "system", "content": "Act as an expert on aristotle work and look for the user's questions by consulting the database. Your only job is to consult the database and return this data. If the given and queried information is not enough or is not related to aristotle or his work, say so. Your function is to determine the correct queries to call the given function." },
    ]
    for (let i = 0; i < in_messages.length; i++) {
        messages.push(in_messages[i]);
    }
    const params = {
        "model": "gpt-3.5-turbo-0613",
        "messages": messages,
        "functions": [
            {
                "name": "query_db",
                "description": "Given the user queries, generate text query to match it to aristotle life, thinking or work (act as if he is talking to aristotle, since this is role playing teaching) and embedd it to look for matching vectors in the database. You are trying to match the user's question with the work and life or aristotle. Return the content and index of the matches. Do not answer the question but look for the information in the database.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "queries": {
                            "type": "string",
                            "description": "What the user is looking for, not necessarily a question or what the user said. Its a query to consult either the life, thinking or the work of aristotle",
                        },
                    },
                    "required": ["queries"]
                }
            }
        ],
        function_call:"auto",
    };
    console.log("params:",params)
    const chatCompletion = await openai.createChatCompletion(params);
    console.log(chatCompletion.data.choices[0].message);
    return chatCompletion.data.choices[0].message;
};

async function generateResponse(messages){ 
    console.log("Generating response");
    const chatCompletion = await openai.createChatCompletion(
        {"model": "gpt-3.5-turbo-16k",
        "messages": messages
        }
    );
    console.log("Response generated");
    console.log(chatCompletion.data.choices[0].message);
    return chatCompletion.data.choices[0].message;
}