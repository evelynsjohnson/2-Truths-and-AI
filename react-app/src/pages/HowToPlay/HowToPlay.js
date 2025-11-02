/**
 * @fileoverview HowToPlay component that explains the game rules and steps.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';
import './HowToPlay.css';

const PAGES = [
  { id: 'fill-card', title: 'How To Fill Out Your Player Card', comp: Page1 },
  { id: 'vote-ai', title: 'How To Vote for the AI Lie', comp: Page2 },
  { id: 'gain-points', title: 'How To Gain Points and Win', comp: Page3 },
];

export default function HowToPlay() {
  const navigate = useNavigate();
  const { playClick } = useSoundEffect();
  const [index, setIndex] = useState(0);

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

  return (
    <main className="how-to-play-stage how-to-play-multi" role="main" aria-labelledby="howto-title">
      <div className="how-to-play-content how-to-play-multi-content">
        <header className="how-to-play-header">
          <Button
            className="how-to-play-home-btn"
            aria-label="Go home"
            onClick={goHome}
            variant="icon"
          >
            <img src="/assets/img/button-icons/home.png" alt="Home" />
          </Button>

          <div>
            <h1 id="howto-title" className="how-to-play-title">{PAGES[index].title}</h1>
            <div className="how-to-play-divider" aria-hidden="true"></div>
          </div>
        </header>

        <section className="how-to-play-page-area">
          <Current />
        </section>

        <footer className="how-to-play-footer">
          <div className="how-to-play-footer-left">
            {index > 0 && (
              <button className="how-to-play-footer-link" onClick={goPrev} aria-label="Previous">
                ← {PAGES[index - 1].title}
              </button>
            )}
          </div>

          <div className="how-to-play-footer-right">
            {index < PAGES.length - 1 && (
              <button className="how-to-play-footer-link" onClick={goNext} aria-label="Next">
                {PAGES[index + 1].title} →
              </button>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
