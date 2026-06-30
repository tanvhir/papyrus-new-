import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Sparkles, 
  FolderOpen, 
  Brain, 
  Keyboard, 
  Lightbulb, 
  HelpCircle, 
  Info,
  ChevronRight,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

type HelpSection = 'welcome' | 'getting-started' | 'writing-notes' | 'folders' | 'flashcards' | 'ai-features' | 'keyboard-shortcuts' | 'tips-tricks' | 'faq' | 'about';

interface HelpCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTIONS = [
  { id: 'welcome' as HelpSection, label: 'Welcome', icon: BookOpen },
  { id: 'getting-started' as HelpSection, label: 'Getting Started', icon: Sparkles },
  { id: 'writing-notes' as HelpSection, label: 'Writing Notes', icon: FileText },
  { id: 'folders' as HelpSection, label: 'Folders', icon: FolderOpen },
  { id: 'flashcards' as HelpSection, label: 'Flashcards', icon: Brain },
  { id: 'ai-features' as HelpSection, label: 'AI Features', icon: Zap },
  { id: 'keyboard-shortcuts' as HelpSection, label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'tips-tricks' as HelpSection, label: 'Tips & Tricks', icon: Lightbulb },
  { id: 'faq' as HelpSection, label: 'FAQ', icon: HelpCircle },
  { id: 'about' as HelpSection, label: 'About Papyrus', icon: Info },
];

const Callout = ({ type = 'info', className, children }: { type?: 'info' | 'warning' | 'success'; className?: string; children: React.ReactNode }) => {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  };
  
  const icons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle,
  };
  
  const Icon = icons[type];
  
  return (
    <div className={cn('p-4 rounded-lg border flex gap-3', styles[type], className)}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
};

const KeyShortcut = ({ keys }: { keys: string[] }) => (
  <div className="flex gap-1">
    {keys.map((key, idx) => (
      <React.Fragment key={key}>
        {idx > 0 && <span className="text-stone-400">+</span>}
        <kbd className="px-2 py-1 text-xs font-mono bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-stone-700 dark:text-stone-300">
          {key}
        </kbd>
      </React.Fragment>
    ))}
  </div>
);

