"use client";

interface HeatmapComponentProps {
  data: Array<{ day: string; hour: number; value: number }>;
  title: string;
}

const getColor = (value: number, max: number) => {
  const ratio = value / max;
  if (ratio === 0) return "bg-white/5";
  if (ratio < 0.2) return "bg-blue-900/30";
  if (ratio < 0.4) return "bg-blue-700/50";
  if (ratio < 0.6) return "bg-blue-500/70";
  if (ratio < 0.8) return "bg-gold/60";
  return "bg-red-500/80";
};

export function HeatmapComponent({ data, title }: HeatmapComponentProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const dataMap = new Map(data.map((d) => [`${d.day}-${d.hour}`, d.value]));

  return (
    <div className="card-premium p-6 rounded-2xl">
      <h3 className="text-lg font-black mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr>
              <th className="p-1 text-right text-white/40">Hour</th>
              {days.map((day) => (
                <th key={day} className="p-1 text-center text-white/40">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="p-1 text-right text-white/40 font-bold">{String(hour).padStart(2, "0")}:00</td>
                {days.map((day) => {
                  const value = dataMap.get(`${day}-${hour}`) || 0;
                  return (
                    <td
                      key={`${day}-${hour}`}
                      className={`p-2 text-center font-bold text-white ${getColor(value, maxValue)} rounded-md transition-all`}
                      title={`${day} ${hour}:00 - ${value} swaps`}
                    >
                      {value > 0 ? value : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
