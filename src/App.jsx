import { useState } from 'react'
import { LEVELS } from './levels'
import { useProfiles } from './useProfiles'
import Home from './components/Home'
import AbacusGame from './components/AbacusGame'
import FlashAnzan from './components/FlashAnzan'
import Drills from './components/Drills'
import MemoryGame from './components/MemoryGame'
import ProfileScreen from './components/ProfileScreen'
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
  const [starBump, setStarBump] = useState(0)
  const [confettiBurst, setConfettiBurst] = useState(0)

  const {
    user,
    profiles,
    profilesReady,
    activeProfile,
    selectProfile,
    createProfile,
    deleteProfile,
    addStars: addStarsDb,
    reportRecord,
    connectGoogle,
    signOutUser,
    error,
  } = useProfiles()

  const level = LEVELS.find((l) => l.id === levelId)

  const addStars = (n) => {
    addStarsDb(n)
    setStarBump((b) => b + 1)
  }

  const celebrate = () => setConfettiBurst((c) => c + 1)

  const Game = GAMES[screen]
  const loading = !user || !profilesReady
  const needsProfile = !loading && !activeProfile

  return (
    <>
      <Confetti trigger={confettiBurst} />
      <header className="header">
        {screen !== 'home' && !needsProfile && (
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
        {screen !== 'home' && !needsProfile && (
          <div className="level-pill">
            {level.emoji} {level.name}
          </div>
        )}
        {activeProfile && (
          <button
            className="profile-pill"
            title="Schimbă profilul"
            onClick={() => selectProfile(null)}
          >
            {activeProfile.avatar} {activeProfile.name}
          </button>
        )}
        {activeProfile && (
          <div className={`stars-badge ${starBump ? 'bump' : ''}`} key={starBump}>
            ⭐ {activeProfile.stars || 0}
          </div>
        )}
      </header>

      {loading ? (
        <div className="loading-screen">
          <span className="logo-icon">💎</span> Se încarcă…
        </div>
      ) : needsProfile ? (
        <ProfileScreen
          user={user}
          profiles={profiles}
          onSelect={(id) => {
            selectProfile(id)
            setScreen('home')
          }}
          onCreate={createProfile}
          onDelete={deleteProfile}
          onConnectGoogle={connectGoogle}
          onSignOut={signOutUser}
          error={error}
        />
      ) : screen === 'home' ? (
        <Home level={level} onSelectLevel={setLevelId} onSelectGame={setScreen} />
      ) : (
        <Game level={level} onStars={addStars} onCelebrate={celebrate} onRecord={reportRecord} />
      )}
    </>
  )
}
