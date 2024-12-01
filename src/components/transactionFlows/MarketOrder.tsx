import { isSendableNetwork, aptosClient } from "@/utils";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-core";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { TransactionHash } from "../TransactionHash";
import { useState } from "react";
import axios from 'axios';
import { Slider } from "../ui/slider"; // Import the Slider component
// import OpenTrades from "../tradeDashboard/OpenTrades"; // Adjust the import path as necessary

export function MarketOrder({ marketId, fetchBalances, fetchOrderHistory }: { marketId: number; fetchBalances: () => void; fetchOrderHistory: () => void; }) {
  const { toast } = useToast();
  const {
    connected,
    account,
    network,
    signAndSubmitTransaction,
  } = useWallet();
  let sendable = isSendableNetwork(connected, network?.name);

  const [tradeSide, setTradeSide] = useState(true);
  const [direction, setDirection] = useState(false);
  const [leverage, setLeverage] = useState(20);
  const [usdcDeposit, setUsdcDeposit] = useState(0);
  const [amount, setAmount] = useState(0);
  const [size, setSize] = useState(0); // Initialize size to 0
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market'); // New state for order type
  const [price, setPrice] = useState(0); // Price for limit order
  const [takeProfit, setTakeProfit] = useState<number | undefined>(undefined); // Optional take profit
  const [stopLoss, setStopLoss] = useState<number | undefined>(undefined); // Optional stop loss

  // Update amount based on USDC deposit and leverage
  const updateAmount = (usdc: number, lev: number) => {
    const newAmount = usdc * lev; // Calculate the new amount
    setAmount(newAmount); // Set the amount
    setSize(newAmount); // Set size to the calculated amount
  };

  // Handle USDC deposit change
  const handleUsdcChange = (value: number) => {
    setUsdcDeposit(value);
    updateAmount(value, leverage); // This should update the amount and size correctly
  };

  // Handle amount change
  const handleAmountChange = (value: number) => {
    setAmount(value);
    setUsdcDeposit(value / leverage); // Ensure this is correct
  };

  const onSignAndSubmitTransaction = async () => {
    if (!account) return;

    // Check for minimum amount
    if (amount < 10) {
      toast({
        title: "Error",
        description: "Minimum amount of 10 is required.",
        variant: "destructive",
      });
      return;
    }

    let apiUrl = '';

    if (orderType === 'Market') {
      apiUrl = `https://perps-tradeapi.kanalabs.io/marketOrder/?marketId=${marketId}&tradeSide=${tradeSide}&direction=${direction}&size=${size}&leverage=${leverage}&amount=${amount}`; // Ensure amount is included
    } else {
      // Construct the limit order URL conditionally
      const params = new URLSearchParams({
        marketId: marketId.toString(),
        tradeSide: tradeSide.toString(),
        direction: direction.toString(),
        size: size.toString(),
        leverage: leverage.toString(),
        price: price.toString(),
        amount: amount.toString(), // Ensure amount is included for limit orders
      });

      // Only add takeProfit and stopLoss if they are defined
      if (takeProfit !== undefined) {
        params.append('takeProfit', takeProfit.toString());
      }
      if (stopLoss !== undefined) {
        params.append('stopLoss', stopLoss.toString());
      }

      apiUrl = `https://perps-tradeapi.kanalabs.io/limitOrder/?${params.toString()}`;
    }

    try {
      const response = await axios.get(apiUrl);
      if (!response.data.status) {
        throw new Error(response.data.message);
      }

      const marketOrderPayload = response.data.data;

      const transaction: InputTransactionData = {
        data: {
          function: marketOrderPayload.function,
          typeArguments: marketOrderPayload.typeArguments,
          functionArguments: marketOrderPayload.functionArguments,
        },
      };

      const txResponse = await signAndSubmitTransaction(transaction);
      await aptosClient(network).waitForTransaction({
        transactionHash: txResponse.hash,
      });

      toast({
        title: "Success",
        description: <TransactionHash hash={txResponse.hash} network={network} />,
      });

      // Wait for 5 seconds before refreshing balances and order history
      setTimeout(() => {
        fetchBalances(); // Refresh balances after successful transaction
        fetchOrderHistory(); // Refresh order history after successful transaction
      }, 5000);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || error.message || "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle style={{ textAlign: 'center' }}>Place Order</CardTitle> {/* Center the title */}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <label>Order Type:</label>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value as 'Market' | 'Limit')}>
            <option value="Market">Market Order</option>
            <option value="Limit">Limit Order</option>
          </select>

          <label>USDC Deposit:</label>
          <input
            type="number"
            value={usdcDeposit}
            onChange={(e) => handleUsdcChange(Number(e.target.value))}
            className="w-24" // Adjust the width to make the input smaller
          />

          <label>Leverage: {leverage}x</label> {/* Display the leverage value */}
          <Slider
            min={1}
            max={20}
            value={[leverage]} // Pass leverage as an array
            onValueChange={(value) => {
              const newLeverage = value[0]; // Extract the first value from the array
              setLeverage(newLeverage);
              updateAmount(usdcDeposit, newLeverage); // Update amount and size based on new leverage
            }}
            className="w-40" // Adjust the width to make the slider smaller
          />

          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(Number(e.target.value))}
            className="w-24" // Adjust the width to make the input smaller
          />

          {orderType === 'Limit' && ( // Show price input only for limit orders
            <>
              <label>Price:</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-24" // Adjust the width to make the input smaller
              />
            </>
          )}

          <label>
            Trade Side:
            <select value={tradeSide.toString()} onChange={(e) => setTradeSide(e.target.value === 'true')}>
              <option value="true">Long</option>
              <option value="false">Short</option>
            </select>
          </label>
          <label>
            Direction:
            <select value={direction.toString()} onChange={(e) => setDirection(e.target.value === 'true')}>
              <option value="false">Open Position</option>
              <option value="true">Close Position</option>
            </select>
          </label>

          <label>Take Profit (optional):</label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value ? Number(e.target.value) : undefined)}
            className="w-24" // Adjust the width to make the input smaller
          />

          <label>Stop Loss (optional):</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value ? Number(e.target.value) : undefined)}
            className="w-24" // Adjust the width to make the input smaller
          />

          <Button onClick={onSignAndSubmitTransaction} disabled={!sendable}>
            Sign and submit transaction
          </Button>
        </CardContent>
      </Card>

      {/* {orderType === 'Limit' && <OpenTrades marketId={marketId} />} Show OpenTrades component only for Limit Orders */}
    </>
  );
}