import {db} from './SQLconnection.js';

export async function getTransactions (user) {
    try{
        let toReturn = {
            balance: 0,
            transactions: []
        }
        // return the balance of the user and a list of transactions
        const result = await db('transactions').where({user_id: user});
        console.log(result);
        result.forEach((transaction) => {
            toReturn.balance += transaction.amount;
            toReturn.transactions.push(transaction);
        });
        return toReturn;
    }
    catch(err){
        console.log(err);
    }
}

export async function createNewTransaction(amount, sender, receiver){
    try{
        // create a new transaction using knex
        let result = [];
        result.push(await db('transactions').insert({
            amount: -amount,
            user_id: sender,
            place: "Transferencia"
        }));
        result.push(await db('transactions').insert({
            amount: amount,
            user_id: receiver,
            place: "Transferencia"
        }));
        return result;
    }
    catch(err){
        console.log(err);
    }
}