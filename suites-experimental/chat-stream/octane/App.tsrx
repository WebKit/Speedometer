import { createContext, flushSync, memo, useContext, useLayoutEffect, useMemo, useRef, useState } from 'octane';
import { initialConversations, nextReply, userMessage } from '../shared/corpus.js';
import { parseMarkdown } from '../shared/markdown.js';
import { streamReply, streamTime } from '../shared/network.js';

// A streaming LLM chat client in Octane: conversation state, memoized
// Markdown blocks, effects and markup. It commits the way the Octane
// fixture of the chat-stream benchmark in the Octane repository does: event
// handlers only set state, which the steps commit through window.__benchFlush
// (see main.js), and a streamed chunk, which arrives outside any event,
// commits synchronously through flushSync.
//
// The Markdown views read the kinds of context the reply renderer of a large
// chat service's web app reads (from its production bundle, 2026-11): a
// layout flow the reply provides anew on every render and every block reads
// to compute its spacing, a list layout for list items, the colour scheme
// text components resolve their colours against, and the animation contexts
// each streamed word reads.

interface ChatMessage {
	id: number;
	role: 'user' | 'assistant';
	text: string;
}
interface Conversation {
	id: number;
	title: string;
	messages: ChatMessage[];
}
interface Inline {
	id: number;
	kind: string;
	text: string;
}
interface Token {
	id: number;
	kind: string;
	text: string;
}
interface Line {
	id: number;
	tokens: Token[];
}
interface ListItemData {
	id: number;
	inlines: Inline[];
}
interface Block {
	id: number;
	type: string;
	raw: string;
	level?: number;
	ordered?: boolean;
	inlines?: Inline[];
	items?: ListItemData[];
	lang?: string;
	lines?: Line[];
	root?: UiNodeData;
}
// A node of a ```ui block's tree (see parseUi in shared/markdown.js).
interface UiNodeData {
	id: number;
	type: string;
	props: { variant?: string; gap?: boolean };
	text: string;
	inline?: Inline;
	children: UiNodeData[];
}

// Layout flow. Every container (the reply, and the rows, columns, cards and
// details of a ```ui block) provides a new value for its children each time
// it renders: its direction, whether children are spaced automatically,
// whether its controls are disabled, the nodes hidden below it, and each
// visible child's previous sibling. Every node reads it to compute its
// spacing, and so re-renders whenever its container does.
interface LayoutNode {
	type?: string;
	props?: { variant?: string };
	root?: UiNodeData;
}
interface Flow {
	direction: 'none' | 'root' | 'column' | 'row';
	autoSpacing: boolean;
	disabled: boolean;
	hiddenNodes: Set<LayoutNode>;
	previousSiblings: Map<LayoutNode, LayoutNode | undefined>;
}
const NO_NODES = new Set<LayoutNode>();
const FlowContext = createContext<Flow>({
	direction: 'none',
	autoSpacing: false,
	disabled: false,
	hiddenNodes: NO_NODES,
	previousSiblings: new Map(),
});
// The card a node is in: whether its details are open, and how to toggle
// them.
const CardContext = createContext<{ open: boolean; toggle: () => void } | null>(null);
// A list's layout, which its items read: the marker kind, and whether the
// marker is the browser's own.
const ListLayoutContext = createContext({ marker: 'none', native: false });
// The colour scheme, which text components and code resolve their colours
// against.
const ColorSchemeContext = createContext('light');
// Whether text below may render as streamed words: text components provide
// true for their contents.
const WordsContext = createContext(false);

// Streamed-word animation: whether the reply is eligible (it is streaming),
// whether animation is enabled, the animation mode, and the scheduler that
// staggers the words' start times.
type AnimationMode = 'disabled' | 'normal' | 'snappy';
const EligibleContext = createContext(false);
const AnimationEnabledContext = createContext(false);
const AnimationModeContext = createContext<AnimationMode>('disabled');
const DelaySchedulerContext = createContext<WordDelayScheduler | undefined>(undefined);

