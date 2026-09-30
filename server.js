import { configDotenv } from "dotenv";
import app from "./app.js";
import connectDb from "./src/config/db.js";

configDotenv()


const PORT = process.env.PORT_NUMBER || 3001



connectDb()

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})






