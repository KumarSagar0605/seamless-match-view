import { cx, fmt } from "@/utils/helpers";
import { TIMEOUT_ALLOWED_SECONDS, TIMEOUT_TECHNICAL_THRESHOLD } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircleOff, Timer, Zap, Play } from "lucide-react";

interface Team {
  name: string;
  score: number;
  timeoutsUsed: number;
  isBotOut: boolean;
  disqualified: boolean;
}

interface TimeoutState {
  running: boolean;
  forTeam: number | null;
  elapsed: number;
}

interface StoppageState {
  running: boolean;
  reason: string | null;
  elapsed: number;
}

interface StoppagePanelProps {
  timeout: TimeoutState;
  stoppage: StoppageState;
  teams: Team[];
  endTimeout: () => void;
  startStoppage: (reason: string) => void;
  endStoppage: () => void;
  phaseEnded: boolean;
  adjustScore: (teamIdx: number, delta: number, reason: string) => void;
}

export function StoppagePanel({
  timeout,
  stoppage,
  teams,
  endTimeout,
  startStoppage,
  endStoppage,
  phaseEnded,
  adjustScore,
}: StoppagePanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 card-glow">
      <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
        Stoppages & Technical
      </div>

      {/* Quick Stoppage Buttons */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        <Button
          variant="outline"
          onClick={() => startStoppage("OUT_OF_BOUNDS")}
          disabled={stoppage.running || phaseEnded}
          size="sm"
          className="h-7 text-[10px] px-1"
        >
          <CircleOff className="w-3 h-3 mr-0.5" /> OOB
        </Button>
        <Button
          variant="outline"
          onClick={() => startStoppage("NO_PLAY")}
          disabled={stoppage.running || phaseEnded}
          size="sm"
          className="h-7 text-[10px] px-1"
        >
          <Timer className="w-3 h-3 mr-0.5" /> No Play
        </Button>
        <Button
          variant="outline"
          onClick={() => startStoppage("BOTS_STUCK")}
          disabled={stoppage.running || phaseEnded}
          size="sm"
          className="h-7 text-[10px] px-1"
        >
          <Zap className="w-3 h-3 mr-0.5" /> Stuck
        </Button>
        <Button
          variant="secondary"
          onClick={endStoppage}
          disabled={!stoppage.running}
          size="sm"
          className="h-7 text-[10px] px-1"
        >
          <Play className="w-3 h-3 mr-0.5" /> Resume
        </Button>
      </div>

      {/* Technical Points */}
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <Button
          variant="outline"
          onClick={() => adjustScore(0, +1, "Technical Point")}
          size="sm"
          className="h-7 text-[10px]"
        >
          {teams[0].name}: +1 Tech
        </Button>
        <Button
          variant="outline"
          onClick={() => adjustScore(1, +1, "Technical Point")}
          size="sm"
          className="h-7 text-[10px]"
        >
          {teams[1].name}: +1 Tech
        </Button>
      </div>

      {/* Active Timeout/Stoppage Display */}
      {(timeout.running || stoppage.running) && (
        <div className="space-y-2">
          {timeout.running && (
            <div className={cx(
              "rounded-md p-2 border",
              timeout.elapsed > TIMEOUT_ALLOWED_SECONDS ? "bg-warning/10 border-warning/30" : "bg-muted border-border",
              timeout.elapsed >= TIMEOUT_TECHNICAL_THRESHOLD && "bg-destructive/10 border-destructive/30"
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">
                  Timeout — {teams[timeout.forTeam!]?.name}
                </span>
                <Badge variant="outline" className="text-[9px] h-4">
                  Max: 0:{String(TIMEOUT_ALLOWED_SECONDS).padStart(2, "0")}
                </Badge>
              </div>
              <div className={cx(
                "font-display text-2xl font-black tabular-nums",
                timeout.elapsed > TIMEOUT_ALLOWED_SECONDS && "text-warning",
                timeout.elapsed >= TIMEOUT_TECHNICAL_THRESHOLD && "text-destructive"
              )}>
                {fmt(timeout.elapsed)}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-muted-foreground">
                  Tech @0:{TIMEOUT_TECHNICAL_THRESHOLD} • DQ @1:30
                </span>
                <Button size="sm" onClick={endTimeout} className="h-5 text-[10px] px-2">
                  End
                </Button>
              </div>
            </div>
          )}

          {stoppage.running && (
            <div className="rounded-md bg-muted p-2 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">
                  {stoppage.reason?.replace(/_/g, " ")}
                </span>
                <div className="font-display text-xl font-black tabular-nums">
                  {fmt(stoppage.elapsed)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}