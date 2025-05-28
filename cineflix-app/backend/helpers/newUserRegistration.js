const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function addUsers(formData) {
  // Connection URL (matches your screenshot)
  const uri = `${process.env.MONGO_DB_URL}`;
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    // Select database and collection (exact names from your screenshot)
    const db = client.db('local-cineflix');
    const userCollection = db.collection('user_collection');

    // Sample users to insert (with hashed passwords)
    const usersToAdd = [formData];

    //check if user already exists
    const existingUser = await userCollection.findOne({
      $or: [
        { username: formData.username },
        { email: formData.email }
      ]
    });

    if (existingUser) {
      if (existingUser.username === formData.username) {
        return `Username "${formData.username}" already exists! Skipping...`;
      } else {
        return `Email "${formData.email}" already exists! Skipping...`;
      }
    }

    else {
    // Insert users
    const result = await userCollection.insertMany(usersToAdd);
    console.log(`${result.insertedCount} users added successfully`);
    console.log('Inserted IDs:', result.insertedIds);

    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close connection
    await client.close();
  }

  return `Success`;
}

// Execute the function
module.exports = {addUsers};