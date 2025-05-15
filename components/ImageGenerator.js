import React, { useEffect } from 'react';

// const initialCardsData = [ ... ]; // This is likely not needed anymore or needs to be re-evaluated

const ImageGenerator = ({ cardsData, onClearCard }) => { // Added onClearCard prop
  // const displayCards = cardsData && cardsData.length > 0 ? cardsData : initialCardsData; // Use cardsData directly
  const displayCards = cardsData || []; // Ensure displayCards is always an array

  useEffect(() => {
    // dom-to-image-more 已经通过 _document.js 全局加载
    // 等待 domtoimage 加载完成
    const checkDomToImage = setInterval(() => {
        if (typeof domtoimage !== 'undefined') {
            clearInterval(checkDomToImage);
            // initializeDownloadButtons(displayCards); // Download functionality was removed
        }
    }, 100);

    /* // Download function was removed
    function initializeDownloadButtons(currentCardsToProcess) {
        // ... ( पूरा कोड हटा दिया गया है )
    }
    */
    
    return () => {
        // Cleanup logic if any (related to download buttons, now removed)
    };
  // }, [displayCards]); // Removed displayCards from dependency array if initialCardsData is gone
  }, []); // Empty dependency array if it only runs once to check domtoimage

  if (!displayCards || displayCards.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-400 font-share-tech">请先通过上方步骤生成卡片预览。</p>
        <p className="text-md text-gray-500 mt-2">粘贴内容 → 拆分内容 → 编辑审核 → 生成卡片预览</p>
      </div>
    );
  }

  return (
    <div className="card-container-wrapper">
      <div id="card-container" className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCards.map((card) => {
          // Determine the main style class for the card based on card.style
          // The .card class is the base, and card-style-[stylename] applies overrides.
          const styleClassName = card.style ? `card-style-${card.style}` : 'card-style-cyberpunk'; // Default to cyberpunk if no style
          
          return (
            <div className={`card-wrapper bg-gray-800/50 p-1 rounded-lg shadow-xl flex flex-col ${styleClassName}`} key={card.id}>
              {/* The .card class itself will be styled by the styleClassName context */}
              <div className="card flex-grow flex flex-col" id={card.id}>
                {/* Page Header */} 
                {card.pageHeader && (
                  <div className="card-page-header p-2 text-xs text-cyan-300 border-b border-cyan-700/50">
                    {card.pageHeader}
                  </div>
                )}
                
                <div className="card-content flex-grow flex flex-col p-4"> {/* Added padding to card-content */}
                  {card.type === 'alert' && (
                    <>
                      <div className="card-header text-center">
                        <h2 className="card-title emphasis-core text-3xl">{card.title}</h2>
                        {card.subtitle && <p className="emphasis-highlight-alt text-xl mt-1">{card.subtitle}</p>}
                      </div>
                      <div className="card-body mt-4 flex-grow">
                        {card.body && card.body.map((item, index) => (
                          item.html ? 
                          <p key={index} className={`${item.class || 'text-gray-300'} mb-2`} dangerouslySetInnerHTML={{ __html: item.text || item.html }}></p> : 
                          <p key={index} className={`${item.class || 'text-gray-300'} mb-2`}>{item.text}</p>
                        ))}
                        {card.specialContent} 
                      </div>
                    </>
                  )}
                  {card.type === 'news' && (
                    <>
                      <div className="card-header">
                        {/* For news, fileInfo was used. We can repurpose or use pageHeader if more suitable */}
                        {/* <p className="emphasis-auxiliary">File: {card.fileInfo} // Date: {card.date}</p> */}
                        {/* If card.pageHeader is not used at top, it can be here like fileInfo */}
                        {/* Or we can use card.date directly if card.fileInfo isn't always card.pageHeader */} 
                        <p className="emphasis-auxiliary text-xs mb-1">{card.date} {card.fileInfo && card.fileInfo !== card.pageHeader ? `// ${card.fileInfo}` : ''}</p>
                        <h3 className="card-title emphasis-highlight-alt mt-1 font-audiowide text-2xl">{card.title}</h3>
                        {card.subtitle && <p className="text-purple-300 text-sm mt-1">{card.subtitle}</p>}
                      </div>
                      <div className="card-body mt-3 flex-grow">
                        {card.body && card.body.map((item, index) => {
                          if (item.type === 'p') {
                            return item.html ? 
                              <p key={index} className={`${item.class || 'text-gray-300'} mb-2`} dangerouslySetInnerHTML={{ __html: item.html }}></p> : 
                              <p key={index} className={`${item.class || 'text-gray-300'} mb-2`}>{item.text}</p>;
                          } else if (item.type === 'ul') {
                            return (
                              <ul key={index} className={`${item.class || 'list-disc list-inside text-gray-300 pl-4'} mb-2`}>
                                {item.items && item.items.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: li }}></li>)}
                              </ul>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </>
                  )}
                  {card.type === 'transmission_end' && (
                      <>
                          <div className="card-header text-center">
                               {/* For transmission_end, title was used as data-text, let actual title be visible and use bodyTextP1 as glitch */} 
                              <h2 className="card-title emphasis-core text-3xl">{card.title}</h2>
                              {/* Subtitle can be bodyTextP2 */} 
                              {card.subtitle && <p className="emphasis-highlight-alt text-xl mt-1">{card.subtitle}</p>}
                          </div>
                          <div className="card-body mt-4 flex-grow flex flex-col justify-center items-center text-center">
                              {/* bodyTextP1, P2, P3 are specific to old transmission_end. Use generic body if available */} 
                              {card.body && card.body.length > 0 && card.body.map((item, index) => (
                                  <p key={index} className={`${item.class || 'text-gray-300'} ${index === 0 ? 'text-xl emphasis-core' : 'text-md mt-2'} mb-1`}>{item.text}</p>
                              ))}
                              {(!card.body || card.body.length === 0) && (
                                  <>
                                      {card.bodyTextP2 && <p className="emphasis-highlight-alt mt-6 text-lg">{card.bodyTextP2}</p>}
                                      {card.bodyTextP3 && <p className="emphasis-highlight mt-2">{card.bodyTextP3}</p>}
                                  </> 
                              )}
                          </div>
                      </>
                  )}
                  {/* Generic Footer for all cards (from card.footer property, e.g. cardIndexInfo) */}
                  {/* 
                  {card.cardIndexInfo && 
                    <div className="card-footer-info text-center text-xs text-gray-500 pt-2 mt-auto border-t border-gray-700/50">
                      {card.cardIndexInfo}
                    </div>
                  }
                  */}
                </div>

                {/* Page Footer */} 
                {card.pageFooter && (
                  <div className="card-page-footer p-2 text-xs text-cyan-300 border-t border-cyan-700/50 mt-auto">
                    {card.pageFooter}
                  </div>
                )}
              </div>
              {onClearCard && (
                <button 
                  onClick={() => onClearCard(card.id)} 
                  className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 shrink-0"
                >
                  清除这张卡片
                </button>
              )}
            </div>
          );
        })}
      </div>
      {/* Download all button was here, removed */}
    </div>
  );
};

export default ImageGenerator; 