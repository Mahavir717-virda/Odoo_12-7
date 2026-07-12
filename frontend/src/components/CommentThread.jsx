import React, { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';

export default function CommentThread({ entityType, entityId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Retrieve/mock comments based on entityType and entityId
  useEffect(() => {
    const storageKey = `comments_${entityType}_${entityId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setComments(JSON.parse(stored));
    } else {
      // Seed default comments for realism
      const defaults = [
        {
          id: 1,
          author: "Sarah HR",
          role: "HR",
          text: "Looking forward to seeing everyone participate in this! Reach out if you have any questions.",
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
        },
        {
          id: 2,
          author: "Aditi Rao",
          role: "Employee",
          text: "Registered! Are we organizing group transport for this event?",
          timestamp: new Date(Date.now() - 3600000).toLocaleString(),
        }
      ];
      localStorage.setItem(storageKey, JSON.stringify(defaults));
      setComments(defaults);
    }
  }, [entityType, entityId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem('token');
    let authorName = "Employee";
    let authorRole = "Employee";
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        authorName = payload.name || payload.email || "Employee";
        authorRole = payload.role || "Employee";
      } catch (err) {}
    }

    const comment = {
      id: Date.now(),
      author: authorName,
      role: authorRole,
      text: newComment.trim(),
      timestamp: new Date().toLocaleString(),
    };

    const updated = [...comments, comment];
    setComments(updated);
    localStorage.setItem(`comments_${entityType}_${entityId}`, JSON.stringify(updated));
    setNewComment("");
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 font-display">Discussion Thread</h4>
      
      {/* Comments List */}
      <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-bg-base/30 border border-border-sage/40 rounded-xl p-3 space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <div className="flex items-center space-x-1.5 font-bold">
                <span className="text-text-primary">{comment.author}</span>
                <span className="text-text-secondary/70 bg-bg-card border border-border-sage/30 px-1.5 py-0.5 rounded font-mono text-[8px] uppercase">{comment.role}</span>
              </div>
              <span className="text-text-secondary/60 font-mono">{comment.timestamp}</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{comment.text}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-xs text-text-secondary/70 text-center py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="flex-1 bg-bg-card border border-border-sage rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-soc placeholder-text-secondary/40"
        />
        <button
          type="submit"
          className="px-3.5 bg-accent-soc text-bg-base rounded-lg flex items-center justify-center hover:brightness-110 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
