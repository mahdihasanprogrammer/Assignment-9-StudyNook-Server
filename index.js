const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// export dotenv and config;
const dotenv = require('dotenv');
dotenv.config();

const express = require('express')
const app = express()
const cors = require('cors');
app.use(cors())
app.use(express.json());
const port = process.env.PORT || 6500



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server running on listening  port ${port}`)
})