// Replaces one message of one conversation, sharing everything else.
function updateMessage(
	conversations: Conversation[],
	conversationId: number,
	messageId: number,
	update: (message: ChatMessage) => ChatMessage,
): Conversation[] {
	return conversations.map((conversation) =>
		conversation.id === conversationId
			? {
					...conversation,
					messages: conversation.messages.map((message) =>
						message.id === messageId ? update(message) : message,
					),
				}
			: conversation,
	);
}

export function App() @{
	const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
	const [activeId, setActiveId] = useState(0);
	const [draft, setDraft] = useState('');
	const [streamingId, setStreamingId] = useState<number | null>(null);

	const active = conversations[activeId];

	const send = () => {
		const text = draft.trim();
		if (text === '' || streamingId !== null) return;
		const conversationId = activeId;
		const reply = nextReply();
		const replyId = reply.message.id;
		setConversations((current) =>
			current.map((conversation) =>
				conversation.id === conversationId
					? { ...conversation, messages: [...conversation.messages, userMessage(text), reply.message] }
					: conversation,
			),
		);
		setStreamingId(replyId);
		setDraft('');
		// A chunk arrives outside any event, so flushSync is what renders it
		// right away; the last chunk also ends the stream, in the same commit.
		streamReply(reply.text, (chunk: string, done: boolean) =>
			flushSync(() => {
				setConversations((current) =>
					updateMessage(current, conversationId, replyId, (message) => ({
						...message,
						text: message.text + chunk,
					})),
				);
				if (done) setStreamingId(null);
			}),
		);
	};

	<ColorSchemeContext value="light">
		<div class="app">
			<aside class="sidebar">
				<div class="sidebar-heading">Chats</div>
				<nav class="conversation-list">
					@for (const conversation of conversations; key conversation.id) {
						<ConversationItem
							id={conversation.id}
							title={conversation.title}
							active={conversation.id === activeId}
							onSelect={setActiveId}
						/>
					}
				</nav>
			</aside>
			<main class="chat">
				<header class="chat-header">
					<h1>{active.title as string}</h1>
					<span class="message-count">{active.messages.length + ' messages'}</span>
				</header>
				<MessageList messages={active.messages} streamingId={streamingId} />
				<footer class="composer">
					<div class="composer-box">
						<textarea
							class="prompt"
							placeholder="Ask anything"
							value={draft}
							onInput={(event: Event) => setDraft((event.target as HTMLTextAreaElement).value)}
							onKeyDown={(event: KeyboardEvent) => {
								if (event.key === 'Enter' && !event.shiftKey) {
									event.preventDefault();
									send();
								}
							}}
						/>
						<button class="send" disabled={draft.trim() === '' || streamingId !== null} onClick={send}>
							Send
						</button>
					</div>
					<div class="composer-hint">Enter to send, Shift+Enter for a new line</div>
				</footer>
			</main>
		</div>
	</ColorSchemeContext>
}

function ConversationItemImpl(props: {
	id: number;
	title: string;
	active: boolean;
	onSelect: (id: number) => void;
}) @{
	<button
		class={props.active ? 'conversation-item active' : 'conversation-item'}
		data-conversation={String(props.id)}
		onClick={() => props.onSelect(props.id)}
	>
		{props.title as string}
	</button>
}
const ConversationItem = memo(ConversationItemImpl);

// Keeps the newest message in view with CSS scroll anchoring rather than
// script: .scroll-anchor is the list's only anchor candidate, so once the list
// is at the bottom, the browser keeps it there as messages arrive, replies
// grow and conversations switch. Only the first position is set by script,
// once, on mount.
function MessageList(props: { messages: ChatMessage[]; streamingId: number | null }) @{
	const scroller = useRef<HTMLDivElement | null>(null);
	useLayoutEffect(() => {
		const element = scroller.current!;
		element.scrollTop = element.scrollHeight;
	}, []);
	<div class="messages" ref={scroller}>
		<div class="messages-inner">
			@for (const message of props.messages; key message.id) {
				<Message message={message} streaming={message.id === props.streamingId} />
			}
		</div>
		<div class="scroll-anchor" />
	</div>
}

