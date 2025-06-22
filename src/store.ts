import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getRandomGuess } from "./guess-utils";

function computeHints(guess: string, answer: string) {
  // Returns {correct, misplaced}
  let correct = 0,
    misplaced = 0;
  const answerArr = answer.split("");
  const guessArr = guess.split("");
  const answerCount: Record<string, number> = {};
  const guessCount: Record<string, number> = {};

  // First pass: correct positions
  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === answerArr[i]) {
      correct++;
    } else {
      answerCount[answerArr[i]] = (answerCount[answerArr[i]] || 0) + 1;
      guessCount[guessArr[i]] = (guessCount[guessArr[i]] || 0) + 1;
    }
  }
  // Second pass: misplaced
  for (const k in guessCount) {
    if (answerCount[k]) {
      misplaced += Math.min(guessCount[k], answerCount[k]);
    }
  }
  return { correct, misplaced };
}

type StoreState = {
  answer: string;
  guesses: string[];
  hints: { correct: number; misplaced: number }[];
  isSolved: boolean;
  codeLength: number;
  setCodeLength: (len: number) => void;
  addGuess: (guess: string) => void;
  newGame: (len?: number) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      answer: getRandomGuess(4, 8),
      guesses: [],
      hints: [],
      isSolved: false,
      codeLength: 4,
      setCodeLength: (len: number) => {
        set({ codeLength: len });
      },
      addGuess: (guess: string) => {
        const { answer, guesses, hints } = get();
        const newHints = computeHints(guess, answer);
        const solved = guess === answer;
        set({
          guesses: [...guesses, guess],
          hints: [...hints, newHints],
          isSolved: solved,
        });
      },
      newGame: (len?: number) => {
        const codeLength = len ?? get().codeLength;
        set({
          answer: getRandomGuess(codeLength, 8),
          guesses: [],
          hints: [],
          isSolved: false,
          codeLength,
        });
      },
    }),
    {
      name: "mastermind",
    }
  )
);
