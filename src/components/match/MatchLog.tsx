import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface MatchLogProps {
  log: string[];
}

export function MatchLog({ log }: MatchLogProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 card-glow h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Log</span>
        </div>
        <Badge variant="outline" className="text-[9px] h-4">
          {log.length}
        </Badge>
      </div>
      
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-0.5">
          {log.length === 0 ? (
            <div className="text-[10px] text-muted-foreground py-4 text-center">
              No events yet
            </div>
          ) : (
            log.map((entry, idx) => (
              <div
                key={idx}
                className="text-[10px] font-mono text-muted-foreground py-1 px-1.5 rounded bg-muted/30 leading-tight"
              >
                {entry}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}