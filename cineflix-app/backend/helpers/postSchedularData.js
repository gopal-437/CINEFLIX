const { MongoClient, ObjectId } = require('mongodb');


async function postSchedularData(dataObj) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);

    console.log("post schedular data called");

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const { movieId, screenId, showTime, selectedSeats, updatedValue } = dataObj;
    
        const db = client.db('local-cineflix');
        const schedularData_collection = db.collection('schedulerData_collection');
        const shows_collection = db.collection('shows_collection');

        const query = {
            movieId: typeof movieId === 'string' ? new ObjectId(movieId) : movieId,
            screenId: typeof screenId === 'string' ? new ObjectId(screenId) : screenId,
            startTime: new Date(showTime)
        };

        const show = await shows_collection.findOne(query, { projection: { _id: 1 } });
        if (!show) {
            throw new Error('Show not found');
        }
        const showId = show._id;

        //add your code here....

        // Prepare documents to insert for each selected seat
        const documentsToInsert = selectedSeats.map(seatId => ({
            showId: showId,
            seatId: typeof seatId === 'string' ? new ObjectId(seatId) : seatId,
            paymentStatus: "pending", // Assuming updatedValue contains the payment status
            currentTime: new Date() // Current timestamp
        }));

        // Insert all documents at once
        const result = await schedularData_collection.insertMany(documentsToInsert);
        
        console.log(`${result.insertedCount} documents were inserted`);
        return result;

        

    } catch (error) {
        console.error('Error in post schedular data details', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { postSchedularData };