import React, { useState } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Ici on connectera l'appel à Tauri pour Start/Stop
  };

  return (
    <div className="app-container" style={{ background: '#FFFFFF', color: '#1E293B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1 style={{ color: '#0F172A', marginBottom: '20px' }}>DictateFlow</h1>
      <button 
        onClick={toggleRecording}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isRecording ? '#EF4444' : '#F97316',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {isRecording ? 'STOP' : 'START'}
      </button>
      <p style={{ marginTop: '20px' }}>{isRecording ? 'Dictée en cours...' : 'Prêt à dicter'}</p>
    </div>
  );
}

export default App;
