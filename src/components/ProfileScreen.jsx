import { useState } from 'react'

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🦄', '🐯', '🐰', '🐙', '🦖', '🐬', '🚀', '🌟']

export default function ProfileScreen({
  user,
  profiles,
  onSelect,
  onCreate,
  onDelete,
  onConnectGoogle,
  onSignOut,
  onTeacher,
  error,
}) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [creating, setCreating] = useState(false)

  const create = async () => {
    const trimmed = name.trim()
    if (!trimmed || creating) return
    setCreating(true)
    try {
      await onCreate(trimmed, avatar)
      setName('')
    } finally {
      setCreating(false)
    }
  }

  const isGoogle = user && !user.isAnonymous

  return (
    <div className="game-screen">
      <h2 className="game-title">👋 Cine se joacă azi?</h2>
      <p className="game-subtitle">Alege-ți profilul sau creează unul nou!</p>

      {error === 'permission-denied' && (
        <div className="feedback bad">
          Nu am acces la baza de date — regulile de securitate Firestore nu sunt încă publicate.
        </div>
      )}

      {profiles.length > 0 && (
        <div className="profile-grid">
          {profiles.map((p) => (
            <div key={p.id} className="profile-card-wrap">
              <button className="profile-card" onClick={() => onSelect(p.id)}>
                <span className="profile-avatar">{p.avatar}</span>
                <span className="profile-name">{p.name}</span>
                <span className="profile-stars">⭐ {p.stars || 0}</span>
              </button>
              <button
                className="profile-delete"
                title="Șterge profilul"
                onClick={() => {
                  if (window.confirm(`Ștergi profilul „${p.name}"? Stelele lui se pierd.`)) {
                    onDelete(p.id)
                  }
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="profile-create">
        <div className="section-label">✨ Profil nou</div>
        <div className="avatar-picker">
          {AVATARS.map((a) => (
            <button
              key={a}
              className={`avatar-option ${avatar === a ? 'active' : ''}`}
              onClick={() => setAvatar(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="name-row">
          <input
            className="name-input"
            placeholder="Numele tău…"
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
          />
          <button className="big-btn" style={{ marginTop: 0 }} onClick={create} disabled={creating}>
            Creează! 🎉
          </button>
        </div>
      </div>

      <button className="teacher-entry" onClick={onTeacher}>
        👩‍🏫 Sunt profesor — administrează profilurile și generează exerciții
      </button>

      <div className="account-box">
        {isGoogle ? (
          <>
            <span>
              🔒 Progresul este salvat pe contul <strong>{user.email}</strong>
            </span>
            <button className="option-btn" onClick={onSignOut}>
              Deconectare
            </button>
          </>
        ) : (
          <>
            <span>
              👨‍👩‍👧 Pentru părinți: conectează un cont Google ca profilurile și stelele să nu se
              piardă și să fie disponibile pe orice dispozitiv.
            </span>
            <button className="option-btn" onClick={onConnectGoogle}>
              Conectează cont Google
            </button>
          </>
        )}
      </div>
    </div>
  )
}
