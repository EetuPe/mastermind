import { Button } from "@/components/ui/button";

interface GuessRowProps {
  colors: string[];
  hints?: { correct: number; misplaced: number };
  isAnswer?: boolean;
  isCurrent?: boolean;
  onPegClick?: (idx: number) => void;
  selectedPegIdx?: number | null;
  codeLength?: number; // add this prop
}

export default function GuessRow({
  colors = [],
  hints = { correct: 0, misplaced: 0 },
  isAnswer = false,
  onPegClick,
  codeLength = 6, // default to 6 if not provided
}: GuessRowProps) {
  const CODE_LENGTH = codeLength;
  const displayColors =
    colors.length < CODE_LENGTH
      ? [...colors, ...Array(CODE_LENGTH - colors.length).fill("")]
      : colors;

  return (
    <div
      className={`grid gap-2 items-center w-fit`}
      style={{
        maxWidth: "100%",
        gridTemplateColumns: `repeat(${CODE_LENGTH}, 4rem) 2rem`,
      }}
    >
      {/* Color pegs */}
      {displayColors.map((color, idx) => (
        <Button
          key={idx}
          className={`w-16 h-16 rounded-full border-2 ${
            isAnswer ? "bg-gray-400 border-gray-500" : ""
          } ${color ? "" : "bg-white border-gray-300"}`}
          style={
            color && !isAnswer
              ? { backgroundColor: color, borderColor: color }
              : undefined
          }
          variant="ghost"
          tabIndex={-1}
          onClick={onPegClick ? () => onPegClick(idx) : undefined}
        >
          {/* No text, just color */}
        </Button>
      ))}
      {/* Hint pegs as a 2x2 square */}
      <div className="flex flex-col items-center justify-center h-full">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: "repeat(2, 1rem)",
            gridTemplateRows: "repeat(2, 1rem)",
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => {
            if (i < hints.correct) {
              return (
                <span
                  key={`c${i}`}
                  className="w-4 h-4 rounded-full bg-black border border-gray-700"
                />
              );
            } else if (i < hints.correct + hints.misplaced) {
              return (
                <span
                  key={`m${i}`}
                  className="w-4 h-4 rounded-full bg-white border border-black"
                />
              );
            } else {
              return (
                <span
                  key={`e${i}`}
                  className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400 opacity-40"
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
