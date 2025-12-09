import MatchController from "@/components/MatchController";

const Index = () => {
  const handlePublishResult = (data: { teams: any[]; winner: number | null; log: string[] }) => {
    console.log("Match result published:", data);
    // TODO: Integrate with leaderboard
  };

  return (
    <main className="min-h-screen bg-background">
      <MatchController onPublishResult={handlePublishResult} />
    </main>
  );
};

export default Index;