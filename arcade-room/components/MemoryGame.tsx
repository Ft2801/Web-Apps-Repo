import React, { useState, useEffect } from 'react';
import { generateMemoryDeck, MemoryCard } from '../utils/gameUtils';
import Button from './Button';
import { ArrowLeft, RefreshCw, Star, Heart, Cloud, Zap, Umbrella, Sun, Moon, Music } from 'lucide-react';

interface MemoryGameProps {
  onBack: () => void;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ onBack }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(true); // Locked initially during reveal

  // Initialize game on mount
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // 1. Generate deck
    const newDeck = generateMemoryDeck();
    
    // 2. Flip all cards face up initially
    const revealedDeck = newDeck.map(card => ({ ...card, isFlipped: true }));
    setCards(revealedDeck);
    setFlippedIndices([]);
    setMatches(0);
    setMoves(0);
    setIsLocked(true);

    // 3. Hide them after 1 second
    setTimeout(() => {
      setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
      setIsLocked(false);
    }, 1000);
  };

  const getIcon = (id: number) => {
      const size = 32;
      switch(id) {
          case 0: return <Star size={size} className="text-yellow-400" fill="currentColor" />;
          case 1: return <Heart size={size} className="text-red-500" fill="currentColor" />;
          case 2: return <Cloud size={size} className="text-blue-300" fill="currentColor" />;
          case 3: return <Zap size={size} className="text-yellow-300" fill="currentColor" />;
          case 4: return <Umbrella size={size} className="text-purple-400" fill="currentColor" />;
          case 5: return <Sun size={size} className="text-orange-400" fill="currentColor" />;
          case 6: return <Moon size={size} className="text-slate-300" fill="currentColor" />;
          case 7: return <Music size={size} className="text-pink-400" fill="currentColor" />;
          default: return null;
      }
  }

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    // Flip card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);
      
      const [firstIdx, secondIdx] = newFlipped;
      
      if (cards[firstIdx].iconId === cards[secondIdx].iconId) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            (i === firstIdx || i === secondIdx) ? { ...c, isMatched: true } : c
          ));
          setMatches(m => m + 1);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            (i === firstIdx || i === secondIdx) ? { ...c, isFlipped: false } : c
          ));
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const isWin = matches === 8;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-4 animate-fade-in">
       <div className="w-full flex justify-between items-center mb-6">
         <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
            <ArrowLeft className="w-5 h-5" />
         </Button>
         <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            Memory
         </h2>
         <div className="text-slate-400 font-mono text-sm">{moves} Moves</div>
      </div>

      <div className="grid grid-cols-4 gap-3 w-full aspect-square">
        {cards.map((card, index) => (
            <div 
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`
                    relative rounded-lg cursor-pointer transition-all duration-500 transform
                    aspect-square
                    ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
                `}
                style={{ perspective: '1000px' }}
            >
                {/* Back of Card (Hidden when flipped) */}
                <div className={`
                    absolute inset-0 bg-slate-700 rounded-lg flex items-center justify-center
                    border-2 border-slate-600 shadow-md
                    transition-all duration-300 backface-hidden
                    ${card.isFlipped || card.isMatched ? 'opacity-0 rotate-y-180' : 'opacity-100'}
                `}>
                    <div className="w-4 h-4 rounded-full bg-slate-600" />
                </div>

                {/* Front of Card (Visible when flipped) */}
                <div className={`
                    absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center
                    border-2 ${card.isMatched ? 'border-green-500 shadow-green-500/20' : 'border-blue-500'} 
                    shadow-lg transition-all duration-300 backface-hidden
                    ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0 -rotate-y-180'}
                `}>
                    {getIcon(card.iconId)}
                </div>
            </div>
        ))}
      </div>

      {isWin && (
         <div className="mt-8 w-full animate-bounce-in text-center">
            <h3 className="text-2xl font-bold text-green-400 mb-4">Victory!</h3>
            <Button onClick={startNewGame} fullWidth variant="primary">
                <RefreshCw className="mr-2 w-5 h-5" />
                Play Again
            </Button>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;