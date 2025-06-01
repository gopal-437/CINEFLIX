const { MongoClient, ObjectId } = require('mongodb');
const { schedularData_check } = require('./schedularData_check');

async function getDataAtSeatSelection(theaterId,movieId,screenId,showTime) {
    
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {

        await client.connect();
        console.log('Connected to MongoDB');
    
        // Select database and collection
        const db = client.db('local-cineflix');
        const movies_collection = db.collection('movies_collection');
        const theater_collection = db.collection('theater_collection');
        const seats_collection = db.collection('seats_collection');
        const shows_collection = db.collection('shows_collection');
        const showSeatStatus_collection = db.collection('showSeatStatus_collection');

        // 1. Find the movie by name
        const movieData = await movies_collection.findOne({ _id: new ObjectId(movieId) });
        if (!movieData){
            throw new Error('Movie not found');
        }

        const theaterData = await theater_collection.findOne({ _id: new ObjectId(theaterId) });
        if (!theaterData) {
            throw new Error('theater not found');
        }

        const seatsData = await seats_collection.find({ screenId: new ObjectId(screenId) }).toArray();
        if (!seatsData) {
            throw new Error('seats not found');
        }

        const query = {
            movieId: typeof movieId === 'string' ? new ObjectId(movieId) : movieId,
            screenId: typeof screenId === 'string' ? new ObjectId(screenId) : screenId,
            startTime: new Date(showTime)
          };
      
        const show = await shows_collection.findOne(query, { projection: { _id: 1 } });

        const showId = show._id.toString();

         // Extract seat IDs for query
       const seatIds = seatsData.map(seat => seat._id);

       await schedularData_check(seatIds, showId);
    
    // Get all statuses for these seats in this show
       const seatStatuses = await showSeatStatus_collection.find({
       showId: new ObjectId(showId),
       seatId: { $in: seatIds }
       }).toArray();
       
    //    console.log("seat st",seatStatuses);

        // Create a map of seatId to status for quick lookup
        const statusMap = new Map();
        seatStatuses.forEach(status => {
        statusMap.set(status.seatId.toString(), {
            status: status.status,
            currentPrice: status.currentPrice
        });
        });

        // Add status field to each seat object
        const seatsDataf = seatsData.map(seat => {
        const statusInfo = statusMap.get(seat._id.toString()) || {
            status: 'available',
            currentPrice: seat.basePrice || 0 // Default price if not specified
        };
        
        return {
            ...seat,
            status: statusInfo.status,
            currentPrice: statusInfo.currentPrice
        };

        });

        return {movieData, theaterData, seatsDataf};
    } catch (error) {
        console.error('Error in getDataAtSeatSelection:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { getDataAtSeatSelection };