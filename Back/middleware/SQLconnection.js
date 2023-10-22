import knex from 'knex';
import postgis from 'knex-postgis';
import dotenv from "dotenv";
dotenv.config();


export const createUnixSocketPool = () => {
    // if deployed, use the unix socket, else use the host and port
    // Check if deployed
    if (process.env.GOOGLE_CLOUD_PROJECT) {
        // Connect using the unix socket path
        console.log("Connecting to database using unix socket");
        return knex({
            client: 'pg',
            connection: {
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                host: `/cloudsql/${process.env.INSTANCE_UNIX_SOCKET}`,
            },
        });
    } else {
        // Connect using the TCP connection
        console.log("Connecting to database using TCP connection");
        return knex({
            client: 'pg',
            connection: {
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                host: process.env.INSTANCE_HOST,
                port: process.env.DB_PORT,
            },
        });
    }
};


export const db = createUnixSocketPool();
export const st = postgis(db);

