import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Paper, Typography, Box } from "@mui/material";

interface SourceData {
  source: string;
  count: number;
}

interface SourceStatsChartProps {
  data: SourceData[];
  title: string;
  color?: string;
}

/**
 * Кастомный tooltip для столбчатой диаграммы
 */
const CustomTooltip = ({ active, payload }: any) => {
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
          {payload[0].payload.source}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {payload[0].value.toLocaleString()} библиотек
        </Typography>
      </Paper>
    );
  }
  return null;
};

/**
 * Компонент для отображения столбчатой диаграммы
 * Используется для визуализации статистики по источникам пакетов
 */
export default function SourceStatsChart({
  data,
  title,
  color = "#4caf50",
}: SourceStatsChartProps) {
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
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
            />
            <XAxis
              dataKey="source"
              stroke="#b0b0b0"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#b0b0b0" style={{ fontSize: "12px" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="count"
              fill={color}
              radius={[8, 8, 0, 0]}
              name="Количество"
              maxBarSize={100}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
