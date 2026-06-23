import React, { useRef, useState, useEffect } from 'react';

const TacticalBoard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff'); // Default to White chalk for the court!
  const [lineWidth, setLineWidth] = useState(5);

  // 🏀 This is our secret recipe to draw a beautiful basketball court!
  const drawBasketballCourt = (context, width, height) => {
    // 1. Fill the background with a nice deep stadium court color
    context.fillStyle = '#0f2240'; // Deep NBA Dark Blue
    context.fillRect(0, 0, width, height);

    // 2. Set the color for the court lines
    context.strokeStyle = 'rgba(255, 255, 255, 0.25)'; // Ghostly white lines
    context.lineWidth = 3;

    // 🏀 Draw the Outer Boundary Line
    context.strokeRect(10, 10, width - 20, height - 20);

    // 🏀 Draw the Center Line (Half Court)
    context.beginPath();
    context.moveTo(width / 2, 10);
    context.lineTo(width / 2, height - 10);
    context.stroke();

    // 🏀 Draw the Center Jump Circle
    context.beginPath();
    context.arc(width / 2, height / 2, 50, 0, 2 * Math.PI);
    context.stroke();

    // 🏀 Draw Left Side Basket "Key" (The Paint rectangle)
    context.strokeRect(10, height / 2 - 50, 100, 100);
    // Left Free-Throw Semi-circle
    context.beginPath();
    context.arc(110, height / 2, 50, -Math.PI / 2, Math.PI / 2);
    context.stroke();
    // Left Three-Point Arc
    context.beginPath();
    context.arc(10, height / 2, 160, -Math.PI / 2.5, Math.PI / 2.5);
    context.stroke();

    // 🏀 Draw Right Side Basket "Key" (The Paint rectangle)
    context.strokeRect(width - 110, height / 2 - 50, 100, 100);
    // Right Free-Throw Semi-circle
    context.beginPath();
    context.arc(width - 110, height / 2, 50, Math.PI / 2, -Math.PI / 2);
    context.stroke();
    // Right Three-Point Arc
    context.beginPath();
    context.arc(width - 10, height / 2, 160, Math.PI - Math.PI / 2.5, Math.PI + Math.PI / 2.5);
    context.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 650;
    canvas.height = 400;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Draw the court background immediately when the component wakes up!
    drawBasketballCourt(context, canvas.width, canvas.height);
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current.getContext('2d');
    
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current.getContext('2d');
    
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    const context = canvasRef.current.getContext('2d');
    context.closePath();
    setIsDrawing(false);
  };

  // 🧼 When we clear the board, we wipe it but redraw the court layout instantly!
  const clearBoard = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBasketballCourt(context, canvas.width, canvas.height);
  };

  return (
    <div style={{
      background: '#111316',
      padding: '24px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      maxWidth: '690px',
      margin: '30px auto',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    }}>
      <h3 style={{ color: '#FDB927', marginBottom: '6px', fontSize: '1.4rem', fontWeight: '800' }}>
        🏀 Coach's Playbook Whiteboard
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: '0.85rem', opacity: 0.6 }}>
        Design tactical strategies on the court field below.
      </p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
        <label style={{ color: '#fff', fontSize: '0.9rem' }}>Chalk Color: </label>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          style={{ cursor: 'pointer', border: 'none', background: 'none', width: '40px', height: '30px' }}
        />

        <label style={{ color: '#fff', fontSize: '0.9rem' }}>Marker Size: </label>
        <input 
          type="range" 
          min="2" 
          max="15" 
          value={lineWidth} 
          onChange={(e) => setLineWidth(e.target.value)} 
          style={{ cursor: 'pointer' }}
        />

        <button 
          onClick={clearBoard}
          style={{
            background: '#ce1141',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: '0.2s'
          }}
        >
          🧼 Reset Court
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{
          border: '2px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          cursor: 'crosshair',
          display: 'block',
          margin: '0 auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}
      />
    </div>
  );
};

export default TacticalBoard;