// src/components/CenteredSearchBox.jsx
import React, { useEffect, useState } from 'react';
import styles from '../styles/CitySelector.module.css'; // Updated import
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector from react-redux
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; // Import your custom hook

const CitySelector = () => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState("");

  const navigate = useNavigate();
  const { setLoading , setUserLocation} = AppContextProvider(); // Use the custom hook to get the setLoading function

  const isloading = useSelector((state) => state.appContext.loading); 

  async function fetchCities() {

    setLoading(true); // Set loading to true when fetching starts

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cities`);
      const citiesData = await response.json();
      setOptions(citiesData);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }

    setLoading(false); // Set loading to false when fetching ends
  }

  useEffect(() => {
    fetchCities();
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption) {
      alert(`Submitted: ${selectedOption.label}`);
    } else {
      alert('Please select an option');
    }

    setUserLocation(selectedOption.label); // Set the user location in the context
    navigate("../user/homepage");
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchBox}>
        <h2 className={styles.title}>Enter Your City</h2>

        {/* Search Bar */}
        <div className={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Options List with fixed height */}
        <div className={styles.optionsListContainer}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option)}
                className={`${styles.optionItem} ${selectedOption?.id === option.id ? styles.selected : ''}`}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className={styles.noOptions}>No options found</div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className={styles.submitButton}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default CitySelector;