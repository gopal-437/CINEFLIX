import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import appContextSlice from './appContext/appContextSlice'; // Your slice

// Combine reducers (even if you only have one slice for now)
const rootReducer = combineReducers({
  appContext: appContextSlice,
});

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['appContext'], // Persist only the appContext slice
};

// Wrap the root reducer with persistence
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer directly
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);