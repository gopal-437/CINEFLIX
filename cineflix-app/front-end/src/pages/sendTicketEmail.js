// import { renderToBuffer } from '@react-pdf/renderer';
import axios from 'axios';

async function sendTicketEmail(userEmail, ticketData) {

  try {
    // 1. Generate PDF buffer from your TicketPDF component


    // const pdfBuffer = await renderToBuffer(
    //   <TicketPDF/>
    // );

    // 2. Generate HTML email content from the same ticket data
    const emailHtml = generateEmailHtml(ticketData);

    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/send-ticket`, {
        userEmail,
        ticketData,
        emailHtml,
      });
      console.log("send mail api res",response.data.message); // "Email sent successfully!"
      return response.data;

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Helper function to generate HTML email from ticket data
function generateEmailHtml(ticketData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #e94560; text-align: center;">Your Ticket for ${ticketData.movie.title}</h2>
      
      <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1a1a2e;">${ticketData.movie.title}</h3>
        <p style="color: #666; font-size: 14px;">
          ${ticketData.movie.rating} • ${ticketData.movie.language} • ${ticketData.movie.genre} • ${ticketData.movie.duration}
        </p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
          <div>
            <p style="font-weight: bold; color: #e94560; margin-bottom: 5px; font-size: 12px;">DATE</p>
            <p style="margin: 0;">${ticketData.show.date}</p>
            <p style="margin: 0; font-size: 12px;">${ticketData.show.day}</p>
          </div>
          
          <div>
            <p style="font-weight: bold; color: #e94560; margin-bottom: 5px; font-size: 12px;">TIME</p>
            <p style="margin: 0;">${ticketData.show.time}</p>
          </div>
          
          <div>
            <p style="font-weight: bold; color: #e94560; margin-bottom: 5px; font-size: 12px;">THEATER</p>
            <p style="margin: 0;">${ticketData.theater.name}</p>
            <p style="margin: 0; font-size: 12px;">${ticketData.theater.location}</p>
          </div>
          
          <div>
            <p style="font-weight: bold; color: #e94560; margin-bottom: 5px; font-size: 12px;">SCREEN</p>
            <p style="margin: 0;">${ticketData.theater.screen}</p>
            <p style="margin: 0; font-size: 12px;">${ticketData.theater.seating}</p>
          </div>
          
          <div>
            <p style="font-weight: bold; color: #e94560; margin-bottom: 5px; font-size: 12px;">SEATS</p>
            <p style="margin: 0;">${ticketData.booking.seats.join(', ')}</p>
          </div>
          
          <div>
            <p style="font-weight: bold; color: #e94560; margin-bottom: 5px; font-size: 12px;">FORMAT</p>
            <p style="margin: 0;">${ticketData.show.format}</p>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <p style="font-weight: bold; color: #1a1a2e;">Booking #: ${ticketData.booking.id}</p>
          <p style="font-size: 18px; font-weight: bold; color: #e94560;">₹${ticketData.booking.price}</p>
        </div>
      </div>
      
      <p style="text-align: center; font-size: 14px;">
        Your ticket is attached as a PDF. Please present it at the theater entrance.
      </p>
      
      <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
        ${ticketData.booking.terms}<br>
        Booked on: ${ticketData.booking.date}
      </p>
    </div>
  `;
}

export default sendTicketEmail;