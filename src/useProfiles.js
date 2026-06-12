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

const ACTIVE_KEY = 'dk-active-profile'

export function useProfiles() {
  const [user, setUser] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [profilesReady, setProfilesReady] = useState(false)
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
    addStars,
    reportRecord,
    connectGoogle,
    signOutUser,
    error,
  }
}
