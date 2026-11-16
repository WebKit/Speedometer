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
// layout-flow context that every container provides anew and every child
// reads to compute its spacing, the colour scheme, and the animation
// contexts each streamed word reads.

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
}

// Layout flow. A container provides a new value for its children every time
// it renders: its direction, whether children are spaced automatically, and
// each child's previous sibling. Children read it to compute their spacing.
interface Flow {
	direction: 'none' | 'root' | 'column';
	autoSpacing: boolean;
	previousSiblings: Map<number, { id: number; type: string } | undefined>;
}
const FlowContext = createContext<Flow>({ direction: 'none', autoSpacing: false, previousSiblings: new Map() });
const ColorSchemeContext = createContext('light');

// Streamed-word animation: whether words animate, whether the reply is
// eligible to show them, the animation mode, and the scheduler that staggers
// the words' start times.
type AnimationMode = 'disabled' | 'normal' | 'snappy';
const AnimateContext = createContext(false);
const VisibleContext = createContext(false);
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

// Each child's previous sibling, as a layout container hands it down.
function previousSiblings(children: { id: number; type: string }[]): Flow['previousSiblings'] {
	const map: Flow['previousSiblings'] = new Map();
	let previous: { id: number; type: string } | undefined;
	for (const child of children) {
		map.set(child.id, previous);
		previous = child;
	}
	return map;
}

// The spacing rules for a child and its previous sibling, by layout type:
// the reference renderer's rules for the types this app renders.
const LAYOUT_TYPE: Record<string, string> = { paragraph: 'text', heading: 'title', list: 'list', code: 'code', item: 'list-item' };

function rootSpacing(type: string, previous: string | undefined): number {
	if (previous === undefined) return 0;
	if (type === 'title' && previous !== 'title') return 24;
	if ((previous === 'title' && type === 'text') || ((previous === 'title' || previous === 'text') && type === 'list')) return 8;
	return 16;
}

function columnSpacing(type: string, previous: string | undefined): number {
	if (previous === undefined) return 0;
	let spacing = type === 'text' || type === 'list' ? 12 : 8;
	if (previous === 'title') spacing = 16;
	if (previous === 'text' && type === 'text') spacing = 0;
	return spacing;
}

function spacingFor(node: { id: number; type: string }, flow: Flow): number {
	if (!flow.autoSpacing) return 0;
	const previous = flow.previousSiblings.get(node.id);
	const type = LAYOUT_TYPE[node.type];
	const previousType = previous && LAYOUT_TYPE[previous.type];
	if (flow.direction === 'root') return rootSpacing(type, previousType);
	if (flow.direction === 'column') return columnSpacing(type, previousType);
	return 0;
}

function Markdown(props: { text: string; streaming: boolean }) @{
	const previous = useRef<Block[] | undefined>(undefined);
	// Reparsing reuses every block of the previous parse whose source is
	// unchanged, so memo(BlockContent) skips all but the one still streaming.
	const blocks = useMemo(() => {
		const parsed = parseMarkdown(props.text, previous.current) as Block[];
		previous.current = parsed;
		return parsed;
	});
	// A new flow on every render, so every block's wrapper re-reads it.
	const flow: Flow = { direction: 'root', autoSpacing: true, previousSiblings: previousSiblings(blocks) };
	const [scheduler] = useState(() => new WordDelayScheduler());
	<AnimateContext value={props.streaming}>
		<VisibleContext value={true}>
			<AnimationModeContext value="normal">
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
		</VisibleContext>
	</AnimateContext>
}

// The wrapper every block renders in: it reads the flow and spaces the block
// from its previous sibling. The block's content is memoized separately, so
// when the flow changes the wrapper re-renders and the content bails out.
const MarkdownBlock = memo(function MarkdownBlock(props: { block: Block }) @{
	const flow = useContext(FlowContext);
	const block = props.block;
	<div class={'block gap-' + spacingFor(block, flow)} data-block={block.type}>
		<BlockContent block={block} />
	</div>
});

