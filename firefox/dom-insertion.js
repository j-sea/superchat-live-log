// © Copyright 2022-Present by Jonathan Chan. All rights reserved.

const pinAnimatorScript = document.createElement('script');
pinAnimatorScript.setAttribute('type', 'text/javascript');
pinAnimatorScript.setAttribute('src', chrome.runtime.getURL('pin-animator.js'));
(document.head || document.documentElement).appendChild(pinAnimatorScript);
pinAnimatorScript.remove();

const superchatLiveLogScript = document.createElement('script');
superchatLiveLogScript.setAttribute('type', 'text/javascript');
superchatLiveLogScript.setAttribute('src', chrome.runtime.getURL('superchat-live-logs.js'));
(document.head || document.documentElement).appendChild(superchatLiveLogScript);
superchatLiveLogScript.remove();

function thenSuccess() {}
function thenError(message) {
    console.error(message);
}

document.addEventListener('sllSaveSettingsCheckboxChange', function(data) {
    // console.log('data',data)
    if (data.detail.saveSettingsCheckbox === true) {
        console.log('storage already applied');
        chrome.storage.sync.set({'saveSettingsCheckbox': true}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'showSuperchatConfiguration': data.detail.showSuperchatConfiguration}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'showFilterSelection': data.detail.showFilterSelection}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'showGeneralSettings': data.detail.showGeneralSettings}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'showCredits': data.detail.showCredits}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'showHistoryCheckbox': data.detail.showHistoryCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'showExtensionCheckbox': data.detail.showExtensionCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'scrolledUpWarningButton': data.detail.scrolledUpWarningButton}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'maxHistorySizeInput': data.detail.maxHistorySizeInput}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'darkblueCheckbox': data.detail.darkblueCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'lightblueCheckbox': data.detail.lightblueCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'greenCheckbox': data.detail.greenCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'yellowCheckbox': data.detail.yellowCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'orangeCheckbox': data.detail.orangeCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'magentaCheckbox': data.detail.magentaCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'redCheckbox': data.detail.redCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'memberGiftCheckbox': data.detail.memberGiftCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'newMemberCheckbox': data.detail.newMemberCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'memberMessageCheckbox': data.detail.memberMessageCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'fundraiserDonationCheckbox': data.detail.fundraiserDonationCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'minidisplayVisibleCheckbox': data.detail.minidisplayVisibleCheckbox}).then(thenSuccess, thenError);
        chrome.storage.sync.set({'superchatsExpireCheckbox': data.detail.superchatsExpireCheckbox}).then(thenSuccess, thenError);
        if (data.detail.success) {
            success();
        }
    }
    else {
        chrome.storage.sync.clear();
        chrome.storage.sync.set({'saveSettingsCheckbox': false}).then(thenSuccess, thenError);
        if (data.detail.success) {
            success();
        }
    }
});

document.addEventListener('sllSettingsChange', function(data) {
    // console.log(data);
    if (typeof data.detail.showSuperchatConfiguration !== 'undefined') {
        chrome.storage.sync.set({'showSuperchatConfiguration': data.detail.showSuperchatConfiguration}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.showFilterSelection !== 'undefined') {
        chrome.storage.sync.set({'showFilterSelection': data.detail.showFilterSelection}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.showGeneralSettings !== 'undefined') {
        chrome.storage.sync.set({'showGeneralSettings': data.detail.showGeneralSettings}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.showCredits !== 'undefined') {
        chrome.storage.sync.set({'showCredits': data.detail.showCredits}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.showHistoryCheckbox !== 'undefined') {
        chrome.storage.sync.set({'showHistoryCheckbox': data.detail.showHistoryCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.showExtensionCheckbox !== 'undefined') {
        chrome.storage.sync.set({'showExtensionCheckbox': data.detail.showExtensionCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.scrolledUpWarningButton !== 'undefined') {
        chrome.storage.sync.set({'scrolledUpWarningButton': data.detail.scrolledUpWarningButton}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.maxHistorySizeInput !== 'undefined') {
        chrome.storage.sync.set({'maxHistorySizeInput': data.detail.maxHistorySizeInput}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.darkblueCheckbox !== 'undefined') {
        chrome.storage.sync.set({'darkblueCheckbox': data.detail.darkblueCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.lightblueCheckbox !== 'undefined') {
        chrome.storage.sync.set({'lightblueCheckbox': data.detail.lightblueCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.greenCheckbox !== 'undefined') {
        chrome.storage.sync.set({'greenCheckbox': data.detail.greenCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.yellowCheckbox !== 'undefined') {
        chrome.storage.sync.set({'yellowCheckbox': data.detail.yellowCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.orangeCheckbox !== 'undefined') {
        chrome.storage.sync.set({'orangeCheckbox': data.detail.orangeCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.magentaCheckbox !== 'undefined') {
        chrome.storage.sync.set({'magentaCheckbox': data.detail.magentaCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.redCheckbox !== 'undefined') {
        chrome.storage.sync.set({'redCheckbox': data.detail.redCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.memberGiftCheckbox !== 'undefined') {
        chrome.storage.sync.set({'memberGiftCheckbox': data.detail.memberGiftCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.newMemberCheckbox !== 'undefined') {
        chrome.storage.sync.set({'newMemberCheckbox': data.detail.newMemberCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.memberMessageCheckbox !== 'undefined') {
        chrome.storage.sync.set({'memberMessageCheckbox': data.detail.memberMessageCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.minidisplayVisibleCheckbox !== 'undefined') {
        chrome.storage.sync.set({'minidisplayVisibleCheckbox': data.detail.minidisplayVisibleCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.superchatsExpireCheckbox !== 'undefined') {
        chrome.storage.sync.set({'superchatsExpireCheckbox': data.detail.superchatsExpireCheckbox}).then(thenSuccess, thenError);
    }
    if (typeof data.detail.fundraiserDonationCheckbox !== 'undefined') {
        chrome.storage.sync.set({'fundraiserDonationCheckbox': data.detail.fundraiserDonationCheckbox}).then(thenSuccess, thenError);
    }
});

document.addEventListener('sllLoadedAndAttached', function() {
    chrome.storage.sync.get(null).then(
        function(settings){
            // console.log('loading', settings);
            if (typeof settings.saveSettingsCheckbox !== 'undefined') {
                // console.log('loaded');
                const clonedDetail = cloneInto(settings, document.defaultView);
                const customEvent = new CustomEvent(
                    'sllSettingsLoaded',
                    {
                        detail: clonedDetail
                    }
                );
                document.dispatchEvent(customEvent);
            }
            else {
                chrome.storage.sync.set({'saveSettingsCheckbox': true}).then(thenSuccess, thenError);
                const clonedDetail = cloneInto({'saveSettingsCheckbox': true}, document.defaultView);
                const customEvent = new CustomEvent(
                    'sllSettingsLoaded',
                    {
                        detail: clonedDetail
                    }
                );
                document.dispatchEvent(customEvent);
            }
        },
        function(message) {
            console.error(message);
        }
    );
});