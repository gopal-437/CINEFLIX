import React, { useState, useRef, useEffect } from 'react';
import AppContextProvider from '../redux/appContext/dispatchActionProvider';
import { useSelector } from 'react-redux';
import styles from '../styles/DateInput.module.css'; // Import CSS module

const AnimatedDateInput = () => {
  const DateValue = useSelector((state) => state.appContext.Date); 
  const [minDate, setMinDate] = useState('');
  const { setDate } = AppContextProvider();
  const inputRef = useRef(null);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setMinDate(formattedDate);
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setDate(newValue);
    
    if (newValue) {
      inputRef.current.classList.add(styles.filled);
      setTimeout(() => {
        inputRef.current.classList.remove(styles.filled);
      }, 1000);
    }
  };

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="date"
        id="animated-date"
        className={styles.input}
        value={DateValue}
        onChange={handleChange}
        placeholder=" "
        min={minDate}
      />
      <label htmlFor="animated-date" className={styles.label}>
        Select a date
      </label>
    </div>
  );
};

export default AnimatedDateInput;