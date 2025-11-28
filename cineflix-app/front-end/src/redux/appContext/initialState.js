const initialState = {
  loading: false,
  userLocation: "", // set at city selection page
  userEmail: "",  // set at login
  Date: new Date(), // set at select movies page -- movie list page
  showTime: "", // at movie details page
  screenId: "", // at movie details page
  movieName: "", // set at select movie page -- movie list page
  theaterId: "", // at movie details page after clicking on book now
  screenName: "", // at movie details page after clicking on book now
  basePrice: null, // at movie details page after clicking on book now
  totalCost: 0, // at seat selection page
  selectedSeatsByUser: [], // at seat selection page -- after book successfully
  bookingId: "", // after successful payment
};

export default initialState;