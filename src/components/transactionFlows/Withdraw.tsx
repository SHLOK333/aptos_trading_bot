import { isSendableNetwork, aptosClient } from "@/utils";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-core";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { TransactionHash } from "../TransactionHash";
import { useState } from "react";
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from "../ui/dialog";

export function Withdraw({ marketId, fetchBalances }: { marketId: number; fetchBalances: () => void }) {
  const { toast } = useToast();
  const {
    connected,
    account,
    network,
    signAndSubmitTransaction,
  } = useWallet();
  let sendable = isSendableNetwork(connected, network?.name);

  const [amount, setAmount] = useState(0);

  const incrementAmount = (increment: number) => {
    setAmount((prevAmount) => Math.max(0, prevAmount + increment));
  };

  const onSignAndSubmitTransaction = async () => {
    if (!account || !amount) return;
    const totalAmount = amount * 1000000;

    // Fetch withdraw payload from API
    const response = await axios.get(`https://perps-tradeapi.kanalabs.io/withdraw/?marketId=${marketId}&amount=${totalAmount}`);
    const withdrawPayload = response.data.data;

    const transaction: InputTransactionData = {
      data: {
        function: withdrawPayload.function,
        typeArguments: withdrawPayload.typeArguments,
        functionArguments: withdrawPayload.functionArguments,
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
        fetchBalances();
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Open Withdraw</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw from Trading Account</DialogTitle>
          <DialogDescription>Enter the amount of USDC to withdraw from your trading account.</DialogDescription>
        </DialogHeader>
        <input 
          type="number"
          placeholder="Amount" 
          value={amount} 
          onChange={(e) => setAmount(Math.floor(Number(e.target.value)))}
          className="border p-2"
          min="0.01"
        />
        <div>
          <Button onClick={() => incrementAmount(1)}>+1</Button>
          <Button onClick={() => incrementAmount(10)}>+10</Button>
        </div>
        <DialogClose asChild>
          <Button onClick={onSignAndSubmitTransaction} disabled={!sendable || !amount}>
            Withdraw
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
