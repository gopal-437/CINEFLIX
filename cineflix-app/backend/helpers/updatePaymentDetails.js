const { MongoClient, ObjectId } = require('mongodb');


async function updatePaymentDetails(dataObj) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    await client.connect();
    try {
        console.log('Connected to MongoDB');

        // Select database and collections
        const db = client.db('local-cineflix');
        const payment_collection = db.collection('payment_collection');
        const shows_collection = db.collection('shows_collection');
        const user_collection = db.collection('user_collection');
        const booking_collection = db.collection('booking_collection');
        
        // Prepare the payment document
        const paymentDocument = {
            bookingId: "",
            amount: dataObj.amount,
            paymentMethod: "kai nai",
            paymentDate: new Date(Date.now()), // Use current date if not provided
            transactionId: "trxn....",
            status: 'success', // Default to 'success' if not provided
            paymentDetails: {
                gateway: "razorpay",
                cardLast4: "XXXX",
                receiptUrl: "url.."
            }
        };

        // Insert the payment document
        const result = await payment_collection.insertOne(paymentDocument);
       
        //prepare booking document

        const {movieId, screenId, showTime, userEmail, selectedSeats, amount} = dataObj

        // --> finding show id
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

        // --> finding user id
        const user = await user_collection.findOne({ email: userEmail });

        if (!user) {
            console.log('No user found with email:', userEmail);
            return null;
        }

        const bookingDocument = {
           userId : user._id,
           showId : showId,
           bookingTime : new Date(showTime),
           totalAmount: amount,
           paymentStatus:"completed",
           paymentId: result.insertedId,
           bookingStatus:"confirmed",
           qrCodeUrl: "",
           seats: selectedSeats.map((selectedSeat) => new ObjectId(selectedSeat._id))
        };

        const result2 = await booking_collection.insertOne(bookingDocument);

        // both entries are done

        const result3 = await payment_collection.updateOne(
            { _id: result.insertedId },
            { $set: { bookingId: result2.insertedId } }
        );

        const resp = result2.insertedId;

        return resp;

    } catch (error) {
        console.error('Error in updatePaymentDetails:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { updatePaymentDetails };