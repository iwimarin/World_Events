import { MiniKit } from "@worldcoin/minikit-js";

export const useMiniKit = () => {
  const isMiniApp = process.env.NEXT_PUBLIC_MINI_APP_MODE === "true";
  
  return {
    isMiniApp,
    isInstalled: () => isMiniApp ? MiniKit.isInstalled() : false,
    user: isMiniApp ? MiniKit.user : null,
    walletAddress: isMiniApp ? MiniKit.walletAddress : null,
    commandsAsync: {
      walletAuth: isMiniApp ? MiniKit.commandsAsync.walletAuth : null,
      verify: isMiniApp ? MiniKit.commandsAsync.verify : null,
      pay: isMiniApp ? MiniKit.commandsAsync.pay : null,
    },
  };
}; 