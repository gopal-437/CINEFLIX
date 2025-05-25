import { useDispatch } from 'react-redux';
import { setLoading, setUserLocation, setDate, setScreenId, setShowTime,
  setMovieName, setScreenName, setTheaterId,
  setBasePrice, setTotalCost, setSelectedSeatsByUser,
  setUserEmail,
  setBookingId,
  clearState,
} from './appContextSlice';

// Create a custom hook for easier access to app context actions
const AppContextProvider = () => {
  const dispatch = useDispatch();

  return (
    {
    "setLoading": (isLoading) => dispatch(setLoading(isLoading)),
    "setUserLocation": (location) => dispatch(setUserLocation(location)),
    "setDate": (date) => dispatch(setDate(date)),
    "setShowTime": (showtime) => dispatch(setShowTime(showtime)),
    "setScreenId": (screenId) => dispatch(setScreenId(screenId)),
    "setMovieName": (movieName) => dispatch(setMovieName(movieName)),
    "setTheaterId": (theaterId) => dispatch(setTheaterId(theaterId)),
    "setScreenName": (screenName) => dispatch(setScreenName(screenName)),
    "setBasePrice": (basePrice) => dispatch(setBasePrice(basePrice)),
    "setTotalCost": (totalCost) => dispatch(setTotalCost(totalCost)),
    "setSelectedSeatsByUser": (selectedSeats) => dispatch(setSelectedSeatsByUser(selectedSeats)),
    "setUserEmail": (email) => dispatch(setUserEmail(email)),
    "setBookingId": (bookingId) => dispatch(setBookingId(bookingId)),
    "clearState": () => dispatch(clearState()),
    }
);
};

export default AppContextProvider;
