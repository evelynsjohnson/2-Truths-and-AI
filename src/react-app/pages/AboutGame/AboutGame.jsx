/**
 * @fileoverview About Game page component.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import './AboutGame.css';

export default function AboutGame() {
  const navigate = useNavigate();
  const { playClick } = useSoundEffect();

  // This component renders the About Game page
  return (
    <main className="about-game-stage" role="main" aria-labelledby="game-title">
      <div className="about-game-content">
        <header className="about-game-header">
          <button
            className="how-to-play-header-nav-btn left"
            onClick={() => { playClick(); navigate('/about-us'); }}
            aria-label="Go to Meet The Team"
          >
            <img src="/assets/img/button-icons/right-arrow.png" alt="" aria-hidden="true" className="nav-arrow left" />
            <span className="how-to-play-header-nav-label">Meet The Team!</span>
          </button>

          <div>
            <h1 id="game-title" className="about-game-title">About Our Game</h1>
            <div className="about-game-divider" aria-hidden="true"></div>
          </div>
        </header>

        <div className="layout-grid">
          <section className="section section-purple idea-section" aria-labelledby="idea-title">
            <h2 id="idea-title">Our Inspiration</h2>                                                        {/* Game idea and description */}
            <p>
              Riccardo suggested an idea for the game, asking us if we've ever played "2 Truths and a Lie",
              saying that he had noticed that after a few rounds it's tough to come up with believable
              lies, and that we could use AI to help with that. So we decided to expand on it. Eventually
              Evelyn renamed it "2 Truths and AI?" as a clever play on words from the original game.
            </p>
          </section>

          <section className="section section-black text-block-1">
            <p>
              Our original assignment was to brainstorm about potential interactive experience, system,
              device, and/or service projects in our class,{' '}
              <a href="https://catalog.uic.edu/search/?P=CS%20422" target="_blank" rel="noopener noreferrer">
                CS 422 - User Interface Design and Programming
              </a>{' '}
              with{' '}
              <a href="https://ecologylab.net/people/andruid" target="_blank" rel="noopener noreferrer">
                Dr. Andruid Kerne
              </a>.
            </p>
          </section>

          <section className="section section-black text-block-2">
            <p>
              Our process is centered on a core gameplay loop: players submit truths, our system sends them to
              an AI API (gpt-35-turbo, gpt-5-nano, and gpt-4.1-mini) to generate a convincing lie, and
              then having players vote to identify which statement is the AI.
            </p>
          </section>

          <section className="section section-purple methods-section" aria-labelledby="methods-title">
            <h2 id="methods-title">Our Methods</h2>
            <p>
              We follow design principles like providing clear feedback (e.g., loading screens, animations,
              tooltips), using unambiguous signifiers (like unique player symbols for voting), and relying on both knowledge
              in the world and in the head to make the game intuitive and engaging for everyone.
            </p>
          </section>
        </div>

        {/* navigation moved above page content */}
      </div>
    </main>
  );
}
