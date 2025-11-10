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
          <li><span className="howto-link">Click on your player card.</span><span className='howto-text'> Your player card will now be highlighted and shown as "selecting".</span></li>
          <li><span className="howto-link">Click on the statement you think is the AI lie.</span><span className='howto-text'> You will see your player icon pop up on the bottom right corner of the statement you've chosen!</span></li>
          <li><span className="howto-link">To change your decision, click on your player card, then click on the new statement!</span><span className='howto-text'> Fair warning~ you may lose points if you change your statement often! Continue reading for more information on how to maximize your score!</span></li>
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
          <source src="/assets/mp4/voting-demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
