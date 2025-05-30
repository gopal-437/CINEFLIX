const { MongoClient, ObjectId } = require('mongodb');


async function postSelectedSeats(dataObj) {
    
    console.log("post selected seats called with obj",dataobj);
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);

    
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const { movieId, screenId, showTime, selectedSeats, updatedValue } = dataObj;
        
        // Validate required fields
        if (!movieId || !screenId || !showTime || !selectedSeats || !Array.isArray(selectedSeats)) {
            throw new Error('Missing required fields or invalid selectedSeats array');
        }

        // Select database and collections
        const db = client.db('local-cineflix');
        const shows_collection = db.collection('shows_collection');
        const showSeatStatus_collection = db.collection('showSeatStatus_collection');

        // Find the show ID
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

        // Prepare seat updates
        const seatUpdates = selectedSeats.map(seat => ({
            updateOne: {
                filter: {
                    showId: showId,
                    seatId: typeof seat._id === 'string' ? new ObjectId(seat._id) : seat._id
                },
                update: {
                    $set: {
                        status: updatedValue,
                        updatedAt: new Date()
                    }
                },
                // upsert: true // Create document if it doesn't exist
            }
        }));

        // Execute bulk write operation
        const result = await showSeatStatus_collection.bulkWrite(seatUpdates);

        return {
            message: `${selectedSeats.length} seats successfully updated`,
        };

    } catch (error) {
        console.error('Error in postSelectedSeats:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { postSelectedSeats };
