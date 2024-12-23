import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/card";
import { ArrowUpRight } from "lucide-react";

type CardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  onClick: () => void;
};
const SummaryCard: React.FC<CardProps> = ({ title, value, icon, onClick }) => {
  return (
    <Card
      className="summary-card cursor-pointer shadow-sm hover:shadow-[4px_4px_0_var(--card-shadow-color)] transition-shadow duration-300"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row justify-between gap-4">
        <CardTitle className="text-xl text-gray-500 font-normal">
          {title}
        </CardTitle>

        <div className="icon-container" data-type={title}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <span className="value-text text-2xl font-bold text-black">
          {value}
        </span>
        <ArrowUpRight className="arrow-icon" size={20} />
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
