const { MongoClient, ObjectId } = require('mongodb');


async function getProfileData(userEmail) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {
        
        await client.connect();
        console.log('Connected to MongoDB');
    
        // Select database and collection
        const db = client.db('local');
        const user_collection = db.collection('user_collection');

         // Find user by email
         const user = await user_collection.findOne({ email: userEmail });
        
         if (!user) {
             throw new Error('User not found with the provided email');
         }
         
         return user;
        

        
    } catch (error) {
        console.error('Error in getprofiledata:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { getProfileData };