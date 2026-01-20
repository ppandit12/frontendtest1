import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const BoardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggingCard, setDraggingCard] = useState(null);

  useEffect(() => {
    fetchBoard();
  }, [id]);

  const fetchBoard = async () => {
    try {
      const { data } = await api.get(`/boards/${id}`);
      setBoard(data.board);
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const createList = async () => {
    const name = prompt('Enter list name:');
    if (!name) return;
    try {
      await api.post(`/boards/${id}/lists`, { name });
      fetchBoard();
    } catch (err) {
      alert('Failed to create list');
    }
  };

  const createCard = async (listId) => {
    const title = prompt('Enter card title:');
    if (!title) return;
    try {
      await api.post(`/lists/${listId}/cards`, { title });
      fetchBoard();
    } catch (err) {
      alert('Failed to create card');
    }
  };

  const deleteList = async (listId) => {
    if (!confirm('Delete this list?')) return;
    try {
      await api.delete(`/lists/${listId}`);
      fetchBoard();
    } catch (err) {
      alert('Failed to delete list');
    }
  };

  const onDragStart = (e, cardId, listId) => {
    setDraggingCard({ cardId, listId });
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (e, targetListId) => {
    e.preventDefault();
    if (!draggingCard) return;

    // Simple move to end of list for now
    try {
      await api.patch(`/cards/${draggingCard.cardId}/move`, {
        listId: targetListId,
        position: 999999 // backend handles shifting
      });
      fetchBoard();
    } catch (err) {
      console.error('Move failed', err);
    } finally {
      setDraggingCard(null);
    }
  };

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="bg-black/20 p-4 text-white flex items-center gap-4 backdrop-blur-sm shrink-0">
        <button onClick={() => navigate('/')} className="hover:bg-white/20 px-2 py-1 rounded">← Back</button>
        <h1 className="text-xl font-bold">{board?.name}</h1>
      </header>
      
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 h-full items-start">
          {board?.lists?.map(list => (
            <div 
              key={list.id} 
              className="bg-[#ebecf0] w-72 shrink-0 rounded-lg flex flex-col max-h-full"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, list.id)}
            >
              <div className="p-3 font-semibold text-gray-700 flex justify-between items-center cursor-pointer">
                <h3>{list.name}</h3>
                <button onClick={() => deleteList(list.id)} className="text-gray-400 hover:text-red-500">×</button>
              </div>
              
              <div className="px-2 overflow-y-auto flex-1 min-h-[50px]">
                {list.cards?.map(card => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, card.id, list.id)}
                    className="bg-white p-2 rounded shadow-sm mb-2 cursor-pointer hover:bg-gray-50 group border border-gray-200"
                  >
                    <div className="text-gray-800 text-sm font-medium">{card.title}</div>
                    {(card.due_date || card.attachment_count > 0) && (
                      <div className="flex gap-2 mt-2 text-xs text-gray-500">
                        {card.due_date && (
                          <span className={`flex items-center gap-1 ${new Date(card.due_date) < new Date() ? 'text-red-500 bg-red-50 px-1 rounded' : ''}`}>
                            🕒 {new Date(card.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {card.attachment_count > 0 && (
                          <span className="flex items-center gap-1">
                            📎 {card.attachment_count}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => createCard(list.id)}
                className="m-2 p-2 text-gray-500 hover:bg-gray-200 rounded text-left flex items-center gap-2 text-sm transition"
              >
                <span>+</span> Add a card
              </button>
            </div>
          ))}
          
          <button 
            onClick={createList}
            className="bg-white/20 w-72 shrink-0 rounded-lg p-3 text-white hover:bg-white/30 text-left transition backdrop-blur-sm"
          >
            + Add another list
          </button>
        </div>
      </main>
    </div>
  );
};

export default BoardView;
