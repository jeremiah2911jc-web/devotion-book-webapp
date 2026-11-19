import { DOMParser, Fragment, Schema, Slice } from 'prosemirror-model';
import { EditorState, Plugin, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { baseKeymap, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { closeHistory, history, redo, redoDepth, undo, undoDepth } from 'prosemirror-history';
import { splitListItem, wrapInList } from 'prosemirror-schema-list';

const textBlock = tag => ({
  content: 'inline*',
  group: 'block',
  parseDOM: [{ tag }],
  toDOM: () => [tag, 0],
});
const colorNames = ['red', 'blue', 'gold', 'purple'];
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: textBlock('p'),
    heading: textBlock('h2'),
    quote: {
      content: 'block+',
      group: 'block',
      defining: true,
      parseDOM: [{ tag: 'blockquote:not(.note-scripture-quotation)' }],
      toDOM: () => ['blockquote', 0],
    },
    scripture: {
      content: 'citation passage',
      group: 'block',
      isolating: true,
      parseDOM: [{ tag: 'blockquote.note-scripture-quotation', priority: 60 }],
      toDOM: () => ['blockquote', { class: 'note-scripture-quotation' }, 0],
    },
    citation: {
      content: 'text*',
      marks: '',
      parseDOM: [{ tag: '.note-scripture-quotation > strong', priority: 65 }],
      toDOM: () => ['strong', 0],
    },
    passage: {
      content: 'inline*',
      marks: 'verse chapter',
      parseDOM: [{ tag: '.note-scripture-quotation > p', priority: 65 }],
      toDOM: () => ['p', 0],
    },
    bullet_list: {
      content: 'list_item+',
      group: 'block',
      parseDOM: [{ tag: 'ul' }],
      toDOM: () => ['ul', 0],
    },
    list_item: {
      content: 'paragraph block*',
      defining: true,
      parseDOM: [{ tag: 'li' }],
      toDOM: () => ['li', 0],
    },
    divider: {
      group: 'block',
      atom: true,
      parseDOM: [{ tag: 'hr' }],
      toDOM: () => ['hr'],
    },
    spacer: {
      group: 'block',
      atom: true,
      attrs: { lines: { default: 1 } },
      parseDOM: [{
        tag: 'div.markdown-spacer',
        getAttrs: node => ({ lines: node.classList.contains('markdown-spacer-2') ? 2 : 1 }),
      }],
      toDOM: node => ['div', { class: `markdown-spacer markdown-spacer-${node.attrs.lines}`, 'aria-hidden': 'true' }],
    },
    text: { group: 'inline' },
    line_break: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM: () => ['br'],
    },
  },
  marks: {
    color: {
      attrs: { name: {} },
      parseDOM: colorNames.map(name => ({ tag: `span.text-${name}`, attrs: { name } })),
      toDOM: mark => ['span', { class: `journal-inline-color text-${mark.attrs.name}` }, 0],
    },
    bold: {
      parseDOM: [{ tag: 'strong:not(.note-scripture-quotation strong)' }, { tag: 'b' }],
      toDOM: () => ['strong', 0],
    },
    verse: {
      parseDOM: [{ tag: '.note-scripture-quotation sup' }],
      toDOM: () => ['sup', 0],
    },
    chapter: {
      parseDOM: [{ tag: '.note-scripture-quotation p > strong', priority: 60 }],
      toDOM: () => ['strong', 0],
    },
  },
});

const { nodes, marks } = schema;
const parser = DOMParser.fromSchema(schema);

const clearEmptyDocument = new Plugin({
  appendTransaction(transactions, before, after) {
    if (!transactions.some(tr => tr.docChanged) || !before.doc.textContent || after.doc.textContent) return null;
    if (after.doc.childCount === 1 && after.doc.firstChild.type === nodes.paragraph) return null;
    const tr = after.tr.replaceWith(0, after.doc.content.size, nodes.paragraph.create());
    return tr.setSelection(TextSelection.create(tr.doc, 1));
  },
});

