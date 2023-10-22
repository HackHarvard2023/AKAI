import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import developRoutes from "./routes/developRoutes.js";
import express from "express";
const app = express();  

app.use(cors());
app.use(express.json());
app.use("/api",chatRoutes);
app.use("/develop", developRoutes);

// default get show message
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the API." });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    
    });
