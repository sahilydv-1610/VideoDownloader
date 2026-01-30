import { useState, useCallback } from 'react';

export function useClipboard(timeout = 2000) {
    const [copiedStates, setCopiedStates] = useState({});

    const copyToClipboard = useCallback((text, id = 'default') => {
        if (!text) return;

        const triggerFeedback = () => {
            setCopiedStates(prev => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setCopiedStates(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }, timeout);
        };

        const fallbackCopy = (text) => {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;

                // Ensure element is unobtrusive but technically "visible" for simple browsers
                textArea.style.position = 'fixed';
                textArea.style.top = '0';
                textArea.style.left = '0';
                textArea.style.width = '2em';
                textArea.style.height = '2em';
                textArea.style.padding = '0';
                textArea.style.border = 'none';
                textArea.style.outline = 'none';
                textArea.style.boxShadow = 'none';
                textArea.style.background = 'transparent';

                // Mobile safeguards
                textArea.contentEditable = true;
                textArea.readOnly = false;
                textArea.setAttribute('inputmode', 'none');
                textArea.style.opacity = '0.01';
                textArea.style.zIndex = '9999';
                textArea.style.pointerEvents = 'auto';
                textArea.style.fontSize = '16px'; // Prevent zoom

                document.body.appendChild(textArea);

                // Check for iOS/Apple devices to handle selection differently
                if (navigator.userAgent.match(/ipart/i) || navigator.userAgent.match(/iphone/i)) {
                    const range = document.createRange();
                    range.selectNodeContents(textArea);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    textArea.setSelectionRange(0, 999999);
                } else {
                    textArea.select();
                }

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (successful) {
                    triggerFeedback();
                    return true;
                }
                return false;
            } catch (err) {
                console.error('Fallback copy failed', err);
                return false;
            }
        };

        // Try modern API first (if secure context)
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                triggerFeedback();
            }).catch(err => {
                console.warn('Clipboard API failed, trying fallback', err);
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }, [timeout]);

    const isCopied = (id = 'default') => !!copiedStates[id];

    return { copyToClipboard, isCopied };
}
