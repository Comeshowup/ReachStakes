import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const SocialLogin = ({ role, mode }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // Send access token to backend
                const payload = {
                    access_token: tokenResponse.access_token,
                    role: role || 'brand' // Default to brand if somehow undefined, but AuthPage passes it.
                };

                const response = await api.post("/auth/google", payload);
                console.log("Google Login/Register Success:", response.data);

                // Save token
                localStorage.setItem("token", response.data.data.token);
                // Also save user info if needed
                localStorage.setItem("user", JSON.stringify(response.data.data.user));

                const userRole = response.data.data.user.role; // brand, creator, or admin

                if (userRole === 'creator') {
                    navigate('/creator');
                } else if (userRole === 'brand') {
                    // Check if brand has completed onboarding via backend first
                    const backendOnboardingStatus = response.data.data.user.brandProfile?.onboardingCompleted;
                    const onboardingComplete = localStorage.getItem('onboardingComplete');
                    const onboardingSkipped = localStorage.getItem('onboardingSkipped');

                    if (backendOnboardingStatus === false) {
                        navigate('/brand/onboarding');
                    } else if (backendOnboardingStatus === true || onboardingComplete || onboardingSkipped) {
                        navigate('/brand');
                    } else {
                        // First time login or onboarding not done
                        navigate('/brand/onboarding');
                    }
                } else {
                    navigate(`/${userRole}`);
                }

            } catch (error) {
                console.error("Google Auth Backend Error:", error);
                alert(error.response?.data?.message || "Google Login Failed");
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            console.log('Google Login Failed');
            setLoading(false);
        }
    });

    return (
        <>
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-transparent bg-gradient-to-r from-transparent via-white/20 to-transparent h-[1px]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-white/30 backdrop-blur-sm">
                        Or continue with
                    </span>
                </div>
            </div>

            <Button
                variant="outline"
                className="w-full h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading}
            >
                {loading ? (
                    <span className="animate-pulse">Connecting...</span>
                ) : (
                    <>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Google
                    </>
                )}
            </Button>
        </>
    );
};

export default SocialLogin;
