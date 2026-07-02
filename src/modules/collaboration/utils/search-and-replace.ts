import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

/**
 * No official free Tiptap v3 search/replace extension exists (only a paid
 * Tiptap Pro one) — this is a small custom extension modeled structurally on
 * this codebase's other ProseMirror-plugin-backed extensions (Highlight,
 * Placeholder): plain-text scan for matches, rendered as inline decorations,
 * replace via a direct transaction. Never touches the Yjs doc directly —
 * replacements go through normal editor commands, so they sync like any edit.
 */

interface SearchMatch {
  from: number
  to: number
}

interface SearchReplaceStorage {
  searchTerm: string
  results: SearchMatch[]
  activeIndex: number
}

const searchReplacePluginKey = new PluginKey('searchAndReplace')

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findMatches(doc: ProseMirrorNode, term: string): SearchMatch[] {
  if (!term) return []
  const results: SearchMatch[] = []
  const pattern = new RegExp(escapeRegExp(term), 'gi')
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(node.text)) !== null) {
      results.push({ from: pos + match.index, to: pos + match.index + match[0].length })
      if (match.index === pattern.lastIndex) pattern.lastIndex += 1
    }
  })
  return results
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchAndReplace: {
      setSearchTerm: (term: string) => ReturnType
      nextSearchResult: () => ReturnType
      previousSearchResult: () => ReturnType
      replaceActiveResult: (replacement: string) => ReturnType
      replaceAllResults: (replacement: string) => ReturnType
    }
  }

  interface Storage {
    searchAndReplace: SearchReplaceStorage
  }
}

export const SearchAndReplace = Extension.create<
  { searchResultClass: string; activeResultClass: string },
  SearchReplaceStorage
>({
  name: 'searchAndReplace',

  addOptions() {
    return {
      searchResultClass: 'search-result',
      activeResultClass: 'search-result-active',
    }
  },

  addStorage() {
    return { searchTerm: '', results: [], activeIndex: 0 }
  },

  addCommands() {
    return {
      setSearchTerm:
        (term: string) =>
        ({ editor, tr, dispatch }) => {
          editor.storage.searchAndReplace.searchTerm = term
          editor.storage.searchAndReplace.results = findMatches(tr.doc, term)
          editor.storage.searchAndReplace.activeIndex = 0
          if (dispatch) dispatch(tr.setMeta(searchReplacePluginKey, true))
          return true
        },
      nextSearchResult:
        () =>
        ({ editor, tr, dispatch }) => {
          const storage = editor.storage.searchAndReplace
          if (!storage.results.length) return false
          storage.activeIndex = (storage.activeIndex + 1) % storage.results.length
          if (dispatch) dispatch(tr.setMeta(searchReplacePluginKey, true))
          return true
        },
      previousSearchResult:
        () =>
        ({ editor, tr, dispatch }) => {
          const storage = editor.storage.searchAndReplace
          if (!storage.results.length) return false
          storage.activeIndex =
            (storage.activeIndex - 1 + storage.results.length) % storage.results.length
          if (dispatch) dispatch(tr.setMeta(searchReplacePluginKey, true))
          return true
        },
      replaceActiveResult:
        (replacement: string) =>
        ({ editor, tr, dispatch }) => {
          const storage = editor.storage.searchAndReplace
          const match = storage.results[storage.activeIndex]
          if (!match) return false
          if (dispatch) {
            tr.insertText(replacement, match.from, match.to)
            tr.setMeta(searchReplacePluginKey, true)
            dispatch(tr)
          }
          return true
        },
      replaceAllResults:
        (replacement: string) =>
        ({ editor, tr, dispatch }) => {
          const storage = editor.storage.searchAndReplace
          if (!storage.results.length) return false
          if (dispatch) {
            // Replace back-to-front so earlier match positions stay valid.
            for (let i = storage.results.length - 1; i >= 0; i -= 1) {
              const match = storage.results[i]
              tr.insertText(replacement, match.from, match.to)
            }
            tr.setMeta(searchReplacePluginKey, true)
            dispatch(tr)
          }
          storage.results = []
          storage.activeIndex = 0
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    // `apply` below is a plain object method (not an arrow fn), so it can't close over `this`.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const extension = this

    return [
      new Plugin({
        key: searchReplacePluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            if (!tr.getMeta(searchReplacePluginKey) && !tr.docChanged) return old

            const storage = extension.storage
            if (tr.docChanged && storage.searchTerm) {
              storage.results = findMatches(tr.doc, storage.searchTerm)
            }

            const decorations = storage.results.map((match, index) =>
              Decoration.inline(match.from, match.to, {
                class:
                  index === storage.activeIndex
                    ? extension.options.activeResultClass
                    : extension.options.searchResultClass,
              }),
            )
            return DecorationSet.create(tr.doc, decorations)
          },
        },
        props: {
          decorations(state) {
            return searchReplacePluginKey.getState(state)
          },
        },
      }),
    ]
  },
})
