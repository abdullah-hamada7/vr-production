let lastSpokenText = '';
let lastSpeechTime = 0;

const getBestVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v => v.lang === 'en-US') || 
         voices.find(v => v.lang === 'en-GB') || 
         voices.find(v => v.lang.startsWith('en')) || null;
};

export const speak = (text) => {
  if (!text) return;
  
  // Truncate to max 4 words for concise clinical feedback
  const words = text.split(' ');
  const truncatedText = words.length > 4 ? words.slice(0, 4).join(' ') : text;
  
  const now = Date.now();
  if (truncatedText === lastSpokenText && now - lastSpeechTime < 4000) return;
  if (now - lastSpeechTime < 500) return;
  
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  
  const utterance = new SpeechSynthesisUtterance(truncatedText);
  utterance.lang = 'en-US';
  const voice = getBestVoice();
  if (voice) utterance.voice = voice;
  
  window.speechSynthesis.speak(utterance);
  lastSpokenText = truncatedText;
  lastSpeechTime = now;
};
