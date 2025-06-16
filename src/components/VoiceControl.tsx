import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  HelpCircle,
  Zap
} from 'lucide-react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface VoiceControlProps {
  onSearch?: (zipCode: string) => void;
  onFilter?: (filters: any) => void;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ onSearch, onFilter }) => {
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
    confidence,
    lastCommand
  } = useVoiceCommands(
    onSearch,
    onFilter,
    (path: string) => navigate(path)
  );

  const voiceCommands = [
    { command: '"Hey LEO"', description: 'Activate voice assistant' },
    { command: '"Search in 85001"', description: 'Search specific ZIP code' },
    { command: '"Find properties under 300k"', description: 'Filter by price' },
    { command: '"Show owner financing"', description: 'Filter creative financing' },
    { command: '"Show VA eligible"', description: 'Filter veteran properties' },
    { command: '"Go to search"', description: 'Navigate to search page' },
    { command: '"Go to settings"', description: 'Navigate to settings' },
    { command: '"Find high score properties"', description: 'Filter 80+ score' },
    { command: '"Start new hunt"', description: 'Begin property search' },
    { command: '"Help me"', description: 'Show available commands' },
    { command: '"Stop listening"', description: 'Disable voice control' }
  ];

  if (!isSupported) {
    return null; // Hide if voice recognition not supported
  }

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getConfidenceColor = () => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Voice Control Button */}
      <Button
        variant={isListening ? "default" : "outline"}
        size="sm"
        onClick={toggleVoice}
        className={`relative ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'hover:bg-blue-50'
        }`}
      >
        {isListening ? (
          <Mic className="w-4 h-4 text-white" />
        ) : (
          <MicOff className="w-4 h-4" />
        )}
        
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
        )}
      </Button>

      {/* Live Transcript Display */}
      {isListening && transcript && (
        <Card className="absolute top-12 left-0 z-50 max-w-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">Listening...</span>
              <Badge variant="outline" className={`text-xs ${getConfidenceColor()}`}>
                {Math.round(confidence * 100)}%
              </Badge>
            </div>
            <p className="text-sm text-gray-700">"{transcript}"</p>
            {lastCommand && (
              <p className="text-xs text-blue-600 mt-1">
                Last: {lastCommand}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Voice Commands Help */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              LEO Voice Commands
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Voice Control Active</p>
                <p className="text-sm text-blue-700">
                  Click the microphone and speak clearly. LEO responds to natural language.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {voiceCommands.map((cmd, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {cmd.command}
                  </code>
                  <p className="text-xs text-gray-600 mt-1">{cmd.description}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Tips for Best Results:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Speak clearly and at normal pace</li>
                <li>• Use natural language - "find properties under 300 thousand"</li>
                <li>• Wait for LEO's response before next command</li>
                <li>• Say "stop listening" to disable voice control</li>
                <li>• Works best in quiet environments</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                {isSpeechEnabled ? (
                  <Volume2 className="w-4 h-4 text-green-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm">
                  Speech responses: {isSpeechEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              >
                {isSpeechEnabled ? 'Disable Speech' : 'Enable Speech'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Indicator */}
      {isListening && (
        <Badge variant="secondary" className="text-xs animate-pulse">
          🎤 Listening
        </Badge>
      )}
    </div>
  );
};