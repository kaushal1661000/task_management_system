import type { Auth } from '@/types/auth';

declare global {
    type RouteResolver = {
        (name: string, params?: unknown, absolute?: boolean, config?: unknown): string;
        (): {
            current: (name?: string, params?: unknown) => boolean;
        };
        current: (name?: string, params?: unknown) => boolean;
    };

    const route: RouteResolver;
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
