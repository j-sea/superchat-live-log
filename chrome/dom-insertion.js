// © Copyright 2022-Present by Jonathan Chan. All rights reserved.

const version = '1.4.8';

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

document.addEventListener('sllSaveSettingsCheckboxChange', function(data) {
    // console.log('data',data)
    if (data.detail.saveSettingsCheckbox === true) {
        console.log('storage already applied');
        chrome.storage.sync.set({'saveSettingsCheckbox': true});
        chrome.storage.sync.set({'version': version});
        chrome.storage.sync.set({'showSuperchatConfiguration': data.detail.showSuperchatConfiguration});
        chrome.storage.sync.set({'showFilterSelection': data.detail.showFilterSelection});
        chrome.storage.sync.set({'showGeneralSettings': data.detail.showGeneralSettings});
        chrome.storage.sync.set({'showCredits': data.detail.showCredits});
        chrome.storage.sync.set({'showHistoryCheckbox': data.detail.showHistoryCheckbox});
        chrome.storage.sync.set({'showExtensionCheckbox': data.detail.showExtensionCheckbox});
        chrome.storage.sync.set({'scrolledUpWarningButton': data.detail.scrolledUpWarningButton});
        chrome.storage.sync.set({'maxHistorySizeInput': data.detail.maxHistorySizeInput});
        chrome.storage.sync.set({'darkblueCheckbox': data.detail.darkblueCheckbox});
        chrome.storage.sync.set({'lightblueCheckbox': data.detail.lightblueCheckbox});
        chrome.storage.sync.set({'greenCheckbox': data.detail.greenCheckbox});
        chrome.storage.sync.set({'yellowCheckbox': data.detail.yellowCheckbox});
        chrome.storage.sync.set({'orangeCheckbox': data.detail.orangeCheckbox});
        chrome.storage.sync.set({'magentaCheckbox': data.detail.magentaCheckbox});
        chrome.storage.sync.set({'redCheckbox': data.detail.redCheckbox});
        chrome.storage.sync.set({'memberGiftCheckbox': data.detail.memberGiftCheckbox});
        chrome.storage.sync.set({'newMemberCheckbox': data.detail.newMemberCheckbox});
        chrome.storage.sync.set({'memberMessageCheckbox': data.detail.memberMessageCheckbox});
        chrome.storage.sync.set({'fundraiserDonationCheckbox': data.detail.fundraiserDonationCheckbox});
        chrome.storage.sync.set({'showRemovedSuperchatsCheckbox': data.detail.showRemovedSuperchatsCheckbox});
        chrome.storage.sync.set({'showExpiredSuperchatsCheckbox': data.detail.showExpiredSuperchatsCheckbox});
        chrome.storage.sync.set({'minidisplayVisibleCheckbox': data.detail.minidisplayVisibleCheckbox});
        chrome.storage.sync.set({'superchatsExpireCheckbox': data.detail.superchatsExpireCheckbox});
        if (data.detail.success) {
            success();
        }
    }
    else {
        chrome.storage.sync.clear();
        chrome.storage.sync.set({'saveSettingsCheckbox': false});
        chrome.storage.sync.set({'version': version});
        if (data.detail.success) {
            success();
        }
    }
});

