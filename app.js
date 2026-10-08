import express from "express"
import cors from "cors"
import authRoutes from "./src/routes/authRoute.js"
import UserRoutes from "./src/routes/userRoutes.js"
import RestaurantRoute from "./src/routes/restaurantRoutes.js"
import CategoryRoute from "./src/routes/categoryRoutes.js"
import MenuRoutes from "./src/routes/menuRoutes.js"

const app = express()


app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/users", UserRoutes)
app.use("/api/restaurants", RestaurantRoute)
app.use("/api/restaurants", CategoryRoute)
app.use("/api/restaurants", MenuRoutes)

app.get("/", (req, res) => {
    res.json({
        message: "Restaurant backend started"
    })
})

export default app


