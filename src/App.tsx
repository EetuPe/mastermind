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
  const [codeLength, setCodeLength] = useState<number>(6);
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

  // Reverse rows and hints for bottom-up display
  const reversedRows = rows.slice().reverse();
  const reversedHints = hints.slice().reverse();

  const isGameOver = state.guesses.length >= GUESS_LENGTH || state.isSolved;
  const shownAnswer =
    isGameOver && typeof state.answer === "string"
      ? state.answer.split("").map(colorIndexToName)
      : Array(codeLength).fill("?");

  // Handler for code length change
  const handleCodeLengthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLength = parseInt(e.target.value, 10);
    setCodeLength(newLength);
    setFinalGuess([]);
    state.newGame(); // Remove argument, call with 0 arguments
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
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 justify-center items-center">
        <div className="w-full md:w-3/4 bg-slate-800 rounded-lg p-8 shadow-xl min-h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={() => {
                state.newGame(); // Remove argument, call with 0 arguments
                setFinalGuess([]);
              }}
              className="bg-green-500 hover:bg-green-600"
            >
              New Game
            </Button>
          </div>
          {/* Correct answer row moved here */}
          <div className="bg-slate-600 border-2 border-yellow-400 rounded-md my-2">
            <GuessRow
              colors={shownAnswer}
              hints={{ correct: 0, misplaced: 0 }}
              isAnswer
              codeLength={codeLength}
            />
          </div>
          <div className="space-y-2">
            {reversedRows.map((guess, idx, arr) => {
              const isCurrentRow = idx === 0;
              const hintsIdx = reversedHints[idx];
              return (
                <GuessRow
                  key={arr.length - 1 - idx}
                  colors={guess}
                  hints={
                    isCurrentRow
                      ? { correct: 0, misplaced: 0 }
                      : hintsIdx && typeof hintsIdx.correct === "number"
                      ? hintsIdx
                      : { correct: 0, misplaced: 0 }
                  }
                  isCurrent={isCurrentRow}
                  onPegClick={undefined}
                  selectedPegIdx={null}
                  codeLength={codeLength}
                />
              );
            })}
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
                finalGuess.some((v) => v === "")
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
              className={`w-18 h-18 rounded-full shadow-lg transition-transform hover:scale-105`}
              style={{ backgroundColor: color }}
              onClick={() => onColorPaletteClick(idx)}
              variant="ghost"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
