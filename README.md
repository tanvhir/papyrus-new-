# Papyrus

<div align="center">

![Papyrus Logo](/papyruslogo.svg)

**A Beautiful, AI-Powered Note-Taking & Study Application**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)

</div>

---

## ✨ Features

### 📝 Beautiful Note-Taking
- **Rich Text Editor** powered by Tiptap with extensive formatting options
- **Multiple Paper Themes** - Classic, Lined, Grid, Dot, Cornell, and more
- **Handwriting Support** with beautiful handwritten fonts
- **Page Layouts** - Pageless, A4 Portrait, A4 Landscape with custom margins
- **Dark Mode** with carefully crafted color schemes

### 🧠 AI-Powered Formatting
- **Smart Selection Formatting** - Select text and let AI format it beautifully
- **Flashcard Generation** - Automatically create flashcards from your notes
- **Granular AI Permissions** - Control exactly which AI features can use
- **Multiple Highlight Styles** - Balanced, Generous, or None
- **Text Enhancement Toggle** - Allow AI to modify content or just format
- **Artifact Cleaning** - Remove random text artifacts automatically

### 🎴 Advanced Flashcard System
- **5 Card Types** - Q&A, Cloze Deletion, Definition, Formula, Multi-Point
- **Spaced Repetition** - Built-in Leitner system for optimal learning
- **Study Sessions** - Track your progress with detailed statistics
- **AI Generation** - Create flashcards automatically with AI
- **Import/Export** - Share your decks with ease

### 🎨 Visual Elements
- **Draggable Images** - Paste images, move them anywhere, pin them in place
- **Margin Sticky Notes** - Add colorful annotations on the side
- **Canvas Arrows** - Draw connections between content
- **Decorative Dividers** - 5 styles (Solid, Dashed, Dotted, Zigzag, Wave)
- **Split Sections** - Create multi-column layouts

### 📚 Organization
- **Subject/Chapter Structure** - Organize notes hierarchically
- **Command Palette** - Quick navigation with `Ctrl+K`
- **Search** - Find anything instantly
- **Auto-Save** - Never lose your work

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PHP 8.0+ (for backend features)
- MySQL 5.7+ or 8.0+ (for cloud sync)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/papyrus.git
cd papyrus
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=mysql://user:password@localhost:3306/papyrus
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to `http://localhost:5173`

---

## 🎯 Usage

### Creating Notes
1. Click "New Note" in the sidebar
2. Type your chapter title
3. Start writing with the rich text editor

### Using AI Formatting
1. Select text in your note
2. Click the Sparkles icon in the bubble menu
3. Type a natural language instruction (e.g., "format as a table")
4. AI will format your selection beautifully

### Generating Flashcards
1. Click the Graduation Cap icon in the header
2. AI will analyze your note and generate flashcards
3. Review and edit as needed
4. Start studying!

### Adding Visual Elements
- **Images**: Paste (Ctrl+V) or drag images onto the page
- **Sticky Notes**: Click the sticky icon in the toolbar
- **Arrows**: Enable arrow mode and draw connections
- **Dividers**: Use the divider tool to separate sections

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open command palette |
| `Ctrl + B` | Bold text |
| `Ctrl + I` | Italic text |
| `Ctrl + U` | Underline text |
| `Ctrl + S` | Save note |
| `Ctrl + N` | New note |
| `Alt + Z` | Toggle clean mode |
| `Escape` | Cancel drawing mode |

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.0** - Type safety
- **Tiptap** - Rich text editor
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **LocalForage** - Local storage

### Backend
- **PHP 8.0+** - Server-side logic
- **MySQL** - Database
- **Google Gemini API** - AI features

---

## 📁 Project Structure

```
papyrus/
├── src/
│   ├── components/         # React components (modularized)
│   │   ├── editor/        # Editor components (EditorCore, EditorBubbleMenu, Editor)
│   │   ├── settings/      # Settings modal components (AISettings, AppearanceSettings, PageSettings, EditorSettings, GeneralSettings, KeyboardSettings, AboutSettings, CommonSettings, SettingsModal)
│   │   ├── study/         # Study session components (StudySession, StudySessionCard, StudySessionResults)
│   │   ├── help/          # Help center components (HelpCenter, HelpNavigation, HelpContent, HelpComponents)
│   │   └── ui/            # Reusable UI components
│   ├── features/          # Feature-specific logic
│   │   └── notes/         # Note management (StickyNoteManager, ArrowManager, DividerManager, ImageManager, NoteEditor, NoteToolbar, PDFExport, PageLayout, SubjectManager)
│   ├── lib/               # Utility functions
│   ├── context/           # React context providers
│   └── types.ts          # TypeScript definitions
├── api/
│   ├── ai/                # AI endpoints
│   ├── auth/              # Authentication
│   ├── notes/             # Note CRUD
│   └── flashcards/        # Flashcard operations
├── install/
│   └── schema.sql         # Database schema
└── public/
    └── papyruslogo.svg
```

---

## 🔧 Configuration

### AI Settings
Navigate to Settings > AI to configure:
- **API Key** - Your Google Gemini API key
- **Model** - Choose from available models or use custom
- **Formatting Permissions** - Control which features AI can use
- **Highlight Style** - Balanced, Generous, or None
- **Note Enhancement** - Allow AI to modify text content
- **Artifact Cleaning** - Remove random text artifacts

### Appearance
- **Theme** - Light, Dark, or Classic
- **Paper Texture** - Choose from multiple textures
- **Font Size** - Adjust text size
- **Page Layout** - Pageless, A4 Portrait, A4 Landscape
- **Margins** - Normal, Narrow, or None

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Tiptap** - The amazing rich text editor framework
- **Google Gemini** - AI capabilities
- **Framer Motion** - Beautiful animations
- **Lucide** - Beautiful icon set
- **TailwindCSS** - Utility-first CSS framework

---

## 📞 Support

For support, please open an issue on GitHub or contact [support@papyrus.app](mailto:support@papyrus.app).

---

<div align="center">

**Made with ❤️ for students, researchers, and lifelong learners**

</div>
