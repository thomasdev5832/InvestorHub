import React, { useState, useEffect} from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useParams } from 'react-router-dom';
import { calculateTickValues } from '../utils/getTickValues';
import { PoolData } from '../interfaces/pooldata';
import { quote } from '../utils/uniswapQuote';

const NewPositionV2: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [poolData, setPoolData] = useState<PoolData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { wallets: privyWallets, ready } = useWallets();

    const fetchPoolById = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/pools/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching pool by ID:', error);
            throw error;
        }
    }

    useEffect(() => {
        const loadPoolData = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await fetchPoolById();
                setPoolData(data);
                console.log('Pool data loaded:', data);
                console.log('Wallets:', privyWallets);
                console.log('Ready:', ready);
                if(ready) {
                    const provider = await privyWallets[0].getEthereumProvider();
                    const tickValues = await calculateTickValues(provider, data.address);
                    console.log('Tick values:', tickValues);
                    
                    const quoteResponse = await quote(provider, data.token0, data.token1, data.feeTier, 1);
                    console.log('Amount out:', quoteResponse[0]);
                    console.log('SQRT price:', quoteResponse[1]);
                    console.log('Initialized ticks crossed list:', quoteResponse[2]);
                    console.log('Gas estimate:', quoteResponse[3]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch pool data');
                console.error('Error loading pool data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPoolData();
    }, [id, ready]);
    
    return (
        <div>
            <h1>New Position V2</h1>
            
            {loading && <p>Loading pool data...</p>}
            
            {error && (
                <div style={{ color: 'red', margin: '10px 0' }}>
                    Error: {error}
                </div>
            )}
            
            {poolData && (
                <div>
                    <h2>Pool Information</h2>
                    
                    <div style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                        <h3>Pool Details</h3>
                        <p><strong>Pool ID:</strong> {poolData._id}</p>
                        <p><strong>Pool Address:</strong> {poolData.address}</p>
                        <p><strong>Fee Tier:</strong> {poolData.feeTier}</p>
                        <p><strong>Token Pair:</strong> {poolData.token0.symbol}/{poolData.token1.symbol}</p>
                        <p><strong>Token0:</strong> {poolData.token0.name} ({poolData.token0.symbol}) - {poolData.token0.decimals} decimals</p>
                        <p><strong>Token1:</strong> {poolData.token1.name} ({poolData.token1.symbol}) - {poolData.token1.decimals} decimals</p>
                        <p><strong>Created:</strong> {new Date(parseInt(poolData.createdAtTimestamp) * 1000).toLocaleString()}</p>
                        
                        {poolData.poolDayData.length > 0 && (
                            <div>
                                <h4>Recent Day Data:</h4>
                                {poolData.poolDayData.slice(0, 3).map((dayData, dayIndex) => (
                                    <div key={dayIndex} style={{ marginLeft: '20px' }}>
                                        <p><strong>Date:</strong> {new Date(parseInt(dayData.date) * 1000).toLocaleDateString()}</p>
                                        <p><strong>TVL:</strong> ${parseFloat(dayData.tvlUSD).toLocaleString()}</p>
                                        <p><strong>Volume:</strong> ${parseFloat(dayData.volumeUSD).toLocaleString()}</p>
                                        <p><strong>Fees:</strong> ${parseFloat(dayData.feesUSD).toLocaleString()}</p>
                                        <p><strong>APR:</strong> {dayData.apr24h}%</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NewPositionV2;
