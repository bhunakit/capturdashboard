import { useRef, useEffect, useState, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import cameraData from './data/CameraData'

function App() {
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [peopleTimeFrame, setPeopleTimeFrame] = useState('hour')
  const [envTimeWindow, setEnvTimeWindow] = useState('am')
  const [animationState, setAnimationState] = useState(null)
  const [previousCamera, setPreviousCamera] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [hourlyData, setHourlyData] = useState([])
  const [dailyData, setDailyData] = useState([])
  
  // Theme colors based on mode
  const theme = useMemo(() => ({
    people: darkMode ? '#BB86FC' : '#9C27B0',
    vehicles: darkMode ? '#03DAC6' : '#673AB7',
    grid: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)',
    tooltip: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(40, 52, 80, 0.95)',
    accent1: darkMode ? '#BB86FC' : '#9C27B0',
    accent2: darkMode ? '#03DAC6' : '#3F51B5',
    danger: darkMode ? '#CF6679' : '#F44336',
    warning: darkMode ? '#FFB74D' : '#FF9800'
  }), [darkMode]);

  // Handle theme change
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(darkMode ? 'mapbox://styles/mapbox/navigation-night-v1' : 'mapbox://styles/mapbox/navigation-day-v1');
  }, [darkMode]);

  // Animation and data generation handler
  useEffect(() => {
    if (!selectedCamera) {
      if (previousCamera) {
        setAnimationState('exiting');
        setTimeout(() => {
          setSidebarVisible(false);
          setAnimationState(null);
        }, 200);
      }
      return;
    }

    const isTransitioning = previousCamera && previousCamera.id !== selectedCamera.id;
    
    if (isTransitioning) {
      setAnimationState('exiting');
      setTimeout(() => {
        setAnimationState('entering');
        setSidebarVisible(true);
        setHourlyData(generateHourlyData(selectedCamera));
        setDailyData(generateDailyData(selectedCamera));
        setTimeout(() => setAnimationState(null), 200);
      }, 200);
    } else {
      setSidebarVisible(true);
      setAnimationState('entering');
      setHourlyData(generateHourlyData(selectedCamera));
      setDailyData(generateDailyData(selectedCamera));
      setTimeout(() => setAnimationState(null), 200);
    }
    
    setPreviousCamera(selectedCamera);
  }, [selectedCamera]);

  // Initialize map
  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmh1biIsImEiOiJjbTd4M3JxMmowMTduMmpvNGR4c2gyYXNnIn0.03soLICEQxElUgExig4PUw';
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: darkMode ? 'mapbox://styles/mapbox/navigation-night-v1' : 'mapbox://styles/mapbox/navigation-day-v1',
      center: [100.49946, 13.75093],
      zoom: 10.89
    });

    // Add camera markers
    mapRef.current.on('load', () => {
      cameraData.forEach(camera => {
        const el = document.createElement('div');
        el.className = 'camera-marker';
        el.innerHTML = `
          <div class="camera-circle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
              <circle cx="12" cy="13" r="3"></circle>
            </svg>
          </div>
        `;
        el.addEventListener('click', () => setSelectedCamera(camera));
        new mapboxgl.Marker(el).setLngLat(camera.location).addTo(mapRef.current);
      });
    });

    return () => mapRef.current.remove();
  }, []);

  // Effect to update data on time frame change
  useEffect(() => {
    if (selectedCamera) {
      if (peopleTimeFrame === 'hour' && hourlyData.length === 0) {
        setHourlyData(generateHourlyData(selectedCamera));
      } else if (peopleTimeFrame === 'day' && dailyData.length === 0) {
        setDailyData(generateDailyData(selectedCamera));
      }
    }
  }, [peopleTimeFrame, selectedCamera]);

  // Generate hourly data (9:00 to 21:00)
  const generateHourlyData = (camera) => {
    if (!camera) return [];
    
    const hours = [];
    const fixedHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    
    fixedHours.forEach(hour => {
      let peakFactor = 1.0;
      if (hour >= 12 && hour <= 14) peakFactor = 1.4; // Lunch peak
      if (hour >= 17 && hour <= 19) peakFactor = 1.5; // Evening peak
      if (hour >= 9 && hour <= 10) peakFactor = 1.2; // Morning peak
      
      const seed = (hour * 17) % 100 / 100;
      const randomFactor = (seed * 0.4 + 0.8) * peakFactor;
      
      hours.push({
        hour: `${hour}:00`,
        people: Math.round(camera.people.hour / 13 * randomFactor),
        cars: Math.round(camera.cars.hour / 13 * randomFactor)
      });
    });
    
    return hours;
  };
  
  // Generate daily data
  const generateDailyData = (camera) => {
    if (!camera) return [];
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayFactors = {
      'Sunday': 0.7, 'Monday': 1.0, 'Tuesday': 1.1, 'Wednesday': 1.05,
      'Thursday': 1.15, 'Friday': 1.2, 'Saturday': 0.8
    };
    
    return days.map((dayName, index) => {
      const seed = (index * 13) % 100 / 100;
      const randomFactor = (seed * 0.2 + 0.9) * dayFactors[dayName];
      
      return {
        day: dayName.substring(0, 3),
        people: Math.round(camera.people.day / 7 * randomFactor),
        cars: Math.round(camera.cars.day / 7 * randomFactor)
      };
    });
  };

  return (
    <>
      <div id='map-container' ref={mapContainerRef}/>
      
      {/* Dark mode toggle */}
      <div className={`theme-toggle ${darkMode ? 'dark' : 'light'}`}>
        <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode">
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Sidebar */}
      {(selectedCamera || sidebarVisible) && (
        <div 
          className={`sidebar ${animationState || ''} ${darkMode ? 'dark' : 'light'}`}
          style={{ display: sidebarVisible ? 'flex' : 'none' }}
        >
          <div className="dashboard-header">
            <button className="close-icon" onClick={() => setSelectedCamera(null)} aria-label="Close dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="header-content">
              <div className="camera-tag">Camera #{selectedCamera?.id}</div>
              <h2>CCTV Analytics</h2>
              <p className="location-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {selectedCamera?.location[0].toFixed(5)}, {selectedCamera?.location[1].toFixed(5)}
              </p>
            </div>
          </div>
          
          <div className="dashboard-content">
            {/* Landmarks section */}
            <div className="section landmarks-section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Nearby Landmarks
              </h3>
              <div className="landmarks-list">
                {selectedCamera?.landmarks.map((landmark, index) => (
                  <div key={index} className="landmark-item">
                    <span>{landmark}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Traffic Analysis
              </h3>
              
              <div className="time-selector">
                <button 
                  className={`time-option ${peopleTimeFrame === 'hour' ? 'active' : ''}`} 
                  onClick={() => setPeopleTimeFrame('hour')}
                >
                  Hourly
                </button>
                <button 
                  className={`time-option ${peopleTimeFrame === 'day' ? 'active' : ''}`} 
                  onClick={() => setPeopleTimeFrame('day')}
                >
                  Daily
                </button>
              </div>
              
              {/* Traffic Chart */}
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={peopleTimeFrame === 'hour' ? hourlyData : dailyData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                    <XAxis 
                      dataKey={peopleTimeFrame === 'hour' ? "hour" : "day"} 
                      stroke="rgba(255,255,255,0.5)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.5)" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme.tooltip,
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} />
                    <Bar 
                      dataKey="people" 
                      name="People" 
                      fill={theme.people} 
                      radius={[4, 4, 0, 0]}
                      barSize={6}
                      animationDuration={300}
                    />
                    <Bar 
                      dataKey="cars" 
                      name="Vehicles" 
                      fill={theme.vehicles} 
                      radius={[4, 4, 0, 0]}
                      barSize={6}
                      animationDuration={300}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon people">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="metric-value">
                    <span className="value">{selectedCamera?.people[peopleTimeFrame]}</span>
                    <span className="label">People</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon vehicles">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>
                  <div className="metric-value">
                    <span className="value">{selectedCamera?.cars[peopleTimeFrame]}</span>
                    <span className="label">Vehicles</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vehicle Breakdown Section */}
            <div className="section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                Vehicle Breakdown
              </h3>
              
              <div className="vehicle-breakdown">
                <div className="vehicle-type">
                  <div className="vehicle-icon car">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path>
                      <circle cx="6.5" cy="16.5" r="2.5"></circle>
                      <circle cx="16.5" cy="16.5" r="2.5"></circle>
                    </svg>
                  </div>
                  <div className="type-info">
                    <div className="type-name">Cars</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill car" 
                        style={{width: `${selectedCamera?.vehicleBreakdown.cars}%`}}
                      ></div>
                    </div>
                    <div className="type-percentage">{selectedCamera?.vehicleBreakdown.cars}%</div>
                  </div>
                </div>
                
                <div className="vehicle-type">
                  <div className="vehicle-icon truck">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 17h4V5H2v12h3m12-5h4l3 5v5h-3m-9-5h3"></path>
                      <circle cx="7.5" cy="17.5" r="2.5"></circle>
                      <circle cx="17.5" cy="17.5" r="2.5"></circle>
                    </svg>
                  </div>
                  <div className="type-info">
                    <div className="type-name">Trucks</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill truck" 
                        style={{width: `${selectedCamera?.vehicleBreakdown.trucks}%`}}
                      ></div>
                    </div>
                    <div className="type-percentage">{selectedCamera?.vehicleBreakdown.trucks}%</div>
                  </div>
                </div>
                
                <div className="vehicle-type">
                  <div className="vehicle-icon motorcycle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 16v1a2 2 0 0 0 4 0v-1m6 0v1a2 2 0 0 0 4 0v-1"></path>
                      <path d="M9 17h6l3-5.1L9.2 8.7c-.8-.3-1.5.4-1.2 1.1L9 12h6"></path>
                      <path d="M4 16h16"></path>
                    </svg>
                  </div>
                  <div className="type-info">
                    <div className="type-name">Motorcycles</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill motorcycle" 
                        style={{width: `${selectedCamera?.vehicleBreakdown.motorcycles}%`}}
                      ></div>
                    </div>
                    <div className="type-percentage">{selectedCamera?.vehicleBreakdown.motorcycles}%</div>
                  </div>
                </div>
                
                <div className="vehicle-type">
                  <div className="vehicle-icon bus">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 17h2l.64-2.54c.24-.959.24-1.96 0-2.92l-1.07-4.27A1.98 1.98 0 0 0 18.7 6H5.3a1.98 1.98 0 0 0-1.87 1.27l-1.07 4.27c-.24.96-.24 1.96 0 2.92L3 17h2"></path>
                      <path d="M14 17H9"></path>
                      <circle cx="6.5" cy="17.5" r="2.5"></circle>
                      <circle cx="17.5" cy="17.5" r="2.5"></circle>
                    </svg>
                  </div>
                  <div className="type-info">
                    <div className="type-name">Buses</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill bus" 
                        style={{width: `${selectedCamera?.vehicleBreakdown.buses}%`}}
                      ></div>
                    </div>
                    <div className="type-percentage">{selectedCamera?.vehicleBreakdown.buses}%</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Environmental Metrics Section */}
            <div className="section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path>
                  <polyline points="13 11 9 17 15 17 11 23"></polyline>
                </svg>
                Environmental Metrics
              </h3>
              
              <div className="time-selector">
                <button 
                  className={`time-option ${envTimeWindow === 'am' ? 'active' : ''}`}
                  onClick={() => setEnvTimeWindow('am')}
                >
                  AM
                </button>
                <button 
                  className={`time-option ${envTimeWindow === 'pm' ? 'active' : ''}`}
                  onClick={() => setEnvTimeWindow('pm')}
                >
                  PM
                </button>
              </div>
              
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon humidity">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                  </div>
                  <div className="metric-value">
                    <span className="value">{selectedCamera?.environment[envTimeWindow].humidity}</span>
                    <span className="label">Humidity</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon air">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6.8 11a6 6 0 1 0 10.396 0M12 2v1M3 10H2M5 4l-1-1M19 4l1-1M22 10h1"/>
                    </svg>
                  </div>
                  <div className="metric-value">
                    <span className="value">{selectedCamera?.environment[envTimeWindow].airQuality}</span>
                    <span className="label">Air Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App