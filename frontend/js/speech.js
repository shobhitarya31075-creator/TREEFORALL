// Browser speech helper using the Web Speech API.
window.TreeForAllSpeech = {
  speak(message, onStatus) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      onStatus?.("Speech is not supported in this browser."); return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    utterance.onstart = () => onStatus?.("Reading the tree description…");
    utterance.onend = () => onStatus?.("Finished reading.");
    utterance.onerror = () => onStatus?.("Speech could not be played.");
    window.speechSynthesis.speak(utterance);
  },
  stop() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }
};
