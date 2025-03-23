import http from 'http';
import app, { connectDB } from "./server";
import express from "express";

const PORT = process.env.PORT ;
const server = http.createServer(app);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
    });

}
).catch((error) => {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
});