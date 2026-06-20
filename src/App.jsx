import { useEffect, useState } from 'react'
import { useProfiles } from './useProfiles'
import Home from './components/Home'
import AbacusGame from './components/AbacusGame'
import FlashAnzan from './components/FlashAnzan'
import Drills from './components/Drills'
import FormulaPractice from './components/FormulaPractice'
import MemoryGame from './components/MemoryGame'
import CustomDrill from './components/CustomDrill'
import Placement from './components/Placement'
import ProfileScreen from './components/ProfileScreen'
import TeacherDashboard from './components/TeacherDashboard'
import TeacherGate from './components/TeacherGate'
import Confetti from './components/Confetti'
import logoUrl from './assets/logo.png'

const GAMES = {
  abacus: AbacusGame,
  flash: FlashAnzan,
  drills: Drills,
  formule: FormulaPractice,
  memory: MemoryGame,
}

const TEACHER_ROUTE = '#/profesor'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [starBump, setStarBump] = useState(0)
  const [confettiBurst, setConfettiBurst] = useState(0)
  const [activeSet, setActiveSet] = useState(null)
  const [route, setRoute] = useState(window.location.hash)
  const [teacherUnlocked, setTeacherUnlocked] = useState(false)

  // Rutare prin hash — zona de profesor stă la #/profesor, neaccesibilă din UI-ul elevilor
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash
      setRoute(h)
      if (h !== TEACHER_ROUTE) setTeacherUnlocked(false)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const isTeacherRoute = route === TEACHER_ROUTE

  const {
    user,
    profiles,
    profilesReady,
    activeProfile,
    selectProfile,
    createProfile,
    deleteProfile,
    renameProfile,
    resetProfile,
    exerciseSets,
    createExerciseSet,
    deleteExerciseSet,
    addStars: addStarsDb,
    reportRecord,
    reportSession,
    connectGoogle,
    signOutUser,
    error,
  } = useProfiles()

  const addStars = (n) => {
    addStarsDb(n)
    setStarBump((b) => b + 1)
  }

  const celebrate = () => setConfettiBurst((c) => c + 1)

  const goHome = () => {
    if (window.location.hash) window.location.hash = ''
    setScreen('home')
  }

  const playSet = (s) => {
    setActiveSet(s)
    setScreen('custom')
  }

  const Game = GAMES[screen]
  const loading = !user || !profilesReady
  const needsProfile = !loading && !activeProfile
  const inGame = !isTeacherRoute && !needsProfile && screen !== 'home'

  return (
    <>
      <Confetti trigger={confettiBurst} />
      <img className="game-watermark" src={logoUrl} alt="SODO Kids Academy" />
      <header className="header">
        {inGame && (
          <button className="back-btn" onClick={() => setScreen('home')}>
            ⬅ Înapoi
          </button>
        )}
        <div className="logo" onClick={goHome}>
          <span className="logo-icon">💎</span>
          <span>
            <span className="brand-SODO">SODO</span> <span className="brand-kids">Kids</span>{' '}
            <span className="brand-academy">Academy</span>
          </span>
        </div>
        <div className="header-spacer" />
        {!isTeacherRoute && activeProfile && (
          <button
            className="profile-pill"
            title="Schimbă profilul"
            onClick={() => selectProfile(null)}
          >
            {activeProfile.avatar} {activeProfile.name}
          </button>
        )}
        {!isTeacherRoute && activeProfile && (
          <div className={`stars-badge ${starBump ? 'bump' : ''}`} key={starBump}>
            ⭐ {activeProfile.stars || 0}
          </div>
        )}
        {!isTeacherRoute && activeProfile && (
          <div className="coins-badge">🪙 {activeProfile.coins || 0}</div>
        )}
      </header>

      {loading ? (
        <div className="loading-screen">
          <span className="logo-icon">💎</span> Se încarcă…
        </div>
      ) : isTeacherRoute ? (
        teacherUnlocked ? (
          <TeacherDashboard
            profiles={profiles}
            onRename={renameProfile}
            onReset={resetProfile}
            onDelete={deleteProfile}
            sets={exerciseSets}
            onCreateSet={createExerciseSet}
            onDeleteSet={deleteExerciseSet}
            onExit={goHome}
          />
        ) : (
          <TeacherGate onUnlock={() => setTeacherUnlocked(true)} onExit={goHome} />
        )
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
      ) : screen === 'placement' ? (
        <Placement onDone={goHome} onCancel={() => setScreen('home')} />
      ) : screen === 'home' ? (
        <Home
          profile={activeProfile}
          profiles={profiles}
          onSelectGame={setScreen}
          onStartPlacement={() => setScreen('placement')}
          sets={exerciseSets}
          onSelectSet={playSet}
        />
      ) : screen === 'custom' && activeSet ? (
        <CustomDrill
          set={activeSet}
          onStars={addStars}
          onCelebrate={celebrate}
          onRecord={reportRecord}
          onSession={reportSession}
        />
      ) : (
        <Game
          onStars={addStars}
          onCelebrate={celebrate}
          onRecord={reportRecord}
          onSession={reportSession}
        />
      )}
    </>
  )
}
