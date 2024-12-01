import React, { useState, useEffect } from 'react';
import { useToast } from "../ui/use-toast";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names

const APIHealth: React.FC = () => {
  const [status, setStatus] = useState<'OK' | 'ERROR' | 'LOADING'>('LOADING');
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    const checkHealth = async () => {
      setStatus('LOADING');

      try {
        const response = await fetch('https://perps-tradeapi.kanalabs.io/health/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const newStatus = data.status ? 'OK' : 'ERROR';
        setStatus(newStatus);

        if (newStatus === 'OK') {
          toast({ title: "API is healthy!", description: "All systems operational.", variant: "default" });
        } else {
          toast({ title: "API is down!", description: "Please check the service.", variant: "destructive" });
        }
      } catch (error: any) {
        console.error('Error fetching health status:', error);
        setStatus('ERROR');
        const errorMessage = error.response?.data?.message || "Please try again later.";
        toast({ title: "Error fetching health status!", description: errorMessage, variant: "destructive" });
      }
    };

    checkHealth();
  }, [toast]);

  return (
    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center' }}>
      <div
        className={cn("rounded-full", {
          "bg-green-500": status === 'OK',
          "bg-red-500": status === 'ERROR',
          "animate-pulse": true,
        })}
        style={{
          width: 12,
          height: 12,
          marginRight: 8,
        }}
      />
      <span className="text-sm font-medium">
        Kana Labs API
      </span>
    </div>
  );
};

export default APIHealth;
