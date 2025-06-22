import "./App.css";
import { useState } from "react";
import { useStore } from "./store";
import { Button } from "@/components/ui/button";
import GuessRow from "./GuessRow";

const COLORS = [
  "yellow",
  "blue",
  "red",
  "green",
  "brown",
  "white",
  "orange",
  "black",
];
const GUESS_LENGTH = 10;

// Helper to map color index (as string) to color name
const colorIndexToName = (idx: string) => COLORS[parseInt(idx, 10)] || "";

export default function App() {
  const state = useStore();
  // Set default code length to 4
  const [codeLength, setCodeLength] = useState<number>(state.codeLength || 4);
  const [finalGuess, setFinalGuess] = useState<string[]>([]);

  // Place color to first available slot when color is clicked
  const onColorPaletteClick = (idx: number) => {
    if (
      finalGuess.length < codeLength &&
      state.guesses.length < GUESS_LENGTH &&
      !state.isSolved
    ) {
      setFinalGuess([...finalGuess, idx.toString()]);
    }
  };

  const onSubmit = () => {
    if (finalGuess.length === codeLength && finalGuess.every((v) => v !== "")) {
      state.addGuess(finalGuess.join(""));
      setFinalGuess([]);
    }
  };

  // Remove last peg
  const onRemove = () => {
    if (finalGuess.length > 0) {
      setFinalGuess(finalGuess.slice(0, -1));
    }
  };

  // Hints: state.hints should be an array of {correct, misplaced} for each guess
  // If not present, fallback to empty hints
  const hints: { correct: number; misplaced: number }[] = Array.isArray(
    state.hints
  )
    ? state.hints
    : [];

  // Convert guesses from string to color names for display
  let rows = [...state.guesses].map((guess) =>
    typeof guess === "string" ? guess.split("").map(colorIndexToName) : guess
  );
  if (rows.length < GUESS_LENGTH) {
    // Show current guess row, padded to codeLength
    const paddedGuess = [
      ...finalGuess.map(colorIndexToName),
      ...Array(codeLength - finalGuess.length).fill(""),
    ];
    rows.push(paddedGuess);
  }
  const numberOfGuessesRemaining = GUESS_LENGTH - rows.length;
  rows = rows.concat(Array(numberOfGuessesRemaining).fill([]));

  // Reverse rows for bottom-up display
  const reversedRows = rows.slice().reverse();

  // Create hints array that matches the reversed rows structure
  // We need to pad hints to match the total number of rows, then reverse
  const paddedHints = [
    ...hints,
    ...Array(GUESS_LENGTH - hints.length).fill({ correct: 0, misplaced: 0 }),
  ];
  const reversedHints = paddedHints.slice().reverse();

  const isGameOver = state.guesses.length >= GUESS_LENGTH || state.isSolved;
  const shouldShowAnswer =
    state.guesses.length >= GUESS_LENGTH || state.isSolved; // Show answer when game ends

  // Correct answer logic: show the answer when the game ends
  const shownAnswer =
    shouldShowAnswer && typeof state.answer === "string"
      ? state.answer.slice(0, codeLength).split("").map(colorIndexToName)
      : Array(codeLength).fill("");

  // Handler for code length change
  const handleCodeLengthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLength = parseInt(e.target.value, 10);
    setCodeLength(newLength);
    setFinalGuess([]);
    state.setCodeLength(newLength);
    state.newGame(newLength);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4">
      <h1 className="text-5xl font-bold text-neutral-50 mb-8">Mastermind</h1>
      <div className="mb-4">
        <label htmlFor="code-length" className="text-neutral-200 mr-2">
          Code Length:
        </label>
        <select
          id="code-length"
          value={codeLength}
          onChange={handleCodeLengthChange}
          className="rounded px-2 py-1 bg-slate-700 text-white"
        >
          {[4, 6, 8].map((len) => (
            <option key={len} value={len}>
              {len}
            </option>
          ))}
        </select>
      </div>
      <div
        className="w-full flex flex-col md:flex-row gap-8 justify-center items-center"
        style={{ maxWidth: `${Math.max(800, codeLength * 80 + 300)}px` }}
      >
        <div
          className="w-full md:w-auto bg-yellow-950 rounded-lg p-8 shadow-xl min-h-[600px]"
          style={{ minWidth: `${codeLength * 80 + 200}px` }}
        >
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={() => {
                state.newGame(codeLength);
                setFinalGuess([]);
              }}
              className="bg-green-500 hover:bg-green-600"
            >
              New Game
            </Button>
            {/* Game status indicator */}
            <div className="text-white text-lg font-semibold">
              {state.isSolved ? (
                <span className="text-green-400">🎉 You Won!</span>
              ) : state.guesses.length >= GUESS_LENGTH ? (
                <span className="text-red-400">
                  Game Over - Answer Revealed
                </span>
              ) : (
                <span>
                  Guesses: {state.guesses.length}/{GUESS_LENGTH}
                </span>
              )}
            </div>
          </div>
          {/* Secret code row - always present like in classic Mastermind */}
          <div className="mb-4">
            <div className="text-white font-bold mb-2 text-center">
              Secret Code
            </div>
            <div
              className={`bg-yellow-950 border-2 rounded-md flex items-center justify-center transition-all duration-1000 ease-in-out ${
                shouldShowAnswer
                  ? "border-green-400 shadow-lg shadow-green-400/30"
                  : "border-gray-600"
              }`}
              style={{
                minHeight: "4.5rem",
                transform: shouldShowAnswer ? "scale(1.02)" : "scale(1)",
              }}
            >
              {shouldShowAnswer ? (
                <div className="flex gap-2">
                  {shownAnswer.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-16 rounded-full border-2 border-gray-400"
                      style={{ backgroundColor: color || "#9ca3af" }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex gap-2">
                  {Array(codeLength)
                    .fill(0)
                    .map((_, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center animate-pulse"
                      >
                        <span className="text-gray-400 text-2xl">?</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          {/* Board grid: 5x10, last column is for hints */}
          <div
            className={`grid gap-2`}
            style={{
              gridTemplateColumns: `repeat(${codeLength}, 4rem) 2rem`,
              gridTemplateRows: `repeat(${GUESS_LENGTH}, 1fr)`,
            }}
          >
            {reversedRows.map((guess, idx) => (
              <GuessRow
                key={idx}
                colors={guess}
                hints={reversedHints[idx] || { correct: 0, misplaced: 0 }}
                codeLength={codeLength}
              />
            ))}
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <Button
              onClick={onRemove}
              disabled={finalGuess.every((v) => v === "")}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Remove
            </Button>
            <Button
              onClick={onSubmit}
              disabled={
                finalGuess.length !== codeLength ||
                finalGuess.some((v) => v === "") ||
                isGameOver
              }
              className="bg-blue-500 hover:bg-blue-600"
            >
              Submit
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-1 gap-3 w-full md:w-auto">
          {COLORS.map((color, idx) => (
            <Button
              key={color}
              className={`w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105 border-2 border-gray-800 hover:border-gray-600`}
              style={{ backgroundColor: color }}
              onClick={() => onColorPaletteClick(idx)}
              variant="ghost"
              disabled={isGameOver}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