function MessageImpl(props: { message: ChatMessage; streaming: boolean }) @{
	const message = props.message;
	const isUser = message.role === 'user';
	<article class={'message ' + message.role + (props.streaming ? ' streaming' : '')}>
		<div class="avatar">{isUser ? 'You' : 'AI'}</div>
		<div class="message-body">
			<div class="message-author">{isUser ? 'You' : 'Assistant'}</div>
			@if (isUser) {
				<p class="user-text">{message.text as string}</p>
			} @else if (message.text === '') {
				<p class="thinking">Thinking…</p>
			} @else {
				<Markdown text={message.text} streaming={props.streaming} />
			}
			@if (!isUser && !props.streaming) {
				<div class="message-actions">
					<button>Copy</button>
					<button>Retry</button>
					<button>Good</button>
					<button>Bad</button>
				</div>
			}
		</div>
	</article>
}
const Message = memo(MessageImpl);

// Each child's previous sibling, as a layout container hands it down. Keyed
// by the node itself: block and list-item ids are both positions.
function previousSiblings(children: LayoutNode[]): Flow['previousSiblings'] {
	const map: Flow['previousSiblings'] = new Map();
	let previous: LayoutNode | undefined;
	for (const child of children) {
		map.set(child, previous);
		previous = child;
	}
	return map;
}

// The reference renderer's spacing rules for a node and its previous
// sibling, for the layout types this app renders: one for the reply's
// children, one for a column's (block spacing) and one for a row's (inline
// spacing). A Markdown block's layout type is the reference's equivalent; a
// ```ui block's is its root's.
const MARKDOWN_LAYOUT_TYPE: Record<string, string> = { paragraph: 'text', heading: 'title', list: 'list', code: 'code' };

function layoutType(node: LayoutNode): string | undefined {
	if (node.type === 'ui') return node.root!.type;
	return MARKDOWN_LAYOUT_TYPE[node.type ?? ''] ?? node.type;
}

function rootSpacing(type: string | undefined, previous: string | undefined): number {
	if (previous === undefined) return 0;
	if (type === 'title' && previous !== 'title') return previous === 'badge' ? 8 : 24;
	if ((previous === 'title' && type === 'text') || ((previous === 'title' || previous === 'text') && type === 'list')) return 8;
	return previous !== 'text' || (type !== 'card' && type !== 'map') ? 16 : 24;
}

function columnSpacing(type: string | undefined, previous: string | undefined): number {
	if (type === undefined) return 0;
	let spacing = 8;
	if (type === 'text' || type === 'list') spacing = 12;
	if (type === 'caption') spacing = 4;
	if (previous === 'title') spacing = 16;
	if (previous === 'text' && type === 'text') spacing = 0;
	if (previous === 'caption' && type === 'text') spacing = 0;
	if (type === 'button' && previous !== undefined) spacing = previous === 'button' ? 8 : 12;
	if (type === 'divider' || previous === 'divider') return 16;
	return previous === undefined ? 0 : spacing;
}

function rowSpacing(node: LayoutNode, previous: LayoutNode | undefined, type: string | undefined, previousType: string | undefined): number {
	if (previous === undefined || type === undefined) return 0;
	if (type === 'divider' || previousType === 'divider') return 12;
	if (type === 'button' && previousType === 'button')
		return node.props?.variant === 'ghost' && previous.props?.variant === 'ghost' ? 2 : 6;
	return 8;
}

// A node's block (top) and inline (start) spacing in its container's flow.
// A node outside the flow's children (a list item, say) has no previous
// sibling there, so it is not spaced.
function layoutSpacing(node: LayoutNode, flow: Flow): { block: number; inline: number } {
	if (!flow.autoSpacing) return { block: 0, inline: 0 };
	const previous = flow.previousSiblings.get(node);
	const type = layoutType(node);
	const previousType = previous && layoutType(previous);
	return {
		block: flow.direction === 'root' ? rootSpacing(type, previousType) : flow.direction === 'column' ? columnSpacing(type, previousType) : 0,
		inline: flow.direction === 'row' ? rowSpacing(node, previous, type, previousType) : 0,
	};
}

