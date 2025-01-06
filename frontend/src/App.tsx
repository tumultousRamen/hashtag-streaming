import React, { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { HashtagTrend } from '../../backend/src/models/HashtagTrend';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SOCKET_URL = 'http://localhost:3000';

const App: React.FC = () => {
    const [trends, setTrends] = useState<HashtagTrend[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Socket event handlers
        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
            setConnectionStatus('connected');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
            setConnectionStatus('disconnected');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnectionStatus('error');
        });

        newSocket.on('trends', (newTrends: HashtagTrend[]) => {
            console.log('Received new trends:', newTrends);
            setTrends(newTrends);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                newSocket.close();
            }
        };
    }, []);

    // Fetch initial data using REST API
    useEffect(() => {
        const fetchInitialTrends = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/trends');
                if (!response.ok) throw new Error('Failed to fetch trends');
                const data = await response.json();
                setTrends(data);
            } catch (error) {
                console.error('Error fetching initial trends:', error);
            }
        };

        fetchInitialTrends();
    }, []);

    return (
        <div className="App">
            <header className="bg-blue-600 text-white p-4">
                <h1 className="text-2xl font-bold">Trending Hashtags</h1>
                <div className={`text-sm ${
                    connectionStatus === 'connected' ? 'text-green-300' :
                    connectionStatus === 'error' ? 'text-red-300' :
                    'text-yellow-300'
                }`}>
                    Status: {connectionStatus}
                </div>
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