export const HelpCenter: React.FC<HelpCenterProps> = ({ open, onOpenChange }) => {
  const [activeSection, setActiveSection] = useState<HelpSection>('welcome');

  useEffect(() => {
    if (open) {
      setActiveSection('welcome');
    }
  }, [open]);

  const scrollToSection = (sectionId: HelpSection) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    const contentContainer = document.querySelector('[data-content-area]');
    if (element && contentContainer) {
      const elementTop = element.offsetTop;
      contentContainer.scrollTo({ top: elementTop, behavior: 'smooth' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[1000px] h-[85vh] max-h-[90vh] p-0 bg-[#FCFBF7] dark:bg-[#0A0A0A] border border-stone-200/50 dark:border-stone-800/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar Navigation */}
          <div className="w-64 border-r border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-950/50 backdrop-blur-sm flex flex-col">
            <div className="p-6 border-b border-stone-200/50 dark:border-stone-800/50">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Help Center</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Learn how to use Papyrus</p>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          activeSection === section.id
                            ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                            : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50 hover:text-stone-900 dark:hover:text-stone-100"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {section.label}
                        {activeSection === section.id && (
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto bg-stone-50/40 dark:bg-stone-900/40" data-content-area>
            <div className="max-w-3xl mx-auto p-8 space-y-12">
              
              {/* Welcome Section */}
              <section id="section-welcome" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl">
                    <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Welcome to Papyrus</h2>
                    <p className="text-stone-500 dark:text-stone-400">Your intelligent note-taking companion</p>
                  </div>
                </div>
                
                <p className="text-base text-stone-700 dark:text-stone-300 leading-relaxed mb-6">
                  Papyrus is a premium note-taking application designed for students, researchers, and knowledge workers. 
                  It combines the simplicity of traditional note-taking with the power of AI to help you organize, 
                  understand, and retain information more effectively.
                </p>

                <Callout type="success">
                  Papyrus automatically saves your work to the cloud, so you never lose your notes. 
                  Your data is encrypted and secure.
                </Callout>

                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { icon: Sparkles, title: 'AI-Powered', desc: 'Smart formatting and content suggestions' },
                    { icon: FolderOpen, title: 'Organized', desc: 'Folders and subjects for structured learning' },
                    { icon: Brain, title: 'Flashcards', desc: 'Built-in study tools with spaced repetition' },
                  ].map((feature, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800">
                      <feature.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{feature.title}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Getting Started Section */}
              <section id="section-getting-started" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950/50 rounded-xl">
                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Getting Started</h2>
                    <p className="text-stone-500 dark:text-stone-400">Set up your workspace in minutes</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">Create Your First Note</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                        Click the <strong>+</strong> button in the sidebar to create a new note. 
                        Give it a meaningful title and start writing your content.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">Organize with Folders</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                        Create folders to group related notes together. 
                        This helps you stay organized across different subjects or projects.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">Explore AI Features</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                        Select any text and click the AI wand icon to format it beautifully, 
                        create flashcards, or generate summaries.
                      </p>
                    </div>
                  </div>
                </div>

                <Callout type="info" className="mt-6">
                  <strong>Pro Tip:</strong> Use keyboard shortcuts to navigate faster. 
                  Press <KeyShortcut keys={['Ctrl', 'K']} /> to open the command palette.
                </Callout>
              </section>

              {/* Writing Notes Section */}
              <section id="section-writing-notes" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-950/50 rounded-xl">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Writing Notes</h2>
                    <p className="text-stone-500 dark:text-stone-400">Rich text editing made simple</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-base text-stone-700 dark:text-stone-300 leading-relaxed">
                    Papyrus uses a powerful editor that supports rich text formatting, images, 
                    mathematical equations, and more. Here's what you can do:
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">Text Formatting</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Bold, italic, underline, headings, lists, and more</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">Math Equations</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">LaTeX support for complex mathematical notation</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">Images</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Insert and resize images directly in your notes</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">Links</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Add clickable links to external resources</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Folders Section */}
              <section id="section-folders" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-100 dark:bg-orange-950/50 rounded-xl">
                    <FolderOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Folders</h2>
                    <p className="text-stone-500 dark:text-stone-400">Organize your notes efficiently</p>
                  </div>
                </div>

                <p className="text-base text-stone-700 dark:text-stone-300 leading-relaxed mb-6">
                  Folders help you organize notes by subject, project, or any category that makes sense for your workflow.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Create Folders</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Click the folder icon in the sidebar to create new folders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Drag and Drop</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Reorganize notes by dragging them between folders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Color Coding</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Assign colors to folders for visual organization</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Flashcards Section */}
              <section id="section-flashcards" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-pink-100 dark:bg-pink-950/50 rounded-xl">
                    <Brain className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Flashcards</h2>
                    <p className="text-stone-500 dark:text-stone-400">Active learning with spaced repetition</p>
                  </div>
                </div>

                <p className="text-base text-stone-700 dark:text-stone-300 leading-relaxed mb-6">
                  Create flashcards from your notes to test your knowledge and improve retention.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">Creating Flashcards</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Select text in your note and click the brain icon to create a flashcard instantly.
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">Study Sessions</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Start a study session to review your flashcards with spaced repetition algorithms.
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">Track Progress</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Monitor your learning streak and identify weak concepts for focused review.
                    </p>
                  </div>
                </div>
              </section>

              {/* AI Features Section */}
              <section id="section-ai-features" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-950/50 rounded-xl">
                    <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">AI Features</h2>
                    <p className="text-stone-500 dark:text-stone-400">Supercharge your productivity</p>
                  </div>
                </div>

                <p className="text-base text-stone-700 dark:text-stone-300 leading-relaxed mb-6">
                  Papyrus AI helps you format content, generate summaries, and create study materials automatically.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Smart Formatting</h4>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Select text and use AI to format it as tables, lists, or highlighted content.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Auto Flashcards</h4>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      AI automatically suggests flashcards from your note content.
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Content Suggestions</h4>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Get intelligent suggestions for related content and examples.
                    </p>
                  </div>
                </div>
              </section>

              {/* Keyboard Shortcuts Section */}
              <section id="section-keyboard-shortcuts" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-stone-200 dark:bg-stone-800 rounded-xl">
                    <Keyboard className="w-6 h-6 text-stone-700 dark:text-stone-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Keyboard Shortcuts</h2>
                    <p className="text-stone-500 dark:text-stone-400">Navigate faster with shortcuts</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { keys: ['Ctrl', 'K'], action: 'Open command palette' },
                    { keys: ['Ctrl', 'B'], action: 'Bold text' },
                    { keys: ['Ctrl', 'I'], action: 'Italic text' },
                    { keys: ['Ctrl', 'U'], action: 'Underline text' },
                    { keys: ['Ctrl', 'S'], action: 'Save note' },
                    { keys: ['Ctrl', 'N'], action: 'New note' },
                    { keys: ['Alt', 'Z'], action: 'Toggle clean mode' },
                    { keys: ['Escape'], action: 'Cancel drawing mode' },
                  ].map((shortcut, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                      <span className="text-sm text-stone-700 dark:text-stone-300">{shortcut.action}</span>
                      <KeyShortcut keys={shortcut.keys} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Tips & Tricks Section */}
              <section id="section-tips-tricks" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-teal-100 dark:bg-teal-950/50 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Tips & Tricks</h2>
                    <p className="text-stone-500 dark:text-stone-400">Power user techniques</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Callout type="info">
                    <strong>Quick Navigation:</strong> Use the command palette (<KeyShortcut keys={['Ctrl', 'K']} />) to quickly jump to any note or folder.
                  </Callout>
                  <Callout type="success">
                    <strong>AI Formatting:</strong> Select text and use natural language instructions like "format as a table" or "highlight key terms".
                  </Callout>
                  <Callout type="warning">
                    <strong>Study Efficiently:</strong> Review flashcards daily for best retention. The spaced repetition algorithm optimizes your review schedule.
                  </Callout>
                </div>
              </section>

              {/* FAQ Section */}
              <section id="section-faq" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl">
                    <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">FAQ</h2>
                    <p className="text-stone-500 dark:text-stone-400">Common questions answered</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: 'Is my data secure?',
                      a: 'Yes, all data is encrypted and stored securely. We use industry-standard encryption protocols.'
                    },
                    {
                      q: 'Can I export my notes?',
                      a: 'Yes, you can export your notes as JSON or PDF format from the settings menu.'
                    },
                    {
                      q: 'Does Papyrus work offline?',
                      a: 'Papyrus works with an internet connection for AI features, but basic note-taking works offline with local storage.'
                    },
                    {
                      q: 'How do I sync across devices?',
                      a: 'Log in with your account on any device to access your synced notes and settings.'
                    },
                  ].map((faq, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">{faq.q}</h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* About Section */}
              <section id="section-about" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-rose-100 dark:bg-rose-950/50 rounded-xl">
                    <Info className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">About Papyrus</h2>
                    <p className="text-stone-500 dark:text-stone-400">Version information</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">Version</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Papyrus v1.0.0</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">Mission</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Papyrus is built to help students and professionals capture, organize, and retain knowledge more effectively through intelligent note-taking.
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm mb-2">Feedback</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      We love hearing from our users. Share your feedback and suggestions to help us improve Papyrus.
                    </p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
