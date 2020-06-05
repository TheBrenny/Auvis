const express = require("express");
const app = express();
const port = 28847;

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + "/"));

app.listen(port, () => console.log("Started! Connect to\n\thttp://localhost:" + port + ""));