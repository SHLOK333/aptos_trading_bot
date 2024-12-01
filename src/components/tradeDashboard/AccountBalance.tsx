import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@mui/material';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useToast } from "../ui/use-toast"; // Import useToast
import { Avatar } from '../ui/avatar'; // Import Avatar component
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu'; // Import DropdownMenu components
import './AccountBalance.css'; // Import the CSS file

interface AccountBalanceProps {
  marketId: number;
  baseDecimals: number;
}

const AccountBalance: React.FC<AccountBalanceProps> = ({ marketId, baseDecimals }) => {
  const { account } = useWallet();
  const { toast } = useToast(); // Initialize toast
  const [tradingBalance, setTradingBalance] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [aptBalance, setAptBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!account) return;

    try {
      const tradingResponse = await fetch(`https://perps-tradeapi.kanalabs.io/getTradingAccountBalance?marketId=${marketId}&address=${account.address}`);
      const tradingData = await tradingResponse.json();
      if (tradingData.status) {
        setTradingBalance(tradingData.data / 1000000);
      } else {
        setTradingBalance(0);
        // Removed error state update for frontend display
        toast({
          title: "Error",
          description: tradingData.message,
          variant: "destructive",
        });
      }

      const walletResponse = await fetch(`https://perps-tradeapi.kanalabs.io/getWalletAccountBalance?marketId=${marketId}&address=${account.address}`);
      const walletData = await walletResponse.json();
      if (walletData.status) {
        setWalletBalance(walletData.data / 1000000);
      } else {
        setWalletBalance(0);
        setError(walletData.message);
        toast({
          title: "Error",
          description: walletData.message,
          variant: "destructive",
        });
      }

      const aptResponse = await fetch(`https://perps-tradeapi.kanalabs.io/getAccountAptBalance?marketId=${marketId}&address=${account.address}`);
      const aptData = await aptResponse.json();
      if (aptData.status) {
        setAptBalance(aptData.data / 100000000);
      } else {
        setAptBalance(0);
        setError(aptData.message);
        toast({
          title: "Error",
          description: aptData.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching account balances:', error);
      const errorMessage = error.response?.data?.message || 'Error fetching account balances';
      // Removed error state update for frontend display
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [account, marketId]);

  if (!account) {
    return <Typography variant="body1">Please connect your wallet to see account balances.</Typography>;
  }

  const formatBalance = (balance: number | null) => {
    if (balance === null) return 'Loading...';
    return Math.round(balance * 100) / 100;
  };

  const formatAptBalance = (balance: number | null) => {
    if (balance === null) return 'Loading...';
    return balance.toFixed(4);
  };

  return (
    <div className="account-balance-container">
      {error && <Typography color="error">{error}</Typography>}
      
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="contained" className="w-full">Wallet Balance</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <div className="wallet-balance-container">
              <div className="wallet-balance-item">
                <Avatar className="mr-2">
                  <img src="/usdc.png" alt="USDC" />
                </Avatar>
                <Typography variant="body1" className="text-sm">USDC: {formatBalance(walletBalance)}</Typography>
              </div>
              <div className="wallet-balance-item">
                <Avatar className="mr-2">
                  <img src="/aptos.png" alt="Aptos" />
                </Avatar>
                <Typography variant="body1" className="text-sm">Aptos: {formatAptBalance(aptBalance)}</Typography>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="account-balance flex items-center">
        <div className="flex items-center ml-20"> {/* Added margin-left for gap */}
          <Avatar className="mr-2 spin-on-hover">
            <img src="/usdc.png" alt="USDC" />  
          </Avatar>
          <Typography variant="body1" className="font-bold text-lg"> {/* Increased font size */}
            USDC: {formatBalance(tradingBalance)}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default AccountBalance;
