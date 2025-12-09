import { cx, fmt } from "@/utils/helpers";
import { Phase, PhaseType } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Flag, Trophy } from "lucide-react";

interface Team {
  name: string;
  score: number;
  timeoutsUsed: number;
  isBotOut: boolean;
  disqualified: boolean;
}

interface ClockPanelProps {
  phase: PhaseType;
  halfIndex: number;
  halfRemaining: number;
  htRemaining: number;
  running: boolean;
  toggleClock: () => void;
  startMatch: () => void;
  beginSecondHalf: () => void;
  resetMatch: () => void;
  clockDisabled: boolean;
  winner: number | null;
  teams: Team[];
  handlePublish: () => void;
  totalPlayed: number;
  totalRemaining: number;
}

export function ClockPanel({
  phase,
  halfIndex,
  halfRemaining,
  htRemaining,
  running,
  toggleClock,
  startMatch,
  beginSecondHalf,
  resetMatch,
  clockDisabled,
  winner,
  teams,
  handlePublish,
  totalPlayed,
  totalRemaining,
}: ClockPanelProps) {
  const phaseLabel =
    phase === Phase.PRE_MATCH
      ? "PRE-MATCH"
      : phase === Phase.FIRST_HALF
        ? "1ST HALF"
        : phase === Phase.SECOND_HALF
          ? "2ND HALF"
          : phase === Phase.HALF_TIME
            ? "HALF-TIME"
            : "ENDED";

  const getPhaseColor = () => {
    if (phase === Phase.ENDED) return "bg-primary";
    if (phase === Phase.HALF_TIME) return "bg-warning text-warning-foreground";
    if (running) return "bg-info";
    return "bg-muted";
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 card-glow">
      {/* Phase Header */}
      <div className="flex items-center justify-between mb-2">
        <Badge className={cx("font-display text-xs", getPhaseColor())}>
          {phaseLabel}
          {(phase === Phase.FIRST_HALF || phase === Phase.SECOND_HALF) && ` • H${halfIndex + 1}`}
        </Badge>
        <div className="flex gap-1 text-[10px] text-muted-foreground font-mono">
          <span>P: {fmt(totalPlayed)}</span>
          <span>•</span>
          <span>R: {fmt(totalRemaining)}</span>
        </div>
      </div>

      {/* Main Clock Display */}
      {(phase === Phase.FIRST_HALF || phase === Phase.SECOND_HALF) && (
        <div className="text-center py-2">
          <div
            className={cx(
              "text-5xl font-black tabular-nums tracking-tight leading-none",
              halfRemaining <= 10 ? "text-destructive" : "text-foreground",
              running && "animate-pulse"
            )}
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            {fmt(halfRemaining)}
          </div>
        </div>
      )}

      {phase === Phase.HALF_TIME && (
        <div className="text-center py-2">
          <div 
            className="text-4xl font-black tabular-nums tracking-tight text-warning"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            {fmt(Math.max(0, htRemaining))}
          </div>
          <div className="text-[10px] text-muted-foreground">Break</div>
        </div>
      )}

      {phase === Phase.PRE_MATCH && (
        <div className="text-center py-4">
          <div 
            className="text-2xl font-bold text-muted-foreground"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            READY
          </div>
        </div>
      )}

      {phase === Phase.ENDED && (
        <div className="text-center py-2">
          <Trophy className="w-6 h-6 mx-auto text-primary mb-1" />
          <div className="font-display text-lg font-bold text-primary">FULL TIME</div>
          {winner !== null ? (
            <div className="text-xs text-foreground mt-1">
              Winner: <span className="font-semibold text-primary">{teams[winner].name}</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mt-1">Tie — Referee decision</div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-1.5 mt-2">
        {phase === Phase.PRE_MATCH ? (
          <Button onClick={startMatch} className="flex-1 h-8 text-xs btn-glow">
            <Flag className="w-3 h-3 mr-1" /> Kick-off
          </Button>
        ) : phase === Phase.HALF_TIME ? (
          <Button onClick={beginSecondHalf} className="flex-1 h-8 text-xs btn-glow">
            <Play className="w-3 h-3 mr-1" /> Start 2nd Half
          </Button>
        ) : phase === Phase.ENDED ? (
          <Button onClick={handlePublish} className="flex-1 h-8 text-xs btn-glow">
            <Trophy className="w-3 h-3 mr-1" /> Publish Result
          </Button>
        ) : (
          <Button
            onClick={toggleClock}
            disabled={clockDisabled}
            className="flex-1 h-8 text-xs"
            variant={running ? "secondary" : "default"}
          >
            {running ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
            {running ? "Pause" : "Start"}
          </Button>
        )}
        <Button variant="outline" onClick={resetMatch} size="sm" className="h-8 px-2">
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}