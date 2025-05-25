// src/components/Header/Header.jsx
import React, { useState, useEffect } from 'react';
import styles from '../styles/Header.module.css';
import { useNavigate } from 'react-router-dom';
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; // Import your custom hook

const Header = () => {
  const [currentOffer, setCurrentOffer] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { clearState
  } = AppContextProvider();

  const navigate = useNavigate();

  const offers = [
    "🎟️ Get 50% OFF on your first booking!",
    "🍿 Free popcorn on weekends!",
    "💳 10% cashback with XYZ Bank cards",
    "👫 Buy 1 Get 1 Free on Wednesdays",
    "🎁 Special discount for members!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % offers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [offers.length]);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>CINEFLIX</h1>
      </div>

      <div className={styles.offersContainer}>
        {offers.map((offer, index) => (
          <div
            key={index}
            className={`${styles.offer} ${currentOffer === index ? styles.active : ''}`}
          >
            {offer}
          </div>
        ))}
      </div>

      <div className={styles.userMenu}>
        <div className={styles.userIcon} onClick={toggleDropdown}>
          <i className="fas fa-user"></i>
        </div>
        <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.active : ''}`}>
          {/* Added Home Option */}
          <div className={styles.dropdownItem} onClick={() => navigate('/user/homepage')}>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </div>
          
          <div className={styles.dropdownItem} onClick={() => navigate('/user/profile')}>
            <i className="fas fa-user-circle"></i>
            <span>Profile</span>
          </div>
          
          <div className={styles.dropdownItem} onClick={() => navigate('/user/mybooking')}>
            <i className="fas fa-ticket-alt"></i>
            <span>My Bookings</span>
          </div>
          
          <div className={styles.dropdownDivider}></div>
          
          {/* Removed Settings & Kept Logout */}
          <div className={styles.dropdownItem} onClick={() => {
            clearState();
            navigate('/');
          }}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;