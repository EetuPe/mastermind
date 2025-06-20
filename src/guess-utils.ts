export const CODE_LENGTH = 6;

export function getRandomGuess(): string {
  let randomNumber = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    randomNumber += Math.floor(Math.random() * 6); // 6 colors: 0-5
  }
  return randomNumber;
}

/**
 * Computes the number of correct (black) and misplaced (white) pegs for a guess.
 * @param guess string of color indices, e.g. "0123"
 * @param answer string of color indices, e.g. "3210"
 * @returns { correct: number, misplaced: number }
 */
export function computeMastermindHints(
  guess: string,
  answer: string
): { correct: number; misplaced: number } {
  let correct = 0;
  let misplaced = 0;
  const answerArr = answer.split("");
  const guessArr = guess.split("");
  const answerColorCounts: Record<string, number> = {};
  const guessColorCounts: Record<string, number> = {};

  // First pass: count correct (black pegs)
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessArr[i] === answerArr[i]) {
      correct++;
    } else {
      answerColorCounts[answerArr[i]] =
        (answerColorCounts[answerArr[i]] || 0) + 1;
      guessColorCounts[guessArr[i]] = (guessColorCounts[guessArr[i]] || 0) + 1;
    }
  }
  // Second pass: count misplaced (white pegs)
  for (const color in guessColorCounts) {
    if (answerColorCounts[color]) {
      misplaced += Math.min(guessColorCounts[color], answerColorCounts[color]);
    }
  }
  return { correct, misplaced };
}
