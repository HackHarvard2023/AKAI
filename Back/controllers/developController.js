import pinecone from '../middleware/connectToPineconeDB.js';
import { embeddText } from '../middleware/embeddText.js';
import { indexExistsInDB } from '../middleware/validateIndex.js';

export async function vectorize_input(req, res) {
    console.log("Received request to vectorize input.")
    const body = req.body;
    let inputs;
    let index;
    let vectors = [];
    let pineconeIndex;
    try {
        index = body.index;
        // Index can only be lowercase letters, and hyphens (-)
        if (!index.match(/^[a-z-]+$/)) {
            return res.status(400).send({error: "Invalid index name, please use only lowercase letters and hyphens (-)."});
        }
        if (!await indexExistsInDB(index)) {
            return res.status(400).send({error: "Index not found."});
        }
        else{
            pineconeIndex = pinecone.Index(index);
        }
        inputs = body.inputs;
        console.log("Inputs received");
        //console.log(inputs);
        // Validate inputs are less than 100
        if (inputs.length > 100) {
            res.status(400).send({error: "Too many inputs, please send less than 100 comments."});
        }
        for (let i = 0; i < inputs.length; i++) {
            console.log(i);
            const response = await embeddText(inputs[i].data);
            vectors.push(response);
        }
        console.log("Vectors generated");
        console.log(await vectors);
        const upsertVectors = []
        for (let i = 0; i < vectors.length; i++) {
            const vector = await vectors[i];
            const id = inputs[i].id;
            upsertVectors.push({
                id: id,
                values: vector,
                metadata: {
                    content : inputs[i].data,
                }
            })
        }
        const upsertRequest = {
            vectors: upsertVectors,
        };
        console.log("Upserting vectors");
        console.log(upsertRequest);
        const upsertResponse = await pineconeIndex.upsert({upsertRequest});
        console.log("Upserted vectors");
        res.status(200).send({message: "Successfully vectorized input.", response: upsertResponse});
    }
    catch (err) {
        console.log(err);
        //console.log("Error vectorizing input.");
        res.status(500).send({error: "Error vectorizing input."});
    }
}