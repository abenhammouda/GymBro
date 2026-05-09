import React, { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import type { WeeklyProgress } from '../../services/client.service';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

interface WeeklyDonutChartProps {
    weeklyProgress: WeeklyProgress[];
}

/**
 * Multi-segment donut chart: one arc per week, arc size = weight at that week.
 * Color transitions from orange (start) to green (recent), showing the journey.
 */
const WeeklyDonutChart: React.FC<WeeklyDonutChartProps> = ({ weeklyProgress }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const weeks = weeklyProgress.filter(w => w.currentWeight != null);
        if (weeks.length === 0) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const labels = weeks.map(w => `Semaine ${w.weekNumber}`);
        const data = weeks.map(w => w.currentWeight!);

        // Generate colors: orange at start, green at end
        const colors = weeks.map((_, i) => {
            const ratio = weeks.length === 1 ? 1 : i / (weeks.length - 1);
            const r = Math.round(255 * (1 - ratio) + 52 * ratio);
            const g = Math.round(140 * (1 - ratio) + 211 * ratio);
            const b = Math.round(20 * (1 - ratio) + 107 * ratio);
            return `rgba(${r},${g},${b},0.88)`;
        });

        const latest = weeks[weeks.length - 1];
        const initial = weeks[0];
        const diff = latest.currentWeight! - initial.currentWeight!;
        const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);

        chartRef.current = new Chart(canvasRef.current, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 2,
                    hoverOffset: 6,
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            padding: 12,
                            font: { size: 11, family: "'Inter', sans-serif" },
                            boxWidth: 12,
                            boxHeight: 12,
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${ctx.raw} kg`
                        }
                    }
                }
            },
            plugins: [{
                id: 'centerLabel',
                beforeDraw(chart) {
                    const { ctx, chartArea } = chart;
                    const cx = (chartArea.left + chartArea.right) / 2;
                    const cy = (chartArea.top + chartArea.bottom) / 2;
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#1f2937';
                    ctx.font = "bold 20px 'Inter', sans-serif";
                    ctx.fillText(`${latest.currentWeight} kg`, cx, cy - 10);
                    ctx.font = "13px 'Inter', sans-serif";
                    ctx.fillStyle = diff <= 0 ? '#059669' : '#d97706';
                    ctx.fillText(`${diffStr} kg`, cx, cy + 14);
                    ctx.restore();
                }
            }]
        });

        return () => {
            chartRef.current?.destroy();
        };
    }, [weeklyProgress]);

    if (weeklyProgress.filter(w => w.currentWeight != null).length === 0) {
        return (
            <div className="chart-empty">
                <span>Aucune donnée de poids disponible</span>
            </div>
        );
    }

    return <canvas ref={canvasRef} style={{ maxHeight: 260 }} />;
};

export default WeeklyDonutChart;