const BlockContent = memo(function BlockContent(props: { block: Block }) @{
	const block = props.block;
	@switch (block.type) {
		@case 'heading': {
			<h3>
				<Inlines inlines={block.inlines!} />
			</h3>
		}
		@case 'list': {
			<List block={block} />
		}
		@case 'code': {
			<CodeBlock lang={block.lang!} lines={block.lines!} />
		}
		@default: {
			<p>
				<Inlines inlines={block.inlines!} />
			</p>
		}
	}
});

// A list is a column container: it provides its items' flow.
const List = memo(function List(props: { block: Block }) @{
	const block = props.block;
	const items = block.items!;
	const flow: Flow = {
		direction: 'column',
		autoSpacing: true,
		previousSiblings: previousSiblings(items.map((item) => ({ id: item.id, type: 'item' }))),
	};
	<FlowContext value={flow}>
		@if (block.ordered) {
			<ol>
				@for (const item of items; key item.id) {
					<ListItem item={item} />
				}
			</ol>
		} @else {
			<ul>
				@for (const item of items; key item.id) {
					<ListItem item={item} />
				}
			</ul>
		}
	</FlowContext>
});

const ListItem = memo(function ListItem(props: { item: ListItemData }) @{
	const flow = useContext(FlowContext);
	<li class={'gap-' + spacingFor({ id: props.item.id, type: 'item' }, flow)}>
		<Inlines inlines={props.item.inlines} />
	</li>
});

function Inlines(props: { inlines: Inline[] }) @{
	@for (const inline of props.inlines; key inline.id) {
		@switch (inline.kind) {
			@case 'strong': {
				<strong>
					<Text inline={inline} />
				</strong>
			}
			@case 'em': {
				<em>
					<Text inline={inline} />
				</em>
			}
			@case 'code': {
				<InlineCode inline={inline} />
			}
			@default: {
				<Text inline={inline} />
			}
		}
	}
}

const InlineCode = memo(function InlineCode(props: { inline: Inline }) @{
	const scheme = useContext(ColorSchemeContext);
	<code class={'inline-code scheme-' + scheme}>
		<Text inline={props.inline} />
	</code>
});

// A word with the whitespace after it; a text run's first word keeps the
// whitespace before it too.
const WORD = /^\s*\S+\s*|\S+\s*/g;

// Text in a reply that streams in renders as one span per word; a reply that
// was already complete when it mounted renders its text as is. The choice is
// made once, on mount, so the word spans stay after the stream ends.
function Text(props: { inline: Inline }) @{
	const animate = useContext(AnimateContext);
	const [split] = useState(animate);
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

// One word's fade-in: it starts once the word is visible, with the delay the
// scheduler gives it, and finishes when its animation ends.
class WordAnimation {
	started = false;
	finished: boolean;
	publish: (state: { active: boolean; delay: number }) => void;
	constructor(active: boolean, publish: (state: { active: boolean; delay: number }) => void) {
		this.finished = !active;
		this.publish = publish;
	}
	update(visible: boolean, scheduler: WordDelayScheduler | undefined, mode: AnimationMode) {
		if (!visible) {
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
	const animate = useContext(AnimateContext);
	const visible = useContext(VisibleContext);
	const mode = useContext(AnimationModeContext);
	const scheduler = useContext(DelaySchedulerContext);
	const [initialMode] = useState(mode);
	const [state, setState] = useState(() => ({ active: animate, delay: 0 }));
	const [animation] = useState(() => new WordAnimation(animate, setState));
	useLayoutEffect(() => animation.update(visible, scheduler, initialMode));
	useLayoutEffect(() => () => animation.dispose(), []);
	const finish = () => animation.finish();
	const running = state.active && visible;
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

const CodeBlock = memo(function CodeBlock(props: { lang: string; lines: Line[] }) @{
	const scheme = useContext(ColorSchemeContext);
	<div class={'code-block scheme-' + scheme} data-lang={props.lang}>
		<div class="code-header">
			<span>{(props.lang || 'text') as string}</span>
			<button>Copy code</button>
		</div>
		<pre>
			<code>
				@for (const line of props.lines; key line.id) {
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
