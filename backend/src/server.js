import app from "./app.js";
import "dotenv/config"
import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problems.route.js";
import codeExecutionRoutes from "./routes/execute.route.js";

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send("Thank you for using yourLeet platform.")
})

app.get("/healthcheck", (req, res) => {
    res.send("Working fine.")
})

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/problems", problemRoutes)
app.use("/api/v1/code", codeExecutionRoutes)
//TODO: app.use("/u/username", getUser)



app.listen(PORT, () => {
    console.log(`Our yourLeet platform is running on port: ${PORT} in localhost.`)
})
