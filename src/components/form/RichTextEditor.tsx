"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Eye,
  Code,
  Edit3,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

/**
 * Normalisasi konten artikel lama yang sebelumnya dibuat via textarea biasa (plain text),
 * sehingga otomatis terkonversi menjadi format paragraf HTML yang rapi di Rich Text Editor.
 */
function normalizeToRichTextHtml(raw: string): string {
  if (!raw || !raw.trim()) return "";
  const trimmed = raw.trim();
  // Cek apakah sudah mengandung tag HTML standar
  const hasHtmlTags = /<\/?(p|div|h[1-6]|ul|ol|li|blockquote|br|hr|span|table|b|i|strong|em|a)[^>]*>/i.test(trimmed);
  if (hasHtmlTags) {
    return trimmed;
  }
  // Konversi teks lama (plain text dengan newline) menjadi tag <p> dan <br>
  const paragraphs = trimmed
    .split(/\r?\n\r?\n/)
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\r?\n/g, "<br>")}</p>`)
    .join("");
  return paragraphs || `<p>${trimmed}</p>`;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis isi artikel...",
  minHeight = "320px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"visual" | "html" | "preview">("visual");
  const [htmlContent, setHtmlContent] = useState(() => normalizeToRichTextHtml(value));
  const isUpdatingRef = useRef(false);

  // Sinkronisasi value dari luar ke dalam editor jika berbeda
  useEffect(() => {
    const normalized = normalizeToRichTextHtml(value);
    if (normalized !== htmlContent) {
      setHtmlContent(normalized);
      if (editorRef.current && !isUpdatingRef.current) {
        editorRef.current.innerHTML = normalized;
      }
    }
  }, [value]);

  // Initial load content
  useEffect(() => {
    if (editorRef.current && activeTab === "visual") {
      const normalized = normalizeToRichTextHtml(htmlContent);
      if (editorRef.current.innerHTML !== normalized) {
        editorRef.current.innerHTML = normalized;
      }
    }
  }, [activeTab]);


  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const newHtml = editorRef.current.innerHTML;
      // Normalisasi konten kosong
      const cleanHtml = newHtml === "<p><br></p>" || newHtml === "<br>" ? "" : newHtml;
      setHtmlContent(cleanHtml);
      onChange(cleanHtml);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  }, [onChange]);

  const handleHtmlSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlContent(val);
    onChange(val);
    if (editorRef.current) {
      editorRef.current.innerHTML = val;
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (activeTab !== "visual") return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleInsertLink = () => {
    const url = prompt("Masukkan URL tautan (contoh: https://example.com):");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleFormatBlock = (tag: string) => {
    executeCommand("formatBlock", tag);
  };

  // Hitung jumlah kata dan karakter
  const plainText = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(" ").filter(Boolean).length : 0;
  const charCount = plainText.length;

  return (
    <div className="w-full rounded-xl border border-gray-300 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-900 overflow-hidden transition-colors">
      {/* Top Bar: Tabs & Word Count */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-200 bg-gray-50/80 px-3 py-2 dark:border-gray-800 dark:bg-gray-800/60">
        <div className="flex items-center gap-1 rounded-lg bg-gray-200/80 p-0.5 dark:bg-gray-700/60">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
              activeTab === "visual"
                ? "bg-white text-brand-600 shadow-xs dark:bg-gray-800 dark:text-brand-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("html")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
              activeTab === "html"
                ? "bg-white text-brand-600 shadow-xs dark:bg-gray-800 dark:text-brand-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Kode HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
              activeTab === "preview"
                ? "bg-white text-brand-600 shadow-xs dark:bg-gray-800 dark:text-brand-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{wordCount} Kata</span>
          <span>•</span>
          <span>{charCount} Karakter</span>
        </div>
      </div>

      {/* Toolbar Visual (hanya tampil di tab visual) */}
      {activeTab === "visual" && (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
          {/* Headings */}
          <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1 dark:border-gray-700">
            <button
              type="button"
              title="Heading 1"
              onClick={() => handleFormatBlock("<h1>")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Heading 2"
              onClick={() => handleFormatBlock("<h2>")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Heading 3"
              onClick={() => handleFormatBlock("<h3>")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Paragraf Biasa"
              onClick={() => handleFormatBlock("<p>")}
              className="rounded px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              P
            </button>
          </div>

          {/* Formats: Bold, Italic, Underline, Strike */}
          <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1 dark:border-gray-700">
            <button
              type="button"
              title="Tebal (Bold)"
              onClick={() => executeCommand("bold")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Miring (Italic)"
              onClick={() => executeCommand("italic")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Garis Bawah (Underline)"
              onClick={() => executeCommand("underline")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Coret (Strikethrough)"
              onClick={() => executeCommand("strikeThrough")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1 dark:border-gray-700">
            <button
              type="button"
              title="Rata Kiri"
              onClick={() => executeCommand("justifyLeft")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Rata Tengah"
              onClick={() => executeCommand("justifyCenter")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Rata Kanan"
              onClick={() => executeCommand("justifyRight")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Rata Kanan Kiri (Justify)"
              onClick={() => executeCommand("justifyFull")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1 dark:border-gray-700">
            <button
              type="button"
              title="Daftar Poin (Bullet List)"
              onClick={() => executeCommand("insertUnorderedList")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Daftar Nomor (Numbered List)"
              onClick={() => executeCommand("insertOrderedList")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Kutipan (Blockquote)"
              onClick={() => handleFormatBlock("<blockquote>")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Garis Pembatas (Divider)"
              onClick={() => executeCommand("insertHorizontalRule")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Links */}
          <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1 mr-1 dark:border-gray-700">
            <button
              type="button"
              title="Sisipkan Tautan (Link)"
              onClick={handleInsertLink}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Hapus Tautan"
              onClick={() => executeCommand("unlink")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
            >
              <Unlink className="w-4 h-4" />
            </button>
          </div>

          {/* Utilities: Clear formatting, Undo, Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title="Hapus Format Teks"
              onClick={() => executeCommand("removeFormat")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 hover:text-red-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-red-400"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Urungkan (Undo)"
              onClick={() => executeCommand("undo")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Ulangi (Redo)"
              onClick={() => executeCommand("redo")}
              className="rounded p-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor Body */}
      <div className="relative">
        {/* Tab 1: Visual Editor (ContentEditable) */}
        {activeTab === "visual" && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            style={{ minHeight }}
            className="rich-text-content px-5 py-4 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-0 leading-relaxed overflow-y-auto"
            data-placeholder={placeholder}
          />
        )}

        {/* Tab 2: Raw HTML Source Code */}
        {activeTab === "html" && (
          <textarea
            value={htmlContent}
            onChange={handleHtmlSourceChange}
            style={{ minHeight }}
            className="w-full font-mono text-xs bg-gray-950 text-emerald-400 p-4 focus:outline-none focus:ring-0 leading-normal resize-y border-none"
            placeholder="Edit HTML mentah di sini..."
          />
        )}

        {/* Tab 3: Live Preview */}
        {activeTab === "preview" && (
          <div
            style={{ minHeight }}
            className="px-6 py-5 bg-gray-50/50 dark:bg-gray-950/40 overflow-y-auto"
          >
            {htmlContent ? (
              <div
                className="rich-text-content prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-100"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <p className="text-sm italic text-gray-400">Belum ada konten untuk ditampilkan di pratinjau.</p>
            )}
          </div>
        )}
      </div>

      {/* Embedded CSS for Rich Text Editor Elements */}
      <style jsx global>{`
        .rich-text-content {
          outline: none;
        }
        .rich-text-content[contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          cursor: text;
          pointer-events: none;
        }
        .rich-text-content h1 {
          font-size: 1.625rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.625rem;
          line-height: 1.3;
        }
        .rich-text-content h2 {
          font-size: 1.375rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.35;
        }
        .rich-text-content h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-top: 0.875rem;
          margin-bottom: 0.375rem;
          line-height: 1.4;
        }
        .rich-text-content p {
          margin-bottom: 0.875rem;
          line-height: 1.65;
        }
        .rich-text-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.875rem;
        }
        .rich-text-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.875rem;
        }
        .rich-text-content li {
          margin-bottom: 0.25rem;
        }
        .rich-text-content blockquote {
          border-left: 4px solid #f59e0b;
          background-color: rgba(245, 158, 11, 0.05);
          padding: 0.625rem 1rem;
          margin: 0.875rem 0;
          border-radius: 0 0.375rem 0.375rem 0;
          font-style: italic;
        }
        .rich-text-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .rich-text-content a:hover {
          color: #1d4ed8;
        }
        .rich-text-content hr {
          border: 0;
          height: 1px;
          background: #e5e7eb;
          margin: 1.5rem 0;
        }
        .dark .rich-text-content hr {
          background: #374151;
        }
      `}</style>
    </div>
  );
}
