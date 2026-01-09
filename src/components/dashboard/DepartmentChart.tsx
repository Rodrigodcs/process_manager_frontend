interface Department {
    departmentId: string;
    departmentName: string;
    departmentColor: string;
    processCount: number;
}

interface DepartmentChartProps {
    departments: Department[];
}

const COLOR_MAP: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-500',
    gray: 'bg-gray-500',
};

export default function DepartmentChart({ departments }: DepartmentChartProps) {
    const maxCount = Math.max(...departments.map(d => d.processCount), 1);

    return (
        <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-6">Processos por Departamento</h3>
            <div className="space-y-4">
                {departments.map((dept) => {
                    const percentage = (dept.processCount / maxCount) * 100;
                    const colorClass = COLOR_MAP[dept.departmentColor] || 'bg-gray-500';

                    return (
                        <div key={dept.departmentId}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-300">{dept.departmentName}</span>
                                <span className="text-sm font-bold text-gray-100">{dept.processCount}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`${colorClass} h-3 rounded-full transition-all duration-500 ease-out`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            {departments.length === 0 && (
                <p className="text-gray-500 text-center py-8">Nenhum departamento cadastrado</p>
            )}
        </div>
    );
}

