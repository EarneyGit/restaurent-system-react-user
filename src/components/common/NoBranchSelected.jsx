import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";

const NoBranchSelected = ({ selectedBranch }) => {
  const navigate = useNavigate();

  if (!selectedBranch?.id) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="flex items-center gap-3 rounded-lg border border-blue-400/30 bg-blue-500/10 px-5 py-4 text-blue-200 shadow-sm">
          <Info className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm md:text-base text-blue-100">
            Please{" "}
            <button
              onClick={() => navigate("/select-outlet")}
              className="font-medium text-yellow-700 underline underline-offset-4 hover:text-yellow-700 transition-colors"
            >
              select a branch
            </button>{" "}
            to continue.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default NoBranchSelected;
