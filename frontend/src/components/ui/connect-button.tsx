/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import Button from "../ui/button";
import { Wallet, ShieldUser, LogOut, Mail, User, CreditCard, Copy } from "lucide-react";

export default function ConnectButton() {
    const { ready, authenticated, login, logout, user } = usePrivy();
    const [showWalletMenu, setShowWalletMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowWalletMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    if (!ready) return null;

    const getUserLabel = () => {
        if (!user) return "";

        if (user.google?.name) return user.google.name;

        if (user.email?.address) return user.email.address;

        if (user.wallet?.address) {
            return `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`;
        }

        return "";
    };

    const copyAddressToClipboard = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy address: ', err);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            {authenticated ? (
                <Button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-md cursor-pointer" // Added cursor-pointer
                >
                    <ShieldUser size={20} />
                    {getUserLabel()}
                </Button>
            ) : (
                <Button
                    onClick={login}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-l from-blue-900 to-sky-500 hover:from-blue-950 hover:to-sky-600 transition-all duration-300 shadow-md cursor-pointer" // Added cursor-pointer
                >
                    <Wallet size={20} />
                    Connect Wallet
                </Button>
            )}

            {showWalletMenu && authenticated && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Connected Account</p>
                        {user?.google?.name && (
                            <div className="flex items-center text-gray-600 text-sm mb-1">
                                <User size={16} className="mr-2 text-gray-500" />
                                <span>{user.google.name}</span>
                            </div>
                        )}
                        {user?.email?.address && (
                            <div className="flex items-center text-gray-600 text-sm mb-1">
                                <Mail size={16} className="mr-2 text-gray-500" />
                                <span>{user.email.address}</span>
                            </div>
                        )}
                        {user?.wallet?.address && (
                            <div
                                className="flex items-center text-gray-600 text-sm cursor-pointer hover:text-sky-600 transition-colors duration-200" // Added cursor-pointer and hover effect
                                onClick={() => copyAddressToClipboard(user.wallet!.address)}
                            >
                                <CreditCard size={16} className="mr-2 text-gray-500" />
                                <span>{`${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`}</span>
                                {copied ? (
                                    <span className="ml-2 text-xs text-green-500">Copied!</span>
                                ) : (
                                    <Copy size={14} className="ml-2 text-gray-400 hover:text-sky-600" />
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer" // Added cursor-pointer
                    >
                        <LogOut size={16} />
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
}