function spacingFor(node: LayoutNode, flow: Flow): number {
	return layoutSpacing(node, flow).block;
}

function spacingClass(spacing: { block: number; inline: number }): string {
	return ' gap-' + spacing.block + ' inline-' + spacing.inline;
}

// The flow a container provides its children.
function childFlow(parent: Flow, node: UiNodeData, direction: 'column' | 'row', hiddenNodes: Set<LayoutNode>): Flow {
	return {
		direction,
		autoSpacing: !node.props.gap,
		disabled: parent.disabled,
		hiddenNodes,
		previousSiblings: previousSiblings(node.children.filter((child) => !hiddenNodes.has(child))),
	};
}

// Text components resolve their colour against the colour scheme: primary
// text, or secondary for captions and badges.
function textColor(scheme: string, tone: 'primary' | 'secondary' = 'primary'): string {
	if (tone === 'secondary') return scheme === 'dark' ? '#aeb6c2' : '#6b7380';
	return scheme === 'dark' ? '#e6e9ee' : '#1d2125';
}

function Markdown(props: { text: string; streaming: boolean }) @{
	const previous = useRef<Block[] | undefined>(undefined);
	// Reparsing reuses every block of the previous parse whose source is
	// unchanged, so memo(Inlines) skips the content of all but the one still
	// streaming.
	const blocks = useMemo(() => {
		const parsed = parseMarkdown(props.text, previous.current) as Block[];
		previous.current = parsed;
		return parsed;
	});
	// A new flow on every render, so every block component re-reads it. A
	// reply's controls are disabled while it streams.
	const flow: Flow = {
		direction: 'root',
		autoSpacing: true,
		disabled: props.streaming,
		hiddenNodes: NO_NODES,
		previousSiblings: previousSiblings(blocks),
	};
	const mode: AnimationMode = 'normal';
	// The reference also disables animation for prefers-reduced-motion.
	const enabled = mode !== 'disabled';
	const [scheduler] = useState(() => new WordDelayScheduler());
	<EligibleContext value={props.streaming}>
		<AnimationEnabledContext value={enabled}>
			<AnimationModeContext value={mode}>
				<DelaySchedulerContext value={scheduler}>
					<FlowContext value={flow}>
						<div class="markdown">
							@for (const block of blocks; key block.id) {
								<MarkdownBlock block={block} />
							}
						</div>
					</FlowContext>
				</DelaySchedulerContext>
			</AnimationModeContext>
		</AnimationEnabledContext>
	</EligibleContext>
}

const MarkdownBlock = memo(function MarkdownBlock(props: { block: Block }) @{
	const block = props.block;
	@switch (block.type) {
		@case 'heading': {
			<Heading block={block} />
		}
		@case 'list': {
			<List block={block} />
		}
		@case 'code': {
			<CodeBlock block={block} />
		}
		@case 'ui': {
			<UiNode node={block.root!} flowKey={block} />
		}
		@default: {
			<Paragraph block={block} />
		}
	}
});

// The nodes of a ```ui block. Each reads its container's flow for its
// spacing; containers provide their children a new flow on every render.
// flowKey is the node's entry in its container's flow: the block, for a
// block's root.
const UiNode = memo(function UiNode(props: { node: UiNodeData; flowKey?: LayoutNode }) @{
	const node = props.node;
	const key = props.flowKey ?? node;
	@switch (node.type) {
		@case 'card': {
			<UiCard node={node} flowKey={key} />
		}
		@case 'row': {
			<UiStack node={node} flowKey={key} />
		}
		@case 'col': {
			<UiStack node={node} flowKey={key} />
		}
		@case 'details': {
			<UiStack node={node} flowKey={key} />
		}
		@case 'badge': {
			<UiBadge node={node} />
		}
		@case 'button': {
			<UiButton node={node} />
		}
		@case 'divider': {
			<UiDivider node={node} />
		}
		@default: {
			<UiText node={node} />
		}
	}
});

