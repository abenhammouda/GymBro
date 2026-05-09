import React, { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import type { MacroPlan } from '../../services/client.service';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

interface MacroPieChartProps {
    macroPlan: MacroPlan;
}

/**
 * Pie chart showing macros distribution: Protéines / Glucides / Lipides.
 * Center label shows total calories.
 */
const MacroPieChart: React.FC<MacroPieChartProps> = ({ macroPlan }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Convert grams to kcal: protein=4, carbs=4, fat=9
        const proteinKcal = macroPlan.proteinGrams * 4;
        const carbsKcal = macroPlan.carbsGrams * 4;
        const fatKcal = macroPlan.fatGrams * 9;

        chartRef.current = new Chart(canvasRef.current, {
            type: 'doughnut',
            data: {
                labels: [
                    `Protéines (${macroPlan.proteinGrams}g)`,
                    `Glucides (${macroPlan.carbsGrams}g)`,
                    `Lipides (${macroPlan.fatGrams}g)`
                ],
                datasets: [{
                    data: [proteinKcal, carbsKcal, fatKcal],
                    backgroundColor: [
                        'rgba(99, 179, 237, 0.9)',   // blue – protein
                        'rgba(252, 196, 25, 0.9)',   // yellow – carbs
                        'rgba(248, 113, 113, 0.9)',  // red – fat
                    ],
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 2,
                    hoverOffset: 6,
                }]
            },
            options: {
                cutout: '68%',
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
                            label: (ctx) => {
                                const total = proteinKcal + carbsKcal + fatKcal;
                                const pct = ((ctx.raw as number) / total * 100).toFixed(0);
                                return ` ${ctx.label}: ${pct}%`;
                            }
                        }
                    }
                }
            },
            plugins: [{
                id: 'centerCalories',
                beforeDraw(chart) {
                    const { ctx, chartArea } = chart;
                    const cx = (chartArea.left + chartArea.right) / 2;
                    const cy = (chartArea.top + chartArea.bottom) / 2;
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#1f2937';
                    ctx.font = "bold 22px 'Inter', sans-serif";
                    ctx.fillText(`${macroPlan.calories}`, cx, cy - 10);
                    ctx.font = "12px 'Inter', sans-serif";
                    ctx.fillStyle = '#6b7280';
                    ctx.fillText('kcal/jour', cx, cy + 13);
                    ctx.restore();
                }
            }]
        });

        return () => {
            chartRef.current?.destroy();
        };
    }, [macroPlan]);

    return <canvas ref={canvasRef} style={{ maxHeight: 260 }} />;
};

export default MacroPieChart;
