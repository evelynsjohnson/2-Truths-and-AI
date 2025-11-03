/**
 * @fileoverview Page2 component that explains how to select the AI statement.
 */

import React from 'react';
import './HowToPlay.css';

export default function Page2() {
  return (
    <div className="howto-page two-column">
      <div className="howto-left">
        <ol className="howto-list">
          <li><span className="howto-link">Decide on the lie.</span></li>
          <li><span className="howto-link">Click on your player card.</span></li>
          <li><span className="howto-link">Click on the statement you think is AI</span></li>
          <li><span className="howto-link">If you want to change which statement you select, click on your player card, and on the new statement!</span></li>
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
