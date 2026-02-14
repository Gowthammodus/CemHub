
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Scenario } from '../types';

interface ComparisonChartProps {
    data: Scenario['comparisonData'];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
    const chartData = [
        {
            name: 'Total Cost (Cr)',
            BTAP: parseFloat((data.btap.totalCost / 10000000).toFixed(2)),
            BCFC: parseFloat((data.bcfc.totalCost / 10000000).toFixed(2)),
            Others: parseFloat((data.others.totalCost / 10000000).toFixed(2)),
        },
        {
            name: 'Total CO₂ (Tons)',
            BTAP: parseFloat(data.btap.totalCO2.toFixed(1)),
            BCFC: parseFloat(data.bcfc.totalCO2.toFixed(1)),
            Others: parseFloat(data.others.totalCO2.toFixed(1)),
        },
    ];

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#4a5568" />
                    <YAxis stroke="#4a5568" />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderColor: '#cbd5e0',
                            color: '#1a202c'
                        }}
                    />
                    <Legend wrapperStyle={{color: '#1a202c'}}/>
                    <Bar dataKey="BTAP" fill="#3498db" />
                    <Bar dataKey="BCFC" fill="#e74c3c" />
                    <Bar dataKey="Others" fill="#95a5a6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ComparisonChart;
