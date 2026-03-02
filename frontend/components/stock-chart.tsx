"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";

interface StockChartProps {
  data: { date: string; price: number }[];
  currency?: string;
  timeframe?: string;
  onTimeframeChange?: (tf: string) => void;
  isLoading?: boolean;
}

export function StockChart({
  data,
  currency = "USD",
  timeframe,
  onTimeframeChange,
  isLoading = false,
}: StockChartProps) {
  if (!data || data.length === 0) return null;

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const buffer = (maxPrice - minPrice) * 0.1;

  return (
    <div className="w-full h-[350px] bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 mb-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-zinc-400">
            {timeframe ? `${timeframe} Performance` : "Performance"}
          </h3>

          {onTimeframeChange && (
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              {["1M", "3M", "1Y", "5Y"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => onTimeframeChange(tf)}
                  disabled={isLoading}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeframe === tf
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="text-xs font-mono text-emerald-500 animate-pulse uppercase">
              Updating...
            </span>
          ) : (
            <>
              <span className="text-xs font-mono text-zinc-500 uppercase">
                Live Data
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </>
          )}
        </div>
      </div>

      <div
        className={`transition-opacity duration-300 w-full h-[85%] ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={(str) => {
                if (!str) return "";
                return format(parseISO(str as string), "MMM d");
              }}
              stroke="#52525b"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />

            <YAxis
              domain={[minPrice - buffer, maxPrice + buffer]}
              stroke="#52525b"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(number) => number.toFixed(2)}
              width={60}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                // FIX: Ensure label exists and is a string before formatting
                if (
                  active &&
                  payload &&
                  payload.length &&
                  label &&
                  typeof label === "string"
                ) {
                  const formattedPrice = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency,
                  }).format(Number(payload[0].value));

                  return (
                    <div className="bg-zinc-900 border border-zinc-700 p-3 rounded shadow-xl">
                      <p className="text-zinc-400 text-xs mb-1">
                        {format(parseISO(label), "MMM d, yyyy")}
                      </p>
                      <p className="text-emerald-400 font-bold font-mono text-lg">
                        {formattedPrice}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
