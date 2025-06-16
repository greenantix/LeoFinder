
import { OutreachLog } from '../types/listing';

// Since we don't have Firestore connected, we'll use localStorage for now
// In production with Supabase, this would be replaced with actual database calls

export const logOutreach = async (listingId: string, emailContent: string, method: 'email' | 'phone' | 'visit' = 'email'): Promise<void> => {
  const outreachLog: OutreachLog = {
    id: Date.now().toString(),
    listingId,
    emailSent: method === 'email',
    wasSent: true,
    timestamp: new Date().toISOString(),
    emailContent: `Method: ${method}\n${emailContent}`,
  };

  // Store in localStorage for now
  const existingLogs = JSON.parse(localStorage.getItem('outreach_logs') || '[]');
  existingLogs.push(outreachLog);
  localStorage.setItem('outreach_logs', JSON.stringify(existingLogs));
  
  console.log('Outreach logged:', outreachLog);
};

export const getOutreachLogs = (): OutreachLog[] => {
  return JSON.parse(localStorage.getItem('outreach_logs') || '[]');
};

export const getTodayEmailCount = (): number => {
  const logs = getOutreachLogs();
  const today = new Date().toDateString();
  
  return logs.filter(log => {
    const logDate = new Date(log.timestamp).toDateString();
    return logDate === today && log.wasSent;
  }).length;
};
