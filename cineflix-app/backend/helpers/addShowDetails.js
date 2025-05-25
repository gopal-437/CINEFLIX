const { MongoClient, ObjectId } = require('mongodb');


async function addShowDetails(dataObj) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    
        const db = client.db('local');
        const shows_collection = db.collection('shows_collection');
        const user_collection = db.collection('user_collection');
        const seats_collection = db.collection('seats_collection');
        const showSeatStatus_collection = db.collection('showSeatStatus_collection');

        // Get local timezone offset in minutes
        const timezoneOffset = new Date().getTimezoneOffset();
        
        // Convert string date to Date object in local time
        const localShowDate = new Date(dataObj.date);
        
        // Parse the time string (format: "HH:MM AM/PM")
        const [timeStr, period] = dataObj.time.split(' ');
        const [hoursStr, minutesStr] = timeStr.split(':');
        
        let hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr || '0');
        
        // Convert to 24-hour format
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        // Create start time in local time
        const localStartTime = new Date(localShowDate);
        localStartTime.setHours(hours, minutes, 0, 0);
        
        // Calculate end time (3 hours duration)
        const localEndTime = new Date(localStartTime);
        localEndTime.setHours(localStartTime.getHours() + 3);
        
        // Convert to UTC for database storage
        const utcStartTime = new Date(localStartTime.getTime() - (timezoneOffset * 60000));
        const utcEndTime = new Date(localEndTime.getTime() - (timezoneOffset * 60000));
        const utcShowDate = new Date(localShowDate.getTime() - (timezoneOffset * 60000));

        // Check if show already exists (using UTC times for comparison)
        const existingShow = await shows_collection.findOne({
            screenId: new ObjectId(dataObj.screenId),
            date: { $eq: utcShowDate },
            startTime: { $eq: utcStartTime }
        });

        if (existingShow) {
            throw new Error('A show already exists for this screen at the selected date and time');
        }

        const admin = await user_collection.findOne({ email: dataObj.adminEmail });
        if (!admin) {
            throw new Error('Admin user not found');
        }

        // Insert new show with UTC times
        const result = await shows_collection.insertOne({
            movieId: new ObjectId(dataObj.movieId),
            screenId: new ObjectId(dataObj.screenId),
            startTime: utcStartTime,
            endTime: utcEndTime,
            date: utcShowDate,
            basePrice: parseInt(dataObj.price),
            adminId: admin._id,
            createdAt: new Date() // This will be in UTC by default
        });

        // console.log(`New show created with id: ${result.insertedId}`);

        const seats = await seats_collection.find(
            { "screenId": new ObjectId(dataObj.screenId) },
            { "_id": 1 } // Projection to only return the _id field
        ).toArray();

        const seatIds = seats.map(seat => seat._id);

        // Prepare documents for bulk insert
        const documents = seatIds.map(seatId => ({
            showId: new ObjectId(result.insertedId),
            seatId: seatId,
            status: "available",
            currentPrice: parseInt(dataObj.price),
            updatedAt: new Date()
        }));

        // Perform bulk insert
        const result2 = await showSeatStatus_collection.insertMany(documents);

        return {
            ...result,
            ...result2,
            localStartTime: localStartTime.toISOString(),
            localEndTime: localEndTime.toISOString()
        };

    } catch (error) {
        console.error('Error in post show details', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { addShowDetails };