import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TicketPDF from './TicketPDF';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import sendTicketEmail from './sendTicketEmail';
import BackButton from './BackButton';

const DownloadTicket = () => {
  // Same data used in PDF for consistency

  const [ticketData, setTicketData] = useState(null);

  const { movieid } = useParams();

  const navigate = useNavigate();

  const theaterId = useSelector((state) => state.appContext.theaterId);
  const bookingId = useSelector((state) => state.appContext.bookingId);
  const showTime = useSelector((state) => state.appContext.showTime);
  const screenName = useSelector((state) => state.appContext.screenName);
  const totalCost = useSelector((state) => state.appContext.totalCost);
  const selectedSeatsByUser = useSelector((state) => state.appContext.selectedSeatsByUser);

  const seatNames = selectedSeatsByUser.map((seat) => seat.row + seat.seatNumber);

  const fetchNecData = async () => {

    try {

      const requestData = {
        movieId: movieid,
        theaterId: theaterId,
        bookingId: bookingId,
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getticketdata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      const { date, day } = formatDateTime(showTime);
      const payDate = formatDateTime(data.booking.date);

      const preapareTicketData = {
        movie: {
          title: data.movie.title,
          language: data.movie.language.join(", "),
          genre: data.movie.genre,
          duration: formatMinutesToHM(data.movie.duration),
          rating: data.movie.rating
        },
        show: {
          date: date,
          day: day,
          time: getFormatedTime(showTime),
          format: "IMAX 3D"
        },
        theater: {
          name: data.theater.name,
          location: data.theater.location,
          screen: screenName,
          seating: "RECLINER"
        },
        booking: {
          id: bookingId,
          date: payDate.date + ", " + payDate.time,
          seats: seatNames,
          price: totalCost,
          terms: "Please arrive 30 minutes before showtime. Late entry not permitted."
        }
      };

      setTicketData(preapareTicketData);
      sendTicketEmail("gopalvaghela931@gmail.com", preapareTicketData);

    }
    catch {
      console.log("error to failed fetch data for ticket");
    }
  }

  useEffect(() => {

    fetchNecData();

  }, [])

  function formatMinutesToHM(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  function formatDateTime(isoString) {
    const date = new Date(isoString);

    // Validate the input
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string provided');
    }

    // Format date (e.g., "June 16, 2023")
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get day name (e.g., "Friday")
    const day = date.toLocaleDateString('en-US', {
      weekday: 'long'
    });

    // Format time (e.g., "4:00 PM")
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return {
      date: formattedDate,
      day,
      time,
    };
  }

  function getFormatedTime(isoString) {
    // Extract time directly from ISO string (UTC)
    const timePart = isoString.split('T')[1].split('.')[0];
    const [hours, minutes] = timePart.split(':');

    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const twelveHour = hourNum % 12 || 12;

    return `${twelveHour}:${minutes} ${ampm}`;
  }

  if (!ticketData) return <></>

  return (
    <>
      <div style={{
          margin: '20px 0 0 20px', // top right bottom left
        }}>
      <BackButton
        onClick={() => { navigate('../homepage') }}
      />
      </div>

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>

        {/* Preview Header */}
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Your Ticket Preview</h2>

        {/* Ticket Preview (matches PDF layout) */}
        <div style={{
          width: '300px',
          height: '500px',
          margin: '0 auto',
          position: 'relative',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Corner ribbon */}
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: '#e94560',
            color: '#ffffff',
            padding: '3px 15px',
            fontSize: '8px',
            fontWeight: 'bold',
            transform: 'rotate(90deg) translateX(50%)',
            transformOrigin: '100% 0',
            zIndex: '1'
          }}>
            ADMIT ONE
          </div>

          {/* Header */}
          <div style={{
            backgroundColor: '#1a1a2e',
            padding: '20px',
            color: '#ffffff',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '2px',
              marginBottom: '5px',
              color: '#e94560'
            }}>
              PREMIERE CINEMAS
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '1px'
            }}>
              E-TICKET
            </div>
          </div>

          {/* Movie section */}
          <div style={{
            padding: '20px',
            borderBottom: '1px dashed #e6e6e6'
          }}>
            <div style={{
              fontSize: '18px',
              color: '#1a1a2e',
              marginBottom: '5px',
              fontWeight: '900'
            }}>
              {ticketData.movie.title}
            </div>
            <div style={{
              fontSize: '9px',
              color: '#666666',
              letterSpacing: '0.5px',
              marginBottom: '10px'
            }}>
              {ticketData.movie.rating} • {ticketData.movie.language} • {ticketData.movie.genre} • {ticketData.movie.duration}
            </div>
          </div>

          {/* Details grid */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            padding: '15px'
          }}>
            {/* Date */}
            <div style={{ width: '50%', marginBottom: '15px', paddingRight: '10px' }}>
              <div style={{
                fontSize: '8px',
                color: '#e94560',
                letterSpacing: '0.5px',
                marginBottom: '2px',
                fontWeight: 'bold'
              }}>
                DATE
              </div>
              <div style={{
                fontSize: '10px',
                color: '#1a1a2e',
                fontWeight: 'bold'
              }}>
                {ticketData.show.date}
              </div>
              <div style={{
                fontSize: '8px',
                color: '#1a1a2e',
                fontWeight: 'bold'
              }}>
                {ticketData.show.day}
              </div>
            </div>

            {/* Time */}
            <div style={{ width: '50%', marginBottom: '15px', paddingRight: '10px' }}>
              <div style={styles.detailLabel}>TIME</div>
              <div style={styles.detailValue}>{ticketData.show.time}</div>
            </div>

            {/* Theater */}
            <div style={{ width: '50%', marginBottom: '15px', paddingRight: '10px' }}>
              <div style={styles.detailLabel}>THEATER</div>
              <div style={styles.detailValue}>{ticketData.theater.name}</div>
              <div style={{ ...styles.detailValue, fontSize: '8px' }}>{ticketData.theater.location}</div>
            </div>

            {/* Screen */}
            <div style={{ width: '50%', marginBottom: '15px', paddingRight: '10px' }}>
              <div style={styles.detailLabel}>SCREEN</div>
              <div style={styles.detailValue}>{ticketData.theater.screen}</div>
              <div style={{ ...styles.detailValue, fontSize: '8px' }}>{ticketData.theater.seating}</div>
            </div>

            {/* Seats */}
            <div style={{ width: '50%', marginBottom: '15px', paddingRight: '10px' }}>
              <div style={styles.detailLabel}>SEATS</div>
              <div style={styles.detailValue}>{ticketData.booking.seats.join(', ')}</div>
            </div>

            {/* Format */}
            <div style={{ width: '50%', marginBottom: '15px', paddingRight: '10px' }}>
              <div style={styles.detailLabel}>FORMAT</div>
              <div style={styles.detailValue}>{ticketData.show.format}</div>
            </div>
          </div>

          {/* QR section */}
          <div style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8f8f8'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#ffffff',
              border: '1px solid #e6e6e6',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '8px', color: '#cccccc' }}>QR CODE</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '10px',
                color: '#1a1a2e',
                marginBottom: '5px',
                fontWeight: 'bold'
              }}>
                BOOKING #: {ticketData.booking.id}
              </div>
              <div style={{
                fontSize: '16px',
                color: '#e94560',
                fontWeight: '900'
              }}>
                ₹{ticketData.booking.price}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '15px',
            backgroundColor: '#1a1a2e',
            color: '#ffffff',
            fontSize: '7px',
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}>
            <div>{ticketData.booking.terms}</div>
            <div>Booked on: {ticketData.booking.date}</div>
          </div>
        </div>

        {/* Centered Download Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '30px'
        }}>
          <PDFDownloadLink
            document={<TicketPDF ticketData={ticketData} />}
            fileName={`movie-ticket-${ticketData.booking.id}.pdf`}
            style={{
              padding: '12px 24px',
              backgroundColor: '#e94560',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold',
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
    </>
  );
};

// Styles object for consistency
const styles = {
  detailLabel: {
    fontSize: '8px',
    color: '#e94560',
    letterSpacing: '0.5px',
    marginBottom: '2px',
    fontWeight: 'bold'
  },
  detailValue: {
    fontSize: '10px',
    color: '#1a1a2e',
    fontWeight: 'bold'
  }
};

export default DownloadTicket;