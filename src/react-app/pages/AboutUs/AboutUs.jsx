/**
 * @fileoverview About Us page displaying team members and mission statement.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './AboutUs.css';

export default function AboutUs() {
  const navigate = useNavigate();

  // Render the About Us page
  return (
    <main className="about-us-stage" role="main" aria-labelledby="about-title">
      <div className="about-us-content">
        <header className="about-us-header">
          <Button                                         // Home button to navigate back to start page
            className="about-us-home-btn" 
            aria-label="Go home"
            onClick={() => navigate('/start')}
            variant="icon"
          >
            <img src="/assets/img/button-icons/home.png" alt="Home" />
          </Button>

          <div>
            <h1 id="about-title" className="about-us-title">Meet The Team!</h1>
            <div className="about-us-divider" aria-hidden="true"></div>
          </div>
        </header>

        <section className="team-grid" aria-label="Team members">                      {/* Team members section */}
          <div className="team-member">
            <img src="/assets/img/about-us/evelyn.png" alt="Evelyn Johnson" className="avatar" />
            <div className="name-row">
              <h3 className="member-name">Evelyn Johnson</h3>
              <a 
                className="linkedin-link" 
                href="https://www.linkedin.com/in/evelynsjohnson" 
                target="_blank"
                rel="noopener noreferrer" 
                aria-label="Evelyn Johnson on LinkedIn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">      {/* LinkedIn icon SVG: SVG path data string that draws a compound shape */}
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5 0 2.12 1.12 1 2.5 1 3.88 1 4.98 2.12 4.98 3.5zM.22 8.98h4.5V24h-4.5V8.98zM9.5 8.98h4.32v2.04h.06c.6-1.14 2.06-2.34 4.24-2.34 4.54 0 5.38 2.98 5.38 6.86V24h-4.5v-7.1c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.74 1.86-2.74 3.78V24h-4.5V8.98z" />
                </svg>
              </a>
            </div>
            <p className="member-role">Role</p>
          </div>

          <div className="team-member">
            <img src="/assets/img/about-us/riccardo.jpg" alt="Riccardo Bonfanti" className="avatar" />
            <div className="name-row">
              <h3 className="member-name">Riccardo Bonfanti</h3>
              <a 
                className="linkedin-link" 
                href="https://www.linkedin.com/in/riccardo-bonfanti02" 
                target="_blank"
                rel="noopener noreferrer" 
                aria-label="Riccardo Bonfanti on LinkedIn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5 0 2.12 1.12 1 2.5 1 3.88 1 4.98 2.12 4.98 3.5zM.22 8.98h4.5V24h-4.5V8.98zM9.5 8.98h4.32v2.04h.06c.6-1.14 2.06-2.34 4.24-2.34 4.54 0 5.38 2.98 5.38 6.86V24h-4.5v-7.1c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.74 1.86-2.74 3.78V24h-4.5V8.98z" />
                </svg>
              </a>
            </div>
            <p className="member-role">Role</p>
          </div>

          <div className="team-member">
            <img src="/assets/img/about-us/ariel.jpg" alt="Ariel Wong" className="avatar" />
            <div className="name-row">
              <h3 className="member-name">Ariel Wong</h3>
              <a 
                className="linkedin-link" 
                href="https://www.linkedin.com/in/arielwong0505" 
                target="_blank"
                rel="noopener noreferrer" 
                aria-label="Ariel Wong on LinkedIn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5 0 2.12 1.12 1 2.5 1 3.88 1 4.98 2.12 4.98 3.5zM.22 8.98h4.5V24h-4.5V8.98zM9.5 8.98h4.32v2.04h.06c.6-1.14 2.06-2.34 4.24-2.34 4.54 0 5.38 2.98 5.38 6.86V24h-4.5v-7.1c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.74 1.86-2.74 3.78V24h-4.5V8.98z" />
                </svg>
              </a>
            </div>
            <p className="member-role">Role</p>
          </div>

          <div className="team-member">
            <img src="/assets/img/about-us/cindy.jpg" alt="Cindy Rocha" className="avatar" />
            <div className="name-row">
              <h3 className="member-name">Cindy Rocha</h3>
              <a 
                className="linkedin-link" 
                href="https://www.linkedin.com/in/cm-rocha" 
                target="_blank"
                rel="noopener noreferrer" 
                aria-label="Cindy Rocha on LinkedIn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5 0 2.12 1.12 1 2.5 1 3.88 1 4.98 2.12 4.98 3.5zM.22 8.98h4.5V24h-4.5V8.98zM9.5 8.98h4.32v2.04h.06c.6-1.14 2.06-2.34 4.24-2.34 4.54 0 5.38 2.98 5.38 6.86V24h-4.5v-7.1c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.74 1.86-2.74 3.78V24h-4.5V8.98z" />
                </svg>
              </a>
            </div>
            <p className="member-role">Role</p>
          </div>
        </section>

        <section className="statement-section" aria-labelledby="statement-title">
          <h2 id="statement-title">Our Mission:</h2>                                              {/* Mission statement section */}
          <p>
            At the heart of our project is a simple belief: great connections are built through
            shared human experiences. We created "2 Truths and AI" to transform the classic
            icebreaker "2 Truths and a Lie" into a modern social game that makes use of artificial
            intelligence to facilitate this in-person connection, not to replace it. By generating
            believable lies from your truths, our game creates moments of surprise, laughter, and
            genuine conversation—without the stress of trying to come up with believable lies.
            Our goal is to a create safe space where relationships can grow naturally, whether
            among old friends or complete strangers, not to replace these interactions. In a world
            where standard icebreakers and digital interactions often feel isolating, we're using
            technology to bring people together in the most human way possible: through stories
            and the joy of discovering what's real.
          </p>
        </section>

        <div className="footer-link">
          <Button                                                   // Button to navigate to About Our Game page
            className="about-game-btn"
            onClick={() => navigate('/about-game')}
            variant="icon"
          >
            <span>About Our Game</span>
            <span className="arrow">→</span>
          </Button>
        </div>
      </div>
    </main>
  );
}
