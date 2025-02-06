import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API_BASE_URL from "../config/apiConfig";

// ✅ Fetch All Books
export const fetchBooks = createAsyncThunk("books/fetchBooks", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/books`);
    if (!response.ok) throw new Error("Failed to fetch books");
    const data = await response.json();
    return Array.isArray(data.books) ? data.books : []; // ✅ Ensure it's always an array
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ✅ Checkout a Book
export const checkoutBook = createAsyncThunk("books/checkoutBook", async (bookId, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue("No token available");

  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ available: false }), // Mark book as unavailable
    });

    if (!response.ok) throw new Error("Failed to check out book");
    const updatedBook = await response.json();
    return updatedBook; // Return updated book
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// ✅ Return a Book
export const returnBook = createAsyncThunk("books/returnBook", async (bookId, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue("No token available");

  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ available: true }), // Mark book as available
    });

    if (!response.ok) throw new Error("Failed to return book");
    const updatedBook = await response.json();
    return updatedBook; // Return updated book
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const booksSlice = createSlice({
  name: "books",
  initialState: { books: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Handle Checkout Book
      .addCase(checkoutBook.fulfilled, (state, action) => {
        const updatedBook = action.payload;
        const index = state.books.findIndex((book) => book.id === updatedBook.id);
        if (index !== -1) {
          state.books[index] = updatedBook;
        }
      })

      // ✅ Handle Return Book
      .addCase(returnBook.fulfilled, (state, action) => {
        const updatedBook = action.payload;
        const index = state.books.findIndex((book) => book.id === updatedBook.id);
        if (index !== -1) {
          state.books[index] = updatedBook;
        }
      });
  },
});

export default booksSlice.reducer;

