'use client';
import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Activity, DollarSign, ArrowRightLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
// Mock data for UI before real integration
const MOCK_POSITIONS = [
  { id: 1, pair: 'MINA/USD', type: 'Long', size: '500', entry: '0.85', mark: '0.88', pnl: '+17.64', pnlPercent: '+3.5%' },
  { id: 2, pair: 'BTC/USD', type: 'Short', size: '0.1', entry: '45000', mark: '44800', pnl: '+20.00', pnlPercent: '+0.4%' },
];
export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [activeTab, setActiveTab] = useState('trade');
  const [leverage, setLeverage] = useState(5);
  const [amount, setAmount] = useState('');
  const [isLong, setIsLong] = useState(true);
  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && window.mina) {
      window.mina.getAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setWalletConnected(true);
        }
      });
      // Listen for account changes
      window.mina.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setWalletConnected(true);
        } else {
          setAccount('');
          setWalletConnected(false);
        }
      });
    }
  }, []);
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.mina) {
      try {
        const accounts = await window.mina.requestAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setWalletConnected(true);
        }
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("Please install Auro Wallet to use this dApp!");
    }
  };
  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-green-500/30">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-black font-bold" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              ZEKO Perp
            </span>
          </div>
          
          <button
            onClick={connectWallet}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all",
              walletConnected 
                ? "bg-gray-800 text-green-400 border border-green-500/30"
                : "bg-white text-black hover:bg-gray-200"
            )}
          >
            <Wallet className="w-4 h-4" />
            {walletConnected ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Chart & Positions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Placeholder */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 h-[400px] flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-gray-500 flex flex-col items-center gap-2">
                <Activity className="w-12 h-12 opacity-20" />
                <span>Price Chart (MINA/USD)</span>
                <span className="text-xs text-gray-600">Integration Pending</span>
              </div>
            </div>
            {/* Positions Table */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Open Positions</h3>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Real-time</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-gray-400 bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 font-medium">Pair</th>
                      <th className="px-6 py-3 font-medium">Side</th>
                      <th className="px-6 py-3 font-medium">Size</th>
                      <th className="px-6 py-3 font-medium">Entry Price</th>
                      <th className="px-6 py-3 font-medium">Mark Price</th>
                      <th className="px-6 py-3 font-medium">PnL</th>
                      <th className="px-6 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {MOCK_POSITIONS.map((pos) => (
                      <tr key={pos.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{pos.pair}</td>
                        <td className={clsx("px-6 py-4", pos.type === 'Long' ? 'text-green-400' : 'text-red-400')}>
                          {pos.type}
                        </td>
                        <td className="px-6 py-4">{pos.size}</td>
                        <td className="px-6 py-4">${pos.entry}</td>
                        <td className="px-6 py-4">${pos.mark}</td>
                        <td className={clsx("px-6 py-4", pos.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400')}>
                          {pos.pnl} ({pos.pnlPercent})
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors">
                            Close
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Right Column: Trading Interface */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sticky top-24">
              {/* Tabs */}
              <div className="flex bg-gray-800/50 rounded-lg p-1 mb-6">
                {['Long', 'Short'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setIsLong(tab === 'Long')}
                    className={clsx(
                      "flex-1 py-2 rounded-md text-sm font-medium transition-all",
                      (tab === 'Long' && isLong) ? "bg-green-500/20 text-green-400 shadow-sm" :
                      (tab === 'Short' && !isLong) ? "bg-red-500/20 text-red-400 shadow-sm" :
                      "text-gray-400 hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Leverage Slider */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Leverage</span>
                  <span className="font-mono text-white">{leverage}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>1x</span>
                  <span>50x</span>
                  <span>100x</span>
                </div>
              </div>
              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Collateral Amount (MINA)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-4 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    MINA
                  </div>
                </div>
              </div>
              {/* Summary */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Position Size</span>
                  <span className="text-white font-mono">
                    {amount ? (Number(amount) * leverage).toFixed(2) : '0.00'} MINA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Entry Price</span>
                  <span className="text-white font-mono">$0.88</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Liquidation Price</span>
                  <span className="text-red-400 font-mono">$0.72</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fees</span>
                  <span className="text-white font-mono">0.1%</span>
                </div>
              </div>
              {/* Action Button */}
              <button
                className={clsx(
                  "w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-[0.98]",
                  isLong 
                    ? "bg-green-500 hover:bg-green-400 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                    : "bg-red-500 hover:bg-red-400 text-black shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                )}
              >
                {isLong ? 'Open Long' : 'Open Short'}
              </button>
            </div>
            {/* Liquidity Pool Info */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Liquidity Pool</h3>
                  <p className="text-xs text-gray-500">Provide liquidity to earn fees</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-2xl font-bold text-white">$1,240,500</div>
                <div className="text-sm text-green-400">+2.4% APY</div>
              </div>
              <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                Deposit Liquidity
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
