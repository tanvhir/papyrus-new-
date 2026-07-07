import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Highlighter, 
  Image as ImageIcon, 
  Sigma, 
  Type, 
  Palette, 
  Layers,
  StickyNote as StickyIcon,
  Download,
  Share2,
  Settings2,
  Save,
  Check,
  Loader2,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  Heading1,
  Heading2,
  Heading3,
  Divide,
  List,
  ListOrdered,
  Pipette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUpRight,
  Pencil,
  Columns as ColumnsIcon,
  Columns2,
  Columns3,
  PanelLeft,
  PanelRight,
  Layout,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaperTexture } from '@/src/types';
import { cn } from '@/lib/utils';

interface StationeryBarProps {
  onFormat: (type: string, value?: any) => void;
  onTextureChange: (texture: PaperTexture) => void;
  onImageUpload: () => void;
  onStickyAdd: () => void;
  onMathToggle: () => void;
  onExport: (format: 'bundle' | 'note' | 'md') => void;
  onImport: () => void;
  isSaving: boolean;
  activeHighlighterColor: string | null;
  isDrawingArrowMode?: boolean;
  onToggleDrawingArrowMode?: () => void;
  onLogout?: () => void;
  onAIFormat?: () => void;
  isAILoading?: boolean;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: '#ffff00' },
  { name: 'Blue', color: '#bfdbfe' },
  { name: 'Deep green', color: '#15803d' },
  { name: 'Pink', color: '#f9a8d4' },
  { name: 'Orange', color: '#fed7aa' },
];

