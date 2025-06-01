
// /////////////////////////////////////////////


// const { MongoClient, ObjectId } = require('mongodb');

// async function postSelectedSeats(dataObj) {
//     const uri = `${process.env.MONGO_DB_URL}`;
//     const client = new MongoClient(uri);

//     try {
//         await client.connect();
//         console.log('Connected to MongoDB');
//         console.log("post selected called with obj", dataObj);

//         const { movieId, screenId, showTime, selectedSeats, updatedValue } = dataObj;
        
//         // Validate required fields
//         if (!movieId || !screenId || !showTime || !selectedSeats || !Array.isArray(selectedSeats)) {
//             throw new Error('Missing required fields or invalid selectedSeats array');
//         }

//         // Start a MongoDB session
//         const session = client.startSession();
        
//         try {
//             // Start transaction
//             session.startTransaction();
            
//             // Select database and collections
//             const db = client.db('local-cineflix');
//             const shows_collection = db.collection('shows_collection');
//             const showSeatStatus_collection = db.collection('showSeatStatus_collection');

//             // Find the show ID within the transaction
//             const query = {
//                 movieId: typeof movieId === 'string' ? new ObjectId(movieId) : movieId,
//                 screenId: typeof screenId === 'string' ? new ObjectId(screenId) : screenId,
//                 startTime: new Date(showTime)
//             };

//             const show = await shows_collection.findOne(query, { 
//                 projection: { _id: 1 },
//                 session // Include session in the query
//             });
            
//             if (!show) {
//                 throw new Error('Show not found');
//             }
//             const showId = show._id;

//             if (updatedValue === 'booked') {
//                 // Convert seat IDs to ObjectIds
//                 const seatIds = selectedSeats.map(seat => 
//                     typeof seat._id === 'string' ? new ObjectId(seat._id) : seat._id
//                 );

//                 // Check seat availability WITHIN THE TRANSACTION
//                 const bookedSeats = await showSeatStatus_collection.find({
//                     showId: showId,
//                     seatId: { $in: seatIds },
//                     status: 'booked'
//                 }, { session }).toArray(); // Include session

//                 if (bookedSeats.length > 0) {
//                     await session.abortTransaction();
//                     console.log("Seats already booked");
//                     return {
//                         status: 'failure',
//                         message: `Cannot proceed - some seats are already booked`,
//                     };
//                 }
//             }

//             // Prepare seat updates
//             const seatUpdates = selectedSeats.map(seat => ({
//                 updateOne: {
//                     filter: {
//                         showId: showId,
//                         seatId: typeof seat._id === 'string' ? new ObjectId(seat._id) : seat._id,
//                         // For extra safety, include status check when booking
//                         ...(updatedValue === 'booked' ? { status: { $ne: 'booked' } } : {})
//                     },
//                     update: {
//                         $set: {
//                             status: updatedValue,
//                             updatedAt: new Date()
//                         }
//                     }
//                 }
//             }));

//             // Execute bulk write operation within the transaction
//             const result = await showSeatStatus_collection.bulkWrite(seatUpdates, { session });

//             // Check if all seats were updated successfully
//             if (result.modifiedCount !== selectedSeats.length) {
//                 await session.abortTransaction();
//                 console.log("Failed to update all seats");
//                 return {
//                     status: 'failure',
//                     message: `Failed to update all seats - some may have been booked by another user`,
//                 };
//             }

//             // If everything succeeded, commit the transaction
//             await session.commitTransaction();
            
//             return {
//                 status: 'success',
//                 message: `${selectedSeats.length} seats successfully updated`,
//             };
//         } catch (error) {
//             // If any error occurs, abort the transaction
//             await session.abortTransaction();
//             console.error('Error in transaction:', error);
//             throw error;
//         } finally {
//             // End the session
//             await session.endSession();
//         }
//     } catch (error) {
//         console.error('Error in postSelectedSeats:', error);
//         throw error;
//     } finally {
//         await client.close();
//     }
// }

// module.exports = { postSelectedSeats };


///////////////////////////////////////////////////////////////////////////////

const { MongoClient, ObjectId } = require('mongodb');
const { setTimeout } = require('timers/promises');

