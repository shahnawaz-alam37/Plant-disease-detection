import { create } from 'zustand';

interface Prediction {
    id: string;
    imageUri: string;
    predictedClass: string;
    confidence: number;
    date: string;
}

interface AppState {
    isModelReady: boolean;
    setModelReady: (ready: boolean) => void;
    history: Prediction[];
    addToHistory: (prediction: Prediction) => void;
    lastPrediction: Prediction | null;
    setLastPrediction: (prediction: Prediction | null) => void;
}

export const useStore = create<AppState>((set) => ({
    isModelReady: false,
    setModelReady: (ready) => set({ isModelReady: ready }),
    history: [],
    addToHistory: (prediction) => set((state) => ({ history: [prediction, ...state.history] })),
    lastPrediction: null,
    setLastPrediction: (prediction) => set({ lastPrediction: prediction }),
}));
