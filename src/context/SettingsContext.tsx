import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface ContactSettings {
  phoneNumber: string;
  email: string;
  address: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  homePageBanner?: string;
}

interface SettingsContextType {
  settings: ContactSettings;
  loading: boolean;
  updateSettings: (newSettings: ContactSettings) => Promise<void>;
}

const defaultSettings: ContactSettings = {
  phoneNumber: '918000000000', // Default
  email: 'the@rmsouq.com',
  address: 'New Delhi, India',
  facebook: '',
  instagram: '',
  youtube: '',
  homePageBanner: ''
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'contact');
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as ContactSettings);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/contact');
    });

    return () => unsub();
  }, []);

  const updateSettings = async (newSettings: ContactSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'contact'), {
        ...newSettings,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/contact');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
