const { MongoClient, ObjectId } = require('mongodb');


async function getTicketData(dataObj) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        // Select database and collections
        const db = client.db('local-cineflix');
        const movie_collection = db.collection('movies_collection');
        const booking_collection = db.collection('booking_collection');
        const theater_collection = db.collection('theater_collection');
        const payment_collection = db.collection('payment_collection'); // Added payment collection

        const { movieId, theaterId, bookingId } = dataObj;

        // Fetch all data in parallel for better performance
        const [movieData, theaterData, paymentData] = await Promise.all([
            movie_collection.findOne({ _id: new ObjectId(movieId) }),
            theater_collection.findOne({ _id: new ObjectId(theaterId) }),
            payment_collection.findOne({ bookingId: new ObjectId(bookingId) }) // Find payment by bookingId
        ]);

        if (!movieData || !theaterData || !paymentData) {
            throw new Error('One or more required records not found');
        }


        // Format the ticket data
        const ticketData = {
            movie: {
                title: movieData.title,
                language: movieData.languages,
                genre: movieData.genres.join(", "),
                duration: movieData.durationMinutes,
                rating: movieData.rating
            },
            theater: {
                name: theaterData.name,
                location: theaterData.address.street + ", " + theaterData.address.city + ", " + theaterData.address.state + ", " + theaterData.address.zipCode,
                seating: 'Standard'
            },
            booking: {
                id: bookingId,
                date: paymentData.paymentDate,
            }
        };

        // console.log("ticket data is",ticketData);

        return ticketData;

    } catch (error) {
        console.error('Error in getTicketData:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { getTicketData };