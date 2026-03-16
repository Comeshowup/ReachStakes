import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

/**
 * Campaign messages — simple thread UI between creator and brand.
 * Structured for future WebSocket/API integration.
 */
const CampaignMessages = ({ messages = [], campaign }) => {
    const [newMessage, setNewMessage] = useState('');

    const brandName = campaign?.brandName || campaign?.campaign?.brand?.brandProfile?.companyName || 'Brand';

    // Placeholder messages when no real messages exist
    const displayMessages = messages.length > 0 ? messages : [
        {
            id: 1,
            sender: 'brand',
            senderName: brandName,
            text: `Welcome to the campaign! Please review the brief and let us know if you have any questions.`,
            timestamp: campaign?.createdAt || new Date().toISOString(),
        },
    ];

    const handleSend = () => {
        if (!newMessage.trim()) return;
        // Future: POST to messages API
        setNewMessage('');
    };

    return (
        <div
            className="rounded-xl overflow-hidden flex flex-col"
            style={{
                background: 'var(--bd-surface-panel)',
                border: '1px solid var(--bd-border-subtle)',
                height: '480px',
            }}
        >
            {/* Header */}
            <div
                className="px-5 py-3.5 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--bd-border-subtle)' }}
            >
                <MessageSquare className="w-4 h-4" style={{ color: 'var(--bd-accent-primary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>
                    Messages
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--bd-surface-input)', color: 'var(--bd-text-secondary)' }}>
                    {displayMessages.length}
                </span>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {displayMessages.map((msg) => {
                    const isBrand = msg.sender === 'brand';
                    return (
                        <div key={msg.id} className={`flex ${isBrand ? 'justify-start' : 'justify-end'}`}>
                            <div
                                className="max-w-[75%] rounded-xl px-4 py-3"
                                style={{
                                    background: isBrand ? 'var(--bd-surface-input)' : 'var(--bd-accent-primary)',
                                    color: isBrand ? 'var(--bd-text-primary)' : '#fff',
                                }}
                            >
                                {isBrand && (
                                    <p className="text-[10px] font-semibold mb-1 opacity-60">
                                        {msg.senderName || brandName}
                                    </p>
                                )}
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <p className="text-[10px] mt-1.5 opacity-50 text-right">
                                    {new Date(msg.timestamp).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div
                className="p-4 flex items-center gap-3"
                style={{ borderTop: '1px solid var(--bd-border-subtle)' }}
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                        background: 'var(--bd-surface-input)',
                        border: '1px solid var(--bd-border-subtle)',
                        color: 'var(--bd-text-primary)',
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="p-2.5 rounded-lg transition-all disabled:opacity-30"
                    style={{ background: 'var(--bd-accent-primary)', color: '#fff' }}
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CampaignMessages;
