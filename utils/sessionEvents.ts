
type Listener = () => void;
let sessionListeners: Listener[] = [];

export const subscribeToSessionChanges = (listener: Listener) => {
  sessionListeners.push(listener);
  return () => {
    sessionListeners = sessionListeners.filter(l => l !== listener);
  };
};

export const notifySessionChange = () => {
  sessionListeners.forEach(l => l());
};
