import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status}: Props) {
    return (
        <>
            <Head title="Log in" />
            
            <div className="relative grid min-h-screen lg:grid-cols-2">
                {/* Left Side - Illustration */}
                <div className="relative hidden bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 text-white lg:flex lg:flex-col">
                    <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
                    
                    {/* Logo */}
                    <Link href="/" className="relative z-20 flex items-center text-2xl font-bold">
                        <svg className="mr-3 h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        TaskFlow
                    </Link>

                    {/* Illustration Center */}
                    <div className="relative z-10 flex flex-1 items-center justify-center">
                        <div className="max-w-lg space-y-6 text-center">
                            {/* Main Illustration */}
                            <div className="relative mx-auto mb-8 h-80 w-80">
                                {/* Phone mockup */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                                    <div className="relative h-72 w-44 rounded-3xl border-4 border-white/20 bg-linear-to-br from-blue-500 to-blue-600 p-4 shadow-2xl">
                                        {/* Phone screen */}
                                        <div className="h-full w-full rounded-2xl bg-white/80 backdrop-blur-sm p-3">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="h-4 w-4 rounded-full bg-blue-400" />
                                                <div className="h-4 w-4 rounded-full bg-blue-400" />
                                            </div>
                                            {/* User avatar */}
                                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-white/30 border-2 border-white/50" />
                                            {/* Input fields */}
                                            <div className="space-y-2">
                                                <div className="h-8 w-full rounded-lg bg-blue-400" />
                                                <div className="h-8 w-full rounded-lg bg-blue-400" />
                                                <div className="h-8 w-full rounded-lg bg-blue-400 mt-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Character */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 transform">
                                    <div className="relative">
                                        {/* Person illustration simplified */}
                                        <div className="h-32 w-24">
                                            {/* Head */}
                                            <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 border-2 border-white/30" />
                                            {/* Body */}
                                            <div className="mx-auto mt-1 h-16 w-16 rounded-t-full bg-blue-400" />
                                            {/* Legs */}
                                            <div className="flex justify-center gap-1">
                                                <div className="h-8 w-3 bg-gray-600 rounded-b-full" />
                                                <div className="h-8 w-3 bg-gray-600 rounded-b-full" />
                                            </div>
                                        </div>
                                        {/* Chat bubble */}
                                        <div className="absolute -right-8 top-4 h-6 w-12 rounded-full bg-white/20 border border-white/40" />
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute left-0 bottom-10">
                                    <div className="h-20 w-16 relative">
                                        {/* Plant pot */}
                                        <div className="absolute bottom-0 h-8 w-16 bg-blue-400 rounded-t-lg" />
                                        {/* Leaves */}
                                        <div className="absolute bottom-8 left-2 h-6 w-6 rounded-full bg-green-400" />
                                        <div className="absolute bottom-10 left-6 h-6 w-6 rounded-full bg-green-400" />
                                    </div>
                                </div>

                                {/* Filing cabinet */}
                                <div className="absolute right-4 bottom-4 h-24 w-20 bg-blue-300 rounded-lg">
                                    <div className="mt-4 space-y-2 px-2">
                                        <div className="h-3 w-full rounded bg-blue-400" />
                                        <div className="h-3 w-full rounded bg-blue-400" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold">
                                Turn plans into action
                            </h2>
                            <p className="text-blue-100 text-base leading-relaxed">
                                Manage tasks, track projects, and collaborate with your team efficiently. 
                                Everything you need in one secure, easy-to-use platform.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex items-center justify-center p-8 bg-gray-50">
                    <div className="w-full max-w-md space-y-8">
                        {/* Mobile Logo */}
                        <Link href="/" className="flex items-center justify-center text-2xl font-bold text-gray-900 lg:hidden mb-8">
                            <svg className="mr-3 h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            TaskFlow
                        </Link>

                        {/* Header */}
                        <div className="text-center lg:text-left">
                            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Sign in to your account
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <Form
                            action={store.url()}
                            method="post"
                            resetOnSuccess={['password']}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="text"
                                            name="email"
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="you@company.com"
                                            className="h-11 bg-white"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                                Password
                                            </Label>
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            className="h-11 bg-white"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-11 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                        tabIndex={5}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        SIGN IN
                                    </Button>
                                </>
                            )}
                        </Form>

                        {/* Footer Note */}
                        <p className="text-center text-xs text-gray-500 mt-8">
                             Contact your administrator for access.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}