function UiChildren(props: { node: UiNodeData; flow: Flow }) @{
	@for (const child of props.node.children; key child.id) {
		@if (!props.flow.hiddenNodes.has(child)) {
			<UiNode node={child} />
		}
	}
}

// Rows, columns and details sections: their children in a row or a column.
const UiStack = memo(function UiStack(props: { node: UiNodeData; flowKey: LayoutNode }) @{
	const flow = useContext(FlowContext);
	const node = props.node;
	const spacing = layoutSpacing(props.flowKey, flow);
	const inner = childFlow(flow, node, node.type === 'row' ? 'row' : 'column', flow.hiddenNodes);
	<FlowContext value={inner}>
		<div class={'ui-' + node.type + spacingClass(spacing) + (node.props.gap ? ' fixed-gap' : '')}>
			<UiChildren node={node} flow={inner} />
		</div>
	</FlowContext>
});

// A card is a column whose details sections stay hidden until its Details
// button opens them.
const UiCard = memo(function UiCard(props: { node: UiNodeData; flowKey: LayoutNode }) @{
	const flow = useContext(FlowContext);
	const scheme = useContext(ColorSchemeContext);
	const node = props.node;
	const [open, setOpen] = useState(false);
	const card = useMemo(() => ({ open, toggle: () => setOpen((value) => !value) }));
	let hidden = flow.hiddenNodes;
	if (!open) {
		hidden = new Set(flow.hiddenNodes);
		for (const child of node.children) if (child.type === 'details') hidden.add(child);
	}
	const inner = childFlow(flow, node, 'column', hidden);
	const spacing = layoutSpacing(props.flowKey, flow);
	<CardContext value={card}>
		<FlowContext value={inner}>
			<div class={'ui-card scheme-' + scheme + spacingClass(spacing) + (open ? ' open' : '')}>
				<UiChildren node={node} flow={inner} />
			</div>
		</FlowContext>
	</CardContext>
});

// Titles, text and captions are text components: they resolve their colour
// and their text may stream in as words.
const UiText = memo(function UiText(props: { node: UiNodeData }) @{
	const flow = useContext(FlowContext);
	const scheme = useContext(ColorSchemeContext);
	const node = props.node;
	const tone = node.type === 'caption' ? 'secondary' : 'primary';
	<div class={'ui-' + node.type + spacingClass(layoutSpacing(node, flow))} style={{ '--text-color': textColor(scheme, tone) }}>
		<WordsContext value={true}>
			<Text inline={node.inline!} />
		</WordsContext>
	</div>
});

const UiBadge = memo(function UiBadge(props: { node: UiNodeData }) @{
	const flow = useContext(FlowContext);
	const scheme = useContext(ColorSchemeContext);
	<span class={'ui-badge scheme-' + scheme + spacingClass(layoutSpacing(props.node, flow))}>
		{props.node.text as string}
	</span>
});

// Buttons are disabled while their reply streams. A Details button toggles
// its card's details.
const UiButton = memo(function UiButton(props: { node: UiNodeData }) @{
	const flow = useContext(FlowContext);
	const card = useContext(CardContext);
	const node = props.node;
	const details = node.text === 'Details' && card !== null;
	<button
		class={'ui-button ' + node.props.variant + spacingClass(layoutSpacing(node, flow))}
		disabled={flow.disabled}
		aria-expanded={details ? String(card!.open) : undefined}
		onClick={() => {
			if (details) card!.toggle();
		}}
	>
		{node.text as string}
	</button>
});

const UiDivider = memo(function UiDivider(props: { node: UiNodeData }) @{
	const flow = useContext(FlowContext);
	<hr class={'ui-divider' + spacingClass(layoutSpacing(props.node, flow))} />
});