document.addEventListener('sllSettingsChange', function(data) {
    // console.log(data);
    if (typeof data.detail.showSuperchatConfiguration !== 'undefined') {
        chrome.storage.sync.set({'showSuperchatConfiguration': data.detail.showSuperchatConfiguration});
    }
    if (typeof data.detail.showFilterSelection !== 'undefined') {
        chrome.storage.sync.set({'showFilterSelection': data.detail.showFilterSelection});
    }
    if (typeof data.detail.showGeneralSettings !== 'undefined') {
        chrome.storage.sync.set({'showGeneralSettings': data.detail.showGeneralSettings});
    }
    if (typeof data.detail.showCredits !== 'undefined') {
        chrome.storage.sync.set({'showCredits': data.detail.showCredits});
    }
    if (typeof data.detail.showHistoryCheckbox !== 'undefined') {
        chrome.storage.sync.set({'showHistoryCheckbox': data.detail.showHistoryCheckbox});
    }
    if (typeof data.detail.showExtensionCheckbox !== 'undefined') {
        chrome.storage.sync.set({'showExtensionCheckbox': data.detail.showExtensionCheckbox});
    }
    if (typeof data.detail.scrolledUpWarningButton !== 'undefined') {
        chrome.storage.sync.set({'scrolledUpWarningButton': data.detail.scrolledUpWarningButton});
    }
    if (typeof data.detail.maxHistorySizeInput !== 'undefined') {
        chrome.storage.sync.set({'maxHistorySizeInput': data.detail.maxHistorySizeInput});
    }
    if (typeof data.detail.darkblueCheckbox !== 'undefined') {
        chrome.storage.sync.set({'darkblueCheckbox': data.detail.darkblueCheckbox});
    }
    if (typeof data.detail.lightblueCheckbox !== 'undefined') {
        chrome.storage.sync.set({'lightblueCheckbox': data.detail.lightblueCheckbox});
    }
    if (typeof data.detail.greenCheckbox !== 'undefined') {
        chrome.storage.sync.set({'greenCheckbox': data.detail.greenCheckbox});
    }
    if (typeof data.detail.yellowCheckbox !== 'undefined') {
        chrome.storage.sync.set({'yellowCheckbox': data.detail.yellowCheckbox});
    }
    if (typeof data.detail.orangeCheckbox !== 'undefined') {
        chrome.storage.sync.set({'orangeCheckbox': data.detail.orangeCheckbox});
    }
    if (typeof data.detail.magentaCheckbox !== 'undefined') {
        chrome.storage.sync.set({'magentaCheckbox': data.detail.magentaCheckbox});
    }
    if (typeof data.detail.redCheckbox !== 'undefined') {
        chrome.storage.sync.set({'redCheckbox': data.detail.redCheckbox});
    }
    if (typeof data.detail.memberGiftCheckbox !== 'undefined') {
        chrome.storage.sync.set({'memberGiftCheckbox': data.detail.memberGiftCheckbox});
    }
    if (typeof data.detail.newMemberCheckbox !== 'undefined') {
        chrome.storage.sync.set({'newMemberCheckbox': data.detail.newMemberCheckbox});
    }
    if (typeof data.detail.memberMessageCheckbox !== 'undefined') {
        chrome.storage.sync.set({'memberMessageCheckbox': data.detail.memberMessageCheckbox});
    }
    if (typeof data.detail.minidisplayVisibleCheckbox !== 'undefined') {
        chrome.storage.sync.set({'minidisplayVisibleCheckbox': data.detail.minidisplayVisibleCheckbox});
    }
    if (typeof data.detail.showRemovedSuperchatsCheckbox !== 'undefined') {
        chrome.storage.sync.set({'showRemovedSuperchatsCheckbox': data.detail.showRemovedSuperchatsCheckbox});
    }
    if (typeof data.detail.showExpiredSuperchatsCheckbox !== 'undefined') {
        chrome.storage.sync.set({'showExpiredSuperchatsCheckbox': data.detail.showExpiredSuperchatsCheckbox});
    }
    if (typeof data.detail.superchatsExpireCheckbox !== 'undefined') {
        chrome.storage.sync.set({'superchatsExpireCheckbox': data.detail.superchatsExpireCheckbox});
    }
    if (typeof data.detail.fundraiserDonationCheckbox !== 'undefined') {
        chrome.storage.sync.set({'fundraiserDonationCheckbox': data.detail.fundraiserDonationCheckbox});
    }
});

document.addEventListener('sllLoadedAndAttached', function() {
    chrome.storage.sync.get(null, function(settings){
        // console.log('loading', settings);
        if (typeof settings.saveSettingsCheckbox !== 'undefined') {
            // console.log('loaded');
            if (typeof settings.version === 'undefined') {
                settings.showRemovedSuperchatsCheckbox = true;
                settings.showExpiredSuperchatsCheckbox = true;
            }
            document.dispatchEvent(new CustomEvent('sllSettingsLoaded', {
                detail: settings
            }));
        }
        else {
            chrome.storage.sync.set({'saveSettingsCheckbox': true});
            chrome.storage.sync.set({'version': version});
            document.dispatchEvent(new CustomEvent('sllSettingsLoaded', {
                detail: {
                    'saveSettingsCheckbox': true,
                }
            }));
        }
    });
});