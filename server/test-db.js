const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://chaithanya:e1A3sh41WUdTMLux@cluster0.pgo3q.mongodb.net/loadposting?retryWrites=true&w=majority&appName=Cluster0&connectTimeoutMS=30000&socketTimeoutMS=30000";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir); 