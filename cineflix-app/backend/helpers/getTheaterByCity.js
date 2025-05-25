const { MongoClient, ObjectId } = require('mongodb');


async function getTheaterByCity(city) {
    
    if(!city) return [];
    
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    
        // Select database and collection
        const db = client.db('local');
        const theater_collection = db.collection('theater_collection');

        // Find theaters matching the city and project only id and name
        const theaters = await theater_collection.find(
            { "address.city": city },
            { projection: { _id: 1, name: 1 } }
        ).toArray();

        return theaters;
        
    } catch (error) {
        console.error('Error in getTheatersByCity:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { getTheaterByCity };