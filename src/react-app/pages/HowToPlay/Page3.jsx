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
          Each round you are either a <strong>Player</strong> or the <a className="howto-link-inline">Chameleon</a>.
        </p>

        <p className="howto-paragraph">
          <strong>What's a Player?</strong> Your job is to <u>simply find the AI lie</u>, and to not be tricked by the Chameleon! Your score is calculated by if you were the first correct guesser + how fast you guessed + correct guess streak multiplier.
        </p>

        <p className="howto-paragraph">
          <strong>What's the Chameleon?</strong> There will be at least one round where <u>your truths are displayed</u> + the AI lie. This makes you the Chameleon! Make sure no one knows they're your truths! You will vote and talk to your party like you are a Player. It is your goal to <u>convince others into picking your truths as the AI lie</u>. You only gain points based on <u>how many players chose your truths as the AI lie for that round</u>.
        </p>
      </div>
    </div>
  );
}
