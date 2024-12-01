import { NetworkInfo } from "@aptos-labs/wallet-adapter-core";

export interface TransactionHashProps {
  hash: string;
  network: NetworkInfo | null;
}

export function TransactionHash({ hash, network }: TransactionHashProps) {
  const networkName = network?.name || 'unknown'; // Default to 'unknown' if network is null

  const explorerLink = `https://explorer.aptoslabs.com/txn/${hash}?network=${networkName}`;

  return (
    <>
      View on Explorer:{" "}
      <a
        href={explorerLink}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 dark:text-blue-300"
      >
        {explorerLink}
      </a>
    </>
  );
}
