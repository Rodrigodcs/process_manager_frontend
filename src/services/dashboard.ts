import api from '@/lib/axios';

export interface DashboardStats {
    overview: {
        totalUsers: number;
        totalDepartments: number;
        totalProcesses: number;
        totalSubprocesses: number;
        totalPeople: number;
        totalTools: number;
        totalDocuments: number;
    };
    processesByDepartment: {
        departmentId: string;
        departmentName: string;
        departmentColor: string;
        processCount: number;
    }[];
    topDepartments: {
        departmentId: string;
        departmentName: string;
        departmentColor: string;
        processCount: number;
    }[];
    recentActivity: {
        processesCreatedLast7Days: number;
        processesCreatedLast30Days: number;
        departmentsCreatedLast30Days: number;
    };
    processHierarchy: {
        mainProcesses: number;
        subprocesses: number;
        averageSubprocessesPerProcess: number;
    };
}

export const dashboardService = {
    async getStats(): Promise<DashboardStats> {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },
};

