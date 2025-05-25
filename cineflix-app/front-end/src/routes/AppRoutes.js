import React from "react";
import { Routes, Route } from "react-router-dom";
import { LandingPage } from "../pages/landing";
import LoginPage from "../pages/Login";
import SignupPage from "../pages/Signup";
import CitySelector from "../pages/CitySelector";
import MainPage from "../pages/MainPage";
import SelectedMovie from "../pages/SelectedMovie";
import SeatSelection from "../pages/SeatSelection";
import MoviesList from "../pages/MoviesList";
import DownloadTicket from "../pages/DownloadTicket";
import UserProfile from "../pages/UserProfile"
import MyBooking from "../pages/MyBooking";
import AdminDashboard from "../pages/AdminDashboard";

const handlePaymentSuccess = (response) => {
    console.log("Payment success:", response);
    // Verify payment on backend (recommended)
    // await axios.post('/api/verify-payment', { response });
    alert("Payment successful!");
};

  
const handlePaymentFailure = (error) => {
      console.error("Payment failed:", error);
      alert(`Payment failed: ${error}`);
    };

const AppRoutes = () => {

    const {RAZORPAY_ID_KEY} = process.env;
    return (
            <Routes>
                <Route path="/" element={<LandingPage></LandingPage>} />
                <Route path="/login" element={<LoginPage></LoginPage>} />
                <Route path="/signup" element={<SignupPage></SignupPage>} />
                <Route path="/cityselector" element={<CitySelector></CitySelector>} />
                <Route path="/user" element={<MainPage></MainPage>}>
                  <Route path="homepage" element={<MoviesList />} />
                  <Route path="movie/:movieid" element={<SelectedMovie></SelectedMovie>} />
                  <Route path="movie/:movieid/seatselection" element={<SeatSelection></SeatSelection>} />
                  <Route path="movie/:movieid/Ticket" element={<DownloadTicket></DownloadTicket>} />
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="mybooking" element={<MyBooking></MyBooking>} />
                 </Route>
                <Route path="/admin" element={<AdminDashboard></AdminDashboard>} />
                
            </Routes>
    );
};

export default AppRoutes;
