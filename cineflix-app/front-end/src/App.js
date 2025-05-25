import './App.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useState } from 'react';
import Loader from './pages/Loader';
import { useSelector } from 'react-redux';
// import AppContextProvider from './redux/appContext/dispatchActionProvider'; // Import your custom hook



function App() {

  const isLoading = useSelector((state) => state.appContext.loading);

  return (
    <div className="app-container">
      <BrowserRouter>
        <div className={`main-content ${isLoading ? 'loading' : ''}`}>
          <AppRoutes />
        </div>
        {/* Loading overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <Loader />
          </div>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;