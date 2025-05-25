const { MongoClient, ObjectId } = require('mongodb');


async function getMoviesData(userEmail) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    
        // Select database and collection
        const db = client.db('local');
        const movies_collection = db.collection('movies_collection');

        // Find all movies and project only _id and title fields
        const movies = await movies_collection.find(
            {}, // Empty filter to get all documents
            { projection: { _id: 1, title: 1 } } // Only include _id and title fields
        ).toArray();

        return movies;
        
    } catch (error) {
        console.error('Error in getMoviesData:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { getMoviesData };