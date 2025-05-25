import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontFamily: 'Helvetica-Bold'
  },
  ticket: {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    color: '#ffffff',
    textAlign: 'center'
  },
  cinemaName: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 5,
    color: '#e94560'
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'extrabold',
    letterSpacing: 1
  },
  movieSection: {
    padding: 20,
    borderBottom: '1px dashed #e6e6e6'
  },
  movieTitle: {
    fontSize: 18,
    color: '#1a1a2e',
    marginBottom: 5,
    fontWeight: 'black'
  },
  movieInfo: {
    fontSize: 9,
    color: '#666666',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15
  },
  detailBlock: {
    width: '50%',
    marginBottom: 15,
    paddingRight: 10
  },
  detailLabel: {
    fontSize: 8,
    color: '#e94560',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontWeight: 'bold'
  },
  detailValue: {
    fontSize: 10,
    color: '#1a1a2e',
    fontWeight: 'bold'
  },
  qrSection: {
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8'
  },
  qrContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    border: '1px solid #e6e6e6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bookingInfo: {
    textAlign: 'right'
  },
  bookingId: {
    fontSize: 10,
    color: '#1a1a2e',
    marginBottom: 5,
    fontWeight: 'bold'
  },
  price: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: 'black'
  },
  footer: {
    padding: 15,
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    fontSize: 7,
    textAlign: 'center',
    letterSpacing: 0.5
  },
  cornerRibbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#e94560',
    color: '#ffffff',
    padding: '3px 15px',
    fontSize: 8,
    fontWeight: 'bold',
    transform: 'rotate(90deg) translateX(50%)',
    transformOrigin: '100% 0'
  }
});


const TicketPDF = ({ticketData}) => (
  <Document>
    <Page size={[300, 500]} style={styles.page}> {/* Custom size for ticket */}
      <View style={styles.ticket}>
        {/* Corner ribbon */}
        <View style={styles.cornerRibbon}>
          <Text>ADMIT ONE</Text>
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.cinemaName}>PREMIERE CINEMAS</Text>
          <Text style={styles.ticketTitle}>E-TICKET</Text>
        </View>
        
        {/* Movie section */}
        <View style={styles.movieSection}>
          <Text style={styles.movieTitle}>{ticketData.movie.title}</Text>
          <Text style={styles.movieInfo}>
            {ticketData.movie.rating} • {ticketData.movie.language} • {ticketData.movie.genre} • {ticketData.movie.duration}
          </Text>
        </View>
        
        {/* Details grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>DATE</Text>
            <Text style={styles.detailValue}>{ticketData.show.date}</Text>
            <Text style={[styles.detailValue, { fontSize: 8 }]}>{ticketData.show.day}</Text>
          </View>
          
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>TIME</Text>
            <Text style={styles.detailValue}>{ticketData.show.time}</Text>
          </View>
          
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>THEATER</Text>
            <Text style={styles.detailValue}>{ticketData.theater.name}</Text>
            <Text style={[styles.detailValue, { fontSize: 8 }]}>{ticketData.theater.location}</Text>
          </View>
          
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>SCREEN</Text>
            <Text style={styles.detailValue}>{ticketData.theater.screen}</Text>
            <Text style={[styles.detailValue, { fontSize: 8 }]}>{ticketData.theater.seating}</Text>
          </View>
          
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>SEATS</Text>
            <Text style={styles.detailValue}>{ticketData.booking.seats.join(', ')}</Text>
          </View>
          
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>FORMAT</Text>
            <Text style={styles.detailValue}>{ticketData.show.format}</Text>
          </View>
        </View>
        
        {/* QR section */}
        <View style={styles.qrSection}>
          <View style={styles.qrContainer}>
            <Text style={{ fontSize: 8, color: '#cccccc' }}>QR CODE</Text>
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingId}>BOOKING #: {ticketData.booking.id}</Text>
            <Text style={styles.price}>₹ {ticketData.booking.price}</Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>{ticketData.booking.terms}</Text>
          <Text>Booked on: {ticketData.booking.date}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default TicketPDF;