// Every block component reads the flow and puts its spacing on its own
// element, so it re-renders on every chunk; memo(Inlines) then skips the
// content of the blocks that did not grow.
const Heading = memo(function Heading(props: { block: Block }) @{
	const flow = useContext(FlowContext);
	const scheme = useContext(ColorSchemeContext);
	<h3 class={'gap-' + spacingFor(props.block, flow)} style={{ '--text-color': textColor(scheme) }}>
		<WordsContext value={true}>
			<Inlines inlines={props.block.inlines!} />
		</WordsContext>
	</h3>
});

const Paragraph = memo(function Paragraph(props: { block: Block }) @{
	const flow = useContext(FlowContext);
	const scheme = useContext(ColorSchemeContext);
	<p class={'gap-' + spacingFor(props.block, flow)} style={{ '--text-color': textColor(scheme) }}>
		<WordsContext value={true}>
			<Inlines inlines={props.block.inlines!} />
		</WordsContext>
	</p>
});

// A list provides its items' layout, a new value on every render. Its items
// read it, and the reply's flow, in which they have no previous sibling.
const List = memo(function List(props: { block: Block }) @{
	const flow = useContext(FlowContext);
	const block = props.block;
	const layout = { marker: block.ordered ? 'number' : 'bullet', native: true };
	const gap = 'gap-' + spacingFor(block, flow);
	<ListLayoutContext value={layout}>
		@if (block.ordered) {
			<ol class={gap}>
				@for (const item of block.items!; key item.id) {
					<ListItem item={item} />
				}
			</ol>
		} @else {
			<ul class={gap}>
				@for (const item of block.items!; key item.id) {
					<ListItem item={item} />
				}
			</ul>
		}
	</ListLayoutContext>
});

const ListItem = memo(function ListItem(props: { item: ListItemData }) @{
	const layout = useContext(ListLayoutContext);
	const flow = useContext(FlowContext);
	<li class={'gap-' + spacingFor(props.item, flow) + (layout.native ? ' native-' + layout.marker : '')}>
		<WordsContext value={true}>
			<Inlines inlines={props.item.inlines} />
		</WordsContext>
	</li>
});

const Inlines = memo(function Inlines(props: { inlines: Inline[] }) @{
	@for (const inline of props.inlines; key inline.id) {
		@switch (inline.kind) {
			@case 'strong': {
				<InlineSpan inline={inline} />
			}
			@case 'em': {
				<InlineSpan inline={inline} />
			}
			@case 'code': {
				<InlineCode inline={inline} />
			}
			@default: {
				<Text inline={inline} />
			}
		}
	}
});

// Bold and italic runs are text components too: they resolve their colour.
const InlineSpan = memo(function InlineSpan(props: { inline: Inline }) @{
	const scheme = useContext(ColorSchemeContext);
	const style = { '--text-color': textColor(scheme) };
	@if (props.inline.kind === 'strong') {
		<strong style={style}>
			<Text inline={props.inline} />
		</strong>
	} @else {
		<em style={style}>
			<Text inline={props.inline} />
		</em>
	}
});

const InlineCode = memo(function InlineCode(props: { inline: Inline }) @{
	const scheme = useContext(ColorSchemeContext);
	<code class={'inline-code scheme-' + scheme}>
		<Text inline={props.inline} />
	</code>
});

// A word with the whitespace after it; a text run's first word keeps the
// whitespace before it too.
const WORD = /^\s*\S+\s*|\S+\s*/g;

// Text inside a text component of a reply that is streaming renders as one
// span per word; text of a reply that was already complete when it mounted
// renders as is. The choice is made once, on mount, so the word spans stay
// after the stream ends.
function Text(props: { inline: Inline }) @{
	const eligible = useContext(EligibleContext);
	const words = useContext(WordsContext);
	const [split] = useState(() => words && eligible);
	@if (split) {
		<>
			@for (const word of props.inline.text.match(WORD) ?? []; index i; key i) {
				<Word text={word} />
			}
		</>
	} @else {
		<>{props.inline.text as string}</>
	}
}

