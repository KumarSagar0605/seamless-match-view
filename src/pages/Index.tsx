import MatchController from "@/components/MatchController";
import { Header } from "@/components/Header";

const Index = () => {
  const handlePublishResult = (data: { teams: any[]; winner: number | null; log: string[] }) => {
    console.log("Match result published:", data);
    // TODO: Integrate with leaderboard
  };

  return (
    <main className="h-screen flex flex-col bg-background overflow-hidden">
      <Header leaderboardUrl="/leaderboard" />
      <div className="flex-1 min-h-0">
        <MatchController onPublishResult={handlePublishResult} />
      </div>
    </main>
  );
};

export default Index;