const TEXT_COLORS = [
  { name: 'Stone', color: '#1c1917' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Gold', color: '#d97706' },
];

export const StationeryBar = React.memo<StationeryBarProps>(({
  onFormat,
  onTextureChange,
  onImageUpload,
  onStickyAdd,
  onMathToggle,
  onExport,
  onImport,
  isSaving,
  activeHighlighterColor,
  isDrawingArrowMode = false,
  onToggleDrawingArrowMode,
  onLogout,
  onAIFormat,
  isAILoading
}) => {
  const [dividerSettings, setDividerSettings] = React.useState({
    type: 'solid' as 'solid' | 'dashed' | 'zigzag' | 'dotted',
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    size: 2,
    length: '100%',
  });

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-stone-900/90 dark:border-stone-800 backdrop-blur-md border border-stone-200 paper-shadow rounded-2xl px-3 md:px-5 py-2 md:py-2.5 flex items-center gap-1 md:gap-1.5 z-50 animate-in fade-in slide-in-from-bottom-6 duration-700 text-stone-900 dark:text-stone-100 max-w-[95vw] overflow-x-auto">
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('bold')} className="hover:bg-stone-100 dark:hover:bg-stone-800 w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0">
                <Bold className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('italic')} className="hover:bg-stone-100 dark:hover:bg-stone-800 w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0">
                <Italic className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('underline')} className="hover:bg-stone-100 dark:hover:bg-stone-800 w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0">
                <Underline className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-stone-100 dark:hover:bg-stone-800 w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0">
                    <Type className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Headings</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="paper-shadow border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 min-w-[8rem] animate-in fade-in zoom-in-95 duration-200">
              <DropdownMenuItem onClick={() => onFormat('h1')} className="font-bold flex items-center gap-2">
                <Heading1 className="w-4 h-4" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('h2')} className="font-semibold flex items-center gap-2">
                <Heading2 className="w-4 h-4" /> Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('h3')} className="font-medium flex items-center gap-2">
                <Heading3 className="w-4 h-4" /> Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-stone-100 dark:hover:bg-stone-800 w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Alignment</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="paper-shadow border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 min-w-[8rem] animate-in fade-in zoom-in-95 duration-200">
              <DropdownMenuItem onClick={() => onFormat('align', 'left')} className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4" /> Align Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('align', 'center')} className="flex items-center gap-2">
                <AlignCenter className="w-4 h-4" /> Align Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('align', 'right')} className="flex items-center gap-2">
                <AlignRight className="w-4 h-4" /> Align Right
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('align', 'justify')} className="flex items-center gap-2">
                <AlignJustify className="w-4 h-4" /> Justify
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-stone-100 dark:hover:bg-stone-800 w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0">
                    <ColumnsIcon className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Split Layout</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="paper-shadow border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 min-w-[8rem] animate-in fade-in zoom-in-95 duration-200">
              <DropdownMenuItem onClick={() => onFormat('columns', 'layout-two-column')} className="flex items-center gap-2">
                <Columns2 className="w-4 h-4" /> Two Columns
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('columns', 'layout-three-column')} className="flex items-center gap-2">
                <Columns3 className="w-4 h-4" /> Three Columns
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('columns', 'layout-left-sidebar')} className="flex items-center gap-2">
                <PanelLeft className="w-4 h-4" /> Left Split (1/3)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('columns', 'layout-right-sidebar')} className="flex items-center gap-2">
                <PanelRight className="w-4 h-4" /> Right Split (2/3)
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem onClick={() => onFormat('columns', 'single')} className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Layout className="w-4 h-4" /> Remove Split Layout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1 dark:bg-stone-800" />

        <div className="flex items-center gap-0.5">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn(
                    "w-7 h-7 md:w-8 md:h-8 transition-all relative overflow-hidden shrink-0",
                    activeHighlighterColor ? "bg-yellow-100/50 dark:bg-yellow-900/30" : "hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  )}>
                    <Highlighter className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      activeHighlighterColor ? "text-yellow-600 dark:text-yellow-400" : "text-yellow-700 dark:text-yellow-500"
                    )} />
                    {activeHighlighterColor && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-0.5" 
                        style={{ backgroundColor: activeHighlighterColor }}
                      />
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Highlighter Tool {activeHighlighterColor ? "(Active)" : ""}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="flex p-2 gap-2 paper-shadow border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 animate-in fade-in zoom-in-95 duration-200">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.color}
                  className={cn(
                    "w-6 h-6 rounded-full border transition-all shadow-sm",
                    activeHighlighterColor === c.color ? "border-stone-950 dark:border-white scale-110" : "border-black/5 hover:scale-110"
                  )}
                  style={{ backgroundColor: c.color }}
                  onClick={() => onFormat('highlight', c.color)}
                  title={c.name}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 w-7 h-7 md:w-8 md:h-8 shrink-0">
                    <Pipette className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Text Color</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="flex p-2 gap-2 paper-shadow border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 animate-in fade-in zoom-in-95 duration-200">
              {TEXT_COLORS.map(c => (
                <button
                  key={c.color}
                  className="w-6 h-6 rounded-full border border-black/5 hover:scale-110 transition-transform shadow-sm"
                  style={{ backgroundColor: c.color }}
                  onClick={() => onFormat('color', c.color)}
                  title={c.name}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-stone-100 dark:hover:bg-stone-800 w-7 h-7 md:w-8 md:h-8 text-stone-500 dark:text-stone-400 shrink-0">
                    <Divide className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Stationery Separators</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="paper-shadow border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 min-w-[14rem] p-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider opacity-50 font-bold">Style</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['solid', 'dashed', 'dotted', 'zigzag'] as const).map(style => (
                      <Button 
                        key={style}
                        variant={dividerSettings.type === style ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setDividerSettings(prev => ({ ...prev, type: style }))} 
                        className="h-8 text-xs capitalize"
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider opacity-50 font-bold">Orientation</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['horizontal', 'vertical'] as const).map(orient => (
                      <Button 
                        key={orient}
                        variant={dividerSettings.orientation === orient ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setDividerSettings(prev => ({ 
                          ...prev, 
                          orientation: orient,
                          length: orient === 'horizontal' ? '100%' : '150px'
                        }))} 
                        className="h-8 text-xs capitalize"
                      >
                        {orient}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider opacity-50 font-bold">Length / Size</div>
                  <div className="grid grid-cols-2 gap-2">
                    {dividerSettings.orientation === 'horizontal' ? (
                      (['25%', '50%', '75%', '100%'] as const).map(l => (
                        <Button 
                          key={l}
                          variant={dividerSettings.length === l ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => setDividerSettings(prev => ({ ...prev, length: l }))} 
                          className="h-8 text-xs"
                        >
                          {l}
                        </Button>
                      ))
                    ) : (
                      (['50px', '100px', '200px', '300px'] as const).map(l => (
                        <Button 
                          key={l}
                          variant={dividerSettings.length === l ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => setDividerSettings(prev => ({ ...prev, length: l }))} 
                          className="h-8 text-xs"
                        >
                          {l}
                        </Button>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider opacity-50 font-bold">Thickness</div>
                  <div className="flex gap-2">
                    {[1, 2, 4, 8, 12].map(s => (
                      <Button 
                        key={s} 
                        variant={dividerSettings.size === s ? "default" : "outline"} 
                        size="icon" 
                        onClick={() => setDividerSettings(prev => ({ ...prev, size: s }))}
                        className="h-7 w-7 text-[10px]"
                      >
                        {s}px
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full mt-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200"
                  onClick={() => onFormat('decorative-hr', dividerSettings)}
                >
                  Insert Separator
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={onMathToggle} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0">
                <Sigma className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>LaTeX Equation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={onStickyAdd} className="hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-400 w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0">
                <StickyIcon className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sticky Note</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onMouseDown={(e) => e.preventDefault()} 
                onClick={onToggleDrawingArrowMode} 
                className={cn(
                  "w-7 h-7 md:w-8 md:h-8 transition-all relative overflow-hidden shrink-0",
                  isDrawingArrowMode 
                    ? "bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:text-stone-900 hover:text-white" 
                    : "hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400"
                )}
              >
                <Pencil className="w-3.5 h-3.5" />
                {isDrawingArrowMode && (
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isDrawingArrowMode ? "Pen Drawing Mode Active" : "Draw Arrow Mode (Click & Drag)"}</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1 dark:bg-stone-800" />

        <div className="flex items-center gap-0.5">
          {onAIFormat && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={onAIFormat} 
                  disabled={isAILoading}
                  className={cn(
                    "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-400 w-7 h-7 md:w-8 md:h-8 relative shrink-0",
                    isAILoading && "animate-pulse"
                  )}
                >
                  {isAILoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isAILoading ? "AI Formatting Note..." : "AI Auto-Format Note"}</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={onImageUpload} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0">
                <ImageIcon className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Image</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-stone-100 dark:hover:bg-stone-800 w-7 h-7 md:w-8 md:h-8 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Paper Style</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="paper-shadow border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 animate-in fade-in zoom-in-95 duration-200">
              <DropdownMenuItem onClick={() => onTextureChange('plain')}>Plain Paper</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTextureChange('laid')}>Laid Pattern</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTextureChange('grid')}>Graph Grid</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTextureChange('linen')}>Linen Texture</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn(
                    "hover:bg-stone-100 dark:hover:bg-stone-800 w-7 h-7 md:w-8 md:h-8 relative shrink-0"
                  )}>
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Settings2 className="w-3.5 h-3.5" />}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{isSaving ? "Saving..." : "More Options"}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="paper-shadow border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 min-w-[12rem] animate-in fade-in zoom-in-95 duration-200">
              <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Data</div>
              <DropdownMenuItem onClick={onImport} className="font-semibold animate-none">Import (.papyrus)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('note')} className="font-semibold animate-none">Export Current Note (.papyrus)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('bundle')} className="font-semibold animate-none">Export All (Backup .papyrus)</DropdownMenuItem>
              {onLogout && (
                <>
                  <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                  <DropdownMenuItem onClick={onLogout} className="font-semibold text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Sign Out Account</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
});