// Staggers the start of each word's fade-in: a word starts a fixed step
// after the previous one, and the step shrinks once the backlog passes
// 300 ms. The reference reads performance.now(); this reads the stream's
// virtual clock.
class WordDelayScheduler {
	next = 0;
	delay(mode: AnimationMode): number {
		const now = streamTime();
		const backlog = Math.max(0, this.next - now);
		const step = mode === 'snappy' ? 16 : 35;
		this.next = Math.max(now, this.next) + (backlog > 300 ? step / (1 + (backlog / 1000) * 20) : step);
		return backlog;
	}
}

// The word animations that have started and not ended. The steps end them
// when a reply is complete (window.finishWordAnimations), as their
// animationend events would, so no animation work spills into a later step.
const runningAnimations = new Set<WordAnimation>();

(window as any).finishWordAnimations = () =>
	flushSync(() => {
		for (const animation of [...runningAnimations]) animation.finish();
	});

// One word's fade-in. A word of an eligible reply starts it once animation is
// enabled, with the delay the scheduler gives it, and finishes it when its
// animation ends; disabling animation finishes it too.
class WordAnimation {
	started = false;
	finished: boolean;
	publish: (state: { active: boolean; delay: number }) => void;
	constructor(eligible: boolean, publish: (state: { active: boolean; delay: number }) => void) {
		this.finished = !eligible;
		this.publish = publish;
	}
	update(enabled: boolean, scheduler: WordDelayScheduler | undefined, mode: AnimationMode) {
		if (!enabled) {
			this.finish();
			return;
		}
		if (this.started || this.finished) return;
		this.started = true;
		runningAnimations.add(this);
		this.publish({ active: true, delay: scheduler?.delay(mode) ?? 0 });
	}
	finish() {
		runningAnimations.delete(this);
		if (this.finished) return;
		this.finished = true;
		this.publish({ active: false, delay: 0 });
	}
	dispose() {
		runningAnimations.delete(this);
		this.finished = true;
	}
}

const Word = memo(function Word(props: { text: string }) @{
	const eligible = useContext(EligibleContext);
	const enabled = useContext(AnimationEnabledContext);
	const mode = useContext(AnimationModeContext);
	const scheduler = useContext(DelaySchedulerContext);
	const [initialMode] = useState(mode);
	const [state, setState] = useState(() => ({ active: eligible, delay: 0 }));
	const [animation] = useState(() => new WordAnimation(eligible, setState));
	useLayoutEffect(() => animation.update(enabled, scheduler, initialMode));
	useLayoutEffect(() => () => animation.dispose(), []);
	const finish = () => animation.finish();
	const running = state.active && enabled;
	<span
		data-streaming-word=""
		class={running ? 'word' : undefined}
		style={running
			? { '--word-duration': (initialMode === 'snappy' ? 350 : 700) + 'ms', '--word-delay': state.delay + 'ms' }
			: undefined}
		onAnimationEnd={finish}
		onAnimationCancel={finish}
	>
		{props.text as string}
	</span>
});

// The code block reads the flow for its spacing, like every block, and the
// colour scheme for its highlighting.
const CodeBlock = memo(function CodeBlock(props: { block: Block }) @{
	const flow = useContext(FlowContext);
	const scheme = useContext(ColorSchemeContext);
	const block = props.block;
	<div class={'code-block scheme-' + scheme + ' gap-' + spacingFor(block, flow)} data-lang={block.lang}>
		<div class="code-header">
			<span>{(block.lang || 'text') as string}</span>
			<button>Copy code</button>
		</div>
		<pre>
			<code>
				@for (const line of block.lines!; key line.id) {
					<CodeLine line={line} />
				}
			</code>
		</pre>
	</div>
});

const CodeLine = memo(function CodeLine(props: { line: Line }) @{
	<span class="line">
		@for (const token of props.line.tokens; key token.id) {
			<span class={'tok-' + token.kind}>{token.text as string}</span>
		}
	</span>
});
