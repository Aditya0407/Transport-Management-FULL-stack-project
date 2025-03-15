const mongoose = require('mongoose');

const uri = "mongodb+srv://chaithanya:e1A3sh41WUdTMLux@cluster0.pgo3q.mongodb.net/loadposting?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true";

const options = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

async function connectDB() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri, options);
    console.log('Successfully connected to MongoDB.');
    
    // Test the connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

connectDB(); 