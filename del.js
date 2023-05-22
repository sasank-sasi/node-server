const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb://localhost:27017/location'; // Replace with your MongoDB connection URI
const collectionName = 'locations'; // Replace with the name of your collection

async function clearCollection() {
  try {
    const client = await MongoClient.connect(uri);
    const collection = client.db().collection(collectionName);
    
    // Delete all documents in the collection
    const result = await collection.deleteMany({});
    
    console.log(`${result.deletedCount} documents deleted.`);
    
    client.close();
  } catch (error) {
    console.error('Error clearing collection:', error);
  }
}

// Call the function to clear the collection
clearCollection();
