module.exports = function applyTrashcoreGuards(sock) {
  const originalSend = sock.sendMessage?.bind(sock);

  function normalizeJid(jid) {
    if (!jid) return null;
    if (typeof jid === 'number') jid = String(jid);
    if (typeof jid !== 'string') return null;
    const trimmed = jid.trim();
    if (!trimmed) return null;
    if (!/@s\.whatsapp\.net$/.test(trimmed)) {
      if (/^\d+$/.test(trimmed)) return `${trimmed}@s.whatsapp.net`;
    }
    return trimmed;
  }

  sock.sendMessage = async function guardedSendMessage(jid, content, options) {
    try {
      const safeJid = normalizeJid(jid);
      if (!safeJid) {
        console.warn('[Trashcore Guard] Invalid JID for sendMessage:', jid);
        return null;
      }
      return await originalSend(safeJid, content, options);
    } catch (err) {
      console.error('[Trashcore Guard] sendMessage error:', err);
      return null;
    }
  };

  console.log('[Trashcore Guard] Applied JID normalization for sendMessage.');
};
