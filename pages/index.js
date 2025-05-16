import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const availableStyles = [
  { value: 'apple-notes', label: '苹果备忘录 (推荐)' },
  { value: 'cyberpunk', label: '赛博朋克' },  
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
  const router = useRouter();
  const [bulkText, setBulkText] = useState(defaultBulkText);
  const [editingSegments, setEditingSegments] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(availableStyles[0].value);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('input'); // 'input' or 'edit'

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
      } else if (!mainTitleFound && trimmedLine.startsWith('#')) {
        mainTitle = trimmedLine.substring(1).trim();
        processedLines[i] = true;
        mainTitleFound = true;
      }
      else if (!subtitleFound && trimmedLine.startsWith('副标题：')) {
        subtitle = trimmedLine.substring('副标题：'.length).trim();
        processedLines[i] = true;
        subtitleFound = true;
      } 
      else if (!subtitleFound && trimmedLine.startsWith('### ')) {
        subtitle = trimmedLine.substring(4).trim();
        processedLines[i] = true;
        subtitleFound = true;
      } else if (!subtitleFound && trimmedLine.startsWith('###')) {
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
      rawText: segmentText,
      pageHeader,
      mainTitle,
      subtitle,
      body: bodyContentLines.join('\n').trimStart(),
      pageFooter,
    };
  };

  const handleSplitText = () => {
    const rawSegments = bulkText.split(/\n---\n|\n---\s*$/gm).map(s => s.trim()).filter(s => s);
    const parsedSegments = rawSegments.map((seg, index) => parseSegmentContent(seg, `segment-${index}-${Date.now()}`));
    setEditingSegments(parsedSegments);
    setActiveTab('edit');
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
    let cardTypeDetermination = 'detail';
    if (index === 0) cardTypeDetermination = 'cover';
    if (index === totalSegments - 1 && totalSegments > 1) cardTypeDetermination = 'footerCard';

    const cardBase = {
      id: `generated-card-${segment.id}-${Date.now()}`,
      title: segment.mainTitle || `卡片 ${index + 1}`,
      subtitle: segment.subtitle,
      pageHeader: segment.pageHeader,
      pageFooter: segment.pageFooter,
      body: segment.body.split('\n').map(line => ({ type: 'p', text: line.trim() })).filter(p => p.text),
      cardIndexInfo: `卡片 ${index + 1} / ${totalSegments}`,
      style: selectedStyle,
    };
    
    if (cardBase.body.length === 0 && (segment.mainTitle || segment.subtitle)) {
        // If body is empty but there's a title/subtitle, add a placeholder or ensure it's handled
    } else if (cardBase.body.length === 0) {
        cardBase.body = [{ type: 'p', text: '(本段无正文内容)' }];
    }

    switch (cardTypeDetermination) {
      case 'cover':
        return {
          ...cardBase,
          type: 'alert',
        };
      case 'footerCard':
        return {
          ...cardBase,
          type: 'transmission_end',
          bodyTextP1: segment.mainTitle || '传输结束',
          bodyTextP2: segment.subtitle,
          bodyTextP3: segment.body || '所有数据流已归档。',
        };
      case 'detail':
      default:
        return {
          ...cardBase,
          type: 'news',
          fileInfo: segment.pageHeader || `片段 ${index + 1}`,
          date: new Date().toLocaleDateString(),
        };
    }
  };

  const handleGeneratePreviews = () => {
    setIsProcessing(true);
    try {
      const generatedCards = editingSegments.map((segment, index) =>
        generateCardData(segment, index, editingSegments.length)
      );
      
      localStorage.setItem('previewCards', JSON.stringify(generatedCards));
      router.push('/preview');
    } catch (error) {
      console.error('Error generating cards:', error);
      setIsProcessing(false);
      alert('生成卡片时发生错误，请重试。');
    }
  };
  
  return (
    <>
      <Head>
        <title>小红书图卡生成工具</title>
        <meta name="description" content="生成小红书风格的图文卡片" />
      </Head>
      
      <div className="app-container">
        <header className="app-header">
          <h1>小红书图卡生成工具</h1>
        </header>
        
        <main className="app-content">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'input' ? 'active' : ''}`}
              onClick={() => setActiveTab('input')}
            >
              1. 输入文本
            </button>
            <button 
              className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
              disabled={editingSegments.length === 0}
            >
              2. 编辑卡片
            </button>
          </div>
          
          {activeTab === 'input' ? (
            <div className="input-panel">
              <div className="input-container">
                <h2>输入内容</h2>
                <textarea
                  className="text-input"
                  value={bulkText}
                  onChange={handleBulkTextChange}
                  placeholder="在此处粘贴您的完整文本内容..."
                />
                
                <div className="format-guide">
                  <h3>内容格式说明</h3>
                  <ul>
                    <li><strong>卡片分隔:</strong> 使用 <code>---</code> 分隔不同卡片</li>
                    <li><strong>页眉:</strong> 以 <code>页眉：</code> 开头的行</li>
                    <li><strong>页脚:</strong> 以 <code>页脚：</code> 开头的行</li>
                    <li><strong>主标题:</strong> 以 <code>#</code> 开头的行</li>
                    <li><strong>副标题:</strong> 以 <code>###</code> 或 <code>副标题：</code> 开头的行</li>
                    <li><strong>正文:</strong> 其他所有内容</li>
                  </ul>
                </div>
                
                <button
                  className="primary-button"
                  onClick={handleSplitText}
                >
                  拆分内容并编辑
                </button>
              </div>
            </div>
          ) : (
            <div className="edit-panel">
              {editingSegments.length > 0 ? (
                <>
                  <h2>编辑卡片内容</h2>
                  <div className="segments-container">
                    {editingSegments.map((segment, index) => {
                      let segmentType = "详情页";
                      if (index === 0) segmentType = "封面页";
                      if (index === editingSegments.length - 1 && editingSegments.length > 1) segmentType = "结尾页";
                      
                      return (
                        <div key={segment.id} className="segment-card">
                          <div className="segment-header">
                            <h3>{segmentType} (卡片 {index + 1})</h3>
                          </div>
                          
                          <div className="segment-form">
                            <div className="form-group">
                              <label>页眉</label>
                              <input 
                                type="text" 
                                value={segment.pageHeader} 
                                onChange={(e) => handleSegmentFieldChange(index, 'pageHeader', e.target.value)} 
                                placeholder="页眉内容 (可选)" 
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>主标题</label>
                              <input 
                                type="text" 
                                value={segment.mainTitle} 
                                onChange={(e) => handleSegmentFieldChange(index, 'mainTitle', e.target.value)} 
                                placeholder="主标题" 
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>副标题</label>
                              <input 
                                type="text" 
                                value={segment.subtitle} 
                                onChange={(e) => handleSegmentFieldChange(index, 'subtitle', e.target.value)} 
                                placeholder="副标题 (可选)" 
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>正文</label>
                              <textarea
                                value={segment.body}
                                onChange={(e) => handleSegmentFieldChange(index, 'body', e.target.value)}
                                placeholder="卡片正文内容..."
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>页脚</label>
                              <input 
                                type="text" 
                                value={segment.pageFooter} 
                                onChange={(e) => handleSegmentFieldChange(index, 'pageFooter', e.target.value)} 
                                placeholder="页脚内容 (可选)" 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="action-buttons">
                    <button
                      className="secondary-button"
                      onClick={() => setActiveTab('input')}
                    >
                      返回编辑文本
                    </button>
                    
                    <button
                      className="primary-button"
                      onClick={handleGeneratePreviews}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "处理中..." : "生成卡片预览"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p>请先在输入页面粘贴文本内容并拆分</p>
                  <button
                    className="secondary-button"
                    onClick={() => setActiveTab('input')}
                  >
                    返回输入文本
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="app-footer">
          <p>小红书图卡生成工具 - 创造你的专属精彩卡片</p>
        </footer>
      </div>
    </>
  );
};

export default HomePage; 