import React, { use, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendarAlt, faLanguage, faTag, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import styles from '../styles/SelectedMovie.module.css';
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; // Import your custom hook
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams to get URL parameters



const SelectedMovie = () => {

  const [currentSelection, setCurrentSelection] = useState({
    theater: null,
    showtime: null,
    screenValue: null,
    price: null
  });

  const isloading = useSelector((state) => state.appContext.loading);
  const userLocation = useSelector((state) => state.appContext.userLocation);
  const dateValue = useSelector((state) => state.appContext.Date);

  const { setLoading, setScreenId, setShowTime , setTheaterId, setScreenName, 
    setBasePrice
  } = AppContextProvider(); // Use the custom hook to get the setLoading function

  const { movieid } = useParams();

  const [availableScreens, setAvailableScreens] = useState([]);
  const [theatersData, setTheatersData] = useState([]);
  const [movieData, setMovieData] = useState(null);

  const navigate = useNavigate();

  const handleShowtimeClick = (theater, showtime) => {

    const matchingShowTimes = theater.showTimes.filter(
      show => showtime === show.startTime
    );

    // Extract screens from matching showtimes (flatten if multiple)
    const screensxx = matchingShowTimes.flatMap(show => show.screens);

    const screenNames = screensxx.map((screen) => screen.screenName);

    setScreenId(screensxx[0].screenId);
    setShowTime(showtime);

    setAvailableScreens(screensxx);

    const pricetemp = screensxx[0].price;

    setCurrentSelection({
      theater: theater,
      showtime: showtime,
      screenValue: screenNames[0],
      price: pricetemp
    });
  };


  const handleBookNow = () => {
    if (!currentSelection.theater || !currentSelection.showtime) {
      alert('Please select a theater and showtime first');
      return;
    }

    alert(`Booking Details\n\n` +
      `Theater: ${currentSelection.theater.name}\n` +
        `Screen: ${currentSelection.screenValue}\n` +
      `Time: ${currentSelection.showtime}\n` +
      `Price: $${currentSelection.price}`);


    setTheaterId(currentSelection.theater.theaterId);
    setScreenName(currentSelection.screenValue);
    setBasePrice(currentSelection.price);


    navigate("./seatselection");
  };

  function getFormatedTime(isoString) {
    // Extract time directly from ISO string (UTC)
    const timePart = isoString.split('T')[1].split('.')[0];
    const [hours, minutes] = timePart.split(':');

    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const twelveHour = hourNum % 12 || 12;

    return `${twelveHour}:${minutes} ${ampm}`;
  }

  function formatMinutesToHM(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  function getFormatedDate(releaseDate) {
    const formattedDate = new Date(releaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return formattedDate;
  }

  const fetchmovieDetails = async () => {

    setLoading(true); // Set loading to true when fetching starts

    try {

      const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/api/getmoviedetails`);

      if (userLocation) url.searchParams.append('city', userLocation);
      if (dateValue) url.searchParams.append('date', dateValue);
      if (movieid) url.searchParams.append('movieid', movieid);

      // Fetch movies data from API with the constructed URL
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMovieData(data.movie);
      // console.log("xxx",data.result);
      setTheatersData(data.result);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }

    setLoading(false); // Set loading to false when fetching ends
  };

  function getPriceByShowtimeAndScreen(theater, targetShowTime, targetScreenName) {
    // Find the matching showtime
    const matchingShowTime = theater.showTimes.find(show =>
      show.startTime === targetShowTime
    );

    if (!matchingShowTime) {
      throw new Error("No show found for the given time");
    }

    // Find the matching screen
    const matchingScreen = matchingShowTime.screens.find(screen =>
      screen.screenName === targetScreenName
    );

    if (!matchingScreen) {
      throw new Error("No screen found with the given name");
    }

    return matchingScreen.price;
  }

  const handleScreenChange = (theater, screen) => {

    setCurrentSelection(
      {
        theater: theater,
        showtime: currentSelection.showtime,
        screenValue: screen.screenName,
        price: getPriceByShowtimeAndScreen(theater, currentSelection.showtime, screen.screenName)
      });
    setScreenId(screen.screenId);
  }

  useEffect(() => {
    fetchmovieDetails(); // Fetch movie details when the component mounts
  }
    , []);



  return (
    <div className={styles.movieContainer}>
      {/* Movie Header Section */}
      {movieData &&
        <section className={styles.movieHeader}>
          <img
            src={movieData.posterUrl}
            alt={movieData.title}
            className={styles.moviePoster}
          />

          <div className={styles.movieInfo}>
            <h1 className={styles.movieTitle}>{movieData.title}</h1>

            <div className={styles.movieMeta}>
              <span><FontAwesomeIcon icon={faClock} /> {formatMinutesToHM(movieData.durationMinutes)}</span>
              <span><FontAwesomeIcon icon={faCalendarAlt} /> {getFormatedDate(movieData.releaseDate)}</span>
              <span className={styles.ratingBadge}>{movieData.rating}</span>
              <span><FontAwesomeIcon icon={faLanguage} />{movieData.languages.join(', ')}</span>
            </div>

            <p className={styles.movieDescription}>
              {movieData.description}
            </p>

            <div className={styles.genreList}>
              {movieData.genres.map((genre) => <span key={genre} className={styles.genreTag}>{genre}</span>)}
            </div>

            <a href={movieData.trailerUrl} className={styles.trailerBtn}>
              <FontAwesomeIcon icon={faYoutube} /> Watch Trailer
            </a>
          </div>
        </section>
      }

      {/* Theaters Section */}
      {theatersData.length > 0 &&
        <section className={styles.theatersSection}>
          <h2 className={styles.sectionTitle}>Available Theaters</h2>

          <div className={`${styles.selectionSummary} ${currentSelection.theater ? styles.selectionSummaryShow : ''}`}>
            <p><strong>Current Selection:</strong></p>
            <p>{currentSelection.theater ? currentSelection.theater.name : 'No theater selected'}</p>
            <p>{currentSelection.showtime ? getFormatedTime(currentSelection.showtime) : 'No showtime selected'}</p>
            <p>
              {currentSelection.screenValue
                ? `${currentSelection.screenValue.charAt(0).toUpperCase() + currentSelection.screenValue.slice(1)} ($${currentSelection.price})`
                : 'No screen type selected'}
            </p>
          </div>



          {theatersData.map(theater => (
            <div key={theater.theaterId} className={styles.theaterCard}>
              <h3 className={styles.theaterName}>{theater.name}</h3>
              <p className={styles.theaterAddress}>{theater.address.street} {theater.address.city} {theater.address.state} {theater.address.zipCode}</p>

              <div className={styles.theaterDetails}>
                <div className={styles.priceInfo}>
                  <FontAwesomeIcon icon={faTag} /> Starting from $20
                </div>

                <div className={styles.screenSelector}>
                  <label htmlFor={`screen-${theater.id}`}>Screen No:</label>
                  <select
                    id={`screen-${theater.theaterId}`}
                    value={
                      currentSelection.theater?.theaterId === theater.theaterId
                        ? currentSelection.screenValue?.screenId
                        : ""
                    }
                    onChange={(e) => {
                      const selectedScreenId = e.target.value;
                      const selectedScreen = availableScreens.find(s => s.screenId === selectedScreenId);
                      handleScreenChange(theater, selectedScreen); // Pass the full screen object
                    }}
                  >
                    {availableScreens.map(screen => (
                      <option key={screen.screenId} value={screen.screenId}>
                        {screen.screenName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.showtimes}>
                {theater.showTimes.map((showtime, index) => (
                  <button
                    key={index}
                    className={`${styles.showtimeBtn} ${currentSelection.theater?.theaterId === theater.theaterId &&
                        currentSelection.showtime === showtime.startTime ? styles.showtimeBtnActive : ''
                      }`}
                    onClick={() => handleShowtimeClick(theater, showtime.startTime)}
                  >
                    {getFormatedTime(showtime.startTime)}
                    {/* <span className={styles.showtimePrice}>${showtime.screens[0].price}</span> */}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>}

      {/* Booking Section */}
      <section className={styles.bookingSection}>
        <button className={styles.bookBtn} onClick={handleBookNow}>
          <FontAwesomeIcon icon={faTicketAlt} /> Book Now
        </button>
      </section>
    </div>
  );
};

export default SelectedMovie;
// import React, { useState } from 'react';