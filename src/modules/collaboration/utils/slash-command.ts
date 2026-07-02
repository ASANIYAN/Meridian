import { Extension } from '@tiptap/core'
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { SlashCommandMenu, type SlashCommandMenuHandle } from '../components/slash-command-menu'
import { SLASH_COMMAND_ITEMS, type SlashCommandItem } from './slash-command-items'

/**
 * `/` triggers a floating command menu. Uses @tiptap/suggestion (the standard
 * pairing for this) with ReactRenderer to mount the menu, since Suggestion's
 * render lifecycle is imperative and doesn't map onto a declarative Radix
 * trigger the way the rest of the toolbar's menus do.
 */
export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query }: { query: string }) =>
          SLASH_COMMAND_ITEMS.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          ),
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor
          range: { from: number; to: number }
          props: SlashCommandItem
        }) => {
          editor.chain().focus().deleteRange(range).run()
          props.command(editor)
        },
        render: () => {
          let renderer: ReactRenderer<SlashCommandMenuHandle> | undefined
          let popupEl: HTMLDivElement | undefined

          return {
            onStart: (suggestionProps) => {
              popupEl = document.createElement('div')
              popupEl.style.position = 'absolute'
              popupEl.style.zIndex = '50'
              document.body.appendChild(popupEl)

              renderer = new ReactRenderer(SlashCommandMenu, {
                editor: suggestionProps.editor,
                props: {
                  items: suggestionProps.items,
                  command: (item: SlashCommandItem) => suggestionProps.command(item),
                },
              })
              popupEl.appendChild(renderer.element)
              positionPopup(popupEl, suggestionProps.clientRect?.() ?? null)
            },
            onUpdate: (suggestionProps) => {
              renderer?.updateProps({
                items: suggestionProps.items,
                command: (item: SlashCommandItem) => suggestionProps.command(item),
              })
              if (popupEl) positionPopup(popupEl, suggestionProps.clientRect?.() ?? null)
            },
            onKeyDown: (suggestionProps) => {
              if (suggestionProps.event.key === 'Escape') {
                popupEl?.remove()
                return true
              }
              return renderer?.ref?.onKeyDown(suggestionProps.event) ?? false
            },
            onExit: () => {
              popupEl?.remove()
              renderer?.destroy()
            },
          }
        },
      } satisfies Partial<SuggestionOptions>,
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

function positionPopup(el: HTMLDivElement, rect: DOMRect | null) {
  if (!rect) return
  el.style.left = `${rect.left + window.scrollX}px`
  el.style.top = `${rect.bottom + window.scrollY + 4}px`
}
