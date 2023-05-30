const express = require('express')
const app = express();
const cors = require('cors')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000
// const port = express

// middelewares
app.use(cors())
app.use(express.json())

// database

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jqukbua.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const bistroMenuDatabase = client.db("BistroDB").collection("menu")
    const bistroReviewsDatabase = client.db("BistroDB").collection("reviews")
    const bistroCartsDatabase = client.db("BistroDB").collection("carts")
    const bistroUsersDatabase = client.db("BistroDB").collection("users")


    // users
    app.post('/users',async(req, res)=>{
      const user = req.body;
      console.log(user);
      const query = {email: user.email}
      const existingUser = await bistroUsersDatabase.findOne(query);
      console.log("existingUser", existingUser);

      if (existingUser) {
        return res.send({message: ' user alrady exist'})
      }
      const result = await bistroUsersDatabase.insertOne(user)
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      const result = await bistroUsersDatabase.find().toArray()
      res.send(result)
    })

    app.post('/cart', async (req, res) => {
      const items = req.body
      const result = await bistroCartsDatabase.insertOne(items);
      res.send(result)
    })
    //users patch admin
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set:{
          roll: 'admin'
        },
      };
      const result = await bistroUsersDatabase.updateOne(filter, updateDoc);
      res.send(result)
    })
    // cart delete
    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await bistroCartsDatabase.deleteOne(query);
      res.send(result)
    })

    // cart api
    app.get('/carts', async (req, res) => {
      const email = req.query.email
      if (!email) {
        res.send([])
      }
      const query = {email: email}
      const result = await bistroCartsDatabase.find(query).toArray()
      res.send(result)
    })

    app.get('/reviews', async (req, res) => {
      const result = await bistroReviewsDatabase.find().toArray()
      res.send(result)
    })
    app.get('/menu', async (req, res) => {
      const result = await bistroMenuDatabase.find().toArray()
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// end data base

app.get('/', (req, res) => {
  res.send('boss is sitting')
})

app.listen(port, () => {
  console.log(`bisto boss darun`);
})