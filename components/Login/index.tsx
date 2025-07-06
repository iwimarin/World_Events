"use client";
import { WalletAuthInput } from "@worldcoin/minikit-js";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { useCallback, useEffect, useState } from "react";
import { useMiniKit } from "@/hooks/useMiniKit";

const walletAuthInput = (nonce: string): WalletAuthInput => {
    return {
        nonce,
        requestId: "0",
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: "This is my statement and here is a link https://worldcoin.com/apps",
    };
};

type User = {
    walletAddress: string;
    username: string | null;
    profilePictureUrl: string | null;
};

export const Login = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const { isMiniApp, user: miniKitUser, commandsAsync } = useMiniKit();
    
    const refreshUserData = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    setUser(data.user);
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }, []);
    
    useEffect(() => {
        refreshUserData();
    }, [refreshUserData]);
    
    const handleLogin = async () => {
        if (!isMiniApp || !commandsAsync.walletAuth) {
            alert("Wallet authentication is only available in Mini App mode");
            return;
        }
        
        try {
            setLoading(true);
            const res = await fetch(`/api/nonce`);
            const { nonce } = await res.json();

            const { finalPayload } = await commandsAsync.walletAuth(walletAuthInput(nonce));

            if (finalPayload.status === 'error') {
                setLoading(false);
                return;
            } else {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        payload: finalPayload,
                        nonce,
                    }),
                });

                if (response.status === 200) {
                    setUser(miniKitUser)
                }
                setLoading(false);
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (!isMiniApp) {
        return (
            <div className="flex flex-col items-center">
                <div className="text-gray-600 text-sm">
                    Running in web mode - authentication not available
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            {!user ? (
                <Button 
                    onClick={handleLogin} 
                    disabled={loading}
                >
                    {loading ? "Connecting..." : "Login"}
                </Button>
            ) : (
                <div className="flex flex-col items-center space-y-2">
                    <div className="text-green-600 font-medium">✓ Connected</div>
                    <div className="flex items-center space-x-2">
                        {user?.profilePictureUrl && (
                            <img
                                src={user.profilePictureUrl}
                                alt="Profile"
                                className="w-8 h-8 rounded-full"
                            />
                        )}
                        <span className="font-medium">
                            {user?.username || user?.walletAddress.slice(0, 6) + '...' + user?.walletAddress.slice(-4)}
                        </span>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="secondary"
                        size="md"
                        disabled={loading}
                    >
                        {loading ? "Signing Out..." : "Sign Out"}
                    </Button>
                </div>
            )}
        </div>
    )
};
