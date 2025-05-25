import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/AdminDashboard.module.css';
import HeaderAdmin from './HeaderAdmin'
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; // Import your custom hook
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
  // Hardcoded data
  const [cities, setCities] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [screenId, setScreenId] = useState(null);
  const [theaterId, setTheatersId] = useState(null);
  const [moviesData, setMoviesData] = useState([]);
  const [movieId, setMovieId] = useState(null);

  const userEmail = useSelector((state) => state.appContext.userEmail); 

  const { setLoading } = AppContextProvider(); // Use the custom hook to get the setLoading function


  async function fetchCities() {

    setLoading(true); // Set loading to true when fetching starts

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cities`);
      const citiesData = await response.json();
      setCities(citiesData);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }

    setLoading(false); // Set loading to false when fetching ends
  }

  async function fetchTheaters() {

    setLoading(true); // Set loading to true when fetching starts

    try {

      const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/api/theaterdatabycity`);

      if (formData.city) url.searchParams.append('city', formData.city);

      // Fetch movies data from API with the constructed URL
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTheaters(data);
    } catch (error) {
      console.error('Error fetching theater details:', error);
    }

    setLoading(false); // Set loading to false when fetching ends
  }

  async function fetchScreen() {

    setLoading(true); // Set loading to true when fetching starts


    try {

      const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/api/screendatabytheater`);

      if (theaterId) url.searchParams.append('theaterId', theaterId);

      // Fetch movies data from API with the constructed URL
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setScreens(data);
    } catch (error) {
      console.error('Error fetching screen details:', error);
    }

    setLoading(false); // Set loading to false when fetching ends
  }

  async function fetchMovies() {

    setLoading(true); // Set loading to true when fetching starts


    try {

      const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/api/getmoviesdata`);

      // Fetch movies data from API with the constructed URL
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMoviesData(data);
    } catch (error) {
      console.error('Error fetching movies details:', error);
    }

    setLoading(false); // Set loading to false when fetching ends
  }

  async function postShowDetails() {
    setLoading(true); // Set loading to true when fetching starts

    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/addshowdetails`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminEmail: userEmail,
          screenId: screenId,
          movieId: movieId,
          date: formData.date,
          time: formData.time,
          price: formData.price,
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error adding show details:', error);
      alert('Error adding show details. Please try again.');
    }

    setLoading(false); // Set loading to false when fetching ends
  }


  const timeSlots = ['10:00 AM', '1:30 PM', '4:00 PM', '7:30 PM', '11:00 PM'];
  
  
  
  // State management
  const [formData, setFormData] = useState({
    city: '',
    theater: '',
    screen: '',
    movie: '',
    date: '',
    time: '',
    price: '',
  });
  
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    fetchCities();
    fetchMovies();
  }, []);

  useEffect(() => {
    fetchTheaters();
  }, [formData.city]);

  useEffect(() => {
    fetchScreen();
  },[formData.theater]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === "theater") {
      const selectedTheater = theaters.find(t => t.name=== value);
      setTheatersId(selectedTheater?._id);
      setScreenId(null);
      setScreens([]);
      formData.screen = '';
    }
    if (name === "screen") {
      // Similarly for screen
      const selectedScreen = screens.find(s => s.name === value);
      setScreenId(selectedScreen?._id);
    }

    if (name === "movie") {
      // Similarly for movie
      const selectedMovie = moviesData.find(m => m.title === value);
      setMovieId(selectedMovie?._id);
    }
  };

  useEffect(() => {
    setTheatersId(null);
    setScreenId(null);
    setScreens([]);
    setTheaters([]);
    formData.theater = '';
    formData.screen = '';
  },[formData.city]);

  const handleSubmit = (e) => {
    e.preventDefault();

    postShowDetails();
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Ensure only numbers are entered
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({
        ...prev,  
        price: value
      }));
    }
  };

  const isFormValid = Object.values(formData).every(value => value !== '');


  return (
    <>
      <HeaderAdmin></HeaderAdmin>
      <div className={styles.adminContainer}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.adminHeader}
        >
          <h1>Movie Screening Management</h1>
          <p>Add new movie screenings to the system</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={styles.adminForm}
        >
          <div className={styles.formGrid}>

            <div className={styles.formGroup}>
              <label htmlFor="city">City</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              >
                <option value="">Select City</option>
                {cities && cities.map(city => (
                  <option key={city.id} value={city.label}>{city.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="theater">Theater</label>
              <select
                id="theater"
                name="theater"
                value={formData.theater}
                onChange={handleChange}
                disabled={!formData.city}
                required
              >
                <option value="">Select Theater</option>
                {theaters && theaters.map(theater => (
                  <option key={theater._id} value={theater.name}>{theater.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="screen">Screen</label>
              <select
                id="screen"
                name="screen"
                value={formData.screen}
                onChange={handleChange}
                required
              >
                <option value="">Select Screen</option>
                {screens.map(screen => (
                  <option key={screen._id} value={screen.name}>{screen.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="movie">Movie</label>
              <select
                id="movie"
                name="movie"
                value={formData.movie}
                onChange={handleChange}
                required
              >
                <option value="">Select Movie</option>
                {moviesData.map(movie => (
                  <option key={movie._id} value={movie.title}>{movie.title}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="time">Time</label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              >
                <option value="">Select Time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
              <label htmlFor="price">Price (₹)</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handlePriceChange}
                placeholder="Enter price in rupees"
                required
              />
            </div>

          <motion.button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Add Screening
          </motion.button>
        </motion.form>

        {/* Success Alert */}
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={styles.alert}
          >
            <div className={styles.alertContent}>
              <span className={styles.alertIcon}>✓</span>
              <p>Screening added successfully!</p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;