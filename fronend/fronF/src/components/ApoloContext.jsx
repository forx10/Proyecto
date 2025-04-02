import { createContext, useState, useEffect, useContext } from "react";

export const ApoloProvider = ({ children }) => {
  const [hasGreeted, setHasGreeted] = useState(() => {
    return sessionStorage.getItem("apoloHasGreeted") === "true";
  });
  const [hasListeningGreeted, setHasListeningGreeted] = useState(() => {
    return sessionStorage.getItem("apoloHasListeningGreeted") === "true";
  });
  const [voicesReady, setVoicesReady] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("Voces disponibles:", voices);
      if (voices.length > 0) setVoicesReady(true);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text) => {
    if (!window.speechSynthesis) {
      console.warn('La síntesis de voz no está soportada');
      alert(text);
      return;
    }
  
    window.speechSynthesis.cancel();
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.volume = 1;
  
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.includes('es')) || voices[0];
    if (spanishVoice) utterance.voice = spanishVoice;
  
    utterance.onerror = (e) => {
      console.error('Error en síntesis de voz:', e);
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 300); // si hay error intenta hablar denuevo despues de 300 ms
    };
  
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 150);
  };

  const greet = () => {
    if (!hasGreeted) {
      speak(
        "¡Hola! Soy Apolo, tu asistente virtual. Haz clic en el símbolo del micrófono y di mi nombre seguido de lo que necesitas. Por ejemplo: 'Apolo, ve a perfil' o 'Apolo, ¿cuántas plantaciones hay?'"
      );
      setHasGreeted(true);
      sessionStorage.setItem("apoloHasGreeted", "true");
    }
  };

  const greetListening = () => {
    if (!hasListeningGreeted) {
      speak("Escuchando... Di 'Apolo' para activarme");
      setHasListeningGreeted(true);
      sessionStorage.setItem("apoloHasListeningGreeted", "true");
    }
  };
//Retorno del Proveedor de Contexto
  return (
    <ApoloContext.Provider value={{  // contexto global
      hasGreeted, 
      greet, 
      speak, 
      voicesReady,
      hasListeningGreeted,
      greetListening 
    }}>
      {children}
    </ApoloContext.Provider>
  );
};

const ApoloContext = createContext();
export function useApolo() {
  return useContext(ApoloContext);
}