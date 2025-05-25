const { MongoClient, ObjectId } = require('mongodb');


// Helper functions
function formatMinutesToHM(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

function getFormatedTime(dateTimeString) {
    const date = new Date(dateTimeString);
    let hours = date.getUTCHours(); // Use UTC hours instead of local hours
    const minutes = date.getUTCMinutes(); // Use UTC minutes for consistency
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12 (for 12 AM/PM)
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
}

async function getMyBookingData(userEmail) {
    const uri = `${process.env.MONGO_DB_URL}`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('local');
        const user_collection = db.collection('user_collection');
        const booking_collection = db.collection('booking_collection');
        const movie_collection = db.collection('movies_collection');
        const theater_collection = db.collection('theater_collection');
        const show_collection = db.collection('shows_collection');
        const screen_collection = db.collection('screen_collection');
        const seat_collection = db.collection('seats_collection');

        // Get user by email
        const user = await user_collection.findOne({ email: userEmail });
        if (!user) {
            throw new Error('User not found');
        }

        const userId = user._id;

        // Get all bookings for this user
        const bookings = await booking_collection.find({ userId }).toArray();
        if (!bookings || bookings.length === 0) {
            return [];
        }

        // Process each booking to get the complete data
        const result = await Promise.all(bookings.map(async (booking) => {
            // Get show details
            const show = await show_collection.findOne({ _id: booking.showId });
            if (!show) {
                console.warn(`Show not found for booking ${booking._id}`);
                return null;
            }

            // Get movie details
            const movie = await movie_collection.findOne({ _id: show.movieId });
            if (!movie) {
                console.warn(`Movie not found for show ${show._id}`);
                return null;
            }

            // Get screen details
            const screens = await screen_collection.findOne({ _id: show.screenId });
            if (!screens) {
                console.warn(`screens not found for show ${show._id}`);
                return null;
            }

            // Get screen details
            const theater = await theater_collection.findOne({ _id: screens.theaterId });
            if (!theater) {
                console.warn(`theater not found for show ${show._id}`);
                return null;
            }

            const seatsD = await seat_collection.find({ 
                _id: { $in: booking.seats.map(id => new ObjectId(id)) }
            }).toArray();

            if(!seatsD) {
                console.warn(`seats not found for show ${show._id}`);
                return null;
            }
            
            const seatNames = seatsD
            .sort((a, b) => a.row.localeCompare(b.row) || parseInt(a.seatNumber) - parseInt(b.seatNumber))
            .map(seat => `${seat.row}${seat.seatNumber}`);

            // Format dates
            const showDate = new Date(show.startTime);
            const date = showDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const day = showDate.toLocaleDateString('en-US', { weekday: 'long' });
            const payDate = {
                date: new Date(booking.bookingTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                time: new Date(booking.bookingTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };

            // Construct the result object
            return {
                movie: {
                    title: movie.title,
                    language: movie.languages.join(", "),
                    genre: movie.genres.join(", "),
                    duration: formatMinutesToHM(movie.durationMinutes),
                    rating: movie.rating
                },
                show: {
                    date: date,
                    day: day,
                    time: getFormatedTime(show.startTime),
                    format: show.format || "Standard" // Default to Standard if format not specified
                },
                theater: {
                    name: theater.name,
                    location: `${theater.address.street}, ${theater.address.city}, ${theater.address.state} ${theater.address.zipCode}`,
                    screen: `Screen ${screens.name || 1}`, // Default to Screen 1 if not specified
                    seating: show.seatingType || "Standard" // Default to Standard if not specified
                },
                booking: {
                    id: booking._id.toString(),
                    date: payDate.date + ", " + payDate.time,
                    seats: seatNames,
                    price: `₹${booking.totalAmount}`,
                    terms: "Please arrive 30 minutes before showtime. Late entry not permitted.",
                    qrCodeUrl: ""
                }
            };
        }));

        // Filter out any null entries (from missing data)
        return result.filter(item => item !== null);

    } catch (error) {
        console.error('Error in getMyBookingData:', error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = { getMyBookingData };