async function postSelectedSeats(dataObj) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    const MAX_RETRIES = 3; // Maximum number of retry attempts
    const BASE_DELAY_MS = 100; // Initial delay between retries (will exponentially increase)

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        let lastError;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const session = client.startSession();
            
            try {
                console.log(`Attempt ${attempt} for seat booking`);
                session.startTransaction();
                
                // --- Transaction Logic --- //
                const { movieId, screenId, showTime, selectedSeats, updatedValue } = dataObj;
                
                // Validate required fields
                if (!movieId || !screenId || !showTime || !selectedSeats || !Array.isArray(selectedSeats)) {
                    throw new Error('Missing required fields or invalid selectedSeats array');
                }

                const db = client.db('local-cineflix');
                const shows_collection = db.collection('shows_collection');
                const showSeatStatus_collection = db.collection('showSeatStatus_collection');

                // Find the show ID within the transaction
                const query = {
                    movieId: typeof movieId === 'string' ? new ObjectId(movieId) : movieId,
                    screenId: typeof screenId === 'string' ? new ObjectId(screenId) : screenId,
                    startTime: new Date(showTime)
                };

                const show = await shows_collection.findOne(query, { 
                    projection: { _id: 1 },
                    session
                });
                
                if (!show) {
                    throw new Error('Show not found');
                }
                const showId = show._id;

                if (updatedValue === 'booked') {
                    const seatIds = selectedSeats.map(seat => 
                        typeof seat._id === 'string' ? new ObjectId(seat._id) : seat._id
                    );

                    // Check seat availability WITHIN THE TRANSACTION
                    const bookedSeats = await showSeatStatus_collection.find({
                        showId: showId,
                        seatId: { $in: seatIds },
                        status: 'booked'
                    }, { session }).toArray();

                    if (bookedSeats.length > 0) {
                        await session.abortTransaction();
                        console.log("Seats already booked");
                        return {
                            status: 'failure',
                            message: `Cannot proceed - some seats are already booked`,
                        };
                    }
                }

                // Prepare seat updates
                const seatUpdates = selectedSeats.map(seat => ({
                    updateOne: {
                        filter: {
                            showId: showId,
                            seatId: typeof seat._id === 'string' ? new ObjectId(seat._id) : seat._id,
                            ...(updatedValue === 'booked' ? { status: { $ne: 'booked' } } : {})
                        },
                        update: {
                            $set: {
                                status: updatedValue,
                                updatedAt: new Date()
                            }
                        }
                    }
                }));

                // Execute bulk write operation within the transaction
                const result = await showSeatStatus_collection.bulkWrite(seatUpdates, { session });

                if (result.modifiedCount !== selectedSeats.length) {
                    await session.abortTransaction();
                    console.log("Failed to update all seats");
                    return {
                        status: 'failure',
                        message: `Failed to update all seats - some may have been booked by another user`,
                    };
                }

                await session.commitTransaction();
                await session.endSession();
                
                return {
                    status: 'success',
                    message: `${selectedSeats.length} seats successfully updated`,
                };

            } catch (error) {
                await session.abortTransaction().catch(() => {});
                await session.endSession().catch(() => {});
                lastError = error;

                // Check if we should retry
                if (attempt < MAX_RETRIES && isRetryableError(error)) {
                    const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
                    console.log(`Transaction conflict detected, retrying in ${delay}ms...`);
                    await setTimeout(delay);
                    continue;
                }

                // Handle specific error cases
                if (error.code === 112 || error.codeName === 'WriteConflict') {
                    return {
                        status: 'failure',
                        message: 'These seats were just booked by another user. Please select different seats.',
                    };
                }

                // For other errors
                console.error('Error in postSelectedSeats:', error);
                throw error;
            }
        }

        // If we exhausted all retries
        return {
            status: 'failure',
            message: 'Could not complete booking due to high demand. Please try again.',
        };

    } catch (error) {
        console.error('Non-retryable error in postSelectedSeats:', error);
        throw error;
    } finally {
        await client.close();
    }
}

// Helper function to identify retryable errors
function isRetryableError(error) {
    // MongoDB transaction conflict errors
    if (error.code === 112 || error.codeName === 'WriteConflict') return true;
    
    // Network/transient errors
    if (error.code === 6 || error.codeName === 'HostUnreachable') return true;
    if (error.code === 7 || error.codeName === 'HostNotFound') return true;
    if (error.code === 89 || error.codeName === 'NetworkTimeout') return true;
    
    return false;
}

module.exports = { postSelectedSeats };
