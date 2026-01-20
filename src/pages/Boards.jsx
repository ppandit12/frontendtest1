import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Boards = () => {
  const [boards, setBoards] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [boardsRes, userRes] = await Promise.all([
        api.get('/boards'),
        api.get('/auth/me')
      ]);
      setBoards(boardsRes.data.boards);
      setUser(userRes.data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    const name = prompt('Enter board name:');
    if (!name) return;

    try {
      await api.post('/boards', { name });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create board');
    }
  };

  const deleteBoard = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this board?')) return;

    try {
      await api.delete(`/boards/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete board');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUpgrade = async () => {
    if (!confirm('Upgrade to premium for unlimited boards?')) return;
    try {
      await api.patch('/auth/upgrade');
      fetchData();
    } catch (err) {
      alert('Upgrade failed');
    }
  };

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div>
      <header className="bg-black/20 p-4 text-white flex justify-between items-center backdrop-blur-sm">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📋</span> Trello Clone
        </h1>
        <div className="flex items-center gap-4">
          <span className="font-medium">{user?.name}</span>
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user?.accountType === 'premium' ? 'bg-yellow-400 text-black' : 'bg-secondary'}`}>
            {user?.accountType}
          </span>
          {user?.accountType === 'free' && (
            <button onClick={handleUpgrade} className="bg-yellow-400 text-black px-3 py-1 rounded text-sm hover:bg-yellow-300 transition">
              Upgrade
            </button>
          )}
          <button onClick={logout} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition">
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
          <span>Your Boards</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {boards.map(board => (
            <div 
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-lg cursor-pointer h-32 relative group transition-all duration-200 border border-white/10"
            >
              <h3 className="text-white font-bold text-lg">{board.name}</h3>
              {board.description && <p className="text-white/70 text-sm mt-2">{board.description}</p>}
              <button 
                onClick={(e) => deleteBoard(e, board.id)}
                className="absolute top-2 right-2 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          ))}
          
          <button 
            onClick={createBoard}
            className="bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/30 p-4 rounded-lg cursor-pointer h-32 flex items-center justify-center text-white/50 hover:text-white transition group"
          >
            <span className="text-2xl group-hover:scale-110 transition pb-1">+</span>
            <span className="ml-2 font-medium">Create new board</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Boards;
