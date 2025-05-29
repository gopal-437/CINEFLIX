import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/SeatSelection.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppContextProvider from '../redux/appContext/dispatchActionProvider'; // Import your custom hook


const RazorpayPayment = ({handleProceed, amount, selectedSeats, currency = 'INR',}) => {

  const [loading, setLoading] = useState(false);
  const { movieid } = useParams();

  const screenId = useSelector((state) => state.appContext.screenId);
  const showTime = useSelector((state) => state.appContext.showTime);
  const userEmail = useSelector((state) => state.appContext.userEmail);

  const navigate = useNavigate();

  const { setBookingId
  } = AppContextProvider();

  const removeBooking = async () => {
    try {

      console.log("selected seat for remove",selectedSeats);

      // Prepare the request data
      const requestData = {
        selectedSeats: selectedSeats,
        movieId : movieid,
        screenId : screenId,
        showTime : showTime,
        updatedValue : "available",
      };

      // Make POST request
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/postSelectedSeats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('cancelation failed');
      }

      // const result = await response.json();


    } catch (error) {
      console.error('Cancellation error:', error);
      alert('Failed to cancel seats. Please try again.');
    }

  }

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const displayRazorpay = async () => {
    setLoading(true);

    console.log("razor displau called",process.env.REACT_APP_LOAD_SCRIPT_URL);
    
    try {
      // 1. Load Razorpay script
      const res = await loadScript(`${process.env.REACT_APP_LOAD_SCRIPT_URL}`);
      if (!res) {
        throw new Error('Razorpay SDK failed to load');
      }

      // 2. Create order on backend
      const { data: order } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/create-razorpay-order`, {
        amount: amount * 100 // Convert to paise
      });

      // 3. Initialize Razorpay
      const options = {
        key: `${process.env.REACT_APP_RAZORPAY_ID_KEY}`,
        amount: order.amount,
        currency: order.currency,
        name: "CINEFLIX",
        description: "Test Transaction",
        order_id: order.id,
        handler: async function (response) {
          // Verify payment on backend
          try{

          console.log("submit handler called");

          const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/verify-payment`, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });

          alert('Payment successful!');

          //update payment details into our DB;

          try{

            const requestData = {
              amount: amount,
              userEmail: userEmail,
              movieId: movieid,
              screenId: screenId,
              showTime: showTime,
              selectedSeats: selectedSeats
            };

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/updatePaymentDetails`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${yourAuthToken}` // if needed
              },
              body: JSON.stringify(requestData)
            });

            const data = await response.json();
            setBookingId(data);
            console.log("successfully payment details updated into DB");
            navigate('./../Ticket');

          }
          catch
          {
            console.log("failed to update payment details into our database");
          }

        }

          catch{
            //remove booking
            removeBooking();
            alert("payment failed");
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#3399cc"
        }
      };

      console.log("shoud xxxX");

      const rzp = new window.Razorpay(options);

      rzp.open();

      console.log("after option");
      
      
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <button 
      onClick={() => {
        handleProceed();
        displayRazorpay();
      }} 
      disabled={loading}
      className={styles.proceedBtn}
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};

export default RazorpayPayment;
