import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import codeBlockRoutes from "./routes/codeBlockRoutes";


dotenv.config();
const BASE_URL = process.env.BASE_URL ;

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI as string); 
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);

    }
}

const app = express();
app.use(cors(
    {
        origin:  ['https://moveo-codeblock.netlify.app', 'http://localhost:5173'],
        credentials: true,
    }
));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/code-blocks", codeBlockRoutes);

export default app;