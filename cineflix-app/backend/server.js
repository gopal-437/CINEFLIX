const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {addUsers} = require('./helpers/newUserRegistration.js');
const { getCitiesData } = require('./helpers/getCities.js'); // Import the function to get cities data
const { getMoviesList } = require('./helpers/getMovieList.js'); // Import the function to get movies data
const { getMovieDetails } = require('./helpers/getMovieDetails.js'); // Import the function to get movies dat
const { getDataAtSeatSelection } = require('./helpers/getDataAtSeatSelection.js');
const { postSelectedSeats } = require('./helpers/postSelectedSeats.js');
const { updatePaymentDetails } = require('./helpers/updatePaymentDetails.js');
const { getTicketData } = require('./helpers/getTicketData.js');
const { generatePDF } = require('./helpers/generatePDF.js');
const { getProfileData } = require('./helpers/getProfileData.js');
const { updateProfileData } = require('./helpers/updateProfileData.js');
const { getMyBookingData } = require('./helpers/getMyBookingData.js');
const { getTheaterByCity } = require('./helpers/getTheaterByCity.js');
const { getScreenByTheater } = require('./helpers/getScreenByTheater.js');
const { getMoviesData } = require('./helpers/getMoviesData.js');
const { addShowDetails } = require('./helpers/addShowDetails.js');
const cookieParser = require('cookie-parser');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './backend.env' });

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json()); // Parse JSON bodies
// Middleware setup - Fix this part
app.use(cookieParser(process.env.COOKIE_SECRET || 'secret-key'));

// app.use(cors({
//   origin: `${process.env.FRONTEND_URL}`, // Your frontend URL
//   credentials: true , // 👈 ALLOWS COOKIES
//   methods: ['POST', 'OPTIONS'],
//   allowedHeaders: ['Content-Type']
// }));

console.log("origin is ", `${process.env.FRONTEND_URL}`);

app.use(cors({
  origin: `${process.env.FRONTEND_URL}`,
  credentials: true, // Required for cookies/auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // All common methods
  allowedHeaders: [
    "Content-Type",
    "Authorization",  // For JWT tokens
    "X-Requested-With", // Common for AJAX
    "Accept",
  ],
  exposedHeaders: ["Authorization"], // Headers frontend can access
  maxAge: 86400, // Cache preflight results for 24hrs (reduces OPTIONS spam)
}));


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

const transporter = nodemailer.createTransport({
  service: 'Gmail', // You can also use 'Outlook', 'Yahoo', etc.
  auth: {
    user: `${process.env.NODE_MAILER_USER}`, // Your email (stored in .env)
    pass: `${process.env.NODE_MAILER_PASS}`, // Your app password (not regular password)
  },
});


// Create Order
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const options = {
      amount: amount, // amount in paise
      currency: "INR",
      receipt: "order_rcptid_" + Math.random().toString(36).substring(7)
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify Payment
app.post('/api/verify-payment', (req, res) => {
  // const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
  // const body = razorpay_order_id + "|" + razorpay_payment_id;
  // const expectedSignature = crypto
  //   .createHmac('sha256', razorpay.key_secret)
  //   .update(body.toString())
  //   .digest('hex');

  // if (expectedSignature === razorpay_signature) {
  //   res.json({ status: 'success' });
  // } else {
    res.status(200).json({ status: 'failure' });
  // }
});


// Form submission endpoint
app.post('/signup/submit-form', async (req, res) => {
  try {
    const formData = req.body;  

    const statusOfRegistration = await addUsers(formData);

    if (statusOfRegistration !== 'Success') {
      return res.json({
        success: false,
        message: statusOfRegistration
      });
    }

    // Send success response
    res.status(200).json(formData);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});


app.post('/signin/submit-form', async (req, res) => {
  const { email, password } = req.body;
  // const client = new MongoClient(`mongodb://localhost:27017`);
  const client = new MongoClient(`mongodb+srv://gopal5235:Gopal%405235@cluster0.sq9x3fh.mongodb.net/`);

  console.log("sigin called ");

  try {

    await client.connect();
  
    const db = client.db('local-cineflix'); // Your database name

    const users = db.collection('user_collection'); // Your collection name

    console.log("connext success");

    // console.log("connected to MongoDB");

    // 1. Find user by email
    const user = await users.findOne({ email });
    
    if (!user) {
      return res.json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 2. Verify password
    
    if (user.password !== password) {
      return res.json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 3. Successful login
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  } finally {
    await client.close();
  }
});

app.get('/api/cities', async (req, res) => {  

  // console.log("req header",req.headers.cookie);

  console.log("should ne printedded");

  try{
  const cities = await getCitiesData(); 
  res.status(200).json(cities);
  }
  catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/movieslist',async (req, res) => {
  try {
    const movies = await getMoviesList(req.query.city, req.query.date); 
    res.status(200).json(movies);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getmoviedetails', async (req, res) => {

  try {
    const {result , movie} = await getMovieDetails(req.query.city,req.query.movieid,req.query.date); 
    res.status(200).json({result , movie});
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getdataatseatselection', async (req, res) => {


  try {
    const data = await getDataAtSeatSelection(req.query.theaterId,req.query.movieId
      ,req.query.screenId,req.query.showTime); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/postSelectedSeats', async (req, res) => {

  try {
    const data = await postSelectedSeats(req.body); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }

});

app.post('/api/updatePaymentDetails', async (req, res) => {

  try {
    const data = await updatePaymentDetails(req.body); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }

});

app.post('/api/getticketdata', async (req, res) => {

  try {
    const data = await getTicketData(req.body); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }

});

app.post('/api/send-ticket', async (req, res) => {

  // console.log("r4eq data is ",req.body);

  try {
    const { userEmail, ticketData, emailHtml} = req.body;

    const pdfBuffer = await generatePDF(ticketData);
    
    const mailOptions = {
      from: `"BookMyShow Clone" <${"gopalvaghela931@gmail.com"}>`,
      to: userEmail,
      subject: `Your Ticket for ${ticketData.movie.title}`,
      html: emailHtml, // Your HTML template
      attachments: [
        {
          filename: `Ticket_${ticketData.booking.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/getprofiledata', async (req, res) => {
  try {
    const data = await getProfileData(req.query.userEmail); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/postprofiledata', async (req, res) => {
  try {
    const data = await updateProfileData(req.body); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getmybookingdata', async (req, res) => {
  try {
    const data = await getMyBookingData(req.query.userEmail); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/theaterdatabycity', async (req, res) => {
  try {
    const data = await getTheaterByCity(req.query.city); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/screendatabytheater', async (req, res) => {
  try {
    const data = await getScreenByTheater(req.query.theaterId); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/getmoviesdata', async (req, res) => {
  try {
    const data = await getMoviesData(); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/addshowdetails', async (req, res) => {
  try {
    const data = await addShowDetails(req.body); 
    res.status(200).json(data);
  } catch (error) { 
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
