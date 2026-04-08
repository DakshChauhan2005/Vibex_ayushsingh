import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";

const persistedToken = localStorage.getItem("nc_token");
const persistedUser = localStorage.getItem("nc_user");

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    id: user.id || user._id,
  };
}

const initialState = {
  token: persistedToken || null,
  user: persistedUser ? normalizeUser(JSON.parse(persistedUser)) : null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", payload);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Registration failed"));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", payload);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Login failed"));
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data?.data?.user;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load profile"));
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/profile");
      return response.data?.data?.user;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load profile"));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.put("/users/profile", payload);
      return response.data?.data?.user;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update profile"));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem("nc_token");
      localStorage.removeItem("nc_user");
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload?.token || null;
        state.user = normalizeUser(action.payload?.user || null);
        if (state.token) {
          localStorage.setItem("nc_token", state.token);
        }
        if (state.user) {
          localStorage.setItem("nc_user", JSON.stringify(state.user));
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload?.token || null;
        state.user = normalizeUser(action.payload?.user || null);
        if (state.token) {
          localStorage.setItem("nc_token", state.token);
        }
        if (state.user) {
          localStorage.setItem("nc_user", JSON.stringify(state.user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload);
        if (action.payload) {
          localStorage.setItem("nc_user", JSON.stringify(normalizeUser(action.payload)));
        }
      })
      .addCase(fetchMe.rejected, (state) => {
        state.token = null;
        state.user = null;
        localStorage.removeItem("nc_token");
        localStorage.removeItem("nc_user");
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = normalizeUser(action.payload);
        localStorage.setItem("nc_user", JSON.stringify(normalizeUser(action.payload)));
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUser(action.payload);
        localStorage.setItem("nc_user", JSON.stringify(normalizeUser(action.payload)));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
