import express from "express"

const app = express();

app.get("/" , (req , res)=> {
    res.send("Hello Welcome to auth service")
})
export default app;