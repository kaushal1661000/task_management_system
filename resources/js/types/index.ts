export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { User } from './auth';

export interface TaskUser {
	id: string;
	name: string;
	email: string;
	role: 'admin' | 'employee' | 'client';
	emailVerifiedAt?: string;
	email_verified_at?: string;
	createdAt: string;
	created_at?: string;
	updatedAt: string;
	updated_at?: string;
	clients?: Client[];
	assignedTasks?: Task[];
	projects?: Project[];
}

export interface Client {
	id: string;
	userId: string;
	user_id?: string;
	companyName?: string;
	company_name?: string;
	phone?: string;
	address?: string;
	createdAt: string;
	created_at?: string;
	updatedAt: string;
	updated_at?: string;
	user?: TaskUser;
	projects?: Project[];
	projectsCount?: number;
}

export interface Project {
	id: string;
	name: string;
	description?: string;
	clientId: string;
	status: 'active' | 'paused' | 'completed' | 'planning';
	startDate?: string;
	endDate?: string;
	budget?: number;
	createdAt: string;
	updatedAt: string;
	client?: Client;
	tasks?: Task[];
	members?: ProjectMember[];
	tasksCount?: number;
	membersCount?: number;
}

export interface Task {
	id: string;
	title: string;
	description?: string;
	projectId: string;
	assignedTo: string;
	reportingTo?: string;
	status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
	priority?: 'low' | 'medium' | 'high' | 'urgent';
	deadline?: string;
	createdAt: string;
	updatedAt: string;
	project?: Project;
	assignee?: TaskUser;
	reporter?: TaskUser;
}

export interface ProjectMember {
	id: string;
	projectId: string;
	userId: string;
	role?: string;
	createdAt: string;
	updatedAt: string;
	user?: TaskUser;
	project?: Project;
	name?: string;
	email?: string;
}

export interface DashboardStats {
	totalTasks?: number;
	totalProjects?: number;
	totalClients?: number;
	totalEmployees?: number;
	taskGrowthPercent?: number;
	completionRateDelta?: number;
	newProjectsThisMonth?: number;
	joinedRecentlyCount?: number;
	pendingTasks?: number;
	inProgressTasks?: number;
	completedTasks?: number;
	overdueTasks?: number;
	activeProjects?: number;
	completedProjects?: number;
}

export interface Activity {
	id: string;
	type: 'task' | 'project' | 'client' | 'user';
	title: string;
	description: string;
	project?: string;
	status?: Task['status'] | Project['status'];
	deadline?: string;
	createdAt: string;
	created_at?: string;
}

export interface PaginatedData<T> {
	data: T[];
	links:
		| {
				first?: string | null;
				last?: string | null;
				prev?: string | null;
				next?: string | null;
		  }
		| Array<{
				url: string | null;
				label: string;
				active: boolean;
		  }>;
	meta?: {
		currentPage?: number;
		from?: number | null;
		lastPage?: number;
		path?: string;
		perPage?: number;
		to?: number | null;
		total?: number;
	};
	from?: number | null;
	to?: number | null;
	total?: number;
	current_page?: number;
	last_page?: number;
	per_page?: number;
	prev_page_url?: string | null;
	next_page_url?: string | null;
	prevPageUrl?: string | null;
	nextPageUrl?: string | null;
}

export interface PageProps {
	auth: {
		user: User;
	};
	unreadNotificationCount?: number;
	name: string;
	sidebarOpen: boolean;
	message?: {
		status: 'success' | 'error' | 'delete';
		description: string;
	};
	[key: string]: unknown;
}

export interface DashboardPageProps extends PageProps {
	stats: DashboardStats;
	recentActivities: Activity[];
	userRole: string;
}

export interface UsersIndexProps extends PageProps {
	users: PaginatedData<TaskUser>;
}

export interface ClientsIndexProps extends PageProps {
	clients: PaginatedData<Client>;
	filters?: {
		search?: string;
	};
}

export interface ProjectsIndexProps extends PageProps {
	projects: PaginatedData<Project>;
	filters?: {
		search?: string;
	};
	clients: Client[];
	employees: User[];
}

export interface TasksIndexProps extends PageProps {
	tasks: PaginatedData<Task>;
	filters?: {
		search?: string;
		status?: string;
	};
	createProjects: Project[];
	admins: Array<Pick<User, 'id' | 'name'>>;
	projectMembersByProject: Record<string, Array<Pick<User, 'id' | 'name'>>>;
	editProjects: Project[];
	employees: Array<Pick<User, 'id' | 'name'>>;
}
