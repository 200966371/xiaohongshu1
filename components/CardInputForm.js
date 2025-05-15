import React, { useState } from 'react';

const CardInputForm = ({ onAddCard }) => {
  const [fileInfo, setFileInfo] = useState('');
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [bodyItems, setBodyItems] = useState(''); 
  const [footer, setFooter] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); 

    const bodyContent = bodyItems.split('\n').map(item => item.trim()).filter(item => item);

    const newCardData = {
      id: `card-news-${Date.now()}`,
      type: 'news',
      fileInfo: fileInfo || 'user_input.dat',
      date: date || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      title: title || '自定义新闻标题',
      body: [
        { 
          type: 'ul', 
          class: 'list-disc list-inside emphasis-highlight pl-4', 
          items: bodyContent.map(item => `<span class="code-string">${item}</span>`) 
        }
      ],
      footer: footer || 'Source: User',
      filenamePrefix: title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\s-]/g, '').replace(/\s+/g, '_') || 'Custom_News'
    };

    onAddCard(newCardData);

    setFileInfo('');
    setDate('');
    setTitle('');
    setBodyItems('');
    setFooter('');
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
  const labelClass = "block text-sm font-medium text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
      <div>
        <label htmlFor="title" className={labelClass}>卡片标题:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="例如：AI 新突破！"
        />
      </div>
      <div>
        <label htmlFor="bodyItems" className={labelClass}>
          卡片正文 (每点内容占一行):
        </label>
        <textarea
          id="bodyItems"
          value={bodyItems}
          onChange={(e) => setBodyItems(e.target.value)}
          rows="4"
          className={inputClass}
          placeholder="例如：\n- 功能点一\n- 功能点二\n- 重要发现"
        ></textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fileInfo" className={labelClass}>文件信息 (可选):</label>
          <input
            type="text"
            id="fileInfo"
            value={fileInfo}
            onChange={(e) => setFileInfo(e.target.value)}
            className={inputClass}
            placeholder="例如：intel_feed_user.dat"
          />
        </div>
        <div>
          <label htmlFor="date" className={labelClass}>日期 (可选):</label>
          <input
            type="text"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            placeholder="例如：2025.05.15"
          />
        </div>
      </div>
      <div>
        <label htmlFor="footer" className={labelClass}>卡片脚注/来源 (可选):</label>
        <input
          type="text"
          id="footer"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          className={inputClass}
          placeholder="例如：Source_ID: MyNews"
        />
      </div>
      <button type="submit" className="w-full download-btn bg-green-500 hover:bg-green-400">
        添加新闻卡片
      </button>
    </form>
  );
};

export default CardInputForm; 