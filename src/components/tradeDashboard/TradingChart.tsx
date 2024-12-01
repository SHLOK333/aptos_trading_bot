import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Shield, AlertTriangle } from 'lucide-react';

const NFCConnection: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastTag, setLastTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tradingViewScriptUrl = "https://s3.tradingview.com/tv.js";

  const createChart = (containerId: string, options: any) => {
    if (!(window as any).TradingView) return;

    new (window as any).TradingView.widget({
      ...options,
      container_id: containerId,
    });
  };

  useEffect(() => {
    // Check if NFC is supported
    if (!('NDEFReader' in window)) {
      setError('NFC is not supported on this device');
    }

    // Load TradingView script dynamically
    const script = document.createElement('script');
    script.src = tradingViewScriptUrl;
    script.async = true;
    script.onload = () => {
      // Initialize charts after script loads
      createChart("aptos_chart_1", {
        symbol: "BINANCE:APTUSDT",
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",  // Set theme to dark
        style: "1",
        locale: "en",
        toolbar_bg: "#1f1f1f",  // Dark background for the toolbar
        enable_publishing: false,
        allow_symbol_change: true,
        details: true,
      });

      createChart("aptos_chart_2", {
        symbol: "BINANCE:APTUSDT",
        interval: "60",
        timezone: "Etc/UTC",
        theme: "dark",  // Set theme to dark
        style: "1",
        locale: "en",
        toolbar_bg: "#1f1f1f",  // Dark background for the toolbar
        enable_publishing: false,
        allow_symbol_change: true,
        details: false,
      });

      createChart("aptos_chart_3", {
        symbol: "BINANCE:APTUSDT",
        interval: "W",
        timezone: "Etc/UTC",
        theme: "dark",  // Set theme to dark
        style: "1",
        locale: "en",
        toolbar_bg: "#1f1f1f",  // Dark background for the toolbar
        enable_publishing: false,
        allow_symbol_change: true,
        details: true,
      });
    };

    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const handleScan = async () => {
    if (!('NDEFReader' in window)) {
      setError('NFC is not supported on this device');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", ({ serialNumber }: { serialNumber: string }) => {
        setIsConnected(true);
        setLastTag(serialNumber);
      });

      ndef.addEventListener("readingerror", () => {
        setError('Error reading NFC tag');
        setIsConnected(false);
      });

    } catch (error) {
      console.error(error);
      setError('Failed to start NFC scan');
      setIsConnected(false);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">NFC Connection</h2>
        {isConnected ? (
          <Shield className="w-6 h-6 text-green-500" />
        ) : (
          <WifiOff className="w-6 h-6 text-red-500" />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {lastTag && (
          <div className="text-sm text-gray-400">
            <p>Last Tag ID: {lastTag}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:bg-blue-300"
        >
          {isScanning ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Wifi className="w-5 h-5" />
          )}
          <span>{isScanning ? 'Scanning...' : 'Scan for NFC'}</span>
        </button>
      </div>

      {/* TradingView Charts for Aptos */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-6">Aptos Market Overview</h3>
        <div className="space-y-8">
          {/* Chart 1: Daily Timeframe */}
          <div className="space-y-2">
            <h4 className="text-md font-semibold">1 Day Timeframe</h4>
            <div id="aptos_chart_1" className="w-full h-96 rounded-lg border border-gray-700 shadow-lg bg-black"></div>
          </div>

          {/* Chart 2: Hourly Timeframe */}
          <div className="space-y-2">
            <h4 className="text-md font-semibold">1 Hour Timeframe</h4>
            <div id="aptos_chart_2" className="w-full h-96 rounded-lg border border-gray-700 shadow-lg bg-black"></div>
          </div>

          {/* Chart 3: Weekly Timeframe */}
          <div className="space-y-2">
            <h4 className="text-md font-semibold">1 Week Timeframe</h4>
            <div id="aptos_chart_3" className="w-full h-96 rounded-lg border border-gray-700 shadow-lg bg-black"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFCConnection;
