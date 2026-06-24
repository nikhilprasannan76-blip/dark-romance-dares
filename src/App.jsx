import { useEffect, useRef, useState } from "react";
import { cards } from "./data/cards";
import "./App.css";

const STORAGE_KEY = "dark-romance-game-v2";

const taunts = [
  "Trying to leave already? Adorable.",
  "You were never really going to press No.",
  "Curiosity looks dangerous on you.",
  "Good. I was hoping you would stay.",
  "The darkness noticed you first.",
  "Cute. But tonight, escape is not an option."
];

function App() {
  const [screen, setScreen] = useState("intro");
  const [names, setNames] = useState({ user: "", partner: "" });
  const [deck, setDeck] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [cardNumber, setCardNumber] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [tauntText, setTauntText] = useState("");
  const [typedText, setTypedText] = useState("");

  const audioRef = useRef(null);
  const flipAudioRef = useRef(null);

  const shuffleCards = () => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const formatCard = (text) => {
    const user = names.user || "You";
    const partner = names.partner || "Partner";

    return text
      .replaceAll("{user}", user)
      .replaceAll("{partner}", partner);
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);
      setNames(parsed.names || { user: "", partner: "" });
      setDeck(parsed.deck || shuffleCards());
      setCurrentCard(parsed.currentCard || null);
      setCardNumber(parsed.cardNumber || 0);
      setScreen(parsed.screen || "intro");
    } else {
      setDeck(shuffleCards());
    }
  }, []);

  useEffect(() => {
    const data = {
      names,
      deck,
      currentCard,
      cardNumber,
      screen: screen === "game" || screen === "end" ? screen : "intro"
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [names, deck, currentCard, cardNumber, screen]);

  useEffect(() => {
    if (screen !== "taunt") return;

    setTypedText("");
    let index = 0;

    const interval = setInterval(() => {
      setTypedText(tauntText.slice(0, index + 1));
      index++;

      if (index >= tauntText.length) {
        clearInterval(interval);
        setTimeout(() => setScreen("game"), 1000);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [screen, tauntText]);

  const moveNoButton = () => {
    const maxX = window.innerWidth < 500 ? 130 : 220;
    const maxY = window.innerWidth < 500 ? 120 : 150;

    setNoPosition({
      x: Math.floor(Math.random() * maxX * 2) - maxX,
      y: Math.floor(Math.random() * maxY * 2) - maxY,
    });
  };

  const handleYesClick = () => {
    const randomTaunt = taunts[Math.floor(Math.random() * taunts.length)];
    setTauntText(randomTaunt);
    setScreen("taunt");
  };

  const drawCard = () => {
    if (deck.length === 0) {
      setScreen("end");
      return;
    }

    setIsFlipped(false);

    setTimeout(() => {
      const selectedCard = deck[0];
      const remainingCards = deck.slice(1);

      setCurrentCard(selectedCard);
      setDeck(remainingCards);
      setCardNumber((prev) => prev + 1);
      setIsFlipped(true);

      if (flipAudioRef.current) {
        flipAudioRef.current.currentTime = 0;
        flipAudioRef.current.play().catch(() => {});
      }
    }, 350);
  };

  const restartGame = () => {
    const freshDeck = shuffleCards();
    setDeck(freshDeck);
    setCurrentCard(null);
    setCardNumber(0);
    setIsFlipped(false);
    setScreen("game");
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (musicOn) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }

    setMusicOn(!musicOn);
  };

  const progress = (cardNumber / cards.length) * 100;

  if (screen === "intro") {
    return (
      <div className="app intro-screen">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
        <div className="particles"></div>

        <div className="intro-content">
          <section className="hero intro-hero">
            <p className="tagline">Welcome to</p>
            <h1>Dark Romance Dares</h1>
          </section>

          <div className="intro-card name-card">
            <div className="card-symbol">♥</div>
            <h2>Are you ready for adventure?</h2>
            <p>Enter your names before the darkness begins.</p>

            <input
              type="text"
              placeholder="Your name"
              value={names.user}
              onChange={(e) =>
                setNames({ ...names, user: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Partner name"
              value={names.partner}
              onChange={(e) =>
                setNames({ ...names, partner: e.target.value })
              }
            />
          </div>

          <div className="intro-buttons">
            <button className="choice-btn yes-btn" onClick={handleYesClick}>
              Yes
            </button>

            <button
  className="choice-btn no-btn"
  style={{
    transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
  }}
  onClick={moveNoButton}
>
  No
</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "taunt") {
    return (
      <div className="app taunt-screen">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
        <div className="particles"></div>

        <div className="taunt-box">
          <h1>You tried to run?</h1>
          <p>{typedText}<span className="cursor">|</span></p>
        </div>
      </div>
    );
  }

  if (screen === "end") {
    return (
      <div className="app taunt-screen">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
        <div className="particles"></div>

        <div className="taunt-box">
          <h1>All secrets revealed.</h1>
          <p>You survived all {cards.length} Dark Romance dares.</p>
          <button className="draw-btn end-btn" onClick={restartGame}>
            Begin Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <audio ref={audioRef} loop>
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>

      <audio ref={flipAudioRef}>
        <source src="/flip.mp3" type="audio/mpeg" />
      </audio>

      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>
      <div className="particles"></div>

      <button className="music-btn" onClick={toggleMusic}>
        {musicOn ? "♪ Music On" : "♪ Music Off"}
      </button>

      <section className="hero">
        <p className="tagline">A dangerous little game for two</p>
        <h1>Dark Romance</h1>
        <p className="subtitle">Draw a card. Read it slowly. Dare to answer.</p>
      </section>

      <div className="progress-wrap">
        <div className="progress-info">
          <span>Progress</span>
          <span>Card {cardNumber}/{cards.length}</span>
        </div>

        <div className="progress-bar">
          <div style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className={`card ${isFlipped ? "flip" : ""}`}>
        <div className="card-inner">
          <div className="card-front">
            <div className="card-symbol">♥</div>
            <h2>Dark Romance</h2>
            <p>Touch the unknown</p>
          </div>

          <div className="card-back">
            <span className="card-label">Dare</span>
            <p>
              {currentCard
                ? formatCard(currentCard)
                : "Your dare will appear here."}
            </p>
          </div>
        </div>
      </div>

      <button className="draw-btn" onClick={drawCard}>
        {currentCard ? "Next Card" : "Start Game"}
      </button>
    </div>
  );
}

export default App;