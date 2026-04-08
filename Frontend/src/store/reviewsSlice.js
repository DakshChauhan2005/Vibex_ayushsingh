import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";

const initialState = {
  reviewsByService: [],
  loading: false,
  error: null,
};

export const fetchReviewsByService = createAsyncThunk(
  "reviews/fetchReviewsByService",
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/service/${serviceId}`);
      return response.data?.data?.reviews || [];
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load reviews"));
    }
  }
);

export const createReview = createAsyncThunk(
  "reviews/createReview",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/reviews", payload);
      return response.data?.data?.review;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create review"));
    }
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete review"));
    }
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviews(state) {
      state.reviewsByService = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByService.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewsByService = action.payload;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewsByService = [action.payload, ...state.reviewsByService];
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewsByService = state.reviewsByService.filter(
          (review) => review._id !== action.payload
        );
      })
      .addMatcher(
        (action) => action.type.startsWith("reviews/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("reviews/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;
