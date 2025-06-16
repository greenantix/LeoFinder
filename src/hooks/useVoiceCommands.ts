import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface VoiceCommand {
  pattern: RegExp;
  action: (matches: RegExpMatchArray) => void;
  description: string;
}

interface VoiceCommandsHook {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  confidence: number;
  lastCommand: string;
}

export const useVoiceCommands = (
  onSearch?: (zipCode: string) => void,
  onFilter?: (filters: any) => void,
  onNavigate?: (page: string) => void
): VoiceCommandsHook => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Voice commands configuration
  const commands: VoiceCommand[] = [
    {
      pattern: /hey leo|hi leo|leo/i,
      action: () => {
        speak("I'm here! What can I help you find?");
        setLastCommand('Activated LEO');
      },
      description: 'Activate LEO'
    },
    {
      pattern: /search (?:in )?(?:zip code )?(\d{5})/i,
      action: (matches) => {
        const zipCode = matches[1];
        onSearch?.(zipCode);
        speak(`Searching for properties in ${zipCode}`);
        setLastCommand(`Search in ${zipCode}`);
      },
      description: 'Search in specific ZIP code'
    },
    {
      pattern: /find (?:properties|homes|houses) (?:under|below) (\d+)(?:k|thousand)?/i,
      action: (matches) => {
        const price = parseInt(matches[1]) * (matches[0].includes('k') || matches[0].includes('thousand') ? 1000 : 1);
        onFilter?.({ maxPrice: price });
        speak(`Finding properties under $${price.toLocaleString()}`);
        setLastCommand(`Filter under $${price.toLocaleString()}`);
      },
      description: 'Filter by price'
    },
    {
      pattern: /show (?:me )?(?:only )?(?:properties with )?owner financ/i,
      action: () => {
        onFilter?.({ creativeFinancing: true });
        speak('Showing only properties with owner financing');
        setLastCommand('Filter owner financing');
      },
      description: 'Filter for owner financing'
    },
    {
      pattern: /show (?:me )?(?:only )?(?:va|veteran) (?:eligible|approved)/i,
      action: () => {
        onFilter?.({ vaEligible: true });
        speak('Showing only VA eligible properties');
        setLastCommand('Filter VA eligible');
      },
      description: 'Filter for VA eligible properties'
    },
    {
      pattern: /(?:go to|open|show) (?:the )?(?:search|search page)/i,
      action: () => {
        onNavigate?.('/search');
        speak('Opening search page');
        setLastCommand('Navigate to search');
      },
      description: 'Navigate to search page'
    },
    {
      pattern: /(?:go to|open|show) (?:the )?(?:settings|preferences)/i,
      action: () => {
        onNavigate?.('/settings');
        speak('Opening settings page');
        setLastCommand('Navigate to settings');
      },
      description: 'Navigate to settings'
    },
    {
      pattern: /(?:go to|show) (?:the )?(?:home|main|dashboard)/i,
      action: () => {
        onNavigate?.('/');
        speak('Going to home page');
        setLastCommand('Navigate to home');
      },
      description: 'Navigate to home'
    },
    {
      pattern: /find (?:high|top) (?:score|scoring|rated) properties/i,
      action: () => {
        onFilter?.({ minScore: 80 });
        speak('Showing high scoring properties, 80 points and above');
        setLastCommand('Filter high score properties');
      },
      description: 'Filter for high scoring properties'
    },
    {
      pattern: /start (?:a )?new hunt|hunt for properties/i,
      action: () => {
        onSearch?.('');
        speak('Starting a new property hunt! Let me find the best opportunities.');
        setLastCommand('Start new hunt');
      },
      description: 'Start new property hunt'
    },
    {
      pattern: /what (?:can you|do you) do|help me|commands/i,
      action: () => {
        speak('I can search properties by ZIP code, filter by price or financing, navigate pages, and much more. Try saying "Hey LEO, search in 85001" or "show me properties with owner financing"');
        setLastCommand('Show help');
      },
      description: 'Show available commands'
    },
    {
      pattern: /stop listening|stop|quiet|silence/i,
      action: () => {
        speak('Voice commands disabled. Tap the microphone to reactivate.');
        setLastCommand('Stop listening');
        setTimeout(() => stopListening(), 1000);
      },
      description: 'Stop voice recognition'
    }
  ];

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        console.log('🎤 Voice recognition started');
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 Voice recognition ended');
      };

      recognition.onerror = (event) => {
        console.error('🎤 Voice recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          toast.info('🎤 No speech detected. Try speaking clearly.');
        } else if (event.error === 'not-allowed') {
          toast.error('🎤 Microphone access denied. Please enable in browser settings.');
        }
      };

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const result = event.results[last];
        const currentTranscript = result[0].transcript;
        const currentConfidence = result[0].confidence;

        setTranscript(currentTranscript);
        setConfidence(currentConfidence);

        // Only process final results with good confidence
        if (result.isFinal && currentConfidence > 0.5) {
          console.log('🎤 Processing command:', currentTranscript);
          processVoiceCommand(currentTranscript);
          
          // Auto-stop after processing command
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }, 2000);
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('🎤 Speech Recognition not supported');
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const processVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    for (const command of commands) {
      const matches = lowerText.match(command.pattern);
      if (matches) {
        console.log('🎯 Command matched:', command.description);
        command.action(matches);
        toast.success(`🎤 ${command.description}`);
        return;
      }
    }

    // No command matched
    console.log('❓ No command matched for:', text);
    speak("I didn't understand that command. Try saying 'Hey LEO' or 'help me' to see what I can do.");
    setLastCommand('Command not recognized');
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Try to use a more natural voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Alex') || 
        voice.name.includes('Samantha')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      try {
        recognitionRef.current.start();
        toast.info('🎤 LEO is listening... Say "Hey LEO" to start');
      } catch (error) {
        console.error('🎤 Failed to start recognition:', error);
        toast.error('🎤 Failed to start voice recognition');
      }
    } else {
      toast.error('🎤 Voice recognition not supported in this browser');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setTranscript('');
    setConfidence(0);
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
    confidence,
    lastCommand
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}