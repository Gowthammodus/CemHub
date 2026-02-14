
import React from 'react';
import type { Scenario } from '../types';
import AiAssistant from './AiAssistant';
import type { View } from '../App';

export interface AgentBot {
  id: string;
  name: string;
  category: 'Location' | 'Cost';
  description: string;
  icon: React.ReactElement<{ className?: string }>;
}

interface AiOperationalInsightProps {
  scenario: Scenario;
  setActiveView: (view: View) => void;
}

const AiOperationalInsight: React.FC<AiOperationalInsightProps> = ({ scenario }) => {
  return (
    <div className="flex-1 flex flex-col p-4 bg-[#F4F6F8] h-full overflow-hidden">
      {/* Main Chat Panel */}
      <div className="flex-1 h-full min-w-0">
        <AiAssistant scenario={scenario} pageMode={true} selectedBots={[]} />
      </div>
    </div>
  );
};

export default AiOperationalInsight;
