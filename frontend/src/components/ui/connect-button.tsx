import { useState } from "react";
import Button from "../ui/button";
import { Wallet } from "lucide-react";

export default function ConnectButton() {
    const [walletConnected, setWalletConnected] = useState(false);

    const connectWallet = () => {
        setWalletConnected(true);
    };

    return (
        <Button
            onClick={connectWallet}
            className={`flex items-center gap-2 px-4 py-2 rounded-xs text-white transition-all duration-300 shadow-md ${walletConnected
                ? "bg-gradient-to-r from-sky-500 to-blue-900 hover:from-sky-600 hover:to-blue-950"
                : "bg-gradient-to-l from-blue-900 to-sky-500 hover:from-blue-950 hover:to-sky-600"
                }`}
        >
            <Wallet size={18} />
            {walletConnected ? "Connected" : "Connect Wallet"}
        </Button>
    );
}