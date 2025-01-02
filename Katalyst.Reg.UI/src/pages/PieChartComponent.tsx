import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Summary.css";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Label, Pie, PieChart } from "recharts";
import { Card } from "@/src/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";

const PieChartComponent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2024-12-14"));
  const [selectedData, setSelectedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

  const fetchData = async (date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://devkatalystapi-dahratgkchgda0hn.northeurope-01.azurewebsites.net/api/v1/MifidTransaction/TransactionSummaryByDate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correlationId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            applicationName: "string",
            transactionDate: date,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setSelectedData(data.response);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(formattedSelectedDate);
  }, [formattedSelectedDate]);

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
            <CalendarIcon className="h-4 w-4" />
            {format(selectedDate, "PP")}
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
      {
        category: "Total Trades",
        value: selectedData.tradeEvents || 0,
        fill: "#76DAE5",
      },
      {
        category: "New Trades",
        value: selectedData.newTrades || 0,
        fill: "#FBD4AC",
      },
      {
        category: "Amended Trades",
        value: selectedData.amendedTrades || 0,
        fill: "#016AFF",
      },
      {
        category: "Cancelled Trades",
        value: selectedData.cancelledTrades || 0,
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
        <h3 className="text-2xl flex-1 font-semibold text-black">Key Status</h3>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-700">Showing:</p>
          <DatePicker />
        </div>
      </div>
      {isLoading ? (
        <p className="text-center text-gray-500">Loading data...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : selectedData ? (
        <div className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel className="bg-white" />}
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
                            {selectedData.tradeEvents || 0}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm mr-2"
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
        <p className="text-gray-500 text-center">No data to display</p>
      )}
    </Card>
  );
};

export default PieChartComponent;
