import { Trophy } from "lucide-react";

interface HeaderProps {
  leaderboardUrl?: string;
}

export function Header({ leaderboardUrl = "https://connect.cialabs.org/Robo-Leaderboard" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto max-w-full h-14 flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <span 
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-md"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            RS
          </span>
          <span 
            className="font-bold text-xl tracking-tight text-foreground"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            Robo Soccer League
          </span>
        </a>

        {/* Leaderboard Button */}
        <a
          href={leaderboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 font-semibold text-base shadow-md hover:bg-primary/90 transition-all"
        >
          <Trophy className="w-5 h-5" />
          <span>Leaderboard</span>
        </a>
      </div>
    </header>
  );
}
