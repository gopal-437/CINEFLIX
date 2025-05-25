// userSlice.js
import { createSlice } from '@reduxjs/toolkit';
import initialState from './initialState';



const appContextSlice = createSlice({
  name: 'appContext',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },  
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },  
    setDate: (state, action) => {
      state.Date = action.payload;
    },
    setShowTime: (state, action) => {
      state.showTime = action.payload;
    },
    setScreenId: (state, action) => {
      state.screenId = action.payload;
    },
    setMovieName: (state, action) => {
      state.movieName = action.payload;
    },
    setTheaterId: (state, action) => {
      state.theaterId = action.payload;
    },
    setScreenName: (state, action) => {
      state.screenName = action.payload;
    },
    setBasePrice: (state, action) => {
      state.basePrice = action.payload;
    },
    setTotalCost: (state, action) => {
      state.totalCost = action.payload;
    },
    setSelectedSeatsByUser: (state, action) => {
      state.selectedSeatsByUser = action.payload;
    },
    setUserEmail: (state, action) => {
      state.userEmail = action.payload;
    },
    setBookingId: (state, action) => {
      state.bookingId = action.payload;
    },
    clearState: (state) => {
      state = initialState;
    },
  }
});

export const { setLoading , setUserLocation, setDate, setScreenId, setShowTime, 
  setMovieName, setTheaterId, setScreenName, setBasePrice, setTotalCost, setSelectedSeatsByUser,
  setUserEmail, setBookingId, clearState
} = appContextSlice.actions;
export default appContextSlice.reducer;