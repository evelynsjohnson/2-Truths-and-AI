// Utility functions for the game

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format a score with commas
 */
export function formatScore(score) {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate points based on difficulty and speed
 */
//TODO: Refine point calculation logic
export function calculatePoints(isCorrect, timeSpent, difficulty = 'normal') {
  if (!isCorrect) return 0;
  
  const basePoints = {
    easy: 5,
    normal: 10,
    hard: 15
  }[difficulty] || 10;
  
  // Bonus for quick answers (within 10 seconds)
  const speedBonus = timeSpent < 10000 ? 5 : 0;
  
  return basePoints + speedBonus;
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
