import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import tradeData from "../assets/data.json";
import "./Summary.css";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import "../output.css";
import { Label, Pie, PieChart } from "recharts";
import { Card } from "@/src/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { DayPicker } from "react-day-picker";
interface TradeDataItem {
  "Reporting Date": string;
  [key: string]: string | number;
}

const typedTradeData = tradeData as TradeDataItem[];

const PieChartComponent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(
      new Date("2024-09-06")
    );
  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
    const selectedData: TradeDataItem | undefined = typedTradeData.find(
      (item: TradeDataItem) => item["Reporting Date"] === formattedSelectedDate
    );
  const DatePicker = () => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left text-xs font-semibold",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className=" h-4 w-4" />
            {format(selectedDate, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };

  const chartData = React.useMemo(() => {
    if (!selectedData) return [];

    return [
      {category: "Total Trades",
        value: selectedData["Total Number of Trade Events"] || 0,
        fill: "#76DAE5",
      },
      {
        category: "New Trades",
        value: selectedData["Total Number of New Trades"] || 0,
        fill: "#FBD4AC",
      },
      {
        category: "Amended Trades",
        value: selectedData["Total Number of Trades in Amended Status"] || 0,
        fill: "#016AFF",
      },
      {
        category: "Cancelled Trades",
        value: selectedData["Total Number of Trades in Cancelled Status"] || 0,
        fill: "#FF9274",
      },
    ];
  }, [selectedData]);



  const chartConfig = {
    value: {
      label: "Total Trades",
      color: "#76DAE5",
    },
    newTrades: {
      label: "New Trades",
      color: "#FBD4AC",
    },
    amendedTrades: {
      label: "Amended Trades",
      color: "#016AFF",
    },
    cancelledTrades: {
      label: "Cancelled Trades",
      color: "#FF9274",
    },
  };

  return (
    <Card className="shadow-none border-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="flex items-center justify-between gap-x-4">
  <h3 className="text-2xl font-semibold text-black">Key Status</h3>
  <div className="flex items-center gap-x-2">
    <p className="text-sm text-gray-700">Showing:</p>
    <DatePicker />
  </div>
</div>

          
      </div>
      {selectedData ? (
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
            {selectedData ? selectedData["Total Number of Trade Events"] : 0}
          </tspan>
          <tspan
            x={viewBox.cx}
            y={(viewBox.cy || 0) + 24}
            className="fill-muted-foreground text-sm"
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
      ) : (
        <p className="text-gray-500 text-center">Please select a date.</p>
      )}
    </Card>
  );
};

export default PieChartComponent;
