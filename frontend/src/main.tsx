import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivyProvider } from '@privy-io/react-auth';
import { sepolia } from 'viem/chains';
import { Toaster } from 'react-hot-toast';

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="middle-center" />
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["wallet", "email", "google"],
        appearance: {
          theme: "light",
          accentColor: "#069478",
        },
        defaultChain: sepolia,
        supportedChains: [sepolia],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
)
