// src/App.tsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { HashtagTrend } from '../../backend/src/models/HashtagTrend';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const socket = io('http://localhost:3000');

const App: React.FC = () => {
    const [trends, setTrends] = useState<HashtagTrend[]>([]);

    useEffect(() => {
        // Listen for real-time updates
        socket.on('trends', (newTrends: HashtagTrend[]) => {
            setTrends(newTrends);
        });

        // Cleanup on unmount
        return () => {
            socket.off('trends');
        };
    }, []);

    return (
        <div className="App">
            <header className="bg-blue-600 text-white p-4">
                <h1 className="text-2xl font-bold">Trending Hashtags</h1>
            </header>
            
            <main className="p-4">
                <div className="mb-8">
                    <h2 className="text-xl mb-4">Top 10 Trending Hashtags</h2>
                    <div className="w-full h-96">
                        <BarChart width={800} height={400} data={trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="tag" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-lg mb-2">Trending List</h3>
                        <ul className="space-y-2">
                            {trends.map((trend, index) => (
                                <li key={trend.tag} className="p-2 bg-gray-100 rounded">
                                    <span className="font-bold">#{index + 1}</span>{' '}
                                    {trend.tag} - {trend.count} mentions
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;