import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to UI immediately
    const userMsg = { role: 'user', text: input };
    setChat((prev) => [...prev, userMsg]);
    setLoading(true);
    const originalInput = input;
    setInput('');

    try {
      // Call your Vercel API
      const res = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: originalInput }),
      });

      const data = await res.json();

      // Add Bot response to UI
      setChat((prev) => [
        ...prev,
        { role: 'bot-polished', text: data.polished },
        { role: 'bot-reply', text: data.reply }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Vocab Mirror 🧠</h1>
      
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '10px', 
        height: '60vh', 
        overflowY: 'scroll', 
        padding: '10px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {chat.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.role === 'user' ? '#0070f3' : (msg.role === 'bot-polished' ? '#eaeaea' : '#fff'),
            border: msg.role === 'bot-reply' ? '1px solid #ddd' : 'none',
            color: msg.role === 'user' ? '#fff' : '#000',
            padding: '10px 15px',
            borderRadius: '15px',
            maxWidth: '80%',
          }}>
            {msg.role === 'bot-polished' && <small style={{display:'block', color:'#666', marginBottom:'4px'}}>✨ Improved:</small>}
            <span dangerouslySetInnerHTML={{ __html: msg.text }} />
          </div>
        ))}
        {loading && <p style={{color: '#999', fontSize: '0.8rem'}}>Thinking...</p>}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something..."
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Send
        </button>
      </form>
    </div>
  );
}