
import React from 'react';
import { CheckCircle, AlertCircle, XCircle, HelpCircle } from 'lucide-react';
import { Listing } from '../types/listing';

interface ClaudeInsightsProps {
  insights?: Listing['claudeInsights'];
}

export const ClaudeInsights: React.FC<ClaudeInsightsProps> = ({ insights }) => {
  if (!insights) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-600">Claude insights not available for this listing.</p>
      </div>
    );
  }

  const getStatusIcon = (status: 'yes' | 'maybe' | 'no') => {
    switch (status) {
      case 'yes':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'maybe':
        return <HelpCircle className="w-4 h-4 text-yellow-600" />;
      case 'no':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusText = (status: 'yes' | 'maybe' | 'no') => {
    switch (status) {
      case 'yes':
        return 'text-green-800';
      case 'maybe':
        return 'text-yellow-800';
      case 'no':
        return 'text-red-800';
    }
  };

  const insights_data = [
    {
      question: "Can I buy this with no money down?",
      status: insights.noMoneyDown,
      key: 'noMoneyDown'
    },
    {
      question: "Is the seller open to flexible terms?",
      status: insights.flexibleTerms,
      key: 'flexibleTerms'
    },
    {
      question: "Is this location dog-friendly?",
      status: insights.dogFriendly,
      key: 'dogFriendly'
    }
  ];

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
        🤖 Claude Analysis
      </h4>
      <div className="space-y-3">
        {insights_data.map((item) => (
          <div key={item.key} className="flex items-start gap-3">
            {getStatusIcon(item.status)}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.question}</p>
              <p className={`text-xs ${getStatusText(item.status)} capitalize`}>
                {item.status === 'yes' ? 'Likely' : item.status === 'maybe' ? 'Possible' : 'Unlikely'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
