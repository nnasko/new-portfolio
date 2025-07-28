"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

const ConfettiPiece = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{
      background: `hsl(${Math.random() * 60 + 300}, 80%, 70%)`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
    initial={{ scale: 0, y: -50, rotate: 0, opacity: 0 }}
    animate={{
      scale: [0, 1, 0.8, 0],
      y: [0, 150, 300, 450],
      rotate: [0, 180, 360, 540],
      x: [0, Math.random() * 80 - 40],
      opacity: [0, 1, 0.8, 0],
    }}
    transition={{
      duration: 4,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
  />
);

const Confetti = ({ show }: { show: boolean }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 40 }, (_, i) => (
        <ConfettiPiece key={i} delay={i * 0.03} />
      ))}
    </div>
  );
};

const BirthdayBook = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageTurn = (pageNum: number) => {
    setCurrentPage(pageNum);
    if (pageNum === 1 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const handleLeftSideClick = () => {
    if (currentPage > 0) {
      handlePageTurn(currentPage - 1);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:wght@400;600&display=swap');

        :root {
          --body-bg: #fdf2f8;
          --page-bg: #fffbfc;
          --dark-text: #2A2935;
          --pink-text: #be185d;
          --baseline: 12px;
          --book-title: 'Dancing Script', cursive;
          --title: 'Playfair Display', serif;
          --body: 'Playfair Display', serif;
          --base-size: calc(var(--baseline) * 1.2);
        }

        * {
          box-sizing: border-box;
        }

        .book-wrapper {
          background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%);
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .cover {
          width: calc(var(--baseline) * 60);
          height: calc(var(--baseline) * 42.6);
          max-width: 90vw;
          max-height: 80vh;
          box-shadow: 0 0 100px rgba(0, 0, 0, .3);
          position: relative;
        }

        .book {
          width: 100%;
          height: 100%;
          display: flex;
          perspective: 1200px;
        }

        /* Left side of book */
        .book__left {
          width: 50%;
          height: 100%;
          background: var(--page-bg);
          background-image: linear-gradient(90deg, rgba(227,227,227,1) 0%, rgba(247,247,247,0) 18%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .book__left:hover {
          background-color: rgba(190, 24, 93, 0.05);
        }

        /* Right side container */
        .book__right {
          width: 50%;
          height: 100%;
          position: relative;
        }

        /* Individual pages */
        .page {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-origin: left center;
          transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1), z-index 0s 0.4s;
          transform-style: preserve-3d;
          cursor: pointer;
        }

        .page--0 { z-index: 5; }
        .page--1 { z-index: 4; }
        .page--2 { z-index: 3; }
        .page--3 { z-index: 2; }
        .page--4 { z-index: 1; }

        .page--flipped {
          transform: rotateY(-180deg);
        }

        /* When flipping forward, we need to adjust z-index during the animation */
        .page--0.page--flipped { z-index: 0; }
        .page--1.page--flipped { z-index: 0; }
        .page--2.page--flipped { z-index: 0; }
        .page--3.page--flipped { z-index: 0; }

        /* When flipping backward, we need to restore proper z-index */
        .page--0:not(.page--flipped) { z-index: 5; }
        .page--1:not(.page--flipped) { z-index: 4; }
        .page--2:not(.page--flipped) { z-index: 3; }
        .page--3:not(.page--flipped) { z-index: 2; }
        .page--4:not(.page--flipped) { z-index: 1; }

        .page__face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          background: var(--page-bg);
        }

        .page__face--front {
          background-image: linear-gradient(-90deg, rgba(227,227,227,1) 0%, rgba(247,247,247,0) 18%);
        }

        .page__face--back {
          transform: rotateY(180deg);
          background-image: linear-gradient(90deg, rgba(227,227,227,1) 0%, rgba(247,247,247,0) 18%);
        }

        /* Cover special styling */
        .page--cover .page__face--front {
          background: linear-gradient(135deg, #ec4899, #be185d, #9333ea);
        }

        /* Content styling */
        .page__content {
          padding: calc(var(--baseline) * 2);
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .page__photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: calc(var(--baseline) * 1.5);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .page__photo--small {
          width: 60px;
          height: 60px;
          margin-bottom: calc(var(--baseline) * 1);
        }

        .page__emoji {
          font-size: 2.5rem;
          margin-bottom: calc(var(--baseline) * 1);
        }

        .page__title {
          font-family: var(--title);
          font-size: calc(var(--base-size) * 1.6);
          color: var(--pink-text);
          margin-bottom: calc(var(--baseline) * 1.5);
        }

        .page__text {
          font-family: var(--body);
          font-size: calc(var(--base-size) * 0.9);
          line-height: 1.6;
          color: var(--dark-text);
          max-width: 90%;
        }

        .page__number {
          position: absolute;
          bottom: calc(var(--baseline) * 1.5);
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--title);
          font-size: calc(var(--base-size) * 0.7);
          color: #999;
        }

        /* Cover styles */
        .cover-content {
          color: white;
        }

        .cover-photo {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid rgba(255, 255, 255, 0.5);
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .cover-title {
          font-family: var(--book-title);
          font-size: calc(var(--base-size) * 2.2);
          margin-bottom: 0.5rem;
        }

        /* Final page */
        .final-celebration {
          background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%);
        }

        .final-message {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(190, 24, 93, 0.2);
        }

        /* Photo collage for backs of pages */
        .photo-collage {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: 1rem;
        }

        .photo-collage img {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Navigation buttons */
        .nav-buttons {
          position: absolute;
          bottom: -4rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
        }

        .nav-button {
          padding: 0.5rem 1.5rem;
          background: #be185d;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-family: var(--body);
          transition: all 0.3s;
        }

        .nav-button:hover {
          background: #9f1239;
          transform: scale(1.05);
        }

        .nav-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Left side content based on current page */
        .left-content {
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .book__left:hover .left-content {
          opacity: 1;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .cover {
            width: calc(var(--baseline) * 45);
            height: calc(var(--baseline) * 32);
          }

          .page__content {
            padding: calc(var(--baseline) * 1.5);
          }

          .page__title {
            font-size: calc(var(--base-size) * 1.3);
          }

          .page__text {
            font-size: calc(var(--base-size) * 0.8);
          }
        }
      `}</style>

      <div className="book-wrapper">
        <Confetti show={showConfetti} />
        
        <div className="cover">
          <div className="book">
            {/* Left side - dynamic content based on current page */}
            <div className="book__left" onClick={handleLeftSideClick}>
              <div className="page__content left-content">
                {currentPage === 0 ? (
                  <>
                    <div className="page__emoji">🎂</div>
                    <h1 className="page__title">Happy Birthday!</h1>
                    <p className="page__text">
                      Today we celebrate the most wonderful person in my life
                    </p>
                  </>
                ) : currentPage === 1 ? (
                  <>
                    <div className="page__photo">
                      <Image
                        src="/mum1.jpeg"
                        alt="Memory"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <p className="page__text">
                      "A mother's love is the fuel that enables a normal human being to do the impossible."
                    </p>
                  </>
                ) : currentPage === 2 ? (
                  <>
                    <div className="page__photo">
                      <Image
                        src="/mum5.jpeg"
                        alt="Memory"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <p className="page__text">
                      Every lesson you taught me, every hug you gave me, has shaped my heart and soul.
                    </p>
                  </>
                ) : currentPage === 3 ? (
                  <>
                    <div className="page__emoji">💐</div>
                    <p className="page__text">
                      You deserve all the flowers, all the love, all the happiness in the world
                    </p>
                  </>
                ) : (
                  <>
                    <div className="page__emoji">💖</div>
                    <p className="page__text">
                      Thank you for being the most amazing mum in the world
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Right side - pages that flip */}
            <div className="book__right">
              {/* Page 0 - Cover */}
              <div 
                className={`page page--0 page--cover ${currentPage > 0 ? 'page--flipped' : ''}`}
                onClick={() => currentPage === 0 && handlePageTurn(1)}
              >
                <div className="page__face page__face--front">
                  <div className="page__content cover-content">
                    <div className="cover-photo">
                      <Image
                        src="/mum1.jpeg"
                        alt="Mum"
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <motion.div
                      className="page__emoji"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      💝
                    </motion.div>
                    <h1 className="cover-title">For My Amazing Mum</h1>
                    <p className="text-white/90">Click to open</p>
                  </div>
                </div>
                <div className="page__face page__face--back">
                  <div className="page__content">
                    <div className="photo-collage">
                      <Image src="/mum1.jpeg" alt="Memory 1" width={100} height={100} />
                      <Image src="/mum2.jpeg" alt="Memory 2" width={100} height={100} />
                      <Image src="/mum3.jpeg" alt="Memory 3" width={100} height={100} />
                      <Image src="/mum4.jpeg" alt="Memory 4" width={100} height={100} />
                    </div>
                    <p className="page__text" style={{ marginTop: '1rem' }}>Memories we've shared...</p>
                  </div>
                </div>
              </div>

              {/* Page 1 */}
              <div 
                className={`page page--1 ${currentPage > 1 ? 'page--flipped' : ''}`}
                onClick={() => currentPage === 1 && handlePageTurn(2)}
              >
                <div className="page__face page__face--front">
                  <div className="page__content">
                    <div className="page__photo">
                      <Image
                        src="/mum2.jpeg"
                        alt="Message"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="page__emoji">💕</div>
                    <h2 className="page__title">You Are My Everything</h2>
                    <p className="page__text">
                      Your love has been my guiding star, your hugs my safe place, and your wisdom my compass through life.
                    </p>
                    <div className="page__number">3</div>
                  </div>
                </div>
                <div className="page__face page__face--back">
                  <div className="page__content">
                    <div className="page__photo page__photo--small">
                      <Image src="/mum5.jpeg" alt="Memory" width={60} height={60} className="object-cover w-full h-full" />
                    </div>
                    <p className="page__text">
                      "A mother's love is the fuel that enables a normal human being to do the impossible."
                    </p>
                    <p className="page__text" style={{ marginTop: '1rem', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      - Marion C. Garretty
                    </p>
                  </div>
                </div>
              </div>

              {/* Page 2 */}
              <div 
                className={`page page--2 ${currentPage > 2 ? 'page--flipped' : ''}`}
                onClick={() => currentPage === 2 && handlePageTurn(3)}
              >
                <div className="page__face page__face--front">
                  <div className="page__content">
                    <div className="page__photo">
                      <Image
                        src="/mum3.jpeg"
                        alt="Gratitude"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="page__emoji">🌟</div>
                    <h2 className="page__title">Thank You</h2>
                    <p className="page__text">
                      For all the sacrifices, all the late nights, all the encouragement. You made me who I am today.
                    </p>
                    <div className="page__number">5</div>
                  </div>
                </div>
                <div className="page__face page__face--back">
                  <div className="page__content">
                    <div className="page__photo page__photo--small">
                      <Image src="/mum6.jpeg" alt="Memory" width={60} height={60} className="object-cover w-full h-full" />
                    </div>
                    <p className="page__text">
                      Every lesson you taught me, every hug you gave me, has shaped my heart and soul.
                    </p>
                  </div>
                </div>
              </div>

              {/* Page 3 */}
              <div 
                className={`page page--3 ${currentPage > 3 ? 'page--flipped' : ''}`}
                onClick={() => currentPage === 3 && handlePageTurn(4)}
              >
                <div className="page__face page__face--front">
                  <div className="page__content">
                    <div className="page__photo">
                      <Image
                        src="/mum4.jpeg"
                        alt="Hero"
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="page__emoji">👑</div>
                    <h2 className="page__title">My Hero</h2>
                    <p className="page__text">
                      My inspiration, my biggest supporter, and the most beautiful soul I've ever known.
                    </p>
                    <div className="page__number">7</div>
                  </div>
                </div>
                <div className="page__face page__face--back">
                  <div className="page__content">
                    <div className="page__emoji">💐</div>
                    <p className="page__text">
                      You deserve all the flowers, all the love, all the happiness in the world
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Page */}
              <div className={`page page--4`}>
                <div className="page__face page__face--front final-celebration">
                  <div className="page__content">
                    <motion.div
                      className="text-6xl mb-4"
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 15, -15, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      🎂
                    </motion.div>
                    <div className="final-message">
                      <h1 className="page__title" style={{ fontSize: 'calc(var(--base-size) * 2)', marginBottom: '1rem' }}>
                        Happy Birthday, Mum!
                      </h1>
                      <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Love always, Nasko 💖
                      </p>
                    </div>
                    <div className="page__number">9</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="nav-buttons">
            <button 
              className="nav-button"
              onClick={() => handlePageTurn(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              ← Back
            </button>
            <button 
              className="nav-button"
              onClick={() => currentPage >= 4 ? handlePageTurn(0) : handlePageTurn(currentPage + 1)}
              disabled={currentPage === 4}
            >
              {currentPage >= 4 ? 'Start Over' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default function MumBirthdayPage() {
  return <BirthdayBook />;
} 