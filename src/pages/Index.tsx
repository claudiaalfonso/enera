import { motion } from "framer-motion";
import DemoHeader from "@/components/demo/DemoHeader";
import SystemPanel from "@/components/demo/SystemPanel";
import ConversationPanel from "@/components/demo/ConversationPanel";
import { useDemoSequence } from "@/hooks/useDemoSequence";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const {
    messages,
    steps,
    currentStatus,
    isProcessing,
    showConfirmation,
    isComplete,
    reset
  } = useDemoSequence(true);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* SEO */}
      <title>Amelia Voice AI Demo | Enera</title>
      <meta name="description" content="Experience Amelia, Enera's intelligent Voice AI that resolves EV charging issues in real-time. Enterprise-grade support automation." />

      <DemoHeader />

      {/* Main Content */}
      <main className="flex-1 flex min-h-0">
        {/* Left Panel - System View (60%) */}
        <motion.div
          className="w-[60%] border-r border-border bg-card flex-shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SystemPanel
            currentStatus={currentStatus}
            isProcessing={isProcessing}
            steps={steps}
            showConfirmation={showConfirmation}
          />
        </motion.div>

        {/* Right Panel - Conversation (40%) */}
        <motion.div
          className="w-[40%] bg-enera-surface-elevated flex-shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ConversationPanel messages={messages} />
        </motion.div>
      </main>

      {/* Footer with replay button */}
      {isComplete && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="gap-2 bg-card/90 backdrop-blur-sm shadow-enera-elevated border-border/50 hover:bg-card"
          >
            <RotateCcw className="w-4 h-4" />
            Replay demo
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
