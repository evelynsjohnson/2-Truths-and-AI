import React from 'react';
import './HowToPlay.css';

export default function Page1() {
  return (
    <div className="howto-page two-column">
      <div className="howto-left">
        <ol className="howto-list">
          <li><span className="howto-link">Enter Your Name.</span></li>
          <li><span className="howto-link">Choose your icon!</span></li>
          <li><span className="howto-link">Enter your truths.</span></li>
        </ol>
      </div>

      <div className="howto-right" aria-hidden="true">
        <video 
          className="demo-video" 
          autoPlay
          loop 
          muted
          playsInline
        >
          <source src="/assets/mp4/truth-input-demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
