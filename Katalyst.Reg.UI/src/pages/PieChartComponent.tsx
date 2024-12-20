import React from 'react';
import { TrendingUp, TrendingDown } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";

interface TradeDataItem {
  "Reporting Date": string;
  "Total Number of New Trades": number;
  "Total Number of Trades in Amended Status": number;
  "Total Number of Trades in Cancelled Status": number;
  [key: string]: string | number;
}

interface PieChartComponentProps {
  selectedData: TradeDataItem | undefined;
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({ selectedData }) => {
  const chartData = React.useMemo(() => {
    if (!selectedData) return [];
    
    return [
      {
        category: "New Trades",
        value: selectedData["Total Number of New Trades"] || 0,
        fill: "hsl(215, 100%, 50%)"
      },
      {
        category: "Amended Trades",
        value: selectedData["Total Number of Trades in Amended Status"] || 0,
        fill: "hsl(145, 80%, 40%)"
      },
      {
        category: "Cancelled Trades",
        value: selectedData["Total Number of Trades in Cancelled Status"] || 0,
        fill: "hsl(0, 90%, 60%)"
      }
    ];
  }, [selectedData]);

  const totalTrades = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const percentageChange = 3.8;

  const chartConfig = {
    value: {
      label: "Trades",
    },
    newTrades: {
      label: "New Trades",
      color: "hsl(215, 100%, 50%)",
    },
    amendedTrades: {
      label: "Amended Trades",
      color: "hsl(145, 80%, 40%)",
    },
    cancelledTrades: {
      label: "Cancelled Trades",
      color: "hsl(0, 90%, 60%)",
    },
  };

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Key Status</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalTrades.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Trades
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {/* <div className="flex items-center gap-2 font-medium leading-none">
          {percentageChange >= 0 ? (
            <>
              Trending up by {percentageChange}% today
              <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : (
            <>
              Trending down by {Math.abs(percentageChange)}% today
              <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          )}
        </div> */}
        <div className="leading-none text-muted-foreground">
          Showing distribution of trades by status
        </div>
      </CardFooter>
    </Card>
  );
};

export default PieChartComponent;