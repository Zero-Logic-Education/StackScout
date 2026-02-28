import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Paper, Typography, Box } from "@mui/material";

interface DistributionData {
  name: string;
  value: number;
  color: string;
}

interface DistributionChartProps {
  data: DistributionData[];
  title: string;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

/**
 * Кастомный tooltip для круговой диаграммы
 */
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          {payload[0].name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {payload[0].value.toLocaleString()}
        </Typography>
      </Paper>
    );
  }
  return null;
};

/**
 * Компонент для отображения круговой диаграммы
 * Используется для визуализации распределения по категориям
 */
export default function DistributionChart({
  data,
  title,
}: DistributionChartProps) {
  // Кастомный label
  const renderLabel = (entry: DistributionData) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${entry.name}: ${percent}%`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: "100%", height: 300, mt: 2 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
