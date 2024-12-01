import React, { useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../ui/table';
import { Typography } from '@mui/material';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useToast } from "../ui/use-toast";

interface OpenTradesProps {
  marketId: number;
}

const OpenTrades: React.FC<OpenTradesProps> = ({ marketId }) => {
  const { account } = useWallet();
  const { toast } = useToast();
  const [openTrades, setOpenTrades] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchOpenTrades = async () => {
    if (!account) return;

    try {
      const response = await fetch(`https://perps-tradeapi.kanalabs.io/openOrders/?address=${account.address}&marketId=${marketId}&orderType=open`);
      const data = await response.json();
      if (data.status) {
        setOpenTrades([...data.data.asks, ...data.data.bids]);
      } else {
        setError(data.message);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching open trades:', error);
      const errorMessage = error.response?.data?.message || 'Error fetching open trades';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOpenTrades();
  }, [account, marketId]);

  return (
    <Card style={{ marginTop: '16px' }}>
      <CardHeader>
        <Typography variant="h6">Open Trades</Typography>
      </CardHeader>
      <CardContent>
        {error && <Typography color="error">{error}</Typography>}
        {openTrades.length > 0 ? (
          <Table className="mt-4" style={{ width: '100%' }}>
            <TableHead>
              <TableRow style={{ display: 'flex' }}>
                <TableCell style={{ flex: '1', textAlign: 'left' }}>Order ID</TableCell>
                <TableCell style={{ flex: '1', textAlign: 'center' }}>Market Size</TableCell>
                <TableCell style={{ flex: '1', textAlign: 'center' }}>Market Price</TableCell>
                <TableCell style={{ flex: '1', textAlign: 'center' }}>Leverage</TableCell>
                <TableCell style={{ flex: '1', textAlign: 'center' }}>Take Profit</TableCell>
                <TableCell style={{ flex: '1', textAlign: 'center' }}>Stop Loss</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {openTrades.map((trade) => (
                <TableRow key={trade.marketOrderId} style={{ display: 'flex' }}>
                  <TableCell style={{ flex: '1', textAlign: 'left' }}>{trade.marketOrderId}</TableCell>
                  <TableCell style={{ flex: '1', textAlign: 'center' }}>{trade.marketSize}</TableCell>
                  <TableCell style={{ flex: '1', textAlign: 'center' }}>{trade.marketPrice}</TableCell>
                  <TableCell style={{ flex: '1', textAlign: 'center' }}>{trade.leverage}</TableCell>
                  <TableCell style={{ flex: '1', textAlign: 'center' }}>{trade.takeProfit}</TableCell>
                  <TableCell style={{ flex: '1', textAlign: 'center' }}>{trade.stopLoss}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body1">No open trades found.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default OpenTrades;
