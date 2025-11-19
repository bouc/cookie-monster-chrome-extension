document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn');
  const copyAllBtn = document.getElementById('copyAllBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const codeSections = document.getElementById('codeSections');

  let allCookiesData = {};

  // Helper to set placeholder if empty
  function setPlaceholders() {
    if (Object.keys(allCookiesData).length === 0) {
      codeSections.innerHTML = '<div class="code-section"><h2 class="code-title">Cookies</h2><div class="code-card"><pre class="code-block"><span class="placeholder">No data extracted yet</span></pre></div></div>';
      document.querySelector('.main-container').classList.add('no-data');
      document.querySelector('.main-container').classList.remove('has-data');
    }
  }

  // Helper to check if data is present
  function isDataPresent() {
    return Object.keys(allCookiesData).length > 0;
  }

  // Set Extract/Clear button state
  function updateExtractBtn() {
    const buttonRow = document.getElementById('buttonRow');
    if (isDataPresent()) {
      extractBtn.textContent = 'Clear';
      extractBtn.classList.remove('extract');
      extractBtn.classList.add('clear');
      buttonRow.classList.add('clear-mode');
    } else {
      extractBtn.textContent = 'Extract';
      extractBtn.classList.remove('clear');
      extractBtn.classList.add('extract');
      buttonRow.classList.remove('clear-mode');
    }
  }

  // Helper function to get display name for cookie (no capitalization)
  function getDisplayName(cookieName) {
    // Return cookie name as-is without any capitalization
    return cookieName;
  }

  // Render all cookie cards
  function renderCookies(cookiesData) {
    codeSections.innerHTML = '';
    
    // Update container class based on data presence
    const mainContainer = document.querySelector('.main-container');
    if (Object.keys(cookiesData).length > 0) {
      mainContainer.classList.add('has-data');
      mainContainer.classList.remove('no-data');
    } else {
      mainContainer.classList.add('no-data');
      mainContainer.classList.remove('has-data');
    }
    
    // Define priority order (User Agent moved to end)
    const priorityOrder = ['sessionid', 'csrftoken', 'datr', 'ds_user_id', 'ig_did', 'mid', 'rur', 'wd'];
    
    // Separate priority cookies, User Agent, and others
    const priorityCookies = [];
    const otherCookies = [];
    let userAgent = null;
    
    Object.keys(cookiesData).forEach(key => {
      if (key === 'User Agent') {
        userAgent = key;
      } else if (priorityOrder.includes(key)) {
        priorityCookies.push(key);
      } else {
        otherCookies.push(key);
      }
    });
    
    // Sort priority cookies according to priorityOrder
    priorityCookies.sort((a, b) => {
      return priorityOrder.indexOf(a) - priorityOrder.indexOf(b);
    });
    
    // Sort other cookies alphabetically
    otherCookies.sort();
    
    // Combine: priority first, then others, then User Agent at the end
    const sortedKeys = [...priorityCookies, ...otherCookies];
    if (userAgent) {
      sortedKeys.push(userAgent);
    }
    
    sortedKeys.forEach(cookieName => {
      const cookieValue = cookiesData[cookieName];
      
      const section = document.createElement('div');
      section.className = 'code-section';
      
      const title = document.createElement('h2');
      title.className = 'code-title';
      title.textContent = getDisplayName(cookieName);
      
      const card = document.createElement('div');
      card.className = 'code-card';
      
      const codeBlock = document.createElement('pre');
      codeBlock.className = 'code-block';
      codeBlock.textContent = cookieValue;
      codeBlock.style.cursor = 'pointer';
      
      // Add click to copy functionality
      codeBlock.addEventListener('click', async () => {
        const code = codeBlock.textContent;
        if (code.trim() === '' || code === 'No data extracted yet') return;
        await navigator.clipboard.writeText(code);
        codeBlock.classList.add('copied');
        const original = codeBlock.innerHTML;
        codeBlock.innerHTML = '<span class="placeholder">Copied!</span>';
        setTimeout(() => {
          codeBlock.innerHTML = original;
          codeBlock.classList.remove('copied');
        }, 900);
      });
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'center-copy-btn';
      copyBtn.innerHTML = '<span>📋</span>';
      copyBtn.title = 'Copy';
      
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const code = codeBlock.textContent;
        if (code.trim() === '' || code === 'No data extracted yet') return;
        await navigator.clipboard.writeText(code);
        copyBtn.innerHTML = '<span>✓</span>';
        setTimeout(() => {
          copyBtn.innerHTML = '<span>📋</span>';
        }, 900);
      });
      
      card.appendChild(codeBlock);
      card.appendChild(copyBtn);
      section.appendChild(title);
      section.appendChild(card);
      codeSections.appendChild(section);
    });
    
    if (sortedKeys.length === 0) {
      setPlaceholders();
    }
  }

  // Load saved data when popup opens
  chrome.storage.local.get(['savedCookiesData', 'savedUrl'], (result) => {
    if (result.savedCookiesData && result.savedUrl) {
      allCookiesData = result.savedCookiesData;
      renderCookies(allCookiesData);
    } else {
      setPlaceholders();
    }
    updateExtractBtn();
  });

  extractBtn.addEventListener('click', async () => {
    if (extractBtn.textContent === 'Extract') {
      // Extract data
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = new URL(tab.url);
      
      // Get the domain without www
      const domain = url.hostname.replace(/^www\./, '');
      
      // Get all cookies for the current domain
      chrome.cookies.getAll({ domain: domain }, (cookies) => {
        allCookiesData = {};
        
        // Add user agent
        allCookiesData['User Agent'] = navigator.userAgent;
        
        // Add each cookie
        cookies.forEach(cookie => {
          allCookiesData[cookie.name] = cookie.value;
        });
        
        // Also try to get cookies for the domain with www
        chrome.cookies.getAll({ domain: 'www.' + domain }, (wwwCookies) => {
          wwwCookies.forEach(cookie => {
            // Only add if not already present
            if (!allCookiesData[cookie.name]) {
              allCookiesData[cookie.name] = cookie.value;
            }
          });
          
          // Also get cookies for the base domain (without subdomain)
          const domainParts = domain.split('.');
          if (domainParts.length > 2) {
            const baseDomain = domainParts.slice(-2).join('.');
            chrome.cookies.getAll({ domain: baseDomain }, (baseCookies) => {
              baseCookies.forEach(cookie => {
                if (!allCookiesData[cookie.name]) {
                  allCookiesData[cookie.name] = cookie.value;
                }
              });
              
              renderCookies(allCookiesData);
              
              // Save the extracted data
              chrome.storage.local.set({
                savedCookiesData: allCookiesData,
                savedUrl: url.hostname
              }, updateExtractBtn);
            });
          } else {
            renderCookies(allCookiesData);
            
            // Save the extracted data
            chrome.storage.local.set({
              savedCookiesData: allCookiesData,
              savedUrl: url.hostname
            }, updateExtractBtn);
          }
        });
      });
    } else {
      // Clear data
      chrome.storage.local.remove(['savedCookiesData', 'savedUrl'], () => {
        allCookiesData = {};
        setPlaceholders();
        updateExtractBtn();
      });
    }
  });

  // Copy all data in display order
  copyAllBtn.addEventListener('click', async () => {
    if (Object.keys(allCookiesData).length === 0) return;
    
    // Use the same ordering logic as renderCookies
    const priorityOrder = ['sessionid', 'csrftoken', 'datr', 'ds_user_id', 'ig_did', 'mid', 'rur', 'wd'];
    
    const priorityCookies = [];
    const otherCookies = [];
    let userAgent = null;
    
    Object.keys(allCookiesData).forEach(key => {
      if (key === 'User Agent') {
        userAgent = key;
      } else if (priorityOrder.includes(key)) {
        priorityCookies.push(key);
      } else {
        otherCookies.push(key);
      }
    });
    
    priorityCookies.sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));
    otherCookies.sort();
    
    const sortedKeys = [...priorityCookies, ...otherCookies];
    if (userAgent) {
      sortedKeys.push(userAgent);
    }
    
    let allText = '';
    sortedKeys.forEach((key, index) => {
      allText += `${key}\n${allCookiesData[key]}`;
      if (index < sortedKeys.length - 1) {
        allText += '\n\n';
      }
    });
    
    await navigator.clipboard.writeText(allText);
    copyAllBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyAllBtn.textContent = 'Copy All';
    }, 900);
  });

  // Download all data as a .txt file in display order
  downloadBtn.addEventListener('click', () => {
    if (Object.keys(allCookiesData).length === 0) return;
    
    // Use the same ordering logic as renderCookies
    const priorityOrder = ['sessionid', 'csrftoken', 'datr', 'ds_user_id', 'ig_did', 'mid', 'rur', 'wd'];
    
    const priorityCookies = [];
    const otherCookies = [];
    let userAgent = null;
    
    Object.keys(allCookiesData).forEach(key => {
      if (key === 'User Agent') {
        userAgent = key;
      } else if (priorityOrder.includes(key)) {
        priorityCookies.push(key);
      } else {
        otherCookies.push(key);
      }
    });
    
    priorityCookies.sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));
    otherCookies.sort();
    
    const sortedKeys = [...priorityCookies, ...otherCookies];
    if (userAgent) {
      sortedKeys.push(userAgent);
    }
    
    let allText = '';
    sortedKeys.forEach((key, index) => {
      allText += `${key}\n${allCookiesData[key]}`;
      if (index < sortedKeys.length - 1) {
        allText += '\n\n';
      }
    });
    
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cookie-monster-export.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  });
});
