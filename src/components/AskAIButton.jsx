import { useState, useEffect, useRef } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';
import '../App.css';

export function AskAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSnipping, setIsSnipping] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const drawRef = useRef(null);
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setError(null);
    if (!isOpen) {
      // Reset area selection when opening chat
      setSelectedArea(null);
      if (drawRef.current) {
        drawRef.current.deleteAll();
        drawRef.current.changeMode('simple_select');
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return dummy response
    const dummyResponse = {
      role: 'assistant',
      content: `This is a dummy response to: "${input}". The actual AI integration is temporarily disabled.`
    };

    setMessages(prev => [...prev, dummyResponse]);
    setIsLoading(false);
  };

  const initializeDrawTool = () => {
    if (!drawRef.current && window.map) {
      mapRef.current = window.map;
      drawRef.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, trash: true },
        defaultMode: 'draw_polygon',
        styles: [
          {
            'id': 'gl-draw-polygon-fill-inactive',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            'paint': { 'fill-color': '#6200ee', 'fill-outline-color': '#6200ee', 'fill-opacity': 0.2 }
          },
          {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            'paint': { 'fill-color': '#6200ee', 'fill-outline-color': '#6200ee', 'fill-opacity': 0.3 }
          },
          {
            'id': 'gl-draw-polygon-stroke-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            'layout': { 'line-cap': 'round', 'line-join': 'round' },
            'paint': { 'line-color': '#6200ee', 'line-width': 2 }
          },
          {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            'layout': { 'line-cap': 'round', 'line-join': 'round' },
            'paint': { 'line-color': '#6200ee', 'line-width': 2 }
          },
          {
            'id': 'gl-draw-point-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
            'paint': { 'circle-radius': 5, 'circle-color': '#6200ee' }
          },
          {
            'id': 'gl-draw-point-active',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
            'paint': { 'circle-radius': 7, 'circle-color': '#6200ee' }
          }
        ]
      });

      mapRef.current.addControl(drawRef.current);
      mapRef.current.on('draw.create', updateArea);
      mapRef.current.on('draw.delete', updateArea);
      mapRef.current.on('draw.update', updateArea);
    }
  };

  const toggleSnippingTool = () => {
    if (!isSnipping) {
      initializeDrawTool();
      drawRef.current?.changeMode('draw_polygon');
    } else {
      drawRef.current?.deleteAll();
      drawRef.current?.changeMode('simple_select');
      setSelectedArea(null);
    }
    setIsSnipping(!isSnipping);
  };

  const updateArea = () => {
    if (drawRef.current) {
      const data = drawRef.current.getAll();
      if (data.features.length > 0) {
        const polygon = data.features[0];
        const area = turf.area(polygon);
        setSelectedArea({ areaInSqMeters: Math.round(area * 100) / 100 });
        setIsSnipping(false);
      }
    }
  };

  useEffect(() => {
    if (window.map) {
      mapRef.current = window.map;
    }
    return () => {
      if (mapRef.current && drawRef.current) {
        mapRef.current.off('draw.create', updateArea);
        mapRef.current.off('draw.delete', updateArea);
        mapRef.current.off('draw.update', updateArea);
        drawRef.current.deleteAll();
        mapRef.current.removeControl(drawRef.current);
        drawRef.current = null;
      }
    };
  }, []);

  return (
    <div className="ask-ai-container">
      <button onClick={toggleChat} className="ask-ai-button" aria-label="Ask AI about analytics">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="ask-ai-chat">
          <div className="chat-header">
            <div className="chat-title">Analytics AI Assistant</div>
            <div className="chat-actions">
              <button className={`chat-action-button ${isSnipping ? 'active' : ''}`} onClick={toggleSnippingTool} aria-label="Select area on map">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2v14a2 2 0 0 0 2 2h14"/>
                  <path d="M18 22V8a2 2 0 0 0-2-2H2"/>
                </svg>
              </button>
              <button className="chat-action-button" onClick={toggleChat} aria-label="Close chat">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div className="chat-content">
            {isSnipping && (
              <div className="snipping-tool">
                <p>Click the map to draw a polygon. Double-click to complete.</p>
              </div>
            )}
            {selectedArea && (
              <div className="selected-area">
                <p>Selected Area</p>
                <p><strong>{selectedArea.areaInSqMeters}</strong> square meters</p>
                <button 
                  onClick={() => {
                    drawRef.current?.deleteAll();
                    drawRef.current?.changeMode('simple_select');
                    setSelectedArea(null);
                  }}
                >
                  Clear Selection
                </button>
              </div>
            )}
            {error && <div className="error-message"><p>Error: {error}</p></div>}
            
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role === 'user' ? 'user' : 'assistant'} whitespace-pre-wrap`}>
                {message.content}
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant loading">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="chat-input">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about analytics..."
              className="chat-input-field"
              disabled={isLoading}
              style={{ height: "40px" }}
            />
            <button type="submit" className="send-button" disabled={isLoading || !input.trim()} style={{ height: "40px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}