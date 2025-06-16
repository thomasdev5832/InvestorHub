import { usePrivy } from "@privy-io/react-auth";
import Button from "../ui/button";
import { Wallet, ShieldUser } from "lucide-react";

export default function ConnectButton() {
    const { ready, authenticated, login, logout, user } = usePrivy();

    if (!ready) return null;

    const getUserLabel = () => {
        if (!user) return "";

        // Se estiver logado com Google, usa o nome
        if (user.google?.name) return user.google.name;

        // Se tiver email, mostra email
        if (user.email?.address) return user.email.address;

        // Se tiver carteira, mostra endereço encurtado
        if (user.wallet?.address)
            return `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`;

        return "";
    };

    return authenticated ? (
        <Button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-md"
        >
            <ShieldUser size={20} />
            {getUserLabel()}
        </Button>
    ) : (
        <Button
            onClick={login}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-l from-blue-900 to-sky-500 hover:from-blue-950 hover:to-sky-600 transition-all duration-300 shadow-md"
        >
            <Wallet size={20} />
            Connect Wallet
        </Button>
    );
}
