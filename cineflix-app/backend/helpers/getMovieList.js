const { MongoClient } = require('mongodb');



async function getMoviesList(city, date) {
  
  const uri = `${process.env.MONGO_DB_URL}`;
  const client = new MongoClient(uri);
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    console.log("callededed");

    // Select database and collection
    const db = client.db('local');
    const movies_collection = db.collection('movies_collection');
    const show_collection = db.collection('shows_collection');
    const theater_collection = db.collection('theater_collection');
    const screen_collection = db.collection('screen_collection');

    //complete code.....
    // 1. Find theaters in the specified city
    const theaters = await theater_collection.find({
      'address.city': city
    }).toArray();

    if (theaters.length === 0) {
      return [];
    }

    const theaterIds = theaters.map(theater => theater._id);

    // 2. Find screens in these theaters
    const screens = await screen_collection.find({
      theaterId: { $in: theaterIds }
    }).toArray();

    if (screens.length === 0) {
      return [];
    }

    const screenIds = screens.map(screen => screen._id);

    // 3. Find shows for these screens on the specified date

    // Convert payload string to Date object
    const payloadDate = new Date(date);

    // Query MongoDB using Date range
    const startOfDay = new Date(payloadDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(payloadDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const shows = await show_collection.find({
      screenId: { $in: screenIds },
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).toArray();



    if (shows.length === 0) {
      return [];
    }

    
    // 4. Get unique movie IDs from these shows
    const movieIds = [...new Set(shows.map(show => show.movieId))];
    
    // 5. Get movie details for these movies
    const movies = await movies_collection.find({
      _id: { $in: movieIds }
    }).toArray();
    
    return movies;


  } catch (err) {
    console.error('Error:', err);
    throw err; // Throw the error to be handled by the caller
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}


module.exports = { getMoviesList };