function inlineMarkdown(node) {
  const active = [];
  let result = '';
  const open = mark => mark.type === marks.bold ? '**' : `{${mark.attrs.name}}`;
  const close = mark => mark.type === marks.bold ? '**' : `{/${mark.attrs.name}}`;

  node.forEach(child => {
    const next = child.isText ? child.marks.filter(mark => mark.type === marks.bold || mark.type === marks.color) : [];
    let same = 0;
    while (same < active.length && same < next.length && active[same].eq(next[same])) same++;
    while (active.length > same) result += close(active.pop());
    for (const mark of next.slice(same)) {
      active.push(mark);
      result += open(mark);
    }
    result += child.isText ? child.text : '\n';
  });
  while (active.length) result += close(active.pop());
  return result;
}

function blockMarkdown(node) {
  switch (node.type) {
    case nodes.heading: return `## ${inlineMarkdown(node)}`;
    case nodes.divider: return '---';
    case nodes.quote:
      return documentMarkdown(node).split('\n').map(line => line ? `> ${line}` : '>').join('\n');
    case nodes.scripture: {
      const citation = node.firstChild.textContent;
      const passage = node.lastChild.textContent;
      return `> **${citation}**\n> ${passage}`;
    }
    case nodes.bullet_list: {
      const items = [];
      node.forEach(item => items.push(`- ${documentMarkdown(item).replaceAll('\n', '\n  ')}`));
      return items.join('\n');
    }
    default: return inlineMarkdown(node);
  }
}

function documentMarkdown(doc) {
  let value = '';
  let prior = null;
  doc.forEach(node => {
    if (node.type === nodes.spacer) {
      value += '\n'.repeat(node.attrs.lines);
      return;
    }
    if (prior) value += prior.type === nodes.paragraph && node.type === nodes.paragraph &&
      (!prior.content.size || !node.content.size) ? '\n' : '\n\n';
    value += blockMarkdown(node);
    prior = node;
  });
  return value;
}

function leaveScripture(state, dispatch) {
  const { $from, empty } = state.selection;
  if (!empty || $from.depth < 2 || $from.node(1).type !== nodes.scripture) return false;
  const position = $from.after(1);
  if (dispatch) {
    let tr = state.tr;
    if (state.doc.nodeAt(position)?.type !== nodes.paragraph) tr = tr.insert(position, nodes.paragraph.create());
    dispatch(tr.setSelection(TextSelection.create(tr.doc, position + 1)).scrollIntoView());
  }
  return true;
}

function insertLineBreak(state, dispatch) {
  if (leaveScripture(state, dispatch)) return true;
  if (dispatch) dispatch(state.tr.replaceSelectionWith(nodes.line_break.create(), false).scrollIntoView());
  return true;
}

function setTextColor(name) {
  const mark = marks.color.create({ name });
  return (state, dispatch) => {
    const { $cursor, ranges } = state.selection;
    if ($cursor) {
      if (!$cursor.parent.type.allowsMarkType(marks.color)) return false;
      if (dispatch) dispatch(state.tr.addStoredMark(mark));
      return true;
    }
    const tr = state.tr;
    for (const { $from, $to } of ranges) tr.addMark($from.pos, $to.pos, mark);
    if (!tr.docChanged) return false;
    if (dispatch) dispatch(tr);
    return true;
  };
}

const commands = {
  heading(state, dispatch) {
    const target = state.selection.$from.parent.type === nodes.heading ? nodes.paragraph : nodes.heading;
    return setBlockType(target)(state, dispatch);
  },
  bold: toggleMark(marks.bold),
  quote: wrapIn(nodes.quote),
  scripture: wrapIn(nodes.quote),
  list: wrapInList(nodes.bullet_list),
  divider(state, dispatch) {
    const { $from } = state.selection;
    if (dispatch) {
      const pos = $from.depth ? $from.after(1) : $from.pos;
      const tr = state.tr.insert(pos, [nodes.divider.create(), nodes.paragraph.create()]);
      dispatch(tr.setSelection(TextSelection.create(tr.doc, pos + 2)).scrollIntoView());
    }
    return true;
  },
  undo,
  redo,
};

function runEdit(command, view) {
  const handled = command(view.state, tr => view.dispatch(closeHistory(tr)), view);
  if (handled) {
    view.dispatch(closeHistory(view.state.tr));
    view.focus();
  }
  return handled;
}

