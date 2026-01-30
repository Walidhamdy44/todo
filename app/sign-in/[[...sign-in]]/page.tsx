import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
    return (
        <div className="flex min-h-screen bg-[#0a0a0b]">
            {/* Left Side: Illustration/Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <Image
                    src="/assets/bg.webp"
                    alt="ProductiveAI Background"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Overlay for stats or effects if needed */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0b]" />

                {/* Floating Stat Example (matching the design) */}
                <div className="absolute bottom-20 left-12 space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 w-90">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-blue-500" />
                        </div>
                        <div>
                            <p className="text-zinc-400 text-xs font-medium">Dear I,</p>
                            <p className="text-white font-medium">Keep learning , Improving , Growing</p>
                        </div>
                    </div>
                    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 w-90 ml-8">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-emerald-500" />
                        </div>
                        <div>
                            <p className="text-zinc-400 text-xs font-medium">FOCUS and ,</p>
                            <p className="text-white font-medium">Never Do tomorrow what you can do today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
                <div className="w-full max-w-[400px] z-10">
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-4xl font-bold text-white mb-2">Welcome to ProductiveAI</h1>
                        <p className="text-zinc-500">Sign in to your account</p>
                    </div>

                    {/* Auth Toggle (matching the image design) */}
                    <div className="flex bg-[#161618] rounded-xl p-1 mb-8">
                        <Link
                            href="/sign-up"
                            className="flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all duration-200 text-zinc-500 hover:text-zinc-300"
                        >
                            SIGN UP
                        </Link>
                        <Link
                            href="/sign-in"
                            className="flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all duration-200 bg-zinc-800 text-white shadow-lg shadow-black/20"
                        >
                            LOG IN
                        </Link>
                    </div>

                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "w-full mx-auto",
                                card: "bg-transparent shadow-none border-none p-0 w-full",
                                header: "hidden", // Hide Clerk's default header
                                footer: "hidden", // Hide Clerk's branding footer
                                formButtonPrimary:
                                    "bg-[#00d084] hover:bg-[#00b070] text-black font-bold py-3 rounded-xl normal-case transition-all duration-200 mt-2",
                                formFieldInput:
                                    "bg-[#161618] border-zinc-800 text-white focus:border-[#00d084]/50 focus:ring-0 rounded-xl h-12 transition-all duration-200",
                                formFieldLabel: "text-zinc-400 font-medium mb-1.5",
                                socialButtonsBlockButton:
                                    "bg-[#161618] border-zinc-800 hover:bg-[#27272a] text-white rounded-xl h-12 transition-all duration-200",
                                socialButtonsBlockButtonText: "text-white font-medium",
                                dividerLine: "bg-zinc-800",
                                dividerText: "text-zinc-500 text-xs uppercase tracking-widest px-4",
                                formFieldAction: "text-[#00d084] hover:text-[#00b070] font-medium text-sm transition-all duration-200",
                                identityPreviewText: "text-white",
                                identityPreviewEditButtonIcon: "text-[#00d084]",
                                formFieldErrorText: "text-rose-500 text-xs mt-1",
                            },
                            layout: {
                                helpPageUrl: "https://clerk.com",
                                logoPlacement: "none",
                                showOptionalFields: false,
                            }
                        }}
                        fallbackRedirectUrl="/"
                        signUpUrl="/sign-up"
                    />

                    <div className="mt-8 text-center text-sm text-zinc-500">
                        Don't have an account?{" "}
                        <a href="/sign-up" className="text-[#00d084] hover:underline font-medium">
                            Join now
                        </a>
                    </div>
                </div>

                {/* Background glow effects */}
                <div className="absolute top-1/4 right-0 w-64 h-64 bg-[#00d084]/5 blur-[100px] rounded-full -z-10" />
                <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -z-10" />
            </div>
        </div>
    );
}
