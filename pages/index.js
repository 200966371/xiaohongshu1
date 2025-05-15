import React, { useState, useEffect } from 'react';
import ImageGenerator from '../components/ImageGenerator';
// import CardInputForm from '../components/CardInputForm'; // Temporarily hide

const availableStyles = [
  { value: 'cyberpunk', label: '默认风格 (赛博朋克)' },
  { value: 'apple-notes', label: '苹果备忘录' },
  { value: 'girly-journal', label: '少女手账本' },
];

const defaultBulkText = `
# 零号渗透模块 - 启动日志

页眉：内部通讯 // 机密等级：OMEGA
副标题：AI节点 "哨兵" 自检程序

碳基纪元：2077.03.15 // 04:00 AM
数据流状态：<span style="color:#00FF00;">稳定</span>
目标网络：东京市核心管理AI "YAMATO"

> 初始连接已建立。开始渗透测试...

---
页眉：第一阶段 // 认证绕过

# 权限验证模块 - 尝试 #1

> 正在分析 "YAMATO" 防火墙 v7.3.1...
> 检测到已知漏洞 CVE-2077-0315。
> 尝试利用...

结果：<span style="color:#FF0000;">失败</span> - 目标已打补丁。

---
页眉：第一阶段 // 认证绕过
页脚：内部测试记录 - 请勿外泄

# 权限验证模块 - 尝试 #2
副标题：利用社会工程学数据库

> 切换至备用方案：针对管理员 "Kenji Tanaka" 的钓鱼攻击。
> 构建虚假登录界面...
> 发送伪装邮件...

当前状态：等待目标交互...

---
页眉：日志结束

# 行动总结与后续指令
副标题：待处理

> 初步渗透尝试记录完毕。
> 节点 "哨兵" 将持续监控目标交互。
> 若48小时内无响应，将启动B计划。

页脚：// 自动归档 // 阅后即焚
`;

