import React, { useState, useEffect } from 'react';
import styles from '../styles/SeatSelection.module.css';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; // Import your custom hook
import Gpay from './Gpay'
import DownloadTicket from './DownloadTicket';

const SeatSelection = () => {
  // Demo data

  const facilities = ["Dolby Atmos", "3D", "Food Court", "Wheelchair Access"];


  const theaterId = useSelector((state) => state.appContext.theaterId);
  const screenId = useSelector((state) => state.appContext.screenId);
  const showTime = useSelector((state) => state.appContext.showTime);
  const screenName = useSelector((state) => state.appContext.screenName);
  const basePrice = useSelector((state) => state.appContext.basePrice);
  const totalCost = useSelector((state) => state.appContext.totalCost);

  const { movieid } = useParams();

  // console.log("screen id ",screenId);

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [movieData, setMovieData] = useState(null);
  const [theaterData, setTheaterData] = useState(null);
  const navigate = useNavigate();

  const { setLoading, setTotalCost, setSelectedSeatsByUser
  } = AppContextProvider(); // Use the custom hook to get the setLoading function


  useEffect(() => {
    fetchNecessaryData();
    setSelectedSeats([]);
  }, []);

  useEffect(() => {
    setTotalCost(calculateTotal());
    // console.log("value is set");
  }, [selectedSeats]);

  const toggleSeatSelection = (seat) => {
    if (seat.status == "booked") return;

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s._id === seat._id);
      if (isSelected) {
        return prev.filter(s => s._id !== seat._id);
      } else {
        return [...prev, seat];
      }
    });
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + basePrice + (seat.type === "premium" ? 50 : 0), 0);
  };

  const handleProceed = async () => {

    setLoading(true);
    try {

      // Prepare the request data
      const requestData = {
        selectedSeats: selectedSeats,
        movieId : movieid,
        screenId : screenId,
        showTime : showTime,
        updatedValue : "booked",
      };

      // Make POST request
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/postSelectedSeats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${yourAuthToken}` // if needed
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const result = await response.json();

      setSelectedSeatsByUser(selectedSeats);
      alert(`Successfully booked ${selectedSeats.length} seats. Total: ₹${calculateTotal()}`);


    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to process booking. Please try again.');
    }

    setLoading(false);

  };

  const fetchNecessaryData = async () => {

    setLoading(true); // Set loading to true when fetching starts

    try {

      const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/api/getdataatseatselection`);

      if (theaterId) url.searchParams.append('theaterId', theaterId);
      if (movieid) url.searchParams.append('movieId', movieid);
      if (screenId) url.searchParams.append('screenId', screenId);
      if (showTime) url.searchParams.append('showTime', showTime);

      // Fetch movies data from API with the constructed URL
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // console.log("data received",data.rr);
      setMovieData(data.movieData);
      setTheaterData(data.theaterData);
      setSeats(data.seatsDataf);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }

    setLoading(false); // Set loading to false when fetching ends
  };

  const formatMinutesToHM = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  function formatUTCDate(isoString) {
    const date = new Date(isoString);

    // Get UTC day, month, year
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    // Get UTC day name
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getUTCDay()];

    // Get UTC hours and minutes in 12-hour format with AM/PM
    let hours = date.getUTCHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${day}-${month}-${year}, "${dayName}", ${hours}:${minutes} ${ampm}`;
  }

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  if (movieData == null) return <div className={styles.loading}>Loading seats...</div>;

  return (
    <div className={styles.container}>
      {/* Header with movie info */}
      <div className={styles.movieHeader}>
        <div className={styles.moviePoster}>
          <img src={movieData.posterUrl} alt={movieData.title} />
        </div>
        <div className={styles.movieInfo}>
          <h1>{movieData.title} <span className={styles.rating}>{movieData.rating}</span></h1>
          <p className={styles.meta}>{movieData.genres.join(', ')} • {formatMinutesToHM(movieData.durationMinutes)}</p>
          <div className={styles.theaterInfo}>
            <h3>{theaterData.name}</h3>
            <p>{theaterData.address.street}, {theaterData.address.city}, {theaterData.address.state}, {theaterData.address.zipCode}</p>
            <p className={styles.facilities}>{facilities.join(' • ')}</p>
          </div>
          <div className={styles.showInfo}>
            <p><strong>Screen:</strong> {screenName}</p>
            <p><strong>Showtime:</strong> {formatUTCDate(showTime)}</p>
          </div>
        </div>
      </div>

      {/* Screen display */}
      <div className={styles.screenDisplay}>
        <div className={styles.screenLabel}>SCREEN THIS WAY</div>
      </div>

      {/* Seat legend */}
      <div className={styles.seatLegend}>
        <div className={styles.legendItem}>
          <div className={`${styles.seatSample} ${styles.regular}`}></div>
          <span>Regular (₹{basePrice})</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seatSample} ${styles.premium}`}></div>
          <span>Premium (₹{basePrice + 50})</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seatSample} ${styles.booked}`}></div>
          <span>Booked</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.seatSample} ${styles.selected}`}></div>
          <span>Selected</span>
        </div>
      </div>

      {/* Seat layout */}
      <div className={styles.seatLayout}>
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <div key={row} className={styles.seatRow}>
            <div className={styles.rowLabel}>{row}</div>
            <div className={styles.seats}>
              {rowSeats.map((seat, index) => (
                <button
                  key={seat._id}
                  className={`${styles.seat} ${styles[seat.type]} ${seat.status == "booked" ? styles.booked : ''
                    } ${selectedSeats.some(s => s._id === seat._id) ? styles.selected : ''
                    }`}
                  onClick={() => toggleSeatSelection(seat)}
                  disabled={seat.status == "booked"}
                  aria-label={`Seat ${seat.seatNumber} - ${seat.type}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className={styles.orderSummary}>
        <h3>Your Selection</h3>
        <div className={styles.summaryContent}>
          {selectedSeats.length > 0 ? (
            <>
              <div className={styles.selectedSeats}>
                {selectedSeats.map(seat => (
                  <span key={seat._id} className={styles.seatBadge}>
                    {seat.row}{seat.seatNumber}
                  </span>
                ))}
              </div>
              <div className={styles.totalSection}>
                <span>Total:</span>
                <span className={styles.totalAmount}>₹{totalCost}</span>
              </div>
            </>
          ) : (
            <p className={styles.noSeats}>No seats selected yet</p>
          )}
        </div>
        <Gpay
          handleProceed={handleProceed}
          amount={totalCost}
          selectedSeats={selectedSeats}
        >
          Proceed to Payment
        </Gpay>
      </div>
    </div>
  );
};

export default SeatSelection;