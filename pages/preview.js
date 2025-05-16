import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ImageGenerator from '../components/ImageGenerator';

// 定义可用的卡片风格
const availableStyles = [
  { value: 'apple-notes', label: '苹果备忘录' },
  { value: 'cyberpunk', label: '赛博朋克' },  
  { value: 'girly-journal', label: '少女手账本' },
  { value: 'minimalist', label: '极简现代风' },
  { value: 'dark-mode', label: '暗夜模式' },
  { value: 'vintage-typewriter', label: '复古打字机' },
  { value: 'watercolor', label: '水彩艺术' },
  { value: 'japanese', label: '日式和风' },
];

export default function PreviewPage() {
  const [cards, setCards] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    try {
      // 从localStorage获取卡片数据
      const storedCards = localStorage.getItem('previewCards');
      if (storedCards) {
        const parsedCards = JSON.parse(storedCards);
        setCards(parsedCards);
        // 设置默认选中的风格为第一张卡片的风格
        if (parsedCards.length > 0 && parsedCards[0].style) {
          setSelectedStyle(parsedCards[0].style);
        }
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  }, []);
  
  const handleClearCard = (cardId) => {
    setCards(prevCards => {
      const newCards = prevCards.filter(card => card.id !== cardId);
      // 更新localStorage
      localStorage.setItem('previewCards', JSON.stringify(newCards));
      return newCards;
    });
  };

  const handleStyleChange = (e) => {
    setSelectedStyle(e.target.value);
  };

  const handleGenerateCards = () => {
    if (!selectedStyle) return;
    setIsGenerating(true);
    
    try {
      // 更新所有卡片的风格
      const updatedCards = cards.map(card => ({
        ...card,
        style: selectedStyle
      }));
      
      setCards(updatedCards);
      // 更新localStorage
      localStorage.setItem('previewCards', JSON.stringify(updatedCards));
      setIsGenerating(false);
    } catch (error) {
      console.error('生成卡片时出错:', error);
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-medium text-gray-800">
            小红书图卡预览
          </h1>
          <Link href="/" className="text-blue-500 hover:text-blue-600 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            返回编辑
          </Link>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {cards.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <label htmlFor="card-style" className="block text-sm font-medium text-gray-700">
                  选择卡片风格:
                </label>
                <div className="relative">
                  <select
                    id="card-style"
                    value={selectedStyle}
                    onChange={handleStyleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {availableStyles.map(style => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleGenerateCards}
                  disabled={isGenerating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isGenerating ? '生成中...' : '应用风格'}
                </button>
              </div>
              <div className="text-sm text-gray-500">
                共 {cards.length} 张卡片
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <ImageGenerator cardsData={cards} onClearCard={handleClearCard} />
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到卡片数据</h3>
            <p className="mt-1 text-sm text-gray-500">请返回主页生成卡片预览</p>
            <div className="mt-6">
              <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                返回主页
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 