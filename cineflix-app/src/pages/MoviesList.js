import { useState, useRef, useEffect } from 'react';
import styles from '../styles/MoviesList.module.css';
import { FaSearch, FaTimes, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import { useSelector } from 'react-redux'; // Import useSelector from react-redux
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; // Import your custom hook
import { useNavigate } from 'react-router-dom';
import DateInput from './DateInput';

const MovieApp = () => {
  const [searchActive, setSearchActive] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [moviesData, setMoviesData] = useState([]); // State to hold movies data
  const [searchTerm, setSearchTerm] = useState(''); // State to hold search term
  const [moviesDataall, setMoviesDataall] = useState([]); // State to hold all movies data

  const userLocation = useSelector((state) => state.appContext.userLocation); 
  const DateValue = useSelector((state) => state.appContext.Date);
  const navigate = useNavigate(); 

  const { setLoading , setUserLocation, setMovieName} = AppContextProvider(); // Use the custom hook to get the setLoading function

  const toggleSearch = () => {
    setSearchActive(!searchActive);
    if (!searchActive && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 0);
    }
  };

  const closeSearch = () => {
    setSearchActive(false);
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  const getMoviesList = async (city,date) => {

    setLoading(true); // Set loading to true when fetching starts

    console.log("city and date is ",city,date);
    
    //fetch movies datata from API
    try {
      const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/api/movieslist`);

     
      // Add city and date as query parameters if they exist
      if (city) url.searchParams.append('city', city);
      if (date) url.searchParams.append('date', date);

      // Fetch movies data from API with the constructed URL
      const response = await fetch(url.toString());
      const data = await response.json();
      const moviesDataall = data.map((movie) => {
        let genrecumma = movie.genres.join(", ");
        return {
          id: movie._id,
          title: movie.title,
          genre: genrecumma,
          image: movie.posterUrl,
        };
      });
      setMoviesData(moviesDataall); 
      setMoviesDataall(moviesDataall); 

      setLoading(false); // Set loading to false when fetching ends
    } catch (error) {
      console.error('Error fetching movies:', error); // Handle errors
      setLoading(false); // Set loading to false even if there's an error
    }

    setLoading(false);

  }

  const locationClickHandler = () => {
     navigate("../../cityselector");
  }

  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {

    const filteredData = moviesDataall.filter((movie) => {
      return searchTerm.length == 0 || movie.title.toLowerCase().includes(searchTerm.toLowerCase()) || movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
    });

    setMoviesData(filteredData); // Update the movies data with the filtered data

  }, [searchTerm]);

  useEffect( () => {
     getMoviesList(userLocation, DateValue);
  },[DateValue]);

  return (
    <div className={styles.app}>
      <header className={styles.mainHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.leftSection}>
            <div className={styles.locationSelector}>
              <FaMapMarkerAlt className={styles.locationIcon} />
              <span className={styles.locationName}>{userLocation}</span>
              <FaChevronDown className={styles.chevronIcon} onClick={locationClickHandler}/>
            </div>
          </div>
          
          <div className={styles.rightSection} ref={searchContainerRef}>
            <div className={`${styles.searchBar} ${searchActive ? styles.searchBarActive : ''}`}>
              <input 
                type="text" 
                placeholder="Search movies..." 
                className={styles.searchInput}
                ref={searchInputRef}
                onChange={(e) => setSearchTerm(e.target.value)} // Assuming you have a state for search term
              />
              <button className={styles.closeSearch} onClick={closeSearch}>
                <FaTimes />
              </button>
            </div>
            <button 
              className={`${styles.searchBtn} ${searchActive ? styles.searchBtnHidden : ''}`} 
              onClick={toggleSearch}
            >
              <FaSearch />
            </button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.headerpart2}>
        <h1 className={styles.pageTitle}>
          Now Showing in <span className={styles.highlight}>{userLocation}</span>
        </h1>
        <DateInput></DateInput>
        </div>
        
        <div className={styles.movieGrid}>
          {moviesData.map(movie => (
            <div key={movie.id} className={styles.movieCard} onClick={() => 
                    { 
                      setMovieName(movie.title);
                      navigate(`/user/movie/${movie.id}`);
                    }}>
              <div className={styles.moviePoster}>
                <img src={movie.image} alt={movie.title} />
                <div className={styles.movieInfo}>
                  <h3 className={styles.movieTitle}>{movie.title}</h3>
                  <p className={styles.movieGenre}>{movie.genre}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MovieApp;