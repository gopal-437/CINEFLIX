const PDFDocument = require('pdfkit');

async function generatePDF(ticketData) {
  const formattedPrice = `${ticketData.booking.price}`; // Unicode for ₹
  const rupeeSymbol = Buffer.from('₹', 'utf8').toString();
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({
        size: [300, 500], // Ticket size
        margin: 0
      });

      // Create buffers to store the PDF
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // ===== TICKET DESIGN =====
      // White background
      doc.rect(0, 0, 300, 500).fill('#FFFFFF');
      
      // Corner ribbon
      doc.save()
         .translate(300, 0)
         .rotate(90)
         .fillColor('#e94560')
         .text('ADMIT ONE', -50, 3, {
           width: 100,
           align: 'center',
           fontSize: 8,
           bold: true
         })
         .restore();

      // Header section
      doc.rect(0, 0, 300, 60).fill('#1a1a2e');
      doc.fontSize(10).fillColor('#e94560').text('PREMIERE CINEMAS', 0, 20, { align: 'center' });
      doc.fontSize(16).fillColor('#FFFFFF').text('E-TICKET', 0, 35, { align: 'center', bold: true });

      // Movie section
      let yPosition = 70;
      doc.fontSize(18).fillColor('#1a1a2e').text(ticketData.movie.title, 20, yPosition, { bold: true });
      yPosition += 20;

      const movieInfo = `${ticketData.movie.rating} • ${ticketData.movie.language} • ${ticketData.movie.genre} • ${ticketData.movie.duration}`;
      doc.fontSize(9).fillColor('#666666').text(movieInfo, 20, yPosition);
      yPosition += 20;

      // Dashed line
      doc.moveTo(20, yPosition)
         .lineTo(280, yPosition)
         .dash(3, { space: 3 })
         .stroke('#e6e6e6')
         .undash();
      yPosition += 15;

      // Helper function for details
      const drawDetail = (label, value, x, y, subValue = null) => {
        doc.fontSize(8).fillColor('#e94560').text(label, x, y, { bold: true });
        doc.fontSize(10).fillColor('#1a1a2e').text(value, x, y + 10, { bold: true });
        if (subValue) {
          doc.fontSize(8).text(subValue, x, y + 20);
        }
      };

      // Details grid - 2 columns
      // Column 1
      drawDetail('DATE', ticketData.show.date, 20, yPosition, ticketData.show.day);
      drawDetail('THEATER', ticketData.theater.name, 20, yPosition + 40, ticketData.theater.location);
      drawDetail('SEATS', ticketData.booking.seats.join(', '), 20, yPosition + 80);

      // Column 2
      drawDetail('TIME', ticketData.show.time, 160, yPosition);
      drawDetail('SCREEN', ticketData.theater.screen, 160, yPosition + 40, ticketData.theater.seating);
      drawDetail('FORMAT', ticketData.show.format, 160, yPosition + 80);

      yPosition += 120;

      // QR section
      doc.rect(0, yPosition, 300, 100).fill('#f8f8f8');

      // QR placeholder
      doc.rect(20, yPosition + 10, 80, 80)
         .fill('#FFFFFF')
         .stroke('#e6e6e6');
      // doc.fontSize(8).fillColor('#cccccc').text('QR CODE', 60, yPosition + 45, { align: 'center' });

      // Booking info - MODIFIED SECTION (changed x-position from 120 to 100)
      doc.fontSize(10)
   .fillColor('#1a1a2e')
   .text(`BOOKING #:`, 
         300 - 20 - 150, // x-position calculation
         yPosition + 30, 
         {
           width: 150, // This creates the boundary
           align: 'right',   // Right-align within the width
           bold: true
         });
         doc.fontSize(10)
         .fillColor('#1a1a2e')
         .text(`${ticketData.booking.id}`, 
               300 - 20 - 150, // x-position calculation
               yPosition + 40, 
               {
                 width: 150, // This creates the boundary
                 align: 'right',   // Right-align within the width
                 bold: true
               });

      

      doc.fontSize(16).fillColor('#e94560').text(`Rs. ${formattedPrice}`, 300-20-150, yPosition + 57, {width: 150, align: 'right', bold: true });

      yPosition += 100;

      // Footer
      doc.rect(0, yPosition, 300, 30).fill('#1a1a2e');
      doc.fontSize(7).fillColor('#FFFFFF').text(ticketData.booking.terms, 20, yPosition + 5, { align: 'center' });
      doc.text(`Booked on: ${ticketData.booking.date}`, 20, yPosition + 15, { align: 'center' });

      // Finalize the PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDF }