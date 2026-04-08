import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";

const initialState = {
  myBookings: [],
  providerBookings: [],
  providerDashboard: {
    totalBookings: 0,
    totalEarnings: 0,
  },
  loading: false,
  error: null,
};

export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/bookings", payload);
      return response.data?.data?.booking;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create booking"));
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMyBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/bookings/my-bookings");
      return response.data?.data?.bookings || [];
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load your bookings"));
    }
  }
);

export const fetchProviderBookings = createAsyncThunk(
  "bookings/fetchProviderBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/bookings/provider");
      return response.data?.data?.bookings || [];
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load provider bookings"));
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  "bookings/updateBookingStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bookings/${id}/status`, { status });
      return response.data?.data?.booking;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update booking status"));
    }
  }
);

export const fetchProviderDashboard = createAsyncThunk(
  "bookings/fetchProviderDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/providers/dashboard");
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load dashboard metrics"));
    }
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = [action.payload, ...state.myBookings];
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload;
      })
      .addCase(fetchProviderBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.providerBookings = action.payload;
      })
      .addCase(fetchProviderDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.providerDashboard = action.payload || state.providerDashboard;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.providerBookings = state.providerBookings.map((booking) =>
          booking._id === action.payload._id ? action.payload : booking
        );
      })
      .addMatcher(
        (action) => action.type.startsWith("bookings/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("bookings/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export default bookingsSlice.reducer;
