import { cx } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CirclePlus, Minus, AlertTriangle, Timer } from "lucide-react";

interface Team {
  name: string;
  score: number;
  timeoutsUsed: number;
  isBotOut: boolean;
  disqualified: boolean;
}

interface TeamCardProps {
  team: Team;
  idx: number;
  onNameChange: (idx: number, value: string) => void;
  onGoal: (idx: number) => void;
  onAdjustScore: (idx: number, delta: number, reason: string) => void;
  onEarlyStartFoul: (idx: number) => void;
  onToggleBotOut: (idx: number) => void;
  onCallTimeout: (idx: number) => void;
  timeoutRunning: boolean;
  phaseEnded: boolean;
  isLeft?: boolean;
}

export function TeamCard({
  team,
  idx,
  onNameChange,
  onGoal,
  onAdjustScore,
  onEarlyStartFoul,
  onToggleBotOut,
  onCallTimeout,
  timeoutRunning,
  phaseEnded,
  isLeft = true,
}: TeamCardProps) {
  return (
    <div className={cx(
      "relative rounded-lg border border-border bg-card p-4 h-full flex flex-col",
      team.disqualified && "border-destructive/50",
    )}>
      {/* Header: Name + Status badges */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cx(
          "h-10 w-10 shrink-0 rounded-lg grid place-items-center font-bold text-lg",
          isLeft ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        )} style={{ fontFamily: "'Orbitron', monospace" }}>
          {(team.name?.[0] || "T").toUpperCase()}
        </div>
        <Input
          value={team.name}
          onChange={(e) => onNameChange(idx, e.target.value)}
          placeholder="Team name"
          className="h-10 font-semibold text-base bg-input border-border flex-1"
        />
        <div className="flex gap-1.5">
          {team.disqualified && (
            <Badge variant="destructive" className="text-xs px-2 py-0.5">DQ</Badge>
          )}
          {team.isBotOut && (
            <Badge className="text-xs px-2 py-0.5 bg-warning text-warning-foreground">OUT</Badge>
          )}
        </div>
      </div>

      {/* Score Display - Takes up available space */}
      <div className="flex-1 flex items-center justify-center">
        <span className={cx(
          "font-black leading-none tabular-nums",
          isLeft ? "text-primary" : "text-accent",
        )} style={{ fontSize: 'clamp(80px, 15vw, 140px)' }}>
          {team.score}
        </span>
      </div>

      {/* Action Buttons - Compact Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Button
          onClick={() => onGoal(idx)}
          size="sm"
          className="h-10 text-sm font-semibold"
        >
          <CirclePlus className="w-4 h-4 mr-1.5" /> Goal
        </Button>
        <Button
          variant="secondary"
          onClick={() => onAdjustScore(idx, -1, "Score adjust")}
          size="sm"
          className="h-10 text-sm"
        >
          <Minus className="w-4 h-4 mr-1.5" /> -1
        </Button>
        <Button
          variant="outline"
          onClick={() => onEarlyStartFoul(idx)}
          size="sm"
          className="h-10 text-sm text-destructive hover:bg-destructive/10 border-destructive/30"
        >
          <AlertTriangle className="w-4 h-4 mr-1.5" /> Foul
        </Button>
      </div>

      {/* Footer: Bot Out Toggle + Timeout */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Switch
            checked={team.isBotOut}
            onCheckedChange={() => onToggleBotOut(idx)}
          />
          <span className="text-sm text-muted-foreground">Bot Out</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">TO: {team.timeoutsUsed}/1</span>
          <Button
            variant="outline"
            size="sm"
            disabled={team.timeoutsUsed >= 1 || timeoutRunning || phaseEnded}
            onClick={() => onCallTimeout(idx)}
            className="h-8 text-sm px-3"
          >
            <Timer className="w-4 h-4 mr-1" /> Timeout
          </Button>
        </div>
      </div>
    </div>
  );
}