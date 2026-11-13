import { flushSync, memo, useLayoutEffect, useMemo, useRef, useState } from 'octane';
import { initialConversations, nextReply, userMessage } from '../shared/corpus.js';
import { parseMarkdown } from '../shared/markdown.js';
import { streamReply } from '../shared/network.js';

// A streaming LLM chat client in Octane: conversation state, memoized
// Markdown blocks, effects and markup. It commits the way the Octane
// fixture of the chat-stream benchmark in the Octane repository does: event
// handlers only set state, which the steps commit through window.__benchFlush
// (see main.js), and a streamed chunk, which arrives outside any event,
// commits synchronously through flushSync.

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
				<Markdown text={message.text} />
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

function Markdown(props: { text: string }) @{
	const previous = useRef<Block[] | undefined>(undefined);
	// Reparsing reuses every block of the previous parse whose source is
	// unchanged, so memo(MarkdownBlock) skips all but the one still streaming.
	const blocks = useMemo(() => {
		const parsed = parseMarkdown(props.text, previous.current) as Block[];
		previous.current = parsed;
		return parsed;
	}, [props.text]);
	<div class="markdown">
		@for (const block of blocks; key block.id) {
			<MarkdownBlock block={block} />
		}
	</div>
}

function MarkdownBlockImpl(props: { block: Block }) @{
	const block = props.block;
	@switch (block.type) {
		@case 'heading': {
			<h3>
				<Inlines inlines={block.inlines!} />
			</h3>
		}
		@case 'list': {
			@if (block.ordered) {
				<ol>
					@for (const item of block.items!; key item.id) {
						<li>
							<Inlines inlines={item.inlines} />
						</li>
					}
				</ol>
			} @else {
				<ul>
					@for (const item of block.items!; key item.id) {
						<li>
							<Inlines inlines={item.inlines} />
						</li>
					}
				</ul>
			}
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
}
const MarkdownBlock = memo(MarkdownBlockImpl);

function Inlines(props: { inlines: Inline[] }) @{
	<>
		@for (const inline of props.inlines; key inline.id) {
			@switch (inline.kind) {
				@case 'strong': {
					<strong>{inline.text as string}</strong>
				}
				@case 'em': {
					<em>{inline.text as string}</em>
				}
				@case 'code': {
					<code class="inline-code">{inline.text as string}</code>
				}
				@default: {
					<span>{inline.text as string}</span>
				}
			}
		}
	</>
}

function CodeBlock(props: { lang: string; lines: Line[] }) @{
	<div class="code-block">
		<div class="code-header">
			<span>{(props.lang || 'text') as string}</span>
			<button>Copy code</button>
		</div>
		<pre>
			<code>
				@for (const line of props.lines; key line.id) {
					<span class="line">
						@for (const token of line.tokens; key token.id) {
							<span class={'tok-' + token.kind}>{token.text as string}</span>
						}
					</span>
				}
			</code>
		</pre>
	</div>
}
