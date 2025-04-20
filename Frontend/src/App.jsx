import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const SOCKET_SERVER_URL = 'http://localhost:3001';

function App() {
  const [bugs, setBugs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    unresolved: 0,
    critical: 0
  });

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      autoConnect: false
    });

    socket.on('connect', () => {
      console.log('WebSocket Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('initial_bugs', (initialBugs) => {
      console.log('Received initial bugs:', initialBugs);
      const sortedBugs = [...initialBugs].sort((a, b) => b.id - a.id);
      setBugs(sortedBugs);

      updateBugStats(sortedBugs);
    });

    socket.on('new_bug', (newBug) => {
      console.log('Received new bug:', newBug);
      setBugs(prevBugs => {
        const updatedBugs = [newBug, ...prevBugs];
        updateBugStats(updatedBugs);
        return updatedBugs;
      });
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket Connection Error:', err.message);
      setIsConnected(false);
    });

    socket.connect();

    return () => {
      console.log('Cleaning up WebSocket connection...');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('initial_bugs');
      socket.off('new_bug');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  const updateBugStats = (bugList) => {
    const total = bugList.length;
    const unresolved = bugList.filter(bug => !bug.resolved).length;
    const critical = bugList.filter(bug => 
      bug.metadata?.errorMessage?.toLowerCase().includes('critical') || 
      bug.metadata?.errorMessage?.toLowerCase().includes('fatal')
    ).length;
    
    setStats({ total, unresolved, critical });
  };

  const getSeverityClass = (bug) => {
    const errorMsg = bug.metadata?.errorMessage?.toLowerCase() || '';
    if (errorMsg.includes('critical') || errorMsg.includes('fatal')) return 'severity-critical';
    if (errorMsg.includes('error')) return 'severity-error';
    if (errorMsg.includes('warning')) return 'severity-warning';
    return 'severity-info';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">
          <h1>BugPipe</h1>
        </div>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Bugs</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.unresolved}</span>
            <span className="stat-label">Unresolved</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.critical}</span>
            <span className="stat-label">Critical</span>
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="content-header">
          <h2>Bug Reports</h2>
          <div className="header-actions">
            <div className="refresh-indicator">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </header>
        
        <div className="content-container">
          {selectedBug ? (
            <div className="bug-detail">
              <div className="detail-header">
                <h3>Bug #{selectedBug.id}</h3>
                <button className="back-button" onClick={() => setSelectedBug(null)}>
                  Back to List
                </button>
              </div>
              
              <div className="detail-content">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-row">
                    <span className="detail-label">Received At:</span>
                    <span className="detail-value">{formatTime(selectedBug.receivedAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Client Timestamp:</span>
                    <span className="detail-value">{formatTime(selectedBug.metadata?.clientTimestamp)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Route:</span>
                    <span className="detail-value">{selectedBug.metadata?.currentRoute || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Error Details</h4>
                  <div className="detail-row">
                    <span className="detail-label">Message:</span>
                    <span className={`detail-value ${getSeverityClass(selectedBug)}`}>
                      {selectedBug.metadata?.errorMessage || 'N/A'}
                    </span>
                  </div>
                  
                  {selectedBug.metadata?.errorTrace && (
                    <div className="detail-code">
                      <h4>Stack Trace</h4>
                      <pre>{selectedBug.metadata.errorTrace}</pre>
                    </div>
                  )}
                </div>
                
                {selectedBug.metadata?.eventHistory && selectedBug.metadata.eventHistory.length > 0 && (
                  <div className="detail-section">
                    <h4>Event History</h4>
                    <div className="event-timeline">
                      {selectedBug.metadata.eventHistory.map((event, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-time">{new Date(event.time).toLocaleTimeString()}</div>
                          <div className="timeline-content">
                            <strong>{event.type}</strong> on '{event.target}'
                            {event.value ? <div className="event-value">Value: {event.value}</div> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedBug.videoData && (
                  <div className="detail-section">
                    <h4>Video Recording</h4>
                    <div className="video-placeholder">
                      Video playback not implemented
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bug-list">
              {bugs.length === 0 && isConnected && (
                <div className="empty-state">
                  <p>No bug reports yet. Waiting for new reports...</p>
                </div>
              )}
              
              {bugs.length === 0 && !isConnected && (
                <div className="empty-state">
                  <p>Attempting to connect to the server...</p>
                </div>
              )}
              
              {bugs.map((bug) => (
                <div 
                  key={bug.id} 
                  className={`bug-card ${getSeverityClass(bug)}`}
                  onClick={() => setSelectedBug(bug)}
                >
                  <div className="bug-header">
                    <h3>Bug #{bug.id}</h3>
                    <span className="bug-time">{formatTime(bug.receivedAt)}</span>
                  </div>
                  <div className="bug-content">
                    <div className="bug-route">{bug.metadata?.currentRoute || 'Unknown Route'}</div>
                    <div className="bug-message">{bug.metadata?.errorMessage || 'No error message'}</div>
                  </div>
                  <div className="bug-footer">
                    <span className="bug-events">
                      {bug.metadata?.eventHistory ? `${bug.metadata.eventHistory.length} events` : '0 events'}
                    </span>
                    {bug.videoData && <span className="bug-video">Has video</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
