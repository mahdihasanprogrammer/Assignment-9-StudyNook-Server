const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// export dotenv and config;
const dotenv = require('dotenv');
dotenv.config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI

const express = require('express')
const app = express()
const cors = require('cors');
app.use(cors())
app.use(express.json());
const port = process.env.PORT || 6500


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db('StudyNook');
    const roomsCollection = database.collection('rooms');


    // get AvailableStudyRoom;
    app.get('/available-rooms', async(req,res) =>{
      const availableRooms = await roomsCollection.find().limit(6).toArray();
      res.send(availableRooms)
    })


    // get all-rooms data;
    app.get('/all-rooms', async(req, res) =>{
      const allRooms = await roomsCollection.find().toArray();
      res.send(allRooms)
    })


    // add room, api;
    app.post('/add-room', async(req, res) =>{
      const roomData = req.body;
      const insertRoomData = await roomsCollection.insertOne(roomData);
      res.send(insertRoomData)
      console.log(insertRoomData)
    })

    // Send a ping to confirm a successful connection
    await client.db("StudyNook").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})


run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on listening  port ${port}`)
})
