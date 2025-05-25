import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch } from '../types/branch.types';

interface BranchContextType {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  clearSelectedBranch: () => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(() => {
    const stored = localStorage.getItem('selectedBranch');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem('selectedBranch', JSON.stringify(selectedBranch));
    } else {
      localStorage.removeItem('selectedBranch');
    }
  }, [selectedBranch]);

  const clearSelectedBranch = () => {
    setSelectedBranch(null);
    localStorage.removeItem('selectedBranch');
  };

  return (
    <BranchContext.Provider value={{ selectedBranch, setSelectedBranch, clearSelectedBranch }}>
      {children}
    </BranchContext.Provider>
  );
};

export default BranchContext; 