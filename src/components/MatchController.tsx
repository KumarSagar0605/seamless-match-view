import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Phase,
  PhaseType,
  HALF_PLAY_SECONDS,
  HALVES,
  HALF_TIME_BREAK_SECONDS,
  TIMEOUT_TECHNICAL_THRESHOLD,
  TIMEOUT_DQ_THRESHOLD,
} from "@/utils/constants";
import { fmt } from "@/utils/helpers";
import { TeamCard } from "./match/TeamCard";
import { ClockPanel } from "./match/ClockPanel";
import { StoppagePanel } from "./match/StoppagePanel";
import { MatchLog } from "./match/MatchLog";

interface Team {
  name: string;
  score: number;
  timeoutsUsed: number;
  isBotOut: boolean;
  disqualified: boolean;
}

interface MatchControllerProps {
  onPublishResult?: (data: { teams: Team[]; winner: number | null; log: string[] }) => void;
}

export default function MatchController({ onPublishResult }: MatchControllerProps) {
  // State
  const [phase, setPhase] = useState<PhaseType>(Phase.PRE_MATCH);
  const [halfIndex, setHalfIndex] = useState(0);
  const [halfRemaining, setHalfRemaining] = useState(HALF_PLAY_SECONDS);
  const [teams, setTeams] = useState<Team[]>([
    { name: "Team A", score: 0, timeoutsUsed: 0, isBotOut: false, disqualified: false },
    { name: "Team B", score: 0, timeoutsUsed: 0, isBotOut: false, disqualified: false },
  ]);
  const [timeout, setTimeoutState] = useState({ running: false, forTeam: null as number | null, elapsed: 0 });
  const [stoppage, setStoppage] = useState({ running: false, reason: null as string | null, elapsed: 0 });
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [htRemaining, setHtRemaining] = useState(HALF_TIME_BREAK_SECONDS);

  // Log helper
  const pushLog = useCallback((entry: string) => {
    setLog((l) => [`${new Date().toLocaleTimeString()} — ${entry}`, ...l]);
  }, []);

  // Adjust score
  const adjustScore = useCallback((teamIdx: number, delta: number, reason: string) => {
    setTeams((ts) => {
      const copy = [...ts];
      const newScore = Math.max(0, (copy[teamIdx].score || 0) + delta);
      copy[teamIdx] = { ...copy[teamIdx], score: newScore };
      return copy;
    });
    if (reason) {
      pushLog(`${teams[teamIdx].name} ${delta > 0 ? "+" + delta : delta} (${reason})`);
    }
  }, [teams, pushLog]);

  const goal = useCallback((teamIdx: number) => {
    adjustScore(teamIdx, +1, "Goal – ball crossed goal plane");
  }, [adjustScore]);

  const earlyStartFoul = useCallback((teamIdx: number) => {
    adjustScore(teamIdx, -1, "Early Start Foul");
  }, [adjustScore]);

  const toggleBotOut = useCallback((teamIdx: number) => {
    setTeams((ts) => {
      const copy = [...ts];
      copy[teamIdx] = { ...copy[teamIdx], isBotOut: !copy[teamIdx].isBotOut };
      return copy;
    });
    pushLog(`${teams[teamIdx].name} bot ${teams[teamIdx].isBotOut ? "returned" : "declared BOT OUT"}`);
  }, [teams, pushLog]);

  const callTimeout = useCallback((teamIdx: number) => {
    if (timeout.running) return;
    if (teams[teamIdx].timeoutsUsed >= 1) return;
    setRunning(false);
    setTimeoutState({ running: true, forTeam: teamIdx, elapsed: 0 });
    setTeams((ts) => {
      const copy = [...ts];
      copy[teamIdx] = { ...copy[teamIdx], timeoutsUsed: copy[teamIdx].timeoutsUsed + 1 };
      return copy;
    });
    pushLog(`${teams[teamIdx].name} called TIMEOUT`);
  }, [timeout.running, teams, pushLog]);

  const endTimeout = useCallback(() => {
    if (!timeout.running) return;
    pushLog(`Timeout ended at ${fmt(timeout.elapsed)}`);
    setTimeoutState({ running: false, forTeam: null, elapsed: 0 });
  }, [timeout, pushLog]);

  const startStoppage = useCallback((reason: string) => {
    if (stoppage.running) return;
    setRunning(false);
    setStoppage({ running: true, reason, elapsed: 0 });
    const label =
      reason === "OUT_OF_BOUNDS"
        ? "Out of Bounds"
        : reason === "NO_PLAY"
          ? "No Play >10s"
          : "Bots Stuck >10s";
    pushLog(`Stoppage: ${label}`);
  }, [stoppage.running, pushLog]);

  const endStoppage = useCallback(() => {
    if (!stoppage.running) return;
    pushLog(`Stoppage ended at ${fmt(stoppage.elapsed)} — Restart from designated spot`);
    setStoppage({ running: false, reason: null, elapsed: 0 });
  }, [stoppage, pushLog]);

  const handleEndHalf = useCallback(() => {
    setPhase(() => {
      if (halfIndex === 0) {
        setRunning(false);
        pushLog("End of First Half — Half-time interval begins (1:30)");
        return Phase.HALF_TIME;
      } else {
        setRunning(false);
        pushLog("Full time reached — Match ended");
        return Phase.ENDED;
      }
    });
  }, [halfIndex, pushLog]);

  const startMatch = useCallback(() => {
    if (phase !== Phase.PRE_MATCH) return;
    setPhase(Phase.FIRST_HALF);
    setRunning(true);
    setHalfIndex(0);
    setHalfRemaining(HALF_PLAY_SECONDS);
    pushLog("Match started — First Half");
  }, [phase, pushLog]);

  const beginSecondHalf = useCallback(() => {
    setPhase(Phase.SECOND_HALF);
    setRunning(true);
    setHalfIndex(1);
    setHalfRemaining(HALF_PLAY_SECONDS);
    pushLog("Second Half started");
  }, [pushLog]);

  const toggleClock = useCallback(() => {
    if (phase === Phase.ENDED) return;
    setRunning((r) => !r);
  }, [phase]);

  const resetMatch = useCallback(() => {
    setPhase(Phase.PRE_MATCH);
    setHalfIndex(0);
    setHalfRemaining(HALF_PLAY_SECONDS);
    setTeams([
      { name: "Team A", score: 0, timeoutsUsed: 0, isBotOut: false, disqualified: false },
      { name: "Team B", score: 0, timeoutsUsed: 0, isBotOut: false, disqualified: false },
    ]);
    setTimeoutState({ running: false, forTeam: null, elapsed: 0 });
    setStoppage({ running: false, reason: null, elapsed: 0 });
    setRunning(false);
    setLog([]);
    setHtRemaining(HALF_TIME_BREAK_SECONDS);
  }, []);

  // Totals
  const totalPlayed = useMemo(() => {
    return halfIndex * HALF_PLAY_SECONDS + (HALF_PLAY_SECONDS - halfRemaining);
  }, [halfIndex, halfRemaining]);

  const totalRemaining = HALVES * HALF_PLAY_SECONDS - totalPlayed;

  const winner = useMemo(() => {
    if (phase !== Phase.ENDED) return null;
    if (teams[0].disqualified && !teams[1].disqualified) return 1;
    if (teams[1].disqualified && !teams[0].disqualified) return 0;
    if (teams[0].score > teams[1].score) return 0;
    if (teams[1].score > teams[0].score) return 1;
    return null;
  }, [phase, teams]);

  const handlePublish = useCallback(() => {
    if (phase !== Phase.ENDED) {
      alert("End the match first.");
      return;
    }
    if (onPublishResult) {
      onPublishResult({ teams, winner, log });
    }
  }, [phase, onPublishResult, teams, winner, log]);

  const clockDisabled = timeout.running || stoppage.running || phase === Phase.HALF_TIME || phase === Phase.ENDED;

  // Effects for timers
  useEffect(() => {
    if (!running) return;
    if (phase !== Phase.FIRST_HALF && phase !== Phase.SECOND_HALF) return;
    const id = setInterval(() => {
      setHalfRemaining((r) => {
        if (r <= 1) {
          handleEndHalf();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase, handleEndHalf]);

  useEffect(() => {
    if (!timeout.running) return;
    const id = setInterval(() => {
      setTimeoutState((prev) => {
        if (!prev.running) return prev;
        const newElapsed = prev.elapsed + 1;

        if (newElapsed === TIMEOUT_TECHNICAL_THRESHOLD && prev.forTeam !== null) {
          setTeams((ts) => {
            const copy = [...ts];
            const opp = prev.forTeam === 0 ? 1 : 0;
            copy[opp] = { ...copy[opp], score: copy[opp].score + 1 };
            pushLog(`Timeout exceeded 0:${TIMEOUT_TECHNICAL_THRESHOLD}. ${copy[opp]?.name} awarded +1 technical point.`);
            return copy;
          });
        }

        if (newElapsed >= TIMEOUT_DQ_THRESHOLD && prev.forTeam !== null) {
          setTeams((ts) => {
            const copy = [...ts];
            if (!copy[prev.forTeam!].disqualified) {
              copy[prev.forTeam!] = { ...copy[prev.forTeam!], disqualified: true };
              pushLog(`Timeout reached ${fmt(newElapsed)}. ${copy[prev.forTeam!]?.name} DISQUALIFIED.`);
            }
            return copy;
          });
          return { running: false, forTeam: null, elapsed: 0 };
        }

        return { ...prev, elapsed: newElapsed };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeout.running, pushLog]);

  useEffect(() => {
    if (!stoppage.running) return;
    const id = setInterval(() => setStoppage((s) => ({ ...s, elapsed: s.elapsed + 1 })), 1000);
    return () => clearInterval(id);
  }, [stoppage.running]);

  useEffect(() => {
    if (phase !== Phase.HALF_TIME) return;
    if (htRemaining <= 0) return;
    const id = setInterval(() => setHtRemaining((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [phase, htRemaining]);

  return (
    <div className="h-screen w-full p-4 flex flex-col gap-4 overflow-hidden">
      {/* Top Section: Teams + Clock */}
      <div className="flex-1 grid grid-cols-[1fr_280px] gap-4 min-h-0">
        {/* Teams Container */}
        <div className="grid grid-cols-2 gap-4">
          <TeamCard
            team={teams[0]}
            idx={0}
            onNameChange={(idx, val) => setTeams((ts) => { const c = [...ts]; c[idx] = { ...c[idx], name: val }; return c; })}
            onGoal={goal}
            onAdjustScore={adjustScore}
            onEarlyStartFoul={earlyStartFoul}
            onToggleBotOut={toggleBotOut}
            onCallTimeout={callTimeout}
            timeoutRunning={timeout.running}
            phaseEnded={phase === Phase.ENDED}
            isLeft={true}
          />
          <TeamCard
            team={teams[1]}
            idx={1}
            onNameChange={(idx, val) => setTeams((ts) => { const c = [...ts]; c[idx] = { ...c[idx], name: val }; return c; })}
            onGoal={goal}
            onAdjustScore={adjustScore}
            onEarlyStartFoul={earlyStartFoul}
            onToggleBotOut={toggleBotOut}
            onCallTimeout={callTimeout}
            timeoutRunning={timeout.running}
            phaseEnded={phase === Phase.ENDED}
            isLeft={false}
          />
        </div>

        {/* Right Sidebar: Clock + Log */}
        <div className="flex flex-col gap-4 min-h-0">
          <ClockPanel
            phase={phase}
            halfIndex={halfIndex}
            halfRemaining={halfRemaining}
            htRemaining={htRemaining}
            running={running}
            toggleClock={toggleClock}
            startMatch={startMatch}
            beginSecondHalf={beginSecondHalf}
            resetMatch={resetMatch}
            clockDisabled={clockDisabled}
            winner={winner}
            teams={teams}
            handlePublish={handlePublish}
            totalPlayed={totalPlayed}
            totalRemaining={totalRemaining}
          />
          <div className="flex-1 min-h-0">
            <MatchLog log={log} />
          </div>
        </div>
      </div>

      {/* Bottom Section: Stoppage Panel */}
      <div className="shrink-0">
        <StoppagePanel
          timeout={timeout}
          stoppage={stoppage}
          teams={teams}
          endTimeout={endTimeout}
          startStoppage={startStoppage}
          endStoppage={endStoppage}
          phaseEnded={phase === Phase.ENDED}
          adjustScore={adjustScore}
        />
      </div>
    </div>
  );
}