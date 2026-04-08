import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import servicesReducer from "./servicesSlice";
import bookingsReducer from "./bookingsSlice";
import reviewsReducer from "./reviewsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    bookings: bookingsReducer,
    reviews: reviewsReducer,
  },
});

export default store;
