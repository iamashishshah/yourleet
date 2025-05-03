import app from "./app.js";
import "dotenv/config"
import authRoutes from "./routes/auth.route.js";

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send("Thank you for using yourLeet platform.")
})

app.get("/healthcheck", (req, res) => {
    res.send("Working fine.")
})

app.use("/api/v1/auth", authRoutes)




app.listen(PORT, () => {
    console.log(`Our yourLeet platform is running on port: ${PORT} in localhost.`)
})
