import { FiGitBranch, FiLayers } from 'react-icons/fi';

interface ProcessHierarchyCardProps {
  hierarchy: {
    mainProcesses: number;
    subprocesses: number;
    averageSubprocessesPerProcess: number;
  };
}

export default function ProcessHierarchyCard({ hierarchy }: ProcessHierarchyCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-2">
        <FiLayers className="w-5 h-5" />
        Hierarquia de Processos
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FiLayers className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-300">Processos Principais</span>
          </div>
          <span className="text-2xl font-bold text-gray-100">{hierarchy.mainProcesses}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-2 rounded-lg">
              <FiGitBranch className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-300">Subprocessos</span>
          </div>
          <span className="text-2xl font-bold text-gray-100">{hierarchy.subprocesses}</span>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Média de Subprocessos</p>
          <p className="text-3xl font-bold text-gray-100">
            {hierarchy.averageSubprocessesPerProcess}
            <span className="text-sm text-gray-400 ml-2">por processo</span>
          </p>
        </div>
      </div>
    </div>
  );
}

