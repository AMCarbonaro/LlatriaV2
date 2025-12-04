import React from 'react';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface AIData {
  recognizedItem: string;
  confidence: number;
  description: string;
  suggestedPrice: number;
  marketPrice: number;
  condition: string;
  category: string;
  specifications?: Record<string, string>;
  similarItems?: Array<{ title: string; price: number; platform: string }>;
}

interface AIDataDisplayProps {
  aiData: AIData | null;
  isProcessing: boolean;
}

export const AIDataDisplay: React.FC<AIDataDisplayProps> = ({
  aiData,
  isProcessing,
}) => {
  if (isProcessing) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Analyzing item...</p>
              <p className="text-sm text-muted-foreground mt-1">
                AI is recognizing the item and gathering market data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Analysis Results</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Recognized Item</span>
            <span className="text-xs text-muted-foreground">
              {Math.round(aiData.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-lg font-semibold">{aiData.recognizedItem}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Market Price</span>
            <p className="text-xl font-bold">${aiData.marketPrice.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Suggested Price</span>
            <p className="text-xl font-bold text-primary">${aiData.suggestedPrice.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <span className="text-sm font-medium mb-2 block">Description</span>
          <p className="text-sm text-muted-foreground leading-relaxed">{aiData.description}</p>
        </div>

        {aiData.specifications && Object.keys(aiData.specifications).length > 0 && (
          <div>
            <span className="text-sm font-medium mb-2 block">Specifications</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(aiData.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {aiData.similarItems && aiData.similarItems.length > 0 && (
          <div>
            <span className="text-sm font-medium mb-2 block">Similar Items</span>
            <div className="space-y-2">
              {aiData.similarItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                  <span className="truncate flex-1">{item.title}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">({item.platform})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>AI data ready to use</span>
        </div>
      </CardContent>
    </Card>
  );
};



