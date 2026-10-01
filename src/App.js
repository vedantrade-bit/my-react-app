import React, { Component } from 'react';
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import './App.css';

const Home = () => (
  <div className="card">
    <h2>🏠 Home Page</h2>
    <p>Welcome to our deployed React Application hosted on GitHub Pages!</p>
    <div className="badge">Routing with HashRouter Active</div>
  </div>
);

const About = () => (
  <div className="card">
    <h2>ℹ️ About Page</h2>
    <p>This application demonstrates website hosting with GitHub Pages and custom domain linking.</p>
    <ul>
      <li>Hosted for: <strong>vedantrade-bit</strong></li>
      <li>Framework: <strong>ReactJS with HashRouter</strong></li>
      <li>Deployment: <strong>gh-pages</strong></li>
    </ul>
  </div>
);

class App extends Component {
  render() {
    return (
      <HashRouter basename="/">
        <div className="app-container">
          <header className="header">
            <h1>My React Application</h1>
            <nav>
              <ul className="nav-list">
                <li><Link to="/" className="nav-link">Home</Link></li>
                <li><Link to="/about" className="nav-link">About</Link></li>
              </ul>
            </nav>
          </header>
          <hr />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <footer className="footer">
            <p>Department of Computer Engineering - Web Technology Lab</p>
          </footer>
        </div>
      </HashRouter>
    );
  }
}

export default App;
