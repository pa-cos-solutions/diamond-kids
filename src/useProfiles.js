import { useEffect, useState } from 'react'
import {
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { dayKey, yesterdayKey, earnedBadges } from './levels'

const ACTIVE_KEY = 'dk-active-profile'

export function useProfiles() {
  const [user, setUser] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [profilesReady, setProfilesReady] = useState(false)
  const [exerciseSets, setExerciseSets] = useState([])
  const [activeId, setActiveId] = useState(() => localStorage.getItem(ACTIVE_KEY))
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u)
      } else {
        setUser(null)
        signInAnonymously(auth).catch((e) => setError(e.message))
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) return
    setProfilesReady(false)
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'profiles'),
      (snap) => {
        setProfiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setProfilesReady(true)
        setError(null)
      },
      (e) => {
        setError(e.code === 'permission-denied' ? 'permission-denied' : e.message)
        setProfilesReady(true)
      }
    )
    return unsub
  }, [user])

  // Seturile de exerciții publicate de profesor — vizibile imediat la elevi (realtime)
  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'exerciseSets'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setExerciseSets(list)
      },
      (e) => setError(e.message)
    )
    return unsub
  }, [user])

  const activeProfile = profiles.find((p) => p.id === activeId) || null

  const selectProfile = (id) => {
    setActiveId(id)
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  }

  const createProfile = async (name, avatar) => {
    const ref = await addDoc(collection(db, 'users', user.uid, 'profiles'), {
      name,
      avatar,
      stars: 0,
      coins: 0,
      level: 1,
      streak: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      perfectRounds: 0,
      weekSeconds: 0,
      badges: [],
      opStats: {},
      memoryBest: 0,
      flashWins: 0,
      drillsBestCorrect: 0,
      abacusSolved: 0,
      createdAt: serverTimestamp(),
    })
    selectProfile(ref.id)
  }

  const deleteProfile = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'profiles', id))
    if (id === activeId) selectProfile(null)
  }

  // gestionate de profesor — funcționează pe orice profil al contului
  const renameProfile = async (id, name) => {
    await updateDoc(doc(db, 'users', user.uid, 'profiles', id), { name }).catch((e) =>
      setError(e.message)
    )
  }

  const resetProfile = async (id) => {
    await updateDoc(doc(db, 'users', user.uid, 'profiles', id), {
      stars: 0,
      coins: 0,
      streak: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      perfectRounds: 0,
      weekSeconds: 0,
      dailyCount: 0,
      badges: [],
      opStats: {},
      memoryBest: 0,
      flashWins: 0,
      drillsBestCorrect: 0,
      abacusSolved: 0,
    }).catch((e) => setError(e.message))
  }

  const profileRef = () => doc(db, 'users', user.uid, 'profiles', activeId)

  const addStars = (n) => {
    if (!activeProfile) return
    updateDoc(profileRef(), { stars: increment(n) }).catch((e) => setError(e.message))
  }

  // type 'inc' — contor cumulativ; type 'max' — record personal
  const reportRecord = (key, value, type = 'max') => {
    if (!activeProfile) return
    if (type === 'inc') {
      updateDoc(profileRef(), { [key]: increment(value) }).catch((e) => setError(e.message))
    } else if (value > (activeProfile[key] || 0)) {
      updateDoc(profileRef(), { [key]: value }).catch((e) => setError(e.message))
    }
  }

  const createExerciseSet = async ({ title, ops, maxOperand, count }) => {
    await addDoc(collection(db, 'users', user.uid, 'exerciseSets'), {
      title,
      ops,
      maxOperand,
      count,
      createdAt: serverTimestamp(),
    }).catch((e) => setError(e.message))
  }

  const deleteExerciseSet = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'exerciseSets', id)).catch((e) => setError(e.message))
  }

  const setProfileLevel = (level) => {
    if (!activeProfile) return
    updateDoc(profileRef(), { level }).catch((e) => setError(e.message))
  }

  // Apelat la finalul unei runde de exerciții — actualizează tot odată:
  // monede, streak, obiectiv zilnic, totaluri, precizie pe operații, insigne, timp.
  const reportSession = ({ correct = 0, attempts = 0, ops = {}, seconds = 0, coins = 0, perfect = false }) => {
    if (!activeProfile) return
    const p = activeProfile
    const today = dayKey()
    let streak = p.streak || 0
    if (p.lastActiveDay !== today) {
      streak = p.lastActiveDay === yesterdayKey() ? streak + 1 : 1
    } else if (!streak) {
      streak = 1
    }
    const dailyCount = (p.dailyDate === today ? p.dailyCount || 0 : 0) + correct

    const opStats = { ...(p.opStats || {}) }
    for (const [op, s] of Object.entries(ops)) {
      const cur = opStats[op] || { c: 0, a: 0 }
      opStats[op] = { c: cur.c + (s.c || 0), a: cur.a + (s.a || 0) }
    }

    const merged = {
      ...p,
      coins: (p.coins || 0) + coins,
      streak,
      totalCorrect: (p.totalCorrect || 0) + correct,
      totalAttempts: (p.totalAttempts || 0) + attempts,
      perfectRounds: (p.perfectRounds || 0) + (perfect ? 1 : 0),
    }
    const badges = Array.from(new Set([...(p.badges || []), ...earnedBadges(merged)]))

    updateDoc(profileRef(), {
      coins: merged.coins,
      streak,
      lastActiveDay: today,
      dailyDate: today,
      dailyCount,
      totalCorrect: merged.totalCorrect,
      totalAttempts: merged.totalAttempts,
      perfectRounds: merged.perfectRounds,
      weekSeconds: (p.weekSeconds || 0) + seconds,
      opStats,
      badges,
    }).catch((e) => setError(e.message))
  }

  const connectGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await linkWithPopup(auth.currentUser, provider)
    } catch (e) {
      // contul Google e deja folosit de alt utilizator — ne logăm direct pe el
      if (e.code === 'auth/credential-already-in-use') {
        selectProfile(null)
        await signInWithPopup(auth, provider)
      } else if (e.code !== 'auth/popup-closed-by-user') {
        setError(e.message)
      }
    }
    setUser({ ...auth.currentUser })
  }

  const signOutUser = async () => {
    selectProfile(null)
    await signOut(auth) // onAuthStateChanged va crea automat un cont anonim nou
  }

  return {
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
    addStars,
    reportRecord,
    reportSession,
    setProfileLevel,
    connectGoogle,
    signOutUser,
    error,
  }
}
