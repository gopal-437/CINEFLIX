const { MongoClient, ObjectId } = require('mongodb');

// Configurable time threshold (in minutes)
const PENDING_RESERVATION_THRESHOLD_MINUTES = 1;

async function schedularData_check(seatIds, showId) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        // Select database and collections
        const db = client.db('local-cineflix');
        const schedularData_collection = db.collection('schedularData_collection');
        const showSeatStatus_collection = db.collection('showSeatStatus_collection');

        // Calculate the cutoff time (current time minus threshold)
        const cutoffTime = new Date();
        cutoffTime.setMinutes(cutoffTime.getMinutes() - PENDING_RESERVATION_THRESHOLD_MINUTES);

        // Convert string IDs to ObjectId
        const seatObjectIds = seatIds.map(id => new ObjectId(id));
        const showObjectId = new ObjectId(showId);

        // Find expired pending reservations
        const pendingReservations = await schedularData_collection.find({
            showId: showObjectId,
            seatId: { $in: seatObjectIds },
            paymentStatus: "pending",
            entryTime: { $lt: cutoffTime } // Older than cutoff time
        }).toArray();

        if (pendingReservations.length === 0) {
            console.log('No expired pending reservations found');
            return { totalExpiredReservations: 0, releasedSeats: [], modifiedCount: 0 };
        }

        // Get unique seatIds from expired reservations
        const expiredSeatIds = [...new Set(
            pendingReservations.map(res => res.seatId)
        )];

        if (expiredSeatIds.length > 0) {
            console.log(`Found ${expiredSeatIds.length} seats to release`);

            // Update showSeatStatus for these seats
            const updateResult = await showSeatStatus_collection.updateMany(
                {
                    showId: showObjectId,
                    seatId: { $in: expiredSeatIds },
                    status: { $ne: "available" } // Only update if not already available
                },
                {
                    $set: {
                        status: "available",
                        updatedAt: new Date()
                    }
                }
            );

            console.log(`Released ${updateResult.modifiedCount} seats`);

            // Optionally: Update the reservations to mark them as expired
            await schedularData_collection.updateMany(
                {
                    _id: { $in: pendingReservations.map(res => res._id) }
                },
                {
                    $set: { paymentStatus: "expired" }
                }
            );
        }

        return {
            totalExpiredReservations: pendingReservations.length,
            releasedSeats: expiredSeatIds.map(id => id.toString()),
            modifiedCount: updateResult?.modifiedCount || 0
        };
        
    } catch (error) {
        console.error('Error in schedularData_check:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { schedularData_check };