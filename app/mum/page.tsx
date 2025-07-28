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
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .cover {
          width: calc(var(--baseline) * 60);
          height: calc(var(--baseline) * 42.6);
          max-width: 90vw;
          max-height: 80vh;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          position: relative;
          border-radius: 8px;
          overflow: hidden;
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
          transition: all 0.3s ease;
        }

        .book__left:hover {
          background-color: rgba(190, 24, 93, 0.05);
          transform: scale(1.02);
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
          padding: calc(var(--baseline) * 2.5);
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .page__photo {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: calc(var(--baseline) * 2);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border: 3px solid rgba(255, 255, 255, 0.8);
        }

        .page__photo--small {
          width: 70px;
          height: 70px;
          margin-bottom: calc(var(--baseline) * 1.5);
        }

        .page__emoji {
          font-size: 3rem;
          margin-bottom: calc(var(--baseline) * 1.5);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .page__title {
          font-family: var(--title);
          font-size: calc(var(--base-size) * 1.8);
          color: var(--pink-text);
          margin-bottom: calc(var(--baseline) * 2);
          font-weight: 600;
          line-height: 1.3;
        }

        .page__text {
          font-family: var(--body);
          font-size: calc(var(--base-size) * 1);
          line-height: 1.7;
          color: var(--dark-text);
          max-width: 85%;
          opacity: 0.9;
        }

        .page__number {
          position: absolute;
          bottom: calc(var(--baseline) * 2);
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--title);
          font-size: calc(var(--base-size) * 0.8);
          color: #999;
          font-weight: 500;
        }

        /* Cover styles */
        .cover-content {
          color: white;
        }

        .cover-photo {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 2rem;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        }

        .cover-title {
          font-family: var(--book-title);
          font-size: calc(var(--base-size) * 2.5);
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .cover-subtitle {
          font-family: var(--body);
          font-size: calc(var(--base-size) * 0.9);
          opacity: 0.9;
          margin-top: 0.5rem;
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
          width: 100%;
        }

        .photo-collage img {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .photo-collage img:hover {
          transform: scale(1.05);
        }

        /* Navigation buttons */
        .nav-buttons {
          position: absolute;
          bottom: -5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1.5rem;
        }

        .nav-button {
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #be185d, #ec4899);
          color: white;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-family: var(--body);
          font-weight: 600;
          font-size: calc(var(--base-size) * 0.9);
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(190, 24, 93, 0.3);
        }

        .nav-button:hover {
          background: linear-gradient(135deg, #9f1239, #be185d);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(190, 24, 93, 0.4);
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 8px rgba(190, 24, 93, 0.2);
        }

        /* Left side content based on current page */
        .left-content {
          opacity: 0.85;
          transition: all 0.3s ease;
        }

        .book__left:hover .left-content {
          opacity: 1;
        }

        /* Final page improvements */
        .final-page-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100%;
          padding: calc(var(--baseline) * 3);
        }

        .final-emoji {
          font-size: 5rem;
          margin-bottom: calc(var(--baseline) * 2);
          animation: bounce 2s infinite;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-15px);
          }
          60% {
            transform: translateY(-7px);
          }
        }

        .final-title {
          font-family: var(--book-title);
          font-size: calc(var(--base-size) * 3);
          color: var(--pink-text);
          margin-bottom: calc(var(--baseline) * 2);
          text-shadow: 0 3px 6px rgba(190, 24, 93, 0.2);
          line-height: 1.2;
        }

        .final-subtitle {
          font-family: var(--title);
          font-size: calc(var(--base-size) * 1.3);
          color: var(--dark-text);
          margin-bottom: calc(var(--baseline) * 2.5);
          opacity: 0.85;
          line-height: 1.6;
          max-width: 90%;
        }

        .final-signature {
          font-family: var(--book-title);
          font-size: calc(var(--base-size) * 1.6);
          color: var(--pink-text);
          margin-top: calc(var(--baseline) * 2.5);
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(190, 24, 93, 0.1);
        }

        .final-hearts {
          font-size: 2rem;
          margin-top: calc(var(--baseline) * 1.5);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .book-wrapper {
            padding: 1rem 0.5rem;
          }

          .cover {
            width: calc(var(--baseline) * 50);
            height: calc(var(--baseline) * 35);
            max-width: 95vw;
            max-height: 85vh;
          }

          .page__content {
            padding: calc(var(--baseline) * 2);
          }

          .page__photo {
            width: 75px;
            height: 75px;
            margin-bottom: calc(var(--baseline) * 1.5);
          }

          .page__photo--small {
            width: 60px;
            height: 60px;
          }

          .page__emoji {
            font-size: 2.5rem;
            margin-bottom: calc(var(--baseline) * 1);
          }

          .page__title {
            font-size: calc(var(--base-size) * 1.5);
            margin-bottom: calc(var(--baseline) * 1.5);
          }

          .page__text {
            font-size: calc(var(--base-size) * 0.9);
            max-width: 90%;
          }

          .photo-collage {
            gap: 0.75rem;
            padding: 0.75rem;
          }

          .photo-collage img {
            height: 70px;
          }

          .cover-photo {
            width: 100px;
            height: 100px;
            margin-bottom: 1.5rem;
          }

          .cover-title {
            font-size: calc(var(--base-size) * 2.2);
          }

          .final-emoji {
            font-size: 4rem;
            margin-bottom: calc(var(--baseline) * 1.5);
          }

          .final-title {
            font-size: calc(var(--base-size) * 2.5);
            margin-bottom: calc(var(--baseline) * 1.5);
          }

          .final-subtitle {
            font-size: calc(var(--base-size) * 1.1);
            margin-bottom: calc(var(--baseline) * 2);
          }

          .final-signature {
            font-size: calc(var(--base-size) * 1.4);
            margin-top: calc(var(--baseline) * 2);
          }

          .nav-buttons {
            bottom: -4rem;
            gap: 1rem;
          }

          .nav-button {
            padding: 0.6rem 1.5rem;
            font-size: calc(var(--base-size) * 0.85);
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .cover {
            width: calc(var(--baseline) * 45);
            height: calc(var(--baseline) * 32);
          }

          .page__content {
            padding: calc(var(--baseline) * 1.5);
          }

          .page__photo {
            width: 65px;
            height: 65px;
          }

          .page__photo--small {
            width: 55px;
            height: 55px;
          }

          .page__emoji {
            font-size: 2rem;
          }

          .page__title {
            font-size: calc(var(--base-size) * 1.3);
          }

          .page__text {
            font-size: calc(var(--base-size) * 0.85);
          }

          .photo-collage {
            gap: 0.5rem;
            padding: 0.5rem;
          }

          .photo-collage img {
            height: 60px;
          }

          .cover-photo {
            width: 85px;
            height: 85px;
          }

          .cover-title {
            font-size: calc(var(--base-size) * 2);
          }

          .final-emoji {
            font-size: 3.5rem;
          }

          .final-title {
            font-size: calc(var(--base-size) * 2.2);
          }

          .final-subtitle {
            font-size: calc(var(--base-size) * 1);
          }

          .final-signature {
            font-size: calc(var(--base-size) * 1.3);
          }

          .nav-buttons {
            bottom: -3.5rem;
            gap: 0.75rem;
          }

          .nav-button {
            padding: 0.5rem 1.25rem;
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
                      &quot;A mother&apos;s love is the fuel that enables a normal human being to do the impossible.&quot;
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
                    <p className="cover-subtitle">Click to open</p>
                  </div>
                </div>
                <div className="page__face page__face--back">
                  <div className="page__content">
                    <div className="photo-collage">
                      <Image src="/mum1.jpeg" alt="Memory 1" width={120} height={80} className="object-cover w-full h-full" />
                      <Image src="/mum2.jpeg" alt="Memory 2" width={120} height={80} className="object-cover w-full h-full" />
                      <Image src="/mum3.jpeg" alt="Memory 3" width={120} height={80} className="object-cover w-full h-full" />
                      <Image src="/mum4.jpeg" alt="Memory 4" width={120} height={80} className="object-cover w-full h-full" />
                    </div>
                    <p className="page__text" style={{ marginTop: '1rem', textAlign: 'center' }}>Memories we&apos;ve shared...</p>
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
                      &quot;A mother&apos;s love is the fuel that enables a normal human being to do the impossible.&quot;
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
                      My inspiration, my biggest supporter, and the most beautiful soul I&apos;ve ever known.
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
                  <div className="page__content final-page-content">
                    <motion.div
                      className="final-emoji"
                      animate={{
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      🎂
                    </motion.div>
                    <h1 className="final-title">Happy Birthday, Mum!</h1>
                    <p className="final-subtitle">
                      Thank you for being the most amazing mum in the world.
                      Your love and wisdom have shaped my life in countless ways.
                    </p>
                    <div className="final-hearts">💖💖💖</div>
                    <p className="final-signature">Love always, Nasko 💖</p>
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