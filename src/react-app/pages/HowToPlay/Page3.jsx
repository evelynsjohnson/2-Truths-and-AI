/**
 * @fileoverview Page3 component that explains the roles of Player and Chameleon.
 */

import React from 'react';
import './HowToPlay.css';

export default function Page3() {
  return (
    <div className="howto-page single-column">
      <div className="howto-left">
        <p className="howto-paragraph">
          Each round you are either a <strong>Player</strong> or the 
          <b>
            <span class="chameleon">
              <span style={{color:"#d9a758"}}> C</span>
              <span style={{color:"#d58a57"}}>h</span>
              <span style={{color:"#e3815e"}}>a</span>
              <span style={{color:"#bc574e"}}>m</span>
              <span style={{color:"#984751ff"}}>e</span>
              <span style={{color:"#c35b81"}}>l</span>
              <span style={{color:"#99347bff"}}>e</span>
              <span style={{color:"#9b58b1"}}>o</span>
              <span style={{color:"#704ab6"}}>n</span>
            </span>
          </b>.
        </p>

        <p className="howto-paragraph">
          <strong>What's a Player?</strong> Your job is to <u>find the AI lie</u>, and to not be tricked by the Chameleon! Your score is calculated by if you were the first correct guesser + how fast you guessed + correct guess streak multiplier.
        </p>

        <p className="howto-paragraph">
          <strong>What's the 
          <b>
            <span class="chameleon">
              <span style={{color:"#d9a758"}}> C</span>
              <span style={{color:"#d58a57"}}>h</span>
              <span style={{color:"#e3815e"}}>a</span>
              <span style={{color:"#bc574e"}}>m</span>
              <span style={{color:"#984751ff"}}>e</span>
              <span style={{color:"#c35b81"}}>l</span>
              <span style={{color:"#99347bff"}}>e</span>
              <span style={{color:"#9b58b1"}}>o</span>
              <span style={{color:"#704ab6"}}>n</span>
            </span>
          </b>?</strong> There will be at least one round where <u>your truths are displayed</u> + the AI lie. This makes you the Chameleon! Make sure no one knows they're your truths! You will vote and talk to your party like you are a Player. It is your goal to <u>convince others into picking your truths</u> as the AI lie. You only gain points based on <u>how many players chose your truths</u> as the <b>AI lie</b> for that round.
        </p>
      </div>
    </div>
  );
}
