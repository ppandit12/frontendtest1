import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Boards from './pages/Boards';
import BoardView from './pages/BoardView';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <Boards />
          </PrivateRoute>
        } />
        <Route path="/board/:id" element={
          <PrivateRoute>
            <BoardView />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
