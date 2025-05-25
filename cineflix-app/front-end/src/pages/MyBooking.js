import React, { useState, useEffect } from 'react';
import styles from '../styles/MyBooking.module.css';
import { FaHome, FaFilm, FaUser, FaDownload, FaCheck, FaTicketAlt } from 'react-icons/fa';
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; // Import your custom hook
import { useSelector } from 'react-redux';
import TicketPDF from './TicketPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

// CSS variables
const cssVariables = {
    '--primary': 'rgba(15, 23, 42, 0.9)', // Dark blue color
    '--primary-dark': 'rgba(15, 23, 42, 1)',
    '--secondary': '#1f2533',
    '--light': '#f8f9fa',
    '--dark': '#212529',
    '--gray': '#6c757d',
};

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);

    const [downloading, setDownloading] = useState(null);

    const userEmail = useSelector((state) => state.appContext.userEmail);
    const loading = useSelector((state) => state.appContext.loading);

    const { setLoading } = AppContextProvider();

    const fetchBookingsData = async () => {
        setLoading(true);
        try {

            const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/api/getmybookingdata`);

            if (userEmail) url.searchParams.append('userEmail', userEmail);

            // Fetch movies data from API with the constructed URL
            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            setBookings(data);

        } catch (error) {
            console.error('Error fetching my booking details:', error);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchBookingsData();
    }, []);


    return (
        <div style={cssVariables}>

            <div className={styles.container}>
                <h1 className={styles.title}>My Bookings</h1>

                {bookings.length === 0 ? (
                    <div className={styles.noBookings}>
                        <FaTicketAlt size={48} />
                        <p>You have no bookings yet</p>
                    </div>
                ) : (
                    <div className={styles.bookingsContainer}>
                        {bookings.map((booking, index) => (
                            <div key={booking.booking.id} className={styles.bookingCard}
                                style={{ animationDelay: `${0.1 * index}s` }}>
                                <div className={styles.bookingHeader}>
                                    <div>
                                        <div className={styles.movieTitle}>{booking.movie.title}</div>
                                        <div className={styles.bookingId}>ID: {booking.booking.id}</div>
                                    </div>
                                    <div className={styles.rating}>{booking.movie.rating}</div>
                                </div>

                                <div className={styles.bookingContent}>
                                    <div className={styles.compactInfo}>
                                        <div>
                                            <span className={styles.infoLabel}>Date: </span>
                                            <span>{booking.show.day}, {booking.show.date}</span>
                                        </div>
                                        <div>
                                            <span className={styles.infoLabel}>Time: </span>
                                            <span>{booking.show.time}</span>
                                        </div>
                                        <div>
                                            <span className={styles.infoLabel}>Theater: </span>
                                            <span>{booking.theater.name}</span>
                                        </div>
                                        <div>
                                            <span className={styles.infoLabel}>Seats: </span>
                                            <span>{booking.booking.seats.join(", ")}</span>
                                        </div>
                                    </div>

                                    <div className={styles.qrCode}>QR CODE</div>


                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginTop: '30px'
                                    }}>
                                        <PDFDownloadLink
                                            document={<TicketPDF ticketData={booking} />}
                                            fileName={`movie-ticket-${booking.booking.id}.pdf`}
                                            style={{
                                                padding: '12px 24px',
                                                backgroundColor: '#0f172a',
                                                color: 'white',
                                                borderRadius: '4px',
                                                textDecoration: 'none',
                                                fontWeight: 'bold',
                                                height: "6.4vh",
                                                marginBottom: "10px",
                                                position: "relative",
                                                zIndex: "1",
                                                fontSize: '16px',
                                                transition: 'all 0.3s ease',
                                                ':hover': {
                                                    backgroundColor: '#d13550'
                                                }
                                            }}
                                        >
                                            {({ loading }) => (loading ? 'Generating Ticket...' : 'Download Ticket')}
                                        </PDFDownloadLink>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;