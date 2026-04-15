import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

type Props = {
    status?: string;
};

export default function ForgotPassword({ status }: Props) {
    return (
        <>
            <Head title="Forgot Password" />
            
            <div className="relative grid min-h-screen lg:grid-cols-2">
                {/* Left Side - Same Illustration */}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            
                            <h2 className="text-2xl font-bold">
                                Reset your password
                            </h2>
                            <p className="text-blue-100 text-base leading-relaxed">
                                No worries! Enter your email and we'll send you instructions to reset your password.
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

                        {/* Back Button */}
                        <Link 
                            href={login()} 
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to login
                        </Link>

                        {/* Header */}
                        <div className="text-center lg:text-left">
                            <h1 className="text-3xl font-bold text-gray-900">Forgot password?</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                                {status}
                            </div>
                        )}

                        {/* Reset Form */}
                        <Form
                            action={email.url()}
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            placeholder="you@company.com"
                                            className="h-11 bg-white"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="h-11 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        Send Reset Link
                                    </Button>
                                </>
                            )}
                        </Form>

                        {/* Footer */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Remember your password?{' '}
                                <Link href={login()} className="font-medium text-blue-600 hover:text-blue-700">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}