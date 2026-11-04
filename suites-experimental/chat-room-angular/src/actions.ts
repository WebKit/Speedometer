// Timeline content is nested deep (Message -> RichText -> span) and the
// innermost pills act on the app, so keep that out of the intermediate inputs.
// The timeline provides itself under this token.
export abstract class ChatActions {
    abstract selectRoom(roomId: string): void;
    abstract jumpToMessage(messageId: string): void;
}
