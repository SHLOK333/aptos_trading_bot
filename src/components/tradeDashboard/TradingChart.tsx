import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"; // Import Card components

declare global {
  interface Window {
    TradingView: any; // Declare TradingView on the Window interface
  }
}

const TradingChart: React.FC = () => {
  useEffect(() => {
    // Load TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      new window.TradingView.widget({
        "width": "100%",
        "height": "400",
        "symbol": "APTUSDC",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark", // Change theme to dark
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_chart",
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ textAlign: 'center' }}>Trading Chart</CardTitle> {/* Center the title */}
      </CardHeader>
      <CardContent>
        <div id="tradingview_chart" style={{ width: '100%', height: '400px' }} />
      </CardContent>
    </Card>
  );
};

export default TradingChart;
