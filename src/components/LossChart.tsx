import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LossData {
  epoch: number;
  loss: number;
}

interface LossChartProps {
  data: LossData[];
  hiddenLayerCount: number;
}

export default function LossChart({ data, hiddenLayerCount }: LossChartProps) {
  const latestLoss = data.length > 0 ? data[data.length - 1].loss : 0;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Training Loss
          <div className="text-sm font-normal text-muted-foreground">
            {hiddenLayerCount} Hidden Layer{hiddenLayerCount !== 1 ? 's' : ''}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-2xl font-bold text-neural-purple">
            {latestLoss.toFixed(4)}
          </div>
          <div className="text-sm text-muted-foreground">Current Loss</div>
        </div>
        
        {data.length > 0 && (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="epoch" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="loss" 
                  stroke="hsl(var(--neural-purple))" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(var(--neural-purple))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {data.length === 0 && (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Start training to see loss curve
          </div>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="mb-1">
            <strong>Loss</strong> measures how wrong the network's predictions are.
          </p>
          <p>
            Lower loss = better performance. More layers can reduce loss but may overfit.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}