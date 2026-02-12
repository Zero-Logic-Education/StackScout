import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Paper, Typography, Box } from "@mui/material";

interface TrendData {
  date: string;
  count: number;
}

interface TrendChartProps {
  data: TrendData[];
  title: string;
  color?: string;
}

/**
 * Кастомный tooltip для графика трендов
 */
const CustomTooltip = ({ active, payload, color }: any) => {
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
        <Typography variant="caption" display="block" color="text.secondary">
          {payload[0].payload.date}
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ color }}>
          {payload[0].value.toLocaleString()}
        </Typography>
      </Paper>
    );
  }
  return null;
};

/**
 * Компонент для отображения линейного графика трендов
 * Используется для визуализации динамики роста библиотек
 */
export default function TrendChart({
  data,
  title,
  color = "#4caf50",
}: TrendChartProps) {
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
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
            />
            <XAxis
              dataKey="date"
              stroke="#b0b0b0"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#b0b0b0" style={{ fontSize: "12px" }} />
            <Tooltip
              content={(props) => <CustomTooltip {...props} color={color} />}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
              name="Количество"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
