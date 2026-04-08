import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";

const initialState = {
  items: [],
  selectedService: null,
  filters: {
    keyword: "",
    category: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    order: "desc",
    page: 1,
    limit: 9,
  },
  meta: null,
  loading: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().services;
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined)
      );
      const response = await api.get("/services", { params });
      return {
        services: response.data?.data?.services || [],
        meta: response.data?.meta || null,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch services"));
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  "services/fetchServiceById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data?.data?.service;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch service"));
    }
  }
);

export const createService = createAsyncThunk(
  "services/createService",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/services", payload);
      return response.data?.data?.service;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create service"));
    }
  }
);

export const updateService = createAsyncThunk(
  "services/updateService",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/services/${id}`, payload);
      return response.data?.data?.service;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update service"));
    }
  }
);

export const deleteService = createAsyncThunk(
  "services/deleteService",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/services/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete service"));
    }
  }
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setServiceFilter(state, action) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    setServicePage(state, action) {
      state.filters.page = action.payload;
    },
    resetServiceFilters(state) {
      state.filters = {
        ...initialState.filters,
      };
    },
    clearSelectedService(state) {
      state.selectedService = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.services;
        state.meta = action.payload.meta;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        if (state.selectedService?._id === action.payload._id) {
          state.selectedService = action.payload;
        }
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (state.selectedService?._id === action.payload) {
          state.selectedService = null;
        }
      });
  },
});

export const {
  setServiceFilter,
  setServicePage,
  resetServiceFilters,
  clearSelectedService,
} = servicesSlice.actions;

export default servicesSlice.reducer;
