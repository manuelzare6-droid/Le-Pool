import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

// ── Constants ──
const CATEGORIES = [
  { id: "all", label: "Tout", icon: "✦" },
  { id: "livres", label: "Livres", icon: "📚" },
  { id: "films", label: "Films", icon: "🎬" },
  { id: "series", label: "Séries", icon: "📺" },
  { id: "musique", label: "Musique", icon: "🎵" },
  { id: "jeux", label: "Jeux", icon: "🎮" },
  { id: "restos", label: "Restos", icon: "🍽️" },
  { id: "podcasts", label: "Podcasts", icon: "🎧" },
];

const WAVE_COLORS = [
  "#0F4C75", "#1B6CA8", "#3A86FF", "#5E60CE",
  "#7209B7", "#B5179E", "#F72585", "#4CC9F0",
  "#06D6A0", "#118AB2", "#073B4C", "#2D6A4F",
];

function getRandomColor() {
  return WAVE_COLORS[Math.floor(Math.random() * WAVE_COLORS.length)];
}

// ── Local storage helpers (personal data only) ──
function getLocal(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// ── Components ──

function WaveHeader() {
  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(135deg, #0F4C75 0%, #1B6CA8 40%, #3A86FF 100%)",
        padding: "48px 24px 64px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.08,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='8' fill='white' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            color: "white",
            margin: 0,
            letterSpacing: "-0.02em",
            textShadow: "0 2px 20px rgba(0,0,0,0.2)",
          }}
        >
          Le Pool <span style={{ fontSize: "0.8em" }}>🌊</span>
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "rgba(255,255,255,0.85)",
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            marginTop: 8,
            fontWeight: 400,
          }}
        >
          Partagez vos coups de cœur avec tout le monde
        </p>
      </div>
      <svg
        style={{ position: "absolute", bottom: -1, left: 0, width: "100%" }}
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80Z"
          fill="#FAFAF8"
        />
      </svg>
    </div>
  );
}

function CategoryPill({ cat, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 18px",
        borderRadius: 999,
        border: active ? "2px solid #0F4C75" : "2px solid #E0E0E0",
        background: active ? "#0F4C75" : "white",
        color: active ? "white" : "#444",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.88rem",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        boxShadow: active
          ? "0 2px 12px rgba(15,76,117,0.25)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <span style={{ fontSize: "1.1em" }}>{cat.icon}</span>
      {cat.label}
    </button>
  );
}

function RecoCard({ reco, onLike, liked, delay }) {
  const [hovered, setHovered] = useState(false);
  const catInfo =
    CATEGORIES.find((c) => c.id === reco.category) || CATEGORIES[0];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 8px 32px rgba(15,76,117,0.15)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        animation: `fadeSlideIn 0.4s ease ${delay}ms both`,
      }}
    >
      <div style={{ height: 4, background: reco.color || "#3A86FF" }} />
      <div style={{ padding: "18px 20px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.78rem",
              fontFamily: "'DM Sans', sans-serif",
              color: "#888",
              background: "#F5F5F3",
              padding: "3px 10px",
              borderRadius: 999,
            }}
          >
            {catInfo.icon} {catInfo.label}
          </span>
          <span
            style={{
              fontSize: "0.78rem",
              fontFamily: "'DM Sans', sans-serif",
              color: "#AAA",
            }}
          >
            par{" "}
            <strong style={{ color: "#555", fontWeight: 600 }}>
              {reco.author}
            </strong>
          </span>
        </div>

        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "#1A1A1A",
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          {reco.title}
        </h3>

        {reco.description && (
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem",
              color: "#666",
              margin: "0 0 14px",
              lineHeight: 1.55,
            }}
          >
            {reco.description}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onLike}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 999,
              border: "none",
              background: liked ? "rgba(247,37,133,0.1)" : "#F5F5F3",
              color: liked ? "#F72585" : "#999",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span
              style={{
                fontSize: "1.1em",
                transition: "transform 0.2s ease",
                transform: liked ? "scale(1.2)" : "scale(1)",
              }}
            >
              {liked ? "❤️" : "🤍"}
            </span>
            {reco.likes || 0}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#555",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "2px solid #E8E8E6",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
  background: "#FAFAF8",
};

