import app from "./app.js";
import "dotenv/config"

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send("Thank you for using yourLeet platform.")
})

app.get("/healthcheck", (req, res) => {
    res.send("Working fine.")
})

app.listen(PORT, () => {
    console.log(`Our yourLeet platform is running on port: ${PORT} in localhost.`)
})
