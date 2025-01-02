import React, { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer } from "@/src/components/ui/chart";
import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { DateRange } from "react-day-picker";

interface ChartProps {
  dateRange: DateRange | undefined;
  selectedField: string;
  isMobile: boolean;
}

const BarChartWithAPI: React.FC<ChartProps> = ({ dateRange, selectedField, isMobile }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateLookbackDays = (from: Date, to: Date): number => {
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const fetchChartData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    try {
      setIsLoading(true);
      const lookbackDays = calculateLookbackDays(dateRange.from, dateRange.to);
      
      const requestBody = {
        correlationId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        applicationName: "string",
        lookbackDays: lookbackDays,
        transactionDate: "string"
      };

      const response = await fetch(
        'https://devkatalystapi-dahratgkchgda0hn.northeurope-01.azurewebsites.net/api/v1/MifidTransaction/TransactionsByLookbackCalendarDays',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const transformedData = data.response.mifidTransactions.map((item: any) => ({
        date: new Date(item.mifidTransactionSummary.reportDate).toLocaleDateString(),
        value: getValueForField(item.mifidTransactionSummary, selectedField)
      }));

      setChartData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const getValueForField = (summary: any, field: string): number => {
    const fieldMap: Record<string, string> = {
      "Trade Events": "tradeEvents",
      "Trades No Fingerprint": "tradeEventsWoFp",
      "New Trades": "newTrades",
      "Amended Trades": "amendedTrades",
      "Cancelled Trades": "cancelledTrades",
      "Eligible Trades": "eligibleTrades",
      "Transactions": "transactions",
      "Accepted TRNs": "acceptedTransactions",
      "Submitted TRNs": "submittedTransactions",
      "Rejected TRNs": "rejectedTransactions",
      "Late Submission TRNs": "lateSubmissionTransactions"
    };

    return summary[fieldMap[field]] || 0;
  };

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchChartData();
    }
  }, [dateRange, selectedField]);

  const chartConfig = {
    value: {
      label: selectedField,
      color: "#2563eb",
    },
  };

  const highestValue = Math.max(...chartData.map(item => item.value));
  const roundedHighestValue = Math.ceil(highestValue / 100) * 100;

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>;

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] max-h-[350px] w-full"
    >
      <BarChart
        data={chartData}
        width={isMobile ? 300 : 600}
        height={isMobile ? 300 : 400}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          dataKey="value"
          domain={[0, roundedHighestValue]}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <ChartTooltip
          content={<ChartTooltipContent className="bg-white" />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="value"
          fill={chartConfig.value.color}
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  );
};

export default BarChartWithAPI;