const HomePage = () => {
  const [cards, setCards] = useState([]);
  const [bulkText, setBulkText] = useState(defaultBulkText);
  const [splitSegments, setSplitSegments] = useState([]);
  const [editingSegments, setEditingSegments] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(availableStyles[0].value); // Default to first style

  // const handleAddCard = (newCard) => { // Original handler, may be adapted or removed
  //   setCards(prevCards => [...prevCards, newCard]);
  // };

  const handleBulkTextChange = (event) => {
    setBulkText(event.target.value);
  };

  const parseSegmentContent = (segmentText, id) => {
    let pageHeader = '';
    let pageFooter = '';
    let mainTitle = '';
    let subtitle = '';
    const bodyContentLines = [];
    const lines = segmentText.split('\n');
    const processedLines = new Array(lines.length).fill(false);

    // First pass for pageHeader and pageFooter
    lines.forEach((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('页眉：')) {
        pageHeader = trimmedLine.substring('页眉：'.length).trim();
        processedLines[i] = true;
      } else if (trimmedLine.startsWith('页脚：')) {
        pageFooter = trimmedLine.substring('页脚：'.length).trim();
        processedLines[i] = true;
      }
    });

    // Second pass for mainTitle and subtitle
    let mainTitleFound = false;
    let subtitleFound = false;
    lines.forEach((line, i) => {
      if (processedLines[i]) return;
      const trimmedLine = line.trim();
      if (!mainTitleFound && trimmedLine.startsWith('# ')) {
        mainTitle = trimmedLine.substring(2).trim();
        processedLines[i] = true;
        mainTitleFound = true;
      } else if (!mainTitleFound && trimmedLine.startsWith('#')) { // Handle '#' without space
        mainTitle = trimmedLine.substring(1).trim();
        processedLines[i] = true;
        mainTitleFound = true;
      }
      // Subtitle check needs to be careful not to misinterpret markdown headers in body
      // For now, let's assume subtitle is also a primary structural element like mainTitle
      else if (!subtitleFound && trimmedLine.startsWith('### ')) {
        subtitle = trimmedLine.substring(4).trim();
        processedLines[i] = true;
        subtitleFound = true;
      } else if (!subtitleFound && trimmedLine.startsWith('###')) { // Handle '###' without space
        subtitle = trimmedLine.substring(3).trim();
        processedLines[i] = true;
        subtitleFound = true;
      }
    });

    // Collect remaining lines as body
    lines.forEach((line, i) => {
      if (!processedLines[i]) {
        bodyContentLines.push(line);
      }
    });

    return {
      id: id || `segment-${Date.now()}`,
      rawText: segmentText, // Store original for reference if needed
      pageHeader,
      mainTitle,
      subtitle,
      body: bodyContentLines.join('\n').trimStart(), // Keep leading space within lines, but trim start of whole body
      pageFooter,
    };
  };

  const handleSplitText = () => {
    const rawSegments = bulkText.split(/\n---\n|\n---\s*$/gm).map(s => s.trim()).filter(s => s);
    const parsedSegments = rawSegments.map((seg, index) => parseSegmentContent(seg, `segment-${index}-${Date.now()}`));
    setEditingSegments(parsedSegments);
    setCards([]);
  };

  const handleSegmentFieldChange = (segmentIndex, fieldName, newValue) => {
    const updatedSegments = [...editingSegments];
    updatedSegments[segmentIndex] = {
      ...updatedSegments[segmentIndex],
      [fieldName]: newValue,
    };
    setEditingSegments(updatedSegments);
  };

  const generateCardData = (segment, index, totalSegments) => {
    let cardTypeDetermination = 'detail'; // default type
    if (index === 0) cardTypeDetermination = 'cover';
    if (index === totalSegments - 1 && totalSegments > 1) cardTypeDetermination = 'footerCard'; // Renamed to avoid conflict with segment.pageFooter

    // Base structure from parsed segment
    const cardBase = {
      id: `generated-card-${segment.id}-${Date.now()}`,
      title: segment.mainTitle || `卡片 ${index + 1}`,
      subtitle: segment.subtitle,
      pageHeader: segment.pageHeader,
      pageFooter: segment.pageFooter, // This is the parsed pageFooter from segment
      body: segment.body.split('\n').map(line => ({ type: 'p', text: line.trim() })).filter(p => p.text),
      cardIndexInfo: `卡片 ${index + 1} / ${totalSegments}`,
      style: selectedStyle, // Add selected style to card data
    };
    
    if (cardBase.body.length === 0 && (segment.mainTitle || segment.subtitle)) {
        // If body is empty but there's a title/subtitle, add a placeholder or ensure it's handled
    } else if (cardBase.body.length === 0) {
        cardBase.body = [{ type: 'p', text: '(本段无正文内容)' }];
    }

    // Adapt to existing ImageGenerator types or define new ones
    switch (cardTypeDetermination) {
      case 'cover':
        return {
          ...cardBase,
          type: 'alert', // Example: using 'alert' style for cover
          // 'alert' specific fields if any, e.g., subtitle can be mapped to card.subtitle
        };
      case 'footerCard': // This is the card that is the last in sequence
        return {
          ...cardBase,
          type: 'transmission_end', // Example: using 'transmission_end' for the last card
          // 'transmission_end' might use title for bodyTextP1, body for bodyTextP2 etc.
          bodyTextP1: segment.mainTitle || '传输结束',
          bodyTextP2: segment.subtitle,
          bodyTextP3: segment.body || '所有数据流已归档。',
        };
      case 'detail':
      default:
        return {
          ...cardBase,
          type: 'news', // Example: using 'news' for detail cards
          fileInfo: segment.pageHeader || `片段 ${index + 1}`,
          date: new Date().toLocaleDateString(), 
        };
    }
  };

  const handleGeneratePreviews = () => {
    const generatedCards = editingSegments.map((segment, index) =>
      generateCardData(segment, index, editingSegments.length)
    );
    setCards(generatedCards);
  };
  
  const handleClearCard = (cardId) => {
    setCards(prevCards => prevCards.filter(card => card.id !== cardId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <h1 className="font-orbitron text-4xl md:text-5xl text-pink-500">
          小红书图卡生成工具
        </h1>
      </header>
      
      <main>
        {/* <CardInputForm onAddCard={handleAddCard} /> // Temporarily hidden */}
        
        <div className="mb-8 p-4 bg-gray-800/50 rounded-lg shadow-md">
          <label htmlFor="style-selector" className="block text-xl font-orbitron text-cyan-400 mb-3 text-center md:text-left">选择图卡风格:</label>
          <select 
            id="style-selector"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="w-full md:w-1/2 lg:w-1/3 p-3 bg-gray-700 border border-purple-500 rounded-md text-gray-200 focus:ring-2 focus:ring-pink-500 text-lg"
          >
            {availableStyles.map(style => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-6 lg:space-x-8 mb-8">
          {/* Left Column: Bulk Input */}
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="font-orbitron text-2xl text-pink-400 mb-4 text-center md:text-left">1. 粘贴完整内容</h2>
            <textarea
              className="w-full h-64 md:h-96 lg:h-[calc(40rem)] p-4 bg-gray-800 border border-cyan-500 rounded-md text-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-500"
              value={bulkText}
              onChange={handleBulkTextChange}
              placeholder="在此处粘贴您的完整文本内容..."
            />
            {/* Instructions Area */}
            <div className="mt-3 p-3 bg-gray-800 border border-dashed border-cyan-700/70 rounded-md text-sm text-gray-300">
              <h4 className="font-semibold text-cyan-400 mb-2">内容拆分与字段识别规则:</h4>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>卡片分隔:</strong> 使用三个连续减号 <code>---</code> (独占一行) 分隔不同卡片。</li>
                <li><strong>页眉:</strong> 以 <code>页眉：</code> (中文冒号) 开头，独占一行。 <span className="text-gray-400">(例: <code>页眉：每日情报</code>)</span></li>
                <li><strong>页脚:</strong> 以 <code>页脚：</code> (中文冒号) 开头，独占一行。 <span className="text-gray-400">(例: <code>页脚：来源 - 节点X</code>)</span></li>
                <li><strong>主标题:</strong> 以 <code>#</code> 或 <code>#&nbsp;</code> 开头，独占一行。 <span className="text-gray-400">(例: <code># 我的主标题</code>)</span></li>
                <li><strong>副标题:</strong> 以 <code>###</code> 或 <code>###&nbsp;</code> 开头，独占一行。 <span className="text-gray-400">(例: <code>### 我的副标题</code>)</span></li>
                <li><strong>正文:</strong> 除以上特定行外，其余为正文。</li>
              </ul>
            </div>
            <button
              onClick={handleSplitText}
              className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75"
            >
              拆分内容
            </button>
          </div>

          {/* Right Column: Editing Segments */}
          <div className="md:w-1/2">
            {editingSegments.length > 0 && (
              <div className="h-full flex flex-col">
                <h2 className="font-orbitron text-2xl text-pink-400 mb-4 text-center md:text-left">2. 审核并编辑各卡片内容</h2>
                <div className="flex-grow space-y-3 overflow-y-auto pr-1 md:max-h-[calc(40rem_+_2.75rem)]"> 
                  {editingSegments.map((segment, index) => {
                    let segmentType = "详情页";
                    if (index === 0) segmentType = "封面页";
                    if (index === editingSegments.length - 1 && editingSegments.length > 1) segmentType = "结尾页";
                    
                    return (
                      <div key={segment.id} className="p-3 border border-purple-600 rounded-lg bg-gray-800/70 shadow-lg">
                        <h3 className="font-semibold text-pink-400 mb-2 text-md">{segmentType} (卡片 {index + 1} - {availableStyles.find(s => s.value === selectedStyle)?.label || selectedStyle}):</h3>
                        
                        <label className="block text-xs font-medium text-cyan-400 mb-0.5">页眉:</label>
                        <input type="text" value={segment.pageHeader} onChange={(e) => handleSegmentFieldChange(index, 'pageHeader', e.target.value)} placeholder="页眉内容 (可选)" className="w-full p-1.5 mb-2 bg-gray-700 border border-purple-400 rounded-md text-gray-200 text-sm focus:ring-1 focus:ring-pink-400" />
                        
                        <label className="block text-xs font-medium text-cyan-400 mb-0.5">主标题:</label>
                        <input type="text" value={segment.mainTitle} onChange={(e) => handleSegmentFieldChange(index, 'mainTitle', e.target.value)} placeholder="主标题 (由 '#' 解析)" className="w-full p-1.5 mb-2 bg-gray-700 border border-purple-400 rounded-md text-gray-200 text-sm focus:ring-1 focus:ring-pink-400" />
                        
                        <label className="block text-xs font-medium text-cyan-400 mb-0.5">副标题:</label>
                        <input type="text" value={segment.subtitle} onChange={(e) => handleSegmentFieldChange(index, 'subtitle', e.target.value)} placeholder="副标题 (由 '###' 解析)" className="w-full p-1.5 mb-2 bg-gray-700 border border-purple-400 rounded-md text-gray-200 text-sm focus:ring-1 focus:ring-pink-400" />
                        
                        <label className="block text-xs font-medium text-cyan-400 mb-0.5">正文:</label>
                        <textarea
                          className="w-full h-36 p-2 bg-gray-700 border border-purple-400 rounded-md text-gray-200 text-sm focus:ring-1 focus:ring-pink-400 placeholder-gray-500"
                          value={segment.body}
                          onChange={(e) => handleSegmentFieldChange(index, 'body', e.target.value)}
                          placeholder="卡片的主要内容..."
                        />
                        
                        <label className="block text-xs font-medium text-cyan-400 mt-1.5 mb-0.5">页脚:</label>
                        <input type="text" value={segment.pageFooter} onChange={(e) => handleSegmentFieldChange(index, 'pageFooter', e.target.value)} placeholder="页脚内容 (可选)" className="w-full p-1.5 bg-gray-700 border border-purple-400 rounded-md text-gray-200 text-sm focus:ring-1 focus:ring-pink-400" />
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleGeneratePreviews}
                  className="mt-4 w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75 shrink-0"
                >
                  生成卡片预览
                </button>
              </div>
            )}
            {editingSegments.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-md bg-gray-800/50 md:min-h-[calc(40rem_+_2.75rem)]">
                    <p className="text-gray-400 text-center font-share-tech text-lg">请先在左侧粘贴内容并点击"拆分内容"。</p>
                    <p className="text-gray-500 text-center mt-1 text-sm">拆分后的内容片段将在此处显示以供编辑。</p>
                </div>
            )}
          </div>
        </div>
        
        <hr className="my-12 border-gray-700" /> 

        <h2 className="font-orbitron text-3xl text-pink-500 text-center mb-6">
          生成的卡片预览
        </h2>
        <ImageGenerator cardsData={cards} onClearCard={handleClearCard} />
      </main>

      <footer className="text-center mt-12 py-4 border-t border-gray-700">
        <p className="emphasis-auxiliary">小红书图卡生成工具 - 创造你的专属精彩卡片!</p>
      </footer>
    </div>
  );
};

export default HomePage; 