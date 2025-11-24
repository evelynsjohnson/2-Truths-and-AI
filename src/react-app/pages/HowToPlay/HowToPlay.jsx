/**
 * @fileoverview HowToPlay component that explains the game rules and steps.
 */

import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';
import './HowToPlay.css';

const PAGES = [         // Define the different subpages of the How To Play section
  { id: 'fill-card', title: 'How To Fill Out Your Player Card', comp: Page1 },
  { id: 'vote-ai', title: 'How To Vote for the AI Lie', comp: Page2 },
  { id: 'gain-points', title: 'How To Gain Points and Win', comp: Page3 },
];

export default function HowToPlay() {
  const navigate = useNavigate();
  const { playClick } = useSoundEffect();
  const [index, setIndex] = useState(0);

  //Define navigation functions between pages
  const goHome = () => navigate('/start');
  const goNext = () => {
    playClick();
    setIndex((i) => Math.min(PAGES.length - 1, i + 1));
  };
  const goPrev = () => {
    playClick();
    setIndex((i) => Math.max(0, i - 1));
  };

  const Current = PAGES[index].comp;

  // Determine header button configurations based on current index
  const leftButton = (() => {
    if (index === 0) {
      return (
        <Button
          className="how-to-play-home-btn"
          aria-label="Go home"
          onClick={goHome}
          variant="icon"
        >
          <img src="/assets/img/button-icons/home.png" alt="Home" />
        </Button>
      );
    }
    // Page 1 -> link back to Page 0, Page 2 -> link back to Page 1
    const targetIndex = index === 1 ? 0 : 1; // for index 2, previous is 1
    return (
      <button
        className="how-to-play-header-nav-btn left"
        onClick={() => { playClick(); setIndex(targetIndex); }}
        aria-label={`Go to ${PAGES[targetIndex].title}`}
      >
        <img src="/assets/img/button-icons/right-arrow.png" alt="" aria-hidden="true" className="nav-arrow left" />
        <span className="how-to-play-header-nav-label">{PAGES[targetIndex].title}</span>
      </button>
    );
  })();

  const rightButton = (() => {
    if (index === 0) {
      // Page 0 -> link to Page 1
      const targetIndex = 1;
      return (
        <button
          className="how-to-play-header-nav-btn right"
          onClick={() => { playClick(); setIndex(targetIndex); }}
          aria-label={`Go to ${PAGES[targetIndex].title}`}
        >
          <span className="how-to-play-header-nav-label">{PAGES[targetIndex].title}</span>
          <img src="/assets/img/button-icons/right-arrow.png" alt="" aria-hidden="true" className="nav-arrow right" />
        </button>
      );
    }
    if (index === 1) {
      // Page 1 -> link to Page 2
      const targetIndex = 2;
      return (
        <button
          className="how-to-play-header-nav-btn right"
          onClick={() => { playClick(); setIndex(targetIndex); }}
          aria-label={`Go to ${PAGES[targetIndex].title}`}
        >
          <span className="how-to-play-header-nav-label">{PAGES[targetIndex].title}</span>
          <img src="/assets/img/button-icons/right-arrow.png" alt="" aria-hidden="true" className="nav-arrow right" />
        </button>
      );
    }
    // Page 2 -> loop back to Page 0
    const targetIndex = 0;
    return (
      <button
        className="how-to-play-header-nav-btn right"
        onClick={() => { playClick(); setIndex(targetIndex); }}
        aria-label={`Go to ${PAGES[targetIndex].title}`}
      >
        <span className="how-to-play-header-nav-label">{PAGES[targetIndex].title}</span>
        <img src="/assets/img/button-icons/right-arrow.png" alt="" aria-hidden="true" className="nav-arrow right" />
      </button>
    );
  })();

  return (
    <main className="how-to-play-stage how-to-play-multi" role="main" aria-labelledby="howto-title">
      <div className="how-to-play-content how-to-play-multi-content">
        <header className="how-to-play-header">
          {leftButton}
          <div>
            <h1 id="howto-title" className="how-to-play-title">{PAGES[index].title}</h1>
            <div className="how-to-play-divider" aria-hidden="true"></div>
          </div>
          {rightButton}
        </header>
        <section className="how-to-play-page-area">
          <Current />
        </section>
      </div>
    </main>
  );
}
