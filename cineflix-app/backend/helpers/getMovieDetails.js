const { MongoClient, ObjectId } = require('mongodb');


async function getMovieDetails(city,movieid,date) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {
        
        await client.connect();
        console.log('Connected to MongoDB');
    
        // Select database and collection
        const db = client.db('local-cineflix');
        const movies_collection = db.collection('movies_collection');
        const show_collection = db.collection('shows_collection');
        const theater_collection = db.collection('theater_collection');
        const screen_collection = db.collection('screen_collection');

        // 1. Find the movie by name
        const movie = await movies_collection.findOne({ _id: new ObjectId(movieid) });
        if (!movie) {
            throw new Error('Movie not found');
        }

        // 2. Find theaters in the specified city
        const theaters = await theater_collection.find({ 'address.city': city }).toArray();
        if (theaters.length === 0) {
            return [];
        }

        // 3. Get all screens for these theaters
        const theaterIds = theaters.map(theater => theater._id);
        const screens = await screen_collection.find({ theaterId: { $in: theaterIds } }).toArray();
        if (screens.length === 0) {
            return [];
        }

        // 4. Find shows for the movie on the specified date
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate);
        endDate.setDate(targetDate.getDate() + 1);

        const shows = await show_collection.find({
            movieId: movie._id,
            screenId: { $in: screens.map(screen => screen._id) },
            date: {
                $gte: targetDate,
                $lt: endDate
            }
        }).toArray();

        // 5. Organize data into the desired structure
        const result = [];

        for (const theater of theaters) {
            // Get screens for this theater
            const theaterScreens = screens.filter(screen => 
                screen.theaterId.toString() === theater._id.toString()
            );
            
            // Get shows for this theater's screens
            const theaterShows = shows.filter(show => 
                theaterScreens.some(screen => 
                    screen._id.toString() === show.screenId.toString()
                )
            );

            if (theaterShows.length > 0) {
                const theaterEntry = {
                    theaterId: theater._id,
                    name: theater.name,
                    address: theater.address,
                    contactNumber: theater.contactNumber,
                    showTimes: []
                };

                // Group shows by their start-end time combination
                const showTimeMap = new Map();

                for (const show of theaterShows) {
                    const timeKey = `${show.startTime.toISOString()}-${show.endTime.toISOString()}`;
                    
                    if (!showTimeMap.has(timeKey)) {
                        showTimeMap.set(timeKey, {
                            startTime: show.startTime,
                            endTime: show.endTime,
                            screens: []
                        });
                    }

                    // Find the screen details for this show
                    const screen = screens.find(s => s._id.toString() === show.screenId.toString());

                    showTimeMap.get(timeKey).screens.push({
                        screenId: show.screenId,
                        screenName: screen ? screen.name : 'Unknown Screen',
                        seatingCapacity: screen ? screen.seatingCapacity : 0,
                        price: show.basePrice
                    });
                }

                // Convert map to array
                theaterEntry.showTimes = Array.from(showTimeMap.values());
                result.push(theaterEntry);
            }
        }

        return {result , movie};
    } catch (error) {
        console.error('Error in getMovieDetails:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { getMovieDetails };