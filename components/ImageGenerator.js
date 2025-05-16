import React, { useEffect, useState } from 'react';

// Helper function to process inline markdown-like syntaxes
const processLineContent = (lineText) => {
  let processedLine = lineText;

  // Process `code` spans first to avoid conflicts with other syntaxes
  processedLine = processedLine.replace(/`([^`]+?)`/g, '<span class="inline-code">$1</span>');
  
  // Note: Simple regex like these might not handle all edge cases or nested structures perfectly.
  // For more complex markdown, a proper parser would be needed.
  return processedLine;
};

const ImageGenerator = ({ cardsData, onClearCard }) => { // Added onClearCard prop
  const displayCards = cardsData || []; // Ensure displayCards is always an array
  const [isDomToImageReady, setIsDomToImageReady] = useState(false);

  useEffect(() => {
    console.log('[ImageGenerator] useEffect: Starting to check for domtoimage.');
    let attempts = 0;
    const maxAttempts = 50; // Check for 5 seconds (50 * 100ms)

    // Initial check, in case it's already loaded (e.g. from cache)
    if (typeof domtoimage !== 'undefined') {
      console.log('[ImageGenerator] useEffect: domtoimage found on initial check!');
      setIsDomToImageReady(true);
      return; // Exit early
    }
    console.log('[ImageGenerator] useEffect: domtoimage NOT found on initial check. Starting interval check...');

    const checkDomToImageInterval = setInterval(() => {
      attempts++;
      if (typeof domtoimage !== 'undefined') {
        console.log(`[ImageGenerator] useEffect: domtoimage found after ${attempts} attempts.`);
        clearInterval(checkDomToImageInterval);
        setIsDomToImageReady(true);
      } else if (attempts >= maxAttempts) {
        console.error(`[ImageGenerator] useEffect: domtoimage NOT found after ${maxAttempts} attempts. The library might not be loading correctly or is not setting the global variable as expected. Please check the Network tab for script loading errors and ensure the script actually defines 'domtoimage'.`);
        clearInterval(checkDomToImageInterval);
      }
    }, 100);
    
    return () => {
      console.log('[ImageGenerator] useEffect: Cleanup. Clearing interval.');
      clearInterval(checkDomToImageInterval);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleDownloadCard = async (cardId, cardIndex) => {
    if (!isDomToImageReady) { // Check our state variable first
      alert('图片处理库仍在准备中，请稍等片刻后再试。');
      return;
    }
    // Fallback, though isDomToImageReady should be reliable
    if (typeof domtoimage === 'undefined') { 
      alert('图片处理库尚未加载完成，请稍后再试。');
      return;
    }
    const cardElement = document.getElementById(cardId);
    if (!cardElement) {
      alert('找不到要下载的卡片元素。');
      return;
    }

    // 1. 记录原始位置
    const originalParent = cardElement.parentNode;
    const originalNextSibling = cardElement.nextSibling;

    // 2. 创建包裹元素
    const captureWrapper = document.createElement('div');
    captureWrapper.id = 'temp-capture-wrapper'; // 给个ID方便调试，虽然不一定必须

    // 获取当前卡片的主题样式类 (复用ImageGenerator组件内部的逻辑)
    const currentCardData = displayCards.find(c => c.id === cardId);
    const themeStyleClass = currentCardData && currentCardData.style ? `card-style-${currentCardData.style}` : 'card-style-cyberpunk';
    captureWrapper.className = themeStyleClass; // 应用主题样式类到包裹层

    // 确保页眉页脚元素可见 - 无论是什么卡片类型
    if (currentCardData && currentCardData.pageHeader) {
      const headerElements = cardElement.querySelectorAll('.card-page-header');
      headerElements.forEach(el => {
        el.style.display = 'block';
      });
    }
    
    if (currentCardData && currentCardData.pageFooter) {
      const footerElements = cardElement.querySelectorAll('.card-page-footer');
      footerElements.forEach(el => {
        el.style.display = 'block';
      });
    }

    Object.assign(captureWrapper.style, {
      width: '510px',
      height: '660px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      backgroundColor: themeStyleClass === 'card-style-cyberpunk' ? '#1A1A1A' : 'transparent', // 赛博朋克使用黑色背景
    });

    try {
      // 3. 移动卡片到包裹元素，并将包裹元素添加到body
      captureWrapper.appendChild(cardElement); // 移动 cardElement
      document.body.appendChild(captureWrapper);

      // 增加一点延时，确保所有异步加载的图片（如果有的话）渲染完成
      // 以及所有CSS动画和过渡效果稳定下来，并且DOM更新被浏览器处理
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      const options = { 
        quality: 1.0,
        bgcolor: themeStyleClass === 'card-style-cyberpunk' ? '#1A1A1A' : 'transparent', // 赛博朋克使用黑色背景
        width: 510,    
        height: 660,  
      };

      // 4. 截取包裹元素
      const dataUrl = await domtoimage.toPng(captureWrapper, options);
      const link = document.createElement('a');
      const fileName = `卡片_${String(cardIndex + 1).padStart(3, '0')}.png`;
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link); 
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('下载卡片时出错:', error);
      alert('下载卡片失败，请查看控制台获取更多信息。');
    } finally {
      // 5. 清理和恢复DOM
      // 把卡片元素从captureWrapper移回原始位置
      if (originalParent) {
        if (originalNextSibling) {
          originalParent.insertBefore(cardElement, originalNextSibling);
        } else {
          originalParent.appendChild(cardElement);
        }
      }
      // 移除包裹元素
      if (captureWrapper.parentNode === document.body) {
        document.body.removeChild(captureWrapper);
      }
    }
  };

  const handleDownloadAllCards = async () => {
    if (!isDomToImageReady) { // Check our state variable first
      alert('图片处理库仍在准备中，请稍等片刻后再试。');
      return;
    }
    // Fallback
    if (typeof domtoimage === 'undefined') {
      alert('图片处理库尚未加载完成，请稍后再试。');
      return;
    }
    if (!displayCards || displayCards.length === 0) {
      alert('没有可下载的卡片。');
      return;
    }

    for (let i = 0; i < displayCards.length; i++) {
      const card = displayCards[i];
      // 最好给一个小的延迟，避免同时触发过多下载导致浏览器阻塞或警告
      await new Promise(resolve => setTimeout(resolve, 500)); 
      console.log(`准备下载卡片 ${i + 1}: ${card.id}`);
      await handleDownloadCard(card.id, i);
    }
    alert(`${displayCards.length} 张卡片已开始下载！`);
  };

  if (!displayCards || displayCards.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p className="mt-4 text-gray-500 font-medium">请先通过上方步骤生成卡片预览</p>
          <p className="mt-2 text-sm text-gray-400">粘贴内容 → 拆分内容 → 编辑审核 → 生成卡片预览</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-container-wrapper">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCards.map((card, index) => {
            // 确定卡片样式类
            const styleClassName = card.style ? `card-style-${card.style}` : 'card-style-cyberpunk';
            
            return (
              <div className={`card-wrapper overflow-hidden flex flex-col ${styleClassName} h-full`} key={card.id}>
                <div className="card flex-grow flex flex-col" id={card.id}>
                  {/* 页眉 - 确保所有卡片类型都有页眉 */}
                  {card.pageHeader && (
                    <div className="card-page-header">
                      {card.pageHeader}
                    </div>
                  )}
                  
                  <div className="card-content flex-grow flex flex-col"> 
                    {card.type === 'alert' && (
                      <>
                        <div className="card-header text-center">
                          <h2 className="card-title">{card.title}</h2>
                          {card.subtitle && <p className="text-lg mt-1">{card.subtitle}</p>}
                        </div>
                        <div className="card-body mt-4 flex-grow">
                          {card.body && card.body.map((item, index) => {
                            const lineText = item.text || '';
                            if (lineText.startsWith('//')) {
                              // 在注释内容前添加加强样式标记，使其更醒目
                              const commentContent = lineText.substring(2).trimStart();
                              return <p key={index} className={`body-comment ${item.class || ''} mb-2`} dangerouslySetInnerHTML={{ __html: `<span style="color:#00FFFF;font-weight:bold;">//</span> ${processLineContent(commentContent)}` }}></p>;
                            } else if (lineText.startsWith('>')) {
                              return <blockquote key={index} className={`${item.class || ''} mb-2`} dangerouslySetInnerHTML={{ __html: processLineContent(lineText.substring(1).trimStart()) }}></blockquote>;
                            } else {
                              return <p key={index} className={`${item.class || ''} mb-2`} dangerouslySetInnerHTML={{ __html: processLineContent(lineText) }}></p>;
                            }
                          })}
                          {card.specialContent} 
                        </div>
                      </>
                    )}
                    {card.type === 'news' && (
                      <>
                        <div className="card-header">
                          <p className="text-xs mb-1">{card.date} {card.fileInfo && card.fileInfo !== card.pageHeader ? `// ${card.fileInfo}` : ''}</p>
                          <h3 className="card-title mt-1">{card.title}</h3>
                          {card.subtitle && <p className="text-sm mt-1">{card.subtitle}</p>}
                        </div>
                        <div className="card-body mt-3 flex-grow">
                          {card.body && card.body.map((item, index) => {
                            const lineText = item.text || '';
                            if (lineText.startsWith('//')) {
                              // 在注释内容前添加加强样式标记，使其更醒目
                              const commentContent = lineText.substring(2).trimStart();
                              return <p key={index} className={`body-comment ${item.class || ''} mb-2`} dangerouslySetInnerHTML={{ __html: `<span style="color:#00FFFF;font-weight:bold;">//</span> ${processLineContent(commentContent)}` }}></p>;
                            } else if (lineText.startsWith('>')) {
                              return <blockquote key={index} className={`${item.class || ''} mb-2`} dangerouslySetInnerHTML={{ __html: processLineContent(lineText.substring(1).trimStart()) }}></blockquote>;
                            } else if (item.type === 'ul' && item.items) {
                               return (
                                <ul key={index} className={`${item.class || 'list-disc list-inside'} mb-2`}>
                                  {item.items.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processLineContent(li) }}></li>)}
                                </ul>
                              );
                            } else {
                              return <p key={index} className={`${item.class || ''} mb-2`} dangerouslySetInnerHTML={{ __html: processLineContent(lineText) }}></p>;
                            }
                          })}
                        </div>
                      </>
                    )}
                    {card.type === 'transmission_end' && (
                        <>
                            <div className="card-header text-center">
                                <h2 className="card-title">{card.title}</h2>
                                {card.subtitle && <p className="text-lg mt-1">{card.subtitle}</p>}
                            </div>
                            <div className="card-body mt-4 flex-grow flex flex-col justify-center items-center text-center">
                                {card.body && card.body.length > 0 && card.body.map((item, index) => {
                                  const lineText = item.text || '';
                                  if (lineText.startsWith('//')) {
                                    // 在注释内容前添加加强样式标记，使其更醒目
                                    const commentContent = lineText.substring(2).trimStart();
                                    return <p key={index} className={`body-comment ${item.class || ''} ${index === 0 ? 'text-lg' : 'text-md mt-2'} mb-1`} dangerouslySetInnerHTML={{ __html: `<span style="color:#00FFFF;font-weight:bold;">//</span> ${processLineContent(commentContent)}` }}></p>;
                                  } else if (lineText.startsWith('>')) {
                                    return <blockquote key={index} className={`${item.class || ''} ${index === 0 ? 'text-lg' : 'text-md mt-2'} mb-1`} dangerouslySetInnerHTML={{ __html: processLineContent(lineText.substring(1).trimStart()) }}></blockquote>;
                                  } else {
                                    return <p key={index} className={`${item.class || ''} ${index === 0 ? 'text-lg' : 'text-md mt-2'} mb-1`} dangerouslySetInnerHTML={{ __html: processLineContent(lineText) }}></p>;
                                  }
                                })}
                                {(!card.body || card.body.length === 0) && (
                                    <>
                                        {card.bodyTextP2 && <p className="text-gray-700 mt-4 text-lg" dangerouslySetInnerHTML={{__html: processLineContent(card.bodyTextP2)}}></p>}
                                        {card.bodyTextP3 && <p className="text-gray-600 mt-2" dangerouslySetInnerHTML={{__html: processLineContent(card.bodyTextP3)}}></p>}
                                    </> 
                                )}
                            </div>
                        </>
                    )}
                  </div>

                  {/* 页脚 - 确保所有卡片类型都有页脚 */}
                  {card.pageFooter && (
                    <div className="card-page-footer">
                      {card.pageFooter}
                    </div>
                  )}
                </div>
                
                {/* 卡片操作按钮 - 保持在卡片外部，不影响生成的图片 */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex space-x-3">
                  {onClearCard && (
                    <button 
                      onClick={() => onClearCard(card.id)} 
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                      删除卡片
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadCard(card.id, index)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    disabled={!isDomToImageReady}
                  >
                    {isDomToImageReady ? '下载' : '加载中...'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 下载全部按钮 */}
        {displayCards && displayCards.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleDownloadAllCards}
              className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 inline-flex items-center"
              disabled={!isDomToImageReady}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              {isDomToImageReady ? `下载全部 ${displayCards.length} 张卡片` : '加载中...'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator; 