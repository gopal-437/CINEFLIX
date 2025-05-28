const { MongoClient, ObjectId } = require('mongodb');


async function getScreenByTheater(theaterId) {
    
    if(!theaterId) return [];
    
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    
        // Select database and collection
        const db = client.db('local-cineflix');
        const screen_collection = db.collection('screen_collection');

        // Find theaters matching the city and project only id and name
        const screensData = await screen_collection.find(
            { theaterId: new ObjectId(theaterId) },
            { projection: { _id: 1, name: 1 } }
        ).toArray();

        return screensData;
        
    } catch (error) {
        console.error('Error in screen fetch from theater', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { getScreenByTheater };