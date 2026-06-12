import { useState } from 'react'
import { LEVELS } from './levels'
import Home from './components/Home'
import AbacusGame from './components/AbacusGame'
import FlashAnzan from './components/FlashAnzan'
import Drills from './components/Drills'
import MemoryGame from './components/MemoryGame'
import Confetti from './components/Confetti'

const GAMES = {
  abacus: AbacusGame,
  flash: FlashAnzan,
  drills: Drills,
  memory: MemoryGame,
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [levelId, setLevelId] = useState(1)
  const [stars, setStars] = useState(0)
  const [starBump, setStarBump] = useState(0)
  const [confettiBurst, setConfettiBurst] = useState(0)

  const level = LEVELS.find((l) => l.id === levelId)

  const addStars = (n) => {
    setStars((s) => s + n)
    setStarBump((b) => b + 1)
  }

  const celebrate = () => setConfettiBurst((c) => c + 1)

  const Game = GAMES[screen]

  return (
    <>
      <Confetti trigger={confettiBurst} />
      <header className="header">
        {screen !== 'home' && (
          <button className="back-btn" onClick={() => setScreen('home')}>
            ⬅ Înapoi
          </button>
        )}
        <div className="logo" onClick={() => setScreen('home')}>
          <span className="logo-icon">💎</span>
          <span>
            <span className="brand-diamond">Diamond</span> <span className="brand-kids">Kids</span>
          </span>
        </div>
        <div className="header-spacer" />
        {screen !== 'home' && (
          <div className="level-pill">
            {level.emoji} {level.name}
          </div>
        )}
        <div className={`stars-badge ${starBump ? 'bump' : ''}`} key={starBump}>
          ⭐ {stars}
        </div>
      </header>

      {screen === 'home' ? (
        <Home
          level={level}
          onSelectLevel={setLevelId}
          onSelectGame={setScreen}
        />
      ) : (
        <Game level={level} onStars={addStars} onCelebrate={celebrate} />
      )}
    </>
  )
}
