import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Reset Password" />
            
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

                    {/* Centered Content */}
                    <div className="relative z-10 flex flex-1 items-center justify-center">
                        <div className="max-w-lg space-y-6 text-center">
                            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            
                            <h2 className="text-2xl font-bold">
                                Create new password
                            </h2>
                            <p className="text-blue-100 text-base leading-relaxed">
                                Your new password must be different from previously used passwords.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Reset Form */}
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
                            <h1 className="text-3xl font-bold text-gray-900">Set new password</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Your new password must be at least 8 characters long.
                            </p>
                        </div>

                        {/* Reset Form */}
                        <Form
                            action={update.url()}
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Hidden Fields */}
                                    <input type="hidden" name="token" value={token} />
                                    <input type="hidden" name="email" value={email} />

                                    {/* Email Display */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            disabled
                                            className="h-11 bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* New Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                            New Password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoFocus
                                            autoComplete="new-password"
                                            placeholder="Enter new password"
                                            className="h-11 bg-white"
                                        />
                                        <InputError message={errors.password} />
                                        <p className="text-xs text-gray-500">
                                            Must be at least 8 characters
                                        </p>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                                            Confirm Password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Confirm new password"
                                            className="h-11 bg-white"
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="h-11 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        Reset Password
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}