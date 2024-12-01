import { isSendableNetwork, aptosClient } from "@/utils";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-core";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { TransactionHash } from "../TransactionHash";
import { useState } from "react"; // Add this import
import axios from 'axios'; // Add axios for API calls
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from "../ui/dialog"; // Import Dialog components

export function Deposit({ marketId, fetchBalances }: { marketId: number; fetchBalances: () => void }) { // Accept marketId as a prop
  const { toast } = useToast();
  const {
    connected,
    account,
    network,
    signAndSubmitTransaction,
  } = useWallet();
  let sendable = isSendableNetwork(connected, network?.name);

  const [amount, setAmount] = useState(0); // Change state to hold amount

  const incrementAmount = (increment: number) => {
    setAmount((prevAmount) => Math.max(0, prevAmount + increment)); // Increment amount while ensuring it doesn't go below 0
  };

  const onSignAndSubmitTransaction = async () => {
    if (!account || !amount) return; // Check for amount
    const totalAmount = amount * 1000000; // Multiply amount by 1000000

    // Fetch deposit payload from API
    const response = await axios.get(`https://perps-tradeapi.kanalabs.io/deposit/?marketId=${marketId}&amount=${totalAmount}`);
    const depositPayload = response.data.data; // Extract deposit payload

    const transaction: InputTransactionData = {
      data: {
        function: depositPayload.function, // Use function from API response
        typeArguments: depositPayload.typeArguments, // Use typeArguments from API response
        functionArguments: depositPayload.functionArguments, // Use functionArguments from API response
      },
    };
    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptosClient(network).waitForTransaction({
        transactionHash: response.hash,
      });
      toast({
        title: "Success",
        description: <TransactionHash hash={response.hash} network={network} />,
      });

      // Wait for 3 seconds before refreshing balances
      setTimeout(() => {
        fetchBalances(); // Refresh balances after successful transaction
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Open Deposit</Button> {/* Button to open the dialog */}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit to Trading Account</DialogTitle> {/* Updated title */}
          <DialogDescription>Enter the amount of USDC to deposit to your trading account.</DialogDescription> {/* Updated description */}
        </DialogHeader>
        <input 
          type="number" // Keep input type as number
          placeholder="Amount" 
          value={amount} 
          onChange={(e) => setAmount(Math.floor(Number(e.target.value)))} // Ensure only integer input
          className="border p-2"
          min="0.01" // Prevent negative values
        />
        <div>
          <Button onClick={() => incrementAmount(1)}>+1</Button> {/* Button to increment by 1 */}
          <Button onClick={() => incrementAmount(10)}>+10</Button> {/* Button to increment by 10 */}
        </div>
        <DialogClose asChild>
          <Button onClick={onSignAndSubmitTransaction} disabled={!sendable || !amount}>
            Deposit {/* Changed button text to "Deposit" */}
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