function AddModal({ onClose, onSubmit, username, onSetUsername }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("livres");
  const [tempName, setTempName] = useState(username);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !tempName.trim() || submitting) return;
    setSubmitting(true);
    if (!username) onSetUsername(tempName.trim());
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      author: tempName.trim(),
      likes: 0,
      likedBy: [],
      color: getRandomColor(),
      createdAt: Date.now(),
    });
    setSubmitting(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,76,117,0.3)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 20,
          padding: "28px 24px 24px",
          width: "100%",
          maxWidth: 440,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
          animation: "slideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1A1A1A",
            margin: "0 0 20px",
            textAlign: "center",
          }}
        >
          Nouvelle recommandation 🌊
        </h2>

        {!username && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Ton pseudo</label>
            <input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Ex: Kevin"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#3A86FF")}
              onBlur={(e) => (e.target.style.borderColor = "#E8E8E6")}
            />
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Catégorie</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border:
                    category === cat.id
                      ? "2px solid #0F4C75"
                      : "2px solid #E8E8E6",
                  background: category === cat.id ? "#0F4C75" : "white",
                  color: category === cat.id ? "white" : "#555",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Titre *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Interstellar, Sapiens, Kendrick Lamar..."
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#3A86FF")}
            onBlur={(e) => (e.target.style.borderColor = "#E8E8E6")}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>
            Pourquoi tu recommandes ? (optionnel)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Un chef-d'œuvre absolu, à voir au moins une fois..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            onFocus={(e) => (e.target.style.borderColor = "#3A86FF")}
            onBlur={(e) => (e.target.style.borderColor = "#E8E8E6")}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "2px solid #E8E8E6",
              background: "white",
              color: "#888",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !tempName.trim() || submitting}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background:
                !title.trim() || !tempName.trim()
                  ? "#CCC"
                  : "linear-gradient(135deg, #0F4C75, #3A86FF)",
              color: "white",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor:
                !title.trim() || !tempName.trim() ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(58,134,255,0.3)",
            }}
          >
            {submitting ? "Publication..." : "Publier 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        animation: "fadeIn 0.5s ease",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.6 }}>
        🌊
      </div>
      <p
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.2rem",
          color: "#AAA",
          margin: 0,
        }}
      >
        Soyez le premier à ajouter une recommandation !
      </p>
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [recos, setRecos] = useState([]);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recent");
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState(() =>
    getLocal("pool-username", "")
  );
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => {
    let id = getLocal("pool-userid", null);
    if (!id) {
      id =
        Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      setLocal("pool-userid", id);
    }
    return id;
  });

  // Listen to Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "recos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRecos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddReco = async (reco) => {
    try {
      await addDoc(collection(db, "recos"), reco);
    } catch (err) {
      console.error("Add error:", err);
    }
    setShowModal(false);
  };

  const handleLike = async (reco) => {
    try {
      const ref = doc(db, "recos", reco.id);
      const likedBy = reco.likedBy || [];
      const alreadyLiked = likedBy.includes(userId);
      await updateDoc(ref, {
        likes: alreadyLiked
          ? Math.max(0, (reco.likes || 0) - 1)
          : (reco.likes || 0) + 1,
        likedBy: alreadyLiked
          ? likedBy.filter((x) => x !== userId)
          : [...likedBy, userId],
      });
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleSetUsername = (name) => {
    setUsername(name);
    setLocal("pool-username", name);
  };

  const filtered = recos
    .filter((r) => category === "all" || r.category === category)
    .sort((a, b) => {
      if (sort === "liked") return (b.likes || 0) - (a.likes || 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAF8",
          fontFamily: "'DM Sans', sans-serif",
          color: "#AAA",
        }}
      >
        Chargement... 🌊
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <WaveHeader />

      {/* Sticky controls */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(250,250,248,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "12px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            padding: "0 16px 8px",
          }}
        >
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.id}
              cat={cat}
              active={category === cat.id}
              onClick={() => setCategory(cat.id)}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.82rem",
              color: "#AAA",
            }}
          >
            {filtered.length} recommandation
            {filtered.length !== 1 ? "s" : ""}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { id: "recent", label: "Plus récents" },
              { id: "liked", label: "Plus likés" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "none",
                  background: sort === s.id ? "#1A1A1A" : "transparent",
                  color: sort === s.id ? "white" : "#999",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          padding: "20px 16px 100px",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((reco, i) => (
              <RecoCard
                key={reco.id}
                reco={reco}
                liked={(reco.likedBy || []).includes(userId)}
                onLike={() => handleLike(reco)}
                delay={i * 60}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #0F4C75, #3A86FF)",
          color: "white",
          fontSize: "1.6rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 6px 24px rgba(58,134,255,0.4)",
          zIndex: 99,
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "scale(1.1)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        +
      </button>

      {showModal && (
        <AddModal
          username={username}
          onSetUsername={handleSetUsername}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddReco}
        />
      )}
    </div>
  );
}
