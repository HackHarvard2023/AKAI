import pinecone from '../middleware/connectToPineconeDB.js';

export async function indexExistsInDB (index) {
    const indexesList = await pinecone.listIndexes();
    console.log(indexesList);
    const list = []
    for (const index of indexesList) {
        list.push(index);
    }
    console.log(list);
    if (!list.includes(index)) {
        console.log("Index not found.");
        return false;
    }
    console.log("Index validated");
    return true;
}