import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default storage is localStorage for web
import searchReducer from './reducers/searchReducer';
import authReducer from './reducers/LoginAuth';

// Combine the reducers
const rootReducer = combineReducers({
  search: searchReducer,
  auth: authReducer,
});

// Config for redux-persist
const persistConfig = {
  key: 'root',
  storage,
};

// Wrap rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store with the persisted reducer
const store = createStore(
  persistedReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export const persistor = persistStore(store); // Export the persistor
export default store;