export function createNoteEditor({ mount, renderMarkdown, onChange, onHistoryChange }) {
  const parse = markdown => {
    const content = document.createElement('div');
    content.innerHTML = renderMarkdown(markdown);
    return parser.parse(content, { preserveWhitespace: 'full' });
  };
  const plugins = [
    history(),
    clearEmptyDocument,
    keymap({
      'Mod-z': undo,
      'Mod-Shift-z': redo,
      'Mod-y': redo,
      'Mod-b': (_state, _dispatch, view) => runEdit(commands.bold, view),
      'Shift-Enter': insertLineBreak,
      Enter: (state, dispatch) => leaveScripture(state, dispatch) || splitListItem(nodes.list_item)(state, dispatch),
    }),
    keymap(baseKeymap),
  ];
  function makeState(markdown) {
    let doc = parse(markdown);
    if (/\n\n$/.test(markdown) || [nodes.scripture, nodes.divider, nodes.spacer].includes(doc.lastChild.type)) {
      doc = doc.copy(doc.content.append(Fragment.from(nodes.paragraph.create())));
    }
    return EditorState.create({ schema, doc, plugins, selection: TextSelection.atEnd(doc) });
  }
  const view = new EditorView(mount, {
    state: makeState(''),
    attributes: {
      id: 'note-rich-content',
      'data-testid': 'note-editor-content',
      role: 'textbox',
      'aria-label': '內容',
      'aria-multiline': 'true',
      'data-placeholder': '輸入札記內容',
    },
    dispatchTransaction(tr) {
      const next = view.state.apply(tr);
      view.updateState(next);
      if (tr.docChanged) onChange(documentMarkdown(next.doc));
      refreshHistory();
    },
    handlePaste(view, event) {
      const text = event.clipboardData?.getData('text/plain');
      if (!text) return true;
      const lines = text.replace(/\r\n?/g, '\n').split('\n');
      const tr = view.state.tr;
      if (lines.length === 1) {
        tr.insertText(lines[0]);
      } else {
        const marks = view.state.storedMarks ?? view.state.selection.$from.marks();
        const blocks = lines.map(line => nodes.paragraph.create(null, line ? schema.text(line, marks) : null));
        tr.replaceSelection(Slice.maxOpen(Fragment.fromArray(blocks)));
      }
      view.dispatch(closeHistory(tr.scrollIntoView()));
      view.dispatch(closeHistory(view.state.tr));
      return true;
    },
  });

  function refreshHistory() {
    onHistoryChange(undoDepth(view.state) > 0, redoDepth(view.state) > 0);
  }

  function insertScripture(markdown) {
    const { $from } = view.state.selection;
    const tr = view.state.tr;
    const quote = parse(markdown).content;
    const paragraph = nodes.paragraph.create();
    let before = Fragment.empty;
    let after = Fragment.empty;
    let from = $from.pos;
    let to = from;
    if ($from.depth && $from.depth === 1 && [nodes.paragraph, nodes.heading].includes($from.parent.type)) {
      from = $from.before(1);
      to = $from.after(1);
      const block = $from.parent;
      if ($from.parentOffset) before = Fragment.from(block.cut(0, $from.parentOffset));
      if ($from.parentOffset < block.content.size) after = Fragment.from(block.cut($from.parentOffset));
    } else if ($from.depth) {
      from = $from.after(1);
      to = from;
    }
    const content = before.append(quote).append(Fragment.from(paragraph)).append(after);
    tr.replaceWith(from, to, content);
    tr.setSelection(TextSelection.create(tr.doc, from + before.size + quote.size + 1));
    view.dispatch(closeHistory(tr.scrollIntoView()));
    view.dispatch(closeHistory(view.state.tr));
    view.focus();
  }

  return {
    element: view.dom,
    focus: () => view.focus(),
    moveToEnd() {
      view.dispatch(view.state.tr.setSelection(TextSelection.atEnd(view.state.doc)));
    },
    focusEnd() {
      view.dispatch(view.state.tr.setSelection(TextSelection.atEnd(view.state.doc)));
      view.focus();
    },
    load(markdown) {
      view.updateState(makeState(markdown));
      view.dom.scrollTop = 0;
      refreshHistory();
    },
    insertScripture,
    apply(name) {
      const command = commands[name] || (colorNames.includes(name) && setTextColor(name));
      if (command) runEdit(command, view);
    },
  };
}
