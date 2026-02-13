import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MetricGraphProps {
  title: string;
  data: { timestamp: string; value: number }[];
  unit: string;
  color: string;
  onClose: () => void;
}

const MetricGraph = ({ title, data, unit, color, onClose }: MetricGraphProps) => {
  const chartData = data.slice(-50).map((entry) => ({
    time: new Date(entry.timestamp).toLocaleTimeString(),
    value: entry.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          label={{ value: unit, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          name={title}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MetricGraph;
