const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// export dotenv and config;
const dotenv = require('dotenv');
dotenv.config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI

const express = require('express')
const app = express()
const cors = require('cors');
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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

// middleware;

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }


  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
    )

    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
    next()

  }

  catch (error) {
    console.error('Token validation failed:', error)
    throw error
  }

}



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db('StudyNook');
    const roomsCollection = database.collection('rooms');
    const bookingsCollection = database.collection('bookings');


    // get AvailableStudyRoom;
    app.get('/available-rooms', async (req, res) => {
      const availableRooms = await roomsCollection.find().limit(6).sort({ _id: -1 }).toArray();
      res.send(availableRooms)
    })


    // get all-rooms data;
    app.get('/all-rooms', async (req, res) => {
      const { search, amenity } = req.query;
      console.log('test query',search, amenity,req.query)
      const query = {};
     

      if(search){
        query.roomName={$regex:search, $options:"i"}
      }

      else if (amenity) {
        query.amenities =  { $in: [amenity] }

      }
  
      const allRooms = await roomsCollection.find(query).toArray();
      res.send(allRooms)
    })


    // add room, api;
    app.post('/add-room', verifyToken, async (req, res) => {
      const roomData = req.body;


      if (roomData.userId !== req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }
      const insertRoomData = await roomsCollection.insertOne(roomData);
      res.send(insertRoomData)
    })


    // get my-listings data throw get api ;
    app.get('/my-listings/:userId', verifyToken, async (req, res) => {
      const { userId } = req.params;

      if (userId !== req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }
      const myListingData = await roomsCollection.find({ userId }).sort({ _id: -1 }).toArray();
      res.json(myListingData);


    })


    // get single room details ;
    app.get('/all-rooms/:id', async (req, res) => {
      const { id } = req.params;
      const roomDetails = await roomsCollection.findOne({ _id: new ObjectId(id) });
      res.send(roomDetails)
    })


    // delete room by id;
    app.delete('/all-rooms/:id', verifyToken, async (req, res) => {

      const { id } = req.params;

      const query = { _id: new ObjectId(id) };
      const room = await roomsCollection.findOne(query);

      if (!room) {
        return res.status(404).send({ message: "Room not found" });
      }

      if (room.userEmail != req.user.email) {
        return res.status(403).send({ message: "Forbidden" });
      }

      const deleteData = await roomsCollection.deleteOne(query);
      res.send(deleteData);

    })


    // patch data;
    app.patch('/all-rooms/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const modifiedRoom = req.body;

      const query = { _id: new ObjectId(id) };
      const room = await roomsCollection.findOne(query);

      if (!room) {
        return res.status(404).send({ message: 'data not found' })
      }
      if (room.userEmail !== req.user.email) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      const updateData = await roomsCollection.updateOne(query, { $set: modifiedRoom });
      res.send(updateData);
    })


    //add booking room;
    app.post('/booking-room', verifyToken, async (req, res) => {
      const bookingRoom = req.body;


      const conflictBooking = await bookingsCollection.findOne({
        roomId: bookingRoom.roomId,
        date: bookingRoom.date,
        status: { $ne: "Cancelled" },
        startTime: {
          $lt: bookingRoom.endTime
        },

        endTime: {
          $gt: bookingRoom.startTime
        }
      })

      if (conflictBooking) {
        return res.status(409).send({ message: "Time slot already booked!" })
      }

      const bookingData = await bookingsCollection.insertOne(bookingRoom);
      if (bookingData.insertedId) {
        await roomsCollection.updateOne(

          { _id: new ObjectId(bookingRoom.roomId) },
          {
            $inc: { bookingCount: 1 }
          }
        )
      }
      res.send({ response: 'ok', message: "booking room successful" })


    })

    // get my-bookings room ;
    app.get('/my-bookings', verifyToken, async (req, res) => {
      const userId = req.user.id;


      const myBookingsData = await bookingsCollection
        .find({ userID: userId }).sort({ _id: -1 }).toArray();

      if (!myBookingsData) {
        return res.status(404).json({ message: 'no booking room found' })
      }
      res.send(myBookingsData)
    })


    // cancel room booking;
    app.patch('/my-bookings/:bookingId', verifyToken, async (req, res) => {

      const { bookingId } = req.params;

      const findData = await bookingsCollection.findOne(
        { _id: new ObjectId(bookingId) });

      if (!findData) {
        return res.status(404).json({ message: "no data found" })
      }

      if (req.user.email != findData.userEmail) {
        return res.status(401).json({ message: "Unauthorized" })
      }


      const setStatusCancelled = await bookingsCollection.updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { status: "Cancelled" } },
      );

      if (setStatusCancelled.modifiedCount > 0) {
        await roomsCollection.updateOne(
          { roomId: findData.roomId },
          { $inc: { bookingCount: -1 } }
        )

      }

      res.send(setStatusCancelled)
    })

    // Send a ping to confirm a successful connection
    // await client.db("StudyNook").command({ ping: 1 });
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
