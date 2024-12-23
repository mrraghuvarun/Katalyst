import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { totalNumberCategories } from "../lib/config";

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

const PieChartComponent: React.FC<PieChartComponentProps> = ({
  selectedData,
}) => {
  const data = [
    {
      category: "New Trades",
      value: selectedData["Total Number of New Trades"] || 0,
      fill: "#589CF0",
    },
    {
      category: "Amended Trades",
      value:
        selectedData[
          totalNumberCategories.TOTAL_NUMBER_OF_AMENDED_TRADED_STATUS
        ] || 0,
      fill: "#016AFF",
    },
    {
      category: "Cancelled Trades",
      value: selectedData["Total Number of Trades in Cancelled Status"] || 0,
      fill: "#FBD4AC",
    },
  ];

  const chartData = React.useMemo(() => {
    if (!selectedData) return [];

    return data;
  }, [selectedData]);

  const totalTrades = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const chartConfig = {
    value: {
      label: "Transactions",
      color: "#589CF0",
    },
    newTrades: {
      label: "Trade Events",
      color: "#016AFF",
    },
    amendedTrades: {
      label: "Submitted TRNs",
      color: "#FBD4AC",
    },
    cancelledTrades: {
      label: "Cancelled",
      color: "#FF9274",
    },
  };

  return (
    <Card className="shadow-none border-none">
      <div className="grid grid-cols-2 gap-4 mb-8">
        <h3 className="text-2xl font-semibold text-black">Key Status</h3>
      </div>
      <div className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
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
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="grid w-full grid-cols-2 gap-6">
          {Object.keys(chartConfig).map((key) => (
            <div key={key}>
              {chartConfig[key] && (
                <div className="flex items-center gap-2">
                  <div
                    className={`h-6 w-8 rounded`}
                    style={{
                      backgroundColor: chartConfig[key].color,
                    }}
                    // className={`h-4 w-8 bg-[#000]`}
                  ></div>
                  <span className="text-gray-700 text-sm">
                    {chartConfig[key].label}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PieChartComponent;
