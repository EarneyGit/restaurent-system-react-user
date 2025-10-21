import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "@/config/axios.config";
import { BRANCH_ENDPOINTS } from "@/config/api.config";
import { Branch } from "../types/branch.types";
import { toast } from "sonner";

interface BranchContextType {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  clearSelectedBranch: () => void;
  branches: Branch[];
  isLoading: boolean;
  fetchBranches: (silent: boolean) => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
};

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(() => {
    const stored = localStorage.getItem("selectedBranch");
    return stored ? JSON.parse(stored) : null;
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem("selectedBranch", JSON.stringify(selectedBranch));
    } else {
      localStorage.removeItem("selectedBranch");
    }
  }, [selectedBranch]);

  const fetchBranches = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      const response = await axios.get(BRANCH_ENDPOINTS.GET_ALL_BRANCHES);
      if (response.data?.success) {
        setBranches(response.data.data);
        if (selectedBranch) {
          const selectedBranchIndex = response.data.data.findIndex(
            (branch: Branch) => branch.id === selectedBranch.id
          );
          if (selectedBranchIndex !== -1) {
            setSelectedBranch(response.data.data[selectedBranchIndex]);
            localStorage.setItem(
              "selectedBranch",
              JSON.stringify(response.data.data[selectedBranchIndex])
            );
          }
        }
      } else {
        if (!silent) {
          toast.error("Failed to load branches");
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      if (!silent) {
        toast.error("Failed to load branches");
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const clearSelectedBranch = () => {
    setSelectedBranch(null);
    localStorage.removeItem("selectedBranch");
  };

  return (
    <BranchContext.Provider
      value={{
        selectedBranch,
        setSelectedBranch,
        clearSelectedBranch,
        branches,
        isLoading,
        fetchBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export default BranchContext;
