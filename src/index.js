// require ('dotenv').config({path: './env'})

import dotenv from 'dotenv'
import connectDB from './db/index.js'
dotenv.config({
    path: './env'
})

connectDB()
.then(() => {

    app.on("error", (error) =>{
        console.log("ERROR: ", error);
        throw error
    })
    app.listen(process.env.PORT || 8000 , () =>{
        console.log(`Server is running at port ${process.env.PORT}`);
        
    })
})
.catch((err) => {
    console.log("MONGODB connection failed !!", err);
    
})













/*
import express from 'express';
const app = express();

//iife
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
            // if by any chance express couldn't able to communicate with database properly or throw some errors 
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("ERROR: ", error);
        throw error;
    }
})()
*/