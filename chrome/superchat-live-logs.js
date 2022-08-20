// © Copyright 2022-Present by Jonathan Chan. All rights reserved.

(()=>{
if (typeof window.superchatLiveLogLoaded === 'undefined') {
    window.superchatLiveLogLoaded = true;

    const chatItemsQuery = '#items.style-scope.yt-live-chat-item-list-renderer';
    const chatPanelQuery = '#chat.style-scope.yt-live-chat-renderer';
    const showMoreButtonQuery = '#show-more.style-scope.yt-live-chat-item-list-renderer';
    const chatDisplayTypeQuery = 'a.yt-simple-endpoint.style-scope.yt-dropdown-menu';
    const waitingModeMessage = 'superchats will be logged here';
    const waitingModeNotification = 'New Superchat(s)! Click Next!';
    const showMoreButtonWarning = 'superchat live log can\'t update while chat is scrolled up';
    const maxAutoSeconds = 4; // Any longer and users may conclude it's not working after activating chat
    
    //--yt-live-chat-paid-message-secondary-color
    //--yt-live-chat-paid-sticker-background-color
    //--yt-live-chat-sponsor-header-color
    const superchatPaymentLevel = {
        oneToTwoUSD: {
            expirationTime: 60,
            bgColor: 'rgba(21,101,192,1)',
            bgColorInt: 4279592384,
        },
        twoToFiveUSD: {
            expirationTime: 90,
            bgColor: 'rgba(0,184,212,1)',
            bgColorInt: 4278237396,
        },
        fiveToTenUSD: {
            expirationTime: 120,
            bgColor: 'rgba(0,191,165,1)',
            bgColorInt: 4278239141,
        },
        tenToTwentyUSD: {
            expirationTime: 300,
            bgColor: 'rgba(255,179,0,1)',
            bgColorInt: 4294947584,
        },
        twentyToFiftyUSD: {
            expirationTime: 600,
            bgColor: 'rgba(230,81,0,1)',
            bgColorInt: 4293284096,
        },
        fiftyToHundredUSD: {
            expirationTime: 1800,
            bgColor: 'rgba(194,24,91,1)',
            bgColorInt: 4290910299,
        },
        hundredToHalfGrandUSD: {
            expirationTime: 3600,
            bgColor: 'rgba(208,0,0,1)',
            bgColorInt: 4291821568,
        },
        member: {
            expirationTime: 300,
            bgColor: 'rgba(10,128,67,1)',
        },
        donation: {
            expirationTime: 300,
            bgColor: 'rgba(128,128,128,0.12)',
        }
    };

    // yt-live-chat-ticker-sponsor-item-renderer : temp1.data.showItemEndpoint.showLiveChatItemEndpoint.renderer.liveChatMembershipItemRenderer.id
    // yt-live-chat-ticker-sponsor-item-renderer : temp4.data.showItemEndpoint.showLiveChatItemEndpoint.renderer.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer.id
    // yt-live-chat-ticker-paid-message-item-renderer : temp2.data.showItemEndpoint.showLiveChatItemEndpoint.renderer.liveChatPaidMessageRenderer.id
    // yt-live-chat-ticker-paid-sticker-item-renderer : temp3.data.showItemEndpoint.showLiveChatItemEndpoint.renderer.liveChatPaidStickerRenderer.id
    
    
    let chatItems = null, showMoreButton = null, chatPanel = null, chatTypeButtons = [];
    let autoreconnectTimeout = 1000, autoloadTimeout = 1000;
    let controlBox = null, liveLogBox = null, pinAnimatorContainer = null, optionsBox = null, liveLogBoxContainer = null, autoloadId = null, autoreconnectId = null;
    let maxHistorySizeInput = null, scrolledUpWarningButton1 = null, scrolledUpWarningButton2 = null, scrolledUpWarningButton3 = null;
    let superchatLiveLogsObserver = null;
    let extensionSettings = null;
    function debounce(callback, wait) {
        let timeout;
        return function(e) {
            clearTimeout(timeout);
        
            timeout = setTimeout(() => {
                callback(e);
            }, wait);
        }
    }

    function reconnectButtonProxyFunc() {
        autoreconnect();
    }
    
    function chatItemsClickedProxyFunc() {
        document.dispatchEvent(new CustomEvent('sllChatItemsClicked'));
    }
    
    function connectHandles() {
        let connected = true;
    
        // console.log('Reconnecting buttons');
    
        chatItems = showMoreButton = chatPanel = null;
        chatTypeButtons = [];
        if (window.location.pathname.indexOf('/watch') === 0) {
            const chatFrame = document.querySelector('#chatframe');
            if (chatFrame !== null) {
                chatItems = chatFrame.contentDocument.querySelector(chatItemsQuery);
                showMoreButton = chatFrame.contentDocument.querySelector(showMoreButtonQuery);
                chatPanel = chatFrame.contentDocument.querySelector(chatPanelQuery);
                chatTypeButtons = chatFrame.contentDocument.querySelectorAll(chatDisplayTypeQuery);

            }
        }
        else if (window.location.pathname.indexOf('/video/') === 0 && window.location.pathname.indexOf('/livestreaming') === window.location.pathname.length - '/livestreaming'.length
                || window.location.pathname.indexOf('/live_chat') === 0) {
            chatItems = document.querySelector(chatItemsQuery);
            showMoreButton = document.querySelector(showMoreButtonQuery);
            chatPanel = document.querySelector(chatPanelQuery);
            chatTypeButtons = document.querySelectorAll(chatDisplayTypeQuery);
        }
    
        if (chatItems === null || showMoreButton === null || chatPanel === null || chatTypeButtons.length === 0) {
            connected = false;
            // console.log('Button Reconnection Failed');
        }
        else {
            // console.log('Button Reconnection Succeeded');
            chatTypeButtons.forEach(button => {
                button.removeEventListener('click', reconnectButtonProxyFunc);
                button.addEventListener('click', reconnectButtonProxyFunc);
            });
    
            const showMoreButtonTag = showMoreButton.querySelector('#button.style-scope.yt-icon-button');
            if (showMoreButtonTag.textContent.indexOf(showMoreButtonWarning) === -1) {
                showMoreButton.style.backgroundColor = '#c00'; // #2196f3
                showMoreButton.style.width = '192px'; // 32px
                showMoreButton.style.height = '64px'; // 32px
                showMoreButton.style.fontSize = '1rem'; // 0px
                showMoreButton.style.margin = '0 calc(50% - 96px) 8px calc(50% - 96px)'; // 0 calc(50% - 16px) 8px calc(50% - 16px)
        
                const showMoreButtonLabel = document.createElement('span');
                showMoreButtonLabel.setAttribute('class', 'sll-show-more-warning');
                showMoreButtonTag.style.height = 'auto'; // 100%
                showMoreButtonTag.style.lineHeight = '1.5rem'; // normal
                showMoreButtonTag.style.padding = '0 1.5rem'; // 0
                showMoreButtonTag.style.fontSize = '1rem'; // 0px
                showMoreButtonLabel.append(showMoreButtonWarning);
                showMoreButtonTag.prepend(showMoreButtonLabel);
        
                const showMoreButtonIcon = showMoreButton.querySelector('yt-icon.style-scope.yt-live-chat-item-list-renderer > svg');
                showMoreButtonIcon.style.width = '24px'; // 100%
                showMoreButtonIcon.style.height = '24px'; // 100%
            }
    
            chatItems.addEventListener('mousedown', chatItemsClickedProxyFunc);
        }
    
        return connected;
    }
    
    
    function startSuperchatLiveLogs() {
        if (chatItems !== null) {
            let currentChildIndex = -1;
            let highestChildIndexSeen = -1;
            let waitingModeOn = true;
            let currentSuperchats = [];
            let superchatLinkedNodes = {};
            let currentSuperchatExpired = false;
            let highlightedSuperchatExpired = false;
            let scrollingToSuperchat = false;
            let labelBreaker = document.createTextNode('\x20');

            function handleChatItemsClick() {
                // const disappearingHeight = liveLogBox.clientHeight;
                // const itemScroller = chatPanel.querySelector('#item-scroller');
                // const originalScrollTop = itemScroller.scrollTop;
                hideVisibilityEye();
                // itemScroller.scrollTo(0, originalScrollTop - disappearingHeight - 1);
            }
            document.addEventListener('sllChatItemsClicked', handleChatItemsClick);
    
            liveLogBoxContainer = document.createElement('div');
            liveLogBoxContainer.setAttribute('id', 'sll-liveLogBoxContainer')
            liveLogBoxContainer.style.overflow = 'hidden';
            liveLogBoxContainer.style.position = 'relative';
            liveLogBoxContainer.style.zIndex = '12';
            liveLogBoxContainer.style.borderBottom = '1px solid #88888838';
    
            optionsBox = document.createElement('div');
            optionsBox.style.display = 'none';
    
            const superchatConfigurationFieldSet = document.createElement('fieldset');
            superchatConfigurationFieldSet.style.borderTop = '1px solid darkgray';
            superchatConfigurationFieldSet.style.margin = '0 0.2rem 0.6rem';
            superchatConfigurationFieldSet.style.padding = '0.2rem 0.4rem';
            superchatConfigurationFieldSet.style.height = '0';
            superchatConfigurationFieldSet.style.overflow = 'hidden';
    
            const superchatConfigurationLegend = document.createElement('legend');
            superchatConfigurationLegend.style.margin = '0 0 0 1.5rem';
            superchatConfigurationLegend.style.fontSize = '1rem';
            superchatConfigurationLegend.style.cursor = 'pointer';
            superchatConfigurationLegend.style.padding = '0 0.5rem';
            superchatConfigurationLegend.style.borderRadius = '4px';
            superchatConfigurationLegend.style.backgroundColor = '#606060';
            superchatConfigurationLegend.style.color = '#fff';
            superchatConfigurationLegend.textContent = 'superchat configuration [ + ]';
            superchatConfigurationFieldSet.append(superchatConfigurationLegend);
            superchatConfigurationLegend.addEventListener('click', function(){
                if (superchatConfigurationFieldSet.style.overflow === 'hidden') {
                    superchatConfigurationFieldSet.style.height = 'auto';
                    superchatConfigurationFieldSet.style.overflow = 'visible';
                    superchatConfigurationLegend.style.backgroundColor = 'inherit';
                    superchatConfigurationLegend.style.color = 'inherit';
                    superchatConfigurationLegend.textContent = 'superchat configuration [ – ]';
                }
                else {
                    superchatConfigurationFieldSet.style.height = '0';
                    superchatConfigurationFieldSet.style.overflow = 'hidden';
                    superchatConfigurationLegend.style.backgroundColor = '#606060';
                    superchatConfigurationLegend.style.color = '#fff';
                    superchatConfigurationLegend.textContent = 'superchat configuration [ + ]';
                }

                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'showSuperchatConfiguration': superchatConfigurationFieldSet.style.overflow === 'visible',
                        }
                    }));
                }
            });
            optionsBox.append(superchatConfigurationFieldSet);

            const superchatsExpireLabel = document.createElement('label');
            superchatsExpireLabel.style.backgroundColor = 'rgba(128,32,128,1)';
            superchatsExpireLabel.style.borderRadius = '0.6rem';
            superchatsExpireLabel.style.cursor = 'pointer';
            superchatsExpireLabel.style.fontSize = '1rem';
            superchatsExpireLabel.style.padding = '0 0.75rem 0 0';
            superchatsExpireLabel.style.whiteSpace = 'nowrap';
            const superchatsExpireText = document.createElement('span');
            superchatsExpireText.style.color = '#fff';
            superchatsExpireText.textContent = 'superchats expire';
            superchatsExpireLabel.append(superchatsExpireText);
            const superchatsExpireCheckbox = document.createElement('input');
            superchatsExpireCheckbox.setAttribute('type', 'checkbox');
            superchatsExpireCheckbox.checked = true;
            superchatsExpireCheckbox.style.height = '1rem';
            superchatsExpireCheckbox.style.cursor = 'pointer';
            superchatsExpireCheckbox.addEventListener('change', function(event){
                if (event.currentTarget.checked) {
                    pinAnimator.unpause();
                }
                else {
                    pinAnimator.pause();
                }
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'superchatsExpireCheckbox': superchatsExpireCheckbox.checked,
                        }
                    }));
                }
            });
            superchatsExpireLabel.prepend(superchatsExpireCheckbox);
            superchatConfigurationFieldSet.append(superchatsExpireLabel);
            superchatConfigurationFieldSet.append(labelBreaker.cloneNode());
    
            const showExpiredSuperchatsLabel = document.createElement('label');
            showExpiredSuperchatsLabel.style.backgroundColor = 'rgba(128,32,128,1)';
            showExpiredSuperchatsLabel.style.borderRadius = '0.6rem';
            showExpiredSuperchatsLabel.style.cursor = 'pointer';
            showExpiredSuperchatsLabel.style.fontSize = '1rem';
            showExpiredSuperchatsLabel.style.padding = '0 0.75rem 0 0';
            showExpiredSuperchatsLabel.style.whiteSpace = 'nowrap';
            const showExpiredSuperchatsText = document.createElement('span');
            showExpiredSuperchatsText.style.color = '#fff';
            showExpiredSuperchatsText.textContent = 'show expired superchats';
            showExpiredSuperchatsLabel.append(showExpiredSuperchatsText);
            const showExpiredSuperchatsCheckbox = document.createElement('input');
            showExpiredSuperchatsCheckbox.setAttribute('type', 'checkbox');
            showExpiredSuperchatsCheckbox.checked = false;
            showExpiredSuperchatsCheckbox.style.height = '1rem';
            showExpiredSuperchatsCheckbox.style.cursor = 'pointer';
            showExpiredSuperchatsCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'showExpiredSuperchatsCheckbox': showExpiredSuperchatsCheckbox.checked,
                        }
                    }));
                }
            });
            showExpiredSuperchatsLabel.prepend(showExpiredSuperchatsCheckbox);
            superchatConfigurationFieldSet.append(showExpiredSuperchatsLabel);
            superchatConfigurationFieldSet.append(labelBreaker.cloneNode());
    
            const showRemovedSuperchatsLabel = document.createElement('label');
            showRemovedSuperchatsLabel.style.backgroundColor = 'rgba(128,32,128,1)';
            showRemovedSuperchatsLabel.style.borderRadius = '0.6rem';
            showRemovedSuperchatsLabel.style.cursor = 'pointer';
            showRemovedSuperchatsLabel.style.fontSize = '1rem';
            showRemovedSuperchatsLabel.style.padding = '0 0.75rem 0 0';
            showRemovedSuperchatsLabel.style.whiteSpace = 'nowrap';
            const showRemovedSuperchatsText = document.createElement('span');
            showRemovedSuperchatsText.style.color = '#fff';
            showRemovedSuperchatsText.textContent = 'show removed superchats';
            showRemovedSuperchatsLabel.append(showRemovedSuperchatsText);
            const showRemovedSuperchatsCheckbox = document.createElement('input');
            showRemovedSuperchatsCheckbox.setAttribute('type', 'checkbox');
            showRemovedSuperchatsCheckbox.checked = false;
            showRemovedSuperchatsCheckbox.style.height = '1rem';
            showRemovedSuperchatsCheckbox.style.cursor = 'pointer';
            showRemovedSuperchatsCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'showRemovedSuperchatsCheckbox': showRemovedSuperchatsCheckbox.checked,
                        }
                    }));
                }
            });
            showRemovedSuperchatsLabel.prepend(showRemovedSuperchatsCheckbox);
            superchatConfigurationFieldSet.append(showRemovedSuperchatsLabel);
            superchatConfigurationFieldSet.append(labelBreaker.cloneNode());
    
            const minidisplayVisibleLabel = document.createElement('label');
            minidisplayVisibleLabel.style.backgroundColor = 'rgba(128,32,32,1)';
            minidisplayVisibleLabel.style.borderRadius = '0.6rem';
            minidisplayVisibleLabel.style.cursor = 'pointer';
            minidisplayVisibleLabel.style.fontSize = '1rem';
            minidisplayVisibleLabel.style.padding = '0 0.75rem 0 0';
            minidisplayVisibleLabel.style.whiteSpace = 'nowrap';
            const minidisplayVisibleText = document.createElement('span');
            minidisplayVisibleText.style.color = '#fff';
            minidisplayVisibleText.textContent = 'show minidisplay';
            minidisplayVisibleLabel.append(minidisplayVisibleText);
            const minidisplayVisibleCheckbox = document.createElement('input');
            minidisplayVisibleCheckbox.setAttribute('type', 'checkbox');
            minidisplayVisibleCheckbox.checked = true;
            minidisplayVisibleCheckbox.style.height = '1rem';
            minidisplayVisibleCheckbox.style.cursor = 'pointer';
            minidisplayVisibleCheckbox.addEventListener('change', function(event){
                if (event.currentTarget.checked) {
                    pinAnimatorContainer.style.position = 'relative';
                    pinAnimatorContainer.style.top = 'auto';
                }
                else {
                    pinAnimatorContainer.style.position = 'absolute';
                    pinAnimatorContainer.style.top = '-100vh';
                }
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'minidisplayVisibleCheckbox': minidisplayVisibleCheckbox.checked,
                        }
                    }));
                }
            });
            minidisplayVisibleLabel.prepend(minidisplayVisibleCheckbox);
            superchatConfigurationFieldSet.append(minidisplayVisibleLabel);
            superchatConfigurationFieldSet.append(labelBreaker.cloneNode());

            const filtersFieldSet = document.createElement('fieldset');
            filtersFieldSet.style.borderTop = '1px solid darkgray';
            filtersFieldSet.style.margin = '0 0.2rem 0.6rem';
            filtersFieldSet.style.padding = '0.2rem 0.4rem';
            filtersFieldSet.style.height = '0';
            filtersFieldSet.style.overflow = 'hidden';
    
            const filtersLegend = document.createElement('legend');
            filtersLegend.style.margin = '0 0 0 1.5rem';
            filtersLegend.style.fontSize = '1rem';
            filtersLegend.style.cursor = 'pointer';
            filtersLegend.style.padding = '0 0.5rem';
            filtersLegend.style.borderRadius = '4px';
            filtersLegend.style.backgroundColor = '#606060';
            filtersLegend.style.color = '#fff';
            filtersLegend.textContent = 'filter selection [ + ]';
            filtersFieldSet.append(filtersLegend);
            filtersLegend.addEventListener('click', function(){
                if (filtersFieldSet.style.overflow === 'hidden') {
                    filtersFieldSet.style.height = 'auto';
                    filtersFieldSet.style.overflow = 'visible';
                    filtersLegend.style.backgroundColor = 'inherit';
                    filtersLegend.style.color = 'inherit';
                    filtersLegend.textContent = 'filter selection [ – ]';
                }
                else {
                    filtersFieldSet.style.height = '0';
                    filtersFieldSet.style.overflow = 'hidden';
                    filtersLegend.style.backgroundColor = '#606060';
                    filtersLegend.style.color = '#fff';
                    filtersLegend.textContent = 'filter selection [ + ]';
                }

                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'showFilterSelection': filtersFieldSet.style.overflow === 'visible',
                        }
                    }));
                }
            });
    
            const filterColumns = document.createElement('div');
            filterColumns.style.display = 'flex';
            filterColumns.style.justifyContent = 'space-evenly';
            filterColumns.style.margin = '0 auto';
            filterColumns.style.textAlign = 'center';
    
            const filterColumnA = document.createElement('div');
    
            const darkblueLabel = document.createElement('label');
            darkblueLabel.style.backgroundColor = 'rgba(21,101,192,1)';
            darkblueLabel.style.borderRadius = '0.6rem';
            darkblueLabel.style.cursor = 'pointer';
            darkblueLabel.style.fontSize = '1rem';
            darkblueLabel.style.padding = '0 0.75rem 0 0';
            darkblueLabel.style.whiteSpace = 'nowrap';
            const darkblueText = document.createElement('span');
            darkblueText.style.color = '#fff';
            darkblueText.textContent = '$1-$2';
            darkblueLabel.append(darkblueText);
            const darkblueCheckbox = document.createElement('input');
            darkblueCheckbox.setAttribute('type', 'checkbox');
            darkblueCheckbox.checked = true;
            darkblueCheckbox.style.height = '1rem';
            darkblueCheckbox.style.cursor = 'pointer';
            darkblueCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'darkblueCheckbox': darkblueCheckbox.checked,
                        }
                    }));
                }
            });
            darkblueLabel.prepend(darkblueCheckbox);
            filterColumnA.append(darkblueLabel);
    
            filterColumnA.append(document.createElement('br'));
    
            const lightblueLabel = document.createElement('label');
            lightblueLabel.style.backgroundColor = 'rgba(0,184,212,1)';
            lightblueLabel.style.borderRadius = '0.6rem';
            lightblueLabel.style.cursor = 'pointer';
            lightblueLabel.style.fontSize = '1rem';
            lightblueLabel.style.padding = '0 0.75rem 0 0';
            lightblueLabel.style.whiteSpace = 'nowrap';
            const lightblueText = document.createElement('span');
            lightblueText.style.color = '#030303';
            lightblueText.textContent = '$2-$5';
            lightblueLabel.append(lightblueText);
            const lightblueCheckbox = document.createElement('input');
            lightblueCheckbox.setAttribute('type', 'checkbox');
            lightblueCheckbox.checked = true;
            lightblueCheckbox.style.height = '1rem';
            lightblueCheckbox.style.cursor = 'pointer';
            lightblueCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'lightblueCheckbox': lightblueCheckbox.checked,
                        }
                    }));
                }
            });
            lightblueLabel.prepend(lightblueCheckbox);
            filterColumnA.append(lightblueLabel);
    
            filterColumnA.append(document.createElement('br'));
    
            const greenLabel = document.createElement('label');
            greenLabel.style.backgroundColor = 'rgba(0,191,165,1)';
            greenLabel.style.borderRadius = '0.6rem';
            greenLabel.style.cursor = 'pointer';
            greenLabel.style.fontSize = '1rem';
            greenLabel.style.padding = '0 0.75rem 0 0';
            greenLabel.style.whiteSpace = 'nowrap';
            const greenText = document.createElement('span');
            greenText.style.color = '#030303';
            greenText.textContent = '$5-$10';
            greenLabel.append(greenText);
            const greenCheckbox = document.createElement('input');
            greenCheckbox.setAttribute('type', 'checkbox');
            greenCheckbox.checked = true;
            greenCheckbox.style.height = '1rem';
            greenCheckbox.style.cursor = 'pointer';
            greenCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'greenCheckbox': greenCheckbox.checked,
                        }
                    }));
                }
            });
            greenLabel.prepend(greenCheckbox);
            filterColumnA.append(greenLabel);
    
            filterColumnA.append(document.createElement('br'));
    
            const yellowLabel = document.createElement('label');
            yellowLabel.style.backgroundColor = 'rgba(255,179,0,1)';
            yellowLabel.style.borderRadius = '0.6rem';
            yellowLabel.style.cursor = 'pointer';
            yellowLabel.style.fontSize = '1rem';
            yellowLabel.style.padding = '0 0.75rem 0 0';
            yellowLabel.style.whiteSpace = 'nowrap';
            const yellowText = document.createElement('span');
            yellowText.style.color = '#030303';
            yellowText.textContent = '$10-$20';
            yellowLabel.append(yellowText);
            const yellowCheckbox = document.createElement('input');
            yellowCheckbox.setAttribute('type', 'checkbox');
            yellowCheckbox.checked = true;
            yellowCheckbox.style.height = '1rem';
            yellowCheckbox.style.cursor = 'pointer';
            yellowCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'yellowCheckbox': yellowCheckbox.checked,
                        }
                    }));
                }
            });
            yellowLabel.prepend(yellowCheckbox);
            filterColumnA.append(yellowLabel);
    
            filterColumns.append(filterColumnA);
            const filterColumnB = document.createElement('div');
    
            const orangeLabel = document.createElement('label');
            orangeLabel.style.backgroundColor = 'rgba(230,81,0,1)';
            orangeLabel.style.borderRadius = '0.6rem';
            orangeLabel.style.cursor = 'pointer';
            orangeLabel.style.fontSize = '1rem';
            orangeLabel.style.padding = '0 0.75rem 0 0';
            orangeLabel.style.whiteSpace = 'nowrap';
            const orangeText = document.createElement('span');
            orangeText.style.color = '#fff';
            orangeText.textContent = '$20-$50';
            orangeLabel.append(orangeText);
            const orangeCheckbox = document.createElement('input');
            orangeCheckbox.setAttribute('type', 'checkbox');
            orangeCheckbox.checked = true;
            orangeCheckbox.style.height = '1rem';
            orangeCheckbox.style.cursor = 'pointer';
            orangeCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'orangeCheckbox': orangeCheckbox.checked,
                        }
                    }));
                }
            });
            orangeLabel.prepend(orangeCheckbox);
            filterColumnB.append(orangeLabel);
    
            filterColumnB.append(document.createElement('br'));
    
            const magentaLabel = document.createElement('label');
            magentaLabel.style.backgroundColor = 'rgba(194,24,91,1)';
            magentaLabel.style.borderRadius = '0.6rem';
            magentaLabel.style.cursor = 'pointer';
            magentaLabel.style.fontSize = '1rem';
            magentaLabel.style.padding = '0 0.75rem 0 0';
            magentaLabel.style.whiteSpace = 'nowrap';
            const magentaText = document.createElement('span');
            magentaText.style.color = '#fff';
            magentaText.textContent = '$50-$100';
            magentaLabel.append(magentaText);
            const magentaCheckbox = document.createElement('input');
            magentaCheckbox.setAttribute('type', 'checkbox');
            magentaCheckbox.checked = true;
            magentaCheckbox.style.height = '1rem';
            magentaCheckbox.style.cursor = 'pointer';
            magentaCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'magentaCheckbox': magentaCheckbox.checked,
                        }
                    }));
                }
            });
            magentaLabel.prepend(magentaCheckbox);
            filterColumnB.append(magentaLabel);
    
            filterColumnB.append(document.createElement('br'));
    
            const redLabel = document.createElement('label');
            redLabel.style.backgroundColor = 'rgba(208,0,0,1)';
            redLabel.style.borderRadius = '0.6rem';
            redLabel.style.cursor = 'pointer';
            redLabel.style.fontSize = '1rem';
            redLabel.style.padding = '0 0.75rem 0 0';
            redLabel.style.whiteSpace = 'nowrap';
            const redText = document.createElement('span');
            redText.style.color = '#fff';
            redText.textContent = '$100-$500';
            redLabel.append(redText);
            const redCheckbox = document.createElement('input');
            redCheckbox.setAttribute('type', 'checkbox');
            redCheckbox.checked = true;
            redCheckbox.style.height = '1rem';
            redCheckbox.style.cursor = 'pointer';
            redCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'redCheckbox': redCheckbox.checked,
                        }
                    }));
                }
            });
            redLabel.prepend(redCheckbox);
            filterColumnB.append(redLabel);
    
            filterColumns.append(filterColumnB);
            const filterColumnC = document.createElement('div');
    
            const newMemberLabel = document.createElement('label');
            newMemberLabel.style.backgroundColor = '#0a8043';
            newMemberLabel.style.borderRadius = '0.6rem';
            newMemberLabel.style.cursor = 'pointer';
            newMemberLabel.style.fontSize = '1rem';
            newMemberLabel.style.padding = '0 0.75rem 0 0';
            newMemberLabel.style.whiteSpace = 'nowrap';
            const newMemberText = document.createElement('span');
            newMemberText.style.color = '#fff';
            newMemberText.textContent = 'new member';
            newMemberLabel.append(newMemberText);
            const newMemberCheckbox = document.createElement('input');
            newMemberCheckbox.setAttribute('type', 'checkbox');
            newMemberCheckbox.checked = true;
            newMemberCheckbox.style.height = '1rem';
            newMemberCheckbox.style.cursor = 'pointer';
            newMemberCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'newMemberCheckbox': newMemberCheckbox.checked,
                        }
                    }));
                }
            });
            newMemberLabel.prepend(newMemberCheckbox);
            filterColumnC.append(newMemberLabel);
    
            filterColumnC.append(document.createElement('br'));
    
            const memberGiftLabel = document.createElement('label');
            memberGiftLabel.style.backgroundColor = '#0a8043';
            memberGiftLabel.style.borderRadius = '0.6rem';
            memberGiftLabel.style.cursor = 'pointer';
            memberGiftLabel.style.fontSize = '1rem';
            memberGiftLabel.style.padding = '0 0.75rem 0 0';
            memberGiftLabel.style.whiteSpace = 'nowrap';
            const memberGiftText = document.createElement('span');
            memberGiftText.style.color = '#fff';
            memberGiftText.textContent = 'member gift';
            memberGiftLabel.append(memberGiftText);
            const memberGiftCheckbox = document.createElement('input');
            memberGiftCheckbox.setAttribute('type', 'checkbox');
            memberGiftCheckbox.checked = true;
            memberGiftCheckbox.style.height = '1rem';
            memberGiftCheckbox.style.cursor = 'pointer';
            memberGiftCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'memberGiftCheckbox': memberGiftCheckbox.checked,
                        }
                    }));
                }
            });
            memberGiftLabel.prepend(memberGiftCheckbox);
            filterColumnC.append(memberGiftLabel);
    
            filterColumnC.append(document.createElement('br'));
    
            const memberMessageLabel = document.createElement('label');
            memberMessageLabel.style.backgroundColor = '#0a8043';
            memberMessageLabel.style.borderRadius = '0.6rem';
            memberMessageLabel.style.cursor = 'pointer';
            memberMessageLabel.style.fontSize = '1rem';
            memberMessageLabel.style.padding = '0 0.75rem 0 0';
            memberMessageLabel.style.whiteSpace = 'nowrap';
            const memberMessageText = document.createElement('span');
            memberMessageText.style.color = '#fff';
            memberMessageText.textContent = 'member message';
            memberMessageLabel.append(memberMessageText);
            const memberMessageCheckbox = document.createElement('input');
            memberMessageCheckbox.setAttribute('type', 'checkbox');
            memberMessageCheckbox.checked = true;
            memberMessageCheckbox.style.height = '1rem';
            memberMessageCheckbox.style.cursor = 'pointer';
            memberMessageCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'memberMessageCheckbox': memberMessageCheckbox.checked,
                        }
                    }));
                }
            });
            memberMessageLabel.prepend(memberMessageCheckbox);
            filterColumnC.append(memberMessageLabel);
    
            filterColumnC.append(document.createElement('br'));
    
            const fundraiserDonationLabel = document.createElement('label');
            fundraiserDonationLabel.style.backgroundColor = 'rgba(96,96,96,1)';
            fundraiserDonationLabel.style.borderRadius = '0.6rem';
            fundraiserDonationLabel.style.cursor = 'pointer';
            fundraiserDonationLabel.style.fontSize = '1rem';
            fundraiserDonationLabel.style.padding = '0 0.75rem 0 0';
            fundraiserDonationLabel.style.whiteSpace = 'nowrap';
            const fundraiserDonationText = document.createElement('span');
            fundraiserDonationText.style.color = '#fff';
            fundraiserDonationText.textContent = 'donation';
            fundraiserDonationLabel.append(fundraiserDonationText);
            const fundraiserDonationCheckbox = document.createElement('input');
            fundraiserDonationCheckbox.setAttribute('type', 'checkbox');
            fundraiserDonationCheckbox.checked = true;
            fundraiserDonationCheckbox.style.height = '1rem';
            fundraiserDonationCheckbox.style.cursor = 'pointer';
            fundraiserDonationCheckbox.addEventListener('change', function(event){
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'fundraiserDonationCheckbox': fundraiserDonationCheckbox.checked,
                        }
                    }));
                }
            });
            fundraiserDonationLabel.prepend(fundraiserDonationCheckbox);
            filterColumnC.append(fundraiserDonationLabel);
    
            filterColumns.append(filterColumnC);
    
            filtersFieldSet.append(filterColumns);
            optionsBox.append(filtersFieldSet);
    
    
            const generalSettingsFieldSet = document.createElement('fieldset');
            generalSettingsFieldSet.style.borderTop = '1px solid darkgray';
            generalSettingsFieldSet.style.margin = '0 0.2rem 0.6rem';
            generalSettingsFieldSet.style.padding = '0.2rem 0.4rem';
            generalSettingsFieldSet.style.height = '0';
            generalSettingsFieldSet.style.overflow = 'hidden';
    
            const generalSettingsLegend = document.createElement('legend');
            generalSettingsLegend.style.margin = '0 0 0 1.5rem';
            generalSettingsLegend.style.fontSize = '1rem';
            generalSettingsLegend.style.cursor = 'pointer';
            generalSettingsLegend.style.padding = '0 0.5rem';
            generalSettingsLegend.style.borderRadius = '4px';
            generalSettingsLegend.style.backgroundColor = '#606060';
            generalSettingsLegend.style.color = '#fff';
            generalSettingsLegend.textContent = 'general settings [ + ]';
            generalSettingsFieldSet.append(generalSettingsLegend);
            generalSettingsLegend.addEventListener('click', function(){
                if (generalSettingsFieldSet.style.overflow === 'hidden') {
                    generalSettingsFieldSet.style.height = 'auto';
                    generalSettingsFieldSet.style.overflow = 'visible';
                    generalSettingsLegend.style.backgroundColor = 'inherit';
                    generalSettingsLegend.style.color = 'inherit';
                    generalSettingsLegend.textContent = 'general settings [ – ]';
                }
                else {
                    generalSettingsFieldSet.style.height = '0';
                    generalSettingsFieldSet.style.overflow = 'hidden';
                    generalSettingsLegend.style.backgroundColor = '#606060';
                    generalSettingsLegend.style.color = '#fff';
                    generalSettingsLegend.textContent = 'general settings [ + ]';
                }
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'showGeneralSettings': generalSettingsFieldSet.style.overflow === 'visible',
                        }
                    }));
                }
            });
    
            const maxHistorySizeLabel = document.createElement('label');
            maxHistorySizeLabel.style.fontSize = '1rem';
            maxHistorySizeLabel.style.whiteSpace = 'nowrap';
            maxHistorySizeLabel.textContent = 'max history size: '
    
            maxHistorySizeInput = document.createElement('input');
            maxHistorySizeInput.setAttribute('type', 'number');
            maxHistorySizeInput.setAttribute('min', '3');
            maxHistorySizeInput.setAttribute('max', '9999');
            maxHistorySizeInput.setAttribute('maxlength', '4');
            maxHistorySizeInput.setAttribute('pattern', '\d{4}');
            maxHistorySizeInput.style.fontFamily = '"Roboto", "Noto", sans-serif';
            maxHistorySizeInput.style.fontSize = '1rem';
            maxHistorySizeInput.style.width = '4.5rem';
            maxHistorySizeInput.style.color = 'inherit';
            maxHistorySizeInput.style.backgroundColor = 'transparent';
            maxHistorySizeInput.style.borderWidth = '0 0 1px 0';
            maxHistorySizeInput.style.margin = '0.2rem';
            maxHistorySizeInput.value = '200';
            maxHistorySizeInput.addEventListener('change', function(event){
                if (typeof parseInt(maxHistorySizeInput.value) === 'number' && parseInt(maxHistorySizeInput.value) > 0) {
                    if (saveSettingsCheckbox.checked) {
                        document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                            detail: {
                                'maxHistorySizeInput': parseInt(maxHistorySizeInput.value),
                            }
                        }));
                    }
                }
            });
            maxHistorySizeInput.addEventListener('keydown', function(event){
                if (typeof parseInt(maxHistorySizeInput.value) === 'number' && parseInt(maxHistorySizeInput.value) > 0) {
                    if (saveSettingsCheckbox.checked) {
                        setTimeout(()=>{
                            document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                                detail: {
                                    'maxHistorySizeInput': parseInt(maxHistorySizeInput.value),
                                }
                            }));
                        }, 0);
                    }
                }
            });
            maxHistorySizeInput.addEventListener('paste', function(event){
                if (typeof parseInt(maxHistorySizeInput.value) === 'number' && parseInt(maxHistorySizeInput.value) > 0) {
                    if (saveSettingsCheckbox.checked) {
                        setTimeout(()=>{
                            document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                                detail: {
                                    'maxHistorySizeInput': parseInt(maxHistorySizeInput.value),
                                }
                            }));
                        }, 0);
                    }
                }
            });
            maxHistorySizeInput.addEventListener('keypress', function(event){
                if (event.key.toLowerCase() === 'enter') {
                    maxHistorySizeInput.blur();
                }
            });
            maxHistorySizeLabel.append(maxHistorySizeInput);
            generalSettingsFieldSet.append(maxHistorySizeLabel);
            generalSettingsFieldSet.append(labelBreaker.cloneNode());

            const showHistoryLabel = document.createElement('label');
            showHistoryLabel.style.backgroundColor = 'rgb(192, 192, 64)';
            showHistoryLabel.style.borderRadius = '0.6rem';
            showHistoryLabel.style.cursor = 'pointer';
            showHistoryLabel.style.fontSize = '1rem';
            showHistoryLabel.style.padding = '0 0.75rem 0 0';
            showHistoryLabel.style.whiteSpace = 'nowrap';
            const showHistoryText = document.createElement('span');
            showHistoryText.style.color = '#000';
            showHistoryText.textContent = 'show history counter';
            showHistoryLabel.append(showHistoryText);
            const showHistoryCheckbox = document.createElement('input');
            showHistoryCheckbox.setAttribute('type', 'checkbox');
            showHistoryCheckbox.checked = true;
            showHistoryCheckbox.style.height = '1rem';
            showHistoryCheckbox.style.cursor = 'pointer';
            showHistoryCheckbox.addEventListener('change', function(event){
                updateItemNumberDisplay();
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'showHistoryCheckbox': showHistoryCheckbox.checked,
                        }
                    }));
                }
            });
            showHistoryLabel.prepend(showHistoryCheckbox);
            generalSettingsFieldSet.append(showHistoryLabel);
            generalSettingsFieldSet.append(labelBreaker.cloneNode());

            const showExtensionLabel = document.createElement('label');
            showExtensionLabel.style.backgroundColor = 'rgb(64, 192, 192)';
            showExtensionLabel.style.borderRadius = '0.6rem';
            showExtensionLabel.style.cursor = 'pointer';
            showExtensionLabel.style.fontSize = '1rem';
            showExtensionLabel.style.padding = '0 0.75rem 0 0';
            showExtensionLabel.style.whiteSpace = 'nowrap';
            const showExtensionText = document.createElement('span');
            showExtensionText.style.color = '#000';
            showExtensionText.textContent = 'show extension label';
            showExtensionLabel.append(showExtensionText);
            const showExtensionCheckbox = document.createElement('input');
            showExtensionCheckbox.setAttribute('type', 'checkbox');
            showExtensionCheckbox.checked = true;
            showExtensionCheckbox.style.height = '1rem';
            showExtensionCheckbox.style.cursor = 'pointer';
            showExtensionCheckbox.addEventListener('change', function(event){
                if (showExtensionCheckbox.checked) {
                    extensionLabel.style.display = 'block';
                    creditsLegend.textContent = 'credits (ver. 1.4.8)';
                }
                else {
                    extensionLabel.style.display = 'none';
                    creditsLegend.textContent = 'credits (superchat live log ver. 1.4.8)';
                }

                if (creditsFieldSet.style.overflow === 'hidden') {
                    creditsLegend.textContent += ' [ + ]';
                }
                else {
                    creditsLegend.textContent += ' [ – ]';
                }

                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'showExtensionCheckbox': showExtensionCheckbox.checked,
                        }
                    }));
                }
            });
            showExtensionLabel.prepend(showExtensionCheckbox);
            generalSettingsFieldSet.append(showExtensionLabel);
            generalSettingsFieldSet.append(labelBreaker.cloneNode());

            const scrolledUpWarningLabel = document.createElement('label');
            scrolledUpWarningLabel.style.fontSize = '1rem';
            scrolledUpWarningLabel.style.backgroundColor = 'rgb(204, 0, 0)';
            scrolledUpWarningLabel.style.color = '#fff';
            scrolledUpWarningLabel.style.borderRadius = '0.6rem';
            scrolledUpWarningLabel.style.padding = '0 0.75rem 0 0.3rem';
            scrolledUpWarningLabel.style.whiteSpace = 'nowrap';
            scrolledUpWarningLabel.style.cursor = 'pointer';
            const scrolledUpWarningLabelText = document.createElement('span');
            scrolledUpWarningLabelText.textContent = 'scrolled up warning text';
            scrolledUpWarningButton1 = document.createElement('input');
            scrolledUpWarningButton1.setAttribute('type', 'radio');
            scrolledUpWarningButton1.setAttribute('name', 'sll-scrolled-up-warning-button');
            scrolledUpWarningButton1.style.height = '1rem';
            scrolledUpWarningButton1.style.margin = '0';
            scrolledUpWarningButton1.style.verticalAlign = 'middle';
            scrolledUpWarningButton1.style.cursor = 'pointer';
            scrolledUpWarningButton1.checked = true;
            scrolledUpWarningButton1.addEventListener('click', function(event){
                if (scrolledUpWarningButton1.checked) {
                    scrolledUpWarningLabelText.textContent = 'scrolled warning text';
                    scrolledUpWarningLabel.style.backgroundColor = 'rgb(204, 0, 0)';

                    showMoreButton.style.backgroundColor = '#c00'; // #2196f3
                    showMoreButton.style.width = '192px'; // 32px
                    showMoreButton.style.height = '64px'; // 32px
                    showMoreButton.style.fontSize = '1rem'; // 0px
                    showMoreButton.style.margin = '0 calc(50% - 96px) 8px calc(50% - 96px)'; // 0 calc(50% - 16px) 8px calc(50% - 16px)
            
                    const showMoreButtonTag = showMoreButton.querySelector('#button.style-scope.yt-icon-button');
                    showMoreButtonTag.style.height = 'auto'; // 100%
                    showMoreButtonTag.style.lineHeight = '1.5rem'; // normal
                    showMoreButtonTag.style.padding = '0 1.5rem'; // 0
                    const showMoreButtonLabel = showMoreButton.querySelector('.sll-show-more-warning');
                    showMoreButtonLabel.style.display = 'inline';
            
                    const showMoreButtonIcon = showMoreButton.querySelector('yt-icon.style-scope.yt-live-chat-item-list-renderer > svg');
                    showMoreButtonIcon.style.width = '24px'; // 100%
                    showMoreButtonIcon.style.height = '24px'; // 100%

                    if (saveSettingsCheckbox.checked) {
                        document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                            detail: {
                                'scrolledUpWarningButton': 0,
                            }
                        }));
                    }
                }
                event.stopPropagation();
            });
            scrolledUpWarningLabel.append(scrolledUpWarningButton1);
            scrolledUpWarningButton2 = document.createElement('input');
            scrolledUpWarningButton2.setAttribute('type', 'radio');
            scrolledUpWarningButton2.setAttribute('name', 'sll-scrolled-up-warning-button');
            scrolledUpWarningButton2.style.height = '1rem';
            scrolledUpWarningButton2.style.margin = '0';
            scrolledUpWarningButton2.style.verticalAlign = 'middle';
            scrolledUpWarningButton2.style.cursor = 'pointer';
            scrolledUpWarningButton2.addEventListener('click', function(event){
                if (scrolledUpWarningButton2.checked) {
                    scrolledUpWarningLabelText.textContent = 'scrolled warning color';
                    scrolledUpWarningLabel.style.backgroundColor = 'rgb(204, 0, 0)';

                    showMoreButton.style.backgroundColor = '#c00'; // #2196f3
                    showMoreButton.style.width = '32px';
                    showMoreButton.style.height = '32px';
                    showMoreButton.style.fontSize = '0px';
                    showMoreButton.style.margin = '0 calc(50% - 16px) 8px calc(50% - 16px)';
            
                    const showMoreButtonTag = showMoreButton.querySelector('#button.style-scope.yt-icon-button');
                    showMoreButtonTag.style.height = '100%';
                    showMoreButtonTag.style.lineHeight = 'normal';
                    showMoreButtonTag.style.padding = '0';
                    const showMoreButtonLabel = showMoreButton.querySelector('.sll-show-more-warning');
                    showMoreButtonLabel.style.display = 'none';
            
                    const showMoreButtonIcon = showMoreButton.querySelector('yt-icon.style-scope.yt-live-chat-item-list-renderer > svg');
                    showMoreButtonIcon.style.width = '100%';
                    showMoreButtonIcon.style.height = '100%';

                    if (saveSettingsCheckbox.checked) {
                        document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                            detail: {
                                'scrolledUpWarningButton': 1,
                            }
                        }));
                    }
                }
                event.stopPropagation();
            });
            scrolledUpWarningLabel.append(scrolledUpWarningButton2);
            scrolledUpWarningButton3 = document.createElement('input');
            scrolledUpWarningButton3.setAttribute('type', 'radio');
            scrolledUpWarningButton3.setAttribute('name', 'sll-scrolled-up-warning-button');
            scrolledUpWarningButton3.style.height = '1rem';
            scrolledUpWarningButton3.style.margin = '0';
            scrolledUpWarningButton3.style.verticalAlign = 'middle';
            scrolledUpWarningButton3.style.cursor = 'pointer';
            scrolledUpWarningButton3.addEventListener('click', function(event){
                if (scrolledUpWarningButton3.checked) {
                    scrolledUpWarningLabelText.textContent = 'no scrolled warning';
                    scrolledUpWarningLabel.style.backgroundColor = 'rgb(33, 150, 243)';

                    showMoreButton.style.backgroundColor = '#2196f3';
                    showMoreButton.style.width = '32px';
                    showMoreButton.style.height = '32px';
                    showMoreButton.style.fontSize = '0px';
                    showMoreButton.style.margin = '0 calc(50% - 16px) 8px calc(50% - 16px)';
            
                    const showMoreButtonTag = showMoreButton.querySelector('#button.style-scope.yt-icon-button');
                    showMoreButtonTag.style.height = '100%';
                    showMoreButtonTag.style.lineHeight = 'normal';
                    showMoreButtonTag.style.padding = '0';
                    const showMoreButtonLabel = showMoreButton.querySelector('.sll-show-more-warning');
                    showMoreButtonLabel.style.display = 'none';
            
                    const showMoreButtonIcon = showMoreButton.querySelector('yt-icon.style-scope.yt-live-chat-item-list-renderer > svg');
                    showMoreButtonIcon.style.width = '100%';
                    showMoreButtonIcon.style.height = '100%';

                    if (saveSettingsCheckbox.checked) {
                        document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                            detail: {
                                'scrolledUpWarningButton': 2,
                            }
                        }));
                    }
                }
                event.stopPropagation();
            });
            scrolledUpWarningLabel.append(scrolledUpWarningButton3);
            scrolledUpWarningLabel.append(scrolledUpWarningLabelText);
            generalSettingsFieldSet.append(scrolledUpWarningLabel);
            generalSettingsFieldSet.append(labelBreaker.cloneNode());
            scrolledUpWarningLabel.addEventListener('click', function(event){
                event.preventDefault();
                if (scrolledUpWarningButton1.checked) {
                    scrolledUpWarningButton2.click();
                }
                else if (scrolledUpWarningButton2.checked) {
                    scrolledUpWarningButton3.click();
                }
                else if (scrolledUpWarningButton3.checked) {
                    scrolledUpWarningButton1.click();
                }
            });

            const saveSettingsLabel = document.createElement('label');
            saveSettingsLabel.style.backgroundColor = 'rgb(64, 64, 192)';
            saveSettingsLabel.style.borderRadius = '0.6rem';
            saveSettingsLabel.style.cursor = 'pointer';
            saveSettingsLabel.style.fontSize = '1rem';
            saveSettingsLabel.style.padding = '0 0.75rem 0 0';
            saveSettingsLabel.style.whiteSpace = 'nowrap';
            saveSettingsLabel.title = 'this only stores settings choices';
            const saveSettingsText = document.createElement('span');
            saveSettingsText.style.color = '#fff';
            saveSettingsText.textContent = 'save all settings';
            saveSettingsLabel.append(saveSettingsText);
            const saveSettingsCheckbox = document.createElement('input');
            saveSettingsCheckbox.setAttribute('type', 'checkbox');
            saveSettingsCheckbox.checked = true;
            saveSettingsCheckbox.style.height = '1rem';
            saveSettingsCheckbox.style.cursor = 'pointer';
            saveSettingsCheckbox.addEventListener('change', function(event){
                if (event.target.checked) {
                    const checkedScrolledWarningRadio = scrolledUpWarningLabel.querySelector('input[type="radio"][name="sll-scrolled-up-warning-button"]:checked');
                    document.dispatchEvent(new CustomEvent('sllSaveSettingsCheckboxChange', {
                        detail: {
                            'saveSettingsCheckbox': true,
                            'showSuperchatConfiguration': superchatConfigurationFieldSet.style.overflow === 'visible',
                            'showFilterSelection': filtersFieldSet.style.overflow === 'visible',
                            'showGeneralSettings': generalSettingsFieldSet.style.overflow === 'visible',
                            'showCredits': creditsFieldSet.style.overflow === 'visible',
                            'scrolledUpWarningButton': [...checkedScrolledWarningRadio.parentNode.children].indexOf(checkedScrolledWarningRadio),
                            'maxHistorySizeInput': maxHistorySizeInput.value,
                            'showHistoryCheckbox': showHistoryCheckbox.checked,
                            'showExtensionCheckbox': showExtensionCheckbox.checked,
                            'darkblueCheckbox': darkblueCheckbox.checked,
                            'lightblueCheckbox': lightblueCheckbox.checked,
                            'greenCheckbox': greenCheckbox.checked,
                            'yellowCheckbox': yellowCheckbox.checked,
                            'orangeCheckbox': orangeCheckbox.checked,
                            'magentaCheckbox': magentaCheckbox.checked,
                            'redCheckbox': redCheckbox.checked,
                            'memberGiftCheckbox': memberGiftCheckbox.checked,
                            'newMemberCheckbox': newMemberCheckbox.checked,
                            'memberMessageCheckbox': memberMessageCheckbox.checked,
                            'fundraiserDonationCheckbox': fundraiserDonationCheckbox.checked,
                            'minidisplayVisibleCheckbox': minidisplayVisibleCheckbox.checked,
                            'superchatsExpireCheckbox': superchatsExpireCheckbox.checked,
                        }
                    }));
                }
                else {
                    document.dispatchEvent(new CustomEvent('sllSaveSettingsCheckboxChange', {
                        detail: {
                            'saveSettingsCheckbox': false,
                        }
                    }));
                }
            });
            saveSettingsLabel.prepend(saveSettingsCheckbox);
            generalSettingsFieldSet.append(saveSettingsLabel);
            generalSettingsFieldSet.append(labelBreaker.cloneNode());

            optionsBox.append(generalSettingsFieldSet);

            const bottomOptionsFlex = document.createElement('div');
            bottomOptionsFlex.style.display = 'flex';
            const creditsFieldSet = document.createElement('fieldset');
            creditsFieldSet.style.borderTop = '1px solid darkgray';
            creditsFieldSet.style.margin = '0 0.2rem 0.6rem';
            creditsFieldSet.style.padding = '0.2rem 0.4rem';
            creditsFieldSet.style.flexGrow = '2';
            creditsFieldSet.style.height = '0';
            creditsFieldSet.style.overflow = 'hidden';
    
            const creditsLegend = document.createElement('legend');
            creditsLegend.style.margin = '0 0 0 1.5rem';
            creditsLegend.style.fontSize = '1rem';
            creditsLegend.style.cursor = 'pointer';
            creditsLegend.style.padding = '0 0.5rem';
            creditsLegend.style.borderRadius = '4px';
            creditsLegend.style.backgroundColor = '#606060';
            creditsLegend.style.color = '#fff';
            creditsLegend.textContent = 'credits (ver. 1.4.8) [ + ]';
            creditsFieldSet.append(creditsLegend);
            creditsLegend.addEventListener('click', function(){
                if (showExtensionCheckbox.checked) {
                    creditsLegend.textContent = 'credits (ver. 1.4.8)';
                }
                else {
                    creditsLegend.textContent = 'credits (superchat live log ver. 1.4.8)';
                }

                if (creditsFieldSet.style.overflow === 'hidden') {
                    creditsFieldSet.style.height = 'auto';
                    creditsFieldSet.style.overflow = 'visible';
                    creditsLegend.style.backgroundColor = 'inherit';
                    creditsLegend.style.color = 'inherit';
                    creditsLegend.textContent += ' [ – ]';
                }
                else {
                    creditsFieldSet.style.height = '0';
                    creditsFieldSet.style.overflow = 'hidden';
                    creditsLegend.style.backgroundColor = '#606060';
                    creditsLegend.style.color = '#fff';
                    creditsLegend.textContent += ' [ + ]';
                }
                if (saveSettingsCheckbox.checked) {
                    document.dispatchEvent(new CustomEvent('sllSettingsChange', {
                        detail: {
                            'showCredits': creditsFieldSet.style.overflow === 'visible',
                        }
                    }));
                }
            });
    
            const thanksPeople = document.createElement('div');
            thanksPeople.style.fontSize = '1rem';
            thanksPeople.style.whiteSpace = 'nowrap';
            thanksPeople.append(document.createTextNode('created by j-sea'));
            const thanksPeopleIntroDiv = document.createElement('div');
            thanksPeopleIntroDiv.style.textAlign = 'right';
            thanksPeopleIntroDiv.textContent = 'immense thanks goes to';
            thanksPeople.append(thanksPeopleIntroDiv);
            const thanksPeopleDiv = document.createElement('div');
            thanksPeopleDiv.style.textAlign = 'right';
            thanksPeopleDiv.textContent = `${['AxsDeny','Christina','Jake'].reduce((acc, curr, index, arr) => {
                if (arr.length === 0) {
                    return 'everyone who\'s helped me along the way';
                }
                else if (index === 0) {
                    return acc + curr
                }
                else if (index < arr.length - 1) {
                    return acc + ', ' + curr;
                }
                else if (arr.length === 2) {
                    return acc + ' and ' + curr;
                }
                else  {
                    return acc + ', and ' + curr;
                }
            }, '')} for your help,`;
            thanksPeople.append(thanksPeopleDiv);
            const thanksHarryMackDiv = document.createElement('div');
            thanksHarryMackDiv.style.textAlign = 'right';
            thanksHarryMackDiv.textContent = `and Harry Mack & team for trying this out <3`;
            thanksPeople.append(thanksHarryMackDiv);
            creditsFieldSet.append(thanksPeople);
            bottomOptionsFlex.append(creditsFieldSet);

            const unloadExtensionButton = document.createElement('button');
            unloadExtensionButton.textContent = 'quit for now';
            unloadExtensionButton.style.cursor = 'pointer';
            unloadExtensionButton.style.borderWidth = '0';
            unloadExtensionButton.style.borderRadius = '0.6rem';
            unloadExtensionButton.style.fontSize = '1rem';
            unloadExtensionButton.style.lineHeight = '1rem';
            unloadExtensionButton.style.padding = '0.5rem';
            unloadExtensionButton.style.margin = '0.2rem';
            unloadExtensionButton.style.backgroundColor = '#444';
            unloadExtensionButton.style.color = '#fcfcfc';
            unloadExtensionButton.title = 'superchat live log will be back after the next page refresh';
            bottomOptionsFlex.append(unloadExtensionButton);

            const unloadConfirmBox = document.createElement('div');
            unloadConfirmBox.style.display = 'none';
            unloadConfirmBox.style.fontSize = '1rem';
            unloadConfirmBox.style.textAlign = 'center';
            unloadConfirmBox.style.marginTop = '0.5rem';
            unloadConfirmBox.style.padding = '0.5rem';
            unloadConfirmBox.textContent = 'quit for now?';
            unloadConfirmBox.append(document.createElement('br'));
            const unloadNoButton = document.createElement('button');
            unloadNoButton.style.cursor = 'pointer';
            unloadNoButton.style.borderWidth = '0';
            unloadNoButton.style.borderRadius = '0.6rem';
            unloadNoButton.style.fontSize = '1rem';
            unloadNoButton.style.lineHeight = '1rem';
            unloadNoButton.style.margin = '0.2rem';
            unloadNoButton.style.padding = '0.5rem';
            unloadNoButton.style.backgroundColor = 'rgb(68, 68, 68)';
            unloadNoButton.style.color = 'rgb(252, 252, 252)';
            unloadNoButton.textContent = 'no';
            unloadConfirmBox.append(unloadNoButton);
            const unloadYesButton = document.createElement('button');
            unloadYesButton.style.cursor = 'pointer';
            unloadYesButton.style.borderWidth = '0';
            unloadYesButton.style.borderRadius = '0.6rem';
            unloadYesButton.style.fontSize = '1rem';
            unloadYesButton.style.lineHeight = '1rem';
            unloadYesButton.style.margin = '0.2rem';
            unloadYesButton.style.padding = '0.5rem';
            unloadYesButton.style.backgroundColor = '#c00';
            unloadYesButton.style.color = 'rgb(252, 252, 252)';
            unloadYesButton.textContent = 'yes';
            unloadYesButton.title = 'superchat live log will be back after the next page refresh';
            unloadConfirmBox.append(unloadYesButton);

            bottomOptionsFlex.append(unloadConfirmBox);

            unloadExtensionButton.addEventListener('click', function(event){
                unloadExtensionButton.style.display = 'none';
                unloadConfirmBox.style.display = 'block';
            });
            unloadNoButton.addEventListener('click', function(event){
                unloadExtensionButton.style.display = 'block';
                unloadConfirmBox.style.display = 'none';
            });
            unloadYesButton.addEventListener('click', function(event){
                observer.disconnect();
                superchatLiveLogsObserver.disconnect();
                deletedChatObserver.disconnect();
                liveLogBoxContainer.remove();
                controlBox.remove();
                optionsBox.remove();
                pinAnimatorContainer.remove();
            });

            optionsBox.append(bottomOptionsFlex);

            // liveLogBoxContainer.append(optionsBox);

            const liveLogMessage = document.createElement('h4');
            liveLogMessage.textContent = waitingModeMessage;
            liveLogMessage.style.textAlign = 'center';
            liveLogMessage.style.padding = '0.5rem 0';
            liveLogMessage.style.width = '100%';
            liveLogMessage.style.height = '1.5rem';
            liveLogBoxContainer.append(liveLogMessage);
            function hideWaitingMode() {
                waitingModeOn = false;
                liveLogMessage.style.display = 'none';
                liveLogBox.style.display = 'block';
            }
            function showWaitingMode() {
                waitingModeOn = true;
                liveLogMessage.style.display = 'block';
                liveLogMessage.textContent = waitingModeMessage;
                liveLogBox.style.display = 'none';
    
                disableNextSuperchatButton();
                if (currentChildIndex === 0) {
                    enablePreviousSuperchatButton();
                }
            }
            function showWaitingNotification() {
                liveLogMessage.textContent = waitingModeNotification;
            }
    
            liveLogBox = document.createElement('div');
            liveLogBox.style.boxSizing = 'border-box';
            liveLogBox.style.height = '2.5rem';
            liveLogBox.style.overflowX = 'hidden';
            liveLogBox.style.overflowY = 'hidden';
            liveLogBox.style.display = 'none';
            liveLogBoxContainer.append(liveLogBox);

            pinAnimatorContainer = document.createElement('div');
            const pinAnimatorCanvas = document.createElement('canvas');
            pinAnimatorContainer.style.borderTop = '1px solid #88888838';
            pinAnimatorContainer.style.borderBottom = '1px solid #88888838';
            pinAnimatorContainer.style.height = '2rem';
            pinAnimatorContainer.style.padding = '0';
            pinAnimatorContainer.style.position = 'relative';
            pinAnimatorContainer.style.boxSizing = 'border-box';
            pinAnimatorContainer.append(pinAnimatorCanvas);
    
            controlBox = document.createElement('div');
            controlBox.style.height = '3rem';
            controlBox.style.display = 'flex';
            controlBox.style.justifyContent = 'flex-end';
            controlBox.style.padding = '0.25rem';
            controlBox.style.boxSizing = 'border-box';
    
            const sideDisplay = document.createElement('div');
            sideDisplay.style.alignSelf = 'end';
            sideDisplay.style.display = 'flex';
            sideDisplay.style.fontFamily = '"Roboto", "Noto", sans-serif';
            sideDisplay.style.fontSize = '1rem';
            sideDisplay.style.margin = '0 auto 0 0.2rem';
            sideDisplay.style.alignItems = 'center';
            const settingsCog = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            settingsCog.style.cursor = 'pointer';
            settingsCog.setAttribute('viewBox', "0 0 320 320");
            settingsCog.setAttribute('version', "1.1");
            settingsCog.setAttribute('width', "20");
            settingsCog.setAttribute('height', "20");
            settingsCog.setAttribute('xmlns', "http://www.w3.org/2000/svg");
            settingsCog.setAttribute('xmls:svg', "http://www.w3.org/2000/svg");
            const settingsCogSvgBg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            settingsCogSvgBg.setAttribute('d', 'M 160.00026,20 C 103.37595,20.00019 52.326941,54.110222 30.659108,106.42338 8.9913162,158.73644 20.972162,218.94964 61.011488,258.98884 101.05082,299.02804 161.26405,311.00867 213.57703,289.34071 265.89012,267.6727 299.99999,216.62358 299.99999,159.99926 299.99899,82.680103 237.31942,20.0009 160.00026,20 Z');
            settingsCogSvgBg.setAttribute('style', 'fill:#525252;fill-opacity:1;stroke-width:0.768469');
            const settingsCogSvgCog = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            settingsCogSvgCog.setAttribute('d', 'm 179.04202,256.02305 -11.47651,-23.33077 c -5.02806,0.52855 -10.09755,0.53112 -15.12614,0.008 l -11.48572,23.33142 -35.39431,-14.65431 8.38367,-24.62245 c -3.92864,-3.18263 -7.51179,-6.76946 -10.69036,-10.70139 l -24.612129,8.38239 -14.66112,-35.39507 23.327085,-11.48531 c -0.528072,-5.02533 -0.529498,-10.0921 -0.0043,-15.11774 l -23.335405,-11.4742 14.673546,-35.39333 24.607543,8.37131 c 3.18394,-3.92604 6.77191,-7.5064 10.70472,-10.68199 l -8.37778,-24.624062 35.38834,-14.658329 11.47951,23.33929 c 5.02668,-0.53126 10.09506,-0.536667 15.12288,-0.01615 l 11.47195,-23.316153 35.40337,14.650787 -8.37962,24.611007 c 3.92489,3.18527 7.50512,6.77315 10.68203,10.70484 l 24.62096,-8.38519 14.66124,35.39535 -23.33927,11.47949 c 0.53545,5.02644 0.54086,10.09523 0.0161,15.1228 l 23.33135,11.48568 -14.67426,35.39362 -24.60225,-8.38316 c -3.1838,3.9276 -6.77056,7.51064 -10.70146,10.6904 l 8.38268,24.61228 z');
            settingsCogSvgCog.setAttribute('style', 'fill:#cdcdcd;fill-opacity:1;stroke-width:1.00277');
            const settingsCogSvgCenter = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            settingsCogSvgCenter.setAttribute('d', 'M 160.0043,128 A 32,32 0 1 1 128,160.00411 31.999439,31.999439 0 0 1 160.0043,128 Z');
            settingsCogSvgCenter.setAttribute('style', 'fill:#525252;fill-opacity:1;stroke-width:0.934394');
            let cogToggled = false;
            settingsCog.addEventListener('click', function(){
                if (!cogToggled) {
                    optionsBox.style.display = 'block';
                    settingsCogSvgBg.style.fill = 'rgb(204, 0, 0)';
                    settingsCogSvgCenter.style.fill = 'rgb(204, 0, 0)';
                    cogToggled = true;
                }
                else {
                    optionsBox.style.display = 'none';
                    settingsCogSvgBg.style.fill = '#525252';
                    settingsCogSvgCenter.style.fill = '#525252';
                    cogToggled = false;
                }
            });
            settingsCog.append(settingsCogSvgBg);
            settingsCog.append(settingsCogSvgCog);
            settingsCog.append(settingsCogSvgCenter);
            sideDisplay.append(settingsCog);
    
            const extensionLabel = document.createElement('p');
            extensionLabel.append(document.createTextNode('superchat'));
            extensionLabel.append(document.createElement('br'));
            extensionLabel.append(document.createTextNode('live log'));
            extensionLabel.style.color = 'inherit';
            extensionLabel.style.textDecoration = 'none';
            extensionLabel.style.marginLeft = '0.2rem';
            sideDisplay.append(extensionLabel);
            controlBox.append(sideDisplay);
    
            const itemNumberDisplay = document.createElement('p');
            itemNumberDisplay.style.alignSelf = 'center';
            itemNumberDisplay.style.display = 'flex';
            itemNumberDisplay.style.fontFamily = '"Roboto", "Noto", sans-serif';
            itemNumberDisplay.style.margin = '0 0.2rem';
            controlBox.append(itemNumberDisplay);
    
            const previousSuperchatButton = document.createElement('button');
            previousSuperchatButton.textContent = 'Prev';
            previousSuperchatButton.style.backgroundColor = 'transparent';
            previousSuperchatButton.style.borderRadius = '2px';
            previousSuperchatButton.style.border = '1px solid #065fd4';
            previousSuperchatButton.style.color = '#065fd4';
            previousSuperchatButton.style.cursor = 'pointer';
            previousSuperchatButton.style.fontFamily = '"Roboto", "Noto", sans-serif';
            previousSuperchatButton.style.margin = '0 0.2rem';
            previousSuperchatButton.style.padding = '0 1rem';
            previousSuperchatButton.style.textTransform = 'uppercase';
            previousSuperchatButton.addEventListener('click', focusOnPreviousSuperchat);
            if (window.location.pathname.indexOf('/watch') === 0) {
                const chatFrame = document.querySelector('#chatframe');
                if (chatFrame !== null) {
                    chatFrame.contentDocument.addEventListener('keydown', function(event){
                        if (event.key === 'ArrowLeft') {
                            focusOnPreviousSuperchat();
                        }
                    });
                }
            }
            else if (window.location.pathname.indexOf('/video/') === 0 && window.location.pathname.indexOf('/livestreaming') === window.location.pathname.length - '/livestreaming'.length
                    || window.location.pathname.indexOf('/live_chat') === 0) {
                document.addEventListener('keydown', function(event){
                    if (event.key === 'ArrowLeft') {
                        focusOnPreviousSuperchat();
                    }
                });
            }
            function focusOnPreviousSuperchat() {
                if (liveLogBoxContainer.style.position === 'absolute') {
                    showVisibilityEye();
                }
                else {
                    if (currentChildIndex > 0) {
                        let expiredSuperchat = null;
                        let expiredIndex = -1;
                        if (currentSuperchatExpired) {
                            expiredSuperchat = currentSuperchats[currentChildIndex];
                            expiredIndex = currentChildIndex;
                        }
                        else if (highlightedSuperchatExpired) {
                            const highlightedIndex = pinAnimator.getHighlightedIndex();
                            expiredSuperchat = currentSuperchats[highlightedIndex];
                            expiredIndex = highlightedIndex;
                        }
                        if (expiredSuperchat !== null) {
                            if (!showExpiredSuperchatsCheckbox.checked) {
                                if (expiredIndex <= currentChildIndex) {
                                    currentChildIndex--;
                                }
                                if (expiredIndex <= highestChildIndexSeen) {
                                    highestChildIndexSeen--;
                                }
            
                                expiredSuperchat.parentElement.removeChild(expiredSuperchat);
                                currentSuperchats.splice(expiredIndex, 1);
                                pinAnimator.removePin(expiredIndex);
                            }
                            else {
                                let price = expiredSuperchat.querySelector('.sll-price');
                                if (price === null) {
                                    price = document.createElement('span');
                                    price.textContent = 'member'
                                }
            
                                price.style.color = 'black';
                                const expiredSuperchatDiv = document.createElement('div');
                                expiredSuperchatDiv.setAttribute('style', `
                                    font-style: italic;
                                        background-color: rgba(128,128,128,1);
                                        color: black;
                                        box-sizing: content-box;
                                        padding: 8px 8px 8px 16px;
                                        position: relative;
                                        border-radius:4px;
                                `);
                                expiredSuperchatDiv.append(price.cloneNode(true))
                                expiredSuperchatDiv.append(document.createTextNode(' superchat expired'));
                                while (expiredSuperchat.firstChild) expiredSuperchat.removeChild(expiredSuperchat.firstChild);
                                expiredSuperchat.append(expiredSuperchatDiv);
                            }
                        }

                        if (waitingModeOn) {
                            hideWaitingMode();
                        }
                        else if (!currentSuperchatExpired) {
                            currentChildIndex--;
                            pinAnimator.movePointerBackward();
                        }
                        currentSuperchatExpired = false;
                        highlightedSuperchatExpired = false;

                        if (currentChildIndex >= 0 && currentChildIndex < currentSuperchats.length) {
                            focusOn(currentSuperchats[currentChildIndex]);
                        }
                        updateButtons();
                    }
                    else if (currentChildIndex === 0) {
                        if (waitingModeOn) {
                            let expiredSuperchat = null;
                            let expiredIndex = -1;
                            if (currentSuperchatExpired) {
                                currentSuperchatExpired = false;
                                expiredSuperchat = currentSuperchats[currentChildIndex];
                                expiredIndex = currentChildIndex;
                            }
                            else if (highlightedSuperchatExpired) {
                                highlightedSuperchatExpired = false;
                                const highlightedIndex = pinAnimator.getHighlightedIndex();
                                expiredSuperchat = currentSuperchats[highlightedIndex];
                                expiredIndex = highlightedIndex;
                            }
                            if (expiredSuperchat !== null) {
                                if (!showExpiredSuperchatsCheckbox.checked) {
                                    if (expiredIndex <= currentChildIndex) {
                                        currentChildIndex--;
                                    }
                                    if (expiredIndex <= highestChildIndexSeen) {
                                        highestChildIndexSeen--;
                                    }
                
                                    expiredSuperchat.parentElement.removeChild(expiredSuperchat);
                                    currentSuperchats.splice(expiredIndex, 1);
                                    pinAnimator.removePin(expiredIndex);

                                    if (currentChildIndex === -1 && highestChildIndexSeen !== -1) {
                                        currentChildIndex++;
                                        pinAnimator.movePointerForward();
                                    }
                                }
                                else {
                                    let price = expiredSuperchat.querySelector('.sll-price');
                                    if (price === null) {
                                        price = document.createElement('span');
                                        price.textContent = 'member'
                                    }
                
                                    price.style.color = 'black';
                                    const expiredSuperchatDiv = document.createElement('div');
                                    expiredSuperchatDiv.setAttribute('style', `
                                        font-style: italic;
                                            background-color: rgba(128,128,128,1);
                                            color: black;
                                            box-sizing: content-box;
                                            padding: 8px 8px 8px 16px;
                                            position: relative;
                                            border-radius:4px;
                                    `);
                                    expiredSuperchatDiv.append(price.cloneNode(true))
                                    expiredSuperchatDiv.append(document.createTextNode(' superchat expired'));
                                    while (expiredSuperchat.firstChild) expiredSuperchat.removeChild(expiredSuperchat.firstChild);
                                    expiredSuperchat.append(expiredSuperchatDiv);
                                }
                            }
                            if (currentChildIndex >= 0 && currentChildIndex < currentSuperchats.length) {
                                hideWaitingMode();
                                focusOn(currentSuperchats[currentChildIndex]);
                            }
                            updateButtons();
                        }
                    }
                }

                const showMoreButtonTag = showMoreButton.querySelector('#button.style-scope.yt-icon-button');
                if (showMoreButtonTag !== null && showMoreButtonTag.parentNode.style.visibility !== 'hidden') {
                    showMoreButtonTag.click();
                }
                else {
                    const itemScroller = chatPanel.querySelector('#item-scroller');
                    itemScroller.scrollTo(0, itemScroller.scrollHeight * 2);
                }
                const fadeElement = chatPanel.querySelector('#fade');
                if (fadeElement && fadeElement.parentElement && !fadeElement.parentElement.hidden) {
                    fadeElement.click();
                }
                pinAnimator.clearHighlight();
                highlightedIndex = -1;
            }
            function enablePreviousSuperchatButton() {
                previousSuperchatButton.style.border = '1px solid #065fd4';
                previousSuperchatButton.style.color = '#065fd4';
                previousSuperchatButton.style.cursor = 'pointer';
                previousSuperchatButton.textContent = 'Prev';
            }
            function disablePreviousSuperchatButton() {
                previousSuperchatButton.style.border = '1px solid #d4d4d4';
                previousSuperchatButton.style.color = '#d4d4d4';
                previousSuperchatButton.style.cursor = 'not-allowed';
            }
            controlBox.append(previousSuperchatButton);
            
            const nextSuperchatButton = document.createElement('button');
            nextSuperchatButton.textContent = 'Next';
            nextSuperchatButton.style.backgroundColor = '#c00';
            nextSuperchatButton.style.borderRadius = '2px';
            nextSuperchatButton.style.borderWidth = '0';
            nextSuperchatButton.style.color = '#fff';
            nextSuperchatButton.style.cursor = 'pointer';
            nextSuperchatButton.style.fontFamily = '"Roboto", "Noto", sans-serif';
            nextSuperchatButton.style.margin = '0 0.2rem';
            nextSuperchatButton.style.padding = '0 1rem';
            nextSuperchatButton.style.textTransform = 'uppercase';
            nextSuperchatButton.addEventListener('click', focusOnNextSuperchat);
            if (window.location.pathname.indexOf('/watch') === 0) {
                const chatFrame = document.querySelector('#chatframe');
                if (chatFrame !== null) {
                    chatFrame.contentDocument.addEventListener('keydown', function(event){
                        if (event.key === 'ArrowRight') {
                            focusOnNextSuperchat();
                        }
                    });
                }
            }
            else if (window.location.pathname.indexOf('/video/') === 0 && window.location.pathname.indexOf('/livestreaming') === window.location.pathname.length - '/livestreaming'.length
                    || window.location.pathname.indexOf('/live_chat') === 0) {
                document.addEventListener('keydown', function(event){
                    if (event.key === 'ArrowRight') {
                        focusOnNextSuperchat();
                    }
                });
            }
            function focusOnNextSuperchat() {
                if (liveLogBoxContainer.style.position === 'absolute') {
                    showVisibilityEye();
                }
                if (currentChildIndex < currentSuperchats.length - 1) {
                    let expiredSuperchat = null;
                    let expiredIndex;
                    if (currentSuperchatExpired) {
                        currentSuperchatExpired = false;
                        expiredSuperchat = currentSuperchats[currentChildIndex];
                        expiredIndex = currentChildIndex;
                    }
                    else if (highlightedSuperchatExpired) {
                        highlightedSuperchatExpired = false;
                        const highlightedIndex = pinAnimator.getHighlightedIndex();
                        expiredSuperchat = currentSuperchats[highlightedIndex];
                        expiredIndex = highlightedIndex;
                    }
                    if (expiredSuperchat !== null) {
                        if (!showExpiredSuperchatsCheckbox.checked) {
                            if (expiredIndex <= currentChildIndex) {
                                currentChildIndex--;
                            }
                            if (expiredIndex <= highestChildIndexSeen) {
                                highestChildIndexSeen--;
                            }
        
                            expiredSuperchat.parentElement.removeChild(expiredSuperchat);
                            currentSuperchats.splice(expiredIndex, 1);
                            pinAnimator.removePin(expiredIndex);
                        }
                        else {
                            let price = expiredSuperchat.querySelector('.sll-price');
                            if (price === null) {
                                price = document.createElement('span');
                                price.textContent = 'member'
                            }
        
                            price.style.color = 'black';
                            const expiredSuperchatDiv = document.createElement('div');
                            expiredSuperchatDiv.setAttribute('style', `
                                font-style: italic;
                                    background-color: rgba(128,128,128,1);
                                    color: black;
                                    box-sizing: content-box;
                                    padding: 8px 8px 8px 16px;
                                    position: relative;
                                    border-radius:4px;
                            `);
                            expiredSuperchatDiv.append(price.cloneNode(true))
                            expiredSuperchatDiv.append(document.createTextNode(' superchat expired'));
                            while (expiredSuperchat.firstChild) expiredSuperchat.removeChild(expiredSuperchat.firstChild);
                            expiredSuperchat.append(expiredSuperchatDiv);
                        }
                    }

                    if (waitingModeOn) {
                        hideWaitingMode();
                    }
    
                    currentChildIndex++;
                    if (currentChildIndex !== 0) {
                        pinAnimator.movePointerForward();
                    }
                    if (currentChildIndex > highestChildIndexSeen) {
                        const maxHistory = parseInt(maxHistorySizeInput.value || '200');
                        if (currentChildIndex >= maxHistory) {
                            for (let i = currentChildIndex - maxHistory; i >= 0; i--) {
                                currentSuperchats[i].parentNode.removeChild(currentSuperchats[i]);
                            }
                            const deletionAmount = currentChildIndex - maxHistory + 1;
                            pinAnimator.popPins(deletionAmount);
                            currentSuperchats = currentSuperchats.slice(deletionAmount);
                            currentChildIndex -= deletionAmount;
                        }
                        highestChildIndexSeen = currentChildIndex;
                    }
                    else {
                        const maxHistory = parseInt(maxHistorySizeInput.value || '200');
                        const deletionAmount = Math.min(highestChildIndexSeen - maxHistory + 1, currentSuperchats.length);
                        if (deletionAmount > 0) {
                            for (let i = deletionAmount - 1; i >= 0; i--) {
                                currentSuperchats[i].parentNode.removeChild(currentSuperchats[i]);
                            }
                            pinAnimator.popPins(deletionAmount);
                            currentSuperchats = currentSuperchats.slice(deletionAmount);
                            currentChildIndex = Math.max(currentChildIndex - deletionAmount, 0);
                            highestChildIndexSeen = highestChildIndexSeen - deletionAmount;
                        }
                        
                        //<yt-icon class="style-scope yt-live-chat-paid-message-footer-renderer"></yt-icon>

                        //temp1.data.showItemEndpoint.showLiveChatItemEndpoint.renderer.liveChatPaidMessageRenderer
                        //temp2.data.showItemEndpoint.showLiveChatItemEndpoint.renderer.liveChatPaidStickerRenderer
                        //temp1.data.showItemEndpoint.showLiveChatItemEndpoint.renderer.liveChatMembershipItemRenderer
                    }
                    if (currentChildIndex >= 0 && currentChildIndex < currentSuperchats.length) {
                        focusOn(currentSuperchats[currentChildIndex]);
                    }
                    updateButtons();
                }
                else if (currentChildIndex === currentSuperchats.length - 1) {
                    if (!waitingModeOn) {
                        showWaitingMode();
                        let expiredSuperchat = null;
                        let expiredIndex;
                        if (currentSuperchatExpired) {
                            currentSuperchatExpired = false;
                            expiredSuperchat = currentSuperchats[currentChildIndex];
                            expiredIndex = currentChildIndex;
                        }
                        else if (highlightedSuperchatExpired) {
                            highlightedSuperchatExpired = false;
                            const highlightedIndex = pinAnimator.getHighlightedIndex();
                            expiredSuperchat = currentSuperchats[highlightedIndex];
                            expiredIndex = highlightedIndex;
                        }
                        if (expiredSuperchat !== null) {
                            if (!showExpiredSuperchatsCheckbox.checked) {
                                if (expiredIndex <= currentChildIndex) {
                                    currentChildIndex--;
                                }
                                if (expiredIndex <= highestChildIndexSeen) {
                                    highestChildIndexSeen--;
                                }
            
                                expiredSuperchat.parentElement.removeChild(expiredSuperchat);
                                currentSuperchats.splice(expiredIndex, 1);
                                pinAnimator.removePin(expiredIndex);
                            }
                            else {
                                let price = expiredSuperchat.querySelector('.sll-price');
                                if (price === null) {
                                    price = document.createElement('span');
                                    price.textContent = 'member'
                                }
            
                                price.style.color = 'black';
                                const expiredSuperchatDiv = document.createElement('div');
                                expiredSuperchatDiv.setAttribute('style', `
                                    font-style: italic;
                                        background-color: rgba(128,128,128,1);
                                        color: black;
                                        box-sizing: content-box;
                                        padding: 8px 8px 8px 16px;
                                        position: relative;
                                        border-radius:4px;
                                `);
                                expiredSuperchatDiv.append(price.cloneNode(true))
                                expiredSuperchatDiv.append(document.createTextNode(' superchat expired'));
                                while (expiredSuperchat.firstChild) expiredSuperchat.removeChild(expiredSuperchat.firstChild);
                                expiredSuperchat.append(expiredSuperchatDiv);
                            }

                            if (currentChildIndex >= 0 && currentChildIndex < currentSuperchats.length) {
                                focusOn(currentSuperchats[currentChildIndex]);
                            }
                        }
                    }
                }

                const showMoreButtonTag = showMoreButton.querySelector('#button.style-scope.yt-icon-button');
                if (showMoreButtonTag !== null && showMoreButtonTag.parentNode.style.visibility !== 'hidden') {
                    showMoreButtonTag.click();
                }
                else {
                    const itemScroller = chatPanel.querySelector('#item-scroller');
                    itemScroller.scrollTo(0, itemScroller.scrollHeight * 2);
                }
                const fadeElement = chatPanel.querySelector('#fade');
                if (fadeElement && fadeElement.parentElement && !fadeElement.parentElement.hidden) {
                    fadeElement.click();
                }
                pinAnimator.clearHighlight();
                highlightedIndex = -1;
            }
            function enableNextSuperchatButton() {
                nextSuperchatButton.style.backgroundColor = '#c00';
                nextSuperchatButton.style.cursor = 'pointer';
                nextSuperchatButton.textContent = 'Next';
            }
            function enableWaitSuperchatButton() {
                nextSuperchatButton.style.backgroundColor = '#c00';
                nextSuperchatButton.style.cursor = 'pointer';
                nextSuperchatButton.textContent = 'Next';
            }
            function disableNextSuperchatButton() {
                nextSuperchatButton.style.backgroundColor = '#676767';
                nextSuperchatButton.style.cursor = 'not-allowed';
                nextSuperchatButton.textContent = 'Wait';
            }
            controlBox.append(nextSuperchatButton);

            const hideSuperchatsButton = document.createElement('button');
            hideSuperchatsButton.style.backgroundColor = '#525252';
            hideSuperchatsButton.style.borderRadius = '2px';
            hideSuperchatsButton.style.borderWidth = '0';
            hideSuperchatsButton.style.color = '#fff';
            hideSuperchatsButton.style.cursor = 'pointer';
            hideSuperchatsButton.style.fontFamily = '"Roboto", "Noto", sans-serif';
            hideSuperchatsButton.style.margin = '0 0.2rem';
            hideSuperchatsButton.style.padding = '0 0.3rem';
            hideSuperchatsButton.style.textTransform = 'uppercase';
            hideSuperchatsButton.title = 'hide live log';
            const visibilityEye = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            visibilityEye.style.cursor = 'pointer';
            visibilityEye.setAttribute('viewBox', "0 0 33.866666 33.866666");
            visibilityEye.setAttribute('version', "1.1");
            visibilityEye.setAttribute('width', "20");
            visibilityEye.setAttribute('height', "20");
            visibilityEye.setAttribute('style', 'margin-top:0.2rem');
            visibilityEye.setAttribute('xmlns', "http://www.w3.org/2000/svg");
            visibilityEye.setAttribute('xmls:svg', "http://www.w3.org/2000/svg");
            const closedEye = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            closedEye.setAttribute('style', 'display:none');
            const bottomLid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bottomLid.setAttribute('d', 'm 30.642591,16.933332 c -13.709259,8.466667 -13.709259,8.466667 -27.4185165,0');
            bottomLid.setAttribute('style', 'fill:none;stroke:#ffffff;stroke-width:2.25;stroke-linecap:round');
            closedEye.append(bottomLid);
            const bottomLash1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bottomLash1.setAttribute('d', 'M 6.538474,22.833487 4.281712,26.491384');
            bottomLash1.setAttribute('style', 'fill:none;stroke:#ffffff;stroke-width:2.25;stroke-linecap:round');
            closedEye.append(bottomLash1);
            const bottomLash2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bottomLash2.setAttribute('d', 'm 12.997173,25.4 -1.72576,4.203772');
            bottomLash2.setAttribute('style', 'fill:none;stroke:#ffffff;stroke-width:2.25;stroke-linecap:round');
            closedEye.append(bottomLash2);
            const bottomLash3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bottomLash3.setAttribute('d', 'm 20.869492,25.399999 1.72576,4.203772');
            bottomLash3.setAttribute('style', 'fill:none;stroke:#ffffff;stroke-width:2.25;stroke-linecap:round');
            closedEye.append(bottomLash3);
            const bottomLash4 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bottomLash4.setAttribute('d', 'm 27.328191,22.833486 2.256762,3.657897');
            bottomLash4.setAttribute('style', 'fill:none;stroke:#ffffff;stroke-width:2.25;stroke-linecap:round');
            closedEye.append(bottomLash4);
            const openedEye = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const eyeIris = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            eyeIris.setAttribute('style', 'fill:#ffffff;fill-opacity:1');
            eyeIris.setAttribute('cx', '16.933332');
            eyeIris.setAttribute('cy', '16.933332');
            eyeIris.setAttribute('r', '6.2010884');
            openedEye.append(eyeIris);
            const eyePupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            eyePupil.setAttribute('style', 'fill:#ffffff;fill-opacity:1');
            eyePupil.setAttribute('cx', '16.933332');
            eyePupil.setAttribute('cy', '16.933332');
            eyePupil.setAttribute('r', '2.7750256');
            openedEye.append(eyePupil);
            const topLid = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            topLid.setAttribute('d', 'm 3.2240745,16.933333 c 13.7092575,-8.4666668 13.7092575,-8.4666668 27.4185175,0');
            topLid.setAttribute('style', 'fill:none;stroke:#ffffff;stroke-width:2.25;stroke-linecap:round');
            openedEye.append(topLid);
            visibilityEye.append(closedEye);
            visibilityEye.append(openedEye);
            hideSuperchatsButton.append(visibilityEye);
            hideSuperchatsButton.addEventListener('click', function(){
                if (liveLogBoxContainer.style.position !== 'absolute') {
                    hideVisibilityEye();
                }
                else {
                    showVisibilityEye();
                    const showMoreButtonTag = showMoreButton.querySelector('#button.style-scope.yt-icon-button');
                    if (showMoreButtonTag !== null && showMoreButtonTag.parentNode.style.visibility !== 'hidden') {
                        showMoreButtonTag.click();
                    }
                    else {
                        const itemScroller = chatPanel.querySelector('#item-scroller');
                        itemScroller.scrollTo(0, itemScroller.scrollHeight * 2);
                    }
                }
            });
            controlBox.append(hideSuperchatsButton);
            function hideVisibilityEye() {
                if (liveLogBoxContainer.style.position !== 'absolute') {
                    const disappearingHeight = liveLogBox.clientHeight + liveLogMessage.clientHeight;
                    const itemScroller = chatPanel.querySelector('#item-scroller');
                    const originalScrollTop = itemScroller.scrollTop;

                liveLogBoxContainer.style.position = 'absolute';
                liveLogBoxContainer.style.top = '-100vh';
                openedEye.style.display = 'none';
                closedEye.style.display = 'inline';
                hideSuperchatsButton.style.backgroundColor = '#c00';
                hideSuperchatsButton.title = 'show live log';

                    itemScroller.scrollTo(0, originalScrollTop - disappearingHeight - 1);
                }
            }
            function showVisibilityEye() {
                if (liveLogBoxContainer.style.position === 'absolute') {
                    const appearingHeight = liveLogBox.clientHeight + liveLogMessage.clientHeight;
                    const itemScroller = chatPanel.querySelector('#item-scroller');
                    const originalScrollTop = itemScroller.scrollTop;

                liveLogBoxContainer.style.position = 'static';
                liveLogBoxContainer.style.top = 'auto';
                openedEye.style.display = 'inline';
                closedEye.style.display = 'none';
                hideSuperchatsButton.style.backgroundColor = '#525252';
                hideSuperchatsButton.title = 'hide live log';

                    itemScroller.scrollTo(0, originalScrollTop + appearingHeight + 1);
                }
            }

            const pinAnimator = createPinAnimator(pinAnimatorCanvas, pinAnimatorContainer);
            setTimeout(()=>{
                pinAnimatorCanvas.height = pinAnimatorContainer.clientHeight;
                pinAnimatorCanvas.width = pinAnimatorContainer.clientWidth;
                pinAnimator.initialize();
            }, 0);
            pinAnimator.addPinClickListener(function(superchatIndex){
                const highlightedIndex = pinAnimator.getHighlightedIndex();
                if (highlightedIndex !== superchatIndex) {
                    if (waitingModeOn) {
                        hideWaitingMode();
                    }
                    showVisibilityEye();

                    let expiredSuperchat = null;
                    let expiredIndex;
                    if (currentSuperchatExpired) {
                        currentSuperchatExpired = false;
                        expiredSuperchat = currentSuperchats[currentChildIndex];
                        expiredIndex = currentChildIndex;
                    }
                    else if (highlightedSuperchatExpired) {
                        highlightedSuperchatExpired = false;
                        const highlightedIndex = pinAnimator.getHighlightedIndex();
                        expiredSuperchat = currentSuperchats[highlightedIndex];
                        expiredIndex = highlightedIndex;
                    }
                    if (expiredSuperchat !== null) {
                        if (!showExpiredSuperchatsCheckbox.checked) {
                            if (expiredIndex <= superchatIndex) {
                                superchatIndex--;
                            }
                            if (expiredIndex <= currentChildIndex) {
                                currentChildIndex--;
                            }
                            if (expiredIndex <= highestChildIndexSeen) {
                                highestChildIndexSeen--;
                            }
        
                            expiredSuperchat.parentElement.removeChild(expiredSuperchat);
                            currentSuperchats.splice(expiredIndex, 1);
                            pinAnimator.removePin(expiredIndex);
                        }
                        else {
                            let price = expiredSuperchat.querySelector('.sll-price');
                            if (price === null) {
                                price = document.createElement('span');
                                price.textContent = 'member'
                            }
        
                            price.style.color = 'black';
                            const expiredSuperchatDiv = document.createElement('div');
                            expiredSuperchatDiv.setAttribute('style', `
                                font-style: italic;
                                    background-color: rgba(128,128,128,1);
                                    color: black;
                                    box-sizing: content-box;
                                    padding: 8px 8px 8px 16px;
                                    position: relative;
                                    border-radius:4px;
                            `);
                            expiredSuperchatDiv.append(price.cloneNode(true))
                            expiredSuperchatDiv.append(document.createTextNode(' superchat expired'));
                            while (expiredSuperchat.firstChild) expiredSuperchat.removeChild(expiredSuperchat.firstChild);
                            expiredSuperchat.append(expiredSuperchatDiv);
                        }
                    }

                    focusOn(currentSuperchats[superchatIndex]);
                    pinAnimator.clearHighlight();
                    pinAnimator.highlightIndex(superchatIndex);

                    const showMoreButtonTag = showMoreButton.querySelector('#button.style-scope.yt-icon-button');
                    if (showMoreButtonTag !== null && showMoreButtonTag.parentNode.style.visibility !== 'hidden') {
                        showMoreButtonTag.click();
                    }
                    else {
                        const itemScroller = chatPanel.querySelector('#item-scroller');
                        itemScroller.scrollTo(0, itemScroller.scrollHeight * 2);
                    }
                    const fadeElement = chatPanel.querySelector('#fade');
                    if (fadeElement && fadeElement.parentElement && !fadeElement.parentElement.hidden) {
                        fadeElement.click();
                    }
                }
                else {
                    pinAnimator.clearHighlight();
                    while (currentChildIndex < highlightedIndex) {
                        focusOnNextSuperchat();
                    }
                    while (currentChildIndex > highlightedIndex) {
                        focusOnPreviousSuperchat();
                    }
                }
            });
            pinAnimator.addPinExpirationListener(function(superchatIndex){
                let highlightedIndex = pinAnimator.getHighlightedIndex();
                if (currentChildIndex !== superchatIndex && highlightedIndex !== superchatIndex) {
                    const expiredSuperchat = currentSuperchats[superchatIndex];

                    if (!showExpiredSuperchatsCheckbox.checked) {
                        if (superchatIndex <= highlightedIndex) {
                            highlightedIndex--;
                        }
                        if (superchatIndex <= currentChildIndex) {
                            currentChildIndex--;
                        }
                        if (superchatIndex <= highestChildIndexSeen) {
                            highestChildIndexSeen--;
                        }

                        expiredSuperchat.parentElement.removeChild(expiredSuperchat);
                        currentSuperchats.splice(superchatIndex, 1);
                        pinAnimator.removePin(superchatIndex);
                    }
                    else {
                        let price = expiredSuperchat.querySelector('.sll-price');
                        if (price === null) {
                            price = document.createElement('span');
                            price.textContent = 'member'
                        }

                        price.style.color = 'black';
                        const expiredSuperchatDiv = document.createElement('div');
                        expiredSuperchatDiv.setAttribute('style', `
                            font-style: italic;
                                background-color: rgba(128,128,128,1);
                                color: black;
                                box-sizing: content-box;
                                padding: 8px 8px 8px 16px;
                                position: relative;
                                border-radius:4px;
                        `);
                        expiredSuperchatDiv.append(price.cloneNode(true))
                        expiredSuperchatDiv.append(document.createTextNode(' superchat expired'));
                        while (expiredSuperchat.firstChild) expiredSuperchat.removeChild(expiredSuperchat.firstChild);
                        expiredSuperchat.append(expiredSuperchatDiv);
                    }

                    if (currentChildIndex >= 0 && currentChildIndex < currentSuperchats.length) {
                        if (highlightedIndex === -1) {
                            focusOn(currentSuperchats[currentChildIndex], false);
                        }
                        else {
                            focusOn(currentSuperchats[highlightedIndex], false);
                        }
                    }
                }
                else if (currentChildIndex === superchatIndex) {
                    currentSuperchatExpired = true;
                }
                else if (highlightedIndex === superchatIndex) {
                    highlightedSuperchatExpired = true;
                }
            });
    
            chatPanel.parentNode.insertBefore(controlBox, chatPanel);
            chatPanel.parentNode.insertBefore(optionsBox, chatPanel);
            chatPanel.parentNode.insertBefore(pinAnimatorContainer, chatPanel);
            chatPanel.parentNode.insertBefore(liveLogBoxContainer, chatPanel);
    
            function updateButtons() {
                if (currentChildIndex < currentSuperchats.length - 1) {
                    enableNextSuperchatButton();
                }
                else if (currentChildIndex === currentSuperchats.length - 1) {
                    if (!waitingModeOn) {
                        enableWaitSuperchatButton();
                    }
                    else {
                        disableNextSuperchatButton();
                    }
                }
                if (currentChildIndex > 0 || (currentChildIndex === 0 && waitingModeOn)) {
                    enablePreviousSuperchatButton();
                }
                else {
                    disablePreviousSuperchatButton();
                }
            };
            updateButtons();
    
            function updateItemNumberDisplay() {
                if (showHistoryCheckbox.checked) {
                    itemNumberDisplay.textContent = `${currentChildIndex + 1} / ${highestChildIndexSeen + 1} +${currentSuperchats.length - 1 - highestChildIndexSeen}`;
                }
                else {
                    itemNumberDisplay.textContent = `+${currentSuperchats.length - 1 - highestChildIndexSeen}`;
                }
            };
    
            function focusOn(superchatElement, smooth = true) {
                if (superchatElement.clientHeight !== 0) {
                    if (superchatElement.clientHeight !== parseInt(liveLogBox.style.height)) {
                        liveLogBox.style.height = `${superchatElement.clientHeight}px`;
                    }
                    if (smooth) {
                    liveLogBox.scrollTo({
                        top: superchatElement.offsetTop - liveLogBox.offsetTop,
                        behavior: "smooth"
                    });
                        if (!scrollingToSuperchat) {
                            scrollingToSuperchat = true;
                            const scrollEnd = debounce(()=>{
                                scrollingToSuperchat = false;
                                liveLogBox.removeEventListener('scroll', scrollEnd);
                            }, 200);
                            liveLogBox.addEventListener('scroll', scrollEnd, { passive: true });
                        }
                    }
                    else if (!scrollingToSuperchat) {
                        liveLogBox.scrollTo(0, superchatElement.offsetTop - liveLogBox.offsetTop);
                    }
                    else {
                        liveLogBox.scrollTo({
                            top: superchatElement.offsetTop - liveLogBox.offsetTop,
                            behavior: "smooth"
                        });
                    }
        
                    updateItemNumberDisplay();
                }
            }

            function toColor(num) {
                num >>>= 0;
                var b = num & 0xFF,
                    g = (num & 0xFF00) >>> 8,
                    r = (num & 0xFF0000) >>> 16,
                    a = ( (num & 0xFF000000) >>> 24 ) / 255 ;
                return "rgba(" + [r, g, b, a].join(",") + ")";
            }

            const deletedChatObserver = new MutationObserver(function(mutationList) {
                for (let i = 0, iSize = mutationList.length; i < iSize; i++) {
                    const mutation = mutationList[i];

                    if (superchatLinkedNodes.hasOwnProperty(mutation.target.data.id)) {
                        const highlightedIndex = pinAnimator.getHighlightedIndex();
                        if(!showRemovedSuperchatsCheckbox.checked
                            && (currentChildIndex === -1 || superchatLinkedNodes[mutation.target.data.id].clonedNode !== currentSuperchats[currentChildIndex])
                            && (highlightedIndex === -1 || superchatLinkedNodes[mutation.target.data.id].clonedNode !== currentSuperchats[highlightedIndex])
                        ) {
                            const removedIndex = currentSuperchats.indexOf(superchatLinkedNodes[mutation.target.data.id].clonedNode);
                            if (removedIndex <= currentChildIndex) {
                                currentChildIndex--;
                            }
                            if (removedIndex <= highestChildIndexSeen) {
                                highestChildIndexSeen--;
                            }
        
                            const removedSuperchat = superchatLinkedNodes[mutation.target.data.id].clonedNode;
                            removedSuperchat.parentElement.removeChild(removedSuperchat);
                            currentSuperchats.splice(removedIndex, 1);
                            pinAnimator.removePin(removedIndex);
                        }
                        else {
                            if (mutation.target.tagName.toLowerCase() === 'yt-live-chat-paid-message-renderer'
                                || mutation.target.tagName.toLowerCase() === 'yt-live-chat-membership-item-renderer') {
                                const messageNode = superchatLinkedNodes[mutation.target.data.id].clonedNode.querySelector('.sll-message');
                                if (messageNode !== null) {
                                    while (messageNode.firstChild
                                            && (messageNode.firstChild.nodeType === Node.TEXT_NODE
                                                || messageNode.firstChild.tagName.toLowerCase() === 'img')) {
                                        messageNode.removeChild(messageNode.firstChild);
                                    }
                                    const hasDonationNode = messageNode.lastChild !== null;
                                    for (let i = 0, iSize = mutation.target.data.deletedStateMessage.runs.length; i < iSize; i++) {
                                        const current = mutation.target.data.deletedStateMessage.runs[i];
                                            if (current.hasOwnProperty('text')) {
                                            if (hasDonationNode) {
                                                messageNode.insertBefore(document.createTextNode(current.text), messageNode.lastChild);
                                            }
                                            else {
                                                messageNode.append(document.createTextNode(current.text));
                                            }
                                            }
                                            else if (current.hasOwnProperty('emoji')) {
                                            const img = document.createElement('img');
                                            img.setAttribute('src', current.emoji.image.thumbnails[0].url);
                                            img.setAttribute('alt', current.emoji.image.accessibility.accessibilityData.label);
                                            img.setAttribute('height', '24');
                                            img.setAttribute('width', '24');
                                            img.setAttribute('style', `
                                                margin: -1px 2px 1px;
                                                vertical-align: middle;
                                            `);
                                            if (hasDonationNode) {
                                                messageNode.insertBefore(img, messageNode.lastChild);
                                            }
                                            else {
                                                messageNode.append(img);
                                            }
                                        }
                                    }
                                    messageNode.style.color = mutation.target.data.hasOwnProperty('authorNameTextColor') ? toColor(mutation.target.data.authorNameTextColor) : 'rgba(255, 255, 255, 0.7)';
                                    messageNode.style.fontStyle = 'italic';
                                }
                            }

                            const userIcon = superchatLinkedNodes[mutation.target.data.id].clonedNode.querySelector('.sll-user-icon');
                            const userName = superchatLinkedNodes[mutation.target.data.id].clonedNode.querySelector('.sll-user-name');
                            const sticker = superchatLinkedNodes[mutation.target.data.id].clonedNode.querySelector('.sll-sticker');
                            if (userIcon !== null) {
                                userIcon.remove();
                            }
                            if (userName !== null) {
                                userName.remove();
                            }
                            if (sticker !== null) {
                                sticker.remove();
                            }
                        }
                        if (currentChildIndex >= 0 && currentChildIndex < currentSuperchats.length) {
                            focusOn(currentSuperchats[currentChildIndex], false);
                        }
                    }
                }
            });
    
            superchatLiveLogsObserver = new MutationObserver(function(mutationList, observer) {
                function proxyClicker(doppelgangerButton, chatElement) {
                    const chatFrame = document.getElementById('chatframe');
                    if (chatFrame !== null) {
                        chatElement.querySelector('#button').click();
                        let popupWindow = chatFrame.contentDocument.querySelector('tp-yt-iron-dropdown.style-scope.yt-live-chat-app, tp-yt-iron-dropdown.style-scope.ytls-popup-container');
                        if (popupWindow !== null) {
                            let observer = new MutationObserver(function(mutationList) {
                                for (let i = 0, iSize = mutationList.length; i < iSize; i++) {
                                    const mutation = mutationList[i];
                                    if (mutation.type === 'attributes') {
                                        if (mutation.oldValue.replace(/\s/g, '').indexOf('display:none') !== -1
                                            && mutation.target.getAttribute('style').replace(/\s/g, '').indexOf('display:none') === -1)
                                        {
                                            const popupContainer = mutation.target;
                                            const popupContent = popupContainer.querySelector('ytd-menu-popup-renderer, ytls-menu-popup-renderer');
                                            popupContent.style.maxWidth = '250px';
                                            popupContent.style.maxHeight = '300px';
                                            popupContainer.style.left = `${doppelgangerButton.getBoundingClientRect().x - (popupContent.clientWidth - doppelgangerButton.clientWidth)}px`;
                                            popupContainer.style.top = `${doppelgangerButton.getBoundingClientRect().y + doppelgangerButton.clientHeight}px`;
                                            observer.disconnect();
                                            break;
                                        }
                                    }
                                }
                            });
                            observer.observe(popupWindow, {attributeFilter: ['style'], attributeOldValue: true});
                        }
                        else {
                            function initialProxyClicker() {
                                const popupContainer = chatFrame.contentDocument.querySelector('tp-yt-iron-dropdown.style-scope.yt-live-chat-app, tp-yt-iron-dropdown.style-scope.ytls-popup-container');
                                if (popupContainer !== null) {
                                    const popupContent = popupContainer.querySelector('ytd-menu-popup-renderer, ytls-menu-popup-renderer');
                                    popupContent.style.maxWidth = '250px';
                                    popupContent.style.maxHeight = '300px';
                                    popupContainer.style.left = `${doppelgangerButton.getBoundingClientRect().x - (popupContent.clientWidth - doppelgangerButton.clientWidth)}px`;
                                    popupContainer.style.top = `${doppelgangerButton.getBoundingClientRect().y + doppelgangerButton.clientHeight}px`;
                                }
                                else {
                                    setTimeout(initialProxyClicker, 200);
                                }
                            }
                            initialProxyClicker();
                        }
                    }
                }

                function copySuperchatToLiveLog(addedNode, tagName) {
                    if ((!darkblueCheckbox.checked || !lightblueCheckbox.checked || !greenCheckbox.checked || !yellowCheckbox.checked || !orangeCheckbox.checked || !magentaCheckbox.checked || !redCheckbox.checked)
                        && (tagName === 'yt-live-chat-paid-sticker-renderer' || tagName === 'yt-live-chat-paid-message-renderer'))
                    {
                        let bgColorInt;
                        if (tagName === 'yt-live-chat-paid-sticker-renderer') {
                            bgColorInt = addedNode.data.backgroundColor;
                        }
                        else if (tagName === 'yt-live-chat-paid-message-renderer') {
                            bgColorInt = addedNode.data.headerBackgroundColor;
                        }

                        if ((!darkblueCheckbox.checked && bgColorInt === superchatPaymentLevel.oneToTwoUSD.bgColorInt)
                            || (!lightblueCheckbox.checked && bgColorInt === superchatPaymentLevel.twoToFiveUSD.bgColorInt)
                            || (!greenCheckbox.checked && bgColorInt === superchatPaymentLevel.fiveToTenUSD.bgColorInt)
                            || (!yellowCheckbox.checked && bgColorInt === superchatPaymentLevel.tenToTwentyUSD.bgColorInt)
                            || (!orangeCheckbox.checked && bgColorInt === superchatPaymentLevel.twentyToFiftyUSD.bgColorInt)
                            || (!magentaCheckbox.checked && bgColorInt === superchatPaymentLevel.fiftyToHundredUSD.bgColorInt)
                            || (!redCheckbox.checked && bgColorInt === superchatPaymentLevel.hundredToHalfGrandUSD.bgColorInt))
                        {
                            // console.log('filtering out', bgColorInt);
                            return;
                        }
                        else {
                            // console.log('something wrong here', bgColorInt);
                        }
                    }
                    if ((!newMemberCheckbox.checked || !memberMessageCheckbox.checked) && tagName === 'yt-live-chat-membership-item-renderer') {
                        if (!newMemberCheckbox.checked && addedNode.data.headerSubtext.hasOwnProperty('runs')) {
                            return;
                        }
                        else if (!memberMessageCheckbox.checked && addedNode.data.headerSubtext.hasOwnProperty('simpleText')) {
                            return;
                        }
                    }
                    if ((!memberGiftCheckbox.checked && tagName === 'ytd-sponsorships-live-chat-gift-purchase-announcement-renderer'))
                    {
                        return;
                    }
                    if ((!fundraiserDonationCheckbox.checked && tagName === 'yt-live-chat-donation-announcement-renderer'))
                    {
                        return;
                    }

                    {
                        const weakAddedNode = new WeakRef(addedNode);
                        const proxyFunc = function(event){
                            const originalNode = weakAddedNode.deref();
                            if (originalNode && originalNode.parentNode !== null) {
                                proxyClicker(event.target, originalNode);
                            }
                            // else {
                            //     superchatNotActionableMessage();
                            // }
                        }

                        let clonedNode = document.createElement('div');
                        clonedNode.style.padding = '4px 24px';
                        clonedNode.style.fontFamily = 'Roboto, Arial, sans-serif';
                        clonedNode.style.fontSize = '14px';
                        clonedNode.style.fontWeight = '500';
                        if (tagName === 'yt-live-chat-paid-message-renderer') {
                            clonedNode.classList.add('paid-message');
                            const bodyBgColor = toColor(addedNode.data.bodyBackgroundColor);
                            const bodyFgColor = toColor(addedNode.data.bodyTextColor);
                            const headerBgColor = toColor(addedNode.data.headerBackgroundColor);
                            const headerFgColor = toColor(addedNode.data.headerTextColor);
                            const authorColor = toColor(addedNode.data.authorNameTextColor);
                            const clonedNodeContainer = document.createElement('div');
                            clonedNodeContainer.setAttribute('style', `
                                        border-radius: 4px;
                                        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
                                        overflow: hidden;
                            `);
                            const clonedNodeHeader = document.createElement('div');
                            clonedNodeHeader.setAttribute('class', 'sll-header');
                            clonedNodeHeader.setAttribute('style', `
                                            background-color: ${headerBgColor};
                                            ${addedNode.data.hasOwnProperty('headerOverlayImage')
                                                ? `background-image: url('${addedNode.data.headerOverlayImage.thumbnails[0].url}');
                                                   background-position: right top;
                                                   background-repeat: no-repeat;
                                                   background-size: ${addedNode.data.headerOverlayImage.thumbnails[0].width}px ${addedNode.data.headerOverlayImage.thumbnails[0].height}px;`
                                                : ''}
                                            box-sizing: content-box;
                                            display: flex;
                                            justify-content: space-between;
                                            padding: 8px 8px 8px 16px;
                                            position: relative;
                                            border-top-left-radius:4px;
                                            border-top-right-radius:4px;
                                            ${addedNode.data.hasOwnProperty('message') || addedNode.data.hasOwnProperty('footer') ? '' : `
                                                border-bottom-left-radius:4px;
                                                border-bottom-right-radius:4px;
                                            `}
                            `);
                            const clonedNodeHeaderImage = document.createElement('img');
                            clonedNodeHeaderImage.setAttribute('style', `
                                                width: 40px;
                                                height: 40px;
                                                border-radius: 20px;
                                                margin-right: 16px;
                            `);
                            clonedNodeHeaderImage.setAttribute('class', 'sll-user-icon');
                            clonedNodeHeaderImage.setAttribute('src', addedNode.data.authorPhoto.thumbnails[addedNode.data.authorPhoto.thumbnails.length - 1].url);
                            clonedNodeHeader.append(clonedNodeHeaderImage);
                            const clonedNodeHeaderDiv = document.createElement('div');
                            clonedNodeHeaderDiv.setAttribute('style', `
                                display:flex;
                                justify-content:space-between;
                                margin-right:auto;
                            `);
                            const clonedNodeHeaderDivDiv = document.createElement('div');
                            clonedNodeHeaderDivDiv.setAttribute('style', `
                                display:flex;
                                align-items:center;
                            `);
                            const clonedNodeHeaderDivDivDiv = document.createElement('div');
                            const clonedNodeHeaderDivDivDivDiv = document.createElement('div');
                            clonedNodeHeaderDivDivDivDiv.setAttribute('style', `
                                color:${authorColor};
                                margin-right:8px;
                                -webkit-line-clamp:1;
                                overflow:hidden;
                                -webkit-box-orient:vertical;
                                text-overflow:ellipsis;
                                white-space:normal;
                                display:-webkit-box;
                                margin-bottom:1px;
                            `);
                            clonedNodeHeaderDivDivDivDiv.setAttribute('class', 'sll-user-name');
                            clonedNodeHeaderDivDivDivDiv.textContent = addedNode.data.authorName.simpleText;
                            clonedNodeHeaderDivDivDiv.append(clonedNodeHeaderDivDivDivDiv);
                            const clonedNodeHeaderDivDivDivSpan = document.createElement('span');
                            clonedNodeHeaderDivDivDivSpan.setAttribute('style', `
                                color:${headerFgColor};
                                font-size:15px;
                                padding-right:8px;
                                line-height:12px;
                            `);
                            clonedNodeHeaderDivDivDivSpan.setAttribute('class', 'sll-price');
                            clonedNodeHeaderDivDivDivSpan.textContent = addedNode.data.purchaseAmountText.simpleText;
                            clonedNodeHeaderDivDivDiv.append(clonedNodeHeaderDivDivDivSpan);
                            clonedNodeHeaderDivDiv.append(clonedNodeHeaderDivDivDiv);
                            clonedNodeHeaderDiv.append(clonedNodeHeaderDivDiv);
                            clonedNodeHeader.append(clonedNodeHeaderDiv);
                            const clonedNodeHeaderSideMenu = document.createElement('div');
                            clonedNodeHeaderSideMenu.setAttribute('style', `
                                                width: 24px;
                                                height: 100%;
                                                position: absolute;
                                                top: 0;
                                                right: 0;
                                                border-top-right-radius: 4px;
                                                border-bottom-right-radius: 4px;
                            `);
                            clonedNodeHeaderSideMenu.setAttribute('class', 'sll-side-menu');
                            const clonedNodeHeaderSideMenuButton = document.createElement('div');
                            clonedNodeHeaderSideMenuButton.setAttribute('style', `
                                cursor:pointer;
                                margin-top:1px;
                            `);
                            clonedNodeHeaderSideMenuButton.setAttribute('class', 'sll-doppelganger-button');
                            const clonedNodeHeaderSideMenuButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            clonedNodeHeaderSideMenuButtonIcon.style.cursor = 'pointer';
                            clonedNodeHeaderSideMenuButtonIcon.setAttribute('viewBox', '0 0 24 24');
                            clonedNodeHeaderSideMenuButtonIcon.setAttribute('version', '1.1');
                            clonedNodeHeaderSideMenuButtonIcon.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                            clonedNodeHeaderSideMenuButtonIcon.setAttribute('focusable', 'false');
                            clonedNodeHeaderSideMenuButtonIcon.setAttribute('style', `
                                                        pointer-events: none;
                                                        display: block;
                                                        width: 100%;
                                                        height: 100%;
                                                        color: ${headerFgColor};
                                                        fill: ${headerFgColor};
                            `);
                            clonedNodeHeaderSideMenuButtonIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                            clonedNodeHeaderSideMenuButtonIcon.setAttribute('xmls:svg', 'http://www.w3.org/2000/svg');
                            // <g class="style-scope yt-icon">
                            //     <path d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z" class="style-scope yt-icon"></path>
                            // </g>
                            const clonedNodeHeaderSideMenuButtonIconG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                            clonedNodeHeaderSideMenuButtonIconG.setAttribute('class', 'style-scope yt-icon');
                            const clonedNodeHeaderSideMenuButtonIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            clonedNodeHeaderSideMenuButtonIconPath.setAttribute('d', 'M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z');
                            clonedNodeHeaderSideMenuButtonIconPath.setAttribute('class', 'style-scope yt-icon');
                            clonedNodeHeaderSideMenuButtonIconG.append(clonedNodeHeaderSideMenuButtonIconPath);
                            clonedNodeHeaderSideMenuButtonIcon.append(clonedNodeHeaderSideMenuButtonIconG);
                            clonedNodeHeaderSideMenuButton.append(clonedNodeHeaderSideMenuButtonIcon);
                            clonedNodeHeaderSideMenu.append(clonedNodeHeaderSideMenuButton);
                            clonedNodeHeader.append(clonedNodeHeaderSideMenu);
                            clonedNodeContainer.append(clonedNodeHeader);
                            if (addedNode.data.hasOwnProperty('message') || addedNode.data.hasOwnProperty('footer')) {
                                const clonedNodeHeaderMessage = document.createElement('div');
                                clonedNodeHeaderMessage.setAttribute('style', `
                                    padding:8px 16px;
                                    color:${bodyFgColor};
                                    background-color:${bodyBgColor};
                                    word-wrap: break-word;
                                    word-break: break-word;
                                    font-size: 15px;
                                    font-weight: normal;
                                    line-height: 20px;
                                    border-bottom-left-radius: 4px;
                                    border-bottom-right-radius: 4px;
                                `);
                                clonedNodeHeaderMessage.setAttribute('class', 'sll-message');
                                if (addedNode.data.hasOwnProperty('message')) {
                                    for (let i = 0, iSize = addedNode.data.message.runs.length; i < iSize; i++) {
                                        const current = addedNode.data.message.runs[i];
                                        if (current.hasOwnProperty('text')) {
                                            clonedNodeHeaderMessage.append(document.createTextNode(current.text));
                                        }
                                        else if (current.hasOwnProperty('emoji')) {
                                            const img = document.createElement('img');
                                            img.setAttribute('src', current.emoji.image.thumbnails[0].url);
                                            img.setAttribute('alt', current.emoji.image.accessibility.accessibilityData.label);
                                            img.setAttribute('height', '24');
                                            img.setAttribute('width', '24');
                                            img.setAttribute('style', `
                                                margin: -1px 2px 1px;
                                                vertical-align: middle;
                                            `);
                                            clonedNodeHeaderMessage.append(img);
                                        }
                                    }
                                }
                                clonedNodeContainer.append(clonedNodeHeaderMessage);
                            }
                            clonedNode.append(clonedNodeContainer);

                            if (addedNode.data.hasOwnProperty('footer')) {
                                const footerNode = document.createElement('div');
                                if (addedNode.data.hasOwnProperty('message')) {
                                    footerNode.style.borderTop = '1px solid rgba(0,0,0,0.12)';
                                    footerNode.style.marginTop = '0.6rem';
                                    footerNode.style.paddingTop = '0.6rem';
                                }
                                footerNode.style.fontSize = '1.2rem';
                                footerNode.style.lineHeight = '1.6rem';
                                footerNode.style.display = 'flex';
                                const iconContainer = document.createElement('div');
                                iconContainer.style.minWidth = '40px';
                                iconContainer.style.minHeight = '35px';
                                iconContainer.style.marginRight = '16px';
                                iconContainer.style.display = 'flex';
                                iconContainer.style.justifyContent = 'center';
                                iconContainer.style.alignItems = 'center';

                                const iconContainerIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                iconContainerIcon.style.cursor = 'pointer';
                                iconContainerIcon.setAttribute('viewBox', '0 0 24 24');
                                iconContainerIcon.setAttribute('version', '1.1');
                                iconContainerIcon.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                                iconContainerIcon.setAttribute('focusable', 'false');
                                iconContainerIcon.setAttribute('class', 'style-scope yt-icon');
                                iconContainerIcon.setAttribute('style', `
                                    pointer-events: none;
                                    display: block;
                                    width: 24px;
                                    height: 24px;
                                    color: ${bodyFgColor};
                                    fill: ${bodyFgColor};
                                `);
                                iconContainerIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                                iconContainerIcon.setAttribute('xmls:svg', 'http://www.w3.org/2000/svg');
                                // <g class="style-scope yt-icon">
                                //     <path d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z" class="style-scope yt-icon"></path>
                                // </g>
                                const iconContainerIconG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                                iconContainerIconG.setAttribute('class', 'style-scope yt-icon');
                                const iconContainerIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                                iconContainerIconPath.setAttribute('d', 'M21.29,7.63L21.29,7.63C20.32,5.94,18.55,5,16.73,5c-0.89,0-1.8,0.23-2.63,0.71L12,6.92L9.9,5.71C9.07,5.23,8.17,5,7.27,5 C5.45,5,3.68,5.94,2.71,7.63l0,0c-1.45,2.52-0.59,5.74,1.93,7.19L12,19l7.36-4.17C21.88,13.37,22.75,10.15,21.29,7.63z M3.57,8.13 C4.33,6.82,5.75,6,7.27,6C8.02,6,8.75,6.2,9.4,6.57c0,0,4.22,2.43,4.54,2.61c0.17,0.1,0.32,0.22,0.42,0.39 c0.29,0.46,0.19,1.18-0.43,1.49c-0.36,0.18-0.72,0.16-1.07-0.03c-0.35-0.19-4.62-2.58-4.62-2.58l-1.07,0.6l1.04,0.6L3.53,12.3 c0,0-0.3-0.6-0.38-0.93C2.85,10.27,3,9.12,3.57,8.13z M4.15,13.15c1.43-0.8,5.17-2.88,5.17-2.88l2.2,1.22l-5.39,3.03l-1-0.57 C4.76,13.74,4.44,13.46,4.15,13.15z M20.85,11.37c-0.29,1.1-1,2.02-1.98,2.59L12,17.85l-1.62-0.92l6-3.36 c-0.01-0.02-0.7-0.41-1.04-0.6l-6.01,3.37L7.2,15.13c0,0,5.31-2.97,5.32-2.98c0.07-0.05,0.14-0.05,0.22-0.02 c0.52,0.17,1.03,0.16,1.53-0.06c0.77-0.33,1.22-0.9,1.32-1.72c0.06-0.47-0.05-0.91-0.29-1.32c-0.19-0.32-0.47-0.56-0.79-0.75 c-0.4-0.23-1.45-0.81-1.45-0.81l1.55-0.9C15.25,6.2,15.98,6,16.73,6c1.52,0,2.94,0.82,3.7,2.13C21,9.12,21.15,10.27,20.85,11.37z');
                                iconContainerIconPath.setAttribute('class', 'style-scope yt-icon');
                                iconContainerIconG.append(iconContainerIconPath);
                                iconContainerIcon.append(iconContainerIconG);
                                iconContainer.append(iconContainerIcon);

                                footerNode.append(iconContainer);
                                for (let i = 0, iSize = addedNode.data.footer.liveChatPaidMessageFooterRenderer.text.runs.length; i < iSize; i++) {
                                    const current = addedNode.data.footer.liveChatPaidMessageFooterRenderer.text.runs[i];
                                        if (current.hasOwnProperty('text')) {
                                        footerNode.append(document.createTextNode(current.text));
                                        }
                                        else if (current.hasOwnProperty('emoji')) {
                                        const img = document.createElement('img');
                                        img.setAttribute('src', current.emoji.image.thumbnails[0].url);
                                        img.setAttribute('alt', current.emoji.image.accessibility.accessibilityData.label);
                                        img.setAttribute('height', '24');
                                        img.setAttribute('width', '24');
                                        img.setAttribute('style', `
                                            margin: -1px 2px 1px;
                                            vertical-align: middle;
                                        `);
                                        footerNode.append(img);
                                        }
                                }
                                const messageNode = clonedNode.querySelector('.sll-message');
                                messageNode.append(footerNode);
                            }
                            
                            // ${(typeof addedNode.data.footer !== 'undefined')
                            // ? `<div style="border-top:1px solid rgba(0,0,0,0.12); margin-top:0.6rem; padding-top:0.6rem; font-size:1.2rem; line-height:1.6rem; display:flex; flex-direction:row"><div style="min-width:40px; margin-right:16px; display:flex; justify-content:center; align-items:center;"><yt-icon></yt-icon></div>${addedNode.data.footer.liveChatPaidMessageFooterRenderer.text.runs897h0honj}</div>`
                            // : 
                            // /* <div style="border-top:1px solid rgba(0,0,0,0.12); margin-top:0.6rem; padding-top:0.6rem; font-size:1.2rem; line-height:1.6rem; display:flex; flex-direction:row"><div style="min-width:40px; margin-right:16px; display:flex; justify-content:center; align-items:center;"><yt-icon><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"><path d="M21.29,7.63L21.29,7.63C20.32,5.94,18.55,5,16.73,5c-0.89,0-1.8,0.23-2.63,0.71L12,6.92L9.9,5.71C9.07,5.23,8.17,5,7.27,5 C5.45,5,3.68,5.94,2.71,7.63l0,0c-1.45,2.52-0.59,5.74,1.93,7.19L12,19l7.36-4.17C21.88,13.37,22.75,10.15,21.29,7.63z M3.57,8.13 C4.33,6.82,5.75,6,7.27,6C8.02,6,8.75,6.2,9.4,6.57c0,0,4.22,2.43,4.54,2.61c0.17,0.1,0.32,0.22,0.42,0.39 c0.29,0.46,0.19,1.18-0.43,1.49c-0.36,0.18-0.72,0.16-1.07-0.03c-0.35-0.19-4.62-2.58-4.62-2.58l-1.07,0.6l1.04,0.6L3.53,12.3 c0,0-0.3-0.6-0.38-0.93C2.85,10.27,3,9.12,3.57,8.13z M4.15,13.15c1.43-0.8,5.17-2.88,5.17-2.88l2.2,1.22l-5.39,3.03l-1-0.57 C4.76,13.74,4.44,13.46,4.15,13.15z M20.85,11.37c-0.29,1.1-1,2.02-1.98,2.59L12,17.85l-1.62-0.92l6-3.36 c-0.01-0.02-0.7-0.41-1.04-0.6l-6.01,3.37L7.2,15.13c0,0,5.31-2.97,5.32-2.98c0.07-0.05,0.14-0.05,0.22-0.02 c0.52,0.17,1.03,0.16,1.53-0.06c0.77-0.33,1.22-0.9,1.32-1.72c0.06-0.47-0.05-0.91-0.29-1.32c-0.19-0.32-0.47-0.56-0.79-0.75 c-0.4-0.23-1.45-0.81-1.45-0.81l1.55-0.9C15.25,6.2,15.98,6,16.73,6c1.52,0,2.94,0.82,3.7,2.13C21,9.12,21.15,10.27,20.85,11.37z" class="style-scope yt-icon"></path></g></svg><!--css-build:shady--></yt-icon></div>100% of this goes to a nonprofit that the creator selected.</div> */}

                            switch (headerBgColor) {
                                case superchatPaymentLevel.oneToTwoUSD.bgColor:
                                    pinAnimator.pushPin('darkblue', Date.now(), superchatPaymentLevel.oneToTwoUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.twoToFiveUSD.bgColor:
                                    pinAnimator.pushPin('lightblue', Date.now(), superchatPaymentLevel.twoToFiveUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.fiveToTenUSD.bgColor:
                                    pinAnimator.pushPin('green', Date.now(), superchatPaymentLevel.fiveToTenUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.tenToTwentyUSD.bgColor:
                                    pinAnimator.pushPin('yellow', Date.now(), superchatPaymentLevel.tenToTwentyUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.twentyToFiftyUSD.bgColor:
                                    pinAnimator.pushPin('orange', Date.now(), superchatPaymentLevel.twentyToFiftyUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.fiftyToHundredUSD.bgColor:
                                    pinAnimator.pushPin('magenta', Date.now(), superchatPaymentLevel.fiftyToHundredUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.hundredToHalfGrandUSD.bgColor:
                                    pinAnimator.pushPin('red', Date.now(), superchatPaymentLevel.hundredToHalfGrandUSD.expirationTime);
                                break;
                            }
                        }
                        else if (tagName === 'yt-live-chat-paid-sticker-renderer') {
                            const bgColor = toColor(addedNode.data.backgroundColor);
                            const fgColor = toColor(addedNode.data.moneyChipTextColor);
                            const authorColor = toColor(addedNode.data.authorNameTextColor);
                            const box = document.createElement('div');
                            box.setAttribute('style', `
                                        background-color: ${bgColor};
                                        ${addedNode.data.hasOwnProperty('headerOverlayImage')
                                            ? `background-image: url('${addedNode.data.headerOverlayImage.thumbnails[0].url}');
                                               background-position: right top;
                                               background-repeat: no-repeat;
                                               background-size: ${addedNode.data.headerOverlayImage.thumbnails[0].width}px ${addedNode.data.headerOverlayImage.thumbnails[0].height}px;`
                                            : ''}
                                        border-radius: 4px;
                                        box-sizing: content-box;
                                        display: flex;
                                        justify-content: space-between;
                                        padding: 8px 8px 8px 16px;
                                        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
                                        overflow: hidden;
                                        position: relative;
                            `);
                            const sideMenu = document.createElement('div');
                            sideMenu.setAttribute('style', `
                                            width: 24px;
                                            height: 100%;
                                            position: absolute;
                                            top: 0;
                                            right: 0;
                                            background: linear-gradient(
                                                to right,
                                                transparent,
                                                ${bgColor} 100%
                                            );
                                            border-top-right-radius: 4px;
                                            border-bottom-right-radius: 4px;
                            `);
                            sideMenu.setAttribute('class', 'sll-side-menu');
                            const doppelgangerButton = document.createElement('div');
                            doppelgangerButton.setAttribute('style', `
                                cursor:pointer;
                                margin-top:1px;
                            `);
                            doppelgangerButton.setAttribute('class', 'sll-doppelganger-button');
                            const doppelgangerButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            doppelgangerButtonIcon.style.cursor = 'pointer';
                            doppelgangerButtonIcon.setAttribute('viewBox', '0 0 24 24');
                            doppelgangerButtonIcon.setAttribute('version', '1.1');
                            doppelgangerButtonIcon.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                            doppelgangerButtonIcon.setAttribute('focusable', 'false');
                            doppelgangerButtonIcon.setAttribute('style', `
                                                    pointer-events: none;
                                                    display: block;
                                                    width: 100%;
                                                    height: 100%;
                                                    color: ${fgColor};
                                                    fill: ${fgColor};
                            `);
                            doppelgangerButtonIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                            doppelgangerButtonIcon.setAttribute('xmls:svg', 'http://www.w3.org/2000/svg');
                            // <g class="style-scope yt-icon">
                            //     <path d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z" class="style-scope yt-icon"></path>
                            // </g>
                            const doppelgangerButtonIconG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                            doppelgangerButtonIconG.setAttribute('class', 'style-scope yt-icon');
                            const doppelgangerButtonIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            doppelgangerButtonIconPath.setAttribute('d', 'M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z');
                            doppelgangerButtonIconPath.setAttribute('class', 'style-scope yt-icon');
                            doppelgangerButtonIconG.append(doppelgangerButtonIconPath);
                            doppelgangerButtonIcon.append(doppelgangerButtonIconG);
                            doppelgangerButton.append(doppelgangerButtonIcon);
                            sideMenu.append(doppelgangerButton);
                            box.append(sideMenu);
                            const div = document.createElement('div');
                            div.setAttribute('style', `
                                display:flex;
                                justify-content:space-between;
                            `);
                            const divImg = document.createElement('img');
                            divImg.setAttribute('style', `
                                                width: 40px;
                                                height: 40px;
                                                border-radius: 20px;
                                                margin-right: 16px;
                            `);
                            divImg.setAttribute('class', 'sll-user-icon');
                            divImg.setAttribute('src', addedNode.data.authorPhoto.thumbnails[addedNode.data.authorPhoto.thumbnails.length - 1].url);
                            div.append(divImg);
                            const divDiv = document.createElement('div');
                            const divDivDiv = document.createElement('div');
                            divDivDiv.setAttribute('style', `
                                color:${authorColor};
                                margin-right:8px;
                                -webkit-line-clamp:1;
                                overflow:hidden;
                                -webkit-box-orient:vertical;
                                text-overflow:ellipsis;
                                white-space:normal;
                                display:-webkit-box;
                            `);
                            divDivDiv.setAttribute('class', 'sll-user-name');
                            divDivDiv.textContent = addedNode.data.authorName.simpleText;
                            const divDivSpan = document.createElement('span');
                            divDivSpan.setAttribute('style', `
                                color:${fgColor};
                                font-size:15px;
                                padding-right:8px;
                                line-height:12px
                            `);
                            divDivSpan.setAttribute('class', 'sll-price');
                            divDivSpan.textContent = addedNode.data.purchaseAmountText.simpleText;
                            divDiv.append(divDivDiv);
                            divDiv.append(divDivSpan);
                            div.append(divDiv);
                            box.append(div);
                            const secondDiv = document.createElement('div');
                            const secondDivImg = document.createElement('img');
                            secondDivImg.setAttribute('src', addedNode.data.sticker.thumbnails[0].url);
                            secondDivImg.setAttribute('alt', addedNode.data.sticker.accessibility.accessibilityData.label);
                            secondDivImg.setAttribute('height', `${addedNode.data.stickerDisplayWidth}`);
                            secondDivImg.setAttribute('height', `${addedNode.data.stickerDisplayHeight}`);
                            secondDivImg.setAttribute('class', 'sll-sticker');
                            secondDivImg.setAttribute('style', `
                                vertical-align:middle;
                            `);
                            secondDiv.append(secondDivImg);
                            box.append(secondDiv);
                            clonedNode.append(box);

                            switch (bgColor) {
                                case superchatPaymentLevel.oneToTwoUSD.bgColor:
                                    pinAnimator.pushPin('darkblue', Date.now(), superchatPaymentLevel.oneToTwoUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.twoToFiveUSD.bgColor:
                                    pinAnimator.pushPin('lightblue', Date.now(), superchatPaymentLevel.twoToFiveUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.fiveToTenUSD.bgColor:
                                    pinAnimator.pushPin('green', Date.now(), superchatPaymentLevel.fiveToTenUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.tenToTwentyUSD.bgColor:
                                    pinAnimator.pushPin('yellow', Date.now(), superchatPaymentLevel.tenToTwentyUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.twentyToFiftyUSD.bgColor:
                                    pinAnimator.pushPin('orange', Date.now(), superchatPaymentLevel.twentyToFiftyUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.fiftyToHundredUSD.bgColor:
                                    pinAnimator.pushPin('magenta', Date.now(), superchatPaymentLevel.fiftyToHundredUSD.expirationTime);
                                break;
                                case superchatPaymentLevel.hundredToHalfGrandUSD.bgColor:
                                    pinAnimator.pushPin('red', Date.now(), superchatPaymentLevel.hundredToHalfGrandUSD.expirationTime);
                                break;
                            }
                        }
                        else if (tagName === 'yt-live-chat-membership-item-renderer') {
                            clonedNode.classList.add('membership-item');
                            const bodyBgColor = '#0f9d58';
                            const bodyFgColor = '#fff';
                            const headerBgColor = '#0a8043';
                            const headerFgColor = '#fff';
                            const authorColor = '#fff';
                            const divSuperchat = document.createElement('div');
                            divSuperchat.setAttribute('style', `
                                        border-radius: 4px;
                                box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                                            0 1px 5px 0 rgba(0, 0, 0, 0.12),
                                            0 3px 1px -2px rgba(0, 0, 0, 0.2);
                                        overflow: hidden;
                            `);
                            clonedNode.append(divSuperchat);

                            const divHeader = document.createElement('div');
                            divHeader.setAttribute('style', `
                                            background-color: ${addedNode.data.hasOwnProperty('message') ? headerBgColor : bodyBgColor};
                                            ${addedNode.data.hasOwnProperty('headerOverlayImage')
                                                ? `background-image: url('${addedNode.data.headerOverlayImage.thumbnails[0].url}');
                                                   background-position: right top;
                                                   background-repeat: no-repeat;
                                                   background-size: ${addedNode.data.headerOverlayImage.thumbnails[0].width}px ${addedNode.data.headerOverlayImage.thumbnails[0].height}px;`
                                                : ''}
                                            color: ${addedNode.data.hasOwnProperty('message') ? headerFgColor : bodyFgColor};
                                            box-sizing: content-box;
                                            display: flex;
                                            justify-content: space-between;
                                            padding: 8px 8px 8px 16px;
                                            position: relative;
                                            border-top-left-radius:4px;
                                            border-top-right-radius:4px;
                                            ${addedNode.data.hasOwnProperty('message') ? '' : `
                                                border-bottom-left-radius:4px;
                                                border-bottom-right-radius:4px;
                                            `}
                            `);
                            divSuperchat.append(divHeader);

                            const imgUserIcon = document.createElement('img');
                            imgUserIcon.setAttribute('style', `
                                                width: 40px;
                                                height: 40px;
                                                border-radius: 20px;
                                                margin-right: 16px;
                            `);
                            imgUserIcon.setAttribute('class', 'sll-user-icon');
                            imgUserIcon.setAttribute('src', addedNode.data.authorPhoto.thumbnails[addedNode.data.authorPhoto.thumbnails.length - 1].url);
                            divHeader.append(imgUserIcon);

                            const divLabelContainer = document.createElement('div');
                            divLabelContainer.setAttribute('style', `
                                display:flex;
                                justify-content:space-between;
                                margin-right:auto;
                            `);
                            const divLabelContainerDiv = document.createElement('div');
                            const divUserName = document.createElement('div');
                            divUserName.setAttribute('style', `
                                                        color:${authorColor};
                                                        font-size:${addedNode.data.hasOwnProperty('headerPrimaryText') ? '12px' : '14px'};
                                                        margin-right:8px;
                                                        margin-bottom:1px;
                                                        display:flex;
                            `);
                            divUserName.setAttribute('class', 'sll-user-name');
                            const spanName = document.createElement('span');
                            spanName.setAttribute('style', `
                                                            -webkit-line-clamp:1;
                                                            overflow:hidden;
                                                            -webkit-box-orient:vertical;
                                                            text-overflow:ellipsis;
                                                            white-space:normal;
                                                            display:-webkit-box;
                            `);
                            spanName.textContent = addedNode.data.authorName.simpleText;
                            divUserName.append(spanName);
                            for (let i = 0, iSize = addedNode.data.authorBadges.length; i < iSize; i++) {
                                const current = addedNode.data.authorBadges[i];
                                const img = document.createElement('img');
                                img.setAttribute('style', `
                                                                    vertical-align:sub;
                                                                    margin-left:2px;
                                `);
                                img.setAttribute('height', '16');
                                img.setAttribute('width', '16');
                                img.setAttribute('alt', current.liveChatAuthorBadgeRenderer.accessibility.accessibilityData.label);
                                img.setAttribute('src', current.liveChatAuthorBadgeRenderer.customThumbnail.thumbnails[0].url);
                                divUserName.append(img);
                            }
                            divLabelContainerDiv.append(divUserName);
                            if (addedNode.data.hasOwnProperty('headerPrimaryText')) {
                                const spanPrimaryText = document.createElement('span');
                                spanPrimaryText.setAttribute('style', `
                                    font-size:14px;
                                    padding-right:8px;
                                    color:white;
                                    word-break: break-word;
                                    font-weight: 500;
                                `);
                                spanPrimaryText.setAttribute('class', 'sll-primary-text');
                                for (let i = 0, iSize = addedNode.data.headerPrimaryText.runs.length; i < iSize; i++) {
                                    const current = addedNode.data.headerPrimaryText.runs[i];
                                    if (current.hasOwnProperty('text')) {
                                        spanPrimaryText.append(document.createTextNode(current.text));
                                    }
                                    else if (current.hasOwnProperty('emoji')) {
                                        const img = document.createElement('img');
                                        img.setAttribute('src', current.emoji.image.thumbnails[0].url);
                                        img.setAttribute('alt', current.emoji.image.accessibility.accessibilityData.label);
                                        img.setAttribute('height', '24');
                                        img.setAttribute('width', '24');
                                        img.setAttribute('style', `
                                            margin: -1px 2px 1px;
                                            vertical-align: middle;
                                        `);
                                        spanPrimaryText.append(img);
                                    }
                                }
                                divLabelContainerDiv.append(spanPrimaryText);
                            }
                            const divSubText = document.createElement('div');
                            divSubText.setAttribute('style', `
                                                        margin-top:2px;
                                                        font-size:${addedNode.data.hasOwnProperty('headerPrimaryText') ? '12px' : '15px'};
                                                        color:rgba(255,255,255,0.7);
                            `);
                            divSubText.setAttribute('class', 'sll-sub-text');
                            if (addedNode.data.headerSubtext.hasOwnProperty('simpleText')) {
                                divSubText.append(document.createTextNode(addedNode.data.headerSubtext.simpleText));
                            }
                            else {
                                for (let i = 0, iSize = addedNode.data.headerSubtext.runs.length; i < iSize; i++) {
                                    const current = addedNode.data.headerSubtext.runs[i];
                                                        if (current.hasOwnProperty('text')) {
                                        divSubText.append(document.createTextNode(current.text));
                                                        }
                                                        else if (current.hasOwnProperty('emoji')) {
                                        const img = document.createElement('img');
                                        img.setAttribute('src', current.emoji.image.thumbnails[0].url);
                                        img.setAttribute('alt', current.emoji.image.accessibility.accessibilityData.label);
                                        img.setAttribute('height', '24');
                                        img.setAttribute('width', '24');
                                        img.setAttribute('style', `
                                            margin: -1px 2px 1px;
                                            vertical-align: middle;
                                        `);
                                        divSubText.append(img);
                                                        }
                                }
                            }
                            divLabelContainerDiv.append(divSubText);
                            divLabelContainer.append(divLabelContainerDiv);
                            divHeader.append(divLabelContainer);
                            const divSideMenu = document.createElement('div');
                            divSideMenu.setAttribute('style', `
                                                width: 24px;
                                                height: 100%;
                                                position: absolute;
                                                top: 0;
                                                right: 0;
                                                border-top-right-radius: 4px;
                                                border-bottom-right-radius: 4px;
                            `);
                            divSideMenu.setAttribute('class', 'sll-side-menu');
                            const divDoppelgangerButton = document.createElement('div');
                            divDoppelgangerButton.setAttribute('style', `
                                cursor:pointer;
                                margin-top:1px;
                            `);
                            divDoppelgangerButton.setAttribute('class', 'sll-doppelganger-button');
                            const divDoppelgangerButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            divDoppelgangerButtonIcon.style.cursor = 'pointer';
                            divDoppelgangerButtonIcon.setAttribute('viewBox', '0 0 24 24');
                            divDoppelgangerButtonIcon.setAttribute('version', '1.1');
                            divDoppelgangerButtonIcon.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                            divDoppelgangerButtonIcon.setAttribute('focusable', 'false');
                            divDoppelgangerButtonIcon.setAttribute('style', `
                                                        pointer-events: none;
                                                        display: block;
                                                        width: 100%;
                                                        height: 100%;
                                color: ${bodyFgColor};
                                fill: ${bodyFgColor};
                            `);
                            divDoppelgangerButtonIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                            divDoppelgangerButtonIcon.setAttribute('xmls:svg', 'http://www.w3.org/2000/svg');
                            // <g class="style-scope yt-icon">
                            //     <path d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z" class="style-scope yt-icon"></path>
                            // </g>
                            const divDoppelgangerButtonIconG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                            divDoppelgangerButtonIconG.setAttribute('class', 'style-scope yt-icon');
                            const divDoppelgangerButtonIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            divDoppelgangerButtonIconPath.setAttribute('d', 'M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z');
                            divDoppelgangerButtonIconPath.setAttribute('class', 'style-scope yt-icon');
                            divDoppelgangerButtonIconG.append(divDoppelgangerButtonIconPath);
                            divDoppelgangerButtonIcon.append(divDoppelgangerButtonIconG);
                            divDoppelgangerButton.append(divDoppelgangerButtonIcon);
                            divSideMenu.append(divDoppelgangerButton);
                            divHeader.append(divSideMenu);

                            if (addedNode.data.hasOwnProperty('message')) {
                                const divMessage = document.createElement('div');
                                divMessage.setAttribute('style', `
                                    padding:8px 16px;
                                    color:${bodyFgColor};
                                    background-color:${bodyBgColor};
                                    word-wrap: break-word;
                                    font-size: 15px;
                                    font-weight: normal;
                                    line-height: 20px;
                                    border-bottom-left-radius:4px;
                                    border-bottom-right-radius:4px;
                                `);
                                divMessage.setAttribute('class', 'sll-message');
                                for (let i = 0, iSize = addedNode.data.message.runs.length; i < iSize; i++) {
                                    const current = addedNode.data.message.runs[i];
                                    if (current.hasOwnProperty('text')) {
                                        divMessage.append(document.createTextNode(current.text));
                                    }
                                    else if (current.hasOwnProperty('emoji')) {
                                        const img = document.createElement('img');
                                        img.setAttribute('src', current.emoji.image.thumbnails[0].url);
                                        img.setAttribute('alt', current.emoji.image.accessibility.accessibilityData.label);
                                        img.setAttribute('height', '24');
                                        img.setAttribute('width', '24');
                                        img.setAttribute('style', `
                                            margin: -1px 2px 1px;
                                            vertical-align: middle;
                                        `);
                                        divMessage.append(img);
                                    }
                                }
                                divSuperchat.append(divMessage);
                            }

                            pinAnimator.pushPin('member', Date.now(), superchatPaymentLevel.member.expirationTime);
                        }
                        else if (tagName === 'ytd-sponsorships-live-chat-gift-purchase-announcement-renderer') {
                            const bgColor = 'rgb(15, 157, 88)';
                            const fgColor = 'rgb(255, 255, 255)';
                            const authorColor = 'rgba(255, 255, 255, 0.7)';
                            const divSuperchat = document.createElement('div');
                            divSuperchat.setAttribute('style', `
                                        border-radius: 4px;
                                        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                                                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                                                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
                                        overflow: hidden;
                            `);
                            clonedNode.append(divSuperchat);

                            const divHeader = document.createElement('div');
                            divHeader.setAttribute('style', `
                                            background-color: ${bgColor};
                                            ${addedNode.data.hasOwnProperty('headerOverlayImage')
                                                ? `background-image: url('${addedNode.data.headerOverlayImage.thumbnails[0].url}');
                                                   background-position: right top;
                                                   background-repeat: no-repeat;
                                                   background-size: ${addedNode.data.headerOverlayImage.thumbnails[0].width}px ${addedNode.data.headerOverlayImage.thumbnails[0].height}px;`
                                                : ''}
                                            box-sizing: content-box;
                                            display: flex;
                                            justify-content: space-between;
                                            padding-left: 16px;
                                            position: relative;
                                            border-radius:4px;
                            `);
                            divSuperchat.append(divHeader);

                            const imgUserIcon = document.createElement('img');
                            imgUserIcon.setAttribute('style', `
                                                width: 40px;
                                                height: 40px;
                                                border-radius: 20px;
                                                margin-right: 8px;
                                                margin-top:8px;
                            `);
                            imgUserIcon.setAttribute('class', 'sll-user-icon');
                            imgUserIcon.setAttribute('src', addedNode.data.header.liveChatSponsorshipsHeaderRenderer.authorPhoto.thumbnails[addedNode.data.header.liveChatSponsorshipsHeaderRenderer.authorPhoto.thumbnails.length - 1].url);
                            divHeader.append(imgUserIcon);

                            const divLabelContainer = document.createElement('div');
                            divLabelContainer.setAttribute('style', `
                                display:flex;
                                justify-content:space-between;
                                margin-right:auto;
                                margin-top:8px;
                            `);
                            divHeader.append(divLabelContainer);

                            const divLabelContainerDiv = document.createElement('div');
                            divLabelContainer.append(divLabelContainerDiv);

                            const divUserName = document.createElement('div');
                            divUserName.setAttribute('style', `
                                                        color:${fgColor};
                                                        font-size:12px;
                                                        margin-right:8px;
                                                        margin-bottom:1px;
                                                        display:flex;
                            `);
                            divUserName.setAttribute('class', 'sll-user-name');
                            divLabelContainerDiv.append(divUserName);

                            const spanLabel = document.createElement('span');
                            spanLabel.setAttribute('style', `
                                                            color: ${authorColor};
                                                            font-size:14px;
                                                            font-weight: 500;
                                                            line-height:20px;
                                                            -webkit-line-clamp:1;
                                                            overflow:hidden;
                                                            -webkit-box-orient:vertical;
                                                            text-overflow:ellipsis;
                                                            white-space:normal;
                                                            display:-webkit-box;
                            `);
                            spanLabel.textContent = addedNode.data.header.liveChatSponsorshipsHeaderRenderer.authorName.simpleText;
                            divUserName.append(spanLabel);

                            for (let i = 0, iSize = addedNode.data.header.liveChatSponsorshipsHeaderRenderer.authorBadges.length; i < iSize; i++) {
                                const current = addedNode.data.header.liveChatSponsorshipsHeaderRenderer.authorBadges[i];
                                const img = document.createElement('img');
                                img.setAttribute('style', `
                                                                    vertical-align:sub;
                                                                    margin-left:2px;
                                `);
                                img.setAttribute('height', '16');
                                img.setAttribute('width', '16');
                                img.setAttribute('alt', current.liveChatAuthorBadgeRenderer.accessibility.accessibilityData.label);
                                img.setAttribute('src', current.liveChatAuthorBadgeRenderer.customThumbnail.thumbnails[0].url);
                                divUserName.append(img);
                            }

                            const divMessage = document.createElement('div');
                            divMessage.setAttribute('style', `
                                                        margin-top:2px;
                                                        font-weight: 400;
                                                        overflow: hidden;
                                                        display: block;
                                                        -webkit-line-clamp: 4;
                                                        display: box;
                                                        display: -webkit-box;
                                                        -webkit-box-orient: vertical;
                                                        text-overflow: ellipsis;
                                                        white-space: normal;
                                                        font-size: 14px;
                                                        line-height: 1.8rem;
                                                        word-wrap: break-word;
                                                        word-break: break-word;
                                                        color: white;
                            `);
                            for (let i = 0, iSize = addedNode.data.header.liveChatSponsorshipsHeaderRenderer.primaryText.runs.length; i < iSize; i++) {
                                const current = addedNode.data.header.liveChatSponsorshipsHeaderRenderer.primaryText.runs[i];
                                                        if (current.hasOwnProperty('text')) {
                                    divMessage.append(document.createTextNode(current.text));
                                                        }
                                                        else if (current.hasOwnProperty('emoji')) {
                                    const img = document.createElement('img');
                                    img.setAttribute('src', current.emoji.image.thumbnails[0].url);
                                    img.setAttribute('alt', current.emoji.image.accessibility.accessibilityData.label);
                                    img.setAttribute('height', '24');
                                    img.setAttribute('width', '24');
                                    img.setAttribute('style', `
                                        margin: -1px 2px 1px;
                                        vertical-align: middle;
                                    `);
                                    divMessage.append(img);
                                                        }
                            }
                            divLabelContainerDiv.append(divMessage);

                            const divGiftIcon = document.createElement('div');
                            divHeader.append(divGiftIcon);

                            const imgGiftIcon = document.createElement('img');
                            imgGiftIcon.setAttribute('style', `
                                vertical-align: middle;
                            `);
                            imgGiftIcon.setAttribute('src', addedNode.data.header.liveChatSponsorshipsHeaderRenderer.image.thumbnails[0].url);
                            imgGiftIcon.setAttribute('alt', '');
                            imgGiftIcon.setAttribute('width', '104');
                            imgGiftIcon.setAttribute('height', '104');
                            divGiftIcon.append(imgGiftIcon);

                            const divSideMenu = document.createElement('div');
                            divSideMenu.setAttribute('style', `
                                                width: 52px;
                                                height: 100%;
                                                position: absolute;
                                                top: 0;
                                                right: 0;
                                                border-top-right-radius: 4px;
                                                border-bottom-right-radius: 4px;
                                                background: linear-gradient(to right,transparent,${bgColor} 100%);
                            `);
                            divSideMenu.setAttribute('class', 'sll-side-menu');
                            divHeader.append(divSideMenu);

                            const divDoppelgangerButton = document.createElement('div');
                            divDoppelgangerButton.setAttribute('style', `
                                                    cursor: pointer;
                                                    width: 24px;
                                                    margin:8px 8px 0 auto;
                            `);
                            divDoppelgangerButton.setAttribute('class', 'sll-doppelganger-button');
                            divSideMenu.append(divDoppelgangerButton);

                            const divDoppelgangerButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            divDoppelgangerButtonIcon.style.cursor = 'pointer';
                            divDoppelgangerButtonIcon.setAttribute('viewBox', '0 0 24 24');
                            divDoppelgangerButtonIcon.setAttribute('version', '1.1');
                            divDoppelgangerButtonIcon.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                            divDoppelgangerButtonIcon.setAttribute('focusable', 'false');
                            divDoppelgangerButtonIcon.setAttribute('style', `
                                                        pointer-events: none;
                                                        display: block;
                                                        width: 100%;
                                                        height: 100%;
                                color: ${fgColor};
                                fill: ${fgColor};
                            `);
                            divDoppelgangerButtonIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                            divDoppelgangerButtonIcon.setAttribute('xmls:svg', 'http://www.w3.org/2000/svg');
                            const divDoppelgangerButtonIconG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                            divDoppelgangerButtonIconG.setAttribute('class', 'style-scope yt-icon');
                            const divDoppelgangerButtonIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            divDoppelgangerButtonIconPath.setAttribute('d', 'M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z');
                            divDoppelgangerButtonIconPath.setAttribute('class', 'style-scope yt-icon');
                            divDoppelgangerButtonIconG.append(divDoppelgangerButtonIconPath);
                            divDoppelgangerButtonIcon.append(divDoppelgangerButtonIconG);
                            divDoppelgangerButton.append(divDoppelgangerButtonIcon);

                            pinAnimator.pushPin('member', Date.now(), superchatPaymentLevel.member.expirationTime);
                        }
                        else if (tagName === 'yt-live-chat-donation-announcement-renderer') {
                            // const nodeStyle = getComputedStyle(addedNode);
                            const lightDarkModeColor = getComputedStyle(document.querySelector('ytd-app')).getPropertyValue('background-color').replace(/\s/g, '');
                            const divSuperchat = document.createElement('div');
                            divSuperchat.setAttribute('style', `
                                        font-weight: 400;
                                        border-radius: 4px;
                                        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
                                        overflow: hidden;
                            `);
                            clonedNode.append(divSuperchat);

                            const divHeader = document.createElement('div');
                            divHeader.setAttribute('style', `
                                            background-color: ${superchatPaymentLevel.donation.bgColor};
                                            ${addedNode.data.hasOwnProperty('headerOverlayImage')
                                                ? `background-image: url('${addedNode.data.headerOverlayImage.thumbnails[0].url}');
                                                   background-position: right top;
                                                   background-repeat: no-repeat;
                                                   background-size: ${addedNode.data.headerOverlayImage.thumbnails[0].width}px ${addedNode.data.headerOverlayImage.thumbnails[0].height}px;`
                                                : ''}
                                            box-sizing: content-box;
                                            display: flex;
                                            padding: 12px 16px;
                                            position: relative;
                                            border-radius:4px;
                            `);
                            divSuperchat.append(divHeader);

                            const imgUserIcon = document.createElement('img');
                            imgUserIcon.setAttribute('style', `
                                                width: 40px;
                                                height: 40px;
                                                border-radius: 20px;
                                                margin-right: 16px;
                            `);
                            imgUserIcon.setAttribute('class', 'sll-user-icon');
                            imgUserIcon.setAttribute('src', addedNode.data.authorPhoto.thumbnails[addedNode.data.authorPhoto.thumbnails.length - 1].url);
                            divHeader.append(imgUserIcon);

                            const divContainer = document.createElement('div');
                            divHeader.append(divContainer);

                            const divLabelContainer = document.createElement('div');
                            divLabelContainer.setAttribute('style', `
                                                    font-size: 14px;
                                                    margin-bottom: 4px;
                            `);
                            if (addedNode.data.text.hasOwnProperty('simpleText')) {
                                divLabelContainer.append(document.createTextNode(addedNode.data.text.simpleText));
                            }
                            else {
                                const spanUserName = document.createElement('span');
                                spanUserName.setAttribute('class', 'sll-user-name');
                                const spanPrice = document.createElement('span');
                                spanPrice.setAttribute('class', 'sll-price');
                                for (let i = 0, iSize = addedNode.data.text.runs.length; i < iSize; i++) {
                                    const current = addedNode.data.text.runs[i];
                                                    if (current.hasOwnProperty('text')) {
                                        if (iSize === 1) {
                                            spanUserName.textContent = current.text;
                                                        }
                                                        else {
                                            if (i === iSize - 1) {
                                                spanPrice.append(document.createTextNode(current.text));
                                                            }
                                            else {
                                                spanUserName.append(document.createTextNode(current.text));
                                                            }
                                                            }
                                                            }
                                    else if (current.hasOwnProperty('emoji')) {
                                        const img = document.createElement('img');
                                        img.setAttribute('src', current.emoji.image.thumbnails[0].url);
                                        img.setAttribute('alt', current.emoji.image.accessibility.accessibilityData.label);
                                        img.setAttribute('height', '24');
                                        img.setAttribute('width', '24');
                                        img.setAttribute('style', `
                                            margin: -1px 2px 1px;
                                            vertical-align: middle;
                                        `);
                                        spanUserName.append(img);
                                                        }
                                                    }
                                divLabelContainer.append(spanUserName);
                                divLabelContainer.append(spanPrice);
                                                    }
                            divContainer.append(divLabelContainer);
                            const divSubText = document.createElement('div');
                            divSubText.setAttribute('style', `
                                                    font-size: 12px;
                            `);
                            divContainer.append(divSubText);
                            if (addedNode.data.subtext.hasOwnProperty('simpleText')) {
                                divSubText.textContent = addedNode.data.subtext.simpleText;
                            }
                            else {
                                for (let i = 0, iSize = addedNode.data.subtext.runs.length; i < iSize; i++) {
                                    const current = addedNode.data.subtext.runs[i];
                                                    if (current.hasOwnProperty('text')) {
                                        divSubText.append(document.createTextNode(current.text));
                                                    }
                                                    else if (current.hasOwnProperty('emoji')) {
                                        const img = document.createElement('img');
                                        img.setAttribute('src', current.emoji.image.thumbnails[0].url);
                                        img.setAttribute('alt', current.emoji.image.accessibility.accessibilityData.label);
                                        img.setAttribute('height', '24');
                                        img.setAttribute('width', '24');
                                        img.setAttribute('style', `
                                            margin: -1px 2px 1px;
                                            vertical-align: middle;
                                        `);
                                        divSubText.append(img);
                                                    }
                                }
                            }

                            if (addedNode.data.hasOwnProperty('authorName')) {
                                const divSideMenu = document.createElement('div');
                                divSideMenu.setAttribute('style', `
                                                        width: 52px;
                                                        height: 100%;
                                                        position: absolute;
                                                        top: 0;
                                                        right: 0;
                                                        border-top-right-radius: 4px;
                                                        border-bottom-right-radius: 4px;
                                `);
                                divSideMenu.setAttribute('class', 'sll-side-menu');
                                divHeader.append(divSideMenu);

                                const divDoppelgangerButton = document.createElement('div');
                                divDoppelgangerButton.setAttribute('style', `
                                                            cursor: pointer;
                                                            width: 24px;
                                                            margin:8px 8px 0 auto;
                                `);
                                divDoppelgangerButton.setAttribute('class', 'sll-doppelganger-button');
                                divSideMenu.append(divDoppelgangerButton);

                                const divDoppelgangerButtonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                divDoppelgangerButtonIcon.style.cursor = 'pointer';
                                divDoppelgangerButtonIcon.setAttribute('viewBox', '0 0 24 24');
                                divDoppelgangerButtonIcon.setAttribute('version', '1.1');
                                divDoppelgangerButtonIcon.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                                divDoppelgangerButtonIcon.setAttribute('focusable', 'false');
                                divDoppelgangerButtonIcon.setAttribute('style', `
                                                                pointer-events: none;
                                                                display: block;
                                                                width: 100%;
                                                                height: 100%;
                                    color: ${lightDarkModeColor};
                                    fill: ${lightDarkModeColor};
                                `);
                                divDoppelgangerButtonIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                                divDoppelgangerButtonIcon.setAttribute('xmls:svg', 'http://www.w3.org/2000/svg');
                                const divDoppelgangerButtonIconG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                                divDoppelgangerButtonIconG.setAttribute('class', 'style-scope yt-icon');
                                const divDoppelgangerButtonIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                                divDoppelgangerButtonIconPath.setAttribute('d', 'M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z');
                                divDoppelgangerButtonIconPath.setAttribute('class', 'style-scope yt-icon');
                                divDoppelgangerButtonIconG.append(divDoppelgangerButtonIconPath);
                                divDoppelgangerButtonIcon.append(divDoppelgangerButtonIconG);
                                divDoppelgangerButton.append(divDoppelgangerButtonIcon);
                                        }
                            pinAnimator.pushPin('donation', Date.now(), superchatPaymentLevel.donation.expirationTime);
                        }

                        const button = clonedNode.querySelector('.sll-doppelganger-button');
                        if (button !== null) {
                            button.addEventListener('click', proxyFunc);
                        }
                        liveLogBox.append(clonedNode);
                        currentSuperchats.push(clonedNode);
                        superchatLinkedNodes[addedNode.data.id] = { addedNode, clonedNode, button, proxyFunc };
                        deletedChatObserver.observe(addedNode, {attributeFilter: ['is-deleted']});
                        // liveLogBox.append(addedNode);
                        // currentSuperchats.push(addedNode);
                    }

                    if (waitingModeOn) {
                        showWaitingNotification();
                    }
                    updateItemNumberDisplay();
                    updateButtons();
                }
    
                for (let i = 0, iSize = mutationList.length; i < iSize; i++) {
                    const mutation = mutationList[i];
                    for (let j = 0, jSize = mutation.addedNodes.length; j < jSize; j++) {
                        const addedNode = mutation.addedNodes[j];
                        const tagName = addedNode.tagName.toLowerCase();

                        if (tagName === 'yt-live-chat-paid-message-renderer'
                            || tagName === 'yt-live-chat-paid-sticker-renderer'
                            || tagName === 'yt-live-chat-membership-item-renderer'
                            || tagName === 'ytd-sponsorships-live-chat-gift-purchase-announcement-renderer'
                            || tagName === 'yt-live-chat-donation-announcement-renderer')
                        {
                            copySuperchatToLiveLog(addedNode, tagName);
                        }
                    }
                    for (let k = 0, kSize = mutation.removedNodes.length; k < kSize; k++) {
                        const removedNode = mutation.removedNodes[k];
                        if (superchatLinkedNodes.hasOwnProperty(removedNode.data.id)) {
                            // currentSuperchats.splice(currentSuperchats.indexOf(removedNode), 1);
                            const threeDotButton = superchatLinkedNodes[removedNode.data.id].button;
                            if (threeDotButton) {
                                threeDotButton.querySelector('svg').style.fill = '#888';
                                threeDotButton.title = 'this superchat is no longer in the live chat roll and cannot be acted upon';
                                threeDotButton.style.cursor = 'not-allowed';
                                threeDotButton.removeEventListener('click', superchatLinkedNodes[removedNode.data.id].proxyFunc);
                            }
                            // delete superchatLinkedNodes[removedNode];
                        }
                    }
                }
            });
            superchatLiveLogsObserver.observe(chatItems, {childList: true});
            
            document.addEventListener('sllSettingsLoaded', function(settings) {
                // console.log('sllSettingsLoaded Listened', settings)
                extensionSettings = settings.detail;

                if (typeof extensionSettings.saveSettingsCheckbox !== 'undefined' && saveSettingsCheckbox) {
                    saveSettingsCheckbox.checked = extensionSettings.saveSettingsCheckbox;
                }
                if (typeof extensionSettings.showSuperchatConfiguration !== 'undefined' && superchatConfigurationFieldSet) {
                    if (extensionSettings.showSuperchatConfiguration) {
                        superchatConfigurationFieldSet.style.height = 'auto';
                        superchatConfigurationFieldSet.style.overflow = 'visible';
                        superchatConfigurationLegend.style.backgroundColor = 'inherit';
                        superchatConfigurationLegend.style.color = 'inherit';
                        superchatConfigurationLegend.textContent = 'superchat configuration [ – ]';
                    }
                    else {
                        superchatConfigurationFieldSet.style.height = '0';
                        superchatConfigurationFieldSet.style.overflow = 'hidden';
                        superchatConfigurationLegend.style.backgroundColor = '#606060';
                        superchatConfigurationLegend.style.color = '#fff';
                        superchatConfigurationLegend.textContent = 'superchat configuration [ + ]';
                    }
                }
                if (typeof extensionSettings.showFilterSelection !== 'undefined' && filtersFieldSet) {
                    if (extensionSettings.showFilterSelection) {
                        filtersFieldSet.style.height = 'auto';
                        filtersFieldSet.style.overflow = 'visible';
                        filtersLegend.style.backgroundColor = 'inherit';
                        filtersLegend.style.color = 'inherit';
                        filtersLegend.textContent = 'filter selection [ – ]';
                    }
                    else {
                        filtersFieldSet.style.height = '0';
                        filtersFieldSet.style.overflow = 'hidden';
                        filtersLegend.style.backgroundColor = '#606060';
                        filtersLegend.style.color = '#fff';
                        filtersLegend.textContent = 'filter selection [ + ]';
                    }
                }
                if (typeof extensionSettings.showGeneralSettings !== 'undefined' && generalSettingsFieldSet) {
                    if (extensionSettings.showGeneralSettings) {
                        generalSettingsFieldSet.style.height = 'auto';
                        generalSettingsFieldSet.style.overflow = 'visible';
                        generalSettingsLegend.style.backgroundColor = 'inherit';
                        generalSettingsLegend.style.color = 'inherit';
                        generalSettingsLegend.textContent = 'general settings [ – ]';
                    }
                    else {
                        generalSettingsFieldSet.style.height = '0';
                        generalSettingsFieldSet.style.overflow = 'hidden';
                        generalSettingsLegend.style.backgroundColor = '#606060';
                        generalSettingsLegend.style.color = '#fff';
                        generalSettingsLegend.textContent = 'general settings [ + ]';
                    }
                }
                if (typeof extensionSettings.showCredits !== 'undefined' && creditsFieldSet) {
                    if (extensionSettings.showCredits) {
                        creditsFieldSet.style.height = 'auto';
                        creditsFieldSet.style.overflow = 'visible';
                        creditsLegend.style.backgroundColor = 'inherit';
                        creditsLegend.style.color = 'inherit';
                        creditsLegend.textContent = 'credits (ver. 1.4.8) [ – ]';
                    }
                    else {
                        creditsFieldSet.style.height = '0';
                        creditsFieldSet.style.overflow = 'hidden';
                        creditsLegend.style.backgroundColor = '#606060';
                        creditsLegend.style.color = '#fff';
                        creditsLegend.textContent = 'credits (ver. 1.4.8) [ + ]';
                    }
                }
                if (typeof extensionSettings.showHistoryCheckbox !== 'undefined' && showHistoryCheckbox) {
                    showHistoryCheckbox.checked = extensionSettings.showHistoryCheckbox;
                    updateItemNumberDisplay();
                }
                if (typeof extensionSettings.showExtensionCheckbox !== 'undefined' && showExtensionCheckbox) {
                    showExtensionCheckbox.checked = extensionSettings.showExtensionCheckbox;
                    if (showExtensionCheckbox.checked) {
                        extensionLabel.style.display = 'block';
                        creditsLegend.textContent = 'credits (ver. 1.4.8)';
                    }
                    else {
                        extensionLabel.style.display = 'none';
                        creditsLegend.textContent = 'credits (superchat live log ver. 1.4.8)';
                    }

                    if (creditsFieldSet.style.overflow === 'hidden') {
                        creditsLegend.textContent += ' [ + ]';
                    }
                    else {
                        creditsLegend.textContent += ' [ – ]';
                    }
                }
                if (typeof extensionSettings.scrolledUpWarningButton !== 'undefined' && scrolledUpWarningButton1 && scrolledUpWarningButton2 && scrolledUpWarningButton3) {
                    switch(extensionSettings.scrolledUpWarningButton) {
                        case 0: scrolledUpWarningButton1.click(); break;
                        case 1: scrolledUpWarningButton2.click(); break;
                        case 2: scrolledUpWarningButton3.click(); break;
                    }
                }
                if (typeof extensionSettings.maxHistorySizeInput !== 'undefined' && maxHistorySizeInput) {
                    maxHistorySizeInput.value = extensionSettings.maxHistorySizeInput;
                }
                if (typeof extensionSettings.darkblueCheckbox !== 'undefined' && darkblueCheckbox) {
                    darkblueCheckbox.checked = extensionSettings.darkblueCheckbox;
                }
                if (typeof extensionSettings.lightblueCheckbox !== 'undefined' && lightblueCheckbox) {
                    lightblueCheckbox.checked = extensionSettings.lightblueCheckbox;
                }
                if (typeof extensionSettings.greenCheckbox !== 'undefined' && greenCheckbox) {
                    greenCheckbox.checked = extensionSettings.greenCheckbox;
                }
                if (typeof extensionSettings.yellowCheckbox !== 'undefined' && yellowCheckbox) {
                    yellowCheckbox.checked = extensionSettings.yellowCheckbox;
                }
                if (typeof extensionSettings.orangeCheckbox !== 'undefined' && orangeCheckbox) {
                    orangeCheckbox.checked = extensionSettings.orangeCheckbox;
                }
                if (typeof extensionSettings.magentaCheckbox !== 'undefined' && magentaCheckbox) {
                    magentaCheckbox.checked = extensionSettings.magentaCheckbox;
                }
                if (typeof extensionSettings.redCheckbox !== 'undefined' && redCheckbox) {
                    redCheckbox.checked = extensionSettings.redCheckbox;
                }
                if (typeof extensionSettings.memberGiftCheckbox !== 'undefined' && memberGiftCheckbox) {
                    memberGiftCheckbox.checked = extensionSettings.memberGiftCheckbox;
                }
                if (typeof extensionSettings.newMemberCheckbox !== 'undefined' && newMemberCheckbox) {
                    newMemberCheckbox.checked = extensionSettings.newMemberCheckbox;
                }
                if (typeof extensionSettings.memberMessageCheckbox !== 'undefined' && memberMessageCheckbox) {
                    memberMessageCheckbox.checked = extensionSettings.memberMessageCheckbox;
                }
                if (typeof extensionSettings.fundraiserDonationCheckbox !== 'undefined' && fundraiserDonationCheckbox) {
                    fundraiserDonationCheckbox.checked = extensionSettings.fundraiserDonationCheckbox;
                }
                if (typeof extensionSettings.showRemovedSuperchatsCheckbox !== 'undefined' && showRemovedSuperchatsCheckbox) {
                    showRemovedSuperchatsCheckbox.checked = extensionSettings.showRemovedSuperchatsCheckbox;
                }
                if (typeof extensionSettings.showExpiredSuperchatsCheckbox !== 'undefined' && showExpiredSuperchatsCheckbox) {
                    showExpiredSuperchatsCheckbox.checked = extensionSettings.showExpiredSuperchatsCheckbox;
                }
                if (typeof extensionSettings.minidisplayVisibleCheckbox !== 'undefined' && minidisplayVisibleCheckbox) {
                    minidisplayVisibleCheckbox.checked = extensionSettings.minidisplayVisibleCheckbox;
                    setTimeout(()=>{
                        if (minidisplayVisibleCheckbox.checked) {
                            pinAnimatorContainer.style.position = 'relative';
                            pinAnimatorContainer.style.top = 'auto';
                        }
                        else {
                            pinAnimatorContainer.style.position = 'absolute';
                            pinAnimatorContainer.style.top = '-100vh';
                        }
                    }, 0);
                }
                if (typeof extensionSettings.superchatsExpireCheckbox !== 'undefined' && superchatsExpireCheckbox) {
                    superchatsExpireCheckbox.checked = extensionSettings.superchatsExpireCheckbox;
                    if (superchatsExpireCheckbox.checked) {
                        pinAnimator.unpause();
                    }
                    else {
                        pinAnimator.pause();
                    }
                }
            });
            
            document.dispatchEvent(new CustomEvent('sllLoadedAndAttached'));
        }
        else {
            console.error('Unable to start Superchat Live Logs. You are likely not on a page with superchat abilities.');
        }
    }
    
    function autoreconnectTimeoutFunc() {
        // console.log('RECONNECTING');
        if (connectHandles()) {
            if (superchatLiveLogsObserver !== null) {
                superchatLiveLogsObserver.disconnect();
                superchatLiveLogsObserver.observe(chatItems, {childList: true});
                // console.log('RECONNECTED');
            }
        }
        else {
            autoreconnect();
        }
    }
    
    function autoreconnect() {
        autoreconnectId = setTimeout(autoreconnectTimeoutFunc, autoreconnectTimeout);
        autoreconnectTimeout = Math.min(autoreconnectTimeout * 1.25, 1000 * maxAutoSeconds);
    }
    
    function autoloadTimeoutFunc() {
        if (connectHandles()) {
            if (window.location.pathname.indexOf('/watch') === 0) {
                const chat = document.querySelector('#chat');
                if (chat) {
                    const iframe = chat.querySelector('iframe');
                    if (iframe) {
                        if (iframe.contentDocument.querySelector('#sll-liveLogBoxContainer') === null) {
                            // console.log('iframe, loaded by default');
                            startSuperchatLiveLogs();
                            setTimeout(()=>{
                                // console.log('verifying load');
                                if (iframe.contentDocument.querySelector('#sll-liveLogBoxContainer') === null) {
                                    // console.log('verification failed, reloading');
                                    autoload();
                                }
                                else {
                                    // Do nothing since it loaded successfully
                                    // console.log('verified load');
                                }
                            }, 1000);
                        }
                        else {
                            // Do nothing since it's already loaded
                            // console.log('tried to load again but was prevented')
                        }
                    }
                    else {
                        // console.log('waiting for iframe, reloading');
                        autoload();
                    }
                }
                else {
                    // console.log('waiting for iframe, reloading');
                    autoload();
                }
            }
            else {
                // console.log('no iframe, loaded by default');
                startSuperchatLiveLogs();
            }
        }
        else {
            // console.log('loading not established, trying again');
            autoload();
        }
    }
    function autoload() {
        autoloadId = setTimeout(autoloadTimeoutFunc, autoloadTimeout);
        autoloadTimeout = Math.min(autoloadTimeout * 1.25, 1000 * maxAutoSeconds);
    }
    
    function unload() {
        autoreconnectTimeout = 1000;
        autoloadTimeout = 1000;
        if (controlBox !== null) {
            if (controlBox.parentNode !== null) {
                controlBox.parentNode.removeChild(controlBox);
            }
        }
        controlBox = null;
        if (pinAnimatorContainer !== null) {
            if (pinAnimatorContainer.parentNode !== null) {
                pinAnimatorContainer.parentNode.removeChild(pinAnimatorContainer);
            }
        }
        pinAnimatorContainer = null;
        if (liveLogBoxContainer !== null) {
            if (liveLogBoxContainer.parentNode !== null) {
                liveLogBoxContainer.parentNode.removeChild(liveLogBoxContainer);
            }
        }
        liveLogBoxContainer = null;
        if (autoloadId !== null) {
            clearTimeout(autoloadId);
            autoloadId = null;
        }
        if (autoreconnectId !== null) {
            clearTimeout(autoreconnectId);
            autoreconnectId = null;
        }
        if (superchatLiveLogsObserver !== null) {
            superchatLiveLogsObserver.disconnect();
            superchatLiveLogsObserver = null;
        }
    }
    
    let previousUrl = '';
    const observer = new MutationObserver(function(mutations) {
        if (location.href !== previousUrl) {
            if (window.location.pathname.indexOf('/watch') === 0
                || (window.location.pathname.indexOf('/video/') === 0
                    && window.location.pathname.indexOf('/livestreaming') === window.location.pathname.length - '/livestreaming'.length)
                || window.location.pathname.indexOf('/live_chat') === 0)
            {
                autoload();
            }
            else {
                unload();
            }
    
            previousUrl = location.href;
            // console.log(`URL changed to ${location.href}`);
        }
    });
    const config = {subtree: true, childList: true};
    observer.observe(document, config);
}
})()