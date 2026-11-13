import { createContext, flushSync, memo, useContext, useLayoutEffect, useMemo, useRef, useState } from 'octane';
import { initialConversations, nextReply, userMessage } from '../shared/corpus.js';
import { parseMarkdown } from '../shared/markdown.js';
import { streamReply } from '../shared/network.js';

// A streaming LLM chat client in Octane: conversation state, memoized
// Markdown blocks, effects and markup. It commits the way the Octane
// fixture of the chat-stream benchmark in the Octane repository does: event
// handlers only set state, which the steps commit through window.__benchFlush
// (see main.js), and a streamed chunk, which arrives outside any event,
// commits synchronously through flushSync.
//
// The Markdown views are built the way a design-system component catalog
// is: every component is memoized and reads the contexts it depends on, and
// every block sits in a memoized frame and part that read more.

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
interface Block {
	id: number;
	type: string;
	raw: string;
	level?: number;
	ordered?: boolean;
	inlines?: Inline[];
	items?: { id: number; inlines: Inline[] }[];
	lang?: string;
	lines?: Line[];
}

// The app's scopes, provided once at the root.
const ThemeContext = createContext({ theme: 'light', accent: 'blue', density: 'comfortable' });
const LocaleContext = createContext({ locale: 'en-US', copyCode: 'Copy code' });
const LayoutContext = createContext({ sidebarOpen: true, compact: false });
// A message's scopes, provided by each message.
const MessageContext = createContext({ id: 0, role: 'assistant', status: 'done' });
// Whether the reply is streaming.
const StreamingContext = createContext({ streaming: false });
// The Markdown view's own scopes, provided once per reply.
const TypographyContext = createContext({ scale: 'reading', tracking: 'normal' });
const DensityContext = createContext('comfortable');

const THEME = { theme: 'light', accent: 'blue', density: 'comfortable' };
const LOCALE = { locale: 'en-US', copyCode: 'Copy code' };
const LAYOUT = { sidebarOpen: true, compact: false };
const TYPOGRAPHY = { scale: 'reading', tracking: 'normal' };

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

	<ThemeContext value={THEME}>
		<LocaleContext value={LOCALE}>
			<LayoutContext value={LAYOUT}>
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
			</LayoutContext>
		</LocaleContext>
	</ThemeContext>
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
	const status = props.streaming ? 'streaming' : 'done';
	const scope = useMemo(() => ({ id: message.id, role: message.role, status }), [message.id, status]);
	<article class={'message ' + message.role + (props.streaming ? ' streaming' : '')}>
		<div class="avatar">{isUser ? 'You' : 'AI'}</div>
		<div class="message-body">
			<div class="message-author">{isUser ? 'You' : 'Assistant'}</div>
			<MessageContext value={scope}>
				@if (isUser) {
					<p class="user-text">{message.text as string}</p>
				} @else if (message.text === '') {
					<p class="thinking">Thinking…</p>
				} @else {
					<Markdown text={message.text} streaming={props.streaming} />
				}
			</MessageContext>
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

function Markdown(props: { text: string; streaming: boolean }) @{
	const previous = useRef<Block[] | undefined>(undefined);
	// Reparsing reuses every block of the previous parse whose source is
	// unchanged, so memo(MarkdownBlock) skips all but the one still streaming.
	const blocks = useMemo(() => {
		const parsed = parseMarkdown(props.text, previous.current) as Block[];
		previous.current = parsed;
		return parsed;
	}, [props.text]);
	const streaming = useMemo(() => ({ streaming: props.streaming }), [props.streaming]);
	<StreamingContext value={streaming}>
		<TypographyContext value={TYPOGRAPHY}>
			<DensityContext value="comfortable">
				<div class="markdown">
					@for (const block of blocks; key block.id) {
						<MarkdownBlock block={block} />
					}
				</div>
			</DensityContext>
		</TypographyContext>
	</StreamingContext>
}

// Design-system parts: a frame around every block and a typographic part
// inside every component. They add only attributes, but read the scopes they
// depend on.
const Part = memo(function Part(props: { kind: string; children: any }) @{
	const theme = useContext(ThemeContext);
	const layout = useContext(LayoutContext);
	const typography = useContext(TypographyContext);
	<>{props.children}</>
});

const Frame = memo(function Frame(props: { kind: string; children: any }) @{
	const message = useContext(MessageContext);
	const density = useContext(DensityContext);
	<div class="block" data-block={props.kind} data-density={density} data-message={String(message.id)}>
		<Part kind={props.kind}>{props.children}</Part>
	</div>
});

// The presentation boundary every block renders in.
const MarkdownBlock = memo(function MarkdownBlock(props: { block: Block }) @{
	const theme = useContext(ThemeContext);
	const message = useContext(MessageContext);
	const block = props.block;
	@switch (block.type) {
		@case 'heading': {
			<Heading block={block} />
		}
		@case 'list': {
			<List block={block} />
		}
		@case 'code': {
			<CodeBlock lang={block.lang!} lines={block.lines!} />
		}
		@default: {
			<Paragraph block={block} />
		}
	}
});

const Heading = memo(function Heading(props: { block: Block }) @{
	const theme = useContext(ThemeContext);
	const message = useContext(MessageContext);
	<Frame kind="heading">
		<h3 data-accent={theme.accent} data-message={String(message.id)}>
			<Inlines inlines={props.block.inlines!} />
		</h3>
	</Frame>
});

const Paragraph = memo(function Paragraph(props: { block: Block }) @{
	const locale = useContext(LocaleContext);
	const message = useContext(MessageContext);
	<Frame kind="text">
		<p lang={locale.locale} data-role={message.role}>
			<Inlines inlines={props.block.inlines!} />
		</p>
	</Frame>
});

const List = memo(function List(props: { block: Block }) @{
	const message = useContext(MessageContext);
	const layout = useContext(LayoutContext);
	const block = props.block;
	const marker = layout.compact ? 'inside' : 'outside';
	<Frame kind="list">
		@if (block.ordered) {
			<ol data-marker={marker} data-message={String(message.id)}>
				@for (const item of block.items!; key item.id) {
					<ListItem inlines={item.inlines} />
				}
			</ol>
		} @else {
			<ul data-marker={marker} data-message={String(message.id)}>
				@for (const item of block.items!; key item.id) {
					<ListItem inlines={item.inlines} />
				}
			</ul>
		}
	</Frame>
});

const ListItem = memo(function ListItem(props: { inlines: Inline[] }) @{
	const theme = useContext(ThemeContext);
	<li data-density={theme.density}>
		<Part kind="item">
			<Inlines inlines={props.inlines} />
		</Part>
	</li>
});

function Inlines(props: { inlines: Inline[] }) @{
	@for (const inline of props.inlines; key inline.id) {
		@if (inline.kind === 'text') {
			<Text inline={inline} />
		} @else {
			<InlineSpan inline={inline} />
		}
	}
}

const InlineSpan = memo(function InlineSpan(props: { inline: Inline }) @{
	const theme = useContext(ThemeContext);
	const inline = props.inline;
	@switch (inline.kind) {
		@case 'strong': {
			<strong data-density={theme.density}>
				<Part kind="strong">
					<Text inline={inline} />
				</Part>
			</strong>
		}
		@case 'em': {
			<em data-density={theme.density}>
				<Part kind="em">
					<Text inline={inline} />
				</Part>
			</em>
		}
		@default: {
			<InlineCode inline={inline} />
		}
	}
});

const InlineCode = memo(function InlineCode(props: { inline: Inline }) @{
	const theme = useContext(ThemeContext);
	const streaming = useContext(StreamingContext);
	<code class="inline-code" data-theme={theme.theme} data-pending={streaming.streaming ? 'true' : undefined}>
		<Part kind="inline-code">
			<Text inline={props.inline} />
		</Part>
	</code>
});

function Text(props: { inline: Inline }) @{
	const typography = useContext(TypographyContext);
	<span data-tracking={typography.tracking}>{props.inline.text as string}</span>
}

const CodeBlock = memo(function CodeBlock(props: { lang: string; lines: Line[] }) @{
	const theme = useContext(ThemeContext);
	const locale = useContext(LocaleContext);
	const message = useContext(MessageContext);
	<Frame kind="code">
		<div class="code-block" data-theme={theme.theme} data-lang={props.lang} data-message={String(message.id)}>
			<div class="code-header">
				<span>{(props.lang || 'text') as string}</span>
				<button>{locale.copyCode as string}</button>
			</div>
			<pre>
				<code>
					@for (const line of props.lines; key line.id) {
						<CodeLine line={line} />
					}
				</code>
			</pre>
		</div>
	</Frame>
});

const CodeLine = memo(function CodeLine(props: { line: Line }) @{
	const theme = useContext(ThemeContext);
	<span class="line" data-theme={theme.theme}>
		@for (const token of props.line.tokens; key token.id) {
			<span class={'tok-' + token.kind}>{token.text as string}</span>
		}
	</span>
});
