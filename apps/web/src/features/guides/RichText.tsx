import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import clsx from 'clsx'
import { Icon, type IconName } from '../../components/ui/Icon'
import styles from './RichText.module.css'

const extensions = (placeholder?: string) => [
  StarterKit.configure({ heading: { levels: [2, 3] } }),
  Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' } }),
  ...(placeholder ? [Placeholder.configure({ placeholder })] : [])
]

type Tool = { icon: IconName; label: string; active: (e: Editor) => boolean; run: (e: Editor) => void }

const TOOLS: Tool[] = [
  { icon: 'h2', label: 'Título de seção', active: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { icon: 'bold', label: 'Negrito', active: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
  { icon: 'italic', label: 'Itálico', active: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
  { icon: 'list', label: 'Lista', active: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
  { icon: 'ol', label: 'Lista numerada', active: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { icon: 'quote', label: 'Dica em destaque', active: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
  {
    icon: 'link',
    label: 'Link',
    active: (e) => e.isActive('link'),
    run: (e) => {
      if (e.isActive('link')) return e.chain().focus().unsetLink().run()
      const url = window.prompt('Endereço do link')
      if (url) e.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }
]

export function RichTextEditor({ content, onChange, label }: { content: Record<string, unknown>; onChange: (json: Record<string, unknown>) => void; label: string }) {
  const editor = useEditor({
    extensions: extensions('Comece com o objetivo da conquista. Depois, o passo a passo.'),
    content,
    editorProps: { attributes: { class: styles.prose, 'aria-label': label, role: 'textbox', 'aria-multiline': 'true' } },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as Record<string, unknown>)
  })

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formatação">
        {TOOLS.map((t) => (
          <button
            key={t.icon}
            type="button"
            title={t.label}
            aria-label={t.label}
            aria-pressed={editor ? t.active(editor) : false}
            className={clsx(styles.tool, editor && t.active(editor) && styles.toolOn)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor && t.run(editor)}
          >
            <Icon name={t.icon} size={18} />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export function RichTextView({ content }: { content: Record<string, unknown> }) {
  const editor = useEditor({ extensions: extensions(), content, editable: false, editorProps: { attributes: { class: styles.prose } } })
  return <EditorContent editor={